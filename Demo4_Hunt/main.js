import {
  App,
  THREE,
  V,
  material,
  box,
  group,
  label,
  panelButton,
  room,
} from "../Shared/runtime.js";
import { Hunt, TARGETS, validSettings } from "./hunt.js";
import { faceStartingAisle, turnAroundHead } from "./view.js";
const app = new App({ spawn: [0, 0, 4] }),
  hunt = new Hunt();
let settings;
try {
  settings = validSettings(
    JSON.parse(localStorage.getItem("warehouse-comfort-v1") || "{}"),
  );
} catch {
  settings = validSettings();
}
app.scene.fog = new THREE.Fog("#bdcfd3", 23, 55);
const floor = room(app, 54);
floor.position.z = -9;
const colliders = [];
const wallMat = material("#d5dfda"),
  rackMat = material("#556f76"),
  binMat = material("#bcb18d");
function obstacle(name, size, pos, mat = wallMat) {
  const m = box(app.scene, name, size, pos, mat);
  const b = new THREE.Box3().setFromObject(m);
  colliders.push(b);
  return m;
}
obstacle("West wall", [0.2, 3, 30], [-13.3, 1.5, -8.5]);
obstacle("East wall", [0.2, 3, 30], [13.3, 1.5, -8.5]);
obstacle("North wall", [26.6, 3, 0.2], [0, 1.5, -23.5]);
obstacle("South wall", [26.6, 3, 0.2], [0, 1.5, 6.5]);
for (const x of [-2.8, 2.8]) {
  obstacle("Aisle wall", [0.15, 2.4, 6.5], [x, 1.2, -5.25]);
  obstacle("Aisle wall", [0.15, 2.4, 11], [x, 1.2, -18]);
}
for (const x of [-11, -4.8, 4.8, 11])
  obstacle("Region divider", [4.3, 2.4, 0.15], [x, 1.2, -11]);
const regions = [
  { name: "A · RECEIVING", x: -7, z: -5, color: "#dcba69" },
  { name: "B · TOOLS", x: 7, z: -5, color: "#80b2b0" },
  { name: "C · PARTS", x: -7, z: -17, color: "#8b9cb4" },
  { name: "D · SHIPPING", x: 7, z: -17, color: "#bc9b85" },
];
const bins = [],
  codes = [
    "AX-104",
    "AX-140",
    "AX-014",
    "AX-114",
    "AX-105",
    "AX-204",
    "BX-280",
    "BX-208",
    "BX-028",
    "BX-218",
    "BX-209",
    "BX-308",
    "CX-360",
    "CX-036",
    "CX-306",
    "CX-316",
    "CX-307",
    "CX-406",
    "DX-421",
    "DX-142",
    "DX-412",
    "DX-413",
    "EX-501",
    "EX-510",
    "EX-511",
  ];
