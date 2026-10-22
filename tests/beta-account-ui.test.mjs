import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import * as C from '../core.mjs';
import {CloudSync} from '../cloud.mjs?v=8.1.1';
import {BETA_BROWSER_CONTEXT_KEY,requireBetaBrowserContext,BetaBrowserContextError,invalidateChangedTabSession} from '../beta-browser-context.mjs';
const project='bhyrrxrpqaxiwpfxnwpa',context='a'.repeat(64);
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve}};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function workspace(owner){const state=C.defaultState();state.ownerId=owner;state.nutrition.setupPromptSeen=true;state.profile.name=owner||'Synthetic guest';state.logs['2026-10-01']={id:'2026-10-01',date:'2026-10-01',title:'Synthetic '+(owner||'guest'),kind:'strength',status:'completed',gymId:'crunch',exercises:[C.makeExercise(C.CATALOG[0])]};Object.assign(state.logs['2026-10-01'].exercises[0].sets[0],{w:0,r:12,rir:0,done:true});return state}
function environment({savedContext=null,runtimeContext=context,status=200}={}){
 const names=['document','localStorage','sessionStorage','window','navigator','location','history','confirm','setInterval','setTimeout','fetch','FormData','Image','speechSynthesis','SpeechSynthesisUtterance'];
 const previous=new Map(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
 const rows=new Map(),writes=[],reads=[],elements=new Map(),listeners=new Map(),windowListeners=new Map(),prompts=[],requests=[];
 for(const owner of ['account-a','account-b',null])rows.set('MGT_BETA_V8:'+(owner||'guest'),JSON.stringify(workspace(owner)));
 const authKey='MGT_BETA_AUTH:'+project;
 rows.set('MGT_BETA_CLOUD_CONFIG:'+project,JSON.stringify({url:'https://'+project+'.supabase.co',key:'sb_publishable_synthetic'}));
 rows.set(authKey,JSON.stringify({user:{id:'account-a'},access_token:'synthetic-a',refresh_token:'synthetic-a',expires_at:Date.now()/1000+3600}));
 if(savedContext!==null)rows.set(BETA_BROWSER_CONTEXT_KEY,savedContext);
 rows.set('MGT28v6',JSON.stringify({logs:[],privateMarker:'synthetic-private-original'}));
 const forms=new Set(),buttons=new Set();
 class Element{
  constructor(id){Object.assign(this,{id,textContent:'',value:'',open:false,dataset:{},elements:{},listeners:{},classList:{add(){},remove(){}},_html:''})}
  get innerHTML(){return this._html}
  set innerHTML(value){this._html=String(value);if(this.id!=='modalBody'&&this.id!=='app')return;for(const form of forms)if(form.container===this.id){form.isConnected=false;forms.delete(form)}for(const b of buttons)if(b.container===this.id){b.isConnected=false;buttons.delete(b)}for(const m of this._html.matchAll(/<form\b[^>]*\bid="([^"]+)"/g)){const form=new Element(m[1]);Object.assign(form,{isConnected:true,container:this.id,values:{}});forms.add(form);elements.set(form.id,form)}for(const m of this._html.matchAll(/<button\b[^>]*data-action="([^"]+)"/g)){const b=new Element('');Object.assign(b,{isConnected:true,container:this.id,dataset:{action:m[1]}});buttons.add(b)}}
  addEventListener(name,fn){this.listeners[name]=fn}showModal(){this.open=true}close(){this.open=false}focus(){}
 }
 const element=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)};
 globalThis.document={documentElement:{dataset:{preview:'test-cloud',testProject:project}},getElementById:element,activeElement:{tagName:'BODY'},hidden:false,addEventListener:(name,fn)=>listeners.set(name,[...(listeners.get(name)||[]),fn]),querySelector:s=>s==='dialog[open]'&&element('modal').open?element('modal'):null,querySelectorAll:s=>s==='#modalBody form, #app form'?[...forms]:[]};
 globalThis.localStorage={getItem:key=>{reads.push(key);return rows.get(key)??null},setItem:(key,value)=>{writes.push(key);rows.set(key,String(value))},removeItem:key=>{writes.push('remove:'+key);rows.delete(key)}};
 globalThis.sessionStorage={getItem:()=>null,setItem(){},removeItem(){}};
 globalThis.window={addEventListener:(name,fn)=>windowListeners.set(name,[...(windowListeners.get(name)||[]),fn]),scrollTo(){}};
 Object.defineProperty(globalThis,'navigator',{value:{onLine:true,vibrate(){}},configurable:true});
 globalThis.location={origin:'https://synthetic.example.invalid',pathname:'/',href:'https://synthetic.example.invalid/',hash:'',search:''};globalThis.history={replaceState(){}};globalThis.confirm=message=>{prompts.push(message);return true};globalThis.setInterval=()=>0;globalThis.setTimeout=()=>0;
 globalThis.fetch=async path=>{requests.push(path);assert.ok(['./api/preview-config','./media-manifest.json'].includes(path),'No real HTTP allowed');return {ok:status===200,status,json:async()=>path==='./media-manifest.json'?{exercises:[],assets:[],lookup:{}}:{supabase:{url:'https://'+project+'.supabase.co',key:'sb_publishable_synthetic'},pushServiceReady:false,gymResearchReady:false,betaAccountContext:runtimeContext,betaMemberRole:'tester'}}};
 globalThis.FormData=class{constructor(form){this.pairs=Object.entries(form.values||{}).flatMap(([key,value])=>Array.isArray(value)?value.map(v=>[key,String(v)]):[[key,String(value)]])}getAll(key){return this.pairs.filter(([k])=>k===key).map(([,v])=>v)}has(key){return this.pairs.some(([k])=>k===key)}[Symbol.iterator](){return this.pairs[Symbol.iterator]()}};
 const emit=async(name,target)=>{for(const listener of listeners.get(name)||[])listener({target,preventDefault(){}});await tick()};
 return {rows,writes,reads,elements,prompts,requests,authKey,buttons,async change(target){return emit('change',target)},async click(action){return emit('click',{closest:()=>({dataset:{action},disabled:false})})},async rawClick(button){return emit('click',{closest:()=>button})},async submit(form,values={}){form.values=values;return emit('submit',form)},async storage(newValue){for(const listener of windowListeners.get('storage')||[])listener({key:authKey,newValue});await tick()},restore(){for(const [name,descriptor]of previous)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name]}};
}
async function open(t,env){let cloud;t.mock.method(CloudSync.prototype,'restoreSession',async function(){cloud=this});await import('../app.mjs?beta-account='+encodeURIComponent(t.name));return cloud}
async function switchTo(cloud,id){cloud.accountVersion++;cloud.session=id?{user:{id},access_token:'synthetic',refresh_token:'synthetic',expires_at:Date.now()/1000+3600}:null;await cloud.onAccount(id?{id}:null)}

