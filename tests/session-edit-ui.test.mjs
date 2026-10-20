import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';

const from='2027-01-04',savedChoiceDate='2027-02-20';
const decode=value=>String(value||'').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const attributes=value=>Object.fromEntries([...value.matchAll(/([^\s=]+)(?:="([^"]*)"|'([^']*)'|([^\s"'=<>`]+))?/g)].map(match=>[match[1],decode(match[2]??match[3]??match[4]??'')]));
function fixture({entered=false,futureSparse=false,short=false}={}){
 const state=C.defaultState();state.nutrition.setupPromptSeen=true;
 state.gyms=[{id:'full',name:'Synthetic full gym',inventory:C.EQUIPMENT.slice(),dbMax:80,increment:2.5},{id:'sparse',name:'Synthetic dumbbell room',inventory:['Dumbbells'],dbMax:40,increment:2.5}];
 state.gymSchedules=futureSparse?[{id:'sparse-future',gymId:'sparse',type:'interval',every:1,durationDays:1,start:C.addDays(from,1),priority:10}]:[];
 state.training={...state.training,mode:'automatic',split:'split',frequency:4,restWeekdays:[0],startDate:from,defaultGym:'full',minRepeatDays:14};
 state.logs={};state.plan={};
 const initial=C.generateProgram({...C.clone(state),gymSchedules:[]},{start:from,days:1}).days[0];
 initial.run={minutes:12,done:false};initial.sauna={minutes:20,done:false};if(short)initial.exercises=initial.exercises.slice(0,1);
 if(entered)Object.assign(initial.exercises[0].sets[0],{w:0,r:8,rir:0,done:false});state.logs[from]=initial;
 const completed=C.clone(initial);Object.assign(completed,{id:C.addDays(from,2),date:C.addDays(from,2),title:'Protected completed synthetic session',status:'completed'});Object.assign(completed.exercises[0].sets[0],{w:0,r:10,rir:0,done:true});state.logs[completed.date]=completed;
 const future=C.clone(initial);Object.assign(future,{id:C.addDays(from,7),date:C.addDays(from,7),title:'Protected entered synthetic zero'});Object.assign(future.exercises[0].sets[0],{w:0,r:'',rir:0,done:false});state.logs[future.date]=future;
 state.routines=[{id:'tiny',name:'Synthetic single exercise routine',exercises:[C.makeExercise(C.CATALOG[0])]}];
 state.plan[savedChoiceDate]={...C.clone(initial),id:savedChoiceDate,date:savedChoiceDate,title:'Saved short generated choice',exercises:C.clone(initial.exercises.slice(0,1)),plannedExerciseCount:9};
 return state;
}
function environment(initial){
 const globals=['document','localStorage','sessionStorage','window','navigator','location','history','confirm','setInterval','setTimeout','clearTimeout','fetch','FormData'],previous=new Map(globals.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
 const elements=new Map(),listeners=new Map(),rows=new Map([['MGT_BETA_V8:guest',JSON.stringify(initial)]]),writes=[],requests=[],confirmations=[];
 class Element{
  constructor(id){Object.assign(this,{id,_html:'',textContent:'',value:'',open:false,disabled:false,dataset:{},classList:{add(){},remove(){}},listeners:{}})}
  get innerHTML(){return this._html}
  set innerHTML(value){this._html=String(value);if(this.id==='modalBody')parseForm(this._html)}
  addEventListener(name,listener){this.listeners[name]=listener}showModal(){this.open=true}close(){this.open=false}focus(){}
 }
 const element=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)};
 function parseForm(html){
  const match=html.match(/<form\b([^>]*\bid="dayForm"[^>]*)>([\s\S]*?)<\/form>/);if(!match){elements.delete('dayForm');return}
  const attrs=attributes(match[1]),form=new Element('dayForm');form.dataset={from:attrs['data-from']||''};form.elements={};form.controls=[];
  const add=(attrs,value)=>{const control=new Element(attrs.id||attrs.name||'');Object.assign(control,{name:attrs.name||'',type:attrs.type||'text',value:String(value??attrs.value??''),closest:selector=>selector==='#dayForm'?form:null});form.controls.push(control);form.elements[control.name]=control;if(attrs.id)elements.set(attrs.id,control)};
  for(const input of match[2].matchAll(/<input\b([^>]*)>/g))add(attributes(input[1]));
  for(const select of match[2].matchAll(/<select\b([^>]*)>([\s\S]*?)<\/select>/g)){const options=[...select[2].matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option>/g)].map(value=>attributes(value[1])),selected=options.find(option=>Object.hasOwn(option,'selected'))||options[0];add({...attributes(select[1]),type:'select-one'},selected?.value||'')}
  elements.set('dayForm',form);elements.set('workoutChoicePreview',new Element('workoutChoicePreview'));elements.set('saveSession',new Element('saveSession'));elements.set('sessionEditError',new Element('sessionEditError'));
 }
 const emit=async(name,target)=>{for(const listener of listeners.get(name)||[])listener({target,preventDefault(){}});await new Promise(resolve=>setImmediate(resolve))};
 globalThis.document={documentElement:{dataset:{preview:'local'}},activeElement:{tagName:'BODY'},hidden:false,getElementById:id=>id==='dayForm'?elements.get(id)||null:element(id),addEventListener:(name,listener)=>listeners.set(name,[...(listeners.get(name)||[]),listener]),querySelector:selector=>element('modal').open?(selector==='dialog[open]'?element('modal'):selector==='dialog[open] .error'?elements.get('sessionEditError')||null:null):null,querySelectorAll:selector=>selector==='#modalBody form, #app form'&&elements.has('dayForm')?[elements.get('dayForm')]:[]};
 globalThis.localStorage={getItem:key=>rows.get(key)??null,setItem:(key,value)=>{writes.push(key);rows.set(key,String(value))},removeItem(){assert.fail('Session editing must not remove stored data')}};
 globalThis.sessionStorage={getItem:()=>null,setItem(){},removeItem(){}};globalThis.window={addEventListener(){},scrollTo(){}};
 Object.defineProperty(globalThis,'navigator',{value:{onLine:true,vibrate(){}},configurable:true});globalThis.location={origin:'https://synthetic.example.invalid',pathname:'/',search:'',hash:'',href:'https://synthetic.example.invalid/'};globalThis.history={replaceState(){}};
 globalThis.confirm=message=>{confirmations.push(message);return true};globalThis.setInterval=()=>0;globalThis.setTimeout=()=>0;globalThis.clearTimeout=()=>{};
 globalThis.fetch=async request=>{requests.push(request);assert.ok(['./config.json','./media-manifest.json'].includes(request),'Only synthetic local bootstrap responses are allowed');return {ok:true,json:async()=>request==='./media-manifest.json'?{exercises:[],assets:[],lookup:{}}:{}}};
 globalThis.FormData=class{constructor(form){this.pairs=form.controls.map(control=>[control.name,String(control.value)])}getAll(key){return this.pairs.filter(([name])=>name===key).map(([,value])=>value)}has(key){return this.pairs.some(([name])=>name===key)}[Symbol.iterator](){return this.pairs[Symbol.iterator]()}};
 return {rows,writes,requests,confirmations,elements,get state(){return JSON.parse(rows.get('MGT_BETA_V8:guest'))},get form(){return elements.get('dayForm')},get preview(){return elements.get('workoutChoicePreview').innerHTML},get disabled(){return elements.get('saveSession').disabled},async click(action,data={}){await emit('click',{closest:()=>({dataset:{action,...data},disabled:false})})},async set(name,value){const control=this.form.elements[name];assert.ok(control,'Rendered field '+name+' exists');control.value=String(value);await emit('change',control)},async submit(){await emit('submit',this.form)},restore(){for(const [name,descriptor]of previous)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name]}};
}
async function open(env,label){await import('../app.mjs?session-edit-ui='+label);await env.click('open-date',{date:from});await env.click('edit-day');env.writes.length=0;return [...env.rows]}