let count = 0;
regions.forEach((r, ri) => {
  label(app.scene, r.name, [r.x, 2.45, r.z - 3.8], 3, 0.5);
  box(
    app.scene,
    "Region stripe",
    [6, 0.01, 7.5],
    [r.x, 0.015, r.z],
    material(r.color),
  );
  for (let row = 0; row < 2; row++) {
    const z = r.z + row * 2.5 - 1.6;
    obstacle("Shelf", [5, 0.14, 0.65], [r.x, 0.74, z], rackMat);
    for (const x of [r.x - 2.3, r.x + 2.3])
      obstacle("Shelf upright", [0.09, 1.5, 0.7], [x, 0.75, z], rackMat);
    const n = ri === 3 && row === 1 ? 4 : 3;
    for (let j = 0; j < n; j++) {
      const code = codes[count++];
      const g = group(app.scene, code, [
        r.x + (j - (n - 1) / 2) * 1.05,
        0.97,
        z,
      ]);
      box(g, "Look-alike stock box", [0.64, 0.38, 0.45], [0, 0, 0], binMat);
      label(g, code, [0, 0, 0.23], 0.54, 0.16);
      bins.push(g);
      g.userData.action = () => collect(g, code);
      app.interactables.push(g);
    }
  }
});
label(app.scene, "NORTH ↑ · C PARTS / D SHIPPING", [0, 2.65, -11.5], 4, 0.45);
label(app.scene, "A RECEIVING ←   → B TOOLS", [0, 2.4, -2], 4, 0.4);
label(
  app.scene,
  "DISPATCH · START / SETTINGS",
  [0, 2.5, 6.3],
  4,
  0.4,
).rotation.y = Math.PI;
const landmark = box(
  app.scene,
  "Dispatch landmark",
  [1.1, 1.4, 0.6],
  [-1, 0.7, 4],
  material("#d39e46"),
);
landmark.userData.action = () => toggleMenu();
app.interactables.push(landmark);
const progress = label(app.scene, "", [-1.8, 1.75, 2.6], 2.2, 0.5);
// Wrist checklist stays readable without hiding the world.
const wrist = label(app.hands[0], "", [0, 0.11, -0.18], 0.28, 0.2);
wrist.rotation.x = -0.7;
const menu = group(app.scene, "In-world comfort settings");
menu.visible = false;
const menuRows = {};
label(menu, "COMFORT SETTINGS", [0, 0.65, 0.01], 1.5, 0.23);
function menuRow(id, y, fn) {
  menuRows[id] = panelButton(app, menu, "", [0, y, 0.02], fn, 1.5);
}
menuRow("locomotion", 0.37, () =>
  change({
    locomotion: settings.locomotion === "smooth" ? "teleport" : "smooth",
  }),
);
menuRow("turn", 0.16, () =>
  change({ turn: settings.turn === "snap" ? "smooth" : "snap" }),
);
menuRow("speed", -0.05, () =>
  change({ speed: settings.speed >= 3 ? 0.5 : settings.speed + 0.5 }),
);
menuRow("seated", -0.26, () => change({ seated: !settings.seated }));
menuRow("vignette", -0.47, () => change({ vignette: !settings.vignette }));
panelButton(
  app,
  menu,
  "CALIBRATE HEIGHT",
  [-0.42, -0.68, 0.02],
  calibrate,
  0.75,
);
panelButton(app, menu, "RESET VIEW", [0.42, -0.68, 0.02], resetView, 0.75);
panelButton(app, menu, "CLOSE", [0, -0.89, 0.02], () => toggleMenu(false), 1.5);
panelButton(
  app,
  menu,
  "NEW HUNT",
  [0, -1.1, 0.02],
  () => {
    reset();
    toggleMenu(false);
  },
  1.5,
);
let heightOffset = 0,
  teleport = null,
  turnLatch = false,
  lastX = false,
  teleportPoint = null,
  lastHUD = 0,
  pathLength = 0;
const arcPoints = Array.from({ length: 30 }, () => V());
const arc = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints(arcPoints),
  new THREE.LineBasicMaterial({ color: "#f4c55c" }),
);
app.scene.add(arc);
arc.visible = false;
const marker = new THREE.Mesh(
  new THREE.RingGeometry(0.18, 0.25, 24),
  new THREE.MeshBasicMaterial({ color: "#f4c55c", side: THREE.DoubleSide }),
);
marker.rotation.x = -Math.PI / 2;
app.scene.add(marker);
marker.visible = false;
function updateMenu() {
  for (const id of ["locomotion", "turn", "speed", "seated", "vignette"]) {
    const el = document.querySelector("#" + id);
    if (el.type === "checkbox") el.checked = settings[id];
    else el.value = settings[id];
  }
  menuRows.locomotion.setText("MOVEMENT: " + settings.locomotion.toUpperCase());
  menuRows.turn.setText("TURN: " + settings.turn.toUpperCase());
  menuRows.speed.setText(`SPEED: ${settings.speed.toFixed(2)} m/s`);
  menuRows.seated.setText("SEATED: " + (settings.seated ? "ON" : "OFF"));
  menuRows.vignette.setText("VIGNETTE: " + (settings.vignette ? "ON" : "OFF"));
  app.status(
    `${hunt.found.size} / 5 found · ${settings.locomotion} · ${settings.turn} turn`,
  );
}
function change(patch) {
  settings = validSettings({ ...settings, ...patch });
  localStorage.setItem("warehouse-comfort-v1", JSON.stringify(settings));
  if ("seated" in patch) calibrate();
  updateMenu();
}
function calibrate() {
  if (app.renderer.xr.isPresenting) {
    const head = app.camera.getWorldPosition(V());
    heightOffset = settings.seated ? 1.6 - (head.y - app.rig.position.y) : 0;
    app.rig.position.y = heightOffset;
  } else {
    heightOffset = 0;
    app.camera.position.y = 1.6;
  }
  app.notify("Eye height calibrated for the current posture.");
}
app.onXR = (active) => {
  if (active && settings.seated) calibrate();
  else if (!active) app.rig.position.y = 0;
};
function resetView() {
  if (!faceStartingAisle(app.rig, app.camera)) {
    app.notify("Look forward rather than straight up/down, then Reset View.");
    return;
  }
  // View reset is not height calibration or New Hunt. Cancel pending travel
  // and close the old menu so the corrected heading is immediately visible.
  teleport = null;
  teleportPoint = null;
  app.fade = app.vignette = 0;
  turnLatch = true;
  toggleMenu(false);
  app.notify(
    "View reset: facing the starting aisle. Height and progress kept.",
  );
}
function toggleMenu(force) {
  menu.visible = force ?? !menu.visible;
  if (app.renderer.xr.isPresenting) {
    const head = app.camera.getWorldPosition(V()),
      dir = app.camera.getWorldDirection(V());
    dir.y = 0;
    dir.normalize();
    menu.position.copy(head.addScaledVector(dir, 1.5));
    menu.lookAt(app.camera.getWorldPosition(V()));
  } else document.querySelector("#settings").hidden = !menu.visible;
  updateMenu();
}
function isFree(p) {
  if (p.x < -12.9 || p.x > 12.9 || p.z < -23.1 || p.z > 6.1) return false;
  return !colliders.some(
    (b) =>
      p.x > b.min.x - 0.22 &&
      p.x < b.max.x + 0.22 &&
      p.z > b.min.z - 0.22 &&
      p.z < b.max.z + 0.22,
  );
}
function move(dx, dz) {
  const old = app.rig.position.clone(),
    p = app.rig.position.clone();
  p.x += dx;
  if (isFree(p)) app.rig.position.x = p.x;
  p.copy(app.rig.position);
  p.z += dz;
  if (isFree(p)) app.rig.position.z = p.z;
  const distance = old.distanceTo(app.rig.position);
  if (distance > 0.00001) {
    hunt.started = true;
    pathLength += distance;
  }
  return distance > 0;
}
function startTeleport(point) {
  if (teleport || !isFree(point)) return;
  teleport = { point: point.clone(), t: 0, moved: false };
  hunt.started = true;
}
floor.userData.action = (_, hit) => {
  if (settings.locomotion === "teleport" && !menu.visible) {
    const p = hit.point.clone();
    p.y = heightOffset;
    startTeleport(p);
  }
};
app.interactables.push(floor);
function collect(g, code) {
  if (menu.visible) return;
  const head = app.camera.getWorldPosition(V());
  if (head.distanceTo(g.position) > 2) {
    app.notify("Move within 2 metres to read and collect this item.");
    return;
  }
  const wasFound = hunt.found.has(code);
  const msg = hunt.select(code);
  app.notify(msg);
  if (!wasFound && hunt.found.has(code)) {
    g.children[0].material = material("#69aa81");
    g.userData.collected = true;
  }
  updateMenu();
}
document.querySelector("#menu").onclick = () => toggleMenu();
document.querySelector("#mode").onclick = () =>
  change({
    locomotion: settings.locomotion === "teleport" ? "smooth" : "teleport",
  });
