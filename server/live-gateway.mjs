// Prepared production gateway; not enabled by a frontend publication.
// Reuses the existing campaign/D1 and provider secret without resetting usage.
import {createPreviewWorker} from '../scripts/preview-config-worker.mjs';
import {authenticateLiveMeneiAccount,AuthError} from './menei-beta-auth.mjs';
import {readBetaStatus,BETA_CAMPAIGN_ID} from './beta-membership-budget.mjs';
const ORIGIN='https://412doubleb.github.io';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const routes=new Map([['join','beta-join'],['status','beta-status'],['research','gym-research'],['research-status','gym-research-status']]);
export function createLiveGateway({authenticate=authenticateLiveMeneiAccount,status=readBetaStatus,...dependencies}={}){
 async function ownerReady(db,env){
  if(!UUID.test(env.MENEI_LIVE_OWNER_ID||'')||!UUID.test(env.MENEI_LINKED_BETA_OWNER_ID||''))return false;
  const row=await db.prepare('SELECT owner_user_id FROM menei_beta_campaigns WHERE id=?').bind(BETA_CAMPAIGN_ID).first();
  if(row?.owner_user_id!=='menei:'+env.MENEI_LINKED_BETA_OWNER_ID)return false;
  // A pre-existing second preview account needs an explicitly reviewed link,
  // never an inferred email match or a fresh second allocation.
  const old=await db.prepare("SELECT count(*) AS unlinked FROM menei_beta_members WHERE site_user_id!=? AND site_user_id NOT LIKE 'menei:live:%'").bind(row.owner_user_id).first();
  return old?.unlinked===0;
 }
 return {async fetch(request,env){
  const url=new URL(request.url),origin=request.headers.get('origin');
  const headers={'Content-Type':'application/json','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff',Vary:'Origin',...(origin===ORIGIN?{'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Authorization, Content-Type','Access-Control-Expose-Headers':'Retry-After'}:{})};
  const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
  const route=routes.get(url.pathname.replace(/^\/api\/live\//,''));
  if(!url.pathname.startsWith('/api/live/')||!route)return json({error:'NOT_FOUND'},404);
  if(origin!==ORIGIN)return json({error:'FORBIDDEN'},403);
  if(request.method==='OPTIONS'){
   const method=request.headers.get('access-control-request-method');
   const names=(request.headers.get('access-control-request-headers')||'').toLowerCase().split(',').map(s=>s.trim()).filter(Boolean);
   return ['GET','POST'].includes(method)&&names.every(n=>['authorization','content-type'].includes(n))?new Response(null,{status:204,headers}):json({error:'FORBIDDEN'},403);
  }
  if(env.MENEI_LIVE_API_ENABLED!=='true'||env.MENEI_GYM_AI_ENABLED!=='true'||!['owner','open'].includes(env.MENEI_LIVE_PHASE))return json({error:'DISABLED'},503);
  try{await status(env.GYM_AI_LIMITS);if(!await ownerReady(env.GYM_AI_LIMITS,env))return json({error:'BETA_UNAVAILABLE'},503)}catch{return json({error:'BETA_UNAVAILABLE'},503)}
  // Only live Auth validates requests. Legacy ownership is an operator-reviewed
  // exact UUID pair; other accounts get a distinct namespace, not a new trial.
  const inner=createPreviewWorker({...dependencies,betaStatus:status,ownerReady:db=>ownerReady(db,env),authenticate:async(req,settings,options)=>{
   const user=await authenticate(req,settings,options);
   if(env.MENEI_LIVE_PHASE==='owner'&&user.id!==env.MENEI_LIVE_OWNER_ID)throw new AuthError('live_pilot_owner_required',403);
   return {id:user.id===env.MENEI_LIVE_OWNER_ID?env.MENEI_LINKED_BETA_OWNER_ID:'live:'+user.id};
  }});
  const target=new URL('/api/'+route,url),forwarded=new Headers(request.headers);forwarded.set('origin',url.origin);forwarded.delete('sec-fetch-site');
  const internal=new Request(target,{method:request.method,headers:forwarded,...(['GET','HEAD'].includes(request.method)?{}:{body:request.body,duplex:'half'}),signal:request.signal});
  const response=await inner.fetch(internal,{...env,MENEI_BETA_PHASE:'open',MENEI_BETA_OWNER_PRIVATE:'false'});
  const output=new Headers(response.headers);for(const [name,value]of Object.entries(headers))output.set(name,value);
  return new Response(response.body,{status:response.status,headers:output});
 }};
}
// When native hosting is opened for the production API, retain the private
// preview behind the platform's authenticated, Site-scoped owner identity.
// API consumers never need a platform/ChatGPT login. That login applies only
// to the owner's retained preview, not to the public MENEI frontend.
export function createReleaseGateway({live=createLiveGateway(),preview=createPreviewWorker()}={}){
 return {async fetch(request,env){
  if(new URL(request.url).pathname.startsWith('/api/live/'))return live.fetch(request,env);
  const owner=env.MENEI_PRIVATE_SITE_OWNER_ID;
  if(typeof owner!=='string'||!owner||owner.length>200||request.headers.get('oai-authenticated-user-id')!==owner)return new Response('Private preview. Open MENEI at https://412doubleb.github.io/Muscle-Growth-Tracker/',{status:403,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
  return preview.fetch(request,env);
 }};
}
export default createReleaseGateway();
