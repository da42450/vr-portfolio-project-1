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
} from "../Shared/runtime.js";
import { Procedure, STEPS } from "./procedure.js";
const app = new App(),
  state = new Procedure();
room(app, 10);
app.camera.lookAt(0, 1, -2.2);
box(
  app.scene,
  "Training bench",
  [2.7, 0.12, 0.65],
  [0, 0.72, -0.85],
  material("#829a98"),
);
for (const x of [-1.15, 1.15])
  box(
    app.scene,
    "Bench leg",
    [0.1, 0.7, 0.5],
    [x, 0.35, -0.85],
    material("#455f67"),
  );
const board = group(app.scene, "Guidance", [0, 1.75, -2.25]);
const instruction = label(board, "", [0, 0.3, 0], 2.5, 0.5),
  feedback = label(board, "", [0, -0.04, 0.01], 2.5, 0.22);
panelButton(
  app,
  board,
  "CONFIRM SAFETY",
  [-0.8, -0.32, 0],
  () => advance("safety"),
  0.72,
);
panelButton(app, board, "HINT", [0, -0.32, 0], hint, 0.65);
panelButton(app, board, "RESET", [0.8, -0.32, 0], reset, 0.65);
panelButton(
  app,
  board,
  "VERIFY FIRE OUT",
  [0, -0.55, 0],
  () => advance("verify"),
  1.3,
);
label(app.scene, "EXIT · BEHIND YOU", [0, 2.1, 1], 2, 0.35).rotation.y =
  Math.PI;
label(
  app.scene,
  "CLASSROOM SIMULATION · PASS / USFA",
  [0, 2.6, -2.26],
  2.5,
  0.2,
);
function extinguisher(name, x, color) {
  const g = group(app.scene, name, [x, 0.82, -0.8]);
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
  g.userData.snapGrip = V(0, -0.43, -0.05);
  app.grabbables.push(g);
  return g;
}
const body = extinguisher("ABC", -0.38, "#b73a3c"),
  wrong = extinguisher("WATER", 0.58, "#4076a0");
