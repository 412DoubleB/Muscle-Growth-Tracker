// MENEI accounts authenticate beta services. No ChatGPT identity or personal
// OpenAI credential is required by testers; only the server holds the API key.
import {EQUIPMENT} from '../core.mjs';
import {researchGym,normalizeGymQuery,ProviderError} from '../server/gym-research-provider.mjs';
import {readBetaStatus,readBetaMembership,enrollBetaMember,readBetaQuota,reserveBetaGymResearch,releaseBetaGymResearch,BETA_PERSONAL_LIMIT,BETA_CAMPAIGN_ID} from '../server/beta-membership-budget.mjs';
import {authenticateMeneiAccount,AuthError} from '../server/menei-beta-auth.mjs';
export const TEST_PROJECT='bhyrrxrpqaxiwpfxnwpa';
const BODY_LIMIT=8192;
const HEADERS={'Content-Type':'application/json','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
const json=(value,status=200,headers={})=>new Response(JSON.stringify(value),{status,headers:{...HEADERS,...headers}});
const sameOrigin=(request,url)=>request.headers.get('origin')===url.origin&&(!request.headers.get('sec-fetch-site')||request.headers.get('sec-fetch-site')==='same-origin');
export function gymResearchConfigured(env){return env.MENEI_GYM_AI_ENABLED==='true'&&/^sk-[A-Za-z0-9_-]{12,}$/.test(env.OPENAI_API_KEY||'')&&typeof env.GYM_AI_LIMITS?.prepare==='function'}
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
async function emptyJoinBody(request){
 const length=request.headers.get('content-length');if(length!==null&&(!/^\d+$/.test(length)||+length>128))return false;
 const reader=request.body?.getReader();if(!reader)return true;let size=0;const chunks=[];
 try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>128){await reader.cancel();return false}chunks.push(value)}}finally{reader.releaseLock()}
 const bytes=new Uint8Array(size);let at=0;for(const c of chunks){bytes.set(c,at);at+=c.byteLength}
 const text=new TextDecoder().decode(bytes);if(!text.trim())return true;
 if((request.headers.get('content-type')||'').split(';')[0].trim().toLowerCase()!=='application/json')return false;
 try{const value=JSON.parse(text);return !!value&&!Array.isArray(value)&&typeof value==='object'&&Object.keys(value).length===0}catch{return false}
}

