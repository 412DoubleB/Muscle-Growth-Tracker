// Native Sites identity plus durable admission protects the limited beta.
// The legacy rollback path is available only with explicit owner-private setup.
import {EQUIPMENT} from '../core.mjs';
import {researchGym,normalizeGymQuery,ProviderError} from '../server/gym-research-provider.mjs';
import {reserveGymResearch,releaseGymResearch,readGymResearchQuota,GYM_AI_TRIAL_LIMIT} from '../server/gym-research-budget.mjs';
import {readBetaStatus,readBetaMembership,enrollBetaMember,readBetaQuota,reserveBetaGymResearch,releaseBetaGymResearch,BETA_CAPACITY,BETA_PERSONAL_LIMIT} from '../server/beta-membership-budget.mjs';
export const TEST_PROJECT='bhyrrxrpqaxiwpfxnwpa';
const BODY_LIMIT=8192;
const HEADERS={'Content-Type':'application/json','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
const json=(value,status=200,headers={})=>new Response(JSON.stringify(value),{status,headers:{...HEADERS,...headers}});
export function gymResearchConfigured(env){
 return env.MENEI_GYM_AI_ENABLED==='true'&&/^sk-[A-Za-z0-9_-]{12,}$/.test(env.OPENAI_API_KEY||'')&&typeof env.GYM_AI_LIMITS?.prepare==='function';
}
async function readQuery(request){
 if((request.headers.get('content-type')||'').split(';')[0].trim().toLowerCase()!=='application/json')throw {code:'UNSUPPORTED_MEDIA_TYPE',status:415};
 const length=request.headers.get('content-length');
 if(length!==null&&(!/^\d+$/.test(length)||+length>BODY_LIMIT))throw {code:'TOO_LARGE',status:413};
 const reader=request.body?.getReader();if(!reader)throw {code:'INVALID_QUERY',status:400};
 const chunks=[];let total=0;
 try{for(;;){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>BODY_LIMIT){await reader.cancel();throw {code:'TOO_LARGE',status:413}}chunks.push(value)}}finally{reader.releaseLock()}
 const bytes=new Uint8Array(total);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength}
 let query;try{query=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes))}catch{throw {code:'INVALID_QUERY',status:400}}
 try{return normalizeGymQuery(query)}catch{throw {code:'INVALID_QUERY',status:400}}
}
const sameOrigin=(request,url)=>request.headers.get('origin')===url.origin&&(!request.headers.get('sec-fetch-site')||request.headers.get('sec-fetch-site')==='same-origin');
const identity=request=>{const id=request.headers.get('oai-authenticated-user-id');return typeof id==='string'&&id.length>0&&id.length<=200&&!/[\u0000-\u0020\u007f]/.test(id)?id:null};
const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function betaPage({signedIn=false,member=false,status,phase='off',unavailable=false}={}){
 const full=status?.remainingSlots===0&&!member;
 const canJoin=signedIn&&!member&&!full&&!unavailable&&(phase==='open'&&status?.bootstrapClosed||phase==='bootstrap'&&!status?.bootstrapClosed);
 const title=unavailable?'Beta setup is being completed':member?'Your beta place is ready':full?'The beta is full':'Join the MENEI beta';
 const description=unavailable?'Please retry later. Your saved device data stays in place.':full?'All 20 places have been taken. Please wait for a future opening. No email waitlist is being collected.':member?'Your account is already enrolled. Signing in again does not use another place.':'The first 20 signed-in ChatGPT accounts can join, including the owner. Each account has five AI gym research attempts when the service is enabled.';
 const action=member?'<a class="button" href="/" target="_top">Open MENEI</a>':!signedIn&&!unavailable?'<a class="button" href="/signin-with-chatgpt?return_to=%2Fbeta" target="_top">Sign in with ChatGPT</a>':canJoin?'<form method="post" action="/api/beta-join"><button type="submit">'+(phase==='bootstrap'?'Reserve owner beta place':'Join the beta')+'</button></form>':'';
 const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MENEI beta</title><style>body{margin:0;background:#101113;color:#f5f5f5;font:17px/1.6 system-ui,sans-serif}main{max-width:600px;margin:8vh auto;padding:28px}h1{font-size:2rem;line-height:1.2}p{color:#c9c9cc}.brand{color:#fdbb16;letter-spacing:.22em}button,.button{display:inline-block;border:0;border-radius:12px;padding:14px 20px;background:#fdbb16;color:#111;font:inherit;font-weight:700;text-decoration:none}small{display:block;margin-top:24px;color:#aaa}a{color:#fdbb16}</style></head><body><main><b class="brand">MENEI</b><h1>'+escapeHtml(title)+'</h1><p>'+escapeHtml(description)+'</p>'+action+'<small>Beta admission uses your ChatGPT account. Inside the app, use your own separate MENEI test account and synthetic data. Use your own browser profile. Saved offline copies and device entries remain on that device. Failed AI requests count toward the allowance.</small></main></body></html>';
 return new Response(html,{status:unavailable?503:200,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'self' https://chatgpt.com"}});
}
async function emptyJoinBody(request){
 const length=request.headers.get('content-length');if(length!==null&&(!/^\d+$/.test(length)||+length>128))return false;
 const reader=request.body?.getReader();if(!reader)return true;let size=0;const chunks=[];
 try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>128){await reader.cancel();return false}chunks.push(value)}}finally{reader.releaseLock()}
 const bytes=new Uint8Array(size);let at=0;for(const c of chunks){bytes.set(c,at);at+=c.byteLength}
 const text=new TextDecoder().decode(bytes);if(!text.trim())return true;
 if((request.headers.get('content-type')||'').split(';')[0].trim().toLowerCase()!=='application/json')return false;
 try{const value=JSON.parse(text);return !!value&&!Array.isArray(value)&&typeof value==='object'&&Object.keys(value).length===0}catch{return false}
}
async function accountContext(id){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(id)))].map(x=>x.toString(16).padStart(2,'0')).join('')}
export function createPreviewWorker({fetcher,now=()=>new Date(),research=researchGym,reserve=reserveGymResearch,release=releaseGymResearch,quota=readGymResearchQuota,membership=readBetaMembership,enroll=enrollBetaMember,betaQuota=readBetaQuota,betaStatus=readBetaStatus,betaReserve=reserveBetaGymResearch,betaRelease=releaseBetaGymResearch}={}){
 async function researchStatus(env,userId=null){
  const enabled=env.MENEI_GYM_AI_ENABLED==='true',keyConfigured=/^sk-[A-Za-z0-9_-]{12,}$/.test(env.OPENAI_API_KEY||'');
  let budget;try{budget=userId?await betaQuota(env.GYM_AI_LIMITS,userId):await quota(env.GYM_AI_LIMITS)}catch{/* Missing bindings or migrations are unavailable, never a fresh quota. */}
  return {enabled,keyConfigured,budgetReady:!!budget,used:budget?.used??null,remaining:budget?.remaining??null,limit:userId?BETA_PERSONAL_LIMIT:GYM_AI_TRIAL_LIMIT,ready:enabled&&keyConfigured&&!!budget};
 }
 return {
 async fetch(request,env){
  const url=new URL(request.url),phase=env.MENEI_BETA_PHASE||'off',userId=identity(request),privateSetup=env.MENEI_BETA_OWNER_PRIVATE==='true';
  const betaActive=phase==='open'||phase==='bootstrap'&&privateSetup;
  const legacyPrivate=phase==='off'&&privateSetup;
  if(!betaActive&&!legacyPrivate)return url.pathname==='/beta'?betaPage({unavailable:true}):json({error:'BETA_UNAVAILABLE'},503);
  let member=null;
  if(betaActive){
   if(url.pathname==='/api/beta-status'&&request.method==='GET'&&phase==='bootstrap'&&privateSetup&&!userId){
    try{return json({storageReady:true,phase,...await betaStatus(env.GYM_AI_LIMITS)})}catch{return json({storageReady:false,phase},503)}
   }
   if(url.pathname==='/beta'&&request.method==='GET'){
    try{const status=await betaStatus(env.GYM_AI_LIMITS);if(userId)member=await membership(env.GYM_AI_LIMITS,userId);return betaPage({signedIn:!!userId,member:member?.member===true,status,phase})}catch{return betaPage({unavailable:true})}
   }
   if(url.pathname==='/api/beta-join'){
    if(request.method!=='POST')return json({error:'METHOD_NOT_ALLOWED'},405,{Allow:'POST'});
    if(!userId)return json({error:'UNAUTHORIZED'},401);
    if(!sameOrigin(request,url))return json({error:'FORBIDDEN'},403);
    if(!await emptyJoinBody(request))return json({error:'INVALID_ENROLLMENT'},400);
    try{
     const result=await enroll(env.GYM_AI_LIMITS,userId,{bootstrap:phase==='bootstrap',now:new Date(now()).getTime()});
     if(!result.admitted){if(request.headers.get('accept')?.includes('text/html')){const page=betaPage({signedIn:true,status:result,phase,unavailable:result.reason!=='full'});return new Response(page.body,{status:result.reason==='full'?403:503,headers:page.headers})}return json({error:result.reason==='full'?'BETA_FULL':'BETA_UNAVAILABLE'},result.reason==='full'?403:503)}
     if(request.headers.get('accept')?.includes('text/html'))return new Response(null,{status:303,headers:{Location:'/','Cache-Control':'private, no-store'}});
     return json({joined:true,role:result.role});
    }catch{return json({error:'BETA_UNAVAILABLE'},503)}
   }
   if(!userId)return json({error:'UNAUTHORIZED',join:'/beta'},401);
   try{member=await membership(env.GYM_AI_LIMITS,userId)}catch{return json({error:'BETA_UNAVAILABLE'},503)}
   if(!member.member){
    if(request.method==='GET'&&request.headers.get('accept')?.includes('text/html')){const page=betaPage({signedIn:true,status:member,phase});return new Response(page.body,{status:403,headers:page.headers})}
    return json({error:member.remainingSlots===0?'BETA_FULL':'BETA_MEMBERSHIP_REQUIRED',join:'/beta'},403);
   }
   if(url.pathname==='/api/beta-status'){
    if(request.method!=='GET')return json({error:'METHOD_NOT_ALLOWED'},405,{Allow:'GET'});
    try{return json({storageReady:true,phase,member:true,role:member.role,...await betaStatus(env.GYM_AI_LIMITS)})}catch{return json({error:'BETA_UNAVAILABLE'},503)}
   }
  }
  if(url.pathname==='/api/gym-research-status'){
   // In beta mode this route is available only after member admission. The
   // explicit owner-private rollback path retains read-only service diagnostics.
   if(request.method!=='GET')return json({error:'METHOD_NOT_ALLOWED'},405,{Allow:'GET'});
   return json(await researchStatus(env,betaActive?userId:null));
  }
  if(url.pathname==='/api/preview-config'){
   if(request.method!=='GET')return json({error:'GET required'},405,{Allow:'GET'});
   const key=env.MENEI_TEST_PUBLISHABLE_KEY;
   if(!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key||''))return json({error:'Test cloud configuration unavailable'},503);
   const status=await researchStatus(env,betaActive?userId:null);
   return json({preview:{localOnly:false,projectRef:TEST_PROJECT},supabase:{url:`https://${TEST_PROJECT}.supabase.co`,key},pushServiceReady:false,authRedirectConfigured:true,gymResearchReady:!!userId&&status.ready,...(betaActive?{betaAccountContext:await accountContext(userId),betaMemberRole:member.role}:{})});
  }
  if(url.pathname==='/api/gym-research'){
   if(request.method!=='POST')return json({error:'METHOD_NOT_ALLOWED'},405,{Allow:'POST'});
   if(!userId)return json({error:'UNAUTHORIZED'},401);
   if(!sameOrigin(request,url))return json({error:'FORBIDDEN'},403);
   if(!gymResearchConfigured(env))return json({error:'DISABLED'},503);
   let lease;
   try{
    const query=await readQuery(request);
    if(request.signal.aborted)return json({error:'UPSTREAM_UNAVAILABLE'},504);
    try{lease=betaActive?await betaReserve(env.GYM_AI_LIMITS,userId,{now:new Date(now()).getTime()}):await reserve(env.GYM_AI_LIMITS,{now:new Date(now()).getTime()})}catch{return json({error:'DISABLED'},503)}
    if(!lease.allowed){const limited=['limit','global_limit'].includes(lease.reason);return json({error:limited?'LIMIT_REACHED':'BUSY'},429,limited?{}:{'Retry-After':'10'})}
    const result=await research(query,{apiKey:env.OPENAI_API_KEY,allowedEquipment:EQUIPMENT,fetcher,now,signal:request.signal});
    return json(result);
   }catch(error){
    if(error instanceof ProviderError){
     const code=error.code==='invalid_query'?'INVALID_QUERY':['invalid_provider_response','response_too_large'].includes(error.code)?'INVALID_RESEARCH':'UPSTREAM_UNAVAILABLE';
     return json({error:code},code==='INVALID_QUERY'?400:error.status===504||error.status===499?504:502);
    }
    if(['INVALID_QUERY','TOO_LARGE','UNSUPPORTED_MEDIA_TYPE'].includes(error?.code))return json({error:error.code},error.status);
    return json({error:'UPSTREAM_UNAVAILABLE'},502);
   }finally{
    if(lease?.allowed)try{await (betaActive?betaRelease:release)(env.GYM_AI_LIMITS,lease.leaseId,{now:new Date(now()).getTime()})}catch{/* A failed release retains the bounded durable lease; it never refunds a use. */}
   }
  }
  if(!env.ASSETS?.fetch)return new Response('Preview assets unavailable',{status:503});
  const asset=await env.ASSETS.fetch(request);
  if(!betaActive)return asset;
  const headers=new Headers(asset.headers);headers.set('Cache-Control','private, no-store');return new Response(asset.body,{status:asset.status,statusText:asset.statusText,headers});
 }
 };
}
export default createPreviewWorker();
