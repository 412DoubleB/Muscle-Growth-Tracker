import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';

const date='2027-01-04',priorDate='2027-01-01';
function fixture({entered=false,advanced=false,repOnly=false,live=false,targetWeight='',locked=false}={}){
 const state=C.defaultState();state.nutrition.setupPromptSeen=true;state.gymSchedules=[];state.training.defaultGym='synthetic';
 state.gyms=[{id:'synthetic',name:'Synthetic gym',inventory:C.EQUIPMENT.slice(),increment:5,dbMax:100}];
 const assisted=C.makeExercise(C.exerciseFor('Assisted Dip'),{count:3,range:'8-10'}),curl=C.makeExercise(C.exerciseFor('Cable Curl'),{count:3,range:'8-10'});
 const past=[C.clone(assisted),C.clone(curl)];for(const [i,e]of past.entries())for(const set of e.sets)Object.assign(set,{w:i?40:60,r:i?10:6,rir:2,done:true});
 state.logs={};state.plan={};state.logs[priorDate]={id:priorDate,date:priorDate,title:'Canonical synthetic history',kind:'strength',status:'completed',gymId:'synthetic',exercises:past,updatedAt:'2027-01-01T12:00:00Z',unknownHistory:{preserve:0}};
 for(const suffix of ['~edit-original','~restore-original','~import-conflict']){const key=priorDate+suffix,copy=C.clone(state.logs[priorDate]);Object.assign(copy,{id:key,title:'Preserved synthetic copy '+suffix,updatedAt:'2027-01-03T12:00:00Z'});for(const e of copy.exercises)for(const set of e.sets)Object.assign(set,{w:100,r:10});state.logs[key]=copy}
 if(entered){Object.assign(assisted.sets[0],{w:0,r:0,rir:0,done:false,unknownSetField:'keep zero'});Object.assign(assisted.sets[1],{w:55,r:8,rir:2,done:true})}
 if(advanced){assisted.setType='top';assisted.sets=C.setsFor(assisted,'top',4);Object.assign(assisted.sets[1],{w:70,r:8,rir:1,done:false,unknownSetField:'manual assistance'})}
 if(repOnly){Object.assign(curl.sets[0],{r:6,rir:0,unknownSetField:'entered reps'});Object.assign(curl.sets[1],{r:0,rir:0})}
 if(live){curl.range='6-10';Object.assign(curl.sets[0],{w:160,r:11,rir:3,done:false});curl.sets[1].w=targetWeight;if(targetWeight!=='')Object.assign(curl.sets[1],{r:0,rir:0,unknownSetField:'manual future load'})}
 state.logs[date]={id:date,date,title:'Synthetic current workout',kind:'strength',status:'in-progress',gymId:'synthetic',exercises:[assisted,curl],run:null,sauna:null,notes:[]};
 if(locked)state.logs[date].status='completed';
 const legacy=C.defaultState();state.legacySnapshots=[{id:String(C.hash(JSON.stringify(legacy))),data:legacy}];return {state,legacy};
}
function environment(options){
 const names=['document','localStorage','sessionStorage','window','navigator','location','history','confirm','setInterval','setTimeout','clearTimeout','fetch'],previous=new Map(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
 const {state,legacy}=fixture(options),rows=new Map([['MGT_BETA_V8:guest',JSON.stringify(state)],['MGT28v6',JSON.stringify(legacy)],['MGT_BETA_SNAPSHOTS:guest','[{"syntheticBackup":"retained"}]']]),writes=[],requests=[],elements=new Map(),listeners=new Map();
 class Element{constructor(id){Object.assign(this,{id,innerHTML:'',textContent:'',value:'',open:false,dataset:{},classList:{add(){},remove(){}}})}addEventListener(){}showModal(){this.open=true}close(){this.open=false}focus(){}}
 const element=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)};
 globalThis.document={documentElement:{dataset:{preview:'local'}},activeElement:{tagName:'BODY'},hidden:false,getElementById:element,addEventListener:(name,fn)=>listeners.set(name,[...(listeners.get(name)||[]),fn]),querySelector:s=>s==='dialog[open]'&&element('modal').open?element('modal'):null,querySelectorAll:()=>[]};
 globalThis.localStorage={getItem:key=>rows.get(key)??null,setItem:(key,value)=>{writes.push(key);rows.set(key,String(value))},removeItem(){assert.fail('Load suggestions must not remove saved data')}};
 globalThis.sessionStorage={getItem:()=>null,setItem(){},removeItem(){}};globalThis.window={addEventListener(){},scrollTo(){}};
 Object.defineProperty(globalThis,'navigator',{value:{onLine:true,vibrate(){}},configurable:true});globalThis.location={origin:'https://synthetic.example.invalid',pathname:'/',search:'',hash:'',href:'https://synthetic.example.invalid/'};globalThis.history={replaceState(){}};
 globalThis.confirm=()=>assert.fail('Viewing/applying load suggestions must not replace history');globalThis.setInterval=()=>0;globalThis.setTimeout=()=>0;globalThis.clearTimeout=()=>{};
 globalThis.fetch=async request=>{requests.push(request);assert.ok(['./config.json','./media-manifest.json'].includes(request),'Only synthetic bootstrap requests are allowed');return {ok:true,json:async()=>request==='./media-manifest.json'?{exercises:[],assets:[],lookup:{}}:{}}};
 return {rows,writes,requests,elements,get html(){return element('app').innerHTML},get state(){return JSON.parse(rows.get('MGT_BETA_V8:guest'))},async click(action,data={}){for(const fn of listeners.get('click')||[])await fn({target:{closest:()=>({dataset:{action,...data},disabled:false})},preventDefault(){}});await new Promise(resolve=>setImmediate(resolve))},async change(index,set,key,value){const target={dataset:{set:`${index}:${set}:${key}`},value:String(value),checked:value,type:key==='done'?'checkbox':'number'};for(const fn of listeners.get('change')||[])await fn({target});await new Promise(resolve=>setImmediate(resolve))},restore(){for(const [name,descriptor]of previous)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name]}};
}
async function open(env,label){await import('../app.mjs?workout-recommendations-ui='+label);assert.doesNotMatch(env.html,/The app could not open/);await env.click('open-date',{date});env.writes.length=0;return [...env.rows]}

