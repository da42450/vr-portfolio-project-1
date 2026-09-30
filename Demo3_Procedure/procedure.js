// Events advance explicit state only when prerequisites are true. Errors are recoverable.
export const STEPS=[
  'Confirm alarm raised, small contained fire, and a clear exit behind you.',
  'Pick up the ABC extinguisher. The water extinguisher is the wrong part.',
  'Check the pressure gauge: the needle must be in the green range.',
  'Pull the safety pin along its slider until it clears the handle.',
  'Remove the nozzle from its holster and aim low at the base.',
  'Hold the body in one hand and the nozzle in the other. Squeeze the lever.',
  'Keep squeezing and sweep across all three sections of the fire’s base.',
  'Release the lever, verify the fire is out, and confirm completion.'
];
export class Procedure{
  constructor(){this.reset();}
  reset(){this.step=0;this.errors=0;this.complete=false;this.coverage=[0,0,0];this.message='Ready. Confirm the safety checks first.';}
  reject(message){this.errors++;this.message=message;return false;}
  event(action,context={}){
    if(this.complete)return false;
    if(action==='wrong-part')return this.reject('Wrong extinguisher. Put it down and choose ABC. Progress is preserved.');
    const expected=['safety','select','pressure','pin','aim','squeeze','sweep','verify'][this.step];
    if(action!==expected)return this.reject(`Do the current step first: ${STEPS[this.step]}`);
    if(action==='squeeze'&&!context.twoHands)return this.reject('Use separate hands for the body and nozzle.');
    if(action==='verify'&&!this.coverage.every(n=>n>=1.2))return this.reject('Sweep every base section until the fire is out.');
    if(action==='sweep'){if(this.coverage.every(n=>n>=1.2))this.step++;else return false;}
    else this.step++;
    this.complete=this.step===STEPS.length;this.message=this.complete?'Procedure complete. Reset to practice again.':STEPS[this.step];return true;
  }
  spray(zone,dt){if(this.step!==6||zone<0||zone>2)return;this.coverage[zone]=Math.min(1.2,this.coverage[zone]+dt);this.event('sweep');}
}
