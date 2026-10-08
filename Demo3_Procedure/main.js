import {
  App,
  THREE,
  V,
  material,
  box,
  cylinder,
  group,
  label,
  room,
} from "../Shared/runtime.js?v=controls-1.1";
import { Procedure, STEPS, HINTS } from "./procedure.js?v=response-3.0";
import {
  alarmSlide,
  baseTarget,
  SPRAY_RANGE,
} from "./mechanics.js?v=response-3.0";
import { card, raisedButton } from "./cards.js?v=response-3.0";
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
} from "./grips.js?v=response-3.0";
const app = new App(),
  state = new Procedure();
room(app, 10);
app.scene.background.set("#c4d6d8");
const workspace = group(app.scene, "Arm-reach training workspace");
function desktopView() {
  app.camera.position.set(0, 1.65, 0.75);
  app.camera.lookAt(0, 1.3, -1.3);
}
desktopView();
const bench = box(
  workspace,
  "Training bench",
  [2.7, 0.12, 0.65],
  [0, 0.72, -0.62],
  material("#526d79"),
);
for (const x of [-1.15, 1.15])
  box(
    workspace,
    "Bench leg",
    [0.1, 0.7, 0.5],
    [x, 0.35, -0.62],
    material("#455f67"),
  );
const board = group(workspace, "Guidance", [0, 1.9, -1.8]);
box(
  board,
  "Guidance card backing",
  [1.84, 0.68, 0.04],
  [0, -0.02, -0.03],
  material("#142f3c"),
);
card(board, "FIRE RESPONSE / GUIDED", [0, 0.23, 0], 1.5, 0.07, {
  color: "#76d6c6",
});
const instruction = card(board, "", [0, 0.1, 0], 1.7, 0.13),
  feedback = card(board, "", [0, -0.06, 0.01], 1.7, 0.11, {
    color: "#ffcf90",
    wrap: 68,
  });
const hintCard = card(board, "", [0, -0.54, 0.45], 1.84, 0.3, {
  color: "#d1ede8",
  accent: "#6acfc1",
  wrap: 65,
});
hintCard.visible = false;
const progressDots = [];
for (let i = 0; i < 7; i++) {
  const dot = new THREE.Mesh(
    new THREE.CircleGeometry(0.014, 16),
    new THREE.MeshBasicMaterial({ color: "#58707b" }),
  );
  dot.position.set((i - 3) * 0.07, 0.17, 0.014);
  board.add(dot);
  progressDots.push(dot);
}
raisedButton(app, board, "HINT", [-0.47, -0.22, 0], hint, 0.4, 0.1);
raisedButton(app, board, "RESET", [0, -0.22, 0], () => reset(), 0.4, 0.1);
raisedButton(
  app,
  board,
  "RECENTER",
  [0.47, -0.22, 0],
  centerWorkspace,
  0.4,
  0.1,
);
card(board, "USFA + OSHA / CLASSROOM SIMULATION", [0, -0.31, 0], 1.6, 0.045, {
  color: "#b1c9cc",
});
label(workspace, "EXIT · BEHIND YOU", [0, 2.1, 1], 2, 0.35).rotation.y =
  Math.PI;
// A physical downward slider activates the alarm. Grabbing alone does nothing.
const alarm = group(workspace, "Alarm station", [-0.64, 1.19, -0.36]);
box(
  alarm,
  "Alarm stand",
  [0.04, 0.29, 0.04],
  [0, -0.265, -0.025],
  material("#344e5a"),
);
box(
  alarm,
  "Alarm housing",
  [0.26, 0.35, 0.08],
  [0, 0.055, 0],
  material("#a53840"),
);
card(alarm, "FIRE ALARM", [0, 0.178, 0.046], 0.23, 0.055, {
  background: "#a53840",
});
card(alarm, "PULL DOWN", [0, -0.04, 0.046], 0.21, 0.04, {
  background: "#a53840",
});
const ALARM_HOME = [0, 0.09, 0.09];
const alarmHandle = group(alarm, "Alarm pull handle", ALARM_HOME);
box(
  alarmHandle,
  "Raised pull bar",
  [0.2, 0.03, 0.04],
  [0, 0, 0],
  material("#f3ddd1"),
);
alarmHandle.userData.grabZones = [{ center: [0, 0, 0], radius: 0.09 }];
alarmHandle.userData.grabEnabled = () => !state.ended && !state.alarmActive;
alarmHandle.userData.canGrab = () =>
  state.step === 0 || advance("alarm", { slide: 0 });
