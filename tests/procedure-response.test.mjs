import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as THREE from "../Shared/vendor/three.module.js";
import { Procedure, ACTIONS, STEPS } from "../Demo3_Procedure/procedure.js";
import {
  alarmSlide,
  baseTarget,
  SPRAY_RANGE,
} from "../Demo3_Procedure/mechanics.js";

function prepare() {
  const p = new Procedure();
  p.event("alarm", { slide: 0.11 });
  p.event("call");
  return p;
}
function spraying() {
  const p = prepare();
  p.event("ready", { type: "ABC", pressure: "green", held: true });
  p.event("pin", { tankHeld: true, slide: 0.2 });
  p.event("aim", { nozzleHeld: true, atBase: true });
  p.event("squeeze", { twoHands: true, atBase: true });
  return p;
}

test("seven outcomes exclude pickup, gaze and a final acknowledgment", () => {
  assert.equal(ACTIONS.length, 7);
  assert.equal(STEPS.length, 7);
  for (const action of ["pickup", "select", "look", "verify"])
    assert.ok(!ACTIONS.includes(action));
  const p = new Procedure();
  assert.equal(p.event("call"), false);
  assert.equal(p.alarmActive, false);
  for (const slide of [undefined, NaN, 0, 0.08])
    assert.equal(p.event("alarm", { slide }), false);
  assert.equal(p.step, 0);
  assert.equal(p.event("alarm", { slide: 0.11 }), true);
  assert.equal(p.alarmActive, true);
  assert.equal(p.event("call"), true);
  assert.equal(p.helpCalled, true);
  assert.equal(p.step, 2);
});

test("readiness validates held tool, electrical-fire type and actual pressure; failures recover", () => {
  const p = prepare();
  for (const context of [
    { type: "ABC", pressure: "green", held: false },
    { type: "WATER", pressure: "green", held: true },
    { type: "ABC", pressure: "low", held: true },
  ]) {
    assert.equal(p.event("ready", context), false);
    assert.equal(p.step, 2);
    assert.equal(p.toolReady, false);
    assert.equal(p.alarmActive, true);
    assert.equal(p.helpCalled, true);
  }
  assert.equal(p.errors, 3);
  assert.match(p.message, /Pressure is too low/);
  assert.equal(
    p.event("ready", { type: "ABC", pressure: "green", held: true }),
    true,
  );
  assert.equal(p.step, 3);
  assert.equal(p.toolReady, true);
  assert.equal(p.errors, 3);
});

test("pin and aim need manipulation evidence; squeeze needs both hands and live aim", () => {
  const p = prepare();
  p.event("ready", { type: "ABC", pressure: "green", held: true });
  for (const context of [
    { tankHeld: false, slide: 0.2 },
    { tankHeld: true, slide: 0.15 },
    { tankHeld: true, slide: NaN },
  ])
    assert.equal(p.event("pin", context), false);
  assert.equal(p.pinRemoved, false);
  assert.equal(p.event("pin", { tankHeld: true, slide: 0.2 }), true);
  assert.equal(p.event("aim", { nozzleHeld: false, atBase: true }), false);
  assert.equal(p.event("aim", { nozzleHeld: true, atBase: false }), false);
  assert.equal(p.event("aim", { nozzleHeld: true, atBase: true }), true);
  assert.equal(p.event("squeeze", { twoHands: false, atBase: true }), false);
  assert.equal(p.event("squeeze", { twoHands: true, atBase: false }), false);
  assert.equal(p.event("squeeze", { twoHands: true, atBase: true }), true);
});

test("coverage needs all sections, ignores invalid input, caps stalled frames and completes automatically", () => {
  const p = spraying();
  for (const [zone, dt] of [
    [0, NaN],
    [0, -1],
    [3, 1],
    [0.5, 1],
    [0, Infinity],
  ])
    p.spray(zone, dt);
  assert.deepEqual(p.coverage, [0, 0, 0]);
  p.spray(0, 10);
  assert.equal(p.coverage[0], 0.05);
  for (let frame = 0; frame < 100; frame++) p.spray(0, 0.05);
  assert.equal(p.complete, false, "holding still cannot count as a sweep");
  for (let zone = 1; zone < 3; zone++)
    for (let frame = 0; frame < 25; frame++) p.spray(zone, 0.05);
  assert.equal(p.step, 7);
  assert.equal(p.complete, true);
  p.reset();
  for (const key of [
    "alarmActive",
    "helpCalled",
    "toolReady",
    "pinRemoved",
    "aimed",
    "complete",
  ])
    assert.equal(p[key], false);
});

