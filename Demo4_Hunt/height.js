// Both posture modes calibrate once to this authored virtual eye height.
// Read reference-space headset Y, never the already-adjusted camera/world Y.
// Afterwards the fixed offset preserves natural leaning/crouching motion.
export class HeightCalibration {
  constructor(target = 1.6) {
    this.target = target;
    this.reset();
  }
  reset() {
    this.offset = 0;
    this.nativeY = null;
    this.pending = true;
  }
  request() {
    this.pending = true;
  }
  sample(nativeY) {
    if (!Number.isFinite(nativeY)) return false;
    this.nativeY = nativeY;
    if (!this.pending) return false;
    this.offset = this.target - nativeY;
    this.pending = false;
    return true;
  }
  get eyeHeight() {
    return this.nativeY === null ? null : this.nativeY + this.offset;
  }
}
