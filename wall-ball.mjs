// Continuous two-link arms: the same solid hands/ball are drawn for every frame.
export const WALL_BALL_DURATION=4500;
export const RELEASE=1450,CATCH=2550,SETTLED=3600;
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
const home={x:620,y:490},launch={x:650,y:130},releaseVelocity={x:220,y:-1000},catchVelocity={x:-220,y:1000},zero={x:0,y:0};
const hermite=(a,b,va,vb,u,seconds)=>{u=clamp(u);const h00=2*u**3-3*u*u+1,h10=u**3-2*u*u+u,h01=-2*u**3+3*u*u,h11=u**3-u*u;return {x:h00*a.x+h10*seconds*va.x+h01*b.x+h11*seconds*vb.x,y:h00*a.y+h10*seconds*va.y+h01*b.y+h11*seconds*vb.y}};
export function armJoints(shoulder,palm,bend=1,upper=225,fore=195,hand=60,plane=0){
 const reach=fore+hand,dx=palm.x-shoulder.x,dy=palm.y-shoulder.y,d=Math.hypot(dx,dy);
 if(d<=Math.abs(upper-reach)||d>=upper+reach)throw Error('Wall-ball hand target is outside arm reach');
 const along=(d*d+upper*upper-reach*reach)/(2*d),height=Math.sqrt(Math.max(0,upper*upper-along*along));
 // The elbow rotates in depth as the arm rises; the wrist is a separate, neutral joint.
 const elbow={x:shoulder.x+dx/d*along-dy/d*height*bend*Math.cos(plane),y:shoulder.y+dy/d*along+dx/d*height*bend*Math.cos(plane),z:height*Math.sin(plane)};
 const wrist={x:elbow.x+(palm.x-elbow.x)*fore/reach,y:elbow.y+(palm.y-elbow.y)*fore/reach,z:elbow.z*(1-fore/reach)};
 return {shoulder:{...shoulder,z:0},elbow,wrist,palm:{...palm,z:0},upper,fore,hand};
}
export function wallBallPose(milliseconds){
 const t=clamp(milliseconds,0,WALL_BALL_DURATION);let dip=0,ball,grip,held=true;
 if(t<750){dip=95*smooth(t/750);ball={x:home.x,y:home.y+dip};grip=ball}
 else if(t<RELEASE){const u=smooth((t-750)/(RELEASE-750));dip=95*(1-u);ball=hermite({x:home.x,y:home.y+95},launch,zero,releaseVelocity,(t-750)/(RELEASE-750),(RELEASE-750)/1000);grip=ball}
 else if(t<CATCH){
  held=false;const seconds=(t-RELEASE)/1000,total=(CATCH-RELEASE)/1000;
  ball={x:launch.x+220*Math.min(seconds,total-seconds),y:launch.y-1000*seconds+1000/total*seconds*seconds};
  // Small follow-through, then the hands wait at the incoming ball's actual catch position.
  const ready={x:680,y:80};grip=t<RELEASE+150?hermite(launch,ready,releaseVelocity,zero,(t-RELEASE)/150,.15):t>CATCH-150?hermite(ready,launch,zero,catchVelocity,(t-(CATCH-150))/150,.15):ready;
 }else{ball=hermite(launch,home,catchVelocity,zero,(t-CATCH)/(SETTLED-CATCH),(SETTLED-CATCH)/1000);grip=ball;dip=t>=SETTLED?0:22*Math.sin(Math.PI*clamp((t-CATCH)/(SETTLED-CATCH)))**2}
 const radius=155,nearPalm={x:grip.x-.62*radius,y:grip.y+.12*radius},elevation=smooth((home.y-grip.y)/(home.y-launch.y)),farPalm={x:grip.x+(.70+.18*elevation)*radius,y:grip.y-.02*radius};
 return {t,dip,ball:{...ball,radius},held,near:armJoints({x:350,y:455+dip},nearPalm,1,225,195,60,Math.PI*elevation),far:armJoints({x:650,y:464+dip},farPalm),wallContact:Math.abs(t-(RELEASE+CATCH)/2)<65};
}
const num=n=>Number(n.toFixed(4));
const transform=(a,b,sourceA,sourceB)=>{
 const dx=sourceB.x-sourceA.x,dy=sourceB.y-sourceA.y,scale=Math.hypot(b.x-a.x,b.y-a.y)/Math.hypot(dx,dy);
 const rotation=(Math.atan2(b.y-a.y,b.x-a.x)-Math.atan2(dy,dx))*180/Math.PI;
 return `translate(${num(a.x)} ${num(a.y)}) rotate(${num(rotation)}) scale(${num(scale)}) translate(${-sourceA.x} ${-sourceA.y})`;
};
export function wallBallTransforms(pose){
 const p=pose;
 return {
  rigTorso:`translate(0 ${num(p.dip)})`,
  rigLegs:`translate(0 1469) scale(1 ${num(1-p.dip/720)}) translate(0 -1469)`,
  rigNearJoint:`translate(${num(p.near.elbow.x)} ${num(p.near.elbow.y)})`,
  rigFarJoint:`translate(${num(p.far.elbow.x)} ${num(p.far.elbow.y)})`,
  rigNearUpper:transform(p.near.shoulder,p.near.elbow,{x:790,y:115},{x:800,y:452}),
  rigNearFore:transform(p.near.elbow,p.near.wrist,{x:755,y:570},{x:784,y:830}),
  rigNearHand:transform(p.near.wrist,p.near.palm,{x:335,y:565},{x:500,y:350}),
  rigFarUpper:transform(p.far.shoulder,p.far.elbow,{x:250,y:620},{x:240,y:950}),
  rigFarFore:transform(p.far.elbow,p.far.wrist,{x:1290,y:60},{x:1263,y:330}),
  rigFarHand:transform(p.far.wrist,p.far.palm,{x:1445,y:570},{x:1290,y:320}),
  rigBall:`translate(${num(p.ball.x)} ${num(p.ball.y)})`,
 };
}
export function applyWallBallFrame(element,milliseconds){
 const pose=wallBallPose(milliseconds);
 for(const [id,value]of Object.entries(wallBallTransforms(pose)))element(id)?.setAttribute('transform',value);
 element('rigWall')?.setAttribute('opacity',pose.wallContact?'.65':'0');
}
export function wallBallSvg(milliseconds=0,asset='./artwork/greek-wall-ball-rig.png',hands='./artwork/greek-wall-ball-hands.png'){
 const p=wallBallPose(milliseconds),tr=wallBallTransforms(p);
 const image=`<image href="${asset}" width="1536" height="1024"/>`;
 // Source cells stay intact. Clipping is a render viewport, never a source-image rewrite.
 const piece=(id,cell)=>`<g id="${id}" transform="${tr[id]}"><g clip-path="url(#rigCell${cell})">${image}</g></g>`;
 const hand=id=>`<g id="${id}" transform="${tr[id]}"><g clip-path="url(#${id}Clip)"><image href="${hands}" width="1774" height="887"/></g></g>`;
 const base=`<svg x="-238" y="-40" width="1280" height="1536" viewBox="0 0 512 512" preserveAspectRatio="none" overflow="hidden"><g clip-path="url(#rigCell0)">${image}</g></svg>`;
 const joint=id=>`<g id="${id}" transform="${tr[id]}"><circle r="31" fill="url(#rigElbowGold)"/></g>`;
 return `<svg class="openingRig" viewBox="0 -330 1024 1930" aria-hidden="true"><defs>${Array.from({length:6},(_,i)=>`<clipPath id="rigCell${i}"><rect x="${i%3*512}" y="${Math.floor(i/3)*512}" width="512" height="512"/></clipPath>`).join('')}<clipPath id="rigCellNearFore"><rect x="512" y="512" width="512" height="318"/></clipPath><clipPath id="rigCellFarFore"><rect x="1024" y="0" width="512" height="335"/></clipPath><clipPath id="rigNearHandClip"><polygon points="0,0 887,0 887,887 627,887 0,260"/></clipPath><clipPath id="rigFarHandClip"><polygon points="887,0 1774,0 1774,261 1148,887 887,887"/></clipPath><clipPath id="rigGlobeClip"><circle cx="1265" cy="758" r="205"/></clipPath><clipPath id="rigTorsoClip"><rect x="0" y="-40" width="1024" height="789"/></clipPath><clipPath id="rigLegsClip"><rect x="0" y="749" width="1024" height="850"/></clipPath><radialGradient id="rigElbowGold" cx=".3" cy=".25" r=".85"><stop offset="0" stop-color="#f8d477"/><stop offset=".5" stop-color="#d6a039"/><stop offset="1" stop-color="#79500e"/></radialGradient></defs>
 ${piece('rigFarUpper',3)}<g id="rigLegs" transform="${tr.rigLegs}"><g clip-path="url(#rigLegsClip)">${base}</g></g><g id="rigTorso" transform="${tr.rigTorso}"><g clip-path="url(#rigTorsoClip)">${base}</g></g>
 ${piece('rigNearUpper',1)}
 ${piece('rigFarFore','FarFore')}${hand('rigFarHand')}
 <g id="rigBall" transform="${tr.rigBall}"><svg x="-155" y="-155" width="310" height="310" viewBox="1055 550 450 450" overflow="hidden"><g clip-path="url(#rigGlobeClip)">${image}</g></svg></g>
 ${piece('rigNearFore','NearFore')}${hand('rigNearHand')}${joint('rigFarJoint')}${joint('rigNearJoint')}
 <path id="rigWall" d="M 935 -190 V 160" stroke="#FFB81C" stroke-width="5" opacity="${p.wallContact?'.65':'0'}"/></svg>`;
}
