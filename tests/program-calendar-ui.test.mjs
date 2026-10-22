import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';

const from='2027-01-04';
function fixture(){
 const state=C.defaultState();state.nutrition.setupPromptSeen=true;state.training.defaultGym='station';
 state.gyms=[{id:'station',name:'Scheduled station',inventory:[]},{id:'recorded',name:'Saved gym <North> & East',address:'2 Actual Street, Pittsburgh, PA',inventory:[]}];
 state.gymSchedules=[{id:'shift',gymId:'station',type:'interval',every:1,durationDays:1,start:'2026-12-01',priority:10}];state.logs={};state.plan={};
 for(let i=-35;i<90;i++){
  const date=C.addDays(from,i),exercise=C.makeExercise(C.CATALOG[0]);Object.assign(exercise.sets[0],{w:0,r:8,rir:0,done:true});
  state.logs[date]={id:date,date,title:'Synthetic workout '+date,kind:'strength',status:'completed',gymId:i===1?'missing':'recorded',exercises:[exercise],run:null,sauna:null};
 }
 const legacy={...C.defaultState(),synthetic:'Preserve original backup'};state.legacySnapshots=[{id:String(C.hash(JSON.stringify(legacy))),data:legacy}];
 return {state,legacy};
}
function environment(){
 const globals=['document','localStorage','sessionStorage','window','navigator','location','history','confirm','setInterval','setTimeout','clearTimeout','fetch','URL','FormData'];
 const previous=new Map(globals.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)])),{state,legacy}=fixture();
 let failSave=false;
 const rows=new Map([['MGT_BETA_V8:guest',JSON.stringify(state)],['MGT28v6',JSON.stringify(legacy)]]),elements=new Map(),listeners=new Map(),writes=[],downloads=[],blobs=new Map(),requests=[];
 class Element{
  constructor(id){Object.assign(this,{id,innerHTML:'',textContent:'',value:'',open:false,dataset:{},classList:{add(){},remove(){}}})}
  addEventListener(){}showModal(){this.open=true}close(){this.open=false}focus(){}
 }
 const element=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)};
 globalThis.document={documentElement:{dataset:{preview:'local'}},activeElement:{tagName:'BODY'},hidden:false,getElementById:element,addEventListener:(name,fn)=>listeners.set(name,[...(listeners.get(name)||[]),fn]),querySelector:selector=>selector==='dialog[open]'&&element('modal').open?element('modal'):null,querySelectorAll:()=>[],createElement:tag=>{assert.equal(tag,'a');return {click(){downloads.push({name:this.download,blob:blobs.get(this.href)})}}}};
 globalThis.FormData=class{constructor(form){this.pairs=Object.entries(form.values||{})}has(k){return this.pairs.some(([name])=>name===k)}[Symbol.iterator](){return this.pairs[Symbol.iterator]()}};
 globalThis.URL=class extends URL{static createObjectURL(blob){const id='blob:synthetic-'+blobs.size;blobs.set(id,blob);return id}static revokeObjectURL(){}};
 globalThis.localStorage={getItem:key=>rows.get(key)??null,setItem:(key,value)=>{if(failSave&&key==='MGT_BETA_V8:guest')throw new DOMException('Quota exceeded','QuotaExceededError');writes.push(key);rows.set(key,String(value))},removeItem(){assert.fail('Calendar viewing/export must preserve stored records')}};
 globalThis.sessionStorage={getItem:()=>null,setItem(){},removeItem(){}};globalThis.window={addEventListener(){},scrollTo(){}};
 Object.defineProperty(globalThis,'navigator',{value:{onLine:true,vibrate(){}},configurable:true});globalThis.location={origin:'https://synthetic.example.invalid',pathname:'/',search:'',hash:'',href:'https://synthetic.example.invalid/'};globalThis.history={replaceState(){}};
 globalThis.confirm=()=>assert.fail('Calendar viewing/export must not request a data-change confirmation');globalThis.setInterval=()=>0;globalThis.setTimeout=()=>0;globalThis.clearTimeout=()=>{};
 globalThis.fetch=async request=>{requests.push(request);assert.ok(['./config.json','./media-manifest.json'].includes(request),'Only local synthetic bootstrap requests are allowed');return {ok:true,json:async()=>request==='./media-manifest.json'?{exercises:[],assets:[],lookup:{}}:{}}};
 return {rows,writes,downloads,requests,failSave(){failSave=true},async submit(values){for(const fn of listeners.get('submit')||[])await fn({target:{id:'workoutScheduleForm',values,dataset:{}},preventDefault(){}});await new Promise(resolve=>setImmediate(resolve))},get html(){return element('app').innerHTML},async click(action,data={}){for(const fn of listeners.get('click')||[])await fn({target:{closest:()=>({dataset:{action,...data},disabled:false})},preventDefault(){}});await new Promise(resolve=>setImmediate(resolve))},restore(){for(const [name,descriptor]of previous)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name]}};
}
async function open(env,label){await import('../app.mjs?program-calendar-ui='+label);assert.doesNotMatch(env.html,/The app could not open/);await env.click('open-date',{date:from});await env.click('view',{view:'program'});env.writes.length=0;return [...env.rows]}
const starts=ics=>[...ics.matchAll(/(?:^|\r\n)DTSTART:(\d{8})T120000/g)].map(match=>match[1]);
async function exported(env,data={scope:'program'}){await env.click('calendar-export',data);const download=env.downloads.at(-1);assert.equal(download.name,'muscle-growth-tracker-calendar.ics');assert.equal(download.blob.type,'text/calendar');return download.blob.text()}
function assertRange(ics,start){assert.deepEqual(starts(ics),Array.from({length:28},(_,i)=>C.addDays(start,i).replaceAll('-','')))}