test('browser account claim preserves all records and rejects another ChatGPT context',()=>{
 const rows=new Map([['MGT_BETA_V8:account-a','kept']]),storage={getItem:k=>rows.get(k)??null,setItem:(k,v)=>rows.set(k,v)};
 requireBetaBrowserContext(storage,context);assert.equal(rows.get('MGT_BETA_V8:account-a'),'kept');requireBetaBrowserContext(storage,context);
 const before=[...rows];assert.throws(()=>requireBetaBrowserContext(storage,'b'.repeat(64)),BetaBrowserContextError);assert.deepEqual([...rows],before);
 for(const value of [null,'','not-a-context'])assert.throws(()=>requireBetaBrowserContext(storage,value),BetaBrowserContextError);
});

for(const failure of [{savedContext:'b'.repeat(64)},{runtimeContext:''},{status:401},{status:403}])test('unverified browser context is fatal before saved records render or cloud restore '+JSON.stringify(failure),async t=>{
 const env=environment(failure),before=[...env.rows];let restores=0;
 try{t.mock.method(CloudSync.prototype,'restoreSession',async()=>restores++);await import('../app.mjs?beta-fatal='+encodeURIComponent(t.name));assert.match(env.elements.get('app').innerHTML,/could not open/);assert.match(env.elements.get('app').innerHTML,/Saved device data is preserved/);assert.doesNotMatch(env.elements.get('app').innerHTML,/Synthetic account-a/);assert.equal(restores,0);assert.doesNotMatch(env.elements.get('app').innerHTML,/export-original|Export original backup/);assert.deepEqual([...env.rows],before);assert.deepEqual(env.requests,['./api/preview-config']);assert.deepEqual(env.writes,[]);assert.equal(env.reads.some(key=>key.startsWith('MGT_BETA_V8:')||key.startsWith('MGT_BETA_SNAPSHOTS:')||key==='MGT28v6'||key==='MGT28v5'),false)}finally{env.restore()}
});

