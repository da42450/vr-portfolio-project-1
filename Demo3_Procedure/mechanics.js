import { Vector3 } from "../Shared/vendor/three.module.js";

export const SPRAY_RANGE = 1.5; // Training range, not a manufacturer specification.

// Station-local downward travel only; sideways motion cannot activate it.
export function alarmSlide(station, worldHandle, homeY) {
  const local = station.worldToLocal(worldHandle.clone());
  return Math.max(0, Math.min(0.11, homeY - local.y));
}

// Only the nearest in-range base under the narrow spray receives coverage.
// Powder sprites are visual feedback, not a collision simulation.
export function baseTarget(
  origin,
  direction,
  bases,
  tolerance = 0.17,
  blockedDistance = Infinity,
) {
  let best = null;
  const delta = new Vector3();
  for (let i = 0; i < bases.length; i++) {
    delta.copy(bases[i]).sub(origin);
    const ahead = delta.dot(direction);
    if (ahead <= 0 || ahead > SPRAY_RANGE || ahead > blockedDistance) continue;
    const distance = delta.addScaledVector(direction, -ahead).length();
    if (distance <= tolerance && (!best || distance < best.distance))
      best = { i, distance, ahead };
  }
  return best;
}
