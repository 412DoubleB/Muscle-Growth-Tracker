import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';
import * as T from '../session-order.mjs';
const date='2027-01-04';
function environment({voice=false}={}){
 const names=['document','localStorage','sessionStorage','window','navigator','location','history','confirm','setInterval','setTimeout','clearTimeout','fetch','AudioContext','speechSynthesis','SpeechSynthesisUtterance'];
 const previous=new Map(names.map(n=>[n,Object.getOwnPropertyDescriptor(globalThis,n)]));
 const state=C.defaultState();state.profile.safetyNoticeVersion=1;
 const exercise=name=>{const e=C.makeExercise(C.exerciseFor(name),{count:2});for(const s of e.sets)Object.assign(s,{w:40,r:10,rir:2,rest:90});return e};
 const paired=[exercise('Dumbbell Bench Press'),exercise('Hammer Curl')];for(const e of paired)Object.assign(e,{supersetId:'synthetic-pair',supersetRestSeconds:75});
 state.logs[date]={id:date,date,title:'Synthetic timer session',kind:'strength',gymId:'crunch',status:'active',exercises:[...paired,exercise('Romanian Deadlift')],unknownHistory:{keep:0}};
 state.logs['2026-12-01']={...C.clone(state.logs[date]),id:'2026-12-01',date:'2026-12-01'};
 state.legacySnapshots=[{id:'untouched',data:{unrecognized:'retain'}}];
 const legacyRaw=voice?JSON.stringify(C.defaultState()):'{"untouched":true}';if(voice)state.legacySnapshots.push({id:String(C.hash(legacyRaw)),data:JSON.parse(legacyRaw)});
 const rows=new Map([['MGT_BETA_V8:guest',JSON.stringify(state)],['MGT28v6',legacyRaw]]),session=new Map(),elements=new Map(),listeners=new Map(),intervals=[];let audioContexts=0,audioStarts=0,failSave=false,speechCancels=0;const spoken=[];
 class Element{
  constructor(id){Object.assign(this,{id,innerHTML:'',textContent:'',value:'',open:false,hidden:true,dataset:{},classList:{add(){},remove(){},toggle(){}}})}
  addEventListener(name,fn){this.listeners??={};this.listeners[name]=fn}showModal(){this.open=true}close(){this.open=false}focus(){}setAttribute(){}
 }
 const element=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)};
 globalThis.document={documentElement:{dataset:{preview:'local'}},body:{classList:{remove(){},toggle(){}}},activeElement:{tagName:'BODY'},hidden:false,getElementById:element,addEventListener:(n,fn)=>listeners.set(n,[...(listeners.get(n)||[]),fn]),querySelector:s=>s==='dialog[open]'?(element('restDialog').open?element('restDialog'):element('modal').open?element('modal'):null):null,querySelectorAll:()=>[]};
 globalThis.localStorage={getItem:k=>rows.get(k)??null,setItem(k,v){if(failSave&&k==='MGT_BETA_V8:guest')throw Error('synthetic full storage');rows.set(k,String(v))},removeItem(){assert.fail('No saved workspace may be removed')}};
 globalThis.sessionStorage={getItem:k=>session.get(k)??null,setItem:(k,v)=>session.set(k,String(v)),removeItem:k=>session.delete(k)};
 globalThis.window={addEventListener(){},scrollTo(){}};Object.defineProperty(globalThis,'navigator',{value:{onLine:true,vibrate(){}},configurable:true});
 globalThis.location={origin:'https://synthetic.example.invalid',pathname:'/',search:'',hash:'',href:'https://synthetic.example.invalid/'};globalThis.history={replaceState(){}};globalThis.confirm=()=>assert.fail('Timer tests do not replace history');
 globalThis.setInterval=fn=>{intervals.push(fn);return intervals.length};globalThis.setTimeout=()=>0;globalThis.clearTimeout=()=>{};
 globalThis.fetch=async path=>{assert.ok(['./config.json','./media-manifest.json'].includes(path));return {ok:true,json:async()=>path==='./config.json'?{}:{exercises:[],assets:[],lookup:{}}}};
 if(voice){globalThis.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};globalThis.speechSynthesis={getVoices:()=>[],speak:m=>spoken.push(m),cancel:()=>speechCancels++}}
 globalThis.AudioContext=class{constructor(){audioContexts++;this.state='running';this.currentTime=0;this.destination={}}createOscillator(){return {frequency:{value:0},connect(){},disconnect(){},start(){audioStarts++},stop(){}}}createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}}}};
 return {
  rows,session,elements,element,legacyRaw,spoken,get speechCancels(){return speechCancels},get state(){return JSON.parse(rows.get('MGT_BETA_V8:guest'))},get timer(){return JSON.parse(session.get('MGT_BETA_REST_TIMER:guest')||'null')},get audio(){return {contexts:audioContexts,starts:audioStarts}},failSave(){failSave=true},poll(){for(const fn of intervals)fn()},
  async click(action,data={}){for(const fn of listeners.get('click')||[])fn({target:{closest:()=>({dataset:{action,...data},disabled:false})},preventDefault(){}});await new Promise(r=>setImmediate(r))},
  async change(i,j,key,value){for(const fn of listeners.get('change')||[])fn({target:{dataset:{set:`${i}:${j}:${key}`},value:String(value),checked:value,type:key==='done'?'checkbox':'number'}});await new Promise(r=>setImmediate(r))},
  async check(i,j){await this.change(i,j,'done',true)},
  restore(){for(const [name,descriptor]of previous)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name]}
 };
}

