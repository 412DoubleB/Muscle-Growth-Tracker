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
