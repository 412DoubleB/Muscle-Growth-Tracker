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
function environment(savedGym,{aiReady=false,previewMode='local',research=async()=>{throw Error('Unexpected synthetic research request')}}={}){
 const names=['document','localStorage','sessionStorage','window','navigator','location','history','confirm','setInterval','setTimeout','clearTimeout','fetch','FormData'];
 const previous=new Map(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)])),elements=new Map(),listeners=new Map(),writes=[],requests=[],researchRequests=[],timers=new Map();let nextTimer=0;
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
  const attrs=attributes(match[1]),form=new Element('gymForm');form.dataset={id:attrs['data-id']||''};form.elements={};form.controls=[];form.evidence=[];form.aiButton={dataset:{action:'gym-ai-search'},disabled:false,textContent:'Search location with AI'};
  const add=(attrs,value)=>{const control=new Element(attrs.id||'');Object.assign(control,{name:attrs.name||'',type:attrs.type||'text',value:value??attrs.value??'',checked:Object.hasOwn(attrs,'checked'),disabled:Object.hasOwn(attrs,'disabled'),closest:selector=>selector==='#gymForm'?form:null});form.controls.push(control);if(control.name!=='equipment')form.elements[control.name]=control;return control};
  for(const input of match[2].matchAll(/<input\b([^>]*)>/g))add(attributes(input[1]));
  for(const select of match[2].matchAll(/<select\b([^>]*)>([\s\S]*?)<\/select>/g)){const options=[...select[2].matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option>/g)].map(item=>attributes(item[1]));const selected=options.find(option=>Object.hasOwn(option,'selected'))||options[0];add({...attributes(select[1]),type:'select-one'},selected?.value||'')}
  for(const textarea of match[2].matchAll(/<textarea\b([^>]*)>([\s\S]*?)<\/textarea>/g))add({...attributes(textarea[1]),type:'textarea'},decode(textarea[2]));
  for(const span of match[2].matchAll(/<span\b([^>]*\bdata-equipment-evidence="[^"]*"[^>]*)>/g)){const element=new Element(''),attrs=attributes(span[1]);element.dataset.equipmentEvidence=attrs['data-equipment-evidence'];form.evidence.push(element)}
  elements.set('gymForm',form);elements.set('gymLookupResults',new Element('gymLookupResults'));elements.delete('usePublishedDbMax');
 }
 const element=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)};
 const emit=async(name,target)=>{for(const listener of listeners.get(name)||[])listener({target,preventDefault(){}});await new Promise(resolve=>setImmediate(resolve))};
 globalThis.document={documentElement:{dataset:{preview:previewMode,testProject:'bhyrrxrpqaxiwpfxnwpa'}},getElementById:id=>['gymForm','usePublishedDbMax'].includes(id)?elements.get(id)||null:element(id),activeElement:{tagName:'BODY'},hidden:false,addEventListener:(name,fn)=>listeners.set(name,[...(listeners.get(name)||[]),fn]),querySelector:selector=>selector==='dialog[open]'&&element('modal').open?element('modal'):null,querySelectorAll:selector=>selector==='#gymForm [name=equipment]'?(elements.get('gymForm')?.controls||[]).filter(control=>control.name==='equipment'):selector==='#gymForm [data-equipment-evidence]'?elements.get('gymForm')?.evidence||[]:[]};
 globalThis.localStorage={getItem:key=>rows.get(key)??null,setItem:(key,value)=>{writes.push(key);rows.set(key,String(value))},removeItem(){assert.fail('Gym drafting must not remove stored records')}};
 globalThis.sessionStorage={getItem:()=>null,setItem(){},removeItem(){}};globalThis.window={addEventListener(){},scrollTo(){}};
 Object.defineProperty(globalThis,'navigator',{value:{onLine:true,vibrate(){}},configurable:true});globalThis.location={origin:'https://synthetic.example.invalid',pathname:'/',href:'https://synthetic.example.invalid/',hash:'',search:''};
 globalThis.history={replaceState(){}};globalThis.confirm=()=>true;globalThis.setInterval=()=>0;globalThis.setTimeout=(callback,delay)=>{const id=++nextTimer;if(delay===45000)timers.set(id,callback);return id};globalThis.clearTimeout=id=>timers.delete(id);
 globalThis.fetch=async(request,options={})=>{requests.push(request);if(request==='./api/gym-research'){researchRequests.push({request,options});return research(request,options)}assert.ok(['./config.json','./api/preview-config','./media-manifest.json'].includes(request),'No real account or AI research requests in this test');return {ok:true,json:async()=>request==='./media-manifest.json'?{exercises:[],assets:[],lookup:{}}:{gymResearchReady:aiReady,pushServiceReady:false,...(previewMode==='test-cloud'?{supabase:{url:'https://bhyrrxrpqaxiwpfxnwpa.supabase.co',key:'sb_publishable_synthetic'}}:{})}}};
 globalThis.FormData=class{constructor(form){assert.ok(form.controls,'Submit the rendered form controls');this.pairs=form.controls.filter(control=>control.name&&!control.disabled&&(control.type!=='checkbox'||control.checked)).map(control=>[control.name,String(control.value)])}getAll(key){return this.pairs.filter(([name])=>name===key).map(([,value])=>value)}has(key){return this.pairs.some(([name])=>name===key)}[Symbol.iterator](){return this.pairs[Symbol.iterator]()}};
 return {rows,writes,requests,researchRequests,elements,expireResearch(){for(const callback of [...timers.values()])callback()},get state(){return JSON.parse(rows.get('MGT_BETA_V8:guest'))},get form(){return elements.get('gymForm')},get inventory(){return elements.get('gymForm').controls.filter(control=>control.name==='equipment'&&control.checked).map(control=>control.value)},get draft(){const form=elements.get('gymForm');return {...Object.fromEntries(Object.entries(form.elements).map(([name,control])=>[name,control.value])),inventory:this.inventory}},async click(action,data={}){const button=action==='gym-ai-search'&&this.form?this.form.aiButton:{dataset:{action,...data},disabled:false};await emit('click',{closest:()=>button});return button},async set(name,value){const control=this.form.elements[name];assert.ok(control,'Rendered field '+name+' exists');control.value=String(value);await emit('input',control);await emit('change',control)},async equipment(name,checked){const control=this.form.controls.find(control=>control.name==='equipment'&&control.value===name);assert.ok(control,'Rendered equipment '+name+' exists');control.checked=checked;await emit('change',control)},async submit(){await emit('submit',this.form)},restore(){for(const [name,descriptor]of previous)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name]}};
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
  await open(env,'confirmation');assert.match(env.elements.get('modalBody').innerHTML,/>Saved source<\/a>/);assert.doesNotMatch(env.elements.get('modalBody').innerHTML,/>Official source<\/a>/);await env.set('notes','Edited synthetic notes only');assert.deepEqual(env.writes,[]);await env.submit();
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

