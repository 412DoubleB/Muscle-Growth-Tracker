import test from 'node:test';
import assert from 'node:assert/strict';
import {createMascotModel,createMascotMotion,mascotPose,solveTwoBone,DEFAULT_MASCOT_MODEL,MASCOT_DURATION,MASCOT_RELEASE,MASCOT_CATCH,MASCOT_SETTLED} from '../mascot-motion.mjs';
const d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const close=(actual,expected,eps=1e-8)=>assert.ok(Math.abs(actual-expected)<eps,`${actual} != ${expected}`);
const sign=(root,joint,target)=>Math.sign((target.x-root.x)*(joint.y-root.y)-(target.y-root.y)*(joint.x-root.x));
const geometry=p=>({torso:p.torso,arms:p.arms,legs:p.legs,ball:p.ball,dip:p.dip,held:p.held,wallContact:p.wallContact});

test('two-bone solver preserves actual planar length and explicit bend, rejecting unreachable or invalid targets',()=>{
 for(const bend of [-1,1])for(const target of [{x:5,y:4},{x:-5,y:4},{x:4,y:-5}]){
  const p=solveTwoBone({x:0,y:0},target,5,4,bend);close(d(p.root,p.joint),5);close(d(p.joint,p.target),4);assert.equal(sign(p.root,p.joint,p.target),bend);
 }
 for(const target of [{x:0,y:0},{x:9,y:0},{x:10,y:0},{x:1,y:0}])assert.throws(()=>solveTwoBone({x:0,y:0},target,5,4),/Unreachable/);
 assert.throws(()=>solveTwoBone({x:NaN,y:0},{x:5,y:3},5,4),/finite/);
 assert.throws(()=>solveTwoBone({x:0,y:0},{x:5,y:3},5,4,0),/bend/);
});

test('source knees are reproduced at rest; feet remain planted while hips and rigid shoulders move',()=>{
 const model=DEFAULT_MASCOT_MODEL,rest=mascotPose(0),bottom=mascotPose(750);
 for(const side of ['near','far']){
  close(d(rest.legs[side].knee,model.legs[side].sourceKnee),0);
  assert.ok(bottom.legs[side].hip.y>rest.legs[side].hip.y+79);
 }
 assert.equal(bottom.dip,80);
 const shoulderSpan=d(model.torso.shoulders.near,model.torso.shoulders.far);
 for(let t=0;t<=MASCOT_DURATION;t+=2){
  const p=mascotPose(t);close(d(p.torso.shoulders.near,p.torso.shoulders.far),shoulderSpan);
  for(const side of ['near','far']){
   const a=p.arms[side],l=p.legs[side];
   close(d(a.shoulder,a.elbow),a.upperLength);close(d(a.elbow,a.wrist),a.forearmLength);close(d(a.wrist,a.palm),a.handLength);
   assert.equal(sign(a.shoulder,a.elbow,a.palm),a.bend);
   const fore={x:a.wrist.x-a.elbow.x,y:a.wrist.y-a.elbow.y},hand={x:a.palm.x-a.wrist.x,y:a.palm.y-a.wrist.y};
   close(fore.x*hand.y-fore.y*hand.x,0);close((fore.x*hand.x+fore.y*hand.y)/(a.forearmLength*a.handLength),1);
   close(d(l.hip,l.knee),l.upperLength);close(d(l.knee,l.ankle),l.lowerLength);assert.equal(sign(l.hip,l.knee,l.ankle),l.bend);
   assert.deepEqual(l.ankle,model.legs[side].ankle);assert.deepEqual(l.foot,model.legs[side].foot);
   if(p.held){close(a.palm.x,p.ball.x+model.ball.grips[side].x*p.ball.radius);close(a.palm.y,p.ball.y+model.ball.grips[side].y*p.ball.radius)}
  }
 }
});

test('pose has one flight and catch with continuous positions, matching hand/ball release velocities, and exact final rest geometry',()=>{
 const keyPoints=p=>[p.ball,...['near','far'].flatMap(side=>[p.arms[side].shoulder,p.arms[side].elbow,p.arms[side].wrist,p.arms[side].palm,p.legs[side].hip,p.legs[side].knee,p.legs[side].ankle])];
 let flights=0,catches=0,previous=mascotPose(0);
 for(let t=2;t<=MASCOT_DURATION;t+=2){const p=mascotPose(t);
  if(!p.held&&previous.held)flights++;
  if(p.held&&!previous.held)catches++;
  keyPoints(p).forEach((v,i)=>assert.ok(d(v,keyPoints(previous)[i])<5,'No position jump at '+t));previous=p;
 }
 assert.equal(flights,1);assert.equal(catches,1);
 for(const t of [750,MASCOT_RELEASE,MASCOT_RELEASE+180,MASCOT_CATCH-180,MASCOT_CATCH,MASCOT_SETTLED]){
  const a=keyPoints(mascotPose(t-.001)),b=keyPoints(mascotPose(t+.001));a.forEach((v,i)=>assert.ok(d(v,b[i])<.01,'Continuous boundary at '+t));
 }
 const velocity=(time,select)=>{const a=select(mascotPose(time-.01)),b=select(mascotPose(time+.01));return{x:(b.x-a.x)/.00002,y:(b.y-a.y)/.00002}};
 for(const time of [MASCOT_RELEASE,MASCOT_CATCH])for(const select of [p=>p.ball,p=>p.arms.near.palm,p=>p.arms.far.palm])assert.ok(d(velocity(time-.1,select),velocity(time+.1,select))<5);
 assert.deepEqual(geometry(mascotPose(MASCOT_DURATION)),geometry(mascotPose(0)));
 assert.deepEqual(mascotPose(-100),mascotPose(0));assert.deepEqual(mascotPose(9000),mascotPose(MASCOT_DURATION));
});

test('model overrides support rigid torso tilt, fixed feet and independent arm lengths without changing defaults',()=>{
 const motion=createMascotMotion({motion:{leanDegrees:2,squatDepth:65},arms:{far:{upperLength:230,forearmLength:200,handLength:55}}});
 assert.equal(motion.duration,4500);assert.equal(motion.model.arms.far.upperLength,230);assert.equal(DEFAULT_MASCOT_MODEL.arms.far.upperLength,225);
 const p=motion.pose(750),rest=motion.pose(0);assert.equal(p.torso.angleDegrees,2);
 close(d(p.torso.shoulders.near,p.torso.shoulders.far),d(rest.torso.shoulders.near,rest.torso.shoulders.far));
 for(const side of ['near','far'])assert.deepEqual(p.legs[side].foot,rest.legs[side].foot);
 assert.throws(()=>{motion.model.ball.radius=100},TypeError);
 assert.throws(()=>createMascotModel({motion:{squatDepth:-1}}),/nonnegative/);
 assert.throws(()=>createMascotModel({motion:{releaseVelocity:{y:100}}}),/upward/);
 assert.throws(()=>mascotPose(NaN),/finite/);
});
