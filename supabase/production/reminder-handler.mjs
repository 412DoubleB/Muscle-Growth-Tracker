// Prepared replacement for the EXISTING live sender URL. No key rotation,
// owner pilot or account migration; the existing Vault config authenticates cron.
import {dueItems,allowedPushEndpoint,pushPreferences} from '../functions/menei-push-reminders/logic.mjs';
const PROJECT='https://tdmwpcueqxtnqyonucam.supabase.co';
export function createLiveReminderHandler({env,webpush,fetcher=globalThis.fetch,now=()=>new Date(),report=()=>{}}){
 const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
 return async request=>{
  if(request.method!=='POST')return json({error:'METHOD_NOT_ALLOWED'},405);
  const secret=request.headers.get('x-cron-key')||'';if(secret.length<32||secret.length>512)return json({error:'UNAUTHORIZED'},401);
  try{
   const url=env.get('SUPABASE_URL'),key=env.get('SUPABASE_SERVICE_ROLE_KEY');if(url!==PROJECT||!key)throw Error();
   const rest=async(path,method='GET',body)=>{
    const response=await fetcher(url+'/rest/v1/'+path,{method,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},redirect:'error',signal:AbortSignal.timeout(15000),...(body===undefined?{}:{body:JSON.stringify(body)})});
    if(!response.ok)throw Error();const text=await response.text();return text?JSON.parse(text):null;
   };
   const rpc=(name,body)=>rest('rpc/'+name,'POST',body);
   let config;try{config=await rpc('mgt_beta_reminder_config',{provided_secret:secret})}catch{return json({error:'UNAUTHORIZED'},401)}
   webpush.setVapidDetails(config.mgt_beta_vapid_subject,config.mgt_beta_vapid_public,config.mgt_beta_vapid_private);
   const stamp=now(),states=new Map();let cursor='',sent=0,failed=0,expired=0;
   for(;;){
    const subscriptions=await rest('mgt_beta_push?select=*&order=id&limit=100'+(cursor?'&id=gt.'+encodeURIComponent(cursor):''));
    if(!subscriptions.length)break;
    for(const sub of subscriptions){
     if(!allowedPushEndpoint(sub.endpoint))continue;
     if(!states.has(sub.user_id)){const rows=await rest('mgt_beta_states?user_id=eq.'+encodeURIComponent(sub.user_id)+'&select=app_data');states.set(sub.user_id,rows[0]?.app_data)}
     const state=states.get(sub.user_id);if(!state)continue;
     for(const item of dueItems(stamp,state,pushPreferences(state.reminders,sub.preferences))){
      const claim={subscription_id:sub.id,slot_kind:item.kind,slot_key:item.slot},lease=await rpc('menei_live_push_claim',claim);if(!lease)continue;
      try{
       await webpush.sendNotification(sub.subscription,JSON.stringify(item.message),{TTL:900,timeout:10000,urgency:'high'});
       await rpc('menei_live_push_finish',{...claim,lease_token:lease,delivered:true});sent++;
      }catch(error){
       if([404,410].includes(error?.statusCode)){await rest('mgt_beta_push?id=eq.'+encodeURIComponent(sub.id),'DELETE');expired++;break}
       await rpc('menei_live_push_finish',{...claim,lease_token:lease,delivered:false});failed++;
      }
     }
    }
    if(subscriptions.length<100)break;cursor=subscriptions.at(-1).id;
   }
   return json({ready:true,sent,failed,expired});
  }catch{report({event:'live_reminder_failed'});return json({error:'REMINDER_UNAVAILABLE'},500)}
 };
}