test('workout shows easier assistance and canonical-history suggestions without writes, while preserved copies remain in History',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment();
 try{
  const before=await open(env,'display');assert.match(env.html,/Next: 65 lb × 8/);assert.match(env.html,/more increment of assistance|assistance by one increment/);assert.match(env.html,/Next: 45 lb × 8/);assert.doesNotMatch(env.html,/Next: 105 lb/);
  await env.click('view',{view:'history'});for(const suffix of ['~edit-original','~restore-original','~import-conflict'])assert.ok(env.html.includes('Preserved synthetic copy '+suffix));
  await env.click('open-date',{date});assert.deepEqual([...env.rows],before);assert.deepEqual(env.writes,[]);assert.deepEqual(env.requests.sort(),['./config.json','./media-manifest.json']);
 }finally{env.restore()}
});

test('explicit Apply suggested loads fills new workout fields and preserves canonical, archived and backup records',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment();
 try{
  await open(env,'apply');const before=env.state,otherRows=new Map([...env.rows].filter(([key])=>key!=='MGT_BETA_V8:guest'));
  await env.click('apply-loads',{index:'0'});await env.click('apply-loads',{index:'1'});const after=env.state;
  for(const set of after.logs[date].exercises[0].sets){assert.equal(set.w,65);assert.equal(set.r,8);assert.equal(set.done,false);assert.equal(set.rir,'')}
  for(const set of after.logs[date].exercises[1].sets){assert.equal(set.w,45);assert.equal(set.r,8)}
  for(const [key,log]of Object.entries(before.logs))if(key!==date)assert.deepEqual(after.logs[key],log);
  assert.deepEqual(after.plan,before.plan);assert.deepEqual(after.legacySnapshots,before.legacySnapshots);assert.deepEqual(new Map([...env.rows].filter(([key])=>key!=='MGT_BETA_V8:guest')),otherRows);assert.ok(env.writes.every(key=>key==='MGT_BETA_V8:guest'));
 }finally{env.restore()}
});

test('Apply suggested loads respects entered zero loads, completed sets and their unknown fields',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment({entered:true});
 try{
  await open(env,'entered');const before=env.state;await env.click('apply-loads',{index:'0'});const after=env.state;
  assert.deepEqual(after.logs[date].exercises[0].sets[0],before.logs[date].exercises[0].sets[0]);assert.deepEqual(after.logs[date].exercises[0].sets[1],before.logs[date].exercises[0].sets[1]);
  assert.equal(after.logs[date].exercises[0].sets[2].w,55);assert.equal(after.logs[date].exercises[0].sets[2].done,false);
  for(const [key,log]of Object.entries(before.logs))if(key!==date)assert.deepEqual(after.logs[key],log);assert.deepEqual(after.logs[date].exercises[1],before.logs[date].exercises[1]);
 }finally{env.restore()}
});

test('assisted accessory-set loads stay manual and Apply fills only the supported top-set recommendation',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment({advanced:true});
 try{
  await open(env,'manual-assistance');const before=env.state,card=env.html.match(/<article class="card exercise">[\s\S]*?<\/article>/)?.[0];
  assert.ok(card);assert.match(card,/manual/i);assert.match(card,/assistance/i);assert.match(card,/placeholder="—"/);
  await env.click('apply-loads',{index:'0'});const after=env.state,sets=after.logs[date].exercises[0].sets;
  assert.equal(sets[0].w,65);assert.equal(sets[0].r,8);assert.equal(sets[0].done,false);
  for(let i=1;i<sets.length;i++)assert.deepEqual(sets[i],before.logs[date].exercises[0].sets[i]);
  assert.equal(sets[2].w,'');assert.equal(sets[2].r,'');assert.equal(sets[3].w,'');
  for(const [key,log]of Object.entries(before.logs))if(key!==date)assert.deepEqual(after.logs[key],log);assert.ok(env.writes.every(key=>key==='MGT_BETA_V8:guest'));
 }finally{env.restore()}
});

