import test from "node:test";
import assert from "node:assert/strict";
import { Procedure } from "../Demo3_Procedure/procedure.js";
import { Hunt, TARGETS, validSettings } from "../Demo4_Hunt/hunt.js";
test("procedure rejects skipped steps and recovers without losing progress", () => {
  const p = new Procedure();
  assert.equal(p.event("pin"), false);
  assert.equal(p.step, 0);
  p.event("safety");
  p.event("wrong-part");
  assert.equal(p.step, 1);
  assert.equal(p.errors, 2);
  p.event("select");
  p.event("pressure");
  p.event("pin");
  p.event("aim");
  assert.equal(p.event("squeeze", { twoHands: false }), false);
  assert.equal(p.step, 5);
  p.event("squeeze", { twoHands: true });
  assert.equal(p.step, 6);
  p.spray(0, 2);
  p.spray(1, 2);
  assert.equal(p.step, 6);
  p.spray(2, 2);
  assert.equal(p.step, 7);
  p.event("verify");
  assert.equal(p.complete, true);
  p.reset();
  assert.equal(p.step, 0);
  assert.equal(p.errors, 0);
});
test("hunt counts distinct correct items, penalizes errors and freezes final time", () => {
  const h = new Hunt();
  h.tick(2);
  assert.equal(h.elapsed, 0);
  h.select("AX-140");
  h.tick(10);
  h.select(TARGETS[0]);
  h.select(TARGETS[0]);
  assert.equal(h.found.size, 1);
  assert.equal(h.errors, 1);
  TARGETS.slice(1).forEach((c) => h.select(c));
  assert.equal(h.complete, true);
  const time = h.elapsed;
  h.tick(30);
  assert.equal(h.elapsed, time);
  assert.equal(h.score, 955);
});
test("Test mode fails on water, freezes the attempt, and reset retains the mode", () => {
  const p = new Procedure("test");
  p.event("safety");
  assert.equal(p.event("wrong-part"), false);
  assert.equal(p.failed, true);
  assert.equal(p.ended, true);
  assert.equal(p.complete, false);
  assert.equal(p.errors, 1);
  const final = JSON.stringify(p);
  for (const action of [
    "select",
    "pressure",
    "pin",
    "aim",
    "squeeze",
    "verify",
    "wrong-part",
  ])
    p.event(action, { twoHands: true });
  p.spray(0, 2);
  assert.equal(JSON.stringify(p), final);
  p.reset();
  assert.equal(p.mode, "test");
  assert.equal(p.failed, false);
  assert.equal(p.errors, 0);
  assert.equal(p.step, 0);
  assert.deepEqual(p.coverage, [0, 0, 0]);
  p.reset("guided");
  p.event("wrong-part");
  assert.equal(p.failed, false);
  assert.equal(p.ended, false);
  p.reset("invalid");
  assert.equal(p.mode, "guided");
});
test("Test mode gives no next-step directions and can pass the same procedure", () => {
  const p = new Procedure("test");
  p.event("pin");
  assert.equal(p.message, "Action out of order.");
  for (const action of ["safety", "select", "pressure", "pin", "aim"]) {
    assert.equal(p.event(action), true);
    assert.equal(p.message, "");
  }
  assert.equal(p.event("squeeze", { twoHands: false }), false);
  assert.equal(p.message, "Action not valid.");
  p.event("squeeze", { twoHands: true });
  for (let i = 0; i < 3; i++) p.spray(i, 2);
  p.event("verify");
  assert.equal(p.complete, true);
  assert.equal(p.failed, false);
  assert.equal(p.message, "Passed · 2 mistakes");
});
test("saved settings reject invalid modes and clamp unsafe speed values", () => {
  assert.deepEqual(
    validSettings({ locomotion: "bad", turn: "bad", speed: 99 }),
    {
      locomotion: "teleport",
      turn: "snap",
      speed: 3,
      seated: false,
      vignette: true,
    },
  );
  assert.equal(validSettings({ speed: -8 }).speed, 0.5);
  assert.equal(
    validSettings({ locomotion: "smooth", seated: true }).seated,
    true,
  );
});