test("alarm slider is station-local, bounded and cannot be activated by lateral movement", () => {
  for (const yaw of [0, Math.PI / 2, -1.3]) {
    const station = new THREE.Group();
    station.position.set(2, 0.5, -3);
    station.rotation.y = yaw;
    station.updateMatrixWorld(true);
    for (const [local, expected] of [
      [new THREE.Vector3(0, 0.09, 0.09), 0],
      [new THREE.Vector3(3, 0.09, 2), 0],
      [new THREE.Vector3(0, 0.04, 0.09), 0.05],
      [new THREE.Vector3(0, -1, 0.09), 0.11],
      [new THREE.Vector3(0, 1, 0.09), 0],
    ]) {
      assert.ok(
        Math.abs(
          alarmSlide(station, station.localToWorld(local), 0.09) - expected,
        ) < 1e-10,
      );
    }
  }
});

test("spray targets the base in front, within range, and does not pass between two zones", () => {
  const origin = new THREE.Vector3(0, 1, 0),
    direction = new THREE.Vector3(0, 0, -1);
  assert.equal(
    baseTarget(origin, direction, [new THREE.Vector3(0, 1, 1)]),
    null,
  );
  assert.equal(
    baseTarget(origin, direction, [
      new THREE.Vector3(0, 1, -SPRAY_RANGE - 0.01),
    ]),
    null,
  );
  assert.equal(
    baseTarget(origin, direction, [new THREE.Vector3(0, 0.5, -1)]),
    null,
  );
  assert.equal(
    baseTarget(origin, direction, [new THREE.Vector3(0.18, 1, -1)]),
    null,
  );
  assert.equal(
    baseTarget(origin, direction, [
      new THREE.Vector3(0.12, 1, -1),
      new THREE.Vector3(0.01, 1, -1),
    ]).i,
    1,
  );
  assert.equal(
    baseTarget(origin, direction, [new THREE.Vector3(0, 1, -SPRAY_RANGE)]).i,
    0,
  );
  assert.equal(
    baseTarget(origin, direction, [new THREE.Vector3(0, 1, -1)], 0.17, 0.5),
    null,
    "a solid obstacle blocks the jet before the fire",
  );
});

test("scene does not advance on pickup, has no Finish gate, and the tank hand controls its valve", async () => {
  const source = await readFile(
    new URL("../Demo3_Procedure/main.js", import.meta.url),
    "utf8",
  );
  assert.match(source, /body\.userData\.onGrab = \(\) => \{\}/);
  assert.doesNotMatch(source, /advance\("select"|advance\("verify"|stepAction/);
  assert.match(source, /body\.userData\.use = use/);
  assert.doesNotMatch(source, /nozzle\.userData\.use = use/);
  assert.match(source, /tankHeld: tankHeld\(body\)/);
  assert.match(source, /checkTank\(tank\)/);
  assert.match(source, /baseTarget\(\s*tip,\s*direction/);
  assert.match(source, /intersectObjects\(\s*\[bench, equipment\]/);
});

test("squeeze hinge closes down toward the carrying handle rather than opening upward", () => {
  const pivot = new THREE.Group();
  pivot.position.set(0.075, 0.55, 0);
  const leverEnd = new THREE.Vector3(-0.15, 0, 0);
  pivot.rotation.z = -0.3;
  const open = pivot.localToWorld(leverEnd.clone());
  pivot.rotation.z = 0;
  const closed = pivot.localToWorld(leverEnd.clone());
  assert.ok(closed.y < open.y);
  assert.ok(
    closed.y > 0.52,
    "lever closes above the fixed carrying handle, not through it",
  );
});

test("actual mesh ray intersections block a low jet at the bench before the base", () => {
  const bench = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.12, 0.65));
  bench.position.set(0, 0.72, -0.62);
  bench.updateMatrixWorld(true);
  const base = new THREE.Vector3(0, 0.48, -1.6);
  const raycaster = new THREE.Raycaster();
  for (const [height, blocked] of [
    [1, false],
    [0.8, true],
  ]) {
    const origin = new THREE.Vector3(0, height, -0.8);
    const direction = base.clone().sub(origin).normalize();
    raycaster.set(origin, direction);
    const hit = raycaster.intersectObject(bench)[0];
    const target = baseTarget(
      origin,
      direction,
      [base],
      0.17,
      hit?.distance ?? Infinity,
    );
    assert.equal(target === null, blocked);
  }
});