test('session preview starts populated and a gym change refreshes the automatic shortfall without writes or confirmations',async()=>{
 const env=environment(fixture({entered:true}));
 try{
  const before=await open(env,'gym-shortfall');assert.match(env.preview,/2027-01-04.*Synthetic full gym.*9 of 9 planned exercises/);assert.equal(env.disabled,false);
  await env.set('workoutChoice','auto');await env.set('runMinutes',17);await env.set('saunaMinutes',0);await env.set('gymId','sparse');
  assert.match(env.preview,/Synthetic dumbbell room.*5 of 9 planned exercises/);assert.match(env.preview,/At least 6 exercises|6–9 exercises/);assert.match(env.preview,/equipment or exclusions|inventory or exclusions/);assert.equal(env.disabled,true);
  assert.equal(+env.form.elements.runMinutes.value,17);assert.equal(+env.form.elements.saunaMinutes.value,0);assert.match(env.preview,/Run: 17 min · Sauna: 0 min/);
  assert.deepEqual(env.writes,[]);assert.deepEqual([...env.rows],before);assert.deepEqual(env.confirmations,[]);
  await env.set('gymId','full');assert.equal(env.disabled,false);assert.match(env.preview,/Synthetic full gym.*9 of 9 planned exercises/);assert.equal(+env.form.elements.runMinutes.value,17);assert.equal(+env.form.elements.saunaMinutes.value,0);
  await env.set('workoutChoice','routine:tiny');assert.equal(+env.form.elements.runMinutes.value,0);assert.equal(+env.form.elements.saunaMinutes.value,20);assert.deepEqual(env.writes,[]);assert.deepEqual(env.confirmations,[]);
 }finally{env.restore()}
});

