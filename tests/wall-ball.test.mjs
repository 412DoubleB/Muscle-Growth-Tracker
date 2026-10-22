import test from 'node:test';import assert from 'node:assert/strict';
import {wallBallPose,wallBallSvg,applyWallBallFrame,RELEASE,CATCH,SETTLED} from '../wall-ball.mjs';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
test('solid articulated arms retain bone lengths and stay in contact with the held ball for every frame',()=>{
 for(let t=0;t<=4500;t+=5){const p=wallBallPose(t);for(const arm of [p.near,p.far]){assert.ok(Math.abs(distance(arm.shoulder,arm.elbow)-arm.upper)<1e-8);assert.ok(Math.abs(distance(arm.elbow,arm.palm)-arm.fore)<1e-8)}
  if(p.held){assert.ok(Math.abs(p.near.palm.x-(p.ball.x-.88*p.ball.radius))<1e-8);assert.ok(Math.abs(p.near.palm.y-(p.ball.y+.32*p.ball.radius))<1e-8);assert.ok(Math.abs(p.far.palm.x-(p.ball.x+.91*p.ball.radius))<1e-8)}
 }
});
test('release and catch have no position jump and ball clears receiving hands during the flight',()=>{
 for(const t of [750,RELEASE,CATCH,SETTLED]){const a=wallBallPose(t-.001),b=wallBallPose(t+.001);assert.ok(distance(a.ball,b.ball)<.01);assert.ok(distance(a.near.palm,b.near.palm)<.01);assert.ok(distance(a.far.palm,b.far.palm)<.01)}
 const mid=wallBallPose((RELEASE+CATCH)/2);assert.equal(mid.held,false);assert.ok(distance(mid.ball,mid.far.palm)>mid.ball.radius+40);assert.equal(mid.wallContact,true);
 for(const t of [RELEASE,CATCH]){const velocity=(time,key)=>{const a=wallBallPose(time-.01),b=wallBallPose(time+.01);const pa=key==='ball'?a.ball:a.near.palm,pb=key==='ball'?b.ball:b.near.palm;return{x:(pb.x-pa.x)/.00002,y:(pb.y-pa.y)/.00002}};for(const key of ['ball','hand'])assert.ok(distance(velocity(t-.1,key),velocity(t+.1,key))<5)}
 const start=wallBallPose(0),end=wallBallPose(4500);assert.deepEqual(end.ball,start.ball);assert.deepEqual(end.near,start.near);assert.equal(end.dip,0);
});
test('same palms and single ball persist without pose opacity switches, and frame updates only transforms',()=>{
 for(const t of [0,750,RELEASE,2000,CATCH,SETTLED,4500]){const svg=wallBallSvg(t);assert.equal((svg.match(/id="rigBall"/g)||[]).length,1);for(const id of ['rigNearFore','rigFarFore','rigNearUpper','rigFarUpper'])assert.equal((svg.match(new RegExp(`id="${id}"`,'g'))||[]).length,1);assert.doesNotMatch(svg,/openingThrow|openingOriginal|<animate|opacity="0"[^>]*id="rig(?:Near|Far)/)}
 const writes=[];applyWallBallFrame(id=>({setAttribute:(key,value)=>writes.push({id,key,value})}),CATCH);assert.ok(writes.length>5);for(const w of writes)assert.ok(w.key==='transform'||w.id==='rigWall'&&w.key==='opacity');
});
