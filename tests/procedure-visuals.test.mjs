import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../Shared/vendor/three.module.js";
import {
  RubberHose,
  PowderSpray,
  makeNozzle,
} from "../Demo3_Procedure/visuals.js";

test("rubber hose stays attached, has real thickness, and reuses its buffers", () => {
  const parent = new THREE.Group(),
    hose = new RubberHose(parent);
  const positions = hose.positions,
    normals = hose.normals;
  for (const angle of [0, Math.PI / 2, Math.PI]) {
    const q = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      angle,
    );
    const start = new THREE.Vector3(1, 1.3, -2).applyQuaternion(q);
    const end = new THREE.Vector3(1.3, 0.9, -2).applyQuaternion(q);
    const side = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
    hose.update(start, end, side);
    assert.equal(hose.positions, positions);
    assert.equal(hose.normals, normals);
    for (const [ring, center] of [
      [0, start],
      [hose.segments, end],
    ]) {
      for (let j = 0; j < hose.sides; j++) {
        const k = (ring * hose.sides + j) * 3;
        const vertex = new THREE.Vector3().fromArray(positions, k);
        const normal = new THREE.Vector3().fromArray(normals, k);
        assert.ok(Math.abs(vertex.distanceTo(center) - hose.radius) < 0.00001);
        assert.ok(Math.abs(normal.length() - 1) < 0.00001);
      }
    }
    assert.ok(positions.every(Number.isFinite));
    assert.ok(normals.every(Number.isFinite));
  }
  assert.equal(hose.mesh.geometry.index.count, 18 * 8 * 6);
});

test("white powder emits from the outlet, respects the pool, stops and clears", () => {
  const spray = new PowderSpray(new THREE.Group(), null, 192, () => 0.5);
  const origin = new THREE.Vector3(0.2, 1.1, -0.7);
  const direction = new THREE.Vector3(0, 0, -1);
  const positions = spray.positions;
  assert.equal(spray.points.visible, false);
  spray.update(0.02, true, origin, direction);
  assert.equal(spray.active, 3);
  assert.equal(spray.points.material.color.getHex(), 0xffffff);
  for (let i = 0; i < 3; i++) {
    const k = i * 3;
    assert.ok(Math.abs(positions[k] - origin.x) < 0.00001);
    assert.ok(Math.abs(positions[k + 1] - origin.y) < 0.00001);
    assert.ok(positions[k + 2] < origin.z);
  }
  for (let i = 0; i < 600; i++) spray.update(1 / 60, true, origin, direction);
  assert.ok(spray.active > 0 && spray.active <= spray.count);
  assert.equal(spray.positions, positions);
  assert.ok(positions.every(Number.isFinite));
  spray.update(1, false, origin, direction);
  assert.equal(spray.active, 0);
  assert.equal(spray.points.visible, false);
  // Straight up is also a valid controller direction.
  spray.update(0.02, true, origin, new THREE.Vector3(0, 1, 0));
  assert.ok(spray.velocities.every(Number.isFinite));
  spray.clear();
  assert.equal(spray.active, 0);
  assert.ok(spray.life.every((n) => n === 0));
  assert.equal(spray.points.visible, false);
});

test("nozzle has a grip, coupling and forward-facing open mouth", () => {
  const parent = new THREE.Group(),
    nozzle = makeNozzle(parent);
  assert.equal(nozzle.parent, parent);
  assert.ok(nozzle.getObjectByName("Rubber hand grip"));
  assert.ok(nozzle.getObjectByName("Flared outlet"));
  assert.ok(nozzle.getObjectByName("Hose coupling"));
  assert.ok(
    nozzle.children.some(
      (m) => m.geometry.type === "CircleGeometry" && m.position.z < -0.1,
    ),
  );
});
