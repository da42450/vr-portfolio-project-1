export const TARGETS=['AX-104','BX-208','CX-306','DX-412','EX-510'];
export const DEFAULT_SETTINGS={locomotion:'teleport',turn:'snap',speed:1.5,seated:false,vignette:true};
export function validSettings(s={}){return {locomotion:s.locomotion==='smooth'?'smooth':'teleport',turn:s.turn==='smooth'?'smooth':'snap',speed:Math.max(.5,Math.min(3,Number(s.speed)||1.5)),seated:!!s.seated,vignette:s.vignette!==false};}
export class Hunt{
  constructor(){this.reset();}
  reset(){this.found=new Set();this.elapsed=0;this.errors=0;this.started=false;this.complete=false;}
  tick(dt){if(this.started&&!this.complete)this.elapsed+=dt;}
  select(code){this.started=true;if(this.found.has(code))return 'Already collected.';if(!TARGETS.includes(code)){this.errors++;return 'Wrong item. Compare every letter and number.';}this.found.add(code);this.complete=this.found.size===TARGETS.length;return this.complete?'All five items found. Hunt complete.':`Collected ${code}.`;}
  get score(){return Math.max(0,Math.round(1000-this.elapsed*2-this.errors*25));}
}
