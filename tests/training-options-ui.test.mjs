import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';
import {splitSession} from '../training.mjs';
import {trainingStreak} from '../motivation.mjs';
import {CloudSync} from '../cloud.mjs?v=8.2.0';

const date='2027-01-04';
const values=extra=>({start:date,days:28,age:57,experience:'Intermediate',goal:'muscle',approach:'build',frequency:4,split:'split',sets:3,range:'10-15',equipmentPreference:'free',runEvery:0,supersetMode:'off',defaultGym:'station',minRepeatDays:14,restWeekdays:[],...extra});

function environment({custom=false}={}){
 const names=['document','localStorage','sessionStorage','window','navigator','location','history','confirm','setInterval','setTimeout','clearTimeout','fetch','FormData'];
 const previous=new Map(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
 const state=C.defaultState();state.profile={...state.profile,age:'57',safetyNoticeVersion:1};state.nutrition.setupPromptSeen=true;
 state.training={...state.training,mode:'automatic',startDate:'2027-01-01',updatedAt:'2027-01-01T12:00:00Z',runEvery:0};
 const exercise=custom?{id:'custom-row',exerciseId:'custom-movement',name:'My movement',range:'8-12',sets:[]}:{...C.makeExercise(C.exerciseFor('Dumbbell Bench Press'),{count:1}),sets:[{id:'entered-set',role:'working',w:45,r:12,rir:3,done:true,rest:60,unknownField:{retain:0}}]};
 const finished=d=>({id:d,date:d,title:'Recorded workout',kind:'strength',gymId:'station',status:'completed',exercises:[{...C.makeExercise(C.exerciseFor('Plank'),{count:1}),sets:[{id:'completed-set',role:'working',w:0,r:30,rir:2,done:true}]}]});
 state.logs={'2027-01-01':finished('2027-01-01'),'2027-01-03':finished('2027-01-03'),[date]:{id:date,date,title:'Entered chest session',kind:'strength',status:'in-progress',gymId:'station',exercises:[exercise]}};
 state.plan={'2027-01-02':{id:'2027-01-02',date:'2027-01-02',kind:'rest',exercises:[]}};
 state.meals={[date]:{id:date,unknown:{retain:0},items:[]}};state.pantry=[{id:'retained-stock',name:'Saved ingredient',qty:2,unit:'g',unknown:false}];
 const legacy=C.defaultState(),legacyRaw=JSON.stringify(legacy);state.legacySnapshots=[{id:String(C.hash(legacyRaw)),data:legacy},{id:'retained-history',data:{unknown:{retain:0}}}];
 const rows=new Map([['MGT_BETA_V8:guest',JSON.stringify(state)],['MGT28v6',legacyRaw]]),elements=new Map(),listeners=new Map(),requests=[];
 class Element{constructor(id){Object.assign(this,{id,innerHTML:'',textContent:'',value:'',open:false,hidden:false,complete:true,naturalWidth:1024,dataset:{},events:new Map(),classList:{add(){},remove(){},toggle(){}}})}addEventListener(name,fn){this.events.set(name,fn)}showModal(){this.open=true}close(){this.open=false}focus(){}setAttribute(key,value){this[key]=value}}
 const element=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)};
 globalThis.document={documentElement:{dataset:{preview:'local'}},activeElement:{tagName:'BODY'},hidden:false,getElementById:element,addEventListener:(name,fn)=>listeners.set(name,[...(listeners.get(name)||[]),fn]),querySelector:s=>s==='dialog[open]'&&element('modal').open?element('modal'):null,querySelectorAll:()=>[]};
 globalThis.localStorage={getItem:key=>rows.get(key)??null,setItem:(key,value)=>rows.set(key,String(value)),removeItem(){assert.fail('These actions must not remove saved history')}};
 globalThis.sessionStorage={getItem:()=>null,setItem(){},removeItem(){}};
 globalThis.window={addEventListener(){},scrollTo(){},requestAnimationFrame:()=>0,cancelAnimationFrame(){},matchMedia:()=>({matches:true,addEventListener(){}})};
 Object.defineProperty(globalThis,'navigator',{value:{onLine:true,vibrate(){}},configurable:true});globalThis.location={origin:'https://synthetic.example.invalid',pathname:'/',search:'',hash:'',href:'https://synthetic.example.invalid/'};globalThis.history={replaceState(){}};globalThis.confirm=()=>true;globalThis.setInterval=()=>0;globalThis.setTimeout=()=>0;globalThis.clearTimeout=()=>{};
 globalThis.fetch=async path=>{requests.push(path);assert.ok(['./config.json','./media-manifest.json'].includes(path),'The new tools must not call an AI or backend service');return {ok:true,json:async()=>path==='./config.json'?{}:{exercises:[],assets:[],lookup:{}}}};
 globalThis.FormData=class{constructor(form){this.pairs=Object.entries(form.values||{}).flatMap(([key,value])=>Array.isArray(value)?value.map(item=>[key,String(item)]):[[key,String(value)]])}getAll(key){return this.pairs.filter(item=>item[0]===key).map(item=>item[1])}has(key){return this.pairs.some(item=>item[0]===key)}[Symbol.iterator](){return this.pairs[Symbol.iterator]()}};
 const settle=()=>new Promise(resolve=>setImmediate(resolve));
 return {rows,requests,element,legacyRaw,get html(){return element('app').innerHTML},get modal(){return element('modalBody').innerHTML},get state(){return JSON.parse(rows.get('MGT_BETA_V8:guest'))},async click(action,data={}){for(const fn of listeners.get('click')||[])fn({target:{closest:()=>({dataset:{action,...data},disabled:false})},preventDefault(){}});await settle()},async submit(input){for(const fn of listeners.get('submit')||[])fn({target:{id:'smartPlanForm',values:input,dataset:{}},preventDefault(){}});await settle()},async bands(phase,checked){for(const fn of listeners.get('change')||[])fn({target:{id:'preparationBands',dataset:{preparationPhase:phase},checked,type:'checkbox',isConnected:true,closest:()=>null}});await settle()},restore(){for(const [name,descriptor]of previous)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name]}};
}
async function start(env,key){await import('../app.mjs?training-options-ui='+key);assert.doesNotMatch(env.html,/The app could not open/)}

