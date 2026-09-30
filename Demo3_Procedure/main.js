import {
  App,
  THREE,
  V,
  material,
  box,
  cylinder,
  group,
  label,
  panelButton,
  room,
} from "../Shared/runtime.js?v=controls-1.1";
import { Procedure, STEPS, HINTS } from "./procedure.js?v=pass-2.1";
import {
  makeNozzle,
  RubberHose,
  PowderSpray,
  powderTexture,
  makePressureButton,
} from "./visuals.js?v=pass-2.1";
import { alignHeldToolToRay } from "../Shared/grab.js";
import {
  BODY_HOME,
  WATER_HOME,
  PIN_HOME,
  TRAY_HOME,
  BODY_GRIP,
  BODY_ZONES,
  PIN_ZONES,
  NOZZLE_ZONES,
} from "./grips.js";
const app = new App(),
  state = new Procedure();
room(app, 10);
const workspace = group(app.scene, "Arm-reach training workspace");
function desktopView() {
  app.camera.position.set(0, 1.65, 0.75);
  app.camera.lookAt(0, 1.3, -1.3);
}
desktopView();
box(
  workspace,
  "Training bench",
  [2.7, 0.12, 0.65],
  [0, 0.72, -0.62],
  material("#829a98"),
);
for (const x of [-1.15, 1.15])
  box(
    workspace,
    "Bench leg",
    [0.1, 0.7, 0.5],
    [x, 0.35, -0.62],
    material("#455f67"),
  );
const board = group(workspace, "Guidance", [0, 1.9, -1.9]);
const guidedMode = panelButton(
    app,
    board,
    "GUIDED",
    [-0.43, 0.5, 0],
    () => reset("guided"),
    0.75,
  ),
  testMode = panelButton(
    app,
    board,
    "TEST",
    [0.43, 0.5, 0],
    () => reset("test"),
    0.75,
  ),
  instruction = label(board, "", [0, 0.25, 0], 1.9, 0.22),
  feedback = label(board, "", [0, 0.025, 0.01], 1.9, 0.18),
  stepAction = panelButton(
    app,
    board,
    "",
    [0, -0.2, 0],
    () => advance(state.step === 0 ? "safety" : "verify"),
    1.05,
  ),
  hintAction = panelButton(app, board, "HINT", [-0.58, -0.42, 0], hint, 0.48);
panelButton(app, board, "RESET", [0, -0.42, 0], () => reset(), 0.48);
panelButton(app, board, "RECENTER", [0.58, -0.42, 0], centerWorkspace, 0.48);
label(board, "PASS · USFA · CLASSROOM SIMULATION", [0, -0.59, 0], 1.6, 0.08);
label(workspace, "EXIT · BEHIND YOU", [0, 2.1, 1], 2, 0.35).rotation.y =
  Math.PI;
function extinguisher(name, x, color) {
  const g = group(workspace, name, [x, 0.82, -0.5]);
  cylinder(g, "Tank", 0.095, 0.38, [0, 0.2, 0], material(color));
  const shoulder = new THREE.Mesh(
    new THREE.SphereGeometry(0.095, 20, 12),
    material(color),
  );
  shoulder.scale.y = 0.5;
  shoulder.position.y = 0.39;
  g.add(shoulder);
  cylinder(
    g,
    "Valve",
    0.025,
    0.08,
    [0, 0.46, 0],
    material("#bbcaca", { metalness: 0.8 }),
  );
  box(
    g,
    "Fixed carrying handle",
    [0.16, 0.025, 0.035],
    [0, 0.52, 0],
    material("#283d45"),
  );
  label(g, name, [0, 0.23, 0.1], 0.16, 0.12);
  g.userData.snapGrip = V(...BODY_GRIP);
  g.userData.grabZones = BODY_ZONES;
  g.userData.grabEnabled = () => !state.ended;
  app.grabbables.push(g);
  return g;
}
const body = extinguisher("ABC", BODY_HOME[0], "#b73a3c"),
  wrong = extinguisher("WATER", WATER_HOME[0], "#4076a0");
