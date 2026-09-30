import { Quaternion, Vector3 } from "./vendor/three.module.js";

export function visibleInHierarchy(object) {
  for (let parent = object; parent; parent = parent.parent)
    if (!parent.visible) return false;
  return true;
}

export function grabEnabled(object) {
  return (
    visibleInHierarchy(object) &&
    !object.userData.holder &&
    (object.userData.grabEnabled?.() ?? true)
  );
}

// Measure against authored grip zones, not the object's modelling origin.
// Availability checks are read-only: hovering must not generate procedure errors.
export function findGrabTarget(objects, handPosition) {
  let best = null;
  for (const object of objects) {
    if (!grabEnabled(object)) continue;
    const zones = object.userData.grabZones ?? [
      { center: [0, 0, 0], radius: 0.23 },
    ];
    for (const zone of zones) {
      const point = object.localToWorld(new Vector3(...zone.center));
      const distance = point.distanceTo(handPosition);
      const score = distance / zone.radius;
      if (score <= 1 && (!best || score < best.score))
        best = { object, point, distance, score };
    }
  }
  return best;
}

export function resolvePointerTarget(object, grabbables, interactables) {
  for (let parent = object; parent; parent = parent.parent) {
    if (grabbables.includes(parent) && grabEnabled(parent)) return parent;
    if (interactables.includes(parent) && parent.userData.action) return parent;
  }
  return null;
}

// Grip space anchors a held tool; target-ray space supplies ergonomic pointing.
// They are different WebXR poses, so copying the grip's rotation is not aiming.
export function alignHeldToolToRay(tool, controller) {
  const parentRotation = tool.parent.getWorldQuaternion(new Quaternion());
  const rayRotation = controller.getWorldQuaternion(new Quaternion());
  tool.quaternion.copy(parentRotation.invert().multiply(rayRotation));
  tool.updateWorldMatrix(false, false);
}
