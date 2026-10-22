import test from 'node:test';
import assert from 'node:assert/strict';
import {restAfterCompletion,RestTimer,RestAudio,restPreferences,saveRestPreferences} from '../rest-timers.mjs';
const set=(extra={})=>({role:'working',w:40,r:10,rir:2,rest:90,done:false,...extra});
const day=()=>({date:'2027-01-04',exercises:[{name:'A',supersetId:'pair',sets:[set(),set()]},{name:'B',supersetId:'pair',sets:[set(),set()]}]});
const check=(d,i,j)=>{const before=structuredClone(d);d.exercises[i].sets[j].done=true;return restAfterCompletion(before,d,i,j)};
const storage=()=>{const rows=new Map();return {rows,getItem:key=>rows.get(key)??null,setItem:(k,v)=>rows.set(k,v),removeItem:k=>rows.delete(k)}};

test('automatic rest follows new Done transitions; reads, duplicate checks and completed days do not start rest',()=>{
 const d=day();delete d.exercises[0].supersetId;const before=structuredClone(d);d.exercises[0].sets[0].done=true;const saved=structuredClone(d);
 assert.deepEqual(restAfterCompletion(before,d,0,0),{kind:'set',seconds:90,label:'A'});assert.deepEqual(d,saved);assert.equal(before.exercises[0].sets[0].done,false);
 assert.equal(restAfterCompletion(d,d,0,0),null);assert.equal(restAfterCompletion(before,before,0,0),null);d.status='completed';assert.equal(restAfterCompletion(before,d,0,0),null);
});
test('paired rounds rest only after both sets; the whole pair starts exactly 180 seconds after all working sets',()=>{
 const d=day();d.exercises[0].supersetRestSeconds=75;const untouched=structuredClone(d);
 assert.equal(check(d,0,0),null);assert.equal(check(d,1,0).seconds,75);assert.equal(check(d,1,1),null);
 const final=check(d,0,1);assert.deepEqual(final,{kind:'pair',seconds:180,label:'A + B'});assert.equal(check(d,0,1),null);
 for(let i=0;i<2;i++)for(let j=0;j<2;j++)assert.deepEqual({...d.exercises[i].sets[j],done:false},untouched.exercises[i].sets[j]);
});
test('warm-up/back-off rows stay separate, and unequal pairs finish extra working sets before the blocking rest',()=>{
 const d=day();d.exercises[0].sets.unshift(set({role:'warmup',rest:30}));d.exercises[0].sets.push(set());d.exercises[1].sets.push(set({role:'backoff',rest:45}));
 assert.equal(check(d,0,0).seconds,30);assert.equal(check(d,0,1),null);assert.equal(check(d,1,0).kind,'round');check(d,0,2);assert.equal(check(d,1,1).kind,'round');
 assert.equal(check(d,1,2).kind,'set');assert.equal(check(d,0,3).kind,'pair');
});
test('elapsed timers expire once independently of a screen; blocking pair rest stays until manual Stop',()=>{
 const saved=storage();let now=1000;const timer=new RestTimer({storage:saved,scope:'A',now:()=>now});
 timer.start({kind:'set',seconds:90,label:'Curl'});now+=40000;assert.equal(timer.remaining,50);assert.equal(timer.tick(),null);
 const restored=new RestTimer({storage:saved,scope:'A',now:()=>now});assert.equal(restored.remaining,50);
 now+=60000;assert.equal(restored.tick().label,'Curl');assert.equal(restored.record,null);assert.equal(restored.tick(),null);
 restored.start({kind:'pair',seconds:180,label:'A + B'});assert.equal(restored.start({seconds:30}),false);now+=180001;assert.equal(restored.tick().kind,'pair');assert.equal(restored.blocking,true);assert.equal(restored.remaining,0);assert.equal(restored.tick(),null);
 const complete=new RestTimer({storage:saved,scope:'A',now:()=>now});assert.equal(complete.record.completed,true);assert.equal(complete.tick(),null);complete.stop();assert.equal(complete.blocking,false);assert.equal(complete.record,null);
});
test('timers and preferences are account scoped, ignore corrupt/expired records, and leave legacy keys untouched',()=>{
 const saved=storage();saved.setItem('MGT_BETA_TIMER','legacy');const a=new RestTimer({storage:saved,scope:'A',now:()=>1000});a.start({kind:'pair',seconds:180,label:'Pair'});
 assert.equal(new RestTimer({storage:saved,scope:'B',now:()=>1000}).record,null);assert.equal(new RestTimer({storage:saved,scope:'A',now:()=>200000}).record.completed,true);
 saved.setItem('MGT_BETA_REST_TIMER:B','broken');assert.equal(new RestTimer({storage:saved,scope:'B'}).record,null);
 const b=new RestTimer({storage:saved,scope:'B',now:()=>1000});b.start({seconds:1});assert.equal(new RestTimer({storage:saved,scope:'B',now:()=>3000}).record,null);
 assert.equal(saved.getItem('MGT_BETA_TIMER'),'legacy');saved.setItem('MGT_BETA_REST_SETTINGS:A',JSON.stringify({auto:false,sound:false}));assert.deepEqual(restPreferences(saved,'A'),{auto:false,sound:true});saveRestPreferences(saved,'A',{auto:false,sound:false});assert.deepEqual(restPreferences(saved,'A'),{auto:false,sound:false});assert.deepEqual(restPreferences(saved,'B'),{auto:true,sound:true});
});
test('timer audio is dormant before a user gesture, uses two quiet tones, and can stop active sound',async()=>{
 let contexts=0,starts=0,stops=0;const context={state:'suspended',currentTime:1,destination:{},async resume(){this.state='running'},createOscillator(){return {frequency:{value:0},connect(){},disconnect(){},start(){starts++},stop(){stops++}}},createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}}}};
 const audio=new RestAudio({contextFactory:()=>{contexts++;return context}});assert.equal(contexts,0);assert.equal(audio.cue(),false);assert.equal(contexts,0);assert.equal(await audio.arm(),true);assert.equal(contexts,1);assert.equal(audio.cue(),true);assert.equal(starts,2);audio.silence();assert.equal(stops,4);await audio.arm();assert.equal(contexts,1);
});
test('legacy numeric timer controls remain compatible without resuming another account timer',()=>{
 const saved=storage();saved.setItem('MGT_BETA_TIMER','61000');const guest=new RestTimer({storage:saved,scope:'guest',now:()=>1000,legacyCompatibility:true});assert.equal(guest.remaining,60);
 const other=new RestTimer({storage:saved,scope:'signed-in',now:()=>1000,legacyCompatibility:true});assert.equal(other.record,null);guest.stop();assert.equal(saved.getItem('MGT_BETA_TIMER'),null);
 other.start({seconds:180});assert.equal(saved.getItem('MGT_BETA_TIMER'),'181000');other.stop();assert.equal(saved.getItem('MGT_BETA_TIMER'),null);
});