test('Done starts ordinary rest without changing loads/history; duplicate Done, uncheck and redraw never restart it',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment();try{
  await import('../app.mjs?rest-ui=ordinary');assert.equal(env.timer,null);assert.equal(env.audio.contexts,0);const before=env.state;
  await env.check(2,0);assert.equal(env.timer.kind,'set');assert.equal(env.timer.end-Date.now(),60000);assert.equal(env.element('restTray').hidden,false);assert.equal(env.element('restDialog').open,false);
  assert.deepEqual(env.state.logs['2026-12-01'],before.logs['2026-12-01']);assert.deepEqual(env.state.legacySnapshots,before.legacySnapshots);assert.deepEqual({...T.withoutCompletionTiming(env.state.logs[date].exercises[2].sets[0]),done:false},before.logs[date].exercises[2].sets[0]);assert.match(env.state.logs[date].exercises[2].sets[0].checkedAt,/^2027-01-04T/);
  assert.equal(env.audio.contexts,1);await env.click('timer-sound');assert.equal(JSON.parse(env.rows.get('MGT_BETA_REST_SETTINGS:guest')).sound,false);
  const end=env.timer.end;t.mock.timers.tick(10000);await env.check(2,0);assert.equal(env.timer.end,end);await env.change(2,0,'done',false);assert.equal(env.timer.end,end);
  await env.click('view',{view:'nutrition'});t.mock.timers.tick(90000);env.poll();assert.equal(env.timer,null);assert.equal(env.element('restTray').hidden,true);assert.match(env.element('toast').textContent,/Rest complete/);assert.equal(env.audio.starts,0);assert.equal(env.rows.get('MGT28v6'),'{"untouched":true}');
 }finally{env.restore()}
});
test('paired sets rest 60 seconds individually; the completed pair opens 3 minutes, sounds and closes automatically',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment();try{
  await import('../app.mjs?rest-ui=pair');await env.check(0,0);assert.equal(env.timer.kind,'set');assert.equal(env.timer.end-Date.now(),60000);await env.check(1,0);assert.equal(env.timer.kind,'set');assert.equal(env.timer.end-Date.now(),60000);assert.equal(env.element('restDialog').open,false);
  await env.check(0,1);assert.equal(env.timer.kind,'set');await env.check(1,1);assert.equal(env.timer.kind,'pair');assert.equal(env.timer.end-Date.now(),180000);assert.equal(env.element('restDialog').open,true);
  const saved=env.state;await env.change(2,0,'w',999);await env.click('remove-exercise',{index:2});assert.deepEqual(env.state,saved);assert.equal(env.audio.contexts,1);
  t.mock.timers.tick(180000);env.poll();assert.equal(env.audio.starts,8);env.poll();assert.equal(env.audio.starts,8);assert.equal(env.element('restDialog').open,false);assert.match(env.element('toast').textContent,/Ready to continue/);
  assert.equal(env.timer,null);assert.deepEqual(env.state,saved);await env.change(2,0,'w',45);assert.equal(env.state.logs[date].exercises[2].sets[0].w,45);
 }finally{env.restore()}
});
test('finishing a pair in the selected workout opens the popup without a prompt even on another scheduled date with Auto rest off',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment();try{
  env.rows.set('MGT_BETA_REST_SETTINGS:guest',JSON.stringify({auto:false,sound:false}));await import('../app.mjs?rest-ui=selected-pair');await env.click('open-date',{date:'2026-12-01'});const before=env.state;
  await env.check(0,0);await env.check(1,0);assert.equal(env.timer,null);await env.check(0,1);assert.equal(env.timer,null);await env.check(1,1);
  assert.equal(env.timer.kind,'pair');assert.equal(env.timer.date,'2026-12-01');assert.equal(env.timer.end-Date.now(),180000);assert.equal(env.element('restDialog').open,true);assert.equal(env.audio.contexts,1);
  assert.deepEqual(env.state.logs[date],before.logs[date]);assert.deepEqual(env.state.legacySnapshots,before.legacySnapshots);
  const saved=env.state;await env.click('stop-timer');assert.equal(env.element('restDialog').open,false);assert.deepEqual(env.state,saved);
 }finally{env.restore()}
});
test('ordinary rest works on the selected date, can be disabled, and never starts for invalid or failed saves',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment();try{
  await import('../app.mjs?rest-ui=guards');await env.click('timer-auto');await env.check(2,0);assert.equal(env.timer,null);await env.click('timer-auto');await env.change(2,1,'r','');await env.check(2,1);assert.equal(env.timer,null);assert.equal(env.state.logs[date].exercises[2].sets[1].done,false);
  await env.click('open-date',{date:'2026-12-01'});await env.check(2,0);assert.equal(env.timer.end-Date.now(),60000);await env.click('stop-timer');await env.click('open-date',{date});await env.change(2,1,'r',10);env.failSave();await env.check(2,1);assert.equal(env.timer,null);assert.equal(env.state.logs[date].exercises[2].sets[1].done,false);
 }finally{env.restore()}
});
test('finishing a non-superset exercise opens recovery, blocks edits and dismisses at zero without changing saved sets',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment();try{
  await import('../app.mjs?rest-ui=exercise');await env.check(2,0);assert.equal(env.timer.end-Date.now(),60000);await env.check(2,1);assert.equal(env.timer.kind,'exercise');assert.equal(env.timer.end-Date.now(),180000);assert.equal(env.element('restDialog').open,true);assert.equal(env.element('restDialogEyebrow').textContent,'Exercise complete');
  const saved=env.state;await env.change(2,0,'w',999);assert.deepEqual(env.state,saved);t.mock.timers.tick(179500);env.poll();assert.equal(env.element('restDialog').open,true);t.mock.timers.tick(500);env.poll();assert.equal(env.element('restDialog').open,false);assert.equal(env.timer,null);assert.equal(env.audio.starts,8);assert.deepEqual(env.state,saved);assert.equal(env.session.get('MGT_BETA_TIMER'),undefined);
 }finally{env.restore()}
});