const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no});return {promise,resolve,reject}};
const researchResponse=(data,status=200)=>({ok:status<400,status,json:async()=>data});
const candidate=()=>({id:'ai-synthetic-source-club',name:'Synthetic Source Club',city:'Synthetic City',address:'42 Synthetic Avenue, Synthetic City',status:'Reported open; confirm current hours',checked:'2026-11-02',url:'https://synthetic.example.invalid/club',sources:[{url:'https://synthetic.example.invalid/equipment',checked:'2026-11-02'}],equipment:[{name:'Dumbbells',detail:'Source describes the dumbbell area; weights need checking.',status:'published',sourceUrl:'https://synthetic.example.invalid/equipment',checked:'2026-11-02'}],unknown:['Machine models and attachments'],amenities:[],complete:false});
const settle=()=>new Promise(resolve=>setImmediate(resolve));

test('test-cloud readiness reaches the UI and AI results stay candidates until an explicit location choice',async()=>{
 const result=candidate(),original=gym(),env=environment(original,{aiReady:true,previewMode:'test-cloud',research:async()=>researchResponse({locations:[result],checked:'2026-11-02',notice:'Synthetic source candidates'})});
 try{
  const before=await open(env,'ai-ready'),draft=C.clone(env.draft);
  assert.doesNotMatch(env.elements.get('modalBody').innerHTML,/data-action="gym-ai-search" disabled/);
  const button=await env.click('gym-ai-search');assert.equal(button.disabled,false);assert.equal(env.researchRequests.length,1);
  const {request,options}=env.researchRequests[0];assert.equal(request,'./api/gym-research');assert.equal(options.method,'POST');assert.equal(options.credentials,'same-origin');assert.equal(options.redirect,'error');assert.equal(options.cache,'no-store');assert.ok(options.signal instanceof AbortSignal);
  assert.deepEqual(JSON.parse(options.body),{name:original.name,location:original.location,address:original.address});
  const html=env.elements.get('gymLookupResults').innerHTML;assert.match(html,/AI-researched location candidates/);assert.match(html,/exact address and operating status/);assert.match(html,/>Published<\/span>/);assert.match(html,/Equipment source/);assert.match(html,/Source 1/);assert.match(html,/Source 2/);assert.match(html,/checked 2026-11-02/);assert.doesNotMatch(html,/Official location source|physical inventory verified/);
  assert.deepEqual(env.draft,draft);assert.deepEqual([...env.rows],before);assert.deepEqual(env.writes,[]);
  await env.click('apply-gym-source',{id:result.id});assert.equal(env.form.elements.name.value,result.name);assert.equal(env.form.elements.address.value,result.address);assert.equal(env.form.elements.notes.value,original.notes);assert.equal(+env.form.elements.dbMax.value,80);
  assert.match(env.elements.get('gymLookupResults').innerHTML,/Published for this location/);assert.match(env.elements.get('gymLookupResults').innerHTML,/Estimated from the gym type/);assert.deepEqual(env.inventory,draft.inventory);assert.deepEqual([...env.rows],before);assert.deepEqual(env.writes,[]);
 }finally{env.restore()}
});

