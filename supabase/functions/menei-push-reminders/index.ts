// Isolated beta only. VAPID private material is generated here and kept in Vault.
import webpush from 'npm:web-push@3.6.7';
import {dueItems,allowedPushEndpoint,pushPreferences} from './logic.mjs';
const PROJECT='bhyrrxrpqaxiwpfxnwpa';
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const b64=(bytes:Uint8Array)=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const bytes=(s:string)=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(s.length/4)*4,'=')),c=>c.charCodeAt(0));
Deno.serve(async(req:Request)=>{
 if(req.method!=='POST')return json({error:'POST required'},405);
 const supplied=req.headers.get('x-cron-key')||'';if(!/^[a-f0-9]{96}$/.test(supplied))return json({error:'Unauthorized'},401);
 try{
  const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(url!==`https://${PROJECT}.supabase.co`||!key)throw Error('Isolated server configuration unavailable');
  const rest=async(path:string,method='GET',body?:unknown)=>{
   const response=await fetch(url+'/rest/v1/'+path,{method,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
   if(!response.ok)throw Error('Database operation failed');const text=await response.text();return text?JSON.parse(text):null;
  };
  const rpc=(name:string,body:unknown)=>rest('rpc/'+name,'POST',body);
  let config;try{config=await rpc('menei_beta_push_config',{provided_secret:supplied})}catch{return json({error:'Unauthorized'},401)}
  if(!config.ready){
   const pair=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
   const jwk=await crypto.subtle.exportKey('jwk',pair.privateKey);if(!jwk.x||!jwk.y||!jwk.d)throw Error('Key generation failed');
   const pub=new Uint8Array(65);pub[0]=4;pub.set(bytes(jwk.x),1);pub.set(bytes(jwk.y),33);
   await rpc('menei_beta_push_store_keys',{provided_secret:supplied,public_key:b64(pub),private_key:jwk.d});
   config=await rpc('menei_beta_push_config',{provided_secret:supplied});
  }
  webpush.setVapidDetails(config.subject,config.publicKey,config.privateKey);
  const pilots=await rest('rpc/menei_beta_push_pilots','POST',{}),allowed=new Set(pilots.map((p:{user_id:string})=>p.user_id));
  const stamp=new Date(),states=new Map();let sent=0,failed=0,expired=0,cursor='';
  for(;;){
   const subscriptions=await rest('mgt_beta_push?select=*&order=id&limit=100'+(cursor?'&id=gt.'+cursor:''));if(!subscriptions.length)break;
   for(const sub of subscriptions){
    if(!allowed.has(sub.user_id)||!allowedPushEndpoint(sub.endpoint))continue;
    if(!states.has(sub.user_id)){const rows=await rest('mgt_beta_states?user_id=eq.'+encodeURIComponent(sub.user_id)+'&select=app_data');states.set(sub.user_id,rows[0]?.app_data)}
    const state=states.get(sub.user_id);if(!state)continue;
    const prefs=pushPreferences(state.reminders,sub.preferences);
    for(const item of dueItems(stamp,state,prefs)){
     if(sub.delivered_slots?.[item.kind]===item.slot)continue;
     const claim={subscription_id:sub.id,slot_kind:item.kind,slot_key:item.slot};
     const lease=await rpc('menei_beta_push_claim',claim);if(!lease)continue;
     try{
      await webpush.sendNotification(sub.subscription,JSON.stringify(item.message),{TTL:900,timeout:10000});
      await rpc('menei_beta_push_finish',{...claim,lease_token:lease,delivered:true});sent++;
     }catch(error){
      const status=(error as {statusCode?:number}).statusCode;
      if(status===404||status===410){await rest('mgt_beta_push?id=eq.'+sub.id,'DELETE');expired++;break}
      await rpc('menei_beta_push_finish',{...claim,lease_token:lease,delivered:false});failed++;
     }
    }
   }
   if(subscriptions.length<100)break;cursor=subscriptions[subscriptions.length-1].id;
  }
  return json({ready:true,sent,failed,expired});
 }catch{console.error('Isolated reminder job failed');return json({error:'Reminder service unavailable'},500)}
});