test('date and adjustment changes refresh the preview and failed future generation cannot save or snapshot',async()=>{
 const env=environment(fixture({entered:true,futureSparse:true}));
 try{
  const before=await open(env,'regeneration-failure');await env.set('workoutChoice','auto');await env.set('runMinutes',7);await env.set('saunaMinutes',0);
  await env.set('date',C.addDays(from,2));assert.equal(env.disabled,true);assert.match(env.preview,/destination contains entered or completed work/);
  await env.set('date',C.addDays(from,1));assert.equal(env.disabled,false);assert.match(env.preview,/2027-01-05.*Synthetic full gym/);assert.equal(+env.form.elements.runMinutes.value,7);
  await env.set('adjust','regenerate');assert.equal(env.disabled,true);assert.match(env.preview,/Next 28 days/);assert.match(env.preview,/Future days cannot be rebuilt/);assert.match(env.preview,/Synthetic dumbbell room/);assert.match(env.preview,/\d of \d planned exercises/);
  await env.submit();assert.match(env.elements.get('toast').textContent,/Automatic workouts need 6–9 exercises/);assert.match(env.elements.get('sessionEditError').textContent,/Automatic workouts need 6–9 exercises/);assert.deepEqual([...env.rows],before);assert.deepEqual(env.writes,[]);assert.deepEqual(env.confirmations,[]);
  await env.set('adjust','keep');assert.equal(env.disabled,false);assert.equal(env.elements.get('sessionEditError').textContent,'');assert.doesNotMatch(env.preview,/Next 28 days|Future days cannot be rebuilt/);assert.equal(+env.form.elements.runMinutes.value,7);assert.equal(+env.form.elements.saunaMinutes.value,0);
 }finally{env.restore()}
});

test('valid regeneration saves only after confirmation and preserves completed, entered-zero and replaced history',async()=>{
 const env=environment(fixture({entered:true}));
 try{
  const beforeRows=await open(env,'valid-save'),before=env.state;await env.set('workoutChoice','auto');await env.set('adjust','regenerate');await env.set('runMinutes',0);await env.set('saunaMinutes',0);
  assert.equal(env.disabled,false);assert.match(env.preview,/Next 28 days/);assert.match(env.preview,/2 entered days protected/);assert.match(env.preview,/Review rebuilt days/);assert.deepEqual([...env.rows],beforeRows);assert.deepEqual(env.writes,[]);assert.deepEqual(env.confirmations,[]);
  await env.submit();const after=env.state;assert.equal(env.confirmations.length,1);assert.match(env.confirmations[0],/entered version will remain in History/);assert.ok(env.writes.includes('MGT_BETA_SNAPSHOTS:guest'));
  assert.deepEqual(after.logs[C.addDays(from,2)],before.logs[C.addDays(from,2)]);assert.deepEqual(after.logs[C.addDays(from,7)],before.logs[C.addDays(from,7)]);
  const prior=Object.entries(after.logs).find(([date])=>date.startsWith(from+'~edit-'))?.[1];assert.ok(prior);const archived=C.clone(prior);archived.id=from;assert.deepEqual(archived,before.logs[from]);
  assert.equal(after.logs[from].run,null);assert.equal(after.logs[from].sauna,null);assert.ok(after.logs[from].exercises.length>=6&&after.logs[from].exercises.length<=9);assert.equal(after.logs[from].exercises[0].sets[0].w,'');assert.equal(after.logs[from].exercises[0].sets[0].rir,'');
  assert.deepEqual(after.plan,before.plan);assert.equal(before.logs[from].exercises[0].sets[0].w,0);assert.equal(before.logs[from].exercises[0].sets[0].rir,0);
 }finally{env.restore()}
});

test('existing short sessions, short routines and saved short choices remain editable and saveable',async t=>{
 for(const choice of ['keep','routine:tiny','plan:'+savedChoiceDate])await t.test(choice,async()=>{
  const env=environment(fixture({short:true}));
  try{
   const before=await open(env,'manual-short-'+choice);if(choice!=='keep')await env.set('workoutChoice',choice);
   assert.equal(env.disabled,false);assert.match(env.preview,/1 of (1|9) planned exercises/);assert.deepEqual([...env.rows],before);assert.deepEqual(env.writes,[]);assert.deepEqual(env.confirmations,[]);
   await env.submit();assert.equal(env.state.logs[from].exercises.length,1);assert.deepEqual(env.confirmations,[]);
  }finally{env.restore()}
 });
});
