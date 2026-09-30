import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../Shared/vendor/three.module.js";
import { App } from "../Shared/runtime.js";
import {
  findGrabTarget,
  resolvePointerTarget,
  alignHeldToolToRay,
} from "../Shared/grab.js";
import { Procedure } from "../Demo3_Procedure/procedure.js";
import {
  BODY_HOME,
  BODY_GRIP,
  BODY_ZONES,
  PIN_HOME,
  PIN_ZONES,
  NOZZLE_ZONES,
} from "../Demo3_Procedure/grips.js";

function fixture() {
  const scene = new THREE.Scene(),
    workspace = new THREE.Group();
  scene.add(workspace);
  const body = new THREE.Group(),
    pin = new THREE.Group(),
    nozzle = new THREE.Group();
  workspace.add(body);
  body.position.set(...BODY_HOME);
  body.add(pin, nozzle);
  pin.position.set(...PIN_HOME);
  nozzle.position.set(0.15, 0.18, 0.06);
  body.userData.grabZones = BODY_ZONES;
  body.userData.snapGrip = new THREE.Vector3(...BODY_GRIP);
  pin.userData.grabZones = PIN_ZONES;
  nozzle.userData.grabZones = NOZZLE_ZONES;
  const state = new Procedure();
  pin.userData.grabEnabled = () => state.step >= 3;
  nozzle.userData.grabEnabled = () => state.step >= 4;
  body.userData.onGrab = () => {
    if (state.step < 2) state.event("select");
  };
  const hands = [new THREE.Group(), new THREE.Group()];
  hands.forEach((hand, i) => {
    hand.userData.hand = i;
    scene.add(hand);
  });
  const app = Object.assign(Object.create(App.prototype), {
    scene,
    hands,
    controllers: [{ userData: {} }, { userData: {} }],
    grabbables: [body, pin, nozzle],
    notify: () => {},
  });
  const worldPoint = (object, point = [0, 0, 0]) =>
    object.localToWorld(new THREE.Vector3(...point));
  return { app, scene, workspace, body, pin, nozzle, state, worldPoint };
}

test("carry handle and tank are grabbable, even though their modelling origin is far away", () => {
  const { app, body, pin, state, worldPoint } = fixture();
  state.event("safety");
  const handle = worldPoint(body, BODY_ZONES[0].center);
  assert.ok(
    handle.distanceTo(worldPoint(body)) > 0.23,
    "reproduces the old origin-distance miss",
  );
  assert.equal(findGrabTarget(app.grabbables, handle).object, body);
  assert.equal(
    findGrabTarget(app.grabbables, worldPoint(body, [0, 0.23, 0.08])).object,
    body,
  );
  assert.equal(
    findGrabTarget(app.grabbables, worldPoint(pin)).object,
    body,
    "inactive pin must not steal handle pickup",
  );
  assert.equal(state.errors, 0, "hovering is not a procedure mistake");
});

test("actual controller grab attaches the handle to the hand; pin is available after pressure inspection", () => {
  const { app, body, pin, state, worldPoint } = fixture();
  state.event("safety");
  app.hands[0].position.copy(worldPoint(body, BODY_ZONES[0].center));
  app.grab(0);
  assert.equal(body.userData.holder, app.hands[0]);
  assert.equal(app.hands[0].userData.held, body);
  assert.equal(state.step, 2);
  app.hands[0].position.add(new THREE.Vector3(0.2, 0.15, 0.1));
  app.hands[0].rotation.y = 0.8;
  assert.ok(
    worldPoint(body, BODY_ZONES[0].center).distanceTo(
      worldPoint(app.hands[0]),
    ) < 1e-6,
  );
  state.event("pressure");
  app.hands[1].position.copy(worldPoint(pin));
  app.grab(1);
  assert.equal(pin.userData.holder, app.hands[1]);
  assert.equal(
    body.userData.holder,
    app.hands[0],
    "second hand does not steal the tank",
  );
});

test("grip zones work after workspace recentering/rotation and reject hidden or distant objects", () => {
  const { app, body, workspace, worldPoint } = fixture();
  workspace.position.set(2, -0.45, 3);
  workspace.rotation.y = 1.3;
  assert.equal(
    findGrabTarget(app.grabbables, worldPoint(body, [0, 0.52, 0])).object,
    body,
  );
  assert.equal(
    findGrabTarget(app.grabbables, new THREE.Vector3(20, 20, 20)),
    null,
  );
  workspace.visible = false;
  assert.equal(
    findGrabTarget(app.grabbables, worldPoint(body, [0, 0.52, 0])),
    null,
  );
});

test("holding is exclusive, release stops tool use, and another hand can pick the object up again", () => {
  const { app, body } = fixture();
  let stopped = false;
  body.userData.use = (down) => {
    stopped = !down;
  };
  assert.equal(app.hold(body, 0), true);
  assert.equal(app.hold(body, 1), false);
  const other = new THREE.Group();
  app.scene.add(other);
  assert.equal(app.hold(other, 0), false);
  app.release(0);
  assert.equal(stopped, true);
  assert.equal(body.userData.holder, undefined);
  assert.equal(app.hands[0].userData.held, undefined);
  assert.equal(app.hold(body, 1), true);
});

test("mouse picking resolves disabled pin/nozzle geometry to the tank, while the pressure gauge stays selectable", () => {
  const { app, body, pin, state } = fixture();
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.03));
  pin.add(mesh);
  assert.equal(resolvePointerTarget(mesh, app.grabbables, []), body);
  state.step = 3;
  assert.equal(resolvePointerTarget(mesh, app.grabbables, []), pin);
  const gauge = new THREE.Group();
  gauge.userData.action = () => {};
  body.add(gauge);
  assert.equal(resolvePointerTarget(gauge, app.grabbables, [gauge]), gauge);
});

test("held nozzle aims along the controller's pointing ray, not its different grip-space rotation", () => {
  const { app, nozzle, state } = fixture();
  state.step = 4;
  app.hands[1].rotation.set(0.8, 0.4, -0.3);
  const ray = new THREE.Group();
  ray.rotation.set(-0.35, 1.2, 0.1);
  app.scene.add(ray);
  app.hold(nozzle, 1);
  alignHeldToolToRay(nozzle, ray);
  const direction = (object) =>
    new THREE.Vector3(0, 0, -1).applyQuaternion(
      object.getWorldQuaternion(new THREE.Quaternion()),
    );
  assert.ok(direction(nozzle).dot(direction(ray)) > 0.999999);
  assert.ok(
    direction(nozzle).dot(direction(app.hands[1])) < 0.8,
    "test includes a real grip-versus-pointing rotation mismatch",
  );
});
