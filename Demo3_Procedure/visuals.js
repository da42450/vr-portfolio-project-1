import * as THREE from "../Shared/vendor/three.module.js";

const UP = new THREE.Vector3(0, 1, 0);

// A raised control, not a scaled-down instruction panel. Its short label fills
// the texture so CHECK is readable at the tank's actual physical size.
export function makePressureButton(parent, action, texture = null) {
  if (!texture) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 176;
    const context = canvas.getContext("2d");
    context.fillStyle = "#0d6167";
    context.fillRect(0, 0, 512, 176);
    context.strokeStyle = "#e5bb53";
    context.lineWidth = 12;
    context.strokeRect(6, 6, 500, 164);
    context.fillStyle = "#ffffff";
    context.font = "bold 90px system-ui";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("CHECK", 256, 88);
    texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
  }
  const button = new THREE.Group();
  button.name = "Pressure CHECK button";
  button.position.set(0.035, 0.347, 0.107);
  button.userData.action = action;
  const backing = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.06, 0.012),
    new THREE.MeshStandardMaterial({ color: "#173d45", roughness: 0.6 }),
  );
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(0.156, 0.056),
    new THREE.MeshBasicMaterial({ map: texture }),
  );
  face.position.z = 0.007;
  button.add(backing, face);
  parent.add(button);
  return button;
}

export function makeNozzle(parent) {
  const nozzle = new THREE.Group();
  nozzle.name = "Hose nozzle";
  parent.add(nozzle);
  const rubber = new THREE.MeshStandardMaterial({
    color: "#252a2d",
    roughness: 0.85,
  });
  const metal = new THREE.MeshStandardMaterial({
    color: "#87969b",
    metalness: 0.6,
    roughness: 0.4,
  });
  function sleeve(name, top, bottom, length, z, mat) {
    const part = new THREE.Mesh(
      new THREE.CylinderGeometry(top, bottom, length, 16),
      mat,
    );
    part.name = name;
    part.rotation.x = -Math.PI / 2;
    part.position.z = z;
    nozzle.add(part);
  }
  sleeve("Rubber hand grip", 0.025, 0.025, 0.11, 0.012, rubber);
  for (const z of [-0.022, 0.012, 0.046])
    sleeve("Grip rib", 0.027, 0.027, 0.006, z, rubber);
  sleeve("Flared outlet", 0.034, 0.025, 0.07, -0.077, rubber);
  sleeve("Hose coupling", 0.021, 0.021, 0.028, 0.079, metal);
  const mouth = new THREE.Mesh(
    new THREE.CircleGeometry(0.028, 20),
    new THREE.MeshBasicMaterial({ color: "#10171a", side: THREE.DoubleSide }),
  );
  mouth.position.z = -0.113;
  nozzle.add(mouth);
  return nozzle;
}

// A small preallocated tube follows a sagging curve. No rope physics and no
// per-frame geometry creation: this is an explainable visual hose.
export class RubberHose {
  constructor(parent, segments = 18, sides = 8, radius = 0.012) {
    this.segments = segments;
    this.sides = sides;
    this.radius = radius;
    const count = (segments + 1) * sides;
    this.positions = new Float32Array(count * 3);
    this.normals = new Float32Array(count * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.positions, 3).setUsage(
        THREE.DynamicDrawUsage,
      ),
    );
    geometry.setAttribute(
      "normal",
      new THREE.BufferAttribute(this.normals, 3).setUsage(
        THREE.DynamicDrawUsage,
      ),
    );
    const indices = [];
    for (let i = 0; i < segments; i++)
      for (let j = 0; j < sides; j++) {
        const a = i * sides + j,
          b = i * sides + ((j + 1) % sides);
        const c = a + sides,
          d = b + sides;
        indices.push(a, b, c, b, d, c);
      }
    geometry.setIndex(indices);
    this.mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({ color: "#252a2c", roughness: 0.9 }),
    );
    this.mesh.name = "Curved rubber hose";
    this.mesh.frustumCulled = false;
    parent.add(this.mesh);
    this.control = new THREE.Vector3();
    this.center = new THREE.Vector3();
    this.tangent = new THREE.Vector3();
    this.normal = new THREE.Vector3();
    this.binormal = new THREE.Vector3();
    this.offset = new THREE.Vector3();
  }
  update(start, end, side) {
    const sag = Math.max(0.03, (0.9 - start.distanceTo(end)) * 0.6);
    this.control
      .copy(start)
      .add(end)
      .multiplyScalar(0.5)
      .addScaledVector(side, 0.12);
    this.control.y -= sag;
    for (let i = 0; i <= this.segments; i++) {
      const t = i / this.segments,
        u = 1 - t;
      this.center
        .copy(start)
        .multiplyScalar(u * u)
        .addScaledVector(this.control, 2 * u * t)
        .addScaledVector(end, t * t);
      this.tangent
        .copy(this.control)
        .sub(start)
        .multiplyScalar(2 * u)
        .addScaledVector(this.offset.copy(end).sub(this.control), 2 * t)
        .normalize();
      this.normal
        .copy(side)
        .addScaledVector(this.tangent, -side.dot(this.tangent));
      if (this.normal.lengthSq() < 0.01)
        this.normal.crossVectors(this.tangent, UP);
      this.normal.normalize();
      this.binormal.crossVectors(this.tangent, this.normal).normalize();
      for (let j = 0; j < this.sides; j++) {
        const angle = (j / this.sides) * Math.PI * 2;
        this.offset
          .copy(this.normal)
          .multiplyScalar(Math.cos(angle))
          .addScaledVector(this.binormal, Math.sin(angle));
        const k = (i * this.sides + j) * 3;
        this.normals[k] = this.offset.x;
        this.normals[k + 1] = this.offset.y;
        this.normals[k + 2] = this.offset.z;
        this.offset.multiplyScalar(this.radius).add(this.center);
        this.positions[k] = this.offset.x;
        this.positions[k + 1] = this.offset.y;
        this.positions[k + 2] = this.offset.z;
      }
    }
    this.mesh.geometry.attributes.position.needsUpdate = true;
    this.mesh.geometry.attributes.normal.needsUpdate = true;
  }
}

