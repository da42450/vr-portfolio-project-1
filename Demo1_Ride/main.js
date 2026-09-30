import {App,THREE,V,material,box,cylinder,group,label} from '../Shared/runtime.js';
const app=new App({xr:false});app.scene.background=new THREE.Color('#a9ccdf');
app.renderer.shadowMap.enabled=true;app.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const hemi=new THREE.HemisphereLight('#edf6ff','#758368',2);app.scene.add(hemi);
const sun=new THREE.DirectionalLight('#fff0cd',3);sun.position.set(9,17,12);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-15;sun.shadow.camera.right=15;sun.shadow.camera.top=16;sun.shadow.camera.bottom=-10;sun.shadow.bias=-.0004;app.scene.add(sun);
function canvasTexture(draw,size=256){const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
const colorMap=canvasTexture((c,s)=>{c.fillStyle='#11757c';c.fillRect(0,0,s,s);for(let i=0;i<4;i++){c.fillStyle=i%2?'#dbe9e6':'#e1be61';c.fillRect(i*s/4+4,8,s/4-8,45);c.fillStyle='#28565c';c.fillRect(i*s/4+12,80,s/4-24,100);c.fillStyle='#f7edca';c.fillRect(i*s/4+7,s-36,s/4-14,12);}});
const normalMap=canvasTexture((c,s)=>{c.fillStyle='#8080ff';c.fillRect(0,0,s,s);for(let y=0;y<s;y+=16){c.fillStyle='#7080fc';c.fillRect(0,y,s,2);c.fillStyle='#9080fc';c.fillRect(0,y+2,s,2);}});normalMap.colorSpace=THREE.NoColorSpace;
const emissionMap=canvasTexture((c,s)=>{c.fillStyle='#000';c.fillRect(0,0,s,s);c.fillStyle='#ffefc0';c.fillRect(0,s-36,s,12);});
const cabinMat=material('#ffffff',{map:colorMap,normalMap,normalScale:new THREE.Vector2(.5,.5),emissive:'#ffcb76',emissiveMap:emissionMap,emissiveIntensity:.45,metalness:.45,roughness:.28});
const steel=material('#abc1c7',{metalness:.8,roughness:.25}),dark=material('#294a53',{metalness:.4}),trim=material('#f1c557',{metalness:.45,roughness:.3});
const groundMap=canvasTexture((c,s)=>{c.fillStyle='#90a298';c.fillRect(0,0,s,s);c.strokeStyle='#75887b';c.lineWidth=3;for(let y=0;y<s;y+=32){c.beginPath();c.moveTo(0,y);c.lineTo(s,y);c.stroke();for(let x=(y%64?16:0);x<s;x+=32)c.strokeRect(x,y,32,32);}});groundMap.wrapS=groundMap.wrapT=THREE.RepeatWrapping;groundMap.repeat.set(30,30);
box(app.scene,'Textured fairground',[85,.15,85],[0,-.15,0],material('#fff',{map:groundMap,roughness:.9}));
box(app.scene,'Entry path',[6,.08,24],[0,-.035,16],material('#d9d7c4'));
// An authored mesh: four tapered side quads, a base and a rim. Each face owns its UV strip.
function cabinGeometry(){
  const positions=[],normals=[],uvs=[],indices=[];
  const corners=[[-.62,0,-.44],[.62,0,-.44],[.62,0,.44],[-.62,0,.44]];
  for(let face=0;face<4;face++){
    const a=corners[face],b=corners[(face+1)%4],pts=[a,b,[b[0]*1.2,.85,b[2]*1.2],[a[0]*1.2,.85,a[2]*1.2]];
    const n=V(...pts[1]).sub(V(...pts[0])).cross(V(...pts[3]).sub(V(...pts[0]))).normalize();
    const base=positions.length/3;pts.forEach(p=>{positions.push(...p);normals.push(...n.toArray());});
    uvs.push(face/4,0,(face+1)/4,0,(face+1)/4,1,face/4,1);indices.push(base,base+1,base+2,base,base+2,base+3);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);return g;
}
cabinMat.side=THREE.DoubleSide;
const root=group(app.scene,'Turntable');cylinder(root,'Base',3.4,.3,[0,.15,0],dark);
for(const z of [-.9,.9]){for(const x of [-2.2,2.2]){const leg=box(root,'Support',[.28,6.5,.3],[x,3.1,z],steel);leg.rotation.z=x<0?-.34:.34;}}
const wheel=group(root,'Wheel',[0,6,0]);
for(const z of [-.7,.7]){
  const ring=new THREE.Mesh(new THREE.TorusGeometry(4.6,.09,8,80),steel);ring.position.z=z;ring.castShadow=true;wheel.add(ring);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;const spoke=box(wheel,'Spoke',[4.6,.085,.085],[Math.cos(a)*2.3,Math.sin(a)*2.3,z],steel);spoke.rotation.z=a;}
}
const hub=cylinder(wheel,'Axle',.32,2.2,[0,0,0],trim);hub.rotation.x=Math.PI/2;
const pivots=[],seats=[];const geo=cabinGeometry();
for(let i=0;i<8;i++){
  const a=i*Math.PI/4,p=group(wheel,`LevelingPivot${i}`,[Math.cos(a)*4.6,Math.sin(a)*4.6,0]);pivots.push(p);
  box(p,'Suspension',[.07,.9,.07],[0,-.42,0],steel);
  const cabin=group(p,`Cabin${i}`,[0,-1.45,0]);const mesh=new THREE.Mesh(geo,cabinMat);mesh.castShadow=mesh.receiveShadow=true;cabin.add(mesh);
  box(cabin,'Floor',[1.24,.09,.88],[0,.03,0],dark);box(cabin,'Roof',[1.55,.1,1.14],[0,1.42,0],trim);
  for(const x of [-.68,.68])for(const z of [-.49,.49])box(cabin,'Roof post',[.04,.65,.04],[x,1.11,z],steel);
  const seat=group(cabin,`RockingSeat${i}`,[0,.48,.1]);box(seat,'Seat cushion',[1.05,.14,.42],[0,0,0],material('#ecce83'));seats.push(seat);
}
const point=new THREE.PointLight('#ffb962',0,22,2);point.position.set(0,6,1.4);root.add(point);
const spot=new THREE.SpotLight('#c5efff',0,24,Math.PI/5,.45,2);spot.position.set(3,8,5);spot.target.position.set(0,3,0);spot.castShadow=false;spot.shadow.mapSize.set(512,512);root.add(spot,spot.target);
for(let i=0;i<16;i++){const a=i*Math.PI/8;const bulb=new THREE.Mesh(new THREE.SphereGeometry(.095,8,6),material('#ffdfa0',{emissive:'#ffb54d',emissiveIntensity:2}));bulb.position.set(Math.cos(a)*4.6,Math.sin(a)*4.6,.75);wheel.add(bulb);}
// Coherent surroundings use repeatable geometry and small, locally generated textures.
for(const [x,z,name] of [[-10,7,'TICKETS'],[10,7,'REFRESHMENTS'],[-11,-6,'PRIZES']]){
  const stand=group(app.scene,name,[x,0,z]);box(stand,'Booth',[3,2.4,2.5],[0,1.2,0],material('#3a7c83',{map:colorMap}));box(stand,'Awning',[3.5,.18,3],[0,2.55,.1],trim);label(stand,name,[0,2.1,1.27],2.6,.4);
}
for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const tree=group(app.scene,'Tree',[Math.cos(a)*24,0,Math.sin(a)*24]);cylinder(tree,'Trunk',.2,2,[0,1,0],material('#7a624d'));const crown=new THREE.Mesh(new THREE.ConeGeometry(1.4,4,8),material('#54785e'));crown.position.y=3;tree.add(crown);}
label(app.scene,'FERRIS WHEEL · TRANSFORM LAB',[0,1,4.5],4,.55);
let angle=0,night=false,riding=false,paused=false,fault=false,maps=true,shadows=true;
function groundView(){app.rig.add(app.camera);app.camera.position.set(14,8.5,19);app.camera.lookAt(0,5,0);}
function view(){riding=!riding;if(riding){seats[0].add(app.camera);app.camera.position.set(0,.82,.18);app.camera.rotation.set(0,Math.PI,0);}else groundView();refresh();}
function lighting(){night=!night;app.scene.background.set(night?'#101e33':'#a9ccdf');hemi.intensity=night?.17:2;sun.intensity=night?.06:3;point.intensity=night?100:0;spot.intensity=night?140:0;cabinMat.emissiveIntensity=night?3:.45;sun.castShadow=shadows&&!night;spot.castShadow=shadows&&night;refresh();}
function refresh(){app.status(`${riding?'Rider':'Ground'} view · ${night?'night':'day'} · ${paused?'paused':'running'}${fault?' · LEVELING FAULT':''}`);}
const actions={KeyV:view,KeyN:lighting,KeyP:()=>{paused=!paused;refresh();},KeyB:()=>{fault=!fault;app.notify(fault?'Fault injected: local counter-rotation removed. The cabins inherit the wheel’s roll.':'Counter-rotation restored: local gondola angle = −wheel angle.');refresh();},KeyM:()=>{maps=!maps;cabinMat.normalMap=maps?normalMap:null;cabinMat.emissiveMap=maps?emissionMap:null;cabinMat.emissiveIntensity=maps?(night?3:.45):0;cabinMat.needsUpdate=true;app.notify(maps?'Normal + emission maps enabled.':'Maps disabled. Compare corrugation highlights and glowing strip.');},KeyH:()=>{shadows=!shadows;sun.castShadow=shadows&&!night;spot.castShadow=shadows&&night;app.notify(`Shadow maps ${shadows?'on':'off'}: one active shadow-casting light.`);}};
for(const [id,key] of [['view','KeyV'],['night','KeyN'],['pause','KeyP'],['bug','KeyB'],['maps','KeyM'],['shadows','KeyH']])document.querySelector('#'+id).onclick=actions[key];app.onKey=k=>actions[k]?.();
addEventListener('wheel',e=>{if(!riding)app.camera.position.multiplyScalar(e.deltaY>0?1.04:.96);},{passive:true});
groundView();refresh();let lastHUD=0;
app.update=(dt,t)=>{
  if(!paused){angle+=dt*.22;root.rotation.y=Math.sin(t*.13)*.16;wheel.rotation.z=angle;pivots.forEach(p=>p.rotation.z=fault?0:-angle);seats.forEach((s,i)=>s.rotation.x=Math.sin(t*.8+i)*.035);}
  if(t-lastHUD>.3){lastHUD=t;const up=pivots[0].getWorldQuaternion(new THREE.Quaternion());const tilt=THREE.MathUtils.radToDeg(Math.acos(THREE.MathUtils.clamp(V(0,1,0).applyQuaternion(up).dot(V(0,1,0)),-1,1)));app.metrics(`Cabin world tilt: ${tilt.toFixed(2)}°\nWheel: ${THREE.MathUtils.radToDeg(angle% (Math.PI*2)).toFixed(1)}° · local pivot: ${THREE.MathUtils.radToDeg(pivots[0].rotation.z% (Math.PI*2)).toFixed(1)}°\n${app.fps.toFixed(0)} fps · ${app.renderer.info.render.calls} draw calls\n${app.renderer.info.render.triangles.toLocaleString()} triangles · one ${night?'512²':'1024²'} shadow map`);}
};
app.inspect=()=>({riding,night,paused,fault,maps,shadows,angle,cameraParent:app.camera.parent.name,pivotRotation:pivots[0].rotation.z});
