import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';
import {trainingStreak} from '../motivation.mjs';

const date='2027-01-04';
function environment({name='Band Biceps Curl',planned=false,count=2,inventory=['Resistance Bands','Wall','Stable Chair']}={}){
 const names=['document','localStorage','sessionStorage','window','navigator','location','history','confirm','setInterval','setTimeout','clearTimeout','fetch','FormData'];
 const previous=new Map(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
 const state=C.defaultState(),definition=C.exerciseFor(name);assert.ok(definition,name);
 state.profile={...state.profile,age:70,safetyNoticeVersion:1};state.nutrition.setupPromptSeen=true;state.gymSchedules=[];
 state.gyms[0].inventory=inventory;state.training={...state.training,mode:planned?'automatic':'original',defaultGym:'crunch',startDate:date,updatedAt:date+'T12:00:00Z'};
 const exercise=C.makeExercise(definition,{count}),day={id:date,date,title:'Accessible practice',kind:'strength',gymId:'crunch',status:'in-progress',exercises:[exercise]};
 if(planned)state.plan[date]=C.packPlanDay(day);else state.logs[date]=day;
 state.logs['2026-12-01']={id:'2026-12-01',date:'2026-12-01',title:'Preserved session',status:'completed',kind:'strength',gymId:'crunch',unknown:{retain:0},exercises:[{...C.makeExercise(C.exerciseFor('Dumbbell Curl'),{count:1}),sets:[{id:'old-set',role:'working',w:25,r:8,rir:2,done:true,unknown:false}]}]};
 state.meals={[date]:{id:date,items:[],unknown:{retain:0}}};state.pantry=[{id:'retained-stock',name:'Saved ingredient',qty:2,unit:'g',unknown:false}];
 const legacy=C.defaultState(),legacyRaw=JSON.stringify(legacy);state.legacySnapshots=[{id:String(C.hash(legacyRaw)),data:legacy},{id:'retained-history',data:{unknown:{retain:0}}}];
 const rows=new Map([['MGT_BETA_V8:guest',JSON.stringify(state)],['MGT28v6',legacyRaw]]),elements=new Map(),listeners=new Map(),requests=[];
 class Element{constructor(id){Object.assign(this,{id,innerHTML:'',textContent:'',value:'',open:false,hidden:false,complete:true,naturalWidth:1024,dataset:{},events:new Map(),style:{},classList:{add(){},remove(){},toggle(){},contains(){return false}}})}addEventListener(name,fn){this.events.set(name,fn)}showModal(){this.open=true}close(){this.open=false}focus(){}setAttribute(key,value){this[key]=value}removeAttribute(key){delete this[key]}}
 const element=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)};
 globalThis.document={documentElement:{dataset:{preview:'local'}},activeElement:{tagName:'BODY'},hidden:false,getElementById:element,addEventListener:(name,fn)=>listeners.set(name,[...(listeners.get(name)||[]),fn]),querySelector:s=>s==='dialog[open]'&&element('modal').open?element('modal'):null,querySelectorAll:()=>[]};
 globalThis.localStorage={getItem:key=>rows.get(key)??null,setItem:(key,value)=>rows.set(key,String(value)),removeItem:key=>rows.delete(key)};
 globalThis.sessionStorage={getItem:()=>null,setItem(){},removeItem(){}};
 globalThis.window={addEventListener(){},scrollTo(){},requestAnimationFrame:()=>0,cancelAnimationFrame(){},matchMedia:()=>({matches:true,addEventListener(){}})};
 Object.defineProperty(globalThis,'navigator',{value:{onLine:true,vibrate(){}},configurable:true});globalThis.location={origin:'https://synthetic.example.invalid',pathname:'/',search:'',hash:'',href:'https://synthetic.example.invalid/'};globalThis.history={replaceState(){}};globalThis.confirm=()=>true;globalThis.setInterval=()=>0;globalThis.setTimeout=()=>0;globalThis.clearTimeout=()=>{};
 globalThis.fetch=async path=>{requests.push(path);assert.ok(['./config.json','./media-manifest.json'].includes(path),'Exercise choices must not call AI or backend services');return {ok:true,json:async()=>path==='./config.json'?{}:{exercises:[],assets:[],lookup:{}}}};
 globalThis.FormData=class{constructor(form){this.pairs=Object.entries(form.values||{}).flatMap(([key,value])=>Array.isArray(value)?value.map(item=>[key,String(item)]):[[key,String(value)]])}getAll(key){return this.pairs.filter(item=>item[0]===key).map(item=>item[1])}has(key){return this.pairs.some(item=>item[0]===key)}[Symbol.iterator](){return this.pairs[Symbol.iterator]()}};
 const settle=()=>new Promise(resolve=>setImmediate(resolve));
 const event=async(name,target)=>{for(const fn of listeners.get(name)||[])fn({target,preventDefault(){}});await settle()};
 return {rows,requests,element,legacyRaw,get html(){return element('app').innerHTML},get modal(){return element('modalBody').innerHTML},get state(){return JSON.parse(rows.get('MGT_BETA_V8:guest'))},async click(action,data={}){await event('click',{closest:()=>({dataset:{action,...data},disabled:false})})},async edit(key,value,{checked=false,method='change',set=0}={}){await event(method,{dataset:{set:`0:${set}:${key}`},value:String(value),checked,type:key==='done'?'checkbox':'text',isConnected:true,closest:()=>null})},async filter(id,value){element(id).value=value;await event('change',{id,value,dataset:{},isConnected:true,closest:()=>null})},async submit(id,values){await event('submit',{id,values,dataset:{}})},restore(){for(const [name,descriptor]of previous)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name]}};
}
async function start(env,key){await import('../app.mjs?accessible-ui='+key);assert.doesNotMatch(env.html,/The app could not open/)}

