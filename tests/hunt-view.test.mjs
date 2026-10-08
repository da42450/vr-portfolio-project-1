import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as THREE from "../Shared/vendor/three.module.js";
import { faceStartingAisle, turnAroundHead } from "../Demo4_Hunt/view.js";
import { Hunt, TARGETS } from "../Demo4_Hunt/hunt.js";

function fixture({ yaw = 0, physicalYaw = 0, seated = false } = {}) {
  const scene = new THREE.Scene(),
    rig = new THREE.Group(),
    camera = new THREE.PerspectiveCamera();
  scene.add(rig);
  rig.add(camera);
  rig.position.set(-0.25, seated ? 0.45 : 0, 4.1);
  rig.rotation.y = yaw;
  // Nonzero tracked X/Z reproduces the room-scale orbit bug of resetting the
  // rig rotation directly. Y reproduces both standing and calibrated sitting.
  camera.position.set(0.29, seated ? 1.15 : 1.72, -0.41);
  camera.rotation.set(0.13, physicalYaw, -0.08, "YXZ");
  return { rig, camera };
}

function assertFacesAisle(camera) {
  const forward = camera.getWorldDirection(new THREE.Vector3());
  forward.y = 0;
  forward.normalize();
  assert.ok(forward.distanceTo(new THREE.Vector3(0, 0, -1)) < 1e-10);
}

test("Reset View undoes three right snap turns without moving or lowering the head", () => {
  const { rig, camera } = fixture();
  const start = camera.getWorldPosition(new THREE.Vector3());
  for (let i = 0; i < 3; i++) turnAroundHead(rig, camera, -Math.PI / 6);
  assert.ok(camera.getWorldDirection(new THREE.Vector3()).x > 0.9);
  assert.equal(faceStartingAisle(rig, camera), true);
  assertFacesAisle(camera);
  assert.ok(
    camera.getWorldPosition(new THREE.Vector3()).distanceTo(start) < 1e-10,
  );
  assert.equal(rig.position.y, 0);
  assert.equal(camera.position.y, 1.72);
});

test("Reset View handles physical yaw and preserves standing/seated calibration and tracked pose", () => {
  for (const seated of [false, true]) {
    for (const yaw of [-Math.PI, -Math.PI / 2, 0.8, 2.6]) {
      const { rig, camera } = fixture({ yaw, physicalYaw: 0.42, seated });
      const position = camera.getWorldPosition(new THREE.Vector3());
      const rigY = rig.position.y;
      const localPosition = camera.position.clone();
      const localRotation = camera.quaternion.clone();
      assert.equal(faceStartingAisle(rig, camera), true);
      assertFacesAisle(camera);
      assert.ok(
        camera.getWorldPosition(new THREE.Vector3()).distanceTo(position) <
          1e-10,
      );
      assert.equal(rig.position.y, rigY);
      assert.deepEqual(camera.position, localPosition);
      assert.ok(camera.quaternion.equals(localRotation));
    }
  }
});

test("repeated resets do not drift the head or change hunt progress, time, errors or score", () => {
  const { rig, camera } = fixture({
    yaw: -1.7,
    physicalYaw: 0.2,
    seated: true,
  });
  const hunt = new Hunt();
  hunt.select(TARGETS[0]);
  hunt.select("AX-140");
  hunt.tick(12);
  const state = JSON.stringify({
    ...hunt,
    found: [...hunt.found],
    score: hunt.score,
  });
  const start = camera.getWorldPosition(new THREE.Vector3());
  for (let i = 0; i < 20; i++)
    assert.equal(faceStartingAisle(rig, camera), true);
  assertFacesAisle(camera);
  assert.ok(
    camera.getWorldPosition(new THREE.Vector3()).distanceTo(start) < 1e-10,
  );
  assert.equal(
    JSON.stringify({ ...hunt, found: [...hunt.found], score: hunt.score }),
    state,
  );
});

test("looking straight up/down does not cause an arbitrary heading jump", () => {
  const { rig, camera } = fixture({ yaw: 0.6 });
  for (const pitch of [-Math.PI / 2, Math.PI / 2]) {
    camera.rotation.set(pitch, 0, 0, "YXZ");
    const position = rig.position.clone();
    const rotation = rig.quaternion.clone();
    assert.equal(faceStartingAisle(rig, camera), false);
    assert.deepEqual(rig.position, position);
    assert.ok(rig.quaternion.equals(rotation));
  }
});

test("desktop and world Reset View use the heading-only action, not tracking-space or height reset", async () => {
  const source = await readFile(
    new URL("../Demo4_Hunt/main.js", import.meta.url),
    "utf8",
  );
  assert.match(
    source,
    /"RESET VIEW",\s*\[0\.42, -0\.68, 0\.02\],\s*resetView,/,
  );
  assert.match(source, /querySelector\("#recenter"\)\.onclick = resetView/);
  const reset = source.match(/function resetView\(\) \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(reset);
  assert.match(reset, /faceStartingAisle\(app\.rig, app\.camera\)/);
  assert.match(reset, /toggleMenu\(false\)/);
  assert.doesNotMatch(
    reset,
    /calibrate\(|hunt\.|heightOffset|reset\(|resetView\(|requestReferenceSpace/,
  );
  assert.doesNotMatch(source, /app\.resetView\(|app\.onRecenter = calibrate/);
});
