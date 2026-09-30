import * as THREE from './vendor/three.module.js';
export {THREE};
export const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
export function material(color,extra={}){return new THREE.MeshStandardMaterial({color,roughness:.58,...extra});}
export function box(parent,name,size,pos,mat){
  const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);m.name=name;m.position.set(...pos);m.castShadow=m.receiveShadow=true;parent.add(m);return m;
}
export function cylinder(parent,name,r,h,pos,mat){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,24),mat);m.name=name;m.position.set(...pos);m.castShadow=m.receiveShadow=true;parent.add(m);return m;
}
export function group(parent,name,pos=[0,0,0]){const g=new THREE.Group();g.name=name;g.position.set(...pos);parent.add(g);return g;}
export function label(parent,text,pos,width=1.3,height=.35){
  const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*height/width);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));
  m.position.set(...pos);parent.add(m);
  m.setText=(str)=>{const ctx=c.getContext('2d');ctx.fillStyle='#f2f8f8';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#143b45';const lines=[];for(const paragraph of str.split('\n')){let line='';for(const word of paragraph.split(' ')){if((line+' '+word).length>48&&line){lines.push(line);line=word;}else line+=(line?' ':'')+word;}lines.push(line);}ctx.font=`600 ${Math.min(60,(c.height-14)/(lines.length*1.15))}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';lines.forEach((line,i)=>ctx.fillText(line,c.width/2,c.height/2+(i-(lines.length-1)/2)*(c.height-10)/lines.length,c.width-35));tex.needsUpdate=true;};
  m.setText(text);return m;
}
export function panelButton(app,parent,text,pos,action,width=1.1){const b=label(parent,text,pos,width,.16);b.userData.action=action;app.interactables.push(b);return b;}
function visibleInHierarchy(o){for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;}
export function room(app,size=12){
  app.scene.background=new THREE.Color('#b9d1da');app.scene.fog=new THREE.Fog('#b9d1da',25,65);
  const floor=box(app.scene,'floor',[size,.1,size],[0,-.05,-size/3],material('#bac8c7'));floor.userData.floor=true;
  app.scene.add(new THREE.HemisphereLight('#e2f6ff','#647769',2));
  const sun=new THREE.DirectionalLight('#fff6df',2.2);sun.position.set(5,10,3);app.scene.add(sun);return floor;
}
export class App{
  constructor({xr=true,spawn=[0,0,0]}={}){
    this.scene=new THREE.Scene();this.rig=group(this.scene,'PlayerRig',spawn);
    this.camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.05,150);this.camera.position.set(0,1.6,0);this.rig.add(this.camera);
    this.renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.setSize(innerWidth,innerHeight);this.renderer.xr.enabled=xr;
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.setClearColor('#b9d1da');
    document.body.appendChild(this.renderer.domElement);this.clock=new THREE.Clock();this.interactables=[];this.grabbables=[];this.keys={};this.hands=[];this.controllers=[];
    this.raycaster=new THREE.Raycaster();this.mouse=new THREE.Vector2();this.noticeTime=0;this.fade=0;this.vignette=0;
    this.teleportables=[];this.frameSamples=[];this.dt=0;this.elapsed=0;
    for(let i=0;i<2;i++){
      const controller=this.renderer.xr.getController(i);this.rig.add(controller);this.controllers.push(controller);
      const grip=this.renderer.xr.getControllerGrip(i);this.rig.add(grip);grip.userData.hand=i;
      const orb=new THREE.Mesh(new THREE.SphereGeometry(.035,12,8),material(i===0?'#f0bc45':'#26a5a6'));grip.add(orb);this.hands.push(grip);
      const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(),V(0,0,-4)]),new THREE.LineBasicMaterial({color:'#2f8589',transparent:true,opacity:.55}));controller.add(line);
      controller.addEventListener('connected',e=>{controller.userData.inputSource=e.data;grip.userData.connected=true;});
      controller.addEventListener('disconnected',()=>{controller.userData.inputSource=null;grip.userData.connected=false;this.release(i);});
      controller.addEventListener('squeezestart',()=>this.grab(i));controller.addEventListener('squeezeend',()=>this.release(i));
      controller.addEventListener('selectstart',()=>{controller.userData.trigger=true;this.select(i);});
      controller.addEventListener('selectend',()=>{controller.userData.trigger=false;const held=grip.userData.held;if(held?.userData.use)held.userData.use(false,i);});
    }
    const overlayMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,uniforms:{fade:{value:0},vignette:{value:0}},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec2 vUv; uniform float fade; uniform float vignette; void main(){float r=length((vUv-0.5)*2.0);float edge=smoothstep(0.28,0.62,r)*vignette;gl_FragColor=vec4(0.02,0.05,0.06,max(fade,edge));}'});
    this.overlay=new THREE.Mesh(new THREE.PlaneGeometry(.6,.6),overlayMat);this.overlay.position.z=-.13;this.overlay.renderOrder=999;this.overlay.frustumCulled=false;this.camera.add(this.overlay);
    addEventListener('resize',()=>{this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(innerWidth,innerHeight);});
    addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT')return;this.keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();this.onKey?.(e.code);});
    addEventListener('keyup',e=>{this.keys[e.code]=false;});addEventListener('blur',()=>{this.keys={};});
    const canvas=this.renderer.domElement;
    canvas.addEventListener('pointerdown',e=>this.pointerDown(e));canvas.addEventListener('pointermove',e=>this.pointerMove(e));canvas.addEventListener('pointerup',()=>this.pointerUp());canvas.addEventListener('pointercancel',()=>this.pointerUp());
    this.renderer.xr.addEventListener('sessionstart',()=>{document.querySelector('#hud').hidden=true;document.querySelector('#settings')?.setAttribute('hidden','');this.camera.position.set(0,0,0);this.onXR?.(true);});
    this.renderer.xr.addEventListener('sessionend',()=>{document.querySelector('#hud').hidden=false;this.camera.position.set(0,1.6,0);this.onXR?.(false);});
    if(xr)this.initXR();
    this.renderer.setAnimationLoop(()=>{
      const dt=Math.min(this.clock.getDelta(),.05);this.dt=dt;this.elapsed+=dt;
      this.scene.updateMatrixWorld(true);this.frameSamples.push(dt);if(this.frameSamples.length>120)this.frameSamples.shift();
      this.update?.(dt,this.elapsed);this.updateHands();this.overlay.material.uniforms.fade.value=this.fade;this.overlay.material.uniforms.vignette.value=this.vignette;
      this.renderer.render(this.scene,this.camera);
    });
    window.portfolio=this;
  }
  async initXR(){
    const b=document.querySelector('#enter-vr');if(!b)return;
    try{if(!navigator.xr||!await navigator.xr.isSessionSupported('immersive-vr')){b.textContent='VR unavailable on this device';b.disabled=true;return;}
      b.onclick=async()=>{try{const session=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor','bounded-floor']});this.renderer.xr.setReferenceSpaceType('local-floor');await this.renderer.xr.setSession(session);}catch(e){this.notify(e.message);}};
    }catch(e){this.notify(e.message);}
  }
  notify(text){const n=document.querySelector('#notice');if(n)n.textContent=text;this.noticeTime=this.elapsed;}
  status(text){document.querySelector('#status').textContent=text;}
  metrics(text){document.querySelector('#metrics').textContent=text;}
  get fps(){const a=this.frameSamples;return a.length/(a.reduce((s,n)=>s+n,0)||1);}
  hit(controller,objects=this.interactables){const q=controller.getWorldQuaternion(new THREE.Quaternion());this.raycaster.set(controller.getWorldPosition(V()),V(0,0,-1).applyQuaternion(q));return this.raycaster.intersectObjects(objects.filter(visibleInHierarchy),true)[0];}
  select(i){
    const held=this.hands[i].userData.held;if(held?.userData.use){held.userData.use(true,i);return;}
    const h=this.hit(this.controllers[i]);if(h){let m=h.object;while(m&&!m.userData.action)m=m.parent;m?.userData.action?.(i,h);}else this.onSelectEmpty?.(i);
  }
  grab(i){
    if(this.hands[i].userData.held)return;const p=this.hands[i].getWorldPosition(V());
    const sorted=this.grabbables.filter(o=>o.visible&&!o.userData.holder).map(o=>({o,d:o.getWorldPosition(V()).distanceTo(p)})).sort((a,b)=>a.d-b.d);
    if(sorted[0]?.d<.23)this.hold(sorted[0].o,i);else this.notify('Move a hand close to the grip, then squeeze.');
  }
  hold(o,i){
    if(o.userData.canGrab&&!o.userData.canGrab(i))return;
    const hand=this.hands[i];o.userData.homeParent??=o.parent;o.userData.holder=hand;hand.userData.held=o;
    hand.attach(o);if(o.userData.snapGrip){o.position.copy(o.userData.snapGrip);o.quaternion.identity();}
    o.userData.onGrab?.(i);
  }
  release(i){const h=this.hands[i],o=h.userData.held;if(!o)return;this.scene.attach(o);delete o.userData.holder;delete h.userData.held;o.userData.onRelease?.(i);}
  updateHands(){
    if(!this.renderer.xr.isPresenting)return;
    for(let i=0;i<2;i++){const held=this.hands[i].userData.held;if(held?.userData.tickHeld)held.userData.tickHeld(i,this.dt);}
  }
  pointerRay(e){this.mouse.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);this.raycaster.setFromCamera(this.mouse,this.camera);}
  pointerDown(e){
    if(this.renderer.xr.isPresenting)return;this.pointerRay(e);const hit=this.raycaster.intersectObjects([...this.interactables,...this.grabbables].filter(visibleInHierarchy),true)[0];
    if(!hit){this.dragLook={x:e.clientX,y:e.clientY};return;}
    let o=hit.object;while(o&&!this.interactables.includes(o)&&!this.grabbables.includes(o))o=o.parent;if(!o)return;
    if(this.grabbables.includes(o)){
      const i=e.shiftKey?0:1;if(o.userData.canGrab&&!o.userData.canGrab(i))return;
      this.dragObject=o;this.dragHand=i;o.userData.desktopHeld=true;o.userData.onGrab?.(i);
      this.dragPlane=new THREE.Plane().setFromNormalAndCoplanarPoint(this.camera.getWorldDirection(V()).negate(),hit.point);
      this.dragOffset=o.getWorldPosition(V()).sub(hit.point);this.scene.attach(o);e.target.setPointerCapture(e.pointerId);
    }else o.userData.action?.(e.shiftKey?0:1,hit);
  }
  pointerMove(e){
    if(this.dragObject){this.pointerRay(e);const p=this.raycaster.ray.intersectPlane(this.dragPlane,V());if(p)this.dragObject.position.copy(p.add(this.dragOffset));}
    else if(this.dragLook){const dx=e.clientX-this.dragLook.x,dy=e.clientY-this.dragLook.y;this.camera.rotation.order='YXZ';this.camera.rotation.y-=dx*.003;this.camera.rotation.x=THREE.MathUtils.clamp(this.camera.rotation.x-dy*.003,-1.2,1.2);this.dragLook={x:e.clientX,y:e.clientY};}
  }
  pointerUp(){if(this.dragObject){this.dragObject.userData.desktopHeld=false;this.dragObject.userData.onRelease?.(this.dragHand);this.dragObject=null;}this.dragLook=null;}
  axes(i){return this.controllers[i].userData.inputSource?.gamepad?.axes.slice(-2)||[0,0];}
  resetView(){
    if(this.renderer.xr.isPresenting){const session=this.renderer.xr.getSession();session.requestReferenceSpace('local-floor').then(ref=>{this.renderer.xr.setReferenceSpace(ref);this.onRecenter?.();});}
    else{this.camera.rotation.set(0,0,0);this.onRecenter?.();}
  }
}