function preservesOtherRecords(before,after){
 for(const key of ['pantry','meals','gyms','recipes','legacySnapshots'])assert.deepEqual(after[key],before[key],key);
 assert.deepEqual(after.logs['2026-12-01'],before.logs['2026-12-01']);
}

test('band cards record a named resistance setting without numeric load controls or automatic weight suggestions',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment();try{
  await start(env,'band-card');const before=[...env.rows];assert.match(env.html,/Band setting/);assert.match(env.html,/data-set="0:0:band"/);assert.match(env.html,/brand, level and setup/);assert.doesNotMatch(env.html,/data-set="0:0:w"|data-action="load-setup"|data-action="apply-loads"/);
  await env.click('sets',{index:'0'});assert.match(env.modal,/no load percentages or weight increases are calculated/);assert.doesNotMatch(env.modal,/name="increment"|name="backoffPercent"|name="dropPercent"/);await env.click('close-modal');assert.deepEqual([...env.rows],before);
 }finally{env.restore()}
});

test('checking a band set requires its setting and preserves real checked reps without invented pounds',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment();try{
  await start(env,'band-completion');const before=env.state;
  await env.edit('r',12);await env.edit('rir',3);const entered=env.state;
  await env.edit('done','',{checked:true});assert.match(env.element('toast').textContent,/band brand, level and setup/);assert.deepEqual(env.state,entered);
  const band='Example Brand light · under feet';await env.edit('band',band,{method:'input'});await env.edit('done','',{checked:true});
  const set=env.state.logs[date].exercises[0].sets[0];assert.equal(set.band,band);assert.equal(set.w,0,'Zero means no added external load, not a measured band tension');assert.equal(set.r,12);assert.equal(set.rir,3);assert.equal(set.done,true);assert.equal(C.completedSets(env.state.logs[date].exercises[0]).length,1);preservesOtherRecords(before,env.state);assert.equal(env.rows.get('MGT28v6'),env.legacyRaw);
  assert.doesNotMatch(env.html,/Next set 2: .*lb|0 lb|0 kg/);assert.deepEqual(env.requests,['./config.json','./media-manifest.json']);
 }finally{env.restore()}
});