async function meneiOwnerReady(db){const owner=await db.prepare('SELECT owner_user_id FROM menei_beta_campaigns WHERE id=?').bind(BETA_CAMPAIGN_ID).first();return typeof owner?.owner_user_id==='string'&&owner.owner_user_id.startsWith('menei:')}
export function createPreviewWorker({fetcher,authFetcher,now=()=>new Date(),research=researchGym,authenticate=authenticateMeneiAccount,membership=readBetaMembership,enroll=enrollBetaMember,betaQuota=readBetaQuota,betaStatus=readBetaStatus,betaReserve=reserveBetaGymResearch,betaRelease=releaseBetaGymResearch,ownerReady=meneiOwnerReady,report=diagnostic=>console.warn(diagnostic)}={}){
 function reportFailure(error){
  // Only these static categories and a bounded HTTP status may enter logs.
  // Reporting cannot change the response, retry research or delay lease release.
  try{Promise.resolve(report({event:'gym_research_failure',...ProviderError.diagnostic(error)})).catch(()=>{})}catch{}
 }
 async function cohort(env){const status=await betaStatus(env.GYM_AI_LIMITS);if((env.MENEI_BETA_PHASE==='open'&&!status.bootstrapClosed)||(status.bootstrapClosed&&!await ownerReady(env.GYM_AI_LIMITS)))throw Error('MENEI beta owner is not ready.');return status}
 async function researchStatus(env,userId){
  const enabled=env.MENEI_GYM_AI_ENABLED==='true',keyConfigured=/^sk-[A-Za-z0-9_-]{12,}$/.test(env.OPENAI_API_KEY||'');
  let budget;try{budget=await betaQuota(env.GYM_AI_LIMITS,userId)}catch{}
  return {enabled,keyConfigured,budgetReady:!!budget,used:budget?.used??null,remaining:budget?.remaining??null,limit:BETA_PERSONAL_LIMIT,ready:enabled&&keyConfigured&&!!budget};
 }
 return {async fetch(request,env){
  const url=new URL(request.url),phase=env.MENEI_BETA_PHASE,privateSetup=env.MENEI_BETA_OWNER_PRIVATE==='true';
  const active=phase==='open'||phase==='bootstrap'&&privateSetup;
  // Public app code and the fixed publishable client config let a tester sign
  // into MENEI itself. No personal records or provider secrets are public assets.
  if(url.pathname==='/api/preview-config'){
   if(request.method!=='GET')return json({error:'METHOD_NOT_ALLOWED'},405,{Allow:'GET'});
   if(!active)return json({error:'BETA_UNAVAILABLE'},503);
   const key=env.MENEI_TEST_PUBLISHABLE_KEY;if(!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key||''))return json({error:'Test cloud configuration unavailable'},503);
   let status;try{status=await cohort(env)}catch{}
   return json({preview:{localOnly:false,projectRef:TEST_PROJECT},supabase:{url:`https://${TEST_PROJECT}.supabase.co`,key},pushServiceReady:privateSetup&&phase==='bootstrap'&&env.MENEI_PUSH_ENABLED==='true'&&/^B[A-Za-z0-9_-]{86}$/.test(env.MENEI_PUSH_PUBLIC_KEY||''),pushPilot:'private-test',vapidPublicKey:/^B[A-Za-z0-9_-]{86}$/.test(env.MENEI_PUSH_PUBLIC_KEY||'')?env.MENEI_PUSH_PUBLIC_KEY:null,authRedirectConfigured:true,betaAdmissionRequired:true,betaPhase:phase,betaStorageReady:!!status,gymResearchReady:gymResearchConfigured(env)&&!!status});
  }
  if(url.pathname==='/api/beta-readiness'){
   if(request.method!=='GET')return json({error:'METHOD_NOT_ALLOWED'},405,{Allow:'GET'});
   // Temporary service diagnostics rely on native owner-only setup access.
   // They are never available once first-come enrollment is opened.
   if(phase!=='bootstrap'||!privateSetup)return json({error:'FORBIDDEN'},403);
   try{const status=await betaStatus(env.GYM_AI_LIMITS);let ownerAccountReady=false;if(status.bootstrapClosed)ownerAccountReady=await ownerReady(env.GYM_AI_LIMITS);return json({storageReady:true,phase,identityMode:'menei',ownerAccountReady,...status})}catch{return json({storageReady:false,phase,identityMode:'menei'},503)}
  }
  if(url.pathname.startsWith('/api/')){
   const join=url.pathname==='/api/beta-join',status=url.pathname==='/api/beta-status',health=url.pathname==='/api/gym-research-status',ai=url.pathname==='/api/gym-research';
   if(!join&&!status&&!health&&!ai)return json({error:'NOT_FOUND'},404);
   const method=join||ai?'POST':'GET';if(request.method!==method)return json({error:'METHOD_NOT_ALLOWED'},405,{Allow:method});
   if(!active)return json({error:'BETA_UNAVAILABLE'},503);
   if(method==='POST'&&!sameOrigin(request,url))return json({error:'FORBIDDEN'},403);
   if(join&&!await emptyJoinBody(request))return json({error:'INVALID_ENROLLMENT'},400);
   let userId,member;
   try{const account=await authenticate(request,env,{fetcher:authFetcher,now:()=>new Date(now()).getTime()});userId='menei:'+account.id;}
   catch(error){return json({error:error instanceof AuthError&&error.status===401?'UNAUTHORIZED':'AUTH_UNAVAILABLE'},error instanceof AuthError?error.status:503)}
   try{
    await cohort(env);
    if(join){
     const result=await enroll(env.GYM_AI_LIMITS,userId,{bootstrap:phase==='bootstrap',now:new Date(now()).getTime()});
     return result.admitted?json({joined:true,role:result.role}):json({error:result.reason==='full'?'BETA_FULL':'BETA_UNAVAILABLE'},result.reason==='full'?403:503);
    }
    member=await membership(env.GYM_AI_LIMITS,userId);
    if(status)return json({member:member.member,role:member.role,enrolled:member.enrolled,capacity:member.capacity,remainingSlots:member.remainingSlots,phase});
    if(!member.member)return json({error:member.remainingSlots===0?'BETA_FULL':'BETA_MEMBERSHIP_REQUIRED'},403);
   }catch{return json({error:'BETA_UNAVAILABLE'},503)}
   if(health)return json(await researchStatus(env,userId));
   if(!gymResearchConfigured(env))return json({error:'DISABLED'},503);
   let lease;
   try{
    const query=await readQuery(request);if(request.signal.aborted)return json({error:'UPSTREAM_UNAVAILABLE'},504);
    try{lease=await betaReserve(env.GYM_AI_LIMITS,userId,{now:new Date(now()).getTime()})}catch{return json({error:'DISABLED'},503)}
    if(!lease.allowed){const limited=['limit','global_limit'].includes(lease.reason);return json({error:limited?'LIMIT_REACHED':lease.reason==='not_member'?'BETA_MEMBERSHIP_REQUIRED':'BUSY'},lease.reason==='not_member'?403:429,limited?{}:{'Retry-After':'10'})}
    return json(await research(query,{apiKey:env.OPENAI_API_KEY,allowedEquipment:EQUIPMENT,fetcher,now,signal:request.signal}));
   }catch(error){
    if(lease?.allowed)reportFailure(error);
    if(error instanceof ProviderError){const code=error.code==='invalid_query'?'INVALID_QUERY':['invalid_provider_response','response_too_large'].includes(error.code)?'INVALID_RESEARCH':'UPSTREAM_UNAVAILABLE';return json({error:code},code==='INVALID_QUERY'?400:error.status===504||error.status===499?504:502)}
    if(['INVALID_QUERY','TOO_LARGE','UNSUPPORTED_MEDIA_TYPE'].includes(error?.code))return json({error:error.code},error.status);
    return json({error:'UPSTREAM_UNAVAILABLE'},502);
   }finally{if(lease?.allowed)try{await betaRelease(env.GYM_AI_LIMITS,lease.leaseId,{now:new Date(now()).getTime()})}catch{}}
  }
  if(url.pathname==='/beta/')return new Response(null,{status:303,headers:{Location:'/beta','Cache-Control':'private, no-store'}});
  if(!env.ASSETS?.fetch)return new Response('Preview assets unavailable',{status:503});
  const assetRequest=url.pathname==='/beta'?new Request(new URL('/index.html',url),request):request;
  const asset=await env.ASSETS.fetch(assetRequest),headers=new Headers(asset.headers);headers.set('Cache-Control','private, no-store');
  return new Response(asset.body,{status:asset.status,statusText:asset.statusText,headers});
 }};
}
export default createPreviewWorker();
