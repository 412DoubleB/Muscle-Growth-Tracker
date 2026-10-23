import test from 'node:test';
import assert from 'node:assert/strict';
import {mascotPose,MASCOT_DURATION} from '../mascot-motion.mjs';
import {BODY_SKIN_VERTICES,BODY_SKIN_TRIANGLES,bodySkinTransforms,bodySkinVertices,mapMascotBodyPoint} from '../mascot-skin.mjs';
const close=(a,b,tolerance=1e-8)=>assert.ok(Math.abs(a-b)<tolerance,`${a} != ${b}`);
const apply=(m,p)=>({x:m[0]*p.x+m[2]*p.y+m[4],y:m[1]*p.x+m[3]*p.y+m[5]});
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

test('shared source mesh has no disconnected interior edges and rest maps exactly to the uniform source body transform',()=>{
 const edges=new Map(),matrices=bodySkinTransforms(mascotPose(0));
 assert.equal(BODY_SKIN_VERTICES.length,143);assert.equal(BODY_SKIN_TRIANGLES.length,240);
 BODY_SKIN_TRIANGLES.forEach((triangle,i)=>{
  for(const index of triangle){assert.ok(index>=0&&index<BODY_SKIN_VERTICES.length);const s=BODY_SKIN_VERTICES[index],p=apply(matrices[i],s);close(p.x,s.x*2.8-230);close(p.y,s.y*2.8)}
  for(const [a,b]of [[triangle[0],triangle[1]],[triangle[1],triangle[2]],[triangle[2],triangle[0]]]){const key=[a,b].sort((x,y)=>x-y).join(',');edges.set(key,(edges.get(key)||0)+1)}
 });
 for(const [key,count]of edges){assert.ok(count===1||count===2);if(count===1){const [a,b]=key.split(',').map(Number).map(i=>BODY_SKIN_VERTICES[i]);assert.ok(a.x===b.x&&(a.x===110||a.x===430)||a.y===b.y&&(a.y===280||a.y===533),'Only the rectangle perimeter can have an unshared edge')}}
});

test('skin stays finite, noninverted and joined throughout the complete squat, flight, catch and return',()=>{
 let minimum=Infinity;
 for(let t=0;t<=MASCOT_DURATION;t+=10){
  const pose=mascotPose(t),vertices=bodySkinVertices(pose),matrices=bodySkinTransforms(pose);
  matrices.forEach((m,i)=>{
   for(const value of m)assert.ok(Number.isFinite(value));const determinant=m[0]*m[3]-m[1]*m[2];minimum=Math.min(minimum,determinant);assert.ok(determinant>0,'Triangle '+i+' inverted at '+t+' determinant '+determinant);
   BODY_SKIN_TRIANGLES[i].forEach(index=>assert.ok(distance(apply(m,BODY_SKIN_VERTICES[index]),vertices[index])<1e-8,'Adjacent triangles must map their common edge vertices identically'));
  });
 }
 assert.ok(minimum>.1,'Retain a positive area margin, not merely nonnegative triangles');
});

test('the top edge follows the rigid torso and visible sandals remain fixed at their separate source heights',()=>{
 for(let t=0;t<=MASCOT_DURATION;t+=10){const pose=mascotPose(t);
  for(let x=110;x<=430;x+=16){const source={x,y:280},world={x:x*2.8-230,y:280*2.8},mapped=mapMascotBodyPoint(source,pose);assert.ok(distance(mapped,apply(pose.torso.matrix,world))<1e-8)}
  for(const source of [{x:145,y:490},{x:170,y:510},{x:190,y:533},{x:320,y:480},{x:365,y:490},{x:410,y:510}]){const mapped=mapMascotBodyPoint(source,pose);close(mapped.x,source.x*2.8-230);close(mapped.y,source.y*2.8)}
 }
 assert.deepEqual(bodySkinTransforms(mascotPose(4500)),bodySkinTransforms(mascotPose(0)));
});
