import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {stripTypeScriptTypes} from 'node:module';
import {dueItems,allowedPushEndpoint,pushPreferences} from '../supabase/functions/menei-push-reminders/logic.mjs';
const project='bhyrrxrpqaxiwpfxnwpa',secret='a'.repeat(96);
async function sender({projectUrl=`https://${project}.supabase.co`,accepted=false}={}){
 const slot=new Date(Date.now()-5000).toISOString(),requests=[],sends=[];let handler;
 const sub={id:'synthetic-sub',user_id:'synthetic-owner',endpoint:'https://fcm.googleapis.com/synthetic',subscription:{endpoint:'https://fcm.googleapis.com/synthetic',keys:{p256dh:'synthetic',auth:'synthetic'}},preferences:{enabled:true,testAt:slot,workout:false,meals:false,workoutTime:'18:00',workoutTimezone:'UTC'},delivered_slots:accepted?{test:slot}:{}};
 const source=await fs.readFile(new URL('../supabase/functions/menei-push-reminders/index.ts',import.meta.url),'utf8');
 const code=stripTypeScriptTypes(source.replace(/^import .*;$/gm,''));
 const response=data=>new Response(JSON.stringify(data));
 const fetch=async(url,options={})=>{
  assert.ok(url.startsWith(`https://${project}.supabase.co/rest/v1/`));assert.equal(options.headers.Authorization,'Bearer synthetic-service-key');requests.push({url,options});
  if(url.endsWith('/rpc/menei_beta_push_config')){assert.equal(JSON.parse(options.body).provided_secret,secret);return response({ready:true,subject:'https://synthetic.example.invalid',publicKey:'synthetic-public',privateKey:'synthetic-private'})}
  if(url.endsWith('/rpc/menei_beta_push_pilots'))return response([{user_id:'synthetic-owner'}]);
  if(url.includes('/mgt_beta_push?'))return response([sub]);
  if(url.includes('/mgt_beta_states?'))return response([{app_data:{}}]);
  if(url.endsWith('/rpc/menei_beta_push_claim'))return response('synthetic-lease');
  if(url.endsWith('/rpc/menei_beta_push_finish'))return response(true);
  assert.fail('Unexpected server request');
 };
 vm.runInNewContext(code,{Deno:{serve:fn=>{handler=fn},env:{get:key=>key==='SUPABASE_URL'?projectUrl:key==='SUPABASE_SERVICE_ROLE_KEY'?'synthetic-service-key':undefined}},webpush:{setVapidDetails(){},sendNotification:async(sub,payload,options)=>sends.push({sub,message:JSON.parse(payload),options})},fetch,dueItems,allowedPushEndpoint,pushPreferences,Response,Date,Uint8Array,console:{error(){}},btoa,atob});
 return {requests,sends,invoke:(cron=secret)=>handler(new Request('https://synthetic.example.invalid/job',{method:'POST',headers:{'x-cron-key':cron}}))};
}
test('actual isolated sender requests timely delivery for user-visible pushes and retains bounded expiration and account claims',async()=>{
 const f=await sender(),r=await f.invoke();assert.equal(r.status,200);assert.deepEqual(await r.json(),{ready:true,sent:1,failed:0,expired:0});assert.equal(f.sends.length,1);
 const [{options,message}]=f.sends;assert.equal(options.urgency,'high');assert.equal(options.TTL,900);assert.equal(options.timeout,10000);assert.equal(message.title,'MENEI test reminder');
 assert.ok(f.requests.some(x=>x.url.endsWith('/rpc/menei_beta_push_finish')&&JSON.parse(x.options.body).delivered===true));
});
test('sender priority cannot bypass duplicate suppression, cron authentication or the isolated-project guard',async()=>{
 const sent=await sender({accepted:true});assert.equal((await sent.invoke()).status,200);assert.equal(sent.sends.length,0);assert.ok(!sent.requests.some(x=>x.url.endsWith('/rpc/menei_beta_push_claim')));
 const unauthorized=await sender();assert.equal((await unauthorized.invoke('invalid')).status,401);assert.equal(unauthorized.requests.length,0);assert.equal(unauthorized.sends.length,0);
 const other=await sender({projectUrl:'https://other.supabase.co'});assert.equal((await other.invoke()).status,500);assert.equal(other.requests.length,0);assert.equal(other.sends.length,0);
});
