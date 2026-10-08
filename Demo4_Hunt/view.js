import { Vector3 } from "../Shared/vendor/three.module.js";

// Rotate artificial travel around the head, not the rig origin: a tracked
// room-scale offset must not swing the player into another aisle or change Y.
export function turnAroundHead(rig, camera, angle) {
  const before = camera.getWorldPosition(new Vector3());
  rig.rotation.y += angle;
  const after = camera.getWorldPosition(new Vector3());
  rig.position.x += before.x - after.x;
  rig.position.z += before.z - after.z;
  rig.updateMatrixWorld(true);
}

// The starting aisle faces world -Z. Cancel the current horizontal heading,
// including both artificial turns and the headset's physical yaw. Leave the
// tracking reference space, eye height and hunt state untouched.
export function faceStartingAisle(rig, camera) {
  const forward = camera.getWorldDirection(new Vector3());
  if (forward.x * forward.x + forward.z * forward.z < 1e-8) return false;
  turnAroundHead(rig, camera, Math.atan2(forward.x, -forward.z));
  return true;
}