export function powderTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 32;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(16, 16, 1, 16, 16, 15);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.8)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(canvas);
}

// Fixed pool: visual powder only. The procedure's aimed-ray coverage remains
// responsible for extinguishing, so sprites never become expensive colliders.
export class PowderSpray {
  constructor(parent, texture = null, count = 192, random = Math.random) {
    this.count = count;
    this.random = random;
    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    this.life = new Float32Array(count);
    this.cursor = this.credit = this.active = 0;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.positions, 3).setUsage(
        THREE.DynamicDrawUsage,
      ),
    );
    this.points = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: "#ffffff",
        size: 0.035,
        map: texture,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      }),
    );
    this.points.name = "White extinguisher powder";
    this.points.frustumCulled = false;
    parent.add(this.points);
    this.side = new THREE.Vector3();
    this.up = new THREE.Vector3();
    this.clear();
  }
  clear() {
    this.life.fill(0);
    for (let i = 0; i < this.count; i++) this.positions[i * 3 + 1] = -1000;
    this.active = this.credit = 0;
    this.points.visible = false;
    this.points.geometry.attributes.position.needsUpdate = true;
  }
  update(dt, emitting, origin, direction) {
    if (emitting) {
      this.side.crossVectors(direction, UP);
      if (this.side.lengthSq() < 0.01) this.side.set(1, 0, 0);
      this.side.normalize();
      this.up.crossVectors(this.side, direction).normalize();
      this.credit += dt * 150;
      while (this.credit >= 1) {
        this.credit--;
        const i = this.cursor++ % this.count,
          k = i * 3;
        this.positions[k] = origin.x;
        this.positions[k + 1] = origin.y;
        this.positions[k + 2] = origin.z;
        const speed = 2.2 + this.random() * 0.9;
        const a = (this.random() - 0.5) * 0.65,
          b = (this.random() - 0.5) * 0.65;
        this.velocities[k] =
          direction.x * speed + this.side.x * a + this.up.x * b;
        this.velocities[k + 1] =
          direction.y * speed + this.side.y * a + this.up.y * b;
        this.velocities[k + 2] =
          direction.z * speed + this.side.z * a + this.up.z * b;
        this.life[i] = 0.45 + this.random() * 0.2;
      }
    } else this.credit = 0;
    this.active = 0;
    for (let i = 0; i < this.count; i++) {
      const k = i * 3;
      this.life[i] = Math.max(0, this.life[i] - dt);
      if (this.life[i] > 0) {
        this.active++;
        this.positions[k] += this.velocities[k] * dt;
        this.positions[k + 1] += this.velocities[k + 1] * dt;
        this.positions[k + 2] += this.velocities[k + 2] * dt;
        this.velocities[k + 1] -= 0.18 * dt;
      } else this.positions[k + 1] = -1000;
    }
    this.points.visible = this.active > 0;
    this.points.geometry.attributes.position.needsUpdate = true;
  }
}