wrong.userData.onGrab = () => advance("wrong-part");
wrong.userData.action = () => advance("wrong-part");
app.interactables.push(wrong);
body.userData.onGrab = () => {
  if (state.step === 1) advance("select");
  else if (state.step < 1) advance("select");
};
body.userData.onRelease = () => {
  if (!body.userData.holder) {
    body.position.set(-0.38, 0.82, -0.8);
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
const pin = group(body, "Slider pin", [0.03, 0.49, 0]);
const ring = new THREE.Mesh(
  new THREE.TorusGeometry(0.025, 0.005, 8, 16),
  material("#cddbe0", { metalness: 0.8 }),
);
ring.rotation.y = Math.PI / 2;
pin.add(ring);
const shaft = cylinder(
  pin,
  "Pin shaft",
  0.005,
  0.14,
  [-0.06, 0, 0],
  material("#ccd5d8"),
);
shaft.rotation.z = Math.PI / 2;
app.grabbables.push(pin);
let pulling = false,
  pinRemoved = false;
pin.userData.canGrab = () => {
  if (state.step !== 3) {
    advance("pin");
    return false;
  }
  return true;
};
pin.userData.onGrab = () => {
  pulling = true;
};
pin.userData.onRelease = () => {
  pulling = false;
  if (pinRemoved) {
    pin.position.set(-0.82, 0.84, -0.72);
    pin.quaternion.identity();
  } else {
    body.attach(pin);
    pin.position.set(0.03, 0.49, 0);
    pin.quaternion.identity();
  }
};
box(
  app.scene,
  "Pin snap tray",
  [0.3, 0.035, 0.22],
  [-0.82, 0.81, -0.72],
  material("#ddb85b"),
);
const nozzle = group(body, "Hose nozzle", [0.15, 0.18, 0.06]);
nozzle.userData.snapGrip = V(0, 0, -0.04);
const nozzleMesh = cylinder(
  nozzle,
  "Nozzle grip",
  0.025,
  0.15,
  [0, 0, 0],
  material("#283c46"),
);
nozzleMesh.rotation.x = Math.PI / 2;
app.grabbables.push(nozzle);
let nozzleRemoved = false,
  squeezing = false,
  aimed = false,
  desktopBody = false,
  desktopNozzle = false,
  desktopSweep = 0;
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
    body.attach(nozzle);
    nozzle.position.set(0.15, 0.18, 0.06);
    nozzle.quaternion.identity();
    nozzleRemoved = false;
    squeezing = false;
  }
};
const hose = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([V(), V()]),
  new THREE.LineBasicMaterial({ color: "#253b42" }),
);
app.scene.add(hose);
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
    app.scene,
    "Fuel tray",
    [0.31, 0.08, 0.3],
    [x, 0.39, -1.75],
    material("#533d31"),
  );
  const f = new THREE.Mesh(
    new THREE.ConeGeometry(0.14, 0.45, 8),
    material("#f39b30", { emissive: "#b44c13", emissiveIntensity: 1 }),
  );
  f.position.set(x, 0.65, -1.75);
  app.scene.add(f);
  flames.push(f);
  bases.push(V(x, 0.48, -1.75));
  label(app.scene, String(i + 1), [x, 0.33, -1.57], 0.16, 0.1);
}
function advance(action, ctx) {
  const result = state.event(action, ctx);
  refresh();
  return result;
}
function hint() {
  app.notify(STEPS[state.step] || "Complete. Reset to practice again.");
  feedback.setText(
    "HINT: " + (STEPS[state.step] || "Reset for another attempt."),
  );
}
function refresh() {
  app.status(
    state.complete
      ? "Complete"
      : `Step ${state.step + 1} / 8: ${STEPS[state.step]}`,
  );
  instruction.setText(
    state.complete
      ? "COMPLETE · reset to practice"
      : `STEP ${state.step + 1} / 8\n${STEPS[state.step]}`,
  );
  feedback.setText(state.message);
}
function twoHands() {
  const bh = body.userData.holder?.userData.hand,
    nh = nozzle.userData.holder?.userData.hand;
  return app.renderer.xr.isPresenting
    ? bh !== undefined && nh !== undefined && bh !== nh
    : desktopBody && desktopNozzle;
}
function use(down) {
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
function reset() {
  for (let i = 0; i < 2; i++) app.release(i);
  state.reset();
  pulling =
    pinRemoved =
    nozzleRemoved =
    squeezing =
    aimed =
    desktopBody =
    desktopNozzle =
      false;
  desktopSweep = 0;
  app.scene.attach(body);
  body.position.set(-0.38, 0.82, -0.8);
  body.quaternion.identity();
  body.attach(pin);
  pin.position.set(0.03, 0.49, 0);
  pin.quaternion.identity();
  body.attach(nozzle);
  nozzle.position.set(0.15, 0.18, 0.06);
  nozzle.quaternion.identity();
  leverPivot.rotation.z = 0;
  flames.forEach((f) => {
    f.visible = true;
    f.scale.y = 1;
  });
  refresh();
}
function desktopHoldBody() {
  if (state.step < 1) {
    advance("select");
    return;
  }
  desktopBody = !desktopBody;
  if (desktopBody) {
    body.position.set(-0.32, 0.85, -0.6);
    body.userData.onGrab();
  } else body.userData.onRelease();
}
function desktopHoldNozzle() {
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
  nozzle.lookAt(bases[1]);
  nozzle.rotateY(Math.PI);
  aimed = true;
  advance("aim");
}
for (const [id, fn] of [
  ["hint", hint],
  ["reset", reset],
  ["safety", () => advance("safety")],
  ["body", desktopHoldBody],
  ["pressure", () => advance("pressure")],
  ["nozzle", desktopHoldNozzle],
  [
    "pin",
    () => {
      if (advance("pin")) {
        pinRemoved = true;
        app.scene.attach(pin);
        pin.position.set(-0.82, 0.84, -0.72);
      }
    },
  ],
  ["aim-nozzle", desktopAim],
  ["verify", () => advance("verify")],
])
  document.querySelector("#" + id).onclick = fn;
const sprayButton = document.querySelector("#spray");
sprayButton.textContent = "Toggle spray [Space]";
sprayButton.onclick = () => use(!squeezing);
const sweepButton = document.createElement("button");
sweepButton.className = "secondary";
sweepButton.textContent = "Next sweep section [J]";
document.querySelector(".controls").appendChild(sweepButton);
function nextSweep() {
  if (!desktopNozzle) return;
  desktopSweep = desktopSweep === 0 ? -0.32 : desktopSweep < 0 ? 0.32 : 0;
  nozzle.lookAt(V(desktopSweep, 0.48, -1.75));
  nozzle.rotateY(Math.PI);
}
sweepButton.onclick = nextSweep;
app.onKey = (k) => {
  if (k === "KeyH") hint();
  if (k === "KeyR") reset();
  if (k === "KeyJ") nextSweep();
};
let lastHUD = 0,
  spaceDown = false;
const focusOutline = new THREE.BoxHelper(board, "#e8bd48");
app.scene.add(focusOutline);
app.update = (dt, t) => {
  if (!app.renderer.xr.isPresenting) {
    if (app.keys.Space && !spaceDown) use(!squeezing);
    spaceDown = !!app.keys.Space;
    if (desktopNozzle && (app.keys.ArrowLeft || app.keys.ArrowRight)) {
      desktopSweep = THREE.MathUtils.clamp(
        desktopSweep + dt * (app.keys.ArrowLeft ? -0.5 : 0.5),
        -0.5,
        0.5,
      );
      const target = V(desktopSweep, 0.48, -1.75);
      nozzle.lookAt(target);
      nozzle.rotateY(Math.PI);
    }
  }
  app.scene.updateMatrixWorld(true);
  if (pulling && !pinRemoved) {
    const local = body.worldToLocal(pin.getWorldPosition(V()));
    const slide = THREE.MathUtils.clamp(local.x - 0.03, 0, 0.2);
    const p = body.localToWorld(V(0.03 + slide, 0.49, 0));
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
  const anchor = body.localToWorld(V(0.07, 0.42, -0.01));
  let tip = nozzle.getWorldPosition(V());
  if (nozzleRemoved) {
    const delta = tip.clone().sub(anchor);
    if (delta.length() > 0.9) {
      tip = anchor.clone().add(delta.setLength(0.9));
      nozzle.position.copy(nozzle.parent.worldToLocal(tip.clone()));
    }
  }
  const positions = hose.geometry.attributes.position;
  positions.setXYZ(0, ...anchor.toArray());
  positions.setXYZ(1, ...tip.toArray());
  positions.needsUpdate = true;
  const dir = V(0, 0, -1)
    .applyQuaternion(nozzle.getWorldQuaternion(new THREE.Quaternion()))
    .normalize();
  const targets = bases
    .map((b, i) => ({
      i,
      d: new THREE.Ray(tip, dir).distanceToPoint(b),
      ahead: b.clone().sub(tip).dot(dir),
    }))
    .filter((x) => x.ahead > 0)
    .sort((a, b) => a.d - b.d);
  const target = targets[0];
  if (state.step === 4 && nozzleRemoved && target?.d < 0.15) {
    aimed = true;
    advance("aim");
  }
  if (!twoHands()) squeezing = false;
  leverPivot.rotation.z = squeezing ? -0.3 : 0;
  sprayLine.visible = squeezing;
  if (squeezing) {
    const end = tip.clone().addScaledVector(dir, 1.5);
    const ps = sprayLine.geometry.attributes.position;
    ps.setXYZ(0, ...tip.toArray());
    ps.setXYZ(1, ...end.toArray());
    ps.needsUpdate = true;
    if (target?.d < 0.17) {
      const prev = state.step;
      state.spray(target.i, dt);
      if (state.step !== prev) {
        squeezing = false;
        refresh();
      }
    }
  }
  flames.forEach((f, i) => {
    const remaining = 1 - state.coverage[i] / 1.2;
    f.visible = remaining > 0.01;
    f.scale.y = Math.max(0.01, remaining * (1 + 0.07 * Math.sin(t * 8 + i)));
  });
  const active = [board, body, gauge, pin, nozzle, lever, nozzle, board][
    state.step
  ];
  focusOutline.visible = !!active;
  if (active) focusOutline.setFromObject(active);
  for (const o of [body, pin, nozzle])
    o.traverse((m) => {
      if (m.isMesh && m.material?.isMeshStandardMaterial)
        m.material.emissive.set(o === active ? "#483713" : "#000000");
    });
  if (t - lastHUD > 0.3) {
    lastHUD = t;
    app.metrics(
      `Recoverable errors: ${state.errors}\nBase coverage: ${state.coverage.map((n) => Math.round((n / 1.2) * 100) + "%").join(" / ")}\nTwo hands: ${twoHands() ? "yes" : "no"} · ${app.fps.toFixed(0)} fps`,
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
});