test('Apply preserves entered reps and RIR when their weight is still blank',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment({repOnly:true});
 try{
  await open(env,'entered-reps');const before=env.state;await env.click('apply-loads',{index:'1'});const after=env.state,sets=after.logs[date].exercises[1].sets;
  assert.equal(sets[0].w,45);assert.equal(sets[0].r,6);assert.equal(sets[0].rir,0);
  assert.equal(sets[1].w,45);assert.equal(sets[1].r,0);assert.equal(sets[1].rir,0);
  assert.equal(sets[2].w,45);assert.equal(sets[2].r,8);assert.equal(sets[2].rir,'');
  for(let i=0;i<2;i++){const filled={...sets[i],w:before.logs[date].exercises[1].sets[i].w};assert.deepEqual(filled,before.logs[date].exercises[1].sets[i])}
  for(const [key,log]of Object.entries(before.logs))if(key!==date)assert.deepEqual(after.logs[key],log);
 }finally{env.restore()}
});

test('checking an over-range set updates same-workout guidance immediately and applying changes only the next blank set',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment({live:true});
 try{
  await open(env,'live-increase');const before=env.state,otherRows=new Map([...env.rows].filter(([key])=>key!=='MGT_BETA_V8:guest'));
  assert.doesNotMatch(env.html,/Next set 2: 165/);await env.change(1,0,'done',true);
  assert.match(env.html,/Next set 2: 165 lb × 6/);assert.match(env.html,/Use suggestion for set 2/);assert.match(env.html,/checked set 1: 11 reps · 3 RIR/);
  const checked=env.state;for(let j=1;j<4;j++)assert.deepEqual(checked.logs[date].exercises[1].sets[j],before.logs[date].exercises[1].sets[j]);
  await env.click('apply-loads',{index:'1'});const after=env.state;
  assert.equal(after.logs[date].exercises[1].sets[1].w,165);assert.equal(after.logs[date].exercises[1].sets[1].r,6);assert.equal(after.logs[date].exercises[1].sets[1].done,false);
  assert.deepEqual(after.logs[date].exercises[1].sets[0],checked.logs[date].exercises[1].sets[0]);for(let j=2;j<4;j++)assert.deepEqual(after.logs[date].exercises[1].sets[j],before.logs[date].exercises[1].sets[j]);
  assert.match(env.html,/Set 2 load entered/);for(const [key,log]of Object.entries(before.logs))if(key!==date)assert.deepEqual(after.logs[key],log);
  assert.deepEqual(new Map([...env.rows].filter(([key])=>key!=='MGT_BETA_V8:guest')),otherRows);
 }finally{env.restore()}
});

test('editing checked-set RIR or reps refreshes guidance without changing other set entries',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment({live:true});
 try{
  await open(env,'live-edits');await env.change(1,0,'done',true);const untouched=C.clone(env.state.logs[date].exercises[1].sets.slice(1));
  await env.change(1,0,'rir',2);assert.match(env.elements.get('loadGuidance-1').innerHTML,/Next set 2: 160 lb × 10/);
  await env.change(1,0,'r',5);assert.match(env.elements.get('loadGuidance-1').innerHTML,/Next set 2: 155 lb × 6/);assert.match(env.elements.get('loadGuidance-1').innerHTML,/back off by one increment/);
  assert.deepEqual(env.state.logs[date].exercises[1].sets.slice(1),untouched);
  await env.click('apply-loads',{index:'1'});assert.equal(env.state.logs[date].exercises[1].sets[1].w,155);
  await env.change(1,0,'done',false);assert.doesNotMatch(env.html,/Next set 2:/);assert.equal(env.state.logs[date].exercises[1].sets[1].w,155,'an explicitly applied value stays entered when a source set is unchecked');
 }finally{env.restore()}
});

test('an entered next-set load is left for manual editing and forced Apply does not overwrite it',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment({live:true,targetWeight:170});
 try{
  await open(env,'live-entered-target');await env.change(1,0,'done',true);assert.match(env.html,/Next set 2: 165 lb/);assert.match(env.html,/Adjust it manually/);
  const before=[...env.rows];env.writes.length=0;await env.click('apply-loads',{index:'1'});assert.deepEqual([...env.rows],before);assert.deepEqual(env.writes,[]);assert.match(env.elements.get('toast').textContent,/already has an entered load/);
 }finally{env.restore()}
});

test('completed workouts do not offer live next-set guidance or accept a load application',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment({live:true,locked:true});
 try{
  await open(env,'live-locked');assert.doesNotMatch(env.html,/Next set 2:/);const before=[...env.rows];await env.click('apply-loads',{index:'1'});assert.deepEqual([...env.rows],before);assert.deepEqual(env.writes,[]);
 }finally{env.restore()}
});
