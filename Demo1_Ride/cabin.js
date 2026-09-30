import * as THREE from "../Shared/vendor/three.module.js";
// Original tapered cabin; one UV strip per wall. Outward winding is deliberate.
export function cabinGeometry() {
  const positions = [],
    normals = [],
    uvs = [],
    indices = [];
  const corners = [
    [-0.62, 0, -0.44],
    [0.62, 0, -0.44],
    [0.62, 0, 0.44],
    [-0.62, 0, 0.44],
  ];
  for (let face = 0; face < 4; face++) {
    const a = corners[face],
      b = corners[(face + 1) % 4],
      pts = [
        a,
        b,
        [b[0] * 1.2, 0.85, b[2] * 1.2],
        [a[0] * 1.2, 0.85, a[2] * 1.2],
      ];
    const edge = new THREE.Vector3(...pts[1]).sub(new THREE.Vector3(...pts[0]));
    const up = new THREE.Vector3(...pts[3]).sub(new THREE.Vector3(...pts[0]));
    const n = up.cross(edge).normalize();
    const base = positions.length / 3;
    pts.forEach((p) => {
      positions.push(...p);
      normals.push(...n.toArray());
    });
    uvs.push(face / 4, 0, (face + 1) / 4, 0, (face + 1) / 4, 1, face / 4, 1);
    indices.push(base, base + 2, base + 1, base, base + 3, base + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(indices);
  return g;
}