test('only a boolean true activates search and no-result responses preserve the entire draft',async t=>{
 await t.test('string readiness is disabled',async()=>{
  const env=environment(gym(),{aiReady:'true',research:async()=>assert.fail('String readiness must not send a request')});
  try{const before=await open(env,'ai-string-ready');assert.match(env.elements.get('modalBody').innerHTML,/data-action="gym-ai-search" disabled/);await env.click('gym-ai-search');assert.equal(env.researchRequests.length,0);assert.deepEqual([...env.rows],before)}finally{env.restore()}
 });
 await t.test('empty candidates',async()=>{
  const env=environment(gym(),{aiReady:true,research:async()=>researchResponse({locations:[],checked:'2026-11-02'})});
  try{const before=await open(env,'ai-empty'),draft=C.clone(env.draft);await env.click('gym-ai-search');assert.match(env.elements.get('gymLookupResults').innerHTML,/No location candidates with enough source information/);assert.deepEqual(env.draft,draft);assert.deepEqual([...env.rows],before);assert.deepEqual(env.writes,[])}finally{env.restore()}
 });
});

test('a pending request disables duplicate submissions and editing the draft cancels stale results',async()=>{
 const pending=deferred(),env=environment(gym(),{aiReady:true,research:()=>pending.promise});
 try{
  const before=await open(env,'ai-pending'),button=await env.click('gym-ai-search');assert.equal(button.disabled,true);assert.match(button.textContent,/Researching/);
  await env.click('gym-ai-search');assert.equal(env.researchRequests.length,1);
  await env.set('notes','A newer synthetic note');assert.equal(env.researchRequests[0].options.signal.aborted,true);assert.equal(button.disabled,false);assert.match(env.elements.get('gymLookupResults').innerHTML,/draft changed/i);
  const draft=C.clone(env.draft);pending.resolve(researchResponse({locations:[candidate()]}));await settle();
  assert.deepEqual(env.draft,draft);assert.equal(env.form.elements.notes.value,'A newer synthetic note');assert.doesNotMatch(env.elements.get('gymLookupResults').innerHTML,/Synthetic Source Club/);assert.deepEqual([...env.rows],before);assert.deepEqual(env.writes,[]);
 }finally{env.restore()}
});

test('late completion cannot reenable a newer search on the same button or replace its results',async()=>{
 const old=deferred(),current=deferred();let calls=0;const env=environment(gym(),{aiReady:true,research:()=>++calls===1?old.promise:current.promise});
 try{
  const before=await open(env,'ai-newer'),button=await env.click('gym-ai-search');await env.set('location','New Synthetic City');await env.click('gym-ai-search');assert.equal(button.disabled,true);assert.equal(env.researchRequests.length,2);
  old.resolve(researchResponse({locations:[candidate()]}));await settle();assert.equal(button.disabled,true);assert.match(button.textContent,/Researching/);assert.doesNotMatch(env.elements.get('gymLookupResults').innerHTML,/Synthetic Source Club/);
  current.resolve(researchResponse({locations:[]}));await settle();assert.equal(button.disabled,false);assert.match(env.elements.get('gymLookupResults').innerHTML,/No location candidates/);assert.deepEqual([...env.rows],before);assert.deepEqual(env.writes,[]);
 }finally{env.restore()}
});

test('manual equipment presets cancel pending research without saving or reviving its old result',async()=>{
 const pending=deferred(),env=environment(gym(),{aiReady:true,research:()=>pending.promise});
 try{
  const before=await open(env,'ai-equipment-preset'),button=await env.click('gym-ai-search');await env.click('equipment-preset',{preset:'clear'});
  assert.equal(env.researchRequests[0].options.signal.aborted,true);assert.equal(button.disabled,false);assert.deepEqual(env.inventory,[]);const draft=C.clone(env.draft);
  pending.resolve(researchResponse({locations:[candidate()]}));await settle();assert.deepEqual(env.draft,draft);assert.doesNotMatch(env.elements.get('gymLookupResults').innerHTML,/Synthetic Source Club/);assert.deepEqual([...env.rows],before);assert.deepEqual(env.writes,[]);
 }finally{env.restore()}
});

