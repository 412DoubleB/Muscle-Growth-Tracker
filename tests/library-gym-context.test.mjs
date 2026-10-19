import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import * as C from '../core.mjs';

const exerciseId='incline-dumbbell-press',date='2026-11-02';
function environment(){
 const names=['document','localStorage','sessionStorage','window','navigator','location','history','confirm','setInterval','setTimeout','fetch'];
 const previous=new Map(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
 const source=C.defaultState();source.nutrition.setupPromptSeen=true;source.training.defaultGym='scheduled';source.gymSchedules=[];
 source.gyms=[{id:'scheduled',name:'Scheduled synthetic gym',inventory:[]},{id:'library',name:'Library synthetic gym',inventory:['Dumbbells','Adjustable Bench']},{id:'workout',name:'Workout synthetic gym',inventory:['Dumbbells']}];
 const exercise=C.makeExercise(C.exerciseFor(exerciseId));Object.assign(exercise.sets[0],{w:0,r:12,rir:0,done:true});
 source.logs[date]={id:date,date,title:'Synthetic entered session',kind:'strength',status:'completed',gymId:'workout',exercises:[exercise]};
 source.legacySnapshots=[{id:'synthetic-source',data:{preserve:'Original synthetic backup'}}];
 const rows=new Map([['MGT_BETA_V8:guest',JSON.stringify(source)],['MGT28v6','{"synthetic":"preserved original"}']]),elements=new Map(),listeners=new Map(),writes=[];
 // A marker is enough to preserve legacy keys; the source was already migrated.
 source.legacySnapshots.push({id:String(C.hash(JSON.stringify({synthetic:'preserved original'}))),data:{synthetic:'preserved original'}});rows.set('MGT_BETA_V8:guest',JSON.stringify(source));
 class Element{
  constructor(id){Object.assign(this,{id,innerHTML:'',textContent:'',value:'',open:false,dataset:{},elements:{},classList:{add(){},remove(){}}})}
  addEventListener(){}showModal(){this.open=true}close(){this.open=false}focus(){}
 }
 globalThis.document={documentElement:{dataset:{preview:'local'}},getElementById:id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)},activeElement:{tagName:'BODY'},hidden:false,addEventListener:(name,fn)=>listeners.set(name,[...(listeners.get(name)||[]),fn]),querySelector:selector=>selector==='dialog[open]'&&elements.get('modal')?.open?elements.get('modal'):null,querySelectorAll:()=>[]};
 globalThis.localStorage={getItem:key=>rows.get(key)??null,setItem:(key,value)=>{writes.push(key);rows.set(key,String(value))},removeItem(){assert.fail('Browsing must not remove stored records')}};
 globalThis.sessionStorage={getItem:()=>null,setItem(){},removeItem(){}};globalThis.window={addEventListener(){},scrollTo(){}};
 Object.defineProperty(globalThis,'navigator',{value:{onLine:true,vibrate(){}},configurable:true});
 globalThis.location={origin:'https://synthetic.example.invalid',pathname:'/',href:'https://synthetic.example.invalid/',hash:'',search:''};globalThis.history={replaceState(){}};globalThis.confirm=()=>assert.fail('Read-only browsing does not need confirmation');globalThis.setInterval=()=>0;globalThis.setTimeout=()=>0;
 globalThis.fetch=async request=>{assert.ok(['./config.json','./media-manifest.json'].includes(request),'Library test makes no backend calls');return {ok:true,json:async()=>request==='./config.json'?{}:JSON.parse(await fs.readFile(new URL('../media-manifest.json',import.meta.url),'utf8'))}};
 const dispatch=async(name,event)=>{for(const listener of listeners.get(name)||[])listener(event);await new Promise(resolve=>setImmediate(resolve))};
 return {rows,elements,writes,async click(action,data={}){const button={dataset:{action,...data},disabled:false};await dispatch('click',{target:{closest:()=>button},preventDefault(){}})},async filter(gym){await dispatch('change',{target:{id:'libraryGym',value:gym,dataset:{}}})},restore(){for(const [name,descriptor]of previous)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name]}};
}
function card(html){const match=html.match(new RegExp('<button class="card libItem"[^>]*data-exercise="'+exerciseId+'"[\\s\\S]*?</button>'));assert.ok(match,'The compatible exercise appears in the library');return match[0]}
const context=html=>html.match(/data-guide-gym="([^"]*)"/)?.[1];
const media=html=>html.match(/<div class="guideMedia">[\s\S]*?<\/div>/)?.[0];

