// Pose-only mechanics for the reconstructed opening character. No image, DOM,
// storage, logo or application state is read or changed by this module.
export const MASCOT_DURATION=4500;
export const MASCOT_RELEASE=1450;
export const MASCOT_CATCH=2550;
export const MASCOT_SETTLED=3600;
const SQUAT_END=750,FOLLOW_THROUGH=180;
const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
const point=(p,name)=>{
 if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))throw new TypeError(`${name} must contain finite x and y coordinates`);
 return {x:p.x,y:p.y};
};
const distance=(a,b)=>Math.hypot(b.x-a.x,b.y-a.y);
const lerpPoint=(a,b,u)=>({x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u});
const add=(a,b)=>({x:a.x+b.x,y:a.y+b.y});
const positive=(n,name)=>{if(!Number.isFinite(n)||n<=0)throw new RangeError(`${name} must be positive`);return n};
const ease=u=>{u=clamp(u);return u*u*u*(10+u*(-15+6*u))};
const cloneMerge=(base,override={})=>Object.fromEntries(Object.entries({...base,...override}).map(([key,value])=>[
 key,value&&typeof value==='object'&&!Array.isArray(value)?cloneMerge(base?.[key]||{},value):value
]));
const freeze=value=>{if(value&&typeof value==='object'){for(const child of Object.values(value))freeze(child);Object.freeze(value)}return value};

// End-point velocities use units per second; all other coordinates use the
// renderer's 1024 by 1536 model space. The derivatives match release and catch.
const hermite=(a,b,va,vb,u,seconds)=>{
 u=clamp(u);const h00=2*u**3-3*u*u+1,h10=u**3-2*u*u+u,h01=-2*u**3+3*u*u,h11=u**3-u*u;
 return {x:h00*a.x+h10*seconds*va.x+h01*b.x+h11*seconds*vb.x,y:h00*a.y+h10*seconds*va.y+h01*b.y+h11*seconds*vb.y};
};

/** A planar two-bone joint with an explicit, stable bend side. Never shorten a
 * bone or flip the side to conceal an unreachable target; fix the model instead.
 */
export function solveTwoBone(root,target,upperLength,lowerLength,bend=1){
 root=point(root,'root');target=point(target,'target');
 positive(upperLength,'upperLength');positive(lowerLength,'lowerLength');
 if(bend!==1&&bend!==-1)throw new RangeError('bend must be 1 or -1');
 const dx=target.x-root.x,dy=target.y-root.y,d=Math.hypot(dx,dy),minimum=Math.abs(upperLength-lowerLength),maximum=upperLength+lowerLength;
 if(d===0||d<=minimum||d>=maximum)throw new RangeError(`Unreachable two-bone target: distance ${d}, open range ${minimum}..${maximum}`);
 const along=(d*d+upperLength*upperLength-lowerLength*lowerLength)/(2*d),height=Math.sqrt(Math.max(0,upperLength*upperLength-along*along));
 return {root,joint:{x:root.x+dx/d*along-dy/d*height*bend,y:root.y+dy/d*along+dx/d*height*bend},target,upperLength,lowerLength,bend};
}

const baseModel={
 torso:{pivot:{x:512,y:880},shoulders:{near:{x:344,y:518},far:{x:638,y:518}},hips:{near:{x:414,y:876},far:{x:604,y:885}}},
 arms:{near:{upperLength:225,forearmLength:195,handLength:60,bend:1},far:{upperLength:225,forearmLength:195,handLength:60,bend:1}},
 legs:{
  near:{sourceKnee:{x:344,y:1092},ankle:{x:204,y:1364},foot:{x:210,y:1431}},
  far:{sourceKnee:{x:820,y:1056},ankle:{x:714,y:1319},foot:{x:792,y:1392}}
 },
 ball:{home:{x:620,y:540},release:{x:670,y:155},radius:155,grips:{near:{x:-.62,y:.12},far:{x:.60,y:-.02}}},
 motion:{squatDepth:80,catchDepth:22,leanDegrees:0,releaseVelocity:{x:220,y:-1000},followThroughOffset:{x:22,y:-38}}
};

/** Override model-space anchors and lengths here, never the protected artwork.
 * Legs derive their bone lengths AND bend side from sourceKnee unless explicitly
 * supplied. This reproduces the source drawing at rest and keeps each foot fixed.
 */
