import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../Shared/vendor/three.module.js";
import { cabinGeometry } from "../Demo1_Ride/cabin.js";
test("authored cabin normals/winding face outwards and UVs stay inside their strip", () => {
  const g = cabinGeometry(),
    p = g.attributes.position,
    n = g.attributes.normal,
    uv = g.attributes.uv;
  assert.equal(p.count, 16);
  assert.equal(g.index.count, 24);
  for (let face = 0; face < 4; face++) {
    const first = face * 4,
      normal = new THREE.Vector3().fromBufferAttribute(n, first),
      point = new THREE.Vector3().fromBufferAttribute(p, first);
    assert.ok(
      normal.x * point.x + normal.z * point.z > 0,
      "wall normal must face outwards",
    );
    const ia = g.index.getX(face * 6),
      ib = g.index.getX(face * 6 + 1),
      ic = g.index.getX(face * 6 + 2);
    const a = new THREE.Vector3().fromBufferAttribute(p, ia),
      b = new THREE.Vector3().fromBufferAttribute(p, ib),
      c = new THREE.Vector3().fromBufferAttribute(p, ic);
    assert.ok(
      b.sub(a).cross(c.sub(a)).normalize().dot(normal) > 0.99,
      "triangle winding agrees with normal",
    );
    for (let i = first; i < first + 4; i++) {
      assert.ok(uv.getX(i) >= face / 4 && uv.getX(i) <= (face + 1) / 4);
      assert.ok(uv.getY(i) >= 0 && uv.getY(i) <= 1);
    }
  }
});
test("local counterrotation cancels inherited roll even with parent yaw", () => {
  const root = new THREE.Group(),
    wheel = new THREE.Group(),
    pivot = new THREE.Group();
  root.add(wheel);
  wheel.add(pivot);
  root.rotation.y = 0.16;
  for (const angle of [0.3, 1.7, 4.8]) {
    wheel.rotation.z = angle;
    pivot.rotation.z = -angle;
    root.updateMatrixWorld(true);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(
      pivot.getWorldQuaternion(new THREE.Quaternion()),
    );
    assert.ok(up.distanceTo(new THREE.Vector3(0, 1, 0)) < 1e-6);
  }
});
