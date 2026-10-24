import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {wallBallPose,wallBallSvg,wallBallTransforms,applyWallBallFrame,RELEASE,CATCH,SETTLED,WALL_BALL_ASSET,WALL_BALL_DURATION} from '../wall-ball.mjs';

test('one coherent reconstructed atlas draws continuous forearm/hands and articulated legs without mechanical joint caps',()=>{
 for(const t of [0,750,RELEASE,2000,CATCH,SETTLED,WALL_BALL_DURATION]){
  const svg=wallBallSvg(t);
  assert.equal((svg.match(/<image /g)||[]).length,1,'Load the coherent source once');
  assert.ok(svg.includes(WALL_BALL_ASSET));
  for(const id of ['rigBall','rigTorso','rigNearFore','rigFarFore','rigNearUpper','rigFarUpper','rigBodySkin'])assert.equal((svg.match(new RegExp(`id="${id}"`,'g'))||[]).length,1);
  assert.doesNotMatch(svg,/rigElbowGold|rigNearJoint|rigFarJoint|rigNearHand|rigFarHand|<circle|<animate|openingThrow|openingOriginal/);
  assert.doesNotMatch(svg,/scale\(1 /,'Legs must articulate, never squash');
 }
 const svg=wallBallSvg();
 assert.ok(svg.indexOf('id="rigFarFore"')<svg.indexOf('id="rigBall"'),'Far palm stays behind sphere');
 assert.ok(svg.indexOf('id="rigBall"')<svg.indexOf('id="rigNearFore"'),'Near hand stays visible on sphere');
 assert.match(svg,/id="rigBallClip"><rect x="1024" y="512" width="512" height="512"/,'Preserve the whole reconstructed globe silhouette');
 assert.match(svg,/id="rigSkinClip239"/,'Use a shared continuous lower-body skin instead of disconnected leg cutouts');
});

test('frame updates move limbs and ball while fixed sandals and original app state remain outside the animator',()=>{
 const writes=[];applyWallBallFrame(id=>({setAttribute:(key,value)=>writes.push({id,key,value})}),750);
 for(const w of writes){assert.ok(w.key==='transform'||w.id==='rigWall'&&w.key==='opacity');assert.doesNotMatch(w.id,/Foot|Hand|openingWord|Wreath|Emblem/)}
 for(const id of ['rigSkin0','rigSkin239','rigNearFore','rigFarFore'])assert.ok(writes.some(w=>w.id===id));
 assert.deepEqual(wallBallTransforms(wallBallPose(0)),wallBallTransforms(wallBallPose(4500)));
 for(const tr of Object.values(wallBallTransforms(wallBallPose(750))))assert.doesNotMatch(tr,/NaN|Infinity/);
});

test('original mascot and M/wreath brand remain exact protected files while new artwork stays separate',async()=>{
 for(const [path,hash]of [
  ['artwork/greek-athlete-gold.webp','2ba487632306ec314b23091daeb3bbeac99f28e68f719049ce01bc2da3c74518'],
  ['brand-emblem.svg','473925924261ce299e28cff733be6b6553d310f6119e5a7ecf66d66a11aa43d4']
 ])assert.equal(createHash('sha256').update(await readFile(new URL('../'+path,import.meta.url))).digest('hex'),hash);
 const image=await readFile(new URL('../'+WALL_BALL_ASSET.slice(2),import.meta.url));
 assert.equal(image.subarray(1,4).toString(),'PNG');assert.equal(image.readUInt32BE(16),1536);assert.equal(image.readUInt32BE(20),1024);
 const app=await readFile(new URL('../app.mjs',import.meta.url),'utf8');
 assert.match(app,/<img id="openingAtlas" src="\.\/artwork\/greek-wall-ball-reconstructed.png"/);
 assert.ok((app.match(/greek-athlete-gold.webp/g)||[]).length>1,'Original artwork stays in the app');
});

test('far-hand chirality changes only the palm drawing, preserving its wrist and palm anchors and every accepted motion transform',async()=>{
 const {FAR_HAND_REFLECTION:m,FAR_HAND_WRIST:w,FAR_HAND_PALM:p}=await import('../wall-ball.mjs');
 const apply=q=>({x:m[0]*q.x+m[2]*q.y+m[4],y:m[1]*q.x+m[3]*q.y+m[5]});
 const cross=q=>(p.x-w.x)*(q.y-w.y)-(p.y-w.y)*(q.x-w.x);
 for(const q of [w,p])assert.ok(Math.hypot(apply(q).x-q.x,apply(q).y-q.y)<1e-8,'Hand must remain attached at the same wrist/palm');
 assert.ok(Math.abs(m[0]*m[3]-m[1]*m[2]+1)<1e-8,'Opposite handedness requires one reflection');
 const thumb={x:620,y:817};assert.ok(cross(thumb)*cross(apply(thumb))<0,'Thumb changes side of the hand axis');
 const transforms=[];for(let t=0;t<=4500;t+=50)transforms.push(wallBallTransforms(wallBallPose(t)));
 // Recorded from the owner-accepted reconstruction, commit358eeff, before
 // correcting this hand. All body, limb, ball and skin transforms stay exact.
 assert.equal(createHash('sha256').update(JSON.stringify(transforms)).digest('hex'),'dc4874ffdcacf9600d339828bb8ee539205479d6dae1c0e882f1e5758ccb33a4');
 const svg=wallBallSvg(2000);assert.equal((svg.match(/id="rigFarPalmCorrection"/g)||[]).length,1);
 assert.match(svg,/id="rigFarFore"[^>]*><g clip-path="url\(#rigFarForeClip\)" mask="url\(#rigFarForeMask\)"><g mask="url\(#rigFarWristKeep\)"/,'Keep the original forearm pixels');
 assert.ok(svg.indexOf('id="rigFarPalmCorrection"')<svg.indexOf('id="rigBall"'),'Corrected palm remains behind globe');
 assert.equal(createHash('sha256').update(await readFile(new URL('../artwork/greek-wall-ball-reconstructed.png',import.meta.url))).digest('hex'),'07d8b6cfd2d156ffa19a74fd28ccee435961f8a8ec9a9a733bda9f6487efac26','Do not regenerate any accepted artwork');
});

test('lower-body GPU canvas stays outside SVG with the original back-to-front paint order',()=>{
 const html=wallBallSvg(),stack=[];let canvasFound=false;
 assert.doesNotMatch(html,/<foreignObject\b/i,'WebKit can draw WebGL successfully without painting a foreignObject canvas');
 for(const match of html.matchAll(/<(\/?)(svg|canvas|div)\b[^>]*>/g)){
  if(match[1]){assert.equal(stack.pop(),match[2]);continue}
  if(/id="rigSkinCanvas"/.test(match[0])){canvasFound=true;assert.ok(!stack.includes('svg'),'GPU surface must be a normal HTML layer');assert.deepEqual(stack,['div','div'])}
  stack.push(match[2]);
 }
 assert.equal(canvasFound,true);assert.deepEqual(stack,[]);
 const back=html.indexOf('class="openingRig openingRigBack"'),skin=html.indexOf('id="rigBodySkin"'),canvas=html.indexOf('id="rigSkinSurface"'),front=html.indexOf('class="openingRig openingRigFront"');
 assert.ok(back<skin&&skin<canvas&&canvas<front);
 assert.ok(html.indexOf('id="rigFarUpper"')<skin);
 assert.ok(front<html.indexOf('id="rigTorso"'));
 assert.deepEqual([...html.matchAll(/viewBox="([^"]+)"/g)].map(m=>m[1]),['0 -330 1024 1930','0 -330 1024 1930']);
});

test('HTML body layer maps to the same world coordinates as both SVG layers at every phone size and pose',async()=>{
 const {wallBallSkinPlacement,WALL_BALL_VIEWBOX:v}=await import('../wall-ball.mjs');
 const {MASCOT_SKIN_BOUNDS:b}=await import('../mascot-skin-webgl.mjs');
 const {bodySkinVertices}=await import('../mascot-skin.mjs');
 const place=wallBallSkinPlacement();
 for(const stageWidth of [80,126,180,199,207,320]){
  const stageHeight=stageWidth*v.height/v.width,scale=stageWidth/v.width;
  for(let t=0;t<=4500;t+=50)for(const p of bodySkinVertices(wallBallPose(t))){
   assert.ok(p.x>=b.x-1e-8&&p.x<=b.x+b.width+1e-8,'No clipping at a side of the body canvas');
   assert.ok(p.y>=b.y-1e-8&&p.y<=b.y+b.height+1e-8,'No clipping at top/bottom of the body canvas');
   const canvasX=stageWidth*(place.left/100+(p.x-b.x)/b.width*place.width/100);
   const canvasY=stageHeight*(place.top/100+(p.y-b.y)/b.height*place.height/100);
   assert.ok(Math.abs(canvasX-(p.x-v.x)*scale)<1e-8);
   assert.ok(Math.abs(canvasY-(p.y-v.y)*scale)<1e-8);
  }
 }
 const css=await readFile(new URL('../styles.css',import.meta.url),'utf8');
 assert.match(css,/\.openingRigStage\{[^}]*aspect-ratio:1024\/1930/);
 assert.match(css,/\.openingRigBack\{z-index:0\}/);
 assert.match(css,/\.openingSkinSurface\{[^}]*z-index:1/);
 assert.match(css,/\.openingRigFront\{z-index:2\}/);
});