wrong.userData.onGrab = () => advance("wrong-part");
wrong.userData.action = () => advance("wrong-part");
wrong.userData.onRelease = () => {
  workspace.attach(wrong);
  wrong.position.set(...WATER_HOME);
  wrong.quaternion.identity();
};
app.interactables.push(wrong);
body.userData.onGrab = () => {
  if (state.step === 1) advance("select");
  else if (state.step < 1) advance("select");
};
body.userData.onRelease = () => {
  if (!body.userData.holder) {
    desktopBody = false;
    squeezing = false;
    workspace.attach(body);
    body.position.set(...BODY_HOME);
    body.quaternion.identity();
  }
};
const gauge = label(
  body,
  "PRESSURE\nGREEN",
  [0.075, 0.43, 0.065],
  0.095,
  0.075,
);
gauge.userData.action = () => advance("pressure");
app.interactables.push(gauge);
const pressureAction = makePressureButton(body, () => advance("pressure"));
app.interactables.push(pressureAction);
const gaugeCanvas = document.createElement("canvas");
gaugeCanvas.width = gaugeCanvas.height = 256;
const gc = gaugeCanvas.getContext("2d");
gc.fillStyle = "#eef3ee";
gc.fillRect(0, 0, 256, 256);
gc.strokeStyle = "#31895b";
gc.lineWidth = 30;
gc.beginPath();
gc.arc(128, 128, 85, Math.PI * 1.1, Math.PI * 1.9);
gc.stroke();
gc.strokeStyle = "#a95048";
gc.beginPath();
gc.arc(128, 128, 85, Math.PI * 0.9, Math.PI * 1.1);
gc.stroke();
gc.beginPath();
gc.arc(128, 128, 85, Math.PI * 1.9, Math.PI * 2.1);
gc.stroke();
gc.strokeStyle = "#172f38";
gc.lineWidth = 7;
gc.beginPath();
gc.moveTo(128, 140);
gc.lineTo(128, 50);
gc.stroke();
gc.font = "bold 26px system-ui";
gc.textAlign = "center";
gc.fillStyle = "#143b45";
gc.fillText("PRESSURE", 128, 208);
gauge.material.map.dispose();
gauge.material.map = new THREE.CanvasTexture(gaugeCanvas);
gauge.material.map.colorSpace = THREE.SRGBColorSpace;
gauge.material.needsUpdate = true;
const leverPivot = group(body, "Constrained hinge", [0.075, 0.52, 0]);
const lever = box(
  leverPivot,
  "Squeeze lever",
  [0.17, 0.018, 0.034],
  [-0.075, 0, 0],
  material("#e5bb53"),
);
const pin = group(body, "Slider pin", PIN_HOME);
pin.userData.grabZones = PIN_ZONES;
const ring = new THREE.Mesh(
  new THREE.TorusGeometry(0.035, 0.006, 8, 16),
  material("#cddbe0", { metalness: 0.8 }),
);
ring.rotation.y = Math.PI / 2;
pin.add(ring);
const shaft = cylinder(
  pin,
  "Pin shaft",
  0.005,
  0.2,
  [-0.085, 0, 0],
  material("#ccd5d8"),
);
shaft.rotation.z = Math.PI / 2;
app.grabbables.push(pin);
let pulling = false,
  pinRemoved = false,
  pinGripOffset = null;
pin.userData.grabEnabled = () =>
  !state.ended && (state.mode === "test" || state.step >= 3);
pin.userData.canGrab = () => {
  if (pinRemoved) return true;
  if (state.step !== 3) {
    advance("pin");
    return false;
  }
  return true;
};
pin.userData.onGrab = () => {
  pulling = true;
  pinGripOffset = pin.userData.holder ? pin.position.clone() : null;
};
pin.userData.onRelease = () => {
  pulling = false;
  pinGripOffset = null;
  if (pinRemoved) {
    workspace.attach(pin);
    pin.position.set(...TRAY_HOME);
    pin.quaternion.identity();
  } else {
    body.attach(pin);
    pin.position.set(...PIN_HOME);
    pin.quaternion.identity();
  }
};
box(
  workspace,
  "Pin snap tray",
  [0.3, 0.035, 0.22],
  [TRAY_HOME[0], 0.81, TRAY_HOME[2]],
  material("#ddb85b"),
);
const NOZZLE_HOME = [0.15, 0.18, 0.06],
  HOSE_ANCHOR = [0.11, 0.45, 0.035],
  NOZZLE_REAR = [0, 0, 0.095],
  NOZZLE_OUTLET = [0, 0, -0.12];
