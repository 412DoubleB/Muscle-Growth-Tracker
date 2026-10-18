// Server-only. The cron secret and VAPID private key live in encrypted Vault; only the service role can read the authorized config.
import webpush from 'npm:web-push@3.6.7';
import {dueReminder,allowedPushEndpoint} from './logic.mjs';

const required=(key:string)=>{const value=Deno.env.get(key);if(!value)throw Error('Missing server configuration: '+key);return value};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
function constantTime(a:string,b:string){if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0}
Deno.serve(async(req:Request)=>{
 if(req.method!=='POST')return json({error:'POST required'},405);
 const supplied=req.headers.get('x-cron-key')||'';
 if(supplied.length<32)return json({error:'Unauthorized'},401);
 try{
  const url=required('SUPABASE_URL'),key=required('SUPABASE_SERVICE_ROLE_KEY');
  const rest=async(path:string,method='GET',body?:unknown)=>{const res=await fetch(url+'/rest/v1/'+path,{method,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});if(!res.ok)throw Error('Database operation failed: '+res.status);const text=await res.text();return text?JSON.parse(text):null};
  let config;try{config=await rest('rpc/mgt_beta_reminder_config','POST',{provided_secret:supplied})}catch{return json({error:'Unauthorized'},401)}
  webpush.setVapidDetails(config.mgt_beta_vapid_subject,config.mgt_beta_vapid_public,config.mgt_beta_vapid_private);
  let sent=0,failed=0,expired=0,cursor='';
  const stamp=new Date(),states=new Map();
  for(;;){
   const subscriptions=await rest('mgt_beta_push?select=*&order=id&limit=100'+(cursor?'&id=gt.'+cursor:''));if(!subscriptions.length)break;
   for(const sub of subscriptions){
    if(!allowedPushEndpoint(sub.endpoint)){failed++;continue}
    if(!states.has(sub.user_id)){const rows=await rest('mgt_beta_states?user_id=eq.'+encodeURIComponent(sub.user_id)+'&select=app_data');states.set(sub.user_id,rows[0]?.app_data)}
    const state=states.get(sub.user_id);if(!state)continue;
    const prefs={...sub.preferences,...state.reminders};
    const due=dueReminder(stamp,state,prefs);if(!due||sub.last_slot===due.slot)continue;
    if(!await rest('rpc/mgt_beta_claim_reminder','POST',{subscription_id:sub.id,slot_key:due.slot}))continue;
    try{
     await webpush.sendNotification(sub.subscription,JSON.stringify(due.message),{TTL:900,timeout:10000});
     await rest('mgt_beta_push?id=eq.'+sub.id,'PATCH',{last_slot:due.slot,lease_slot:null,lease_until:null,failures:0});sent++;
    }catch(error){
     const status=(error as {statusCode?:number}).statusCode;
     if(status===404||status===410){await rest('mgt_beta_push?id=eq.'+sub.id,'DELETE');expired++}
     else{await rest('mgt_beta_push?id=eq.'+sub.id,'PATCH',{lease_until:null,failures:(sub.failures||0)+1});failed++}
    }
   }
   if(subscriptions.length<100)break;cursor=subscriptions[subscriptions.length-1].id;
  }
  return json({sent,failed,expired});
 }catch(error){console.error('Reminder job failed:',(error as Error).message);return json({error:'Reminder job failed. Check server configuration and logs.'},500)}
});
