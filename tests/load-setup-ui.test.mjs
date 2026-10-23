import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';

const date='2027-01-04',prior='2027-01-01',otherDate='2027-01-05';
const decode=s=>String(s).replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const attributes=s=>Object.fromEntries([...s.matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map(([,key,value])=>[key,value===undefined?'':decode(value)]));
function environment({units='lb',locked=false}={}){
 const keys=['document','localStorage','sessionStorage','window','navigator','location','history','confirm','setInterval','setTimeout','clearTimeout','fetch','FormData'],old=new Map(keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
 const state=C.defaultState();state.nutrition.setupPromptSeen=true;state.profile.units=units;state.gymSchedules=[];state.training.defaultGym='synthetic';
 const definition=C.exerciseFor('Cable Curl'),exercise=C.makeExercise(definition,{count:3,range:'8-12'});
 Object.assign(exercise.sets[0],{w:0,r:8,rir:0,done:true,unknownSet:{retain:true}});Object.assign(exercise.sets[1],{w:50,r:11,rir:2,done:false});
 const profile={lb:{kind:'stack',step:5,plates:[2.5,5,10],sides:2,minimum:0,unknownUnit:'keep'},kg:{kind:'stack',step:2.5,plates:[1.25,2.5,5],sides:2,minimum:0},unknownProfile:'retain'};
 state.gyms=[{id:'synthetic',name:'Synthetic gym',inventory:C.EQUIPMENT.slice(),increment:5,incrementKg:2.5,dbMax:100,unknownGym:{keep:0},loadProfiles:{[definition.id]:profile,other:{lb:{kind:'stack',step:15,unknown:'keep'}}}},{id:'other',name:'Other gym',inventory:[],increment:10,loadProfiles:{[definition.id]:{lb:{kind:'stack',step:10}}}}];
 state.logs={
  [date]:{id:date,date,kind:'strength',title:'Synthetic current workout',gymId:'synthetic',status:locked?'completed':'in-progress',exercises:[exercise],notes:[]},
  [prior]:{id:prior,date:prior,kind:'strength',title:'Synthetic saved workout',gymId:'synthetic',status:'completed',exercises:[C.clone(exercise)],unknownHistory:{keep:0}},
  [otherDate]:{id:otherDate,date:otherDate,kind:'strength',title:'Synthetic later workout',gymId:'synthetic',status:'planned',exercises:[C.clone(exercise)]}
 };state.plan={};const legacy=C.defaultState();state.legacySnapshots=[{id:'synthetic-old',data:{zero:0,history:'preserved'}},{id:String(C.hash(JSON.stringify(legacy))),data:legacy}];
 const rows=new Map([['MGT_BETA_V8:guest',JSON.stringify(state)],['MGT_BETA_SNAPSHOTS:guest','[{"syntheticBackup":"retained"}]'],['MGT28v6',JSON.stringify(legacy)]]),writes=[],requests=[],elements=new Map(),listeners=new Map();let forms=[],rejectSave=false;
 class Element{
  constructor(id){Object.assign(this,{id,innerHTML:'',textContent:'',value:'',open:false,dataset:{},isConnected:true,classList:{add(){},remove(){}}})}
  set innerHTML(value){this._html=String(value);if(this.id==='modalBody')parseForms(this._html)}
  get innerHTML(){return this._html}
  addEventListener(){}showModal(){this.open=true}close(){this.open=false}focus(){}
 }
 function parseForms(html){
  for(const form of forms)form.isConnected=false;forms=[];elements.delete('loadSetupForm');
  const match=html.match(/<form\b([^>]*\bid="loadSetupForm"[^>]*)>([\s\S]*?)<\/form>/);if(!match)return;
  const attrs=attributes(match[1]),form=new Element('loadSetupForm');form.dataset=Object.fromEntries(Object.entries(attrs).filter(([key])=>key.startsWith('data-')).map(([key,value])=>[key.slice(5),value]));form.elements={};form.controls=[];
  const add=(attrs,value)=>{const control={name:attrs.name,value:value??attrs.value??'',disabled:Object.hasOwn(attrs,'disabled')};form.elements[control.name]=control;form.controls.push(control)};
  for(const item of match[2].matchAll(/<input\b([^>]*)>/g))add(attributes(item[1]));
  for(const item of match[2].matchAll(/<select\b([^>]*)>([\s\S]*?)<\/select>/g)){const choices=[...item[2].matchAll(/<option\b([^>]*)>/g)].map(option=>attributes(option[1]));add(attributes(item[1]),(choices.find(choice=>Object.hasOwn(choice,'selected'))||choices[0]).value)}
  forms.push(form);elements.set('loadSetupForm',form);
 }
 const element=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)};
 globalThis.document={documentElement:{dataset:{preview:'local'}},activeElement:{tagName:'BODY'},hidden:false,getElementById:element,addEventListener:(name,fn)=>listeners.set(name,[...(listeners.get(name)||[]),fn]),querySelector:s=>s==='dialog[open]'&&element('modal').open?element('modal'):null,querySelectorAll:s=>s==='#modalBody form, #app form'?forms:[]};
 globalThis.localStorage={getItem:key=>rows.get(key)??null,setItem:(key,value)=>{if(rejectSave&&key==='MGT_BETA_V8:guest')throw Error('Synthetic quota failure');writes.push(key);rows.set(key,String(value))},removeItem(){assert.fail('Load setup must not remove saved data')}};
 globalThis.sessionStorage={getItem:()=>null,setItem(){},removeItem(){}};globalThis.window={addEventListener(){},scrollTo(){}};
 Object.defineProperty(globalThis,'navigator',{value:{onLine:true,vibrate(){}},configurable:true});globalThis.location={origin:'https://synthetic.example.invalid',pathname:'/',search:'',hash:'',href:'https://synthetic.example.invalid/'};globalThis.history={replaceState(){}};
 globalThis.confirm=()=>assert.fail('Load setup never replaces existing history');globalThis.setInterval=()=>0;globalThis.setTimeout=()=>0;globalThis.clearTimeout=()=>{};
 globalThis.fetch=async request=>{requests.push(request);assert.ok(['./config.json','./media-manifest.json'].includes(request),'No live service requests');return {ok:true,json:async()=>request==='./media-manifest.json'?{exercises:[],assets:[],lookup:{}}:{}}};
 globalThis.FormData=class{constructor(form){this.pairs=form.controls.map(control=>[control.name,String(control.value)])}getAll(key){return this.pairs.filter(([name])=>name===key).map(([,value])=>value)}has(key){return this.pairs.some(([name])=>name===key)}[Symbol.iterator](){return this.pairs[Symbol.iterator]()}};
 const emit=async(name,target)=>{for(const listener of listeners.get(name)||[])await listener({target,preventDefault(){}});await new Promise(resolve=>setImmediate(resolve))};
 return {rows,writes,requests,elements,key:definition.id,get html(){return element('app').innerHTML},get dialog(){return element('modalBody').innerHTML},get form(){return elements.get('loadSetupForm')},get state(){return JSON.parse(rows.get('MGT_BETA_V8:guest'))},async click(action,data={}){await emit('click',{closest:()=>({dataset:{action,...data},disabled:false})})},async submit(values={},form=this.form){for(const [key,value]of Object.entries(values))form.elements[key].value=String(value);await emit('submit',form)},failSave(){rejectSave=true},restore(){for(const [key,descriptor]of old)if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key]}};
}
async function open(t,env){t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});await import('../app.mjs?load-setup-ui='+encodeURIComponent(t.name));assert.doesNotMatch(env.html,/The app could not open/);await env.click('open-date',{date});env.writes.length=0;await env.click('load-setup',{index:'0'})}

