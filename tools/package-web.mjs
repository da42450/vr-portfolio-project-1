import { mkdir, cp } from "node:fs/promises";
await mkdir("web-release", { recursive: true });
for (const file of [
  "index.html",
  "Shared",
  "Demo1_Ride",
  "Demo3_Procedure",
  "Demo4_Hunt",
])
  await cp(file, `web-release/${file}`, { recursive: true });
await mkdir("web-release/Demo2_Trainer", { recursive: true });
await cp("Demo2_Trainer/index.html", "web-release/Demo2_Trainer/index.html");
await mkdir("web-release/Demo2_Trainer/Validation", { recursive: true });
await cp(
  "Demo2_Trainer/Validation/scene-preview.png",
  "web-release/Demo2_Trainer/Validation/scene-preview.png",
);
console.log(
  "Static web-release/ prepared. Unity/APK/temporary logs are excluded.",
);
