import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultState} from '../core.mjs';

function environment(conflicts){
 const names=['document','localStorage','sessionStorage','window','navigator','location','history','confirm','setInterval','setTimeout','fetch'];
 const previous=new Map(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
 const state=defaultState();state.nutrition.setupPromptSeen=true;state.conflicts=structuredClone(conflicts);
 const rows=new Map([['MGT_BETA_V8:guest',JSON.stringify(state)]]),writes=[],elements=new Map(),listeners=new Map();
 class Element{
  constructor(id){Object.assign(this,{id,innerHTML:'',textContent:'',value:'',open:false,dataset:{},elements:{},classList:{add(){},remove(){}}})}
  addEventListener(){}showModal(){this.open=true}close(){this.open=false}focus(){}
 }
 globalThis.document={documentElement:{dataset:{preview:'local'}},getElementById:id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)},activeElement:{tagName:'BODY'},hidden:false,addEventListener:(name,fn)=>listeners.set(name,[...(listeners.get(name)||[]),fn]),querySelector:()=>null,querySelectorAll:()=>[]};
 globalThis.localStorage={getItem:key=>rows.get(key)??null,setItem:(key,value)=>{writes.push(key);rows.set(key,String(value))},removeItem:key=>{writes.push(key);rows.delete(key)}};
 globalThis.sessionStorage={getItem:()=>null,setItem(){},removeItem(){}};
 globalThis.window={addEventListener(){},scrollTo(){}};
 Object.defineProperty(globalThis,'navigator',{value:{onLine:true,vibrate(){}},configurable:true});
 globalThis.location={origin:'https://synthetic.example.invalid',pathname:'/',href:'https://synthetic.example.invalid/',hash:'',search:''};
 globalThis.history={replaceState(){}};globalThis.confirm=()=>false;globalThis.setInterval=()=>0;globalThis.setTimeout=()=>0;
 globalThis.fetch=async request=>{assert.ok(['./config.json','./media-manifest.json'].includes(request),'Conflict review must not contact a backend');return {ok:true,json:async()=>request==='./config.json'?{}:{exercises:[],assets:[],lookup:{}}}};
 return {rows,writes,elements,async click(action,data={}){const button={dataset:{action,...data},disabled:false};for(const listener of listeners.get('click')||[])listener({target:{closest:()=>button},preventDefault(){}});await new Promise(resolve=>setImmediate(resolve))},restore(){for(const [name,descriptor]of previous)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name]}};
}

const stamp='2026-10-19T12:00:00.000Z',later='2026-10-19T13:00:00.000Z';
const conflict=(id,collection,local,remote)=>({id,collection,key:local.id||collection,local,remote,reason:'Both devices edited this item. Choose the version to keep.',createdAt:stamp});

test('review classifies 108 saved conflicts and displays genuine differences first without changing records',async()=>{
 const matching=Array.from({length:106},(_,index)=>{
  const id='synthetic-recipe-'+index,local={id,name:'Synthetic recipe '+index,ingredients:[{qty:0,name:'Synthetic ingredient'}],updatedAt:stamp};
  const remote={updatedAt:later,ingredients:[{name:'Synthetic ingredient',qty:0}],name:local.name,id};
  return conflict('matching-'+index,'recipes',local,remote);
 });
 const different=[conflict('nutrition-calories','nutrition',{calories:2000,updatedAt:stamp},{calories:2200,updatedAt:later}),conflict('nutrition-protein','nutrition',{protein:150,updatedAt:stamp},{protein:180,updatedAt:later})];
 const conflicts=[...matching.slice(0,60),different[0],...matching.slice(60),different[1]],env=environment(conflicts);
 try{
  await import('../app.mjs?conflict-review=108');
  assert.doesNotMatch(env.elements.get('app').innerHTML,/could not open/);
  const before=[...env.rows];env.writes.length=0;
  await env.click('conflicts');
  const html=env.elements.get('modalBody').innerHTML;
  assert.match(html,/2 differing items · 106 matching items/);
  assert.equal((html.match(/Saved content matches\./g)||[]).length,106);
  assert.equal((html.match(/Both devices edited this item/g)||[]).length,2);
  assert.ok(html.indexOf('data-id="nutrition-calories"')<html.indexOf('data-id="nutrition-protein"'));
  assert.ok(html.indexOf('data-id="nutrition-protein"')<html.indexOf('data-id="matching-0"'));
  assert.equal((html.match(/data-action="resolve-conflict"/g)||[]).length,216);
  assert.deepEqual(env.writes,[]);assert.deepEqual([...env.rows],before);
  assert.deepEqual(JSON.parse(env.rows.get('MGT_BETA_V8:guest')).conflicts,conflicts);
 }finally{env.restore()}
});

test('review ignores only each record’s own update time and retains nested differences for review',async()=>{
 const item=conflict('nested-time','nutrition',{targets:{protein:180,updatedAt:stamp},updatedAt:stamp},{updatedAt:later,targets:{updatedAt:later,protein:180}}),env=environment([item]);
 try{
  await import('../app.mjs?conflict-review=nested-time');
  const before=[...env.rows];env.writes.length=0;await env.click('conflicts');
  const html=env.elements.get('modalBody').innerHTML;
  assert.match(html,/1 differing item · 0 matching items/);assert.doesNotMatch(html,/Saved content matches\./);
  assert.deepEqual(env.writes,[]);assert.deepEqual([...env.rows],before);
 }finally{env.restore()}
});

test('an explicit version choice still snapshots both copies before resolving that item',async()=>{
 const item=conflict('explicit-choice','nutrition',{calories:2000,updatedAt:stamp},{calories:2200,updatedAt:later}),env=environment([item]);
 try{
  await import('../app.mjs?conflict-review=explicit-choice');await env.click('conflicts');
  assert.equal(env.rows.has('MGT_BETA_SNAPSHOTS:guest'),false);
  await env.click('resolve-conflict',{id:item.id,choice:'remote'});
  assert.equal(env.elements.get('toast')?.textContent||'','');
  const saved=JSON.parse(env.rows.get('MGT_BETA_V8:guest')),snapshots=JSON.parse(env.rows.get('MGT_BETA_SNAPSHOTS:guest'));
  assert.equal(saved.nutrition.calories,2200);assert.deepEqual(saved.conflicts,[]);assert.deepEqual(saved.resolvedConflicts,[item.id]);
  assert.deepEqual(snapshots[0].state.conflicts,[item]);
 }finally{env.restore()}
});
