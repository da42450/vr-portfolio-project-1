import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('Shared/vendor',{recursive:true});
for (const file of ['three.module.js','three.core.js'])
  await copyFile(`node_modules/three/build/${file}`,`Shared/vendor/${file}`);
await copyFile('node_modules/three/LICENSE','Shared/vendor/THREE-LICENSE.txt');
console.log('Vendored pinned Three.js 0.180.0; web demos run without a CDN.');
