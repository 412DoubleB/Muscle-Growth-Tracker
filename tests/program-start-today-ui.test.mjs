import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';
const date='2027-01-04',options={start:date,days:28,frequency:4,experience:'Intermediate',split:'ppl',trainingStyle:'strength',supersetMode:'off',sets:4,range:'1-5',restSeconds:60,defaultGym:'crunch',minRepeatDays:14,runEvery:0,saunaMinutes:0,restWeekdays:[0],excludePullups:'on'};
function environment({entry,planEntry=false}={}){
 const names=['document','localStorage','sessionStorage','window','navigator','location','history','confirm','setInterval','setTimeout','clearTimeout','fetch','FormData'],previous=new Map(names.map(n=>[n,Object.getOwnPropertyDescriptor(globalThis,n)]));
 const state=C.defaultState();state.profile.safetyNoticeVersion=1;state.nutrition.setupPromptSeen=true;state.training={...state.training,mode:'automatic',startDate:date};state.gymSchedules=[];
 const day=C.generateProgram(state,{start:date,days:1}).days[0];day.run={minutes:25,done:false};day.title='Old unstarted workout';day.status='in-progress';if(entry)Object.assign(day.exercises[0].sets[0],entry);
 state.plan[date]=C.packPlanDay(day);if(!planEntry)state.logs[date]=C.clone(day);
 const past=C.clone(day);past.id=past.date='2027-01-03';past.status='completed';past.exercises[0].sets[0]={...past.exercises[0].sets[0],w:0,r:8,rir:0,done:true,unknown:{retain:true}};state.logs[past.date]=past;state.logs[past.date+'~copy']={...C.clone(past),id:past.date+'~copy'};
 const future=C.clone(past);future.id=future.date='2027-01-06';state.logs[future.date]=future;state.plan['2027-06-01']={...C.clone(day),id:'2027-06-01',date:'2027-06-01',ownerNote:'outside the preview'};
 const legacyRaw=JSON.stringify(C.defaultState()),rows=new Map([['MGT_BETA_V8:guest',JSON.stringify(state)],['MGT28v6',legacyRaw]]),elements=new Map(),listeners=new Map(),requests=[];
 class Element{constructor(id){Object.assign(this,{id,innerHTML:'',textContent:'',value:'',open:false,dataset:{},elements:{},classList:{add(){},remove(){},toggle(){}}})}addEventListener(){}showModal(){this.open=true}close(){this.open=false}focus(){this.focused=true}}
 const element=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)};
 globalThis.document={documentElement:{dataset:{preview:'local'}},activeElement:{tagName:'BODY'},hidden:false,getElementById:element,querySelector:()=>null,querySelectorAll:()=>[],addEventListener:(n,fn)=>listeners.set(n,[...(listeners.get(n)||[]),fn])};
 globalThis.localStorage={getItem:k=>rows.get(k)??null,setItem:(k,v)=>rows.set(k,String(v)),removeItem(){assert.fail('No history removal')}};globalThis.sessionStorage={getItem:()=>null,setItem(){},removeItem(){}};
 globalThis.window={addEventListener(){},scrollTo(){},matchMedia:()=>({matches:true,addEventListener(){}})};Object.defineProperty(globalThis,'navigator',{value:{onLine:true},configurable:true});globalThis.location={origin:'https://synthetic.invalid',pathname:'/',search:'',hash:'',href:'https://synthetic.invalid/'};globalThis.history={replaceState(){}};globalThis.confirm=()=>assert.fail('Program updates must preserve recorded days');globalThis.setTimeout=globalThis.setInterval=()=>0;globalThis.clearTimeout=()=>{};
 globalThis.fetch=async path=>{requests.push(path);assert.ok(['./config.json','./media-manifest.json'].includes(path));return {ok:true,json:async()=>path==='./config.json'?{}:{exercises:[],assets:[],lookup:{}}}};
 globalThis.FormData=class{constructor(form){this.rows=Object.entries(form.values).flatMap(([k,v])=>Array.isArray(v)?v.map(x=>[k,String(x)]):[[k,String(v)]])}getAll(k){return this.rows.filter(x=>x[0]===k).map(x=>x[1])}has(k){return this.rows.some(x=>x[0]===k)}[Symbol.iterator](){return this.rows[Symbol.iterator]()}};
 const event=async(n,v)=>{for(const fn of listeners.get(n)||[])fn(v);await new Promise(r=>setImmediate(r))};
 return {rows,element,requests,legacyRaw,event,get state(){return JSON.parse(rows.get('MGT_BETA_V8:guest'))},click:(action,data={})=>event('click',{target:{closest:()=>({dataset:{action,...data}})},preventDefault(){}}),submit:values=>event('submit',{target:{id:'generatorForm',values,dataset:{}},preventDefault(){}}),restore(){for(const [n,d]of previous)if(d)Object.defineProperty(globalThis,n,d);else delete globalThis[n]}};
}
async function open(env,id){await import('../app.mjs?program-start-today='+id);assert.doesNotMatch(env.element('app').innerHTML,/The app could not open/)}
function preserved(env,before){const after=env.state;for(const key of ['2027-01-03','2027-01-03~copy','2027-01-06'])assert.deepEqual(after.logs[key],before.logs[key]);assert.deepEqual(after.plan['2027-06-01'],before.plan['2027-06-01']);for(const k of ['meals','pantry','leftovers','recipes','legacySnapshots','conflicts'])assert.deepEqual(after[k],before[k]);assert.equal(env.rows.get('MGT28v6'),env.legacyRaw);assert.deepEqual(env.requests,['./config.json','./media-manifest.json'])}
test('Settings defaults to today despite a previously viewed future day; preview is read-only and saving updates Home immediately',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment();try{
  await open(env,'unstarted');await env.click('open-date',{date:'2027-02-01'});await env.click('view',{view:'settings'});const before=env.state,raw=[...env.rows];await env.click('generator');assert.match(env.element('modalBody').innerHTML,/id="programStartDate"/);assert.match(env.element('modalBody').innerHTML,/name="start"[^>]*value="2027-01-04"/);assert.match(env.element('modalBody').innerHTML,/Today’s workout can be updated/);
  const form=env.element('generatorForm');form.elements.start={value:'2027-02-01',focus(){this.focused=true}};await env.click('program-start-today');assert.equal(form.elements.start.value,date);assert.equal(form.elements.start.focused,true);assert.deepEqual([...env.rows],raw);
  await env.submit(options);assert.match(env.element('modalBody').innerHTML,/Save program \+ update today/);assert.deepEqual([...env.rows],raw);await env.click('apply-program');
  const saved=env.state,today=C.dayFor(saved,date);assert.equal(today.trainingStyle,'strength');assert.equal(today.split,'ppl');assert.ok(today.exercises.length>=6);assert.ok(today.exercises.every(e=>e.range==='1-5'&&e.sets.length===4));assert.equal(today.run,null);assert.equal(saved.logs[date],undefined);assert.match(env.element('app').innerHTML,/Your workout/);assert.match(env.element('toast').textContent,/Today’s workout and future unstarted/);preserved(env,before);
 }finally{env.restore()}
});
test('same-day program changes preserve gym entries in either logs or plans and clearly explain protection',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});
 for(const [label,fixture]of [['zero-load',{entry:{w:0}}],['zero-rir',{entry:{rir:0}}],['entered-plan',{entry:{r:8},planEntry:true}]]){const env=environment(fixture);try{
  await open(env,label);const before=env.state;await env.click('view',{view:'settings'});await env.click('generator');assert.match(env.element('modalBody').innerHTML,/Today’s workout stays protected/);await env.submit(options);assert.match(env.element('modalBody').innerHTML,/Gym entries are already saved/);assert.doesNotMatch(env.element('modalBody').innerHTML,/Save program \+ update today/);await env.click('apply-program');assert.deepEqual(env.state.logs[date],before.logs[date]);assert.deepEqual(env.state.plan[date],before.plan[date]);assert.equal(env.state.training.trainingStyle,'strength');preserved(env,before);
 }finally{env.restore()}}
});
test('entries added after preview are rechecked at Save and remain unchanged',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment();try{
  await open(env,'late-entry');await env.submit(options);await env.event('input',{target:{id:'',dataset:{set:'0:0:w'},value:'0'}});const before=env.state;await env.click('apply-program');assert.deepEqual(env.state.logs[date],before.logs[date]);assert.equal(env.state.logs[date].exercises[0].sets[0].w,0);assert.equal(env.state.training.trainingStyle,'strength');assert.match(env.element('toast').textContent,/Recorded workouts preserved/);preserved(env,before);
 }finally{env.restore()}
});
