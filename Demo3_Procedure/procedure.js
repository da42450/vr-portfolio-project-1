// Seven procedural outcomes, not seven pickup/acknowledgment buttons.
// Scene adapters supply measured motion and tool conditions; errors preserve
// completed outcomes so a learner can recover without restarting.
export const ACTIONS = [
  "alarm",
  "call",
  "ready",
  "pin",
  "aim",
  "squeeze",
  "sweep",
];
export const STEPS = [
  "Pull the alarm handle down.",
  "Press CALL HELP on the simulation station.",
  "Hold a suitable tank. Check its pressure.",
  "Hold the tank. Pull its pin sideways.",
  "Take the nozzle. Aim at the fire's base.",
  "Squeeze with the TANK hand's trigger.",
  "Hold tank trigger. Sweep the whole base.",
];
export const HINTS = [
  "Grip the cream alarm bar and pull it down to the stop. This scenario assumes a small fire, safe air and a clear exit behind you. Otherwise evacuate.",
  "Release the alarm handle. Point a free controller at CALL HELP and press its index trigger. This only simulates notifying emergency help; it never makes a real call.",
  "This is energized electrical equipment. WATER is unsuitable. Hold a red ABC tank, read its gauge, then select CHECK with your free hand. Reject the low-pressure tank; use the green-pressure ABC.",
  "Hold the accepted tank with one hand. Grip the pin ring with the other and pull sideways along the tank. Release the removed pin into its snap tray.",
  "Grip the nozzle and point its mouth low at the base. The guide turns green when aligned and within this simulation's spray range.",
  "Keep the tank and nozzle in different hands, aim at the base, then hold the index trigger on the TANK hand to squeeze its lever. The nozzle hand aims, not squeezes.",
  "Keep the tank-hand trigger held. Sweep left, center and right. Each base section needs sustained spray; fire-out completes the exercise automatically. Release the trigger afterwards.",
];
export class Procedure {
  constructor() {
    this.reset();
  }
  reset() {
    this.step = 0;
    this.errors = 0;
    this.complete = false;
    this.coverage = [0, 0, 0];
    this.alarmActive =
      this.helpCalled =
      this.toolReady =
      this.pinRemoved =
      this.aimed =
        false;
    this.message = "";
  }
  get ended() {
    return this.complete;
  }
  reject(message) {
    this.errors++;
    this.message = message;
    return false;
  }
  event(action, context = {}) {
    if (this.ended) return false;
    if (action === "wrong-part")
      return this.reject("Electrical fire: WATER is unsuitable. Choose ABC.");
    if (action !== ACTIONS[this.step])
      return this.reject(`First: ${STEPS[this.step]}`);
    if (action === "alarm") {
      if (!Number.isFinite(context.slide) || context.slide < 0.09)
        return this.reject("Pull the alarm handle down to its stop.");
      this.alarmActive = true;
    }
    if (action === "call") this.helpCalled = true;
    if (action === "ready") {
      if (!context.held)
        return this.reject("Hold the tank before checking it.");
      if (context.type !== "ABC")
        return this.reject(
          "Electrical fire: select an ABC extinguisher, not WATER.",
        );
      if (context.pressure !== "green")
        return this.reject(
          "Pressure is too low. Release this tank; choose the green-pressure ABC.",
        );
      this.toolReady = true;
    }
    if (action === "pin") {
      if (
        !context.tankHeld ||
        !Number.isFinite(context.slide) ||
        context.slide <= 0.15
      )
        return this.reject("Hold the tank and pull its pin fully outward.");
      this.pinRemoved = true;
    }
    if (action === "aim") {
      if (!context.nozzleHeld || !context.atBase)
        return this.reject("Hold the nozzle and aim at the base within range.");
      this.aimed = true;
    }
    if (action === "squeeze") {
      if (!context.twoHands)
        return this.reject("Use separate hands for tank and nozzle.");
      if (!context.atBase)
        return this.reject("Aim at the base before squeezing.");
    }
    if (action === "sweep" && !this.coverage.every((n) => n >= 1.2))
      return false;
    this.step++;
    this.complete = this.step === ACTIONS.length;
    this.message = this.complete
      ? "Fire out. Release trigger. Watch for re-ignition; back away safely."
      : "";
    return true;
  }
  spray(zone, dt) {
    if (
      this.ended ||
      this.step !== 6 ||
      !Number.isInteger(zone) ||
      zone < 0 ||
      zone > 2 ||
      !Number.isFinite(dt) ||
      dt <= 0
    )
      return;
    // A long/stalled frame must not grant seconds of unseen coverage.
    this.coverage[zone] = Math.min(
      1.2,
      this.coverage[zone] + Math.min(dt, 0.05),
    );
    this.event("sweep");
  }
}