for(const throughGuest of [false,true])test('delayed backup cannot cross account transition'+(throughGuest?' A to guest to A':''),async t=>{
 const env=environment(),fileRead=deferred();
 try{const cloud=await open(t,env);assert.ok(cloud);const backup=workspace('account-a');backup.logs['2026-10-02']={...C.clone(backup.logs['2026-10-01']),id:'2026-10-02',date:'2026-10-02',title:'Delayed private import'};const importing=env.elements.get('backupFile').listeners.change({target:{files:[{size:100,text:()=>fileRead.promise}],value:'synthetic.json'}});
  await switchTo(cloud,throughGuest?null:'account-b');if(throughGuest)await switchTo(cloud,'account-a');const beforeA=env.rows.get('MGT_BETA_V8:account-a'),beforeB=env.rows.get('MGT_BETA_V8:account-b');fileRead.resolve(JSON.stringify(backup));await importing;
  assert.equal(env.rows.get('MGT_BETA_V8:account-a'),beforeA);assert.equal(env.rows.get('MGT_BETA_V8:account-b'),beforeB);assert.deepEqual(env.prompts,[]);assert.match(env.elements.get('toast').textContent,/account changed/);
 }finally{env.restore()}
});

test('account change closes pending meal drafts and rejects detached forms and buttons',async t=>{
 const env=environment();try{const cloud=await open(t,env);await env.click('meal-generator');const oldButton=[...env.buttons].find(b=>b.dataset.action==='apply-meals');assert.ok(oldButton);assert.equal(env.elements.get('modal').open,true);await switchTo(cloud,'account-b');assert.equal(env.elements.get('modal').open,false);assert.equal(env.elements.get('modalBody').innerHTML,'');const before=env.rows.get('MGT_BETA_V8:account-b');await env.rawClick(oldButton);await env.click('apply-meals');assert.equal(env.rows.get('MGT_BETA_V8:account-b'),before);
  await env.click('generator');const oldForm=env.elements.get('generatorForm');await switchTo(cloud,'account-a');await env.submit(oldForm,{});assert.match(env.elements.get('toast').textContent,/no longer open/);assert.deepEqual(JSON.parse(env.rows.get('MGT_BETA_V8:account-a')).plan,{});
 }finally{env.restore()}
});

test('account change discards a reviewed custom program before it can reach another account',async t=>{
 const env=environment();
 try{
  const cloud=await open(t,env),source=cloud.getState();
  source.routines=[{id:'synthetic-routine',name:'Synthetic retained routine',exercises:C.clone(source.logs['2026-10-01'].exercises)}];
  await env.click('custom-block');await env.submit(env.elements.get('customBlockForm'),{start:'2026-11-02',days:28,frequency:4,'routine-synthetic-routine':1});
  assert.match(env.elements.get('modalBody').innerHTML,/Review your custom block/);
  await switchTo(cloud,'account-b');const before=env.rows.get('MGT_BETA_V8:account-b');await env.click('apply-program');assert.equal(env.rows.get('MGT_BETA_V8:account-b'),before);
 }finally{env.restore()}
});

test('delayed recipe upload is discarded after A to guest to A',async t=>{
 const env=environment(),fileRead=deferred();try{const cloud=await open(t,env),before=JSON.parse(env.rows.get('MGT_BETA_V8:account-a')).recipes;const importing=env.elements.get('recipeFile').listeners.change({target:{files:[{size:100,text:()=>fileRead.promise}],value:'synthetic.json'}});await switchTo(cloud,null);await switchTo(cloud,'account-a');fileRead.resolve('[]');await importing;assert.match(env.elements.get('toast').textContent,/account changed/);assert.deepEqual(JSON.parse(env.rows.get('MGT_BETA_V8:account-a')).recipes,before);assert.equal(env.elements.get('modal').open,false)}finally{env.restore()}
});