let alarmPulling = false,
  alarmGripOffset = null,
  alarmTravel = 0;
alarmHandle.userData.onGrab = () => {
  alarmPulling = true;
  alarmGripOffset = alarmHandle.position.clone();
};
alarmHandle.userData.onRelease = () => {
  alarmPulling = false;
  alarmGripOffset = null;
  alarm.attach(alarmHandle);
  alarmHandle.position.set(
    ALARM_HOME[0],
    ALARM_HOME[1] - (state.alarmActive ? 0.11 : 0),
    ALARM_HOME[2],
  );
  alarmHandle.quaternion.identity();
};
app.grabbables.push(alarmHandle);
const alarmLamp = new THREE.Mesh(
  new THREE.SphereGeometry(0.019, 12, 8),
  material("#552c32", { emissive: "#55141b", emissiveIntensity: 0 }),
);
alarmLamp.position.set(0.092, 0.123, 0.05);
alarm.add(alarmLamp);
const alarmStatus = card(alarm, "READY", [0, -0.092, 0.046], 0.2, 0.035, {
  background: "#a53840",
});
const callStation = group(
  workspace,
  "Simulated emergency call station",
  [0.7, 1.47, -0.44],
);
box(
  callStation,
  "Call station stand",
  [0.04, 0.57, 0.04],
  [0.13, -0.41, -0.025],
  material("#344e5a"),
);
box(
  callStation,
  "Call station housing",
  [0.33, 0.25, 0.055],
  [0, 0, 0],
  material("#203d4c"),
);
card(callStation, "SIMULATED CALL", [0, 0.075, 0.03], 0.3, 0.045, {
  color: "#b9d6dd",
});
const callButton = raisedButton(
  app,
  callStation,
  "CALL HELP",
  [0, 0.005, 0.045],
  () => {
    callPressedUntil = app.elapsed + 0.18;
    advance("call");
  },
  0.27,
  0.08,
);
let callPressedUntil = 0;
const callStatus = card(
  callStation,
  "NO REAL CALL",
  [0, -0.078, 0.03],
  0.3,
  0.04,
  { color: "#b9d6dd" },
);

function extinguisher(name, position, color, pressure = "green") {
  const g = group(workspace, name, position);
  g.userData.type = name === "WATER" ? "WATER" : "ABC";
  g.userData.pressure = pressure;
  g.userData.home = position;
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
  card(
    g,
    name === "WATER" ? "WATER\nCLASS A" : "ABC\nDRY CHEMICAL",
    [0, 0.23, 0.1],
    0.155,
    0.14,
    { background: "#f4f1e8", color: "#183b47" },
  );
  g.userData.snapGrip = V(...BODY_GRIP);
  g.userData.grabZones = BODY_ZONES;
  g.userData.grabEnabled = () => !state.ended;
  app.grabbables.push(g);
  return g;
}
const LOW_HOME = [0.59, 0.82, -0.5];
const body = extinguisher("ABC", BODY_HOME, "#b73a3c"),
  wrong = extinguisher("WATER", WATER_HOME, "#4076a0"),
  low = extinguisher("ABC", LOW_HOME, "#b73a3c", "low");