test('working-set order follows real Done checks and is read-only; duplicate checks, backdated rows and failed saves do not invent timing',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment();try{
  await import('../app.mjs?rest-ui=recorded-order');const before=env.state;
  await env.check(2,0);const first=env.state.logs[date].exercises[2].sets[0].checkedAt;
  t.mock.timers.tick(90000);await env.check(0,0);assert.ok(Date.parse(env.state.logs[date].exercises[0].sets[0].checkedAt)>Date.parse(first));
  t.mock.timers.tick(90000);await env.check(2,0);assert.equal(env.state.logs[date].exercises[2].sets[0].checkedAt,first);
  assert.match(env.element('app').innerHTML,/Recorded working-set order: 2/);assert.match(env.element('app').innerHTML,/1 timed working set/);
  const saved=env.state;await env.click('workout-order');const body=env.element('modalBody').innerHTML;assert.match(body,/Recorded workout order/);assert.ok(body.indexOf('1 · Romanian Deadlift')<body.indexOf('2 · Dumbbell Bench Press'));assert.match(body,/All timed set checks/);assert.deepEqual(env.state,saved);await env.click('close-modal');
  await env.click('open-date',{date:'2026-12-01'});await env.check(2,0);assert.equal(env.state.logs['2026-12-01'].exercises[2].sets[0].checkedAt,undefined);await env.click('workout-order');assert.match(env.element('modalBody').innerHTML,/unknown timing/);await env.click('close-modal');
  await env.click('open-date',{date});const prior=env.state;env.failSave();await env.check(1,0);assert.deepEqual(env.state,prior);assert.equal(env.state.logs[date].exercises[1].sets[0].checkedAt,undefined);
  assert.deepEqual(env.state.legacySnapshots,before.legacySnapshots);assert.equal(env.rows.get('MGT28v6'),'{"untouched":true}');
 }finally{env.restore()}
});


test('first saved set and explicit workout completion speak once; mute, stop and failed saves respect voice controls',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment({voice:true});try{
  await import('../app.mjs?rest-ui=workout-voice');assert.equal(env.spoken.length,0);assert.doesNotMatch(env.element('app').innerHTML,/motivation-listen|Hear today/);
  await env.check(2,0);assert.equal(env.spoken.length,1);assert.match(env.spoken[0].text,/First set logged/);assert.equal(env.timer.seconds,60);
  await env.check(2,0);await env.change(2,0,'done',false);await env.check(2,0);assert.equal(env.spoken.length,1);
  await env.click('timer-sound');assert.equal(env.speechCancels,1);assert.equal(env.spoken.length,1);
  await env.click('timer-sound');assert.equal(env.spoken.length,1);await env.click('stop-timer');assert.equal(env.speechCancels,1);
  await env.check(2,1);assert.equal(env.timer.kind,'exercise');assert.equal(env.timer.seconds,180);await env.click('stop-timer');globalThis.confirm=()=>true;
  await env.click('complete');assert.equal(env.spoken.length,2);assert.match(env.spoken[1].text,/Workout complete/);assert.equal(env.state.logs[date].status,'completed');
  await env.click('stop-timer');assert.equal(env.speechCancels,2);await env.click('close-modal');await env.click('unlock');await env.click('complete');assert.equal(env.spoken.length,2);
  assert.equal(env.rows.get('MGT28v6'),env.legacyRaw);
 }finally{env.restore()}
 const failed=environment({voice:true});try{await import('../app.mjs?rest-ui=voice-failed-save');failed.failSave();await failed.check(2,0);assert.equal(failed.spoken.length,0);assert.equal(failed.rows.has('MGT_BETA_WORKOUT_VOICE:guest'),false)}finally{failed.restore()}
});
