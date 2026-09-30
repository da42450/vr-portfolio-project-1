// Both modes use the same ordered procedure. Guided errors are recoverable;
// selecting WATER in Test ends that attempt until reset.
export const STEPS = [
  "Check alarm, small fire and clear exit.",
  "Pick up the ABC extinguisher.",
  "Inspect the green pressure gauge.",
  "Pull the pin sideways.",
  "Take the nozzle. Aim at the base.",
  "Hold tank and nozzle. Squeeze.",
  "Sweep all three base sections.",
  "Release spray. Confirm fire is out.",
];
export const HINTS = [
  "Raise the alarm. Only attempt a small fire with a clear escape route.",
  "Hold side GRIP near the red ABC tank's handle. WATER is incorrect.",
  "Read the needle, then trigger the gauge or its CHECK tab with your free hand.",
  "Hold the pin ring with the other hand and pull it outward along the tank.",
  "Release the pin. Grip the nozzle and point it low at the fire's base.",
  "Keep GRIP held on tank and nozzle in different hands; press index trigger.",
  "Keep spraying while sweeping left, center and right until all flames are out.",
  "Release the trigger and select Finish. Reset to practice again.",
];
export class Procedure {
  constructor(mode = "guided") {
    this.reset(mode);
  }
  reset(mode = this.mode) {
    this.mode = mode === "test" ? "test" : "guided";
    this.step = 0;
    this.errors = 0;
    this.complete = false;
    this.failed = false;
    this.coverage = [0, 0, 0];
    this.message = "";
  }
  get ended() {
    return this.complete || this.failed;
  }
  reject(message) {
    this.errors++;
    this.message = message;
    return false;
  }
  event(action, context = {}) {
    if (this.ended) return false;
    if (action === "wrong-part") {
      if (this.mode === "test") {
        this.failed = true;
        return this.reject("Failed: water extinguisher.");
      }
      return this.reject("Wrong extinguisher. Release it and choose ABC.");
    }
    const expected = [
      "safety",
      "select",
      "pressure",
      "pin",
      "aim",
      "squeeze",
      "sweep",
      "verify",
    ][this.step];
    if (action !== expected)
      return this.reject(
        this.mode === "test"
          ? "Action out of order."
          : `First: ${STEPS[this.step]}`,
      );
    if (action === "squeeze" && !context.twoHands)
      return this.reject(
        this.mode === "test"
          ? "Action not valid."
          : "Use separate hands for tank and nozzle.",
      );
    if (action === "verify" && !this.coverage.every((n) => n >= 1.2))
      return this.reject("Fire is not out.");
    if (action === "sweep") {
      if (this.coverage.every((n) => n >= 1.2)) this.step++;
      else return false;
    } else this.step++;
    this.complete = this.step === STEPS.length;
    this.message = this.complete
      ? this.mode === "test"
        ? `Passed · ${this.errors} mistakes`
        : "Complete."
      : "";
    return true;
  }
  spray(zone, dt) {
    if (this.ended || this.step !== 6 || zone < 0 || zone > 2) return;
    this.coverage[zone] = Math.min(1.2, this.coverage[zone] + dt);
    this.event("sweep");
  }
}