test('Program export follows the visible 28-day range through forward and backward paging without writing data',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(from+'T12:00:00Z').getTime()});const env=environment();
 try{
  const before=await open(env,'paging');assert.match(env.html,/28-day schedule · 2027-01-04 – 2027-01-31/);assertRange(await exported(env),from);
  await env.click('program-page',{offset:'28'});assert.match(env.html,/28-day schedule · 2027-02-01 – 2027-02-28/);assert.match(env.html,/Export 2027-02-01 – 2027-02-28 \(\.ics\)/);assertRange(await exported(env),'2027-02-01');
  await env.click('program-page',{offset:'-28'});await env.click('program-page',{offset:'-28'});assert.match(env.html,/28-day schedule · 2026-12-07 – 2027-01-03/);assertRange(await exported(env),'2026-12-07');
  assert.deepEqual([...env.rows],before);assert.deepEqual(env.writes,[]);
 }finally{env.restore()}
});

test('Settings and Home exports use the selected date rather than the hidden Program page offset',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(from+'T12:00:00Z').getTime()});const env=environment();
 try{
  const before=await open(env,'other-views');await env.click('program-page',{offset:'28'});
  await env.click('view',{view:'settings'});assertRange(await exported(env,{}),from);
  await env.click('view',{view:'today'});assertRange(await exported(env,{}),from);
  await env.click('view',{view:'program'});assertRange(await exported(env),'2027-02-01');assert.deepEqual([...env.rows],before);assert.deepEqual(env.writes,[]);
 }finally{env.restore()}
});

test('calendar separates the recorded workout gym from the scheduled station and never invents a missing saved gym',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(from+'T12:00:00Z').getTime()});const env=environment();
 try{
  const before=await open(env,'saved-gym'),cell=date=>env.html.match(new RegExp('<button class="calDate[^>]*data-date="'+date+'"[\\s\\S]*?</button>'))?.[0];
  assert.match(cell(from),/Workout gym: Saved gym &lt;North&gt; &amp; East/);assert.match(cell(from),/Scheduled gym: Scheduled station/);assert.match(cell(from),/class="shiftDot"/);assert.match(cell(from),/aria-label=/);
  const missing=cell(C.addDays(from,1));assert.match(missing,/Workout gym: Unassigned/);assert.match(missing,/Scheduled gym: Scheduled station/);assert.match(missing,/class="shiftDot"/);
  assert.match(env.html,/<h3[^>]*>Synthetic workout 2027-01-05<\/h3><div class="sub">Unassigned ·/);
  const ics=(await exported(env)).replace(/\r\n[ \t]/g,'');assert.match(ics,/LOCATION:Saved gym <North> & East · 2 Actual Street\\, Pittsburgh\\, PA/);assert.doesNotMatch(ics,/Scheduled station/);assert.doesNotMatch(ics,/BEGIN:VALARM/);
  assert.deepEqual([...env.rows],before);assert.deepEqual(env.writes,[]);assert.deepEqual(env.requests.sort(),['./config.json','./media-manifest.json']);
 }finally{env.restore()}
});

test('workout schedule saves separately from daily push preferences, drives Home/calendar, and rolls back failed saves',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(from+'T12:00:00Z').getTime()});const env=environment();try{
  const state=JSON.parse(env.rows.get('MGT_BETA_V8:guest'));state.reminders={...state.reminders,enabled:true,time:'11:45',timezone:'America/Los_Angeles',meals:true,unknown:{keep:0}};state.logs[from].status='in-progress';env.rows.set('MGT_BETA_V8:guest',JSON.stringify(state));env.rows.set('MGT_BETA_VAPID','retain existing public key');
  await open(env,'workout-time');await env.click('view',{view:'settings'});assert.match(env.html,/id="workoutScheduleForm"/);assert.match(env.html,/Usual workout start time/);const before=JSON.parse(env.rows.get('MGT_BETA_V8:guest'));
  await env.submit({workoutTime:'18:15',workoutTimezone:'America/New_York'});const saved=JSON.parse(env.rows.get('MGT_BETA_V8:guest'));assert.equal(saved.reminders.workoutTime,'18:15');assert.equal(saved.reminders.workoutTimezone,'America/New_York');for(const key of ['enabled','time','timezone','meals','workout','unknown'])assert.deepEqual(saved.reminders[key],before.reminders[key]);assert.deepEqual(saved.logs,before.logs);assert.deepEqual(saved.plan,before.plan);assert.deepEqual(saved.legacySnapshots,before.legacySnapshots);assert.equal(env.rows.get('MGT_BETA_VAPID'),'retain existing public key');
  await env.click('view',{view:'today'});assert.match(env.html,/Usual start · 18:15 America\/New_York/);const ics=(await exported(env)).replace(/\r\n[ \t]/g,'');assert.match(ics,/DTSTART:20270104T231500Z/);assert.equal((ics.match(/TRIGGER:-PT60M/g)||[]).length,1);
  await env.click('view',{view:'settings'});const bytes=[...env.rows];await env.submit({workoutTime:'25:00',workoutTimezone:'America/New_York'});assert.deepEqual([...env.rows],bytes);
  env.failSave();await env.submit({workoutTime:'19:45',workoutTimezone:'America/New_York'});assert.deepEqual([...env.rows],bytes);await env.click('view',{view:'today'});assert.match(env.html,/Usual start · 18:15 America\/New_York/);assert.doesNotMatch(env.html,/Usual start · 19:45/);assert.deepEqual(env.requests.sort(),['./config.json','./media-manifest.json']);
 }finally{env.restore()}
});