const nozzle = makeNozzle(body);
nozzle.position.set(...NOZZLE_HOME);
nozzle.rotation.x = -Math.PI / 2;
const holsterRotation = nozzle.quaternion.clone();
nozzle.userData.snapGrip = V(0, 0, -0.04);
nozzle.userData.grabZones = NOZZLE_ZONES;
const spareNozzle = makeNozzle(wrong);
spareNozzle.position.set(...NOZZLE_HOME);
spareNozzle.quaternion.copy(holsterRotation);
for (const tank of [body, wrong]) {
  const coupling = cylinder(
    tank,
    "Brass hose connector",
    0.019,
    0.045,
    [0.09, 0.45, 0.035],
    material("#bba268", { metalness: 0.65 }),
  );
  coupling.rotation.z = Math.PI / 2;
}
app.grabbables.push(nozzle);
let nozzleRemoved = false,
  squeezing = false,
  desktopBody = false,
  desktopNozzle = false,
  desktopSweep = 0;
nozzle.userData.grabEnabled = () =>
  !state.ended && (state.mode === "test" || state.step >= 4);
nozzle.userData.canGrab = () => {
  if (state.step < 4) {
    advance("aim");
    return false;
  }
  return true;
};
nozzle.userData.onGrab = () => {
  nozzleRemoved = true;
};
nozzle.userData.onRelease = () => {
  if (!nozzle.userData.holder) {
    desktopNozzle = false;
    body.attach(nozzle);
    nozzle.position.set(...NOZZLE_HOME);
    nozzle.quaternion.copy(holsterRotation);
    nozzleRemoved = false;
    squeezing = false;
  }
};
const hose = new RubberHose(app.scene),
  spareHose = new RubberHose(app.scene),
  powder = new PowderSpray(app.scene, powderTexture());
const sprayLine = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([V(), V()]),
  new THREE.LineBasicMaterial({
    color: "#e9fbff",
    transparent: true,
    opacity: 0.8,
  }),
);
app.scene.add(sprayLine);
sprayLine.visible = false;
const flames = [],
  bases = [];