wrong.userData.onGrab = () => advance("wrong-part");
wrong.userData.action = () => advance("wrong-part");
wrong.userData.onRelease = () => {
  workspace.attach(wrong);
  wrong.position.set(...WATER_HOME);
  wrong.quaternion.identity();
};
app.interactables.push(wrong);
// Pickup is deliberately not a state transition.
body.userData.onGrab = () => {};
low.userData.onRelease = () => {
  workspace.attach(low);
  low.position.set(...LOW_HOME);
  low.quaternion.identity();
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
function tankHeld(tank) {
  return app.renderer.xr.isPresenting
    ? !!tank.userData.holder
    : !!tank.userData.desktopHeld ||
        (tank === body && desktopBody) ||
        (tank === low && desktopLow);
}
function checkTank(tank) {
  return advance("ready", {
    held: tankHeld(tank),
    type: tank.userData.type,
    pressure: tank.userData.pressure,
  });
}
function addGauge(tank) {
  const gauge = label(tank, "", [0.04, 0.43, 0.09], 0.11, 0.095);
  gauge.userData.action = () => checkTank(tank);
  app.interactables.push(gauge);
  const button = makePressureButton(tank, () => checkTank(tank));
  app.interactables.push(button);
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
  gc.lineTo(
    tank.userData.pressure === "green" ? 128 : 46,
    tank.userData.pressure === "green" ? 50 : 126,
  );
  gc.stroke();
  gc.font = "bold 26px system-ui";
  gc.textAlign = "center";
  gc.fillStyle = "#143b45";
  gc.fillText("PRESSURE", 128, 208);
  gauge.material.map.dispose();
  gauge.material.map = new THREE.CanvasTexture(gaugeCanvas);
  gauge.material.map.colorSpace = THREE.SRGBColorSpace;
  gauge.material.needsUpdate = true;
  return { gauge, button };
}
const gauges = [body, wrong, low].map(addGauge);
const gauge = gauges[0].gauge;
const leverPivot = group(body, "Constrained hinge", [0.075, 0.55, 0]);
leverPivot.rotation.z = -0.3; // Open above the carrying handle; squeeze closes down.
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
pin.userData.grabEnabled = () => !state.ended && state.step >= 3;
pin.userData.canGrab = () => {
  if (pinRemoved) return true;
  if (state.step !== 3) {
    advance("pin");
    return false;
  }
  if (!tankHeld(body)) {
    advance("pin", { slide: 0, tankHeld: false });
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
const lowNozzle = makeNozzle(low);
lowNozzle.position.set(...NOZZLE_HOME);
lowNozzle.quaternion.copy(holsterRotation);
for (const tank of [body, wrong, low]) {
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
  desktopLow = false,
  desktopNozzle = false,
  desktopSweep = 0;
nozzle.userData.grabEnabled = () => !state.ended && state.step >= 4;
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
  lowHose = new RubberHose(app.scene),
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
const equipment = box(
  workspace,
  "Energized equipment housing",
  [1.12, 0.38, 0.2],
  [0, 0.67, -1.82],
  material("#273c48"),
);
for (const x of [-0.49, 0.49])
  box(
    workspace,
    "Equipment sign support",
    [0.015, 0.59, 0.015],
    [x, 1.14, -1.64],
    material("#526573"),
  );
card(workspace, "LIVE ELECTRICAL FIRE", [0, 1.45, -1.6], 1.05, 0.065, {
  background: "#273c48",
  color: "#ffdb7f",
});
for (const x of [-0.32, 0, 0.32]) {
  box(
    workspace,
    "Electrical panel",
    [0.27, 0.19, 0.02],
    [x, 0.65, -1.705],
    material("#526573"),
  );
  card(workspace, "⚡", [x, 0.69, -1.688], 0.07, 0.07, {
    background: "#526573",
    color: "#ffdb7f",
  });
}
for (let i = 0; i < 3; i++) {
  const x = (i - 1) * 0.32;
  box(
    workspace,
    "Electrical fire base",
    [0.31, 0.08, 0.3],
    [x, 0.39, -1.6],
    material("#293a43"),
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
  const result = state.event(action, ctx);
  document.querySelector("#notice").textContent = "";
  refresh();
  return result;
}
function hint() {
  const message =
    HINTS[state.step] ||
    "Watch for re-ignition and back away safely. Reset for another attempt.";
  hintCard.setText(message);
  hintCard.visible = !hintCard.visible;
  document.querySelector("#notice").textContent = hintCard.visible
    ? message
    : "";
}
function refresh() {
  hintCard.visible = false;
  const text = state.complete
    ? "COMPLETE · FIRE OUT"
    : `${state.step + 1}/7 · ${STEPS[state.step]}`;
  app.status(text);
  instruction.setText(text);
  feedback.setText(state.message);
  feedback.visible = !!state.message;
  gauges.forEach(({ button }) => {
    button.visible = !state.ended && state.step === 2;
  });
  progressDots.forEach((dot, i) =>
    dot.material.color.set(
      i < state.step ? "#6bd4b5" : i === state.step ? "#ffca71" : "#58707b",
    ),
  );
  alarmStatus.setText(state.alarmActive ? "ALARM ACTIVE" : "READY");
  callStatus.setText(state.helpCalled ? "HELP NOTIFIED / SIM" : "NO REAL CALL");
  callButton.setText(state.helpCalled ? "CALL SENT" : "CALL HELP");
  for (const button of document.querySelectorAll("#step-controls button")) {
    button.hidden =
      state.ended ||
      !button.dataset.steps.split(",").includes(String(state.step));
  }
  document.querySelector("#step-controls").hidden = state.ended;
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
      if (
        !advance("squeeze", {
          twoHands: twoHands(),
          atBase: !!nozzleTarget(0.15),
        })
      )
        return;
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
// The valve is on the tank. Triggering the aiming hand cannot squeeze it.
nozzle.userData.use = (down) => {
  if (down && !state.ended)
    app.notify(
      "Squeeze with the TANK hand's index trigger. The nozzle hand only aims.",
    );
};
function nozzleTarget(tolerance = 0.17) {
  app.scene.updateMatrixWorld(true);
  const tip = nozzle.localToWorld(V(...NOZZLE_OUTLET));
  const direction = V(0, 0, -1)
    .applyQuaternion(nozzle.getWorldQuaternion(new THREE.Quaternion()))
    .normalize();
  return sprayTarget(tip, direction, tolerance);
}
const sprayRaycaster = new THREE.Raycaster();
function sprayTarget(tip, direction, tolerance = 0.17) {
  sprayRaycaster.set(tip, direction);
  sprayRaycaster.far = SPRAY_RANGE;
  const obstacle = sprayRaycaster.intersectObjects(
    [bench, equipment],
    false,
  )[0];
  return baseTarget(
    tip,
    direction,
    bases.map((b) => workspace.localToWorld(b.clone())),
    tolerance,
    obstacle?.distance ?? Infinity,
  );
}
function reset() {
  app.pointerUp();
  for (let i = 0; i < 2; i++) app.release(i);
  state.reset();
  document.querySelector("#notice").textContent = "";
  pulling =
    pinRemoved =
    nozzleRemoved =
    squeezing =
    desktopBody =
    desktopLow =
    desktopNozzle =
      false;
  alarmTravel = 0;
  alarmHandle.userData.onRelease();
  callPressedUntil = 0;
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
  leverPivot.rotation.z = -0.3;
  wrong.userData.onRelease();
  low.userData.onRelease();
  flames.forEach((f) => {
    f.visible = true;
    f.scale.y = 1;
  });
  refresh();
}
function desktopHoldBody() {
  if (state.ended) return;
  desktopLow = false;
  low.userData.onRelease();
  desktopBody = !desktopBody;
  if (desktopBody) {
    body.position.set(-0.3, 0.85, -0.5);
    body.userData.onGrab();
  } else body.userData.onRelease();
}
function desktopHoldLow() {
  if (state.ended) return;
  desktopBody = false;
  body.userData.onRelease();
  desktopLow = !desktopLow;
  if (!desktopLow) low.userData.onRelease();
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
    app.notify("Hold the nozzle first.");
    return;
  }
  nozzle.lookAt(workspace.localToWorld(bases[1].clone()));
  nozzle.rotateY(Math.PI);
  advance("aim", { nozzleHeld: true, atBase: !!nozzleTarget(0.15) });
}
for (const [id, fn] of [
  ["hint", hint],
  ["reset", () => reset()],
  [
    "alarm",
    () => {
      if (advance("alarm", { slide: 0.11 })) {
        alarmTravel = 0.11;
        alarmHandle.userData.onRelease();
      }
    },
  ],
  ["call", () => callButton.userData.action()],
  ["body", desktopHoldBody],
  ["low", desktopHoldLow],
  ["water", () => advance("wrong-part")],
  ["pressure", () => checkTank(tankHeld(low) ? low : body)],
  ["nozzle", desktopHoldNozzle],
  [
    "pin",
    () => {
      if (advance("pin", { slide: 0.2, tankHeld: tankHeld(body) })) {
        pinRemoved = true;
        workspace.attach(pin);
        pin.position.set(...TRAY_HOME);
      }
    },
  ],
  ["aim-nozzle", desktopAim],
]) {
  document.querySelector("#" + id).onclick = fn;
}
const sprayButton = document.querySelector("#spray");
sprayButton.onclick = () => use(!squeezing);
function nextSweep() {
  if (!desktopNozzle) return;
  desktopSweep = desktopSweep === 0 ? -0.32 : desktopSweep < 0 ? 0.32 : 0;
  nozzle.lookAt(workspace.localToWorld(V(desktopSweep, 0.48, -1.6)));
  nozzle.rotateY(Math.PI);
}
document.querySelector("#sweep").onclick = nextSweep;
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
  desktopBody = desktopLow = desktopNozzle = squeezing = false;
  workspace.position.set(head.x, head.y - 1.6, head.z);
  workspace.rotation.y = Math.atan2(-forward.x, -forward.z);
  workspace.updateMatrixWorld(true);
  app.notify("Bench centered.");
  return true;
}
app.onXR = (active) => {
  app.pointerUp();
  desktopBody = desktopLow = desktopNozzle = squeezing = false;
  recenterPending = active;
  lastX = false;
  if (!active) {
    workspace.position.set(0, 0, 0);
    workspace.rotation.set(0, 0, 0);
    desktopView();
  }
};
app.onNotice = (message) => {
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
  if (alarmPulling) {
    if (!state.alarmActive && alarmHandle.userData.holder && alarmGripOffset) {
      alarmHandle.position.copy(alarmGripOffset);
      alarmHandle.updateWorldMatrix(true, false);
    }
    alarmTravel = state.alarmActive
      ? 0.11
      : alarmSlide(alarm, alarmHandle.getWorldPosition(V()), ALARM_HOME[1]);
    const point = alarm.localToWorld(
      V(ALARM_HOME[0], ALARM_HOME[1] - alarmTravel, ALARM_HOME[2]),
    );
    alarmHandle.position.copy(alarmHandle.parent.worldToLocal(point));
    alarmHandle.quaternion.copy(
      alarmHandle.parent
        .getWorldQuaternion(new THREE.Quaternion())
        .invert()
        .multiply(alarm.getWorldQuaternion(new THREE.Quaternion())),
    );
    if (!state.alarmActive && alarmTravel >= 0.09)
      advance("alarm", { slide: alarmTravel });
  }
  alarmLamp.material.emissiveIntensity = state.alarmActive
    ? 0.6 + 0.5 * Math.sin(t * 5)
    : 0;
  callButton.position.z = app.elapsed < callPressedUntil ? 0.037 : 0.045;
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
      if (advance("pin", { slide, tankHeld: tankHeld(body) }))
        pinRemoved = true;
      else {
        // If the tank hand was released mid-pull, do not latch the pin or spam
        // one error every animation frame. A new deliberate grip can retry.
        pulling = false;
      }
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
  lowHose.update(
    low.localToWorld(V(...HOSE_ANCHOR)),
    lowNozzle.localToWorld(V(...NOZZLE_REAR)),
    V(1, 0, 0).applyQuaternion(low.getWorldQuaternion(new THREE.Quaternion())),
  );
  tip = nozzle.localToWorld(V(...NOZZLE_OUTLET));
  const dir = V(0, 0, -1)
    .applyQuaternion(nozzle.getWorldQuaternion(new THREE.Quaternion()))
    .normalize();
  const target = sprayTarget(tip, dir);
  if (state.step === 4 && nozzleRemoved && target?.distance < 0.15) {
    advance("aim", { nozzleHeld: true, atBase: true });
  }
  if (!twoHands()) squeezing = false;
  leverPivot.rotation.z = squeezing ? 0 : -0.3;
  sprayLine.visible = !state.ended && nozzleRemoved && !squeezing;
  sprayLine.material.color.set(target?.distance < 0.15 ? "#5de676" : "#6ab6e5");
  if (sprayLine.visible) {
    const end = tip.clone().addScaledVector(dir, SPRAY_RANGE);
    const ps = sprayLine.geometry.attributes.position;
    ps.setXYZ(0, ...tip.toArray());
    ps.setXYZ(1, ...end.toArray());
    ps.needsUpdate = true;
  }
  if (squeezing) {
    if (target) {
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
  const active = !state.ended
    ? [alarmHandle, callButton, gauge, pin, nozzle, lever, nozzle][state.step]
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
      `Base coverage: ${state.coverage.map((n) => Math.round((n / 1.2) * 100) + "%").join(" / ")}\nMistakes: ${state.errors} · ${app.fps.toFixed(0)} fps`,
    );
  }
};
refresh();
app.inspect = () => ({
  step: state.step,
  errors: state.errors,
  coverage: state.coverage,
  complete: state.complete,
  twoHands: twoHands(),
  pinRemoved,
  alarmActive: state.alarmActive,
  helpCalled: state.helpCalled,
  toolReady: state.toolReady,
  alarmTravel,
});
