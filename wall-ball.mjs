// The reconstructed illustration is used only by the opening scene. All original
// app artwork and the MENEI/wreath identity remain separate and unchanged.
import {mascotPose,MASCOT_DURATION,MASCOT_RELEASE,MASCOT_CATCH,MASCOT_SETTLED} from './mascot-motion.mjs?v=8.2.0';
import {BODY_SKIN_VERTICES,BODY_SKIN_TRIANGLES,bodySkinTransforms} from './mascot-skin.mjs?v=8.2.0';
import {renderMascotSkin,disposeMascotSkin,MASCOT_SKIN_BOUNDS} from './mascot-skin-webgl.mjs?v=8.2.0';
export const WALL_BALL_DURATION=MASCOT_DURATION,RELEASE=MASCOT_RELEASE,CATCH=MASCOT_CATCH,SETTLED=MASCOT_SETTLED;
export const WALL_BALL_ASSET='./artwork/greek-wall-ball-reconstructed.png';
export const WALL_BALL_VIEWBOX=Object.freeze({x:0,y:-330,width:1024,height:1930});
// Matching vector viewports bracket a real HTML canvas. This keeps the original
// SVG fallback and paint order without WebKit's foreignObject compositing gap.
export const wallBallSkinPlacement=()=>({
 left:100*(MASCOT_SKIN_BOUNDS.x-WALL_BALL_VIEWBOX.x)/WALL_BALL_VIEWBOX.width,
 top:100*(MASCOT_SKIN_BOUNDS.y-WALL_BALL_VIEWBOX.y)/WALL_BALL_VIEWBOX.height,
 width:100*MASCOT_SKIN_BOUNDS.width/WALL_BALL_VIEWBOX.width,
 height:100*MASCOT_SKIN_BOUNDS.height/WALL_BALL_VIEWBOX.height
});
export const wallBallPose=milliseconds=>mascotPose(milliseconds);
const num=n=>Number(n.toFixed(5));
const transform=(a,b,sourceA,sourceB)=>{
 const scale=Math.hypot(b.x-a.x,b.y-a.y)/Math.hypot(sourceB.x-sourceA.x,sourceB.y-sourceA.y);
 const rotation=(Math.atan2(b.y-a.y,b.x-a.x)-Math.atan2(sourceB.y-sourceA.y,sourceB.x-sourceA.x))*180/Math.PI;
 return `translate(${num(a.x)} ${num(a.y)}) rotate(${num(rotation)}) scale(${num(scale)}) translate(${-sourceA.x} ${-sourceA.y})`;
};
const matrix=m=>`matrix(${m.map(num).join(' ')})`;
// Only the far palm/fingers have the wrong handedness in the source sheet.
// Reflect their drawing about wrist -> palm, fixing both anchors in place.
// The forearm, its source pixels, and its animated transform stay unchanged.
export const FAR_HAND_WRIST=Object.freeze({x:751,y:799});
export const FAR_HAND_PALM=Object.freeze({x:693,y:853});
const handDx=FAR_HAND_PALM.x-FAR_HAND_WRIST.x,handDy=FAR_HAND_PALM.y-FAR_HAND_WRIST.y,handLength=Math.hypot(handDx,handDy),handUx=handDx/handLength,handUy=handDy/handLength;
export const FAR_HAND_REFLECTION=Object.freeze((()=>{
 const a=handUx*handUx-handUy*handUy,b=2*handUx*handUy;
 return [a,b,b,-a,FAR_HAND_WRIST.x-a*FAR_HAND_WRIST.x-b*FAR_HAND_WRIST.y,FAR_HAND_WRIST.y-b*FAR_HAND_WRIST.x+a*FAR_HAND_WRIST.y];
})());
export function wallBallTransforms(p,includeSkin=true){
 const tr={rigTorso:matrix(p.torso.matrix),rigBall:`translate(${num(p.ball.x)} ${num(p.ball.y)}) scale(${num(p.ball.radius/211)}) translate(-1271 -746)`};
 for(const [side,label]of [['near','Near'],['far','Far']]){
  const a=p.arms[side];
  const upper=side==='near'?[{x:737,y:125},{x:811,y:422}]:[{x:278,y:601},{x:214,y:908}];
  const fore=side==='near'?[{x:1244,y:65},{x:1372,y:393}]:[{x:820,y:560},{x:693,y:853}];
  tr[`rig${label}Upper`]=transform(a.shoulder,a.elbow,...upper);
  // Wrist and fingers stay together as one painted anatomical limb, never
  // independently hinged sprites. The back/inside hand views stay consistent.
  tr[`rig${label}Fore`]=transform(a.elbow,a.palm,...fore);

 }
 if(includeSkin)bodySkinTransforms(p).forEach((m,i)=>{tr[`rigSkin${i}`]=matrix(m)});
 return tr;
}
export function applyWallBallFrame(element,milliseconds){
 const p=wallBallPose(milliseconds);
 const accelerated=typeof element('rigSkinCanvas')?.getContext==='function'&&renderMascotSkin(element,p);
 for(const [id,value]of Object.entries(wallBallTransforms(p,!accelerated)))element(id)?.setAttribute('transform',value);
 element('rigWall')?.setAttribute('opacity',p.wallContact?'.65':'0');
}
export const disposeWallBallScene=element=>disposeMascotSkin(element);
export function wallBallSvg(milliseconds=0,asset=WALL_BALL_ASSET){
 const p=wallBallPose(milliseconds),tr=wallBallTransforms(p);
 const bodyDefs=BODY_SKIN_TRIANGLES.map((indices,i)=>{
  const points=indices.map(index=>BODY_SKIN_VERTICES[index]),center={x:points.reduce((n,p)=>n+p.x,0)/3,y:points.reduce((n,p)=>n+p.y,0)/3};
  // A fraction of a source pixel of bleed covers raster clip antialias seams;
  // all neighbours still share precisely the same transformed mesh vertices.
  const expanded=points.map(p=>{const dx=p.x-center.x,dy=p.y-center.y,d=Math.hypot(dx,dy);return `${num(p.x+.3*dx/d)},${num(p.y+.3*dy/d)}`}).join(' ');
  return `<clipPath id="rigSkinClip${i}"><polygon points="${expanded}"/></clipPath>`;
 }).join('');
 const part=(id,clip,body=false,fade='')=>`<g id="${id}"${tr[id]?` transform="${tr[id]}"`:''}>${body?'<g transform="translate(-230 0) scale(2.8)">':''}<g clip-path="url(#${clip})"${fade?` mask="url(#${fade})"`:''}><use href="#rigAtlasImage"/></g>${body?'</g>':''}</g>`;
 // Preserve the wrist collar too; the blend begins on the palm side of it.
 const wristBand=`x1="${num(FAR_HAND_WRIST.x+10*handUx)}" y1="${num(FAR_HAND_WRIST.y+10*handUy)}" x2="${num(FAR_HAND_WRIST.x+18*handUx)}" y2="${num(FAR_HAND_WRIST.y+18*handUy)}" gradientUnits="userSpaceOnUse"`;
 const farFore=`<g id="rigFarFore" transform="${tr.rigFarFore}"><g clip-path="url(#rigFarForeClip)" mask="url(#rigFarForeMask)"><g mask="url(#rigFarWristKeep)"><use href="#rigAtlasImage"/></g></g><g id="rigFarPalmCorrection" transform="${matrix(FAR_HAND_REFLECTION)}"><g clip-path="url(#rigFarForeClip)" mask="url(#rigFarWristReveal)"><use href="#rigAtlasImage"/></g></g></g>`;
 const skin=wallBallSkinPlacement();
 return `<div class="openingRigStage" aria-hidden="true"><svg class="openingRig openingRigBack" viewBox="0 -330 1024 1930" aria-hidden="true"><defs>
 <filter id="rigAtlasAlpha" x="0" y="0" width="1536" height="1024" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncA type="linear" slope="1.02"/></feComponentTransfer></filter>
 <image id="rigAtlasImage" href="${asset}" width="1536" height="1024" filter="url(#rigAtlasAlpha)"/>
 ${bodyDefs}<clipPath id="rigTorsoClip"><rect x="0" y="0" width="512" height="280"/></clipPath><clipPath id="rigNearUpperClip"><rect x="512" y="0" width="512" height="512"/></clipPath><clipPath id="rigNearForeClip"><rect x="1024" y="0" width="512" height="512"/></clipPath><clipPath id="rigFarUpperClip"><rect x="0" y="533" width="512" height="491"/></clipPath><clipPath id="rigFarForeClip"><rect x="512" y="512" width="512" height="512"/></clipPath><clipPath id="rigBallClip"><rect x="1024" y="512" width="512" height="512"/></clipPath>
 <linearGradient id="rigNearUpperBlend" x1="0" y1="415" x2="0" y2="465" gradientUnits="userSpaceOnUse"><stop stop-color="white"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient><mask id="rigNearUpperMask" maskUnits="userSpaceOnUse" x="512" y="0" width="512" height="512"><rect x="512" y="0" width="512" height="512" fill="url(#rigNearUpperBlend)"/></mask>
 <linearGradient id="rigFarUpperBlend" x1="0" y1="908" x2="0" y2="965" gradientUnits="userSpaceOnUse"><stop stop-color="white"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient><mask id="rigFarUpperMask" maskUnits="userSpaceOnUse" x="0" y="533" width="512" height="491"><rect x="0" y="533" width="512" height="491" fill="url(#rigFarUpperBlend)"/></mask>
 <linearGradient id="rigNearElbowBlend" x1="0" y1="24" x2="0" y2="95" gradientUnits="userSpaceOnUse"><stop stop-color="white" stop-opacity="0"/><stop offset="1" stop-color="white"/></linearGradient><mask id="rigNearForeMask" maskUnits="userSpaceOnUse" x="1024" y="0" width="512" height="512"><rect x="1024" y="0" width="512" height="512" fill="url(#rigNearElbowBlend)"/></mask>
 <linearGradient id="rigFarElbowBlend" x1="0" y1="535" x2="0" y2="595" gradientUnits="userSpaceOnUse"><stop stop-color="white" stop-opacity="0"/><stop offset="1" stop-color="white"/></linearGradient><mask id="rigFarForeMask" maskUnits="userSpaceOnUse" x="512" y="512" width="512" height="512"><rect x="512" y="512" width="512" height="512" fill="url(#rigFarElbowBlend)"/></mask>
 <linearGradient id="rigFarWristKeepGradient" ${wristBand}><stop stop-color="white"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient><linearGradient id="rigFarWristRevealGradient" ${wristBand}><stop stop-color="white" stop-opacity="0"/><stop offset="1" stop-color="white"/></linearGradient>
 <mask id="rigFarWristKeep" maskUnits="userSpaceOnUse" x="512" y="512" width="512" height="512"><rect x="512" y="512" width="512" height="512" fill="url(#rigFarWristKeepGradient)"/></mask><mask id="rigFarWristReveal" maskUnits="userSpaceOnUse" x="512" y="512" width="512" height="512"><rect x="512" y="512" width="512" height="512" fill="url(#rigFarWristRevealGradient)"/></mask></defs>
 ${part('rigFarUpper','rigFarUpperClip',false,'rigFarUpperMask')}
 <g id="rigBodySkin">${BODY_SKIN_TRIANGLES.map((_,i)=>part(`rigSkin${i}`,`rigSkinClip${i}`)).join('')}</g>
 </svg><div id="rigSkinSurface" class="openingSkinSurface" style="display:none;left:${skin.left}%;top:${skin.top}%;width:${skin.width}%;height:${skin.height}%"><canvas id="rigSkinCanvas" width="512" height="376"></canvas></div>
 <svg class="openingRig openingRigFront" viewBox="0 -330 1024 1930" aria-hidden="true">${part('rigTorso','rigTorsoClip',true)}${part('rigNearUpper','rigNearUpperClip',false,'rigNearUpperMask')}
 ${farFore}${part('rigBall','rigBallClip')}${part('rigNearFore','rigNearForeClip',false,'rigNearForeMask')}
 <path id="rigWall" d="M 946 -190 V 160" stroke="#FFB81C" stroke-width="5" opacity="${p.wallContact?'.65':'0'}"/></svg></div>`;
}