test('viewing and cancelling equipment-specific load setup never writes stored records',async t=>{
 const env=environment();try{
  await open(t,env);assert.match(env.html,/Load setup/);assert.match(env.dialog,/Load setup · Cable Curl/);assert.match(env.dialog,/Synthetic gym · lb/);assert.equal(env.form.elements.kind.value,'stack');assert.equal(env.form.elements.step.value,'5');assert.match(env.dialog,/one 10 lb plate on each side adds 20 lb total/);assert.match(env.dialog,/Do not double a weight already entered/);assert.deepEqual(env.writes,[]);
  const before=[...env.rows];await env.click('close-modal');assert.deepEqual([...env.rows],before);assert.deepEqual(env.writes,[]);
 }finally{env.restore()}
});

test('saving a machine increment is gym- and exercise-specific, preserving entered sets and all other settings',async t=>{
 const env=environment();try{
  await open(t,env);const before=env.state,otherRows=new Map([...env.rows].filter(([key])=>key!=='MGT_BETA_V8:guest'));
  await env.submit({kind:'stack',step:'10',minimum:'0'});const after=env.state,profile=after.gyms[0].loadProfiles[env.key];
  assert.equal(profile.lb.step,10);assert.equal(profile.lb.kind,'stack');assert.equal(profile.lb.minimum,0);assert.equal(profile.lb.unknownUnit,'keep');assert.deepEqual(profile.kg,before.gyms[0].loadProfiles[env.key].kg);assert.equal(profile.unknownProfile,'retain');assert.deepEqual(after.gyms[0].loadProfiles.other,before.gyms[0].loadProfiles.other);assert.deepEqual(after.gyms[0].unknownGym,before.gyms[0].unknownGym);assert.deepEqual(after.gyms[1],before.gyms[1]);
  assert.deepEqual(after.logs,before.logs);assert.deepEqual(after.plan,before.plan);assert.deepEqual(after.legacySnapshots,before.legacySnapshots);assert.deepEqual(new Map([...env.rows].filter(([key])=>key!=='MGT_BETA_V8:guest')),otherRows);assert.ok(env.writes.every(key=>key==='MGT_BETA_V8:guest'));assert.match(env.elements.get('toast').textContent,/Recorded sets are unchanged/);
 }finally{env.restore()}
});