test('a photo that finishes after account switch does not alter the new profile',async t=>{
 const env=environment();let finish;
 try{
  const cloud=await open(t,env);globalThis.Image=class{constructor(){this.naturalWidth=this.naturalHeight=320}set src(value){finish=()=>this.onload()}};
  document.createElement=()=>({getContext:()=>({fillRect(){},drawImage(){}}),toDataURL:()=> 'data:image/jpeg;base64,QQ=='});
  const processing=env.elements.get('avatarFile').listeners.change({target:{files:[new Blob(['synthetic-photo'],{type:'image/jpeg'})],value:'synthetic.jpg'}});
  assert.equal(typeof finish,'function');await switchTo(cloud,'account-b');const before=env.rows.get('MGT_BETA_V8:account-b');finish();await processing;
  assert.equal(env.rows.get('MGT_BETA_V8:account-b'),before);assert.match(env.elements.get('toast').textContent,/account changed/);
 }finally{env.restore()}
});

test('test-cloud logout in another tab invalidates only memory and preserves shared auth and account records',async t=>{
 const env=environment();try{const cloud=await open(t,env),beforeA=env.rows.get('MGT_BETA_V8:account-a'),beforeB=env.rows.get('MGT_BETA_V8:account-b'),newAuth=JSON.stringify({user:{id:'account-b'},access_token:'synthetic-b'});env.rows.set(env.authKey,newAuth);await env.storage(newAuth);assert.equal(cloud.session,null);assert.equal(env.rows.get(env.authKey),newAuth);assert.equal(env.rows.get('MGT_BETA_V8:account-a'),beforeA);assert.equal(env.rows.get('MGT_BETA_V8:account-b'),beforeB);assert.match(cloud.lastStatus,/another tab/);assert.equal(cloud.getState().ownerId,null);assert.equal(cloud.getState().profile.name,'Synthetic guest')}finally{env.restore()}
});

test('same-account refresh in another tab preserves pending work; stale authenticated operations fail after logout',()=>{
 const rows=new Map(),cloud=new CloudSync({storage:{getItem:k=>rows.get(k)??null,setItem:(k,v)=>rows.set(k,v)},allowedProject:project});cloud.session={user:{id:'account-a'}};const before=cloud.accountContext();
 assert.equal(invalidateChangedTabSession(cloud,{key:cloud.authKey,newValue:JSON.stringify({user:{id:'account-a'},access_token:'refresh'})}),false);assert.equal(cloud.isCurrentAccount(before),true);
 assert.equal(invalidateChangedTabSession(cloud,{key:cloud.authKey,newValue:null}),true);assert.equal(cloud.isCurrentAccount(before),false);assert.equal(rows.size,0);
});

test('service worker never masks auth, admission or API navigation with the cached app shell',async()=>{
 const source=await fs.readFile(new URL('../sw.js',import.meta.url),'utf8'),listeners=new Map();let fetches=0,cacheReads=0;
 const self={location:{href:'https://synthetic.example.invalid/sw.js',origin:'https://synthetic.example.invalid'},addEventListener:(name,fn)=>listeners.set(name,fn)};
 vm.runInNewContext(source,{self,URL,Request,Response,fetch:async()=>{fetches++;throw Error('Offline')},caches:{open:async()=>({match:async()=>{cacheReads++;return new Response('cached-owner-shell')}})}});
 for(const route of ['/signin-with-chatgpt?return_to=%2Fbeta','/signout-with-chatgpt?return_to=%2Fbeta','/callback','/beta','/api/beta-join','/api/preview-config']){let intercepted=false;listeners.get('fetch')({request:{url:'https://synthetic.example.invalid'+route,method:'GET',cache:'default',mode:'navigate'},respondWith(){intercepted=true}});assert.equal(intercepted,false,route)}assert.equal(fetches,0);assert.equal(cacheReads,0);
});


test('changing accounts cancels an active workout voice cue and never replays it from the next workspace',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date('2027-01-04T12:00:00Z').getTime()});
 const env=environment();let spoken=0,cancelled=0;try{
  const saved=JSON.parse(env.rows.get('MGT_BETA_V8:account-a')),day=C.clone(saved.logs['2026-10-01']);Object.assign(day,{date:'2027-01-04',id:'2027-01-04',status:'in-progress'});day.exercises[0].sets[0].done=false;saved.logs[day.date]=day;env.rows.set('MGT_BETA_V8:account-a',JSON.stringify(saved));
  globalThis.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};globalThis.speechSynthesis={getVoices:()=>[],speak:()=>spoken++,cancel:()=>cancelled++};
  const cloud=await open(t,env);await env.change({dataset:{set:'0:0:done'},type:'checkbox',checked:true});assert.equal(spoken,1);await switchTo(cloud,'account-b');assert.equal(cancelled,1);assert.equal(spoken,1);
 }finally{env.restore()}
});