document.querySelector("#reset").onclick = reset;
document.querySelector("#calibrate").onclick = calibrate;
document.querySelector("#recenter").onclick = resetView;
for (const id of ["locomotion", "turn", "speed", "seated", "vignette"])
  document.querySelector("#" + id).onchange = (e) =>
    change({
      [id]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
function reset() {
  hunt.reset();
  pathLength = 0;
  app.rig.position.set(0, heightOffset, 4);
  app.rig.rotation.y = 0;
  bins.forEach((g) => {
    g.children[0].material = binMat;
    g.userData.collected = false;
  });
  updateMenu();
}
app.onKey = (k) => {
  if (k === "KeyM") toggleMenu();
  if (k === "KeyL")
    change({
      locomotion: settings.locomotion === "teleport" ? "smooth" : "teleport",
    });
  if (k === "KeyR") reset();
  if (settings.turn === "snap" && (k === "KeyQ" || k === "KeyE"))
    turn(k === "KeyQ" ? Math.PI / 6 : -Math.PI / 6);
};
function turn(angle) {
  turnAroundHead(app.rig, app.camera, angle);
}
const defaultSelect = app.select.bind(app);
app.select = (i) => {
  if (
    i === app.handIndex("left") &&
    settings.locomotion === "teleport" &&
    teleportPoint &&
    !menu.visible
  )
    startTeleport(teleportPoint);
  else defaultSelect(i);
};
function updateArc() {
  teleportPoint = null;
  if (
    settings.locomotion !== "teleport" ||
    menu.visible ||
    !app.renderer.xr.isPresenting
  ) {
    arc.visible = marker.visible = false;
    return;
  }
  const origin = app.controllers[app.handIndex("left")].getWorldPosition(V());
  const dir = V(0, 0, -1).applyQuaternion(
    app.controllers[app.handIndex("left")].getWorldQuaternion(
      new THREE.Quaternion(),
    ),
  );
  const velocity = dir.multiplyScalar(6);
  let blocked = false;
  for (let i = 0; i < 30; i++) {
    const t = i * 0.07;
    const p = origin.clone().addScaledVector(velocity, t);
    p.y -= 4.9 * t * t;
    if (!blocked && colliders.some((b) => b.containsPoint(p))) {
      blocked = true;
    }
    if (p.y <= 0.03 && !blocked) {
      p.y = 0.03;
      if (isFree(p)) {
        teleportPoint = p.clone();
        teleportPoint.y = heightOffset;
      }
      blocked = true;
    }
    if (blocked && i > 0) p.copy(arcPoints[i - 1]);
    arcPoints[i].copy(p);
  }
  arc.geometry.setFromPoints(arcPoints);
  arc.visible = true;
  marker.visible = !!teleportPoint;
  if (teleportPoint)
    marker.position.set(teleportPoint.x, 0.025, teleportPoint.z);
}
app.update = (dt, t) => {
  hunt.tick(dt);
  let moving = false;
  const [lx, ly] = app.renderer.xr.isPresenting
    ? app.axes(app.handIndex("left"))
    : [
        (app.keys.KeyD ? 1 : 0) - (app.keys.KeyA ? 1 : 0),
        (app.keys.KeyS ? 1 : 0) - (app.keys.KeyW ? 1 : 0),
      ];
  const [rx] = app.axes(app.handIndex("right"));
  const buttons =
    app.controllers[app.handIndex("left")].userData.inputSource?.gamepad
      ?.buttons;
  const leftHand = app.hands[app.handIndex("left")];
  if (wrist.parent !== leftHand) leftHand.add(wrist);
  wrist.visible = app.renderer.xr.isPresenting;
  const x = !!buttons?.[4]?.pressed;
  if (x && !lastX) toggleMenu();
  lastX = x;
  if (!menu.visible && !teleport) {
    if (settings.locomotion === "smooth" && Math.hypot(lx, ly) > 0.15) {
      const forward = app.camera.getWorldDirection(V());
      forward.y = 0;
      forward.normalize();
      const right = V(-forward.z, 0, forward.x);
      const velocity = right.multiplyScalar(lx).addScaledVector(forward, -ly);
      if (velocity.length() > 1) velocity.normalize();
      moving = move(
        velocity.x * settings.speed * dt,
        velocity.z * settings.speed * dt,
      );
    }
    if (settings.turn === "snap") {
      if (Math.abs(rx) > 0.65 && !turnLatch) {
        turn(rx > 0 ? -Math.PI / 6 : Math.PI / 6);
        turnLatch = true;
      }
      if (Math.abs(rx) < 0.25) turnLatch = false;
    } else {
      const axis = app.renderer.xr.isPresenting
        ? rx
        : (app.keys.KeyE ? 1 : 0) - (app.keys.KeyQ ? 1 : 0);
      if (Math.abs(axis) > 0.15) {
        turn(((-axis * Math.PI) / 3) * dt);
        moving = true;
      }
    }
  }
  app.vignette = THREE.MathUtils.lerp(
    app.vignette,
    settings.vignette && moving ? 0.82 : 0,
    Math.min(1, dt * 10),
  );
  if (teleport) {
    teleport.t += dt;
    app.fade =
      teleport.t < 0.12
        ? teleport.t / 0.12
        : Math.max(0, 1 - (teleport.t - 0.12) / 0.15);
    if (teleport.t >= 0.12 && !teleport.moved) {
      const head = app.camera.getWorldPosition(V());
      pathLength += V(head.x, 0, head.z).distanceTo(
        V(teleport.point.x, 0, teleport.point.z),
      );
      app.rig.position.x += teleport.point.x - head.x;
      app.rig.position.z += teleport.point.z - head.z;
      teleport.moved = true;
    }
    if (teleport.t >= 0.27) {
      teleport = null;
      app.fade = 0;
    }
  }
  updateArc();
  if (t - lastHUD > 0.3) {
    lastHUD = t;
    const text = `FOUND ${hunt.found.size}/5 · ${hunt.elapsed.toFixed(1)} s · SCORE ${hunt.score}\n${TARGETS.map((c) => (hunt.found.has(c) ? "✓ " : "□ ") + c).join("  ")}`;
    progress.setText(text);
    wrist.setText(
      `${hunt.found.size}/5 · ${hunt.elapsed.toFixed(0)}s\n${TARGETS.filter((c) => !hunt.found.has(c)).join("\n") || "COMPLETE"}`,
    );
    app.metrics(
      `Found ${hunt.found.size} · remaining ${5 - hunt.found.size}\nTime ${hunt.elapsed.toFixed(1)} s · score ${hunt.score}\nErrors ${hunt.errors} · path ${pathLength.toFixed(1)} m\n${app.fps.toFixed(0)} fps · ${app.renderer.info.render.calls} draw calls`,
    );
    updateMenu();
  }
};
updateMenu();
app.inspect = () => ({
  settings,
  found: [...hunt.found],
  targets: TARGETS,
  bins: bins.length,
  elapsed: hunt.elapsed,
  score: hunt.score,
  rig: app.rig.position.toArray(),
  menu: menu.visible,
});
