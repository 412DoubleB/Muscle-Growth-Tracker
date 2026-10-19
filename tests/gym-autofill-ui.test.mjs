import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';
import {GYM_DIRECTORY,buildGymAutofillPreview} from '../gyms.mjs';

const stamp='2026-11-02T12:00:00.000Z',published=GYM_DIRECTORY[0];
const decode=text=>String(text||'').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const attributes=text=>Object.fromEntries([...text.matchAll(/([^\s=]+)(?:="([^"]*)"|'([^']*)'|([^\s"'=<>`]+))?/g)].map(match=>[match[1],decode(match[2]??match[3]??match[4]??'')]));
function gym({exact=false,source=false}={}){
 const value={id:'synthetic-gym',name:exact?published.name:'Synthetic training room',location:exact?published.city:'Synthetic City',address:exact?published.address:'99 Synthetic Street',gymType:'commercial',inventory:['Rope Attachment','Owner-entered apparatus'],dbMax:80,increment:2.5,notes:'Keep my exact synthetic notes',equipmentConfirmedAt:stamp,unknownPreference:{preserve:0}};
 if(source)value.sourceInfo=buildGymAutofillPreview(value,{query:{name:value.name,location:value.location,address:value.address},gymType:'commercial',research:published,allowedEquipment:C.EQUIPMENT}).sourceInfo;
 return value;
}
function environment(savedGym){
 const names=['document','localStorage','sessionStorage','window','navigator','location','history','confirm','setInterval','setTimeout','fetch','FormData'];
 const previous=new Map(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)])),elements=new Map(),listeners=new Map(),writes=[],requests=[];
 const state=C.defaultState();state.nutrition.setupPromptSeen=true;state.gyms=[C.clone(savedGym)];state.gymSchedules=[];state.training.defaultGym=savedGym.id;
 state.logs['2026-11-02']={id:'2026-11-02',date:'2026-11-02',title:'Synthetic retained workout',kind:'rest',status:'completed',gymId:savedGym.id,exercises:[]};
 const rows=new Map([['MGT_BETA_V8:guest',JSON.stringify(state)]]);
 class Element{
  constructor(id){Object.assign(this,{id,textContent:'',value:'',open:false,dataset:{},classList:{add(){},remove(){}},listeners:{},_html:''})}
  get innerHTML(){return this._html}
  set innerHTML(value){this._html=String(value);if(this.id==='modalBody')parseGymForm(this._html);if(this.id==='gymLookupResults'){elements.delete('usePublishedDbMax');const input=this._html.match(/<input\b([^>]*\bid="usePublishedDbMax"[^>]*)>/);if(input){const attrs=attributes(input[1]),control=new Element('usePublishedDbMax');control.type='checkbox';control.checked=Object.hasOwn(attrs,'checked');elements.set(control.id,control)}}}
  addEventListener(name,fn){this.listeners[name]=fn}showModal(){this.open=true}close(){this.open=false}focus(){}
 }
 function parseGymForm(html){
  const match=html.match(/<form\b([^>]*\bid="gymForm"[^>]*)>([\s\S]*?)<\/form>/);
  if(!match){elements.delete('gymForm');return}
  const attrs=attributes(match[1]),form=new Element('gymForm');form.dataset={id:attrs['data-id']||''};form.elements={};form.controls=[];form.evidence=[];
  const add=(attrs,value)=>{const control=new Element(attrs.id||'');Object.assign(control,{name:attrs.name||'',type:attrs.type||'text',value:value??attrs.value??'',checked:Object.hasOwn(attrs,'checked'),disabled:Object.hasOwn(attrs,'disabled'),closest:selector=>selector==='#gymForm'?form:null});form.controls.push(control);if(control.name!=='equipment')form.elements[control.name]=control;return control};
  for(const input of match[2].matchAll(/<input\b([^>]*)>/g))add(attributes(input[1]));
  for(const select of match[2].matchAll(/<select\b([^>]*)>([\s\S]*?)<\/select>/g)){const options=[...select[2].matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option>/g)].map(item=>attributes(item[1]));const selected=options.find(option=>Object.hasOwn(option,'selected'))||options[0];add({...attributes(select[1]),type:'select-one'},selected?.value||'')}
  for(const textarea of match[2].matchAll(/<textarea\b([^>]*)>([\s\S]*?)<\/textarea>/g))add({...attributes(textarea[1]),type:'textarea'},decode(textarea[2]));
  for(const span of match[2].matchAll(/<span\b([^>]*\bdata-equipment-evidence="[^"]*"[^>]*)>/g)){const element=new Element(''),attrs=attributes(span[1]);element.dataset.equipmentEvidence=attrs['data-equipment-evidence'];form.evidence.push(element)}
  elements.set('gymForm',form);elements.set('gymLookupResults',new Element('gymLookupResults'));elements.delete('usePublishedDbMax');
 }
 const element=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)};
 const emit=async(name,target)=>{for(const listener of listeners.get(name)||[])listener({target,preventDefault(){}});await new Promise(resolve=>setImmediate(resolve))};
 globalThis.document={documentElement:{dataset:{preview:'local'}},getElementById:id=>['gymForm','usePublishedDbMax'].includes(id)?elements.get(id)||null:element(id),activeElement:{tagName:'BODY'},hidden:false,addEventListener:(name,fn)=>listeners.set(name,[...(listeners.get(name)||[]),fn]),querySelector:selector=>selector==='dialog[open]'&&element('modal').open?element('modal'):null,querySelectorAll:selector=>selector==='#gymForm [name=equipment]'?(elements.get('gymForm')?.controls||[]).filter(control=>control.name==='equipment'):selector==='#gymForm [data-equipment-evidence]'?elements.get('gymForm')?.evidence||[]:[]};
 globalThis.localStorage={getItem:key=>rows.get(key)??null,setItem:(key,value)=>{writes.push(key);rows.set(key,String(value))},removeItem(){assert.fail('Gym drafting must not remove stored records')}};
 globalThis.sessionStorage={getItem:()=>null,setItem(){},removeItem(){}};globalThis.window={addEventListener(){},scrollTo(){}};
 Object.defineProperty(globalThis,'navigator',{value:{onLine:true,vibrate(){}},configurable:true});globalThis.location={origin:'https://synthetic.example.invalid',pathname:'/',href:'https://synthetic.example.invalid/',hash:'',search:''};
 globalThis.history={replaceState(){}};globalThis.confirm=()=>true;globalThis.setInterval=()=>0;globalThis.setTimeout=()=>0;
 globalThis.fetch=async request=>{requests.push(request);assert.ok(['./config.json','./media-manifest.json'].includes(request),'No real account or AI research requests in this test');return {ok:true,json:async()=>request==='./config.json'?{gymResearchReady:false}:{exercises:[],assets:[],lookup:{}}}};
 globalThis.FormData=class{constructor(form){assert.ok(form.controls,'Submit the rendered form controls');this.pairs=form.controls.filter(control=>control.name&&!control.disabled&&(control.type!=='checkbox'||control.checked)).map(control=>[control.name,String(control.value)])}getAll(key){return this.pairs.filter(([name])=>name===key).map(([,value])=>value)}has(key){return this.pairs.some(([name])=>name===key)}[Symbol.iterator](){return this.pairs[Symbol.iterator]()}};
 return {rows,writes,requests,elements,get state(){return JSON.parse(rows.get('MGT_BETA_V8:guest'))},get form(){return elements.get('gymForm')},get inventory(){return elements.get('gymForm').controls.filter(control=>control.name==='equipment'&&control.checked).map(control=>control.value)},get draft(){const form=elements.get('gymForm');return {...Object.fromEntries(Object.entries(form.elements).map(([name,control])=>[name,control.value])),inventory:this.inventory}},async click(action,data={}){await emit('click',{closest:()=>({dataset:{action,...data},disabled:false})})},async set(name,value){const control=this.form.elements[name];assert.ok(control,'Rendered field '+name+' exists');control.value=String(value);await emit('input',control);await emit('change',control)},async equipment(name,checked){const control=this.form.controls.find(control=>control.name==='equipment'&&control.value===name);assert.ok(control,'Rendered equipment '+name+' exists');control.checked=checked;await emit('change',control)},async submit(){await emit('submit',this.form)},restore(){for(const [name,descriptor]of previous)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name]}};
}
async function open(env,label){await import('../app.mjs?gym-autofill-ui='+label);assert.doesNotMatch(env.elements.get('app').innerHTML,/could not open/);await env.click('gym',{id:'synthetic-gym'});env.writes.length=0;return [...env.rows]}