export function createMascotModel(overrides={}){
 const model=cloneMerge(baseModel,overrides);
 model.kind='menei-mascot-model-v1';
 model.torso.pivot=point(model.torso.pivot,'torso.pivot');
 for(const side of ['near','far']){
  const hip=model.torso.hips[side]=point(model.torso.hips[side],`torso.hips.${side}`);
  model.torso.shoulders[side]=point(model.torso.shoulders[side],`torso.shoulders.${side}`);
  const leg=model.legs[side];
  leg.sourceKnee=point(leg.sourceKnee,`legs.${side}.sourceKnee`);leg.ankle=point(leg.ankle,`legs.${side}.ankle`);leg.foot=point(leg.foot,`legs.${side}.foot`);
  leg.upperLength=positive(leg.upperLength??distance(hip,leg.sourceKnee),`legs.${side}.upperLength`);
  leg.lowerLength=positive(leg.lowerLength??distance(leg.sourceKnee,leg.ankle),`legs.${side}.lowerLength`);
  const cross=(leg.ankle.x-hip.x)*(leg.sourceKnee.y-hip.y)-(leg.ankle.y-hip.y)*(leg.sourceKnee.x-hip.x);
  if(leg.bend==null&&Math.abs(cross)<1e-8)throw new RangeError(`legs.${side} needs a non-collinear sourceKnee or explicit bend`);
  leg.bend??=Math.sign(cross);
  solveTwoBone(hip,leg.ankle,leg.upperLength,leg.lowerLength,leg.bend);
  const arm=model.arms[side];
  for(const key of ['upperLength','forearmLength','handLength'])arm[key]=positive(arm[key],`arms.${side}.${key}`);
  if(arm.bend!==1&&arm.bend!==-1)throw new RangeError(`arms.${side}.bend must be 1 or -1`);
  model.ball.grips[side]=point(model.ball.grips[side],`ball.grips.${side}`);
 }
 model.ball.home=point(model.ball.home,'ball.home');model.ball.release=point(model.ball.release,'ball.release');model.ball.radius=positive(model.ball.radius,'ball.radius');
 for(const key of ['squatDepth','catchDepth'])if(!Number.isFinite(model.motion[key])||model.motion[key]<0)throw new RangeError(`motion.${key} must be nonnegative`);
 if(!Number.isFinite(model.motion.leanDegrees))throw new TypeError('motion.leanDegrees must be finite');
 model.motion.releaseVelocity=point(model.motion.releaseVelocity,'motion.releaseVelocity');
 if(model.motion.releaseVelocity.y>=0)throw new RangeError('Release velocity must initially travel upward');
 model.motion.followThroughOffset=point(model.motion.followThroughOffset,'motion.followThroughOffset');
 return freeze(model);
}
export const DEFAULT_MASCOT_MODEL=createMascotModel();

const torsoFrame=(model,dip)=>{
 const angleDegrees=model.motion.squatDepth?model.motion.leanDegrees*dip/model.motion.squatDepth:0;
 const angle=angleDegrees*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),p=model.torso.pivot;
 const matrix=[c,s,-s,c,p.x-c*p.x+s*p.y,p.y+dip-s*p.x-c*p.y];
 const transform=v=>({x:matrix[0]*v.x+matrix[2]*v.y+matrix[4],y:matrix[1]*v.x+matrix[3]*v.y+matrix[5]});
 return {angleDegrees,translation:{x:0,y:dip},matrix,pivot:transform(p),shoulders:Object.fromEntries(Object.entries(model.torso.shoulders).map(([k,v])=>[k,transform(v)])),hips:Object.fromEntries(Object.entries(model.torso.hips).map(([k,v])=>[k,transform(v)]))};
};

/** The renderer can use torso.matrix, arms.* joints, and legs.* joints directly.
 * Combined forearm/hand artwork follows elbow -> palm; wrist is its neutral
 * internal anchor, not a separate rotating wrist or an artificial joint cap.
 */
