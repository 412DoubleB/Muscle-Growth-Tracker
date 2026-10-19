// Sites dispatch must retain its owner-only audience. Costly research additionally
// requires injected visitor identity, same-origin POST and a durable trial quota.
import {EQUIPMENT} from '../core.mjs';
import {researchGym,normalizeGymQuery,ProviderError} from '../server/gym-research-provider.mjs';
import {reserveGymResearch,releaseGymResearch,readGymResearchQuota,GYM_AI_TRIAL_LIMIT} from '../server/gym-research-budget.mjs';
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
export function createPreviewWorker({fetcher,now=()=>new Date(),research=researchGym,reserve=reserveGymResearch,release=releaseGymResearch,quota=readGymResearchQuota}={}){
 async function researchStatus(env){
  const enabled=env.MENEI_GYM_AI_ENABLED==='true',keyConfigured=/^sk-[A-Za-z0-9_-]{12,}$/.test(env.OPENAI_API_KEY||'');
  let budget;try{budget=await quota(env.GYM_AI_LIMITS)}catch{/* Missing bindings or migrations are unavailable, never a fresh quota. */}
  return {enabled,keyConfigured,budgetReady:!!budget,used:budget?.used??null,remaining:budget?.remaining??null,limit:GYM_AI_TRIAL_LIMIT,ready:enabled&&keyConfigured&&!!budget};
 }
 return {
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname==='/api/gym-research-status'){
   // Fixed operational metadata only. The same owner-private Sites boundary as
   // preview-config also permits authenticated service diagnostics, without
   // visitor identity, model calls, quota reservation or user records.
   if(request.method!=='GET')return json({error:'METHOD_NOT_ALLOWED'},405,{Allow:'GET'});
   return json(await researchStatus(env));
  }
  if(url.pathname==='/api/preview-config'){
   if(request.method!=='GET')return json({error:'GET required'},405,{Allow:'GET'});
   const key=env.MENEI_TEST_PUBLISHABLE_KEY;
   if(!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key||''))return json({error:'Test cloud configuration unavailable'},503);
   const status=await researchStatus(env);
   return json({preview:{localOnly:false,projectRef:TEST_PROJECT},supabase:{url:`https://${TEST_PROJECT}.supabase.co`,key},pushServiceReady:false,authRedirectConfigured:true,gymResearchReady:!!request.headers.get('oai-authenticated-user-id')&&status.ready});
  }
  if(url.pathname==='/api/gym-research'){
   if(request.method!=='POST')return json({error:'METHOD_NOT_ALLOWED'},405,{Allow:'POST'});
   if(!request.headers.get('oai-authenticated-user-id'))return json({error:'UNAUTHORIZED'},401);
   const origin=request.headers.get('origin'),site=request.headers.get('sec-fetch-site');
   if(origin!==url.origin||site&&site!=='same-origin')return json({error:'FORBIDDEN'},403);
   if(!gymResearchConfigured(env))return json({error:'DISABLED'},503);
   let lease;
   try{
    const query=await readQuery(request);
    if(request.signal.aborted)return json({error:'UPSTREAM_UNAVAILABLE'},504);
    try{lease=await reserve(env.GYM_AI_LIMITS,{now:new Date(now()).getTime()})}catch{return json({error:'DISABLED'},503)}
    if(!lease.allowed)return json({error:lease.reason==='limit'?'LIMIT_REACHED':'BUSY'},429,lease.reason==='limit'?{}:{'Retry-After':'10'});
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
    if(lease?.allowed)try{await release(env.GYM_AI_LIMITS,lease.leaseId,{now:new Date(now()).getTime()})}catch{/* A failed release retains the bounded durable lease; it never refunds a use. */}
   }
  }
  if(!env.ASSETS?.fetch)return new Response('Preview assets unavailable',{status:503});
  return env.ASSETS.fetch(request);
 }
 };
}
export default createPreviewWorker();