test('autofill changes only an editable draft until Save and retains manual inventory, notes and limits',async()=>{
 const original=gym(),env=environment(original);
 try{
  const before=await open(env,'common');await env.click('gym-autofill');
  assert.match(env.elements.get('gymLookupResults').innerHTML,/Estimated from the gym type/);assert.deepEqual(env.writes,[]);assert.deepEqual([...env.rows],before);
  assert.deepEqual(env.inventory.slice().sort(),original.inventory.slice().sort());
  await env.click('apply-gym-autofill');assert.deepEqual(env.writes,[]);assert.deepEqual([...env.rows],before);
  for(const name of [...original.inventory,'Dumbbells','Adjustable Bench'])assert.ok(env.inventory.includes(name));
  assert.equal(+env.form.elements.dbMax.value,80);assert.equal(env.form.elements.notes.value,original.notes);assert.equal(+env.form.elements.increment.value,2.5);
  await env.equipment('Adjustable Bench',false);await env.equipment('Kettlebells',true);await env.submit();
  const saved=env.state.gyms[0];assert.equal(saved.inventory.includes('Adjustable Bench'),false);assert.ok(saved.inventory.includes('Kettlebells'));for(const name of original.inventory)assert.ok(saved.inventory.includes(name));
  assert.equal(saved.notes,original.notes);assert.equal(saved.dbMax,80);assert.equal(saved.increment,2.5);assert.deepEqual(saved.unknownPreference,original.unknownPreference);
  assert.equal(saved.equipmentConfirmedAt,null);assert.equal(saved.sourceInfo.complete,false);assert.equal(saved.sourceInfo.equipment.length,0);assert.ok(saved.sourceInfo.estimates.some(item=>item.name==='Adjustable Bench'));
  assert.deepEqual(env.state.logs,JSON.parse(before[0][1]).logs);
 }finally{env.restore()}
});