test('muscle-specific preparation and explicit band changes are read-only and leave the original mascot intact',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment();try{
  await start(env,'preparation');const before=[...env.rows],streak=trainingStreak(env.state,date);
  assert.match(env.html,/data-action="session-warmup"/);assert.match(env.html,/data-action="session-cooldown"/);assert.match(env.html,/artwork\/greek-athlete-gold.webp/);
  await env.click('session-warmup');assert.match(env.modal,/Chest/);assert.match(env.modal,/Shoulders/);assert.match(env.modal,/id="preparationBands"/);assert.doesNotMatch(env.modal,/Light band pull-apart/);
  await env.bands('warmup',true);assert.match(env.modal,/Light band pull-apart/);assert.match(env.modal,/Light resistance band/);assert.match(env.modal,/already|estimate/i);
  await env.bands('warmup',false);assert.doesNotMatch(env.modal,/Light band pull-apart/);assert.match(env.modal,/Shoulder-blade reaches/);
  await env.click('session-cooldown');assert.match(env.modal,/Low chest opener/);assert.match(env.modal,/15–20 seconds/);assert.match(env.modal,/heart.org/);
  await env.click('close-modal');assert.deepEqual([...env.rows],before);assert.deepEqual(trainingStreak(env.state,date),streak);assert.deepEqual(env.requests,['./config.json','./media-manifest.json']);
 }finally{env.restore()}
});

test('unknown custom movements receive general preparation without fabricated anatomy or new exercise records',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment({custom:true});try{
  await start(env,'custom-preparation');const before=[...env.rows];await env.click('session-warmup');assert.match(env.modal,/general preparation|No muscle metadata/i);assert.match(env.modal,/Gradual easy warm-up/);assert.doesNotMatch(env.modal,/Low chest opener|Light band pull-apart|Quadriceps/);await env.click('session-cooldown');assert.deepEqual([...env.rows],before);assert.equal(env.state.logs[date].exercises.length,1);
 }finally{env.restore()}
});

