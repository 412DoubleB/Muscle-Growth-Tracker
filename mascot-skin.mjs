// Continuous lower-body skinning for the reconstructed character only. A shared
// source mesh prevents independently rotated knee/ankle cutouts exposing holes.
import {mascotPose} from './mascot-motion.mjs?v=8.2.0';

export const BODY_SKIN_X=Object.freeze([110,142,174,206,238,270,302,334,366,398,430]);
export const BODY_SKIN_Y=Object.freeze([280,300,325,350,375,390,415,440,465,480,490,510,533]);
export const BODY_SKIN_VERTICES=Object.freeze(BODY_SKIN_Y.flatMap(y=>BODY_SKIN_X.map(x=>Object.freeze({x,y}))));
export const BODY_SKIN_TRIANGLES=Object.freeze(BODY_SKIN_Y.slice(1).flatMap((_,row)=>BODY_SKIN_X.slice(1).flatMap((__,col)=>{
 const a=row*BODY_SKIN_X.length+col,b=a+1,c=a+BODY_SKIN_X.length,d=c+1;
 return [Object.freeze([a,b,d]),Object.freeze([a,d,c])];
})));
const rest=mascotPose(0);
const clamp=x=>Math.min(1,Math.max(0,x));
const smooth=(a,b,x)=>{const u=clamp((x-a)/(b-a));return u*u*(3-2*u)};
const apply=(m,p)=>({x:m[0]*p.x+m[2]*p.y+m[4],y:m[1]*p.x+m[3]*p.y+m[5]});
const base=p=>({x:p.x*2.8-230,y:p.y*2.8});
const identity=Object.freeze([1,0,0,1,0,0]);
const rigid=(a,b,c,d)=>{
 const angle=Math.atan2(d.y-c.y,d.x-c.x)-Math.atan2(b.y-a.y,b.x-a.x),co=Math.cos(angle),si=Math.sin(angle);
 return [co,si,-si,co,c.x-co*a.x+si*a.y,c.y-si*a.x-co*a.y];
};
const transforms=pose=>({
 torso:pose.torso.matrix,
 nearThigh:rigid(rest.legs.near.hip,rest.legs.near.knee,pose.legs.near.hip,pose.legs.near.knee),
 nearShin:rigid(rest.legs.near.knee,rest.legs.near.ankle,pose.legs.near.knee,pose.legs.near.ankle),
 farThigh:rigid(rest.legs.far.hip,rest.legs.far.knee,pose.legs.far.hip,pose.legs.far.knee),
 farShin:rigid(rest.legs.far.knee,rest.legs.far.ankle,pose.legs.far.knee,pose.legs.far.ankle)
});
const weighted=(source,world,tx,side)=>{
 // The top edge exactly follows the torso. Broad, smooth skin weights spread
 // bending through continuous flesh/cloth rather than shrinking whole limbs.
 const knee=rest.legs[side].knee,ankle=rest.legs[side].ankle;
 const kneeX=(knee.x+230)/2.8,kneeY=knee.y/2.8,ankleX=(ankle.x+230)/2.8;
 // Broaden weights away from each bone's centreline. Empty vertices outside the
 // silhouette must also deform smoothly rather than folding across its edge.
 const kneeHalf=25+.65*Math.abs(source.x-kneeX),footEnd=side==='near'?490:480;
 const footWidth=(side==='near'?25:30)+.8*Math.abs(source.x-ankleX);
 const thigh=smooth(280,350,source.y),shin=smooth(kneeY-kneeHalf,kneeY+kneeHalf,source.y);
 const feet=smooth(footEnd-footWidth,footEnd,source.y);
 const weights=[1-thigh,thigh*(1-shin),thigh*shin*(1-feet),thigh*shin*feet];
 const points=[apply(tx.torso,world),apply(tx[side+'Thigh'],world),apply(tx[side+'Shin'],world),apply(identity,world)];
 return {x:points.reduce((sum,p,i)=>sum+p.x*weights[i],0),y:points.reduce((sum,p,i)=>sum+p.y*weights[i],0)};
};
const map=(source,tx)=>{
 const world=base(source),near=weighted(source,world,tx,'near'),far=weighted(source,world,tx,'far');
 // Blend across the inner skirt/crotch, not between vertices along a limb.
 // The lower central gap is transparent in this atlas. Both legs retain their
 // own stable bones and their own fixed sandal height/perspective.
 const farWeight=smooth(270,302,source.x);
 return {x:near.x+(far.x-near.x)*farWeight,y:near.y+(far.y-near.y)*farWeight};
};

export function mapMascotBodyPoint(source,pose){
 if(!source||!Number.isFinite(source.x)||!Number.isFinite(source.y))throw new TypeError('Body source point must contain finite x and y');
 return map(source,transforms(pose));
}

export function bodySkinVertices(pose){const tx=transforms(pose);return BODY_SKIN_VERTICES.map(source=>map(source,tx))}

/** SVG affine matrix mapping one source triangle to the matching posed triangle.
 * The caller clips its atlas <use> to BODY_SKIN_VERTICES indexed by the matching
 * BODY_SKIN_TRIANGLES entry, then applies matrix(a b c d e f) to that group.
 */
export function bodySkinTransforms(pose){
 const posed=bodySkinVertices(pose);
 return BODY_SKIN_TRIANGLES.map(([i,j,k])=>{
  const s=BODY_SKIN_VERTICES[i],u=BODY_SKIN_VERTICES[j],v=BODY_SKIN_VERTICES[k],p=posed[i],q=posed[j],r=posed[k];
  const ux=u.x-s.x,uy=u.y-s.y,vx=v.x-s.x,vy=v.y-s.y,det=ux*vy-uy*vx;
  const qx=q.x-p.x,qy=q.y-p.y,rx=r.x-p.x,ry=r.y-p.y;
  const a=(qx*vy-rx*uy)/det,b=(qy*vy-ry*uy)/det,c=(ux*rx-vx*qx)/det,d=(ux*ry-vx*qy)/det;
  return [a,b,c,d,p.x-a*s.x-c*s.y,p.y-b*s.x-d*s.y];
 });
}
