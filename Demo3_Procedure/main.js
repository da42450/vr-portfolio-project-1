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
import { Procedure, STEPS } from "./procedure.js";
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
app.camera.lookAt(0, 1, -2.2);
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
const board = group(workspace, "Guidance", [0, 1.75, -1.9]);
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
  [0.65, -0.55, 0],
  () => advance("verify"),
  1.15,
);
panelButton(
  app,
  board,
  "CHECK PRESSURE",
  [-0.65, -0.55, 0],
  () => advance("pressure"),
  1.15,
);
panelButton(
  app,
  board,
  "RECENTER BENCH [X]",
  [0, -0.77, 0],
  centerWorkspace,
  1.4,
);
const gripStatus = label(
  board,
  "Side GRIP at handle = hold. Release GRIP = place.",
  [0, -1, 0],
  2.5,
  0.24,
);
label(workspace, "EXIT · BEHIND YOU", [0, 2.1, 1], 2, 0.35).rotation.y =
  Math.PI;
label(
  workspace,
  "SIDE GRIP = HOLD · INDEX TRIGGER = SELECT / SPRAY\nLeft X recenters the bench in front of you.",
  [0, 2.52, -1.91],
  2.5,
  0.32,
);
label(
  workspace,
  "CLASSROOM SIMULATION · PASS / USFA",
  [0, 2.82, -1.91],
  2.5,
  0.16,
);
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
pin.userData.grabEnabled = () => state.step >= 3;
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
const nozzle = group(body, "Hose nozzle", [0.15, 0.18, 0.06]);
nozzle.userData.snapGrip = V(0, 0, -0.04);
nozzle.userData.grabZones = NOZZLE_ZONES;
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
nozzle.userData.grabEnabled = () => state.step >= 4;
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
  const result = state.event(action, ctx);
  if (
    result &&
    action === "safety" &&
    (body.userData.holder || body.userData.desktopHeld || desktopBody)
  )
    state.event("select");
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
  workspace.attach(body);
  body.position.set(...BODY_HOME);
  body.quaternion.identity();
  body.attach(pin);
  pin.position.set(...PIN_HOME);
  pin.quaternion.identity();
  body.attach(nozzle);
  nozzle.position.set(0.15, 0.18, 0.06);
  nozzle.quaternion.identity();
  leverPivot.rotation.z = 0;
  wrong.userData.onRelease();
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
    body.position.set(-0.3, 0.85, -0.5);
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
  nozzle.lookAt(workspace.localToWorld(bases[1].clone()));
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
        workspace.attach(pin);
        pin.position.set(...TRAY_HOME);
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
  nozzle.lookAt(workspace.localToWorld(V(desktopSweep, 0.48, -1.6)));
  nozzle.rotateY(Math.PI);
}
sweepButton.onclick = nextSweep;
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
  app.notify(
    "Bench centered within reach. Side GRIP holds; index trigger selects or sprays.",
  );
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
    app.camera.lookAt(0, 1, -2.2);
  }
};
app.onNotice = (message) => gripStatus.setText(message);
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
  const anchor = body.localToWorld(V(0.07, 0.42, -0.01));
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
  const positions = hose.geometry.attributes.position;
  positions.setXYZ(0, ...anchor.toArray());
  positions.setXYZ(1, ...tip.toArray());
  positions.needsUpdate = true;
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
    aimed = true;
    advance("aim");
  }
  if (!twoHands()) squeezing = false;
  leverPivot.rotation.z = squeezing ? -0.3 : 0;
  sprayLine.visible = nozzleRemoved;
  sprayLine.material.color.set(
    squeezing ? "#e9fbff" : target?.d < 0.15 ? "#5de676" : "#6ab6e5",
  );
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
    if (app.renderer.xr.isPresenting && t - app.noticeTime > 2) {
      const hands = ["left", "right"].map((side) => {
        const i = app.handIndex(side),
          held = app.hands[i].userData.held;
        const ready = !held && app.grabTarget(i)?.object;
        return `${side}: ${held ? "holding " + held.name : ready ? "GRIP to hold " + ready.name : "move to the highlighted part"}`;
      });
      gripStatus.setText(hands.join("\n"));
    }
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
