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
test("guided completion freezes progress and reset starts a clean walkthrough", () => {
  const p = new Procedure();
  for (const action of ["safety", "select", "pressure", "pin", "aim"]) {
    assert.equal(p.event(action), true);
    assert.equal(p.message, "");
  }
  p.event("squeeze", { twoHands: true });
  for (let i = 0; i < 3; i++) p.spray(i, 2);
  p.event("verify");
  assert.equal(p.complete, true);
  assert.equal(p.ended, true);
  assert.equal(p.message, "Complete.");
  const final = JSON.stringify(p);
  for (const action of ["safety", "wrong-part", "verify"]) p.event(action);
  p.spray(0, 2);
  assert.equal(JSON.stringify(p), final);
  p.reset();
  assert.equal(p.step, 0);
  assert.equal(p.errors, 0);
  assert.equal(p.complete, false);
  assert.equal(p.ended, false);
  assert.deepEqual(p.coverage, [0, 0, 0]);
  assert.equal(p.message, "");
});
test("completed hunt freezes score and selections until reset", () => {
  const h = new Hunt();
  h.select("AX-140");
  h.tick(10);
  TARGETS.forEach((code) => h.select(code));
  const final = {
    found: [...h.found],
    elapsed: h.elapsed,
    errors: h.errors,
    score: h.score,
    started: h.started,
  };
  for (const code of ["AX-140", TARGETS[0], "UNKNOWN"]) {
    assert.match(h.select(code), /Hunt complete/);
  }
  h.tick(30);
  assert.deepEqual(
    {
      found: [...h.found],
      elapsed: h.elapsed,
      errors: h.errors,
      score: h.score,
      started: h.started,
    },
    final,
  );
  h.reset();
  assert.equal(h.complete, false);
  assert.equal(h.started, false);
  assert.equal(h.score, 1000);
  assert.equal(h.found.size, 0);
  assert.match(h.select(TARGETS[0]), /Collected/);
  assert.equal(h.found.size, 1);
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