test('smart-plan preview honors editable user choices and only applies after review, preserving entered workouts and other records',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment();try{
  await start(env,'plan-preview');const before=env.state,beforeRows=[...env.rows],streak=trainingStreak(before,date);
  await env.click('view',{view:'program'});assert.match(env.html,/data-action="smart-plan"/);await env.click('smart-plan');assert.match(env.modal,/id="smartPlanForm"/);assert.match(env.modal,/name="age"[^>]*value="57"/);assert.match(env.modal,/The MENEI Split/);assert.match(env.modal,/nsca.com|clevelandclinic.org|acsm.org/);assert.doesNotMatch(env.modal,/AI-generated/i);
  await env.submit(values());assert.match(env.modal,/data-action="apply-program"/);assert.match(env.modal,/10-15/);assert.deepEqual([...env.rows],beforeRows,'Preview cannot save user choices or change workouts');
  await env.click('apply-program');const after=env.state;assert.equal(after.training.frequency,4);assert.equal(after.training.split,'split');assert.equal(after.training.sets,3);assert.equal(after.training.range,'10-15');assert.equal(after.training.equipmentPreference,'free');assert.equal(after.training.planAge,57);assert.equal(after.training.planGoal,'muscle');assert.equal(after.training.planApproach,'build');
  assert.deepEqual(after.logs,before.logs);for(const key of ['meals','pantry','legacySnapshots','profile','gyms','recipes'])assert.deepEqual(after[key],before[key],key);assert.equal(env.rows.get('MGT28v6'),env.legacyRaw);assert.deepEqual(trainingStreak(after,date),streak);
  assert.match(env.html,/data-action="smart-plan"[^>]*>Change preferences/);await env.click('smart-plan');
  for(const [name,value] of [['frequency',4],['split','split'],['sets',3],['range','10-15'],['approach','build']])assert.match(env.modal,new RegExp(`name="${name}"[\\s\\S]*?<option value="${value}" selected`));
  const planned=Object.values(after.plan).filter(day=>day.date>=date&&day.kind==='strength');assert.ok(planned.length>0);for(const day of planned){assert.ok(day.exercises.length>=6&&day.exercises.length<=9);for(const exercise of day.exercises){const meta=C.exerciseFor(exercise.exerciseId);assert.equal(exercise.range,meta.repUnit&&meta.repUnit!=='reps'?meta.range:'10-15');assert.equal(exercise.setTemplates.length,3)}}assert.deepEqual(env.requests,['./config.json','./media-manifest.json']);
 }finally{env.restore()}
});

test('invalid or underage inputs cannot replace saved history or reuse a previous valid plan draft',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment();try{
  await start(env,'invalid-plan');const before=[...env.rows];await env.click('smart-plan');await env.submit(values());assert.match(env.modal,/data-action="apply-program"/);await env.click('close-modal');await env.click('smart-plan');
  for(const age of ['',17,121,'invalid']){await env.submit(values({age}));assert.match(env.element('toast').textContent,/age|adult|18/i);assert.deepEqual([...env.rows],before)}
  await env.submit(values({experience:'Beginner',sets:4}));assert.match(env.element('toast').textContent,/Beginner|returning|1–3|1-3|sets/i);assert.deepEqual([...env.rows],before);
  await env.click('apply-program');assert.deepEqual([...env.rows],before);
 }finally{env.restore()}
});

test('the MENEI split changes its display name while retaining all four original muscle pairings',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment();try{
  await start(env,'split-label');const before=[...env.rows];await env.click('generator');assert.match(env.modal,/The MENEI Split/);assert.doesNotMatch(env.modal,/Original paired muscle rotation/);
  assert.deepEqual([0,1,2,3].map(index=>splitSession('split',index)),[
   ['Chest + Biceps',['Chest','Chest','Chest','Chest','Chest','Biceps','Biceps','Biceps','Biceps']],
   ['Back + Triceps',['Back','Back','Back','Back','Back','Triceps','Triceps','Triceps']],
   ['Legs',['quads','quads','quads','quads','hamstrings','hamstrings','calves','calves']],
   ['Shoulders + Abs',['anterior-delt','lateral-delt','lateral-delt','rear-delt','rear-delt','Shoulders','Core','Core']]
  ]);assert.deepEqual([...env.rows],before);
 }finally{env.restore()}
});

test('an in-flight cloud update invalidates an open smart-plan preview before any snapshot or save can overwrite newer choices',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment(),originalStart=CloudSync.prototype.start;let client;
 CloudSync.prototype.start=function(...args){client=this;return originalStart.apply(this,args)};
 try{
  await start(env,'inflight-cloud');assert.ok(client,'Capture the actual app CloudSync callback without making network requests');
  for(const changed of ['gym','training']){
   await env.click('smart-plan');await env.submit(values());assert.match(env.modal,/data-action="apply-program"/);const preview=env.modal,newer=C.clone(env.state);
   if(changed==='gym'){const gym=newer.gyms.find(item=>item.id==='station');gym.inventory=[...gym.inventory,'Resistance Bands'];gym.updatedAt='2027-01-04T12:01:00Z'}
   else{newer.training.minRepeatDays=21;newer.training.updatedAt='2027-01-04T12:02:00Z'}
   // This is the callback an already-started sync invokes when its response
   // arrives, even though the modal is now open and a new sync would be paused.
   client.applyState(newer);assert.equal(env.element('modal').open,true);assert.equal(env.modal,preview);const afterCloud=[...env.rows];
   await env.click('apply-program');assert.match(env.element('toast').textContent,/training or gym equipment changed while this preview was open/i);assert.deepEqual([...env.rows],afterCloud,'Reject before creating a snapshot or saving the stale draft');assert.deepEqual(env.state.gyms,newer.gyms);assert.deepEqual(env.state.training,newer.training);assert.deepEqual(env.state.logs,newer.logs);
  }
  assert.deepEqual(env.requests,['./config.json','./media-manifest.json']);assert.equal(env.rows.get('MGT28v6'),env.legacyRaw);
 }finally{CloudSync.prototype.start=originalStart;env.restore()}
});