for (let i = 0; i < 3; i++) {
  const x = (i - 1) * 0.32;
  box(
    workspace,
    "Fuel tray",
    [0.31, 0.08, 0.3],
    [x, 0.39, -1.6],
    material("#533d31"),
  );
  const f = new THREE.Mesh(
    new THREE.ConeGeometry(0.14, 0.45, 8),
    material("#f39b30", { emissive: "#b44c13", emissiveIntensity: 1 }),
  );
  f.position.set(x, 0.65, -1.6);
  workspace.add(f);
  flames.push(f);
  bases.push(V(x, 0.48, -1.6));
  label(workspace, String(i + 1), [x, 0.33, -1.42], 0.16, 0.1);
}
function advance(action, ctx) {
  const wasEnded = state.ended;
  const result = state.event(action, ctx);
  document.querySelector("#notice").textContent = "";
  if (
    result &&
    action === "safety" &&
    (body.userData.holder || body.userData.desktopHeld || desktopBody)
  )
    state.event("select");
  if (!wasEnded && state.failed) {
    for (let i = 0; i < 2; i++) app.release(i);
    desktopBody = desktopNozzle = squeezing = false;
    powder.clear();
  }
  refresh();
  return result;
}
function hint() {
  if (state.mode !== "guided") return;
  app.notify(HINTS[state.step] || "Reset for another attempt.");
}
function refresh() {
  const guided = state.mode === "guided";
  const text = state.failed
    ? "FAILED · reset to retry"
    : state.complete
      ? guided
        ? "COMPLETE"
        : "PASSED"
      : guided
        ? `${state.step + 1}/8 · ${STEPS[state.step]}`
        : "TEST · no directions";
  app.status(text);
  instruction.setText(text);
  feedback.setText(state.message);
  feedback.visible = !!state.message;
  guidedMode.setText(guided ? "GUIDED ✓" : "GUIDED");
  testMode.setText(guided ? "TEST" : "TEST ✓");
  hintAction.visible = guided;
  // Test retains the physical control at all times, without revealing the step.
  pressureAction.visible = !guided || (!state.ended && state.step === 2);
  stepAction.visible = !state.ended && (state.step === 0 || state.step === 7);
  stepAction.setText(
    state.step === 0
      ? guided
        ? "CONFIRM SAFETY"
        : "START TEST"
      : guided
        ? "FINISH"
        : "FINISH TEST",
  );
  document.querySelector("#hint").hidden = !guided;
  document
    .querySelector("#guided")
    .setAttribute("aria-pressed", String(guided));
  document.querySelector("#test").setAttribute("aria-pressed", String(!guided));
  for (const button of document.querySelectorAll("#step-controls button")) {
    button.hidden =
      !guided ||
      state.ended ||
      !button.dataset.steps.split(",").includes(String(state.step));
  }
  document.querySelector("#step-controls").hidden = !guided || state.ended;
  document.querySelector("#mouse-test").hidden = guided;
  for (const button of document.querySelectorAll("#mouse-test button"))
    button.disabled = state.ended;
}
function twoHands() {
  const bh = app.renderer.xr.isPresenting
    ? body.userData.holder?.userData.hand
    : body.userData.desktopHeld
      ? body.userData.desktopHand
      : desktopBody
        ? 0
        : undefined;
  const nh = app.renderer.xr.isPresenting
    ? nozzle.userData.holder?.userData.hand
    : nozzle.userData.desktopHeld
      ? nozzle.userData.desktopHand
      : desktopNozzle
        ? 1
        : undefined;
  return bh !== undefined && nh !== undefined && bh !== nh;
}
function use(down) {
  if (state.ended) {
    squeezing = false;
    return;
  }
  if (down) {
    if (state.step === 5) {
      if (!advance("squeeze", { twoHands: twoHands() })) return;
    } else if (state.step < 5) {
      advance("squeeze");
      return;
    }
    if (state.step === 6 && twoHands()) {
      squeezing = true;
    } else squeezing = false;
  } else squeezing = false;
}
body.userData.use = use;
nozzle.userData.use = use;
function reset(mode = state.mode) {
  app.pointerUp();
  for (let i = 0; i < 2; i++) app.release(i);
  state.reset(mode);
  document.querySelector("#notice").textContent = "";
  pulling =
    pinRemoved =
    nozzleRemoved =
    squeezing =
    desktopBody =
    desktopNozzle =
      false;
  desktopSweep = 0;
  workspace.attach(body);
  body.position.set(...BODY_HOME);
  body.quaternion.identity();
  body.attach(pin);
  pin.position.set(...PIN_HOME);
  pin.quaternion.identity();
  body.attach(nozzle);
  nozzle.position.set(...NOZZLE_HOME);
  nozzle.quaternion.copy(holsterRotation);
  powder.clear();
  sprayLine.visible = false;
  leverPivot.rotation.z = 0;
  wrong.userData.onRelease();
  flames.forEach((f) => {
    f.visible = true;
    f.scale.y = 1;
  });
  refresh();
}
function desktopHoldBody() {
  if (state.ended) return;
  if (state.step < 1) {
    advance("select");
    return;
  }
  desktopBody = !desktopBody;
  if (desktopBody) {
    body.position.set(-0.3, 0.85, -0.5);
    body.userData.onGrab();
  } else body.userData.onRelease();
}
function desktopHoldNozzle() {
  if (state.ended) return;
  if (state.step < 4) {
    advance("aim");
    return;
  }
  desktopNozzle = !desktopNozzle;
  if (desktopNozzle) {
    app.scene.attach(nozzle);
    nozzle.position.set(0.1, 1, -0.8);
    nozzleRemoved = true;
  } else nozzle.userData.onRelease();
}
function desktopAim() {
  if (!desktopNozzle) {
    app.notify(
      state.mode === "guided" ? "Hold the nozzle first." : "Action not valid.",
    );
    return;
  }
  nozzle.lookAt(workspace.localToWorld(bases[1].clone()));
  nozzle.rotateY(Math.PI);
  advance("aim");
}
for (const [id, fn] of [
  ["hint", hint],
  ["reset", () => reset()],
  ["guided", () => reset("guided")],
  ["test", () => reset("test")],
  ["safety", () => advance("safety")],
  ["body", desktopHoldBody],
  ["pressure", () => advance("pressure")],
  ["nozzle", desktopHoldNozzle],
  [
    "pin",
    () => {
      if (advance("pin")) {
        pinRemoved = true;
        workspace.attach(pin);
        pin.position.set(...TRAY_HOME);
      }
    },
  ],
  ["aim-nozzle", desktopAim],
  ["verify", () => advance("verify")],
]) {
  document.querySelector("#" + id).onclick = fn;
  const testButton = document.querySelector(`[data-action="${id}"]`);
  if (testButton) testButton.onclick = fn;
}
const sprayButton = document.querySelector("#spray");
sprayButton.onclick = () => use(!squeezing);
document.querySelector('[data-action="spray"]').onclick = sprayButton.onclick;
function nextSweep() {
  if (!desktopNozzle) return;
  desktopSweep = desktopSweep === 0 ? -0.32 : desktopSweep < 0 ? 0.32 : 0;
  nozzle.lookAt(workspace.localToWorld(V(desktopSweep, 0.48, -1.6)));
  nozzle.rotateY(Math.PI);
}
document.querySelector("#sweep").onclick = nextSweep;
document.querySelector('[data-action="sweep"]').onclick = nextSweep;
document.querySelector('[data-action="water"]').onclick = () =>
  advance("wrong-part");
