import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultState,makeExercise,CATALOG} from '../core.mjs';
import {CloudSync} from '../cloud.mjs?v=8.1.1';

function environment(source,{scope='guest',confirmImport=true}={}){
 const names=['document','localStorage','sessionStorage','window','navigator','location','history','confirm','setInterval','setTimeout','fetch'];
 const previous=new Map(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
 const rows=new Map([['MGT_BETA_V8:'+scope,JSON.stringify(source)]]),elements=new Map(),listeners=new Map(),prompts=[];
 if(scope!=='guest')rows.set('MGT_BETA_AUTH',JSON.stringify({access_token:'synthetic',refresh_token:'synthetic',expires_at:Date.now()/1000+3600,user:{id:scope}}));
 class Element{
  constructor(id){Object.assign(this,{id,innerHTML:'',textContent:'',value:'',open:false,dataset:{},elements:{},classList:{add(){},remove(){}}})}
  addEventListener(){}showModal(){this.open=true}close(){this.open=false}focus(){}
 }
 globalThis.document={getElementById:id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)},activeElement:{tagName:'BODY'},hidden:false,addEventListener:(name,fn)=>listeners.set(name,[...(listeners.get(name)||[]),fn]),querySelector:()=>null,querySelectorAll:()=>[]};
 globalThis.localStorage={getItem:key=>rows.get(key)??null,setItem:(key,value)=>rows.set(key,String(value)),removeItem:key=>rows.delete(key)};
 globalThis.sessionStorage={getItem:()=>null,setItem(){},removeItem(){}};
 globalThis.window={addEventListener(){},scrollTo(){}};
 Object.defineProperty(globalThis,'navigator',{value:{onLine:true,vibrate(){}},configurable:true});
 globalThis.location={origin:'https://synthetic.example.invalid',pathname:'/',href:'https://synthetic.example.invalid/',hash:'',search:''};
 globalThis.history={replaceState(){}};
 globalThis.confirm=message=>{prompts.push(message);return confirmImport};
 globalThis.setInterval=()=>0;globalThis.setTimeout=()=>0;
 globalThis.fetch=async path=>{assert.ok(['./config.json','./media-manifest.json'].includes(path),'No external calls in the account workflow test');return {ok:true,json:async()=>path==='./config.json'?{}:{exercises:[],assets:[],lookup:{}}}};
 return {rows,prompts,elements,async click(action){const button={dataset:{action},disabled:false};for(const listener of listeners.get('click')||[])listener({target:{closest:()=>button},preventDefault(){}});await new Promise(resolve=>setImmediate(resolve))},restore(){for(const [name,descriptor]of previous)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name]}};
}

function completedWorkspace(ownerId){
 const state=defaultState();state.ownerId=ownerId;state.nutrition.setupPromptSeen=true;
 const exercise=makeExercise(CATALOG[0]);Object.assign(exercise.sets[0],{w:0,r:12,rir:0,done:true});
 state.logs['2026-10-01']={id:'2026-10-01',date:'2026-10-01',kind:'strength',status:'completed',title:'Synthetic preserved workout',gymId:'crunch',exercises:[exercise]};
 state.meals['2026-10-01']={id:'2026-10-01',date:'2026-10-01',items:[{id:'private-synthetic-meal',eaten:true}]};
 return state;
}

async function signInToB(t,env){
 // Exercise the real app event handler and account transition without contacting Auth.
 t.mock.method(CloudSync.prototype,'restoreSession',async()=>{});
 t.mock.method(CloudSync.prototype,'signIn',async function(){const user={id:'account-b'};this.saveSession({access_token:'synthetic-b',refresh_token:'synthetic-b',expires_at:Date.now()/1000+3600,user});await this.onAccount(user);return user});
 await import('../app.mjs?account-workflow='+encodeURIComponent(t.name));
 assert.doesNotMatch(env.elements.get('app').innerHTML,/could not open/);
 const source=env.rows.get('MGT_BETA_V8:'+(JSON.parse(env.rows.get('MGT_BETA_AUTH')||'null')?.user?.id||'guest'));
 document.getElementById('cloudForm').elements={email:{value:'synthetic@example.invalid'},password:{value:'synthetic-password'}};
 await env.click('signin');
 assert.equal(env.elements.get('toast')?.textContent||'','');
 return source;
}

test('switching account A to empty B never offers or merges A workouts as guest records',async t=>{
 const original=completedWorkspace('account-a'),env=environment(original,{scope:'account-a'});
 try{
  const before=await signInToB(t,env);
  const a=JSON.parse(env.rows.get('MGT_BETA_V8:account-a')),b=JSON.parse(env.rows.get('MGT_BETA_V8:account-b'));
  assert.deepEqual(env.prompts,[]);assert.deepEqual(b.logs,{});assert.deepEqual(b.meals,{});assert.equal(b.ownerId,'account-b');
  assert.equal(env.rows.get('MGT_BETA_V8:account-a'),before);assert.deepEqual(a.logs,original.logs);assert.deepEqual(a.meals,original.meals);
  const recovery=JSON.parse(env.rows.get('MGT_BETA_SNAPSHOTS:account-a'))[0].state;assert.deepEqual(recovery.logs,original.logs);assert.deepEqual(recovery.meals,original.meals);
 }finally{env.restore()}
});

for(const accepted of [true,false])test('genuine guest workouts import only when confirmation is '+accepted,async t=>{
 const original=completedWorkspace(null),env=environment(original,{confirmImport:accepted});
 try{
  const before=await signInToB(t,env),b=JSON.parse(env.rows.get('MGT_BETA_V8:account-b'));
  assert.equal(env.prompts.length,1);assert.match(env.prompts[0],/guest workouts/);assert.equal(b.ownerId,'account-b');
  assert.deepEqual(b.logs,accepted?original.logs:{});assert.deepEqual(b.meals,accepted?original.meals:{});
  assert.equal(env.rows.get('MGT_BETA_V8:guest'),before);
  const recovery=JSON.parse(env.rows.get('MGT_BETA_SNAPSHOTS:guest'))[0].state;assert.deepEqual(recovery.logs,original.logs);
 }finally{env.restore()}
});