test('Add warm-up routine previews before saving and adds a removable muscle-matched guide above working exercises',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment();try{
  await start(env,'optional-warmup');const before=env.state,beforeRows=[...env.rows],streak=trainingStreak(before,date);
  assert.match(env.html,/>Add warm-up routine<\/button>/);assert.doesNotMatch(env.html,/aria-label="Added warm-up routine"/);
  await env.click('session-warmup');assert.match(env.modal,/data-action="add-session-warmup"/);assert.deepEqual([...env.rows],beforeRows);
  await env.bands('warmup',true);await env.click('add-session-warmup');const after=env.state;assert.equal(after.logs[date].warmupRoutine.enabled,true);assert.equal(after.logs[date].warmupRoutine.bands,true);assert.deepEqual(after.logs[date].exercises,before.logs[date].exercises);assert.deepEqual(after.training,before.training);assert.deepEqual(after.plan,before.plan);assert.deepEqual(trainingStreak(after,date),streak);assert.equal(env.element('restDialog').open,false);assert.equal(env.element('restTray').hidden,true);
  assert.match(env.html,/aria-label="Added warm-up routine"/);assert.match(env.html,/Light band pull-apart/);assert.ok(env.html.indexOf('aria-label="Added warm-up routine"')<env.html.indexOf('<article class="card exercise">'));
  await env.click('view',{view:'nutrition'});await env.click('view',{view:'today'});assert.match(env.html,/aria-label="Added warm-up routine"/);
  await env.click('remove-session-warmup');assert.equal(env.state.logs[date].warmupRoutine.enabled,false);assert.doesNotMatch(env.html,/aria-label="Added warm-up routine"/);assert.deepEqual(env.state.logs[date].exercises,before.logs[date].exercises);assert.deepEqual(trainingStreak(env.state,date),streak);assert.equal(env.rows.get('MGT28v6'),env.legacyRaw);
 }finally{env.restore()}
});

test('an optional warm-up survives an unstarted program replacement and follows its new muscles without blocking replacement',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment({custom:true});try{
  await start(env,'warmup-program');await env.click('session-warmup');await env.click('add-session-warmup');const before=env.state,intent=before.logs[date].warmupRoutine;
  await env.click('smart-plan');await env.submit(values());await env.click('apply-program');const after=env.state;assert.deepEqual(after.plan[date].warmupRoutine,intent);assert.equal(Object.hasOwn(after.logs,date),false);assert.match(env.html,/aria-label="Added warm-up routine"/);assert.notEqual(after.plan[date].title,before.logs[date].title);assert.deepEqual(after.logs['2027-01-01'],before.logs['2027-01-01']);assert.deepEqual(after.meals,before.meals);
 }finally{env.restore()}
});

test('a warm-up preview cannot add to a different day or modify a completed workout',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment();try{
  await start(env,'stale-warmup');const before=[...env.rows];await env.click('session-warmup');await env.click('open-date',{date:'2027-01-05'});await env.click('add-session-warmup');assert.match(env.element('toast').textContent,/workout or its equipment changed/);assert.deepEqual([...env.rows],before);
  await env.click('close-modal');await env.click('open-date',{date:'2027-01-01'});await env.click('session-warmup');assert.doesNotMatch(env.modal,/data-action="add-session-warmup"/);await env.click('add-session-warmup');assert.deepEqual([...env.rows],before);
 }finally{env.restore()}
});

test('Escape or a closed warm-up preview cannot later save its abandoned draft',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment();try{
  await start(env,'cancelled-warmup');const before=[...env.rows];await env.click('session-warmup');env.element('modal').events.get('cancel')();env.element('modal').open=false;await env.click('add-session-warmup');assert.match(env.element('toast').textContent,/Open the warm-up routine preview/);assert.deepEqual([...env.rows],before);
  await env.click('session-warmup');env.element('modal').open=false;await env.click('add-session-warmup');assert.deepEqual([...env.rows],before);
 }finally{env.restore()}
});