test('bodyweight holds keep seconds, use zero added load only on checking and count as genuine training when locked',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment({name:'Wall Plank',count:1});try{
  await start(env,'bodyweight-hold');const before=env.state,total=trainingStreak(before,date).total;
  assert.match(env.html,/<th>Seconds<\/th>/);assert.match(env.html,/Target 10-20 seconds/);assert.doesNotMatch(env.html,/data-set="0:0:w"|data-action="load-setup"|data-action="apply-loads"/);
  await env.edit('r',15);assert.equal(env.state.logs[date].exercises[0].sets[0].w,'');await env.edit('done','',{checked:true});assert.equal(env.state.logs[date].exercises[0].sets[0].w,0);assert.equal(env.state.logs[date].exercises[0].sets[0].r,15);await env.click('stop-timer');await env.click('complete');
  assert.equal(env.state.logs[date].status,'completed');assert.equal(trainingStreak(env.state,date).total,total+1);preservesOtherRecords(before,env.state);
 }finally{env.restore()}
});

test('stale numeric load actions cannot create an empty log for a planned band movement',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment({planned:true});try{
  await start(env,'stale-load-controls');const before=[...env.rows];assert.equal(Object.hasOwn(env.state.logs,date),false);
  for(const action of ['apply-loads','load-setup']){await env.click(action,{index:'0'});assert.match(env.element('toast').textContent,/manual resistance|rather than calculated weights/);assert.deepEqual([...env.rows],before);assert.equal(Object.hasOwn(env.state.logs,date),false)}
 }finally{env.restore()}
});

test('new library and picker categories are read-only and anchored movements remain unavailable without their gear',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment({inventory:['Resistance Bands','Wall','Stable Chair']});try{
  await start(env,'movement-filters');const before=[...env.rows];await env.click('view',{view:'library'});assert.match(env.html,/id="libraryCategory"/);
  await env.filter('libraryCategory','bands');assert.match(env.html,/<h3>Band Biceps Curl<\/h3>/);assert.doesNotMatch(env.html,/<h3>Wall Push-Up<\/h3>/);
  await env.filter('libraryCategory','supported');assert.match(env.html,/<h3>Wall Plank<\/h3>/);assert.match(env.html,/<h3>Chair Sit-to-Stand<\/h3>/);assert.doesNotMatch(env.html,/<h3>Bird Dog<\/h3>/);
  await env.filter('libraryCategory','preparation');assert.match(env.html,/<h3>Supported March<\/h3>/);assert.doesNotMatch(env.html,/<h3>Band Biceps Curl<\/h3>/);assert.deepEqual([...env.rows],before);
  await env.click('view',{view:'today'});await env.click('picker');await env.filter('pickerCategory','bands');const list=env.element('pickerList').innerHTML;assert.match(list,/Band Biceps Curl/);assert.doesNotMatch(list,/Standing Band Row|Band Pallof Press|Band Triceps Pressdown/);assert.deepEqual([...env.rows],before);
 }finally{env.restore()}
});

test('band labels remain escaped and intact after the profile switches measurement systems',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment();try{
  await start(env,'band-units');const band='<img src=x onerror=alert(1)> Brand red · printed 5 kg';await env.edit('band',band);await env.edit('r',10);await env.edit('done','',{checked:true});const before=env.state;
  await env.click('view',{view:'settings'});await env.submit('profileForm',{measurementSystem:'metric'});assert.equal(env.state.profile.units,'kg');const set=env.state.logs[date].exercises[0].sets[0];assert.equal(set.band,band);assert.equal(set.w,0);assert.equal(set.r,10);assert.equal(set.done,true);
  await env.click('view',{view:'today'});assert.match(env.html,/&lt;img src=x/);assert.doesNotMatch(env.html,/<img src=x|0 kg|0 lb/);assert.deepEqual(env.state.pantry,before.pantry);assert.deepEqual(env.state.meals,before.meals);assert.equal(env.rows.get('MGT28v6'),env.legacyRaw);
 }finally{env.restore()}
});
