import { readdir, readFile, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
const roots = ["Shared", "Demo1_Ride", "Demo3_Procedure", "Demo4_Hunt"];
let checked = 0;
async function walk(dir) {
  for (const item of await readdir(dir)) {
    const file = `${dir}/${item}`;
    if ((await stat(file)).isDirectory()) {
      if (item !== "vendor") await walk(file);
    } else if (file.endsWith(".js")) {
      const r = spawnSync(process.execPath, ["--check", file], {
        encoding: "utf8",
      });
      if (r.status !== 0) throw Error(r.stderr);
      checked++;
    }
  }
}
for (const root of roots) await walk(root);
for (const root of [
  "Demo1_Ride",
  "Demo2_Trainer",
  "Demo3_Procedure",
  "Demo4_Hunt",
]) {
  await readFile(`${root}/README.md`);
  await readFile(`${root}/index.html`);
}
console.log(
  `${checked} JS modules parse; four demo entrypoints and READMEs present.`,
);