app.onKey = (k) => {
  if (k === "KeyH") hint();
  if (k === "KeyR") reset();
  if (k === "KeyJ") nextSweep();
};
let lastHUD = 0,
  spaceDown = false,
  recenterPending = false,
  lastX = false;
function centerWorkspace() {
  if (!app.renderer.xr.isPresenting) return;
  app.renderer.xr.updateCamera(app.camera);
  const head = app.camera.getWorldPosition(V());
  if (head.y < 0.5) return false; // Wait for the first valid local-floor pose.
  const forward = app.camera.getWorldDirection(V());
  for (let i = 0; i < 2; i++) app.release(i);
  desktopBody = desktopNozzle = squeezing = false;
  workspace.position.set(head.x, head.y - 1.6, head.z);
  workspace.rotation.y = Math.atan2(-forward.x, -forward.z);
  workspace.updateMatrixWorld(true);
  app.notify("Bench centered.");
  return true;
}
app.onXR = (active) => {
  app.pointerUp();
  desktopBody = desktopNozzle = squeezing = false;
  recenterPending = active;
  lastX = false;
  if (!active) {
    workspace.position.set(0, 0, 0);
    workspace.rotation.set(0, 0, 0);
    desktopView();
  }
};
app.onNotice = (message) => {
  if (state.mode !== "guided") return;
  feedback.setText(message);
  feedback.visible = true;
};
const focusOutline = new THREE.BoxHelper(board, "#e8bd48");
app.scene.add(focusOutline);
app.update = (dt, t) => {
  if (app.renderer.xr.isPresenting) {
    if (recenterPending && centerWorkspace()) recenterPending = false;
    const x =
      app.controllers[app.handIndex("left")].userData.inputSource?.gamepad
        ?.buttons[4]?.pressed ?? false;
    if (x && !lastX) centerWorkspace();
    lastX = x;
  }
  if (!app.renderer.xr.isPresenting) {
    if (app.keys.Space && !spaceDown) use(!squeezing);
    spaceDown = !!app.keys.Space;
    if (desktopNozzle && (app.keys.ArrowLeft || app.keys.ArrowRight)) {
      desktopSweep = THREE.MathUtils.clamp(
        desktopSweep + dt * (app.keys.ArrowLeft ? -0.5 : 0.5),
        -0.5,
        0.5,
      );
      const target = workspace.localToWorld(V(desktopSweep, 0.48, -1.6));
      nozzle.lookAt(target);
      nozzle.rotateY(Math.PI);
    }
  }
  app.scene.updateMatrixWorld(true);
  if (pulling && !pinRemoved) {
    // Re-evaluate from the original grip offset instead of accumulating the
    // previous frame's constraint correction into the controller attachment.
    if (pin.userData.holder && pinGripOffset) {
      pin.position.copy(pinGripOffset);
      pin.updateWorldMatrix(true, false);
    }
    const local = body.worldToLocal(pin.getWorldPosition(V()));
    const slide = THREE.MathUtils.clamp(local.x - PIN_HOME[0], 0, 0.2);
    const p = body.localToWorld(
      V(PIN_HOME[0] + slide, PIN_HOME[1], PIN_HOME[2]),
    );
    pin.position.copy(pin.parent.worldToLocal(p));
    pin.quaternion.copy(
      pin.parent
        .getWorldQuaternion(new THREE.Quaternion())
        .invert()
        .multiply(body.getWorldQuaternion(new THREE.Quaternion())),
    );
    if (slide > 0.15) {
      pinRemoved = true;
      advance("pin");
    }
  }
  const anchor = body.localToWorld(V(...HOSE_ANCHOR));
  if (nozzle.userData.holder) {
    nozzle.position.copy(nozzle.userData.snapGrip);
    alignHeldToolToRay(
      nozzle,
      app.controllers[nozzle.userData.holder.userData.hand],
    );
  }
  let tip = nozzle.getWorldPosition(V());
  if (nozzleRemoved) {
    const delta = tip.clone().sub(anchor);
    if (delta.length() > 0.9) {
      tip = anchor.clone().add(delta.setLength(0.9));
      nozzle.position.copy(nozzle.parent.worldToLocal(tip.clone()));
    }
  }
  // The hose attaches at the rear; aiming and powder start at the open mouth.
  hose.update(
    anchor,
    nozzle.localToWorld(V(...NOZZLE_REAR)),
    V(1, 0, 0).applyQuaternion(body.getWorldQuaternion(new THREE.Quaternion())),
  );
  spareHose.update(
    wrong.localToWorld(V(...HOSE_ANCHOR)),
    spareNozzle.localToWorld(V(...NOZZLE_REAR)),
    V(1, 0, 0).applyQuaternion(
      wrong.getWorldQuaternion(new THREE.Quaternion()),
    ),
  );
  tip = nozzle.localToWorld(V(...NOZZLE_OUTLET));
  const dir = V(0, 0, -1)
    .applyQuaternion(nozzle.getWorldQuaternion(new THREE.Quaternion()))
    .normalize();
  const targets = bases
    .map((b) => workspace.localToWorld(b.clone()))
    .map((b, i) => ({
      i,
      d: new THREE.Ray(tip, dir).distanceToPoint(b),
      ahead: b.clone().sub(tip).dot(dir),
    }))
    .filter((x) => x.ahead > 0)
    .sort((a, b) => a.d - b.d);
  const target = targets[0];
  if (state.step === 4 && nozzleRemoved && target?.d < 0.15) {
    advance("aim");
  }
  if (!twoHands()) squeezing = false;
  leverPivot.rotation.z = squeezing ? -0.3 : 0;
  sprayLine.visible =
    state.mode === "guided" && !state.ended && nozzleRemoved && !squeezing;
  sprayLine.material.color.set(target?.d < 0.15 ? "#5de676" : "#6ab6e5");
  if (sprayLine.visible) {
    const end = tip.clone().addScaledVector(dir, 1.5);
    const ps = sprayLine.geometry.attributes.position;
    ps.setXYZ(0, ...tip.toArray());
    ps.setXYZ(1, ...end.toArray());
    ps.needsUpdate = true;
  }
  if (squeezing) {
    if (target?.d < 0.17) {
      const prev = state.step;
      state.spray(target.i, dt);
      if (state.step !== prev) {
        squeezing = false;
        refresh();
      }
    }
  }
  powder.update(dt, squeezing && !state.ended, tip, dir);
  flames.forEach((f, i) => {
    const remaining = 1 - state.coverage[i] / 1.2;
    f.visible = remaining > 0.01;
    f.scale.y = Math.max(0.01, remaining * (1 + 0.07 * Math.sin(t * 8 + i)));
  });
  const active =
    state.mode === "guided" && !state.ended
      ? [board, body, gauge, pin, nozzle, lever, nozzle, board][state.step]
      : null;
  focusOutline.visible = !!active;
  if (active) focusOutline.setFromObject(active);
  for (const o of [body, pin, nozzle])
    o.traverse((m) => {
      if (m.isMesh && m.material?.isMeshStandardMaterial)
        m.material.emissive.set(o === active ? "#483713" : "#000000");
    });
  if (t - lastHUD > 0.3) {
    lastHUD = t;
    if (t - app.noticeTime > 5) {
      document.querySelector("#notice").textContent = "";
      feedback.setText(state.message);
      feedback.visible = !!state.message;
    }
    app.metrics(
      state.mode === "guided"
        ? `Base coverage: ${state.coverage.map((n) => Math.round((n / 1.2) * 100) + "%").join(" / ")}\nMistakes: ${state.errors} · ${app.fps.toFixed(0)} fps`
        : `Mistakes: ${state.errors} · ${app.fps.toFixed(0)} fps`,
    );
  }
};
refresh();
app.inspect = () => ({
  step: state.step,
  errors: state.errors,
  coverage: state.coverage,
  complete: state.complete,
  failed: state.failed,
  mode: state.mode,
  twoHands: twoHands(),
  pinRemoved,
});