test('published equipment stays separate from estimates even when a suggestion is unchecked',async()=>{
 const original=gym({exact:true}),env=environment(original);
 try{
  const before=await open(env,'published');await env.click('gym-lookup');await env.click('apply-gym-source',{id:published.id});
  const preview=env.elements.get('gymLookupResults').innerHTML;assert.match(preview,/Published for this location/);assert.match(preview,/Estimated from the gym type/);assert.match(preview,/120 lb/);
  assert.equal(env.elements.get('usePublishedDbMax').checked,false);assert.deepEqual(env.writes,[]);assert.deepEqual([...env.rows],before);
  await env.click('apply-gym-autofill');assert.equal(+env.form.elements.dbMax.value,80);assert.deepEqual(env.writes,[]);
  await env.equipment('Kettlebells',false);await env.equipment('Adjustable Bench',false);await env.submit();
  const saved=env.state.gyms[0];assert.equal(saved.dbMax,80);assert.equal(saved.notes,original.notes);assert.equal(saved.inventory.includes('Kettlebells'),false);assert.equal(saved.inventory.includes('Adjustable Bench'),false);
  assert.equal(saved.sourceInfo.equipment.length,2);assert.ok(saved.sourceInfo.equipment.every(item=>item.status==='published'&&item.sourceUrl&&item.checked));assert.ok(saved.sourceInfo.equipment.some(item=>item.name==='Kettlebells'));
  assert.ok(saved.sourceInfo.estimates.some(item=>item.name==='Adjustable Bench'&&item.status==='estimated'));assert.equal(saved.sourceInfo.complete,false);assert.equal(saved.equipmentConfirmedAt,null);
 }finally{env.restore()}
});

