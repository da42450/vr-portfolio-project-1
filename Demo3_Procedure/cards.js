import * as THREE from "../Shared/vendor/three.module.js";

// Small, high-contrast code-authored UI: short labels, a visible raised edge,
// and no permanent wall of instructions. Textures change only on state events.
export function card(
  parent,
  text,
  position,
  width,
  height,
  { background = "#142f3c", color = "#f2f7f5", accent = null, wrap = 0 } = {},
) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = Math.round((1024 * height) / width);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ map: texture }),
  );
  mesh.position.set(...position);
  parent.add(mesh);
  mesh.setText = (value) => {
    const ctx = canvas.getContext("2d"),
      lines = [];
    for (const paragraph of value.split("\n")) {
      let line = "";
      for (const word of paragraph.split(" ")) {
        if (wrap && line && line.length + word.length + 1 > wrap) {
          lines.push(line);
          line = word;
        } else line += (line ? " " : "") + word;
      }
      lines.push(line);
    }
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (accent) {
      ctx.strokeStyle = accent;
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    }
    let size = Math.min(160, (canvas.height - 18) / (lines.length * 1.2));
    ctx.font = `600 ${size}px system-ui`;
    while (
      size > 12 &&
      lines.some((line) => ctx.measureText(line).width > canvas.width - 48)
    ) {
      size -= 2;
      ctx.font = `600 ${size}px system-ui`;
    }
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    lines.forEach((line, i) =>
      ctx.fillText(
        line,
        canvas.width / 2,
        canvas.height / 2 + (i - (lines.length - 1) / 2) * size * 1.2,
      ),
    );
    texture.needsUpdate = true;
  };
  mesh.setText(text);
  return mesh;
}

export function raisedButton(
  app,
  parent,
  text,
  position,
  action,
  width = 0.3,
  height = 0.1,
  color = "#167b7b",
) {
  const button = new THREE.Group();
  button.name = `${text} button`;
  button.position.set(...position);
  button.userData.action = action;
  const backing = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, 0.024),
    new THREE.MeshStandardMaterial({ color: "#0b2430", roughness: 0.7 }),
  );
  const face = card(
    button,
    text,
    [0, 0, 0.013],
    width - 0.008,
    height - 0.008,
    { background: color, accent: "#6acfc1" },
  );
  button.add(backing);
  button.setText = face.setText;
  parent.add(button);
  app.interactables.push(button);
  return button;
}