export function mascotPose(milliseconds,model=DEFAULT_MASCOT_MODEL){
 if(!Number.isFinite(milliseconds))throw new TypeError('Animation time must be finite');
 if(model.kind!=='menei-mascot-model-v1')model=createMascotModel(model);
 const t=clamp(milliseconds,0,MASCOT_DURATION),zero={x:0,y:0},home=model.ball.home,launch=model.ball.release,velocity=model.motion.releaseVelocity;
 const catchVelocity={x:-velocity.x,y:-velocity.y};
 let dip=0,ball,grip,phase;
 if(t<SQUAT_END){
  phase='squat';dip=model.motion.squatDepth*ease(t/SQUAT_END);
  const torso=torsoFrame(model,dip),m=torso.matrix;
  ball={x:m[0]*home.x+m[2]*home.y+m[4],y:m[1]*home.x+m[3]*home.y+m[5]};grip=ball;
 }else if(t<MASCOT_RELEASE){
  phase='drive';const u=(t-SQUAT_END)/(MASCOT_RELEASE-SQUAT_END);
  dip=model.motion.squatDepth*(1-ease(u));
  const bottom=torsoFrame(model,model.motion.squatDepth).matrix;
  const start={x:bottom[0]*home.x+bottom[2]*home.y+bottom[4],y:bottom[1]*home.x+bottom[3]*home.y+bottom[5]};
  ball=hermite(start,launch,zero,velocity,u,(MASCOT_RELEASE-SQUAT_END)/1000);grip=ball;
 }else if(t<MASCOT_CATCH){
  phase='flight';const seconds=(t-MASCOT_RELEASE)/1000,total=(MASCOT_CATCH-MASCOT_RELEASE)/1000;
  ball={x:launch.x+velocity.x*Math.min(seconds,total-seconds),y:launch.y+velocity.y*seconds-velocity.y/total*seconds*seconds};
  const ready=add(launch,model.motion.followThroughOffset);
  grip=t<MASCOT_RELEASE+FOLLOW_THROUGH?hermite(launch,ready,velocity,zero,(t-MASCOT_RELEASE)/FOLLOW_THROUGH,FOLLOW_THROUGH/1000):t>MASCOT_CATCH-FOLLOW_THROUGH?hermite(ready,launch,zero,catchVelocity,(t-(MASCOT_CATCH-FOLLOW_THROUGH))/FOLLOW_THROUGH,FOLLOW_THROUGH/1000):ready;
 }else{
  phase=t<MASCOT_SETTLED?'catch':'settled';
  const u=clamp((t-MASCOT_CATCH)/(MASCOT_SETTLED-MASCOT_CATCH));
  ball=hermite(launch,home,catchVelocity,zero,u,(MASCOT_SETTLED-MASCOT_CATCH)/1000);grip=ball;
  // sin^4 makes the small knee absorption start/end with zero velocity and
  // acceleration; do not bounce the sandals or deform the shins to absorb it.
  dip=t>=MASCOT_SETTLED?0:model.motion.catchDepth*Math.sin(Math.PI*u)**4;
 }
 const torso=torsoFrame(model,dip),arms={},legs={};
 for(const side of ['near','far']){
  const a=model.arms[side],g=model.ball.grips[side],palm={x:grip.x+g.x*model.ball.radius,y:grip.y+g.y*model.ball.radius};
  const arm=solveTwoBone(torso.shoulders[side],palm,a.upperLength,a.forearmLength+a.handLength,a.bend);
  arms[side]={shoulder:arm.root,elbow:arm.joint,wrist:lerpPoint(arm.joint,palm,a.forearmLength/(a.forearmLength+a.handLength)),palm,upperLength:a.upperLength,forearmLength:a.forearmLength,handLength:a.handLength,bend:a.bend};
  const l=model.legs[side],leg=solveTwoBone(torso.hips[side],l.ankle,l.upperLength,l.lowerLength,l.bend);
  legs[side]={hip:leg.root,knee:leg.joint,ankle:leg.target,foot:{...l.foot},upperLength:l.upperLength,lowerLength:l.lowerLength,bend:l.bend};
 }
 const held=phase!=='flight';
 return {t,phase,dip,torso,arms,legs,ball:{...ball,radius:model.ball.radius,rotation:0,held},held,wallContact:!held&&Math.abs(t-(MASCOT_RELEASE+MASCOT_CATCH)/2)<65};
}

export function createMascotMotion(overrides={}){
 const model=createMascotModel(overrides);
 return {model,duration:MASCOT_DURATION,pose:milliseconds=>mascotPose(milliseconds,model)};
}