test('plate setup saves one-side sizes and two matching sides without doubling recorded weights',async t=>{
 const env=environment();try{
  await open(t,env);const before=env.state;await env.submit({kind:'plates',plates:'10, 25, 35, 45',sides:'2',minimum:'45'});const after=env.state,profile=after.gyms[0].loadProfiles[env.key].lb;
  assert.equal(profile.kind,'plates');assert.deepEqual(profile.plates,[10,25,35,45]);assert.equal(profile.sides,2);assert.equal(profile.minimum,45);assert.deepEqual(after.logs,before.logs);
  await env.click('load-setup',{index:'0'});assert.equal(env.form.elements.plates.value,'10, 25, 35, 45');assert.equal(env.form.elements.minimum.value,'45');await env.submit({sides:'1'});assert.equal(env.state.gyms[0].loadProfiles[env.key].lb.sides,1);
 }finally{env.restore()}
});

test('kilogram setup changes only its saved unit profile',async t=>{
 const env=environment({units:'kg'});try{
  await open(t,env);const before=env.state;assert.match(env.dialog,/Synthetic gym · kg/);assert.equal(env.form.elements.step.value,'2.5');await env.submit({step:'5'});assert.equal(env.state.gyms[0].loadProfiles[env.key].kg.step,5);assert.deepEqual(env.state.gyms[0].loadProfiles[env.key].lb,before.gyms[0].loadProfiles[env.key].lb);assert.deepEqual(env.state.logs,before.logs);
 }finally{env.restore()}
});

test('invalid setup and failed storage leave saved and in-memory load profiles intact',async t=>{
 const env=environment();try{
  await open(t,env);const before=[...env.rows];await env.submit({kind:'plates',plates:'10, not-a-plate'});assert.deepEqual([...env.rows],before);assert.deepEqual(env.writes,[]);assert.ok(env.elements.get('toast').textContent);
  await env.submit({kind:'stack',plates:'2.5, 5, 10',step:'0'});assert.deepEqual([...env.rows],before);assert.deepEqual(env.writes,[]);
  env.failSave();await env.submit({step:'10'});assert.deepEqual([...env.rows],before);await env.click('load-setup',{index:'0'});assert.equal(env.form.elements.step.value,'5','failed save rolls back in-memory settings too');
 }finally{env.restore()}
});

test('completed workouts cannot open editable load setup',async t=>{
 const locked=environment({locked:true});try{await open(t,locked);assert.equal(locked.form,undefined);assert.match(locked.elements.get('toast').textContent,/Unlock/);assert.deepEqual(locked.writes,[])}finally{locked.restore()}
});

test('a setup opened for a different day cannot save settings',async t=>{
 const env=environment();try{
  await open(t,env);const form=env.form,before=[...env.rows];await env.click('open-date',{date:otherDate});await env.submit({step:'10'},form);assert.deepEqual([...env.rows],before);assert.deepEqual(env.writes,[]);assert.match(env.elements.get('toast').textContent,/changed|no longer open/);
 }finally{env.restore()}
});
