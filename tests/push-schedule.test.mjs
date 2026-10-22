import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {dueItems,pushPreferences} from '../supabase/functions/menei-push-reminders/logic.mjs';
import {enablePush,requestPushTest,disablePush} from '../notifications.mjs';
const date='2027-01-04',prefs={enabled:true,workout:true,workoutTime:'18:00',workoutTimezone:'America/New_York',timezone:'America/New_York',time:'12:00',meals:false};
const state={logs:{[date]:{date,kind:'strength',title:'Upper body',status:'in-progress'}},reminders:prefs};
test('one-hour push uses absolute zone offsets, checks tomorrow for midnight starts and suppresses completed/skipped/deleted/rest days',()=>{
 const before=structuredClone(state),result=dueItems(new Date('2027-01-04T22:00:00Z'),state,prefs);assert.equal(result.length,1);assert.equal(result[0].kind,'workout');assert.match(result[0].message.body,/Upper body starts in one hour/);
 assert.equal(dueItems(new Date('2027-01-04T21:59:59Z'),state,prefs).length,0);assert.equal(dueItems(new Date('2027-01-04T22:15:00Z'),state,prefs).length,0);
 for(const change of [{status:'completed'},{status:'skipped'},{deleted:true},{kind:'rest'}])assert.equal(dueItems(new Date('2027-01-04T22:00:00Z'),{logs:{[date]:{...state.logs[date],...change}}},prefs).length,0);
 assert.equal(dueItems(new Date('2027-01-04T04:05:00Z'),state,{...prefs,workoutTime:'00:05'}).length,1);assert.deepEqual(state,before);
 for(const [day,stamp]of [['2026-10-31','2026-10-31T21:00:00Z'],['2026-11-01','2026-11-01T22:00:00Z']])assert.equal(dueItems(new Date(stamp),{notificationSchedule:{[day]:{kind:'run',title:'Easy run'}}},prefs).length,1);
});
test('meal/workout/test reminders have separate slots; invalid imports and disabled preferences cannot produce alerts',()=>{
 const now=new Date('2027-01-04T22:00:00Z'),s={...state,meals:{[date]:{items:[{eaten:false}]}}};const result=dueItems(now,s,{...prefs,time:'17:00',meals:true,testAt:now.toISOString()});assert.deepEqual(result.map(x=>x.kind),['test','workout','meals']);assert.equal(new Set(result.map(x=>x.kind+':'+x.slot)).size,3);
 assert.deepEqual(dueItems(now,state,{...prefs,enabled:false,testAt:now.toISOString()}),[]);
 for(const setting of [{workoutTime:'bad'},{workoutTimezone:'bad/zone'}])assert.deepEqual(dueItems(now,state,{...prefs,...setting}),[]);
 const legacy={...prefs,workoutTime:undefined,time:'17:00'};assert.equal(dueItems(now,state,legacy)[0].kind,'legacy');
 const partial={logs:{[date]:{...state.logs[date],status:'completed'}},notificationSchedule:{[date]:{kind:'strength'}}};assert.deepEqual(dueItems(now,partial,prefs),[]);
});
test('browser and isolated sender use identical timezone conversion code',async()=>{assert.equal(await fs.readFile(new URL('../workout-schedule.mjs',import.meta.url),'utf8'),await fs.readFile(new URL('../supabase/functions/menei-push-reminders/schedule.mjs',import.meta.url),'utf8'))});
function browser({saveFails=false,switchDuringPermission=false}={}){
 const globals=['navigator','Notification','PushManager'],old=new Map(globals.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));let version=0,created=0,unsubscribed=0;const saves=[];
 const sub={endpoint:'https://fcm.googleapis.com/synthetic',toJSON(){return {endpoint:this.endpoint,keys:{p256dh:'synthetic',auth:'synthetic'}}},async unsubscribe(){unsubscribed++;return true}};
 let current=null;Object.defineProperty(globalThis,'navigator',{value:{serviceWorker:{ready:Promise.resolve({pushManager:{async getSubscription(){return current},async subscribe(){created++;current=sub;return sub}}})}},configurable:true});globalThis.PushManager=class{};globalThis.Notification={async requestPermission(){if(switchDuringPermission)version++;return 'granted'}};
 const cloud={session:{user:{id:'synthetic'}},accountContext:()=>version,requireCurrentAccount(v){if(v!==version)throw Error('Account changed')},async savePush(s,p){if(saveFails)throw Error('Save failed');saves.push({s,p})},async removePush(){if(saveFails)throw Error('Cleanup failed')}};
 return {cloud,saves,get created(){return created},get unsubscribed(){return unsubscribed},existing(){current=sub},restore(){for(const [k,d]of old)if(d)Object.defineProperty(globalThis,k,d);else delete globalThis[k]}};
}
test('device opt-in and closed-app test require user permission and retain the account across async operations',async()=>{
 const f=browser();try{await enablePush(f.cloud,prefs,'BA'.repeat(44));assert.equal(f.created,1);assert.equal(f.saves[0].p.enabled,true);const before=Date.now();await requestPushTest(f.cloud,prefs);assert.ok(Date.parse(f.saves[1].p.testAt)>=before+120000);assert.ok(Date.parse(f.saves[1].p.testAt)<Date.now()+121000);await disablePush(f.cloud);assert.equal(f.unsubscribed,1)}finally{f.restore()}
 const switched=browser({switchDuringPermission:true});try{await assert.rejects(()=>enablePush(switched.cloud,prefs,'BA'.repeat(44)),/Account changed/);assert.equal(switched.created,0);assert.equal(switched.saves.length,0)}finally{switched.restore()}
});
test('failed device registration cleans up only a newly created subscription; disable still stops the device after server cleanup fails',async()=>{
 const f=browser({saveFails:true});try{await assert.rejects(()=>enablePush(f.cloud,prefs,'BA'.repeat(44)),/Save failed/);assert.equal(f.unsubscribed,1)}finally{f.restore()}
 const existing=browser({saveFails:true});try{existing.existing();await assert.rejects(()=>enablePush(existing.cloud,prefs,'BA'.repeat(44)),/Save failed/);assert.equal(existing.unsubscribed,0);assert.deepEqual(await disablePush(existing.cloud),{serverCleanup:false});assert.equal(existing.unsubscribed,1)}finally{existing.restore()}
});

