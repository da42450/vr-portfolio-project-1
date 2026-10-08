import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { HeightCalibration } from "../Demo4_Hunt/height.js";
import { faceStartingAisle } from "../Demo4_Hunt/view.js";
import * as THREE from "../Shared/vendor/three.module.js";

test("calibration waits for a valid sample rather than calibrating a session-start camera placeholder", () => {
  const height = new HeightCalibration();
  for (const value of [undefined, null, NaN, Infinity, -Infinity]) {
    assert.equal(height.sample(value), false);
    assert.equal(height.pending, true);
    assert.equal(height.offset, 0);
    assert.equal(height.eyeHeight, null);
  }
  assert.equal(height.sample(1.72), true);
  assert.equal(height.pending, false);
  assert.equal(height.eyeHeight, 1.6);
});

test("seated-to-standing calibration removes the giant-height outcome even with a biased floor origin", () => {
  const height = new HeightCalibration();
  // Model a floor reference reporting more Y than actual physical eye height.
  // Old Seated OFF forced offset=0, giving a 3.2 m virtual standing view.
  height.sample(2.55);
  assert.equal(height.eyeHeight, 1.6);
  height.sample(3.2);
  assert.ok(height.eyeHeight > 2);
  height.request(); // Seated OFF while physically standing.
  assert.equal(height.sample(3.2), true);
  assert.equal(height.offset, -1.6);
  assert.equal(height.eyeHeight, 1.6);
});

test("normal floor tracking and repeated posture switches do not accumulate height offsets", () => {
  for (const bias of [0, 1.45, -1.7]) {
    const height = new HeightCalibration();
    for (let i = 0; i < 20; i++) {
      for (const nativeY of [1.72 + bias, 1.08 + bias]) {
        height.request();
        height.sample(nativeY);
        assert.ok(Math.abs(height.eyeHeight - 1.6) < 1e-12);
        assert.ok(Math.abs(height.offset - (1.6 - nativeY)) < 1e-12);
      }
    }
  }
});

test("calibration is one-shot, preserving normal crouching and standing motion afterwards", () => {
  const height = new HeightCalibration();
  height.sample(1.75);
  const offset = height.offset;
  assert.equal(height.sample(1.55), false);
  assert.equal(height.offset, offset);
  assert.ok(Math.abs(height.eyeHeight - 1.4) < 1e-12);
  assert.equal(height.sample(1.85), false);
  assert.equal(height.offset, offset);
  assert.ok(Math.abs(height.eyeHeight - 1.7) < 1e-12);
});

test("a new XR session discards old calibration and calibrates against its first fresh pose", () => {
  const height = new HeightCalibration();
  height.sample(3.2);
  height.reset();
  assert.equal(height.offset, 0);
  assert.equal(height.nativeY, null);
  assert.equal(height.pending, true);
  height.sample(1.1);
  assert.equal(height.eyeHeight, 1.6);
});

test("heading reset, turning and New Hunt preserve a calibrated standing height", () => {
  const height = new HeightCalibration();
  height.sample(3.2);
  const scene = new THREE.Scene(),
    rig = new THREE.Group(),
    camera = new THREE.PerspectiveCamera();
  scene.add(rig);
  rig.add(camera);
  rig.position.set(0, height.offset, 4);
  camera.position.set(0.2, height.nativeY, -0.3);
  rig.rotation.y = -Math.PI / 2;
  assert.equal(faceStartingAisle(rig, camera), true);
  assert.equal(rig.position.y, height.offset);
  assert.ok(
    Math.abs(camera.getWorldPosition(new THREE.Vector3()).y - 1.6) < 1e-12,
  );
  rig.position.set(0, height.offset, 4); // New Hunt relocation, not calibration.
  assert.ok(
    Math.abs(camera.getWorldPosition(new THREE.Vector3()).y - 1.6) < 1e-12,
  );
});

test("height buttons queue calibration; only an active-frame viewer pose supplies the measurement", async () => {
  const source = await readFile(
    new URL("../Demo4_Hunt/main.js", import.meta.url),
    "utf8",
  );
  const calibrate = source.match(
    /function calibrate\(\) \{([\s\S]*?)\n\}/,
  )?.[1];
  const updateHeight = source.match(
    /function updateHeight\(\) \{([\s\S]*?)\n\}/,
  )?.[1];
  assert.match(calibrate, /height\.request\(\)/);
  assert.doesNotMatch(calibrate, /getViewerPose|getWorldPosition|head\.y/);
  assert.match(updateHeight, /getViewerPose\(referenceSpace\)/);
  assert.match(updateHeight, /height\.sample\(pose\.transform\.position\.y\)/);
  assert.match(updateHeight, /app\.rig\.position\.y = height\.offset/);
  assert.match(updateHeight, /if \(menu\.visible\) toggleMenu\(true\)/);
  assert.match(source, /if \("seated" in patch\) calibrate\(\)/);
  assert.match(source, /app\.update = \(dt, t\) => \{\s*updateHeight\(\)/);
  assert.doesNotMatch(
    source,
    /settings\.seated \? 1\.6|head\.y - app\.rig\.position\.y/,
  );
});
