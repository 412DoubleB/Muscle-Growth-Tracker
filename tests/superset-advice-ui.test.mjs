import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';
import * as S from '../supersets.mjs';

test('superset choices and suggested alternatives update a draft, save intentional overlap and protect recorded partners',async t=>{
 const date='2027-01-04';t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});
 const state=C.defaultState();state.profile.safetyNoticeVersion=1;state.nutrition.setupPromptSeen=true;
 let day={id:date,date,title:'Synthetic pairing',kind:'strength',gymId:'crunch',status:'planned',exercises:['Barbell Bench Press','Dumbbell Bench Press','Hammer Curl','Plank','Hammer Curl','Plank'].map(name=>C.makeExercise(C.exerciseFor(name),{count:2}))};
 day=S.pairExercises(day,4,5,60);day.exercises[5].sets[0].w=0;day.exercises[5].sets[0].ownerNote='retain recorded zero';state.logs[date]=day;state.logs['2027-01-03~copy']={...C.clone(day),date:'2027-01-03',ownerNote:'retained conflict'};
 const legacyRaw=JSON.stringify(C.defaultState()),rows=new Map([['MGT_BETA_V8:guest',JSON.stringify(state)],['MGT28v6',legacyRaw]]),elements=new Map(),listeners=new Map(),requests=[];
 class Element{constructor(id){Object.assign(this,{id,innerHTML:'',textContent:'',value:'',open:false,dataset:{},elements:{},classList:{add(){},remove(){},toggle(){}}})}addEventListener(){}showModal(){this.open=true}close(){this.open=false}focus(){this.focused=true}}
 const element=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)};
 const names=['document','localStorage','sessionStorage','window','navigator','location','history','confirm','setInterval','setTimeout','clearTimeout','fetch','FormData'],previous=new Map(names.map(n=>[n,Object.getOwnPropertyDescriptor(globalThis,n)]));
 globalThis.document={documentElement:{dataset:{preview:'local'}},activeElement:{tagName:'BODY'},hidden:false,getElementById:element,querySelector:()=>null,querySelectorAll:()=>[],addEventListener:(name,fn)=>listeners.set(name,[...(listeners.get(name)||[]),fn])};
 globalThis.localStorage={getItem:k=>rows.get(k)??null,setItem:(k,v)=>rows.set(k,String(v)),removeItem(){assert.fail('No history removal')}};globalThis.sessionStorage={getItem:()=>null,setItem(){},removeItem(){}};
 globalThis.window={addEventListener(){},scrollTo(){},matchMedia:()=>({matches:true,addEventListener(){}})};Object.defineProperty(globalThis,'navigator',{value:{onLine:true},configurable:true});globalThis.location={origin:'https://synthetic.invalid',pathname:'/',search:'',hash:'',href:'https://synthetic.invalid/'};globalThis.history={replaceState(){}};globalThis.confirm=()=>true;globalThis.setTimeout=globalThis.setInterval=()=>0;globalThis.clearTimeout=()=>{};
 globalThis.fetch=async path=>{requests.push(path);assert.ok(['./config.json','./media-manifest.json'].includes(path));return {ok:true,json:async()=>path==='./config.json'?{}:{exercises:[],assets:[],lookup:{}}}};
 globalThis.FormData=class{constructor(form){this.rows=Object.entries(form.values)}[Symbol.iterator](){return this.rows[Symbol.iterator]()}};
 const event=async(name,value)=>{for(const fn of listeners.get(name)||[])fn(value);await new Promise(r=>setImmediate(r))};
 const click=(action,data={})=>event('click',{target:{closest:()=>({dataset:{action,...data}})},preventDefault(){}});
 try{
  await import('../app.mjs?superset-advice-ui');assert.doesNotMatch(element('app').innerHTML,/The app could not open/);await click('supersets');const before=[...rows],html=element('modalBody').innerHTML;
  assert.match(html,/Guidance updates as you choose/);assert.match(html,/id="supersetAdvice" role="status" aria-live="polite"/);assert.match(html,/share a main muscle/);assert.match(html,/<option value="4"[^>]*disabled/);assert.match(html,/<option value="5"[^>]*disabled/);
  const form=element('supersetForm');form.elements={first:{value:'0'},second:{value:'0',focus(){this.focused=true}}};
  await event('change',{target:{name:'second',dataset:{},closest:s=>s==='#supersetForm'?form:null}});assert.match(element('supersetAdvice').innerHTML,/Choose two different exercises/);assert.equal(element('supersetSave').disabled,true);assert.deepEqual([...rows],before);form.elements.second.value='1';
  await event('change',{target:{name:'second',dataset:{},closest:s=>s==='#supersetForm'?form:null}});assert.match(element('supersetAdvice').innerHTML,/share a main muscle/);assert.equal(element('supersetSave').disabled,false);assert.deepEqual([...rows],before);
  await click('superset-alternative',{index:'2'});assert.equal(form.elements.second.value,'2');assert.equal(form.elements.second.focused,true);assert.match(element('supersetAdvice').innerHTML,/Lower main-muscle overlap/);assert.deepEqual([...rows],before);
  await click('superset-alternative',{index:'4'});assert.match(element('toast').textContent,/available unstarted/);assert.deepEqual([...rows],before);
  form.elements.second.value='1';form.values={first:'0',second:'1',restSeconds:'60'};await event('submit',{target:form,preventDefault(){}});
  const saved=JSON.parse(rows.get('MGT_BETA_V8:guest'));assert.equal(saved.logs[date].exercises[0].supersetId,saved.logs[date].exercises[1].supersetId);assert.deepEqual(saved.logs[date].exercises.map(e=>e.sets),day.exercises.map(e=>e.sets));assert.deepEqual(saved.logs['2027-01-03~copy'],state.logs['2027-01-03~copy']);assert.equal(element('modal').open,false);assert.match(element('toast').textContent,/60 seconds between sets/);assert.equal(rows.get('MGT28v6'),legacyRaw);assert.deepEqual(requests,['./config.json','./media-manifest.json']);
 }finally{for(const [name,descriptor]of previous)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name]}
});