test('explicit push capability keeps subscription writes on the signed-in isolated account and blocks project tampering',async()=>{
 const {CloudSync}=await import('../cloud.mjs'),rows=new Map(),requests=[];const storage={getItem:k=>rows.get(k)??null,setItem:(k,v)=>rows.set(k,v)};
 const cloud=new CloudSync({storage,allowedProject:'bhyrrxrpqaxiwpfxnwpa',canPush:()=>true,fetcher:async(url,options)=>{requests.push({url,options});return {ok:true,text:async()=>''}}});
 cloud.configure('https://bhyrrxrpqaxiwpfxnwpa.supabase.co','sb_publishable_synthetic');cloud.session={user:{id:'synthetic-owner'},refresh_token:'synthetic-refresh',access_token:'synthetic-access',expires_at:Date.now()/1000+3600};
 await cloud.savePush({endpoint:'https://fcm.googleapis.com/synthetic'},prefs);assert.equal(JSON.parse(requests[0].options.body).user_id,'synthetic-owner');assert.equal(requests[0].url,'https://bhyrrxrpqaxiwpfxnwpa.supabase.co/rest/v1/mgt_beta_push?on_conflict=user_id,endpoint');
 cloud.config.url='https://other.supabase.co';await assert.rejects(()=>cloud.savePush({},prefs),/isolated test project/);assert.equal(requests.length,1);cloud.stop();
});

test('device opt-in survives closing before main sync, while newer global schedule edits and device-specific tests remain isolated',()=>{
 const old={enabled:false,workoutTime:'12:00',workoutTimezone:'UTC',updatedAt:'2027-01-04T10:00:00Z'},device={enabled:true,workoutTime:'18:00',workoutTimezone:'America/New_York',updatedAt:'2027-01-04T11:00:00Z',testAt:'2027-01-04T12:00:00Z'};
 const pending=pushPreferences(old,device);assert.equal(pending.enabled,true);assert.equal(pending.workoutTime,'18:00');assert.equal(pending.testAt,device.testAt);
 const saved={...old,workoutTime:'19:00',updatedAt:'2027-01-04T13:00:00Z',testAt:'unrelated device test'};const latest=pushPreferences(saved,device);assert.equal(latest.workoutTime,'19:00');assert.equal(latest.testAt,device.testAt);assert.equal(latest.enabled,true);
 assert.equal(pushPreferences(saved,{...device,enabled:false}).enabled,false);assert.equal(pushPreferences(saved,{enabled:true}).testAt,undefined);
});