test('closing and reopening gym setup aborts old research and a late body cannot overwrite the new form',async()=>{
 const body=deferred(),env=environment(gym(),{aiReady:true,research:async()=>({ok:true,status:200,json:()=>body.promise})});
 try{
  const before=await open(env,'ai-closed');await env.click('gym-ai-search');const oldForm=env.form;
  await env.click('close-modal');assert.equal(env.researchRequests[0].options.signal.aborted,true);await env.click('gym',{id:'synthetic-gym'});assert.notEqual(env.form,oldForm);await env.set('notes','Current reopened synthetic draft');const draft=C.clone(env.draft);
  body.resolve({locations:[candidate()]});await settle();assert.deepEqual(env.draft,draft);assert.doesNotMatch(env.elements.get('gymLookupResults').innerHTML,/Synthetic Source Club/);assert.deepEqual([...env.rows],before);assert.deepEqual(env.writes,[]);
 }finally{env.restore()}
});

test('choosing a completed result after a manual draft edit is rejected instead of overwriting it',async()=>{
 const env=environment(gym(),{aiReady:true,research:async()=>researchResponse({locations:[candidate()]})});
 try{
  const before=await open(env,'ai-stale-choice');await env.click('gym-ai-search');await env.set('address','Different current synthetic address');const draft=C.clone(env.draft);
  await env.click('apply-gym-source',{id:candidate().id});assert.match(env.elements.get('toast').textContent,/draft changed/);assert.deepEqual(env.draft,draft);assert.deepEqual([...env.rows],before);assert.deepEqual(env.writes,[]);
 }finally{env.restore()}
});

test('allowance, disabled, authentication and upstream errors use safe messages without saving',async t=>{
 for(const [label,status,code,expected]of [['allowance',429,'LIMIT_REACHED',/allowance has been reached/],['busy',429,'BUSY',/already running or cooling down/],['disabled',503,'DISABLED',/not enabled/],['owner',401,'UNAUTHORIZED',/enrolled ChatGPT account/],['unverified',502,'INVALID_RESEARCH',/reliable source information/],['upstream',502,'UPSTREAM_UNAVAILABLE',/temporarily unavailable/]])await t.test(label,async()=>{
  const env=environment(gym(),{aiReady:true,research:async()=>researchResponse({error:code,providerText:'synthetic-unsafe-provider-secret'},status)});
  try{const before=await open(env,'ai-error-'+label),draft=C.clone(env.draft);const button=await env.click('gym-ai-search');assert.equal(button.disabled,false);const html=env.elements.get('gymLookupResults').innerHTML;assert.match(html,expected);assert.match(env.elements.get('toast').textContent,expected);assert.doesNotMatch(html+env.elements.get('toast').textContent,/synthetic-unsafe-provider-secret/);assert.deepEqual(env.draft,draft);assert.deepEqual([...env.rows],before);assert.deepEqual(env.writes,[])}finally{env.restore()}
 });
});

test('network and timeout failures are bounded, sanitized and leave the draft unchanged',async t=>{
 for(const timeout of [false,true])await t.test(timeout?'timeout':'network',async()=>{
  const env=environment(gym(),{aiReady:true,research:async(_request,{signal})=>{if(!timeout)throw Error('synthetic-unsafe-network-token');return new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(Error('synthetic-unsafe-aborted-token')),{once:true}))}});
  try{const before=await open(env,'ai-failure-'+timeout),draft=C.clone(env.draft),button=await env.click('gym-ai-search');if(timeout){assert.equal(button.disabled,true);env.expireResearch();await settle()}assert.equal(button.disabled,false);const message=env.elements.get('toast').textContent;assert.match(message,timeout?/timed out/:/Check your connection/);assert.doesNotMatch(message,/synthetic-unsafe/);assert.deepEqual(env.draft,draft);assert.deepEqual([...env.rows],before);assert.deepEqual(env.writes,[])}finally{env.restore()}
 });
});

test('malformed, duplicate and AI-estimated candidates are not promoted into checklist evidence',async t=>{
 const record=candidate();
 for(const [label,locations]of [['too-many',Array.from({length:4},(_,i)=>({...record,id:'candidate-'+i}))],['duplicate',[record,C.clone(record)]],['estimated',[{...record,equipment:[{name:'Dumbbells',detail:'Synthetic estimate',status:'estimated'}]}]],['bad-source',[{...record,url:'javascript:synthetic',sources:[]}]]])await t.test(label,async()=>{
  const env=environment(gym(),{aiReady:true,research:async()=>researchResponse({locations})});
  try{const before=await open(env,'ai-invalid-'+label),draft=C.clone(env.draft);await env.click('gym-ai-search');assert.match(env.elements.get('toast').textContent,/could not be verified/);assert.doesNotMatch(env.elements.get('gymLookupResults').innerHTML,/data-action="apply-gym-source"/);assert.deepEqual(env.draft,draft);assert.deepEqual([...env.rows],before);assert.deepEqual(env.writes,[])}finally{env.restore()}
 });
});
