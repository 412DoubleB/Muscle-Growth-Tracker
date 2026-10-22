import test from 'node:test';
import assert from 'node:assert/strict';
import {WorkoutVoice,workoutVoiceCue,WORKOUT_VOICE_ENABLED} from '../workout-voice.mjs';
const date='2027-01-04',clone=x=>structuredClone(x);
const before={date,kind:'strength',status:'in-progress',exercises:[{sets:[{w:0,r:12,done:false}]}]},started=clone(before);started.exercises[0].sets[0].done=true;
const completed={...clone(started),status:'completed'};
const context={date,today:date};
function fixture(t,{denyStorage=false}={}){
 const descriptor=Object.getOwnPropertyDescriptor(globalThis,'SpeechSynthesisUtterance');Object.defineProperty(globalThis,'SpeechSynthesisUtterance',{value:class{constructor(text){this.text=text}},configurable:true});t.after(()=>{if(descriptor)Object.defineProperty(globalThis,'SpeechSynthesisUtterance',descriptor);else delete globalThis.SpeechSynthesisUtterance});
 const rows=new Map(),spoken=[];let scope='account-a',cancels=0;
 const storage={getItem:k=>rows.get(k)??null,setItem(k,v){if(denyStorage)throw Error('Storage full');rows.set(k,v)}};
 const api={getVoices:()=>[{lang:'en-US',localService:false,name:'remote'},{lang:'en-US',localService:true,name:'device'}],speak:m=>spoken.push(m),cancel(){cancels++}};
 const make=()=>new WorkoutVoice({storage,getScope:()=>scope,api:()=>api});
 return {rows,spoken,api,make,get cancels(){return cancels},set scope(value){scope=value}};
}
test('spoken cues are disabled for launch while the deferred implementation is retained',()=>{assert.equal(WORKOUT_VOICE_ENABLED,false)});

test('only valid current-day local first-set and completion transitions produce cues without rewriting records',()=>{
 const original=clone({before,started,completed});assert.equal(workoutVoiceCue(before,started,date,date).kind,'start');assert.equal(workoutVoiceCue(started,completed,date,date).kind,'complete');
 for(const [a,b,d,today]of [[started,started,date,date],[completed,completed,date,date],[before,started,date,'2027-01-05'],[before,{...started,deleted:true},date,date],[before,{...started,date:'2027-01-05'},date,date],[before,{...started,kind:'rest'},date,date]])assert.equal(workoutVoiceCue(a,b,d,today),null);
 for(const [w,r]of [['',12],[0,0],[-1,12],[0,''],[NaN,12]]){const day=clone(started);Object.assign(day.exercises[0].sets[0],{w,r});assert.equal(workoutVoiceCue(before,day,date,date),null)}
 const run={date,kind:'run',exercises:[],status:'in-progress',run:{done:true,minutes:20}};assert.equal(workoutVoiceCue(run,{...run,status:'completed'},date,date).kind,'complete');assert.equal(workoutVoiceCue({...run,run:{done:false}}, {...run,status:'completed',run:{done:false}},date,date),null);
 assert.deepEqual({before,started,completed},original);
});
test('cues deduplicate across reload/recheck, keep scope separate, and prefer a device voice',t=>{
 const f=fixture(t),voice=f.make();assert.equal(f.rows.size,0);assert.equal(f.spoken.length,0);
 assert.equal(voice.observe(before,started,context),true);assert.equal(f.spoken[0].voice.name,'device');assert.equal(voice.observe(before,started,context),false);
 const reloaded=f.make();assert.equal(reloaded.observe(before,started,context),false);assert.equal(reloaded.observe(started,completed,context),true);assert.equal(reloaded.observe(started,completed,context),false);
 assert.equal(f.spoken.length,2);f.scope='account-b';assert.equal(reloaded.observe(before,started,context),true);assert.equal(f.rows.size,2);
 for(const raw of f.rows.values()){const receipt=JSON.parse(raw);assert.deepEqual(Object.keys(receipt).sort(),['complete','date','start','version']);assert.equal(receipt.date,date)}
});
test('muted events are consumed without later replay, cancellation stops pending speech, and voice/storage failure cannot block logging',t=>{
 const f=fixture(t,{denyStorage:true}),voice=f.make();assert.equal(voice.observe(before,started,{...context,enabled:false}),false);assert.equal(voice.observe(before,started,context),false);assert.equal(f.spoken.length,0);
 assert.equal(voice.observe(started,completed,context),true);voice.cancel();assert.equal(f.cancels,1);voice.cancel();assert.equal(f.cancels,1);
 const denied=new WorkoutVoice({storage:f.make().storage,getScope:()=> 'guest',api:()=>{throw Error('Unavailable')}});assert.equal(denied.available,false);assert.equal(denied.speak('test'),false);assert.equal(denied.observe(before,started,context),false);
 f.api.speak=()=>{throw Error('No speech engine')};assert.equal(voice.speak('test'),false);assert.equal(voice.active,false);
});