test('a published dumbbell limit replaces the manual limit only when explicitly selected',async()=>{
 const env=environment(gym({exact:true}));
 try{
  await open(env,'published-limit');await env.click('gym-lookup');await env.click('apply-gym-source',{id:published.id});
  env.elements.get('usePublishedDbMax').checked=true;await env.click('apply-gym-autofill');assert.equal(+env.form.elements.dbMax.value,120);assert.deepEqual(env.writes,[]);
  await env.submit();assert.equal(env.state.gyms[0].dbMax,120);assert.equal(env.state.gyms[0].notes,'Keep my exact synthetic notes');
 }finally{env.restore()}
});

test('notes-only edits retain equipment confirmation while changing the location invalidates its evidence',async()=>{
 const original=gym({exact:true,source:true}),env=environment(original);
 try{
  await open(env,'confirmation');await env.set('notes','Edited synthetic notes only');assert.deepEqual(env.writes,[]);await env.submit();
  const noted=env.state.gyms[0];assert.equal(noted.equipmentConfirmedAt,stamp);assert.deepEqual(noted.sourceInfo,original.sourceInfo);
  await env.click('gym',{id:original.id});env.writes.length=0;await env.set('location','Different Synthetic City');await env.set('address','100 Different Synthetic Avenue');assert.deepEqual(env.writes,[]);await env.submit();
  const moved=env.state.gyms[0];assert.equal(moved.equipmentConfirmedAt,null);assert.equal(moved.sourceInfo,null);assert.equal(moved.notes,'Edited synthetic notes only');assert.deepEqual(moved.inventory,noted.inventory);
  const recovery=JSON.parse(env.rows.get('MGT_BETA_SNAPSHOTS:guest'))[0].state.gyms[0];assert.deepEqual(recovery.sourceInfo,original.sourceInfo);assert.equal(recovery.equipmentConfirmedAt,stamp);
 }finally{env.restore()}
});

test('manual changes after a preview reject stale proposals without changing the new draft or storage',async()=>{
 const env=environment(gym());
 try{
  const before=await open(env,'stale');
  for(const edit of [()=>env.set('notes','Keep this newer manual note'),()=>env.set('location','New Synthetic City'),()=>env.equipment('Kettlebells',true)]){
   await env.click('gym',{id:'synthetic-gym'});await env.click('gym-autofill');await edit();const draft=C.clone(env.draft);
   await env.click('apply-gym-autofill');assert.match(env.elements.get('toast').textContent,/draft changed|changed.*preview/i);assert.deepEqual(env.draft,draft);assert.deepEqual([...env.rows],before);assert.deepEqual(env.writes,[]);
  }
 }finally{env.restore()}
});

test('unconfigured live AI research is visibly disabled and cannot send a request',async()=>{
 const env=environment(gym());
 try{
  const before=await open(env,'ai-disabled'),draft=C.clone(env.draft);
  assert.match(env.elements.get('modalBody').innerHTML,/data-action="gym-ai-search" disabled/);assert.match(env.elements.get('modalBody').innerHTML,/Live AI search is not connected/);
  await env.click('gym-ai-search');assert.match(env.elements.get('toast').textContent,/Live AI gym search is not connected/);
  assert.deepEqual(env.draft,draft);assert.deepEqual([...env.rows],before);assert.deepEqual(env.writes,[]);assert.deepEqual(env.requests,['./config.json','./media-manifest.json']);
 }finally{env.restore()}
});