test('selected-library gym reaches cards and guides without borrowing the scheduled gym',async()=>{
 const env=environment();
 try{
  await import('../app.mjs?library-context=selected');const before=[...env.rows],writes=env.writes.length;
  await env.click('view',{view:'library'});await env.filter('library');const item=card(env.elements.get('app').innerHTML);
  assert.equal(context(item),'library');assert.match(item,/Matches your saved Library synthetic gym inventory/);
  await env.click('guide',{exercise:exerciseId,guideGym:context(item)});const guide=env.elements.get('modalBody').innerHTML;
  assert.match(guide,/Matches your saved Library synthetic gym inventory/);assert.doesNotMatch(guide,/Scheduled synthetic gym|Workout synthetic gym|Missing from/);
  assert.match(guide,/data-action="avoid"[^>]*data-guide-gym="library"/);assert.ok(media(guide));assert.deepEqual([...env.rows],before);assert.equal(env.writes.length,writes);
 }finally{env.restore()}
});

test('Every gym shows requirements without inventing an inventory check and retains exact image bindings',async()=>{
 const env=environment();
 try{
  await import('../app.mjs?library-context=all');const before=[...env.rows],writes=env.writes.length;
  await env.click('view',{view:'library'});await env.filter('library');await env.click('guide',{exercise:exerciseId,guideGym:context(card(env.elements.get('app').innerHTML))});const selectedMedia=media(env.elements.get('modalBody').innerHTML);
  await env.click('close-modal');await env.filter('All');await env.click('more-library');await env.click('more-library');const item=card(env.elements.get('app').innerHTML);
  assert.equal(context(item),'All');assert.doesNotMatch(item,/Matches your saved|Missing from/);
  await env.click('guide',{exercise:exerciseId,guideGym:context(item)});const guide=env.elements.get('modalBody').innerHTML;
  assert.match(guide,/Every gym · Equipment requirements shown without checking a saved gym inventory/);assert.match(guide,/Dumbbells \+ Adjustable Bench/);
  assert.doesNotMatch(guide,/Matches your saved|Missing from|Scheduled synthetic gym|Workout synthetic gym|Library synthetic gym/);assert.equal(media(guide),selectedMedia);
  assert.match(guide,/data-action="avoid"[^>]*data-guide-gym="All"/);assert.deepEqual([...env.rows],before);assert.equal(env.writes.length,writes);
 }finally{env.restore()}
});

test('workout guides retain their recorded gym after a different gym was selected in the library',async()=>{
 const env=environment();
 try{
  await import('../app.mjs?library-context=workout');const before=[...env.rows],writes=env.writes.length;
  await env.click('view',{view:'library'});await env.filter('library');await env.click('open-date',{date});
  const workout=env.elements.get('app').innerHTML,button=workout.match(new RegExp('<button class="exerciseTitle"[^>]*data-exercise="'+exerciseId+'"[^>]*>'))?.[0];
  assert.ok(button);assert.equal(context(button),'workout');await env.click('guide',{exercise:exerciseId,guideGym:context(button)});const guide=env.elements.get('modalBody').innerHTML;
  assert.match(guide,/Missing from Workout synthetic gym inventory: Adjustable Bench/);assert.doesNotMatch(guide,/Matches your saved Library synthetic gym|Scheduled synthetic gym/);
  assert.deepEqual([...env.rows],before);assert.equal(env.writes.length,writes);assert.equal(JSON.parse(env.rows.get('MGT_BETA_V8:guest')).logs[date].exercises[0].sets[0].w,0);
 }finally{env.restore()}
});
