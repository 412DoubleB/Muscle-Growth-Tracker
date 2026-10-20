import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';
import {CloudSync} from '../cloud.mjs?v=8.1.1';
import {BETA_FULL_MESSAGE,BETA_ADMISSION_CAMPAIGN,joinBetaAccount,rememberBetaAdmission,savedBetaAdmission} from '../beta-entry.mjs';
const project='bhyrrxrpqaxiwpfxnwpa';
let bootSequence=0;
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve}};
const session=id=>({user:{id,email:id+'@example.invalid'},access_token:'synthetic-'+id,refresh_token:'synthetic-refresh-'+id,expires_at:Date.now()/1000+3600});
const workspaceKey=key=>/^MGT_BETA_(V8|SNAPSHOTS):/.test(key)||['MGT28v6','MGT28v5'].includes(key);
function environment({owner=null,join=async()=>({ok:true,status:200,json:async()=>({joined:true,role:'member'})}),configStatus=200,recovery=false,ready=false,online=true,stored=null,beta=true,cachedManifest=null}={}){
 const names=['document','localStorage','sessionStorage','window','navigator','location','history','confirm','setInterval','setTimeout','fetch','FormData','addEventListener','caches'];
 const previous=new Map(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
 const rows=new Map(),reads=[],writes=[],requests=[],cacheReads=[],elements=new Map(),forms=new Set(),listeners=new Map(),windowListeners=new Map();
 for(const id of ['account-a','account-b','guest']){const state=C.defaultState();state.ownerId=id==='guest'?null:id;state.profile.name='Private '+id;state.nutrition.setupPromptSeen=true;rows.set('MGT_BETA_V8:'+id,JSON.stringify(state))}
 rows.set('MGT28v6','retained original history');rows.set('MENEI_BETA_BROWSER_CONTEXT','old-site-fingerprint-must-not-be-read');
 const authKey='MGT_BETA_AUTH:'+project;if(owner)rows.set(authKey,JSON.stringify(session(owner)));
 rows.set('MGT_BETA_CLOUD_CONFIG:'+project,JSON.stringify({url:'https://'+project+'.supabase.co',key:'sb_publishable_synthetic'}));
 if(stored){rows.clear();for(const [key,value]of stored)rows.set(key,value)}
 class Element{
  constructor(id){Object.assign(this,{id,textContent:'',value:'',open:false,dataset:{},elements:{},listeners:{},classList:{add(){},remove(){}},_html:''})}
  get innerHTML(){return this._html}set innerHTML(value){this._html=String(value);if(!['app','modalBody'].includes(this.id))return;for(const form of forms)if(form.container===this.id){form.isConnected=false;forms.delete(form)}for(const m of this._html.matchAll(/<form\b[^>]*\bid="([^"]+)"/g)){const form=new Element(m[1]);Object.assign(form,{isConnected:true,container:this.id});forms.add(form);elements.set(form.id,form)}}
  addEventListener(name,fn){this.listeners[name]=fn}showModal(){this.open=true}close(){this.open=false}focus(){}
 }
 const element=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)};
 globalThis.document={documentElement:{dataset:{preview:'test-cloud',testProject:project,betaAdmission:beta?'menei':undefined}},getElementById:element,activeElement:{tagName:'BODY'},hidden:false,addEventListener:(name,fn)=>listeners.set(name,[...(listeners.get(name)||[]),fn]),querySelector:s=>s==='dialog[open]'&&element('modal').open?element('modal'):null,querySelectorAll:s=>s==='#modalBody form, #app form'?[...forms]:[]};
 globalThis.localStorage={getItem:key=>{reads.push(key);return rows.get(key)??null},setItem:(key,value)=>{writes.push(key);rows.set(key,String(value))},removeItem:key=>{writes.push('remove:'+key);rows.delete(key)}};
 globalThis.sessionStorage={getItem:()=>null,setItem(){},removeItem(){}};globalThis.window={addEventListener:(name,fn)=>windowListeners.set(name,[...(windowListeners.get(name)||[]),fn]),scrollTo(){}};
 globalThis.addEventListener=window.addEventListener;
 globalThis.caches={match:async path=>{cacheReads.push(path);return cachedManifest?{ok:true,json:async()=>cachedManifest}:null}};
 Object.defineProperty(globalThis,'navigator',{value:{onLine:online,vibrate(){}},configurable:true});
 globalThis.location={origin:'https://synthetic.example.invalid',pathname:'/beta',href:'https://synthetic.example.invalid/beta',hash:recovery?'#access_token=synthetic-callback&refresh_token=synthetic-recovery&type=recovery':'',search:'',reload(){}};globalThis.history={replaceState(){location.hash=''}};globalThis.confirm=()=>assert.fail('New beta must never automatically offer guest import');globalThis.setInterval=()=>0;globalThis.setTimeout=()=>0;
 globalThis.fetch=async(path,options={})=>{assert.notEqual(navigator.onLine,false,'No network calls while offline');requests.push({path,options});if(path==='/api/preview-config'||path==='./api/preview-config')return {ok:configStatus===200,status:configStatus,json:async()=>({supabase:{url:'https://'+project+'.supabase.co',key:'sb_publishable_synthetic'},pushServiceReady:false,gymResearchReady:ready,betaAdmissionRequired:beta,betaStorageReady:true,betaPhase:'open'})};if(path==='/api/beta-join')return join(options);if(path==='./media-manifest.json')return {ok:true,json:async()=>({exercises:[],assets:[],lookup:{}})};if(path==='/api/gym-research')return {ok:true,json:async()=>({locations:[]})};assert.fail('No external calls: '+path)};
 globalThis.FormData=class{constructor(form){this.pairs=Object.entries(form.values||{})}*[Symbol.iterator](){yield* this.pairs}getAll(){return []}has(){return false}};
 return {rows,reads,writes,requests,cacheReads,elements,authKey,async click(action,attrs={}){const button={dataset:{action,...attrs},disabled:false};for(const listener of listeners.get('click')||[])listener({target:{closest:()=>button},preventDefault(){}});await tick()},async change(attrs){for(const listener of listeners.get('change')||[])listener({target:{dataset:{},...attrs}});await tick()},async submit(id,values){const form=element(id);form.values=values;for(const listener of listeners.get('submit')||[])listener({target:form,preventDefault(){}});await tick()},async connection(connected){navigator.onLine=connected;await Promise.all((windowListeners.get(connected?'online':'offline')||[]).map(fn=>fn({})));await tick()},async storage(newValue){for(const fn of windowListeners.get('storage')||[])fn({key:authKey,newValue});await tick()},credentials(email='synthetic@example.invalid',password='synthetic-password'){element('betaEntryForm').elements={email:{value:email},password:{value:password}}},restore(){for(const [name,descriptor]of previous)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name]}};
}
async function open(t,env,{request}={}){
 let cloud,syncs=0;const accountContext=CloudSync.prototype.accountContext;
 t.mock.method(CloudSync.prototype,'accountContext',function(){cloud=this;return accountContext.call(this)});
 t.mock.method(CloudSync.prototype,'request',async function(path,options){assert.notEqual(navigator.onLine,false,'No cloud requests while offline');if(request)return request.call(this,path,options);if(path==='/auth/v1/user')return this.session.user||{id:'account-a',email:'account-a@example.invalid'};assert.fail('Unexpected Auth call '+path)});
 t.mock.method(CloudSync.prototype,'sync',async function(){if(this.disabled||!this.session||this.stopped||!this.canSync())return;syncs++});
 await import('../app.mjs?menei-entry='+encodeURIComponent(t.name+':'+(++bootSequence)));
 return {cloud:cloud||null,syncs:()=>syncs};
}

test('MENEI beta opens an email/password entry without reading saved workspaces or Site fingerprints',async t=>{
 const env=environment(),before=[...env.rows].filter(([key])=>workspaceKey(key));try{const opened=await open(t,env);assert.match(env.elements.get('app').innerHTML,/Sign in & join beta/);assert.match(env.elements.get('app').innerHTML,/Create MENEI account/);assert.doesNotMatch(env.elements.get('app').innerHTML,/ChatGPT|download|Private account-a/i);assert.deepEqual(env.reads.filter(workspaceKey),[]);assert.equal(env.reads.includes('MENEI_BETA_BROWSER_CONTEXT'),false);assert.deepEqual([...env.rows].filter(([key])=>workspaceKey(key)),before);assert.equal(opened.syncs(),0);assert.deepEqual(env.requests.map(row=>row.path),['/api/preview-config']);await env.click('view',{view:'settings'});assert.match(env.elements.get('app').innerHTML,/Sign in & join beta/)}finally{env.restore()}
});
for(const status of [503,404])test('beta config failure '+status+' never falls back to guest records',async t=>{
 const env=environment({owner:'account-a',configStatus:status}),before=[...env.rows];try{await open(t,env);assert.deepEqual(env.reads.filter(workspaceKey),[]);assert.deepEqual([...env.rows],before);assert.match(env.elements.get('app').innerHTML,/Retry connection/);assert.doesNotMatch(env.elements.get('app').innerHTML,/Private account-a|export-original/)}finally{env.restore()}
});
test('saved MENEI session joins with Bearer before opening only its account workspace',async t=>{
 const env=environment({owner:'account-a'});try{const {cloud,syncs}=await open(t,env);assert.equal(cloud.getState().ownerId,'account-a');assert.equal(syncs(),1);assert.deepEqual(env.reads.filter(workspaceKey),['MGT_BETA_V8:account-a','MGT_BETA_V8:account-a']);const request=env.requests.find(row=>row.path==='/api/beta-join');assert.equal(request.options.headers.Authorization,'Bearer synthetic-account-a');assert.equal(request.options.body,'{}');assert.equal(request.options.credentials,'same-origin');assert.equal(request.options.redirect,'error');assert.equal(env.rows.get('MGT28v6'),'retained original history');await env.click('gym');await env.click('gym-lookup');assert.doesNotMatch(env.elements.get('gymLookupResults').innerHTML,/ChatGPT|Copy research prompt/)}finally{env.restore()}
});
test('twenty-first MENEI account stays at beta-full entry without workspace reads or sync',async t=>{
 const env=environment({owner:'account-a',join:async()=>({ok:false,status:403,json:async()=>({error:'BETA_FULL',message:'untrusted server text'})})});try{const before=[...env.rows].filter(([key])=>workspaceKey(key)),{cloud,syncs}=await open(t,env);assert.match(env.elements.get('app').innerHTML,/All 20 places/);assert.ok(env.elements.get('app').innerHTML.includes(BETA_FULL_MESSAGE));assert.equal(cloud.getState(),undefined);assert.equal(syncs(),0);assert.deepEqual(env.reads.filter(workspaceKey),[]);assert.deepEqual([...env.rows].filter(([key])=>workspaceKey(key)),before);assert.ok(env.rows.has(env.authKey))}finally{env.restore()}
});
test('new account admission hides A immediately and never reads B on rejection',async t=>{
 const pending=deferred();let calls=0;const env=environment({owner:'account-a',join:async()=>++calls===1?{ok:true,json:async()=>({joined:true,role:'member'})}:pending.promise});try{const {cloud}=await open(t,env),a=env.rows.get('MGT_BETA_V8:account-a'),b=env.rows.get('MGT_BETA_V8:account-b');cloud.saveSession(session('account-b'));const changing=cloud.onAccount(cloud.session.user);await tick();assert.equal(cloud.getState(),undefined);assert.equal(cloud.canSync(),false);assert.equal(env.reads.includes('MGT_BETA_V8:account-b'),false);assert.doesNotMatch(env.elements.get('app').innerHTML,/Private account-a/);pending.resolve({ok:false,status:403,json:async()=>({error:'BETA_FULL'})});await assert.rejects(changing,/All 20 places/);assert.equal(env.rows.get('MGT_BETA_V8:account-a'),a);assert.equal(env.rows.get('MGT_BETA_V8:account-b'),b)}finally{env.restore()}
});
test('cross-tab account change clears only memory and keeps all shared account records',async t=>{
 const env=environment({owner:'account-a'});try{const {cloud}=await open(t,env),a=env.rows.get('MGT_BETA_V8:account-a'),other=JSON.stringify(session('account-b'));env.rows.set(env.authKey,other);await env.storage(other);assert.equal(cloud.getState(),undefined);assert.equal(cloud.session,null);assert.equal(env.rows.get(env.authKey),other);assert.equal(env.rows.get('MGT_BETA_V8:account-a'),a);assert.equal(env.reads.includes('MGT_BETA_V8:guest'),false);assert.match(env.elements.get('app').innerHTML,/Sign in & join beta/)}finally{env.restore()}
});
test('recovery callback requests a new password before admission and workspace access',async t=>{
 const env=environment({recovery:true});try{await open(t,env,{request:async function(path,options){if(path==='/auth/v1/user'&&options?.method==='PUT')return {};if(path==='/auth/v1/user')return {id:'account-a',email:'account-a@example.invalid'};assert.fail(path)}});assert.match(env.elements.get('app').innerHTML,/Set your new password/);assert.equal(env.requests.some(row=>row.path==='/api/beta-join'),false);assert.deepEqual(env.reads.filter(workspaceKey),[]);env.credentials();await env.click('beta-password');assert.equal(env.requests.filter(row=>row.path==='/api/beta-join').length,1);assert.equal(env.reads.includes('MGT_BETA_V8:account-a'),true)}finally{env.restore()}
});
test('sign up gives conditional confirmation and existing-account guidance inside the MENEI entry',async t=>{
 const env=environment();try{await open(t,env,{request:async path=>{if(path.startsWith('/auth/v1/signup'))return {};if(path.startsWith('/auth/v1/recover'))return {};assert.fail(path)}});env.credentials();await env.click('beta-signup');assert.match(env.elements.get('app').innerHTML,/If email confirmation is needed, check your inbox and spam folder/);assert.match(env.elements.get('app').innerHTML,/Already have a MENEI account\? Choose Sign in &amp; join beta, or Reset password/);assert.equal(env.elements.get('cloudStatus').textContent,'Signup request received.');env.credentials();await env.click('beta-reset');assert.match(env.elements.get('app').innerHTML,/Check your email for the MENEI password reset link/);assert.deepEqual(env.reads.filter(workspaceKey),[])}finally{env.restore()}
});
test('built-in gym AI refreshes the MENEI session and sends its Bearer token',async t=>{
 const env=environment({owner:'account-a',ready:true});try{const {cloud}=await open(t,env);await env.click('gym');const form=env.elements.get('gymForm');form.elements={name:{value:'Synthetic Gym'},location:{value:'Synthetic City'},address:{value:''},gymType:{value:'custom'},notes:{value:''}};form.querySelectorAll=()=>[];let refreshed=0;t.mock.method(CloudSync.prototype,'refresh',async function(){refreshed++;this.session.access_token='synthetic-refreshed'});await env.click('gym-ai-search');const request=env.requests.find(row=>row.path==='/api/gym-research');assert.ok(request);assert.equal(refreshed,1);assert.equal(request.options.headers.Authorization,'Bearer synthetic-refreshed');assert.equal(request.options.credentials,'same-origin');assert.equal(cloud.getState().ownerId,'account-a')}finally{env.restore()}
});
test('late admission response cannot load an account after sign-out',async()=>{
 const pending=deferred(),rows=new Map(),cloud=new CloudSync({storage:{getItem:k=>rows.get(k)??null,setItem:(k,v)=>rows.set(k,v)},allowedProject:project});cloud.config={url:'https://'+project+'.supabase.co',key:'sb_publishable_synthetic'};cloud.session=session('account-a');const joining=joinBetaAccount(cloud,async()=>pending.promise);await tick();cloud.accountVersion++;cloud.session=null;pending.resolve({ok:true,json:async()=>({joined:true,role:'member'})});await assert.rejects(joining,/account changed/);assert.equal(rows.size,0);
});

test('email/password sign-in admits the MENEI account without reading or importing guest records',async t=>{
 const env=environment();try{const beforeGuest=env.rows.get('MGT_BETA_V8:guest');const {cloud}=await open(t,env,{request:async path=>{if(path.includes('grant_type=password'))return session('account-b');assert.fail(path)}});env.credentials();await env.click('beta-signin');assert.equal(cloud.getState().ownerId,'account-b');assert.equal(env.reads.includes('MGT_BETA_V8:guest'),false);assert.equal(env.rows.get('MGT_BETA_V8:guest'),beforeGuest);assert.equal(env.requests.find(row=>row.path==='/api/beta-join').options.headers.Authorization,'Bearer synthetic-account-b')}finally{env.restore()}
});

test('gym search never sends an old token when account changes during token refresh',async t=>{
 const env=environment({owner:'account-a',ready:true}),pending=deferred();try{const {cloud}=await open(t,env);await env.click('gym');const form=env.elements.get('gymForm');form.elements={name:{value:'Synthetic Gym'},location:{value:'Synthetic City'},address:{value:''},gymType:{value:'custom'},notes:{value:''}};form.querySelectorAll=()=>[];t.mock.method(CloudSync.prototype,'refresh',async()=>pending.promise);await env.click('gym-ai-search');cloud.accountVersion++;cloud.session=null;await cloud.onAccount(null);pending.resolve();await tick();assert.equal(env.requests.some(row=>row.path==='/api/gym-research'),false);assert.equal(cloud.getState(),undefined);assert.equal(env.reads.includes('MGT_BETA_V8:guest'),false)}finally{env.restore()}
});

test('verified beta member reloads and edits workouts offline even with an expired cached token',async t=>{
 let env=environment({owner:'account-a',ready:true});
 try{
  const saved=JSON.parse(env.rows.get('MGT_BETA_V8:account-a')),date=C.iso();
  saved.plan[date]=C.originalDay(saved,date);
  saved.logs['2026-10-01']={...C.originalDay(saved,'2026-10-01'),status:'completed',privateHistoryField:'retain this history'};
  env.rows.set('MGT_BETA_V8:account-a',JSON.stringify(saved));
  env.rows.set('MGT_BETA_SNAPSHOTS:account-a','[{"syntheticOriginalBackup":true}]');
  await open(t,env);
  assert.deepEqual(savedBetaAdmission(localStorage,project,'account-a'),{userId:'account-a',role:'member'});
  const receiptKey=[...env.rows.keys()].find(key=>key.startsWith('MENEI_BETA_OFFLINE_ADMISSION:'));
  assert.equal(JSON.parse(env.rows.get(receiptKey)).campaign,BETA_ADMISSION_CAMPAIGN);
  const stored=new Map(env.rows),auth=JSON.parse(stored.get(env.authKey));auth.expires_at=1;stored.set(env.authKey,JSON.stringify(auth));
  const preserved=new Map([...stored].filter(([key])=>workspaceKey(key)&&key!=='MGT_BETA_V8:account-a'));
  env.restore();t.mock.restoreAll();env=environment({online:false,stored});
  const {cloud,syncs}=await open(t,env);
  assert.equal(cloud.getState().ownerId,'account-a');assert.equal(cloud.session.expires_at,1);assert.equal(cloud.stopped,true);assert.equal(cloud.canSync(),false);assert.equal(syncs(),0);assert.deepEqual(env.requests,[]);
  await env.change({dataset:{set:'0:0:w'},value:'37'});await env.change({dataset:{set:'0:0:r'},value:'9'});await env.change({dataset:{set:'0:0:done'},checked:true,type:'checkbox'});
  assert.equal(cloud.getState().logs[date].exercises[0].sets[0].w,37);assert.equal(cloud.getState().logs[date].exercises[0].sets[0].done,true);
  assert.equal(cloud.getState().logs['2026-10-01'].privateHistoryField,'retain this history');
  await env.click('gym');assert.match(env.elements.get('modalBody').innerHTML,/data-action="gym-ai-search" disabled/);await env.click('gym-ai-search');assert.deepEqual(env.requests,[]);
  assert.deepEqual(new Map([...env.rows].filter(([key])=>preserved.has(key))),preserved);
  const editedRows=new Map(env.rows);env.restore();t.mock.restoreAll();env=environment({online:false,stored:editedRows});
  const reopened=await open(t,env);assert.equal(reopened.cloud.getState().logs[date].exercises[0].sets[0].w,37);assert.equal(reopened.cloud.getState().logs[date].exercises[0].sets[0].done,true);assert.equal(reopened.syncs(),0);assert.deepEqual(env.requests,[]);
 }finally{env.restore()}
});

for(const mismatch of ['unadmitted','different-user','different-campaign','different-project','invalid-role'])test('offline '+mismatch+' beta session is denied before any workspace read',async t=>{
 const env=environment({owner:'account-a',online:false});
 try{
  if(mismatch!=='unadmitted'){
   rememberBetaAdmission(localStorage,project,{userId:mismatch==='different-user'?'account-b':'account-a',role:'member'});
   const key=[...env.rows.keys()].find(key=>key.startsWith('MENEI_BETA_OFFLINE_ADMISSION:')),receipt=JSON.parse(env.rows.get(key));
   if(mismatch==='different-campaign')receipt.campaign='old-campaign';if(mismatch==='different-project')receipt.project='other-project';if(mismatch==='invalid-role')receipt.role='admin';env.rows.set(key,JSON.stringify(receipt));
  }
  const before=[...env.rows].filter(([key])=>workspaceKey(key)),{cloud,syncs}=await open(t,env);
  assert.equal(cloud.getState(),undefined);assert.equal(cloud.stopped,true);assert.equal(syncs(),0);assert.deepEqual(env.requests,[]);assert.deepEqual(env.reads.filter(workspaceKey),[]);assert.deepEqual([...env.rows].filter(([key])=>workspaceKey(key)),before);assert.match(env.elements.get('app').innerHTML,/Reconnect/);
 }finally{env.restore()}
});

test('offline marker cannot open records with an invalid cached isolated-project connection',async t=>{
 const env=environment({owner:'account-a',online:false});try{
  rememberBetaAdmission(localStorage,project,{userId:'account-a',role:'owner'});env.rows.set('MGT_BETA_CLOUD_CONFIG:'+project,JSON.stringify({url:'https://other-project.supabase.co',key:'sb_publishable_synthetic'}));
  await open(t,env);assert.deepEqual(env.reads.filter(workspaceKey),[]);assert.deepEqual(env.requests,[]);assert.match(env.elements.get('app').innerHTML,/Reconnect/);
 }finally{env.restore()}
});

for(const failure of ['admission-403','auth-401','config-403'])test('online '+failure+' rejects and revokes an old offline receipt without opening records',async t=>{
 let env=environment({owner:'account-a',configStatus:failure==='config-403'?403:200,join:async()=>({ok:false,status:403,json:async()=>({error:'BETA_FULL'})})});
 try{
  rememberBetaAdmission(localStorage,project,{userId:'account-a',role:'member'});const before=[...env.rows].filter(([key])=>workspaceKey(key));
  await open(t,env,{request:failure==='auth-401'?async()=>{throw Object.assign(Error('MENEI session rejected'),{status:401})}:undefined});
  assert.deepEqual(env.reads.filter(workspaceKey),[]);assert.equal(savedBetaAdmission(localStorage,project,'account-a'),null);assert.deepEqual([...env.rows].filter(([key])=>workspaceKey(key)),before);
  const stored=new Map(env.rows);env.restore();t.mock.restoreAll();env=environment({online:false,stored});const offline=await open(t,env);
  assert.equal(offline.cloud.getState(),undefined);assert.equal(offline.syncs(),0);assert.deepEqual(env.requests,[]);assert.deepEqual(env.reads.filter(workspaceKey),[]);
 }finally{env.restore()}
});

test('reconnect keeps retained CloudSync online listeners paused until auth and admission succeed',async t=>{
 const pending=deferred();let joins=0,authChecks=0;const env=environment({owner:'account-a',join:async()=>++joins===1?{ok:true,json:async()=>({joined:true,role:'member'})}:pending.promise});
 try{
  const {cloud,syncs}=await open(t,env,{request:async function(path){assert.equal(path,'/auth/v1/user');authChecks++;return this.session.user}});
  await env.connection(false);assert.equal(cloud.stopped,true);assert.equal(cloud.canSync(),false);await env.click('view',{view:'settings'});await env.submit('profileForm',{name:'Saved while offline',units:'lb'});
  const connecting=env.connection(true);await tick();assert.equal(cloud.stopped,true);assert.equal(cloud.canSync(),false);assert.equal(cloud.getState(),undefined);assert.equal(syncs(),1);assert.equal(authChecks,2);
  pending.resolve({ok:true,json:async()=>({joined:true,role:'member'})});await connecting;
  assert.equal(cloud.getState().profile.name,'Saved while offline');assert.equal(cloud.stopped,false);assert.equal(cloud.canSync(),true);assert.equal(syncs(),2);assert.equal(joins,2);
 }finally{env.restore()}
});

test('reconnect denial preserves offline edits and pauses cloud without rebinding old data',async t=>{
 let joins=0;const env=environment({owner:'account-a',join:async()=>++joins===1?{ok:true,json:async()=>({joined:true,role:'member'})}:{ok:false,status:403,json:async()=>({error:'BETA_FULL'})}});
 try{
  const {cloud,syncs}=await open(t,env);await env.connection(false);await env.click('view',{view:'settings'});await env.submit('profileForm',{name:'Keep this offline edit',units:'lb'});
  const savedA=env.rows.get('MGT_BETA_V8:account-a'),savedB=env.rows.get('MGT_BETA_V8:account-b');await env.connection(true);
  assert.equal(cloud.getState(),undefined);assert.equal(cloud.stopped,true);assert.equal(cloud.canSync(),false);assert.equal(syncs(),1);assert.match(env.elements.get('app').innerHTML,/All 20 places/);assert.equal(env.rows.get('MGT_BETA_V8:account-a'),savedA);assert.equal(env.rows.get('MGT_BETA_V8:account-b'),savedB);assert.equal(env.reads.includes('MGT_BETA_V8:account-b'),false);
  const reads=env.reads.filter(workspaceKey);await env.connection(false);assert.deepEqual(env.reads.filter(workspaceKey),reads);assert.equal(cloud.getState(),undefined);
 }finally{env.restore()}
});

test('reconnect verified account transition never rebinds the prior account workspace on admission denial',async t=>{
 let authChecks=0,joins=0;const env=environment({owner:'account-a',join:async()=>++joins===1?{ok:true,json:async()=>({joined:true,role:'member'})}:{ok:false,status:403,json:async()=>({error:'BETA_FULL'})}});
 try{
  const {cloud,syncs}=await open(t,env,{request:async function(){return ++authChecks===1?this.session.user:session('account-b').user}}),savedA=env.rows.get('MGT_BETA_V8:account-a'),savedB=env.rows.get('MGT_BETA_V8:account-b');
  await env.connection(false);await env.connection(true);assert.equal(cloud.session.user.id,'account-b');assert.equal(cloud.getState(),undefined);assert.equal(cloud.stopped,true);assert.equal(syncs(),1);assert.equal(env.reads.includes('MGT_BETA_V8:account-b'),false);assert.equal(env.rows.get('MGT_BETA_V8:account-a'),savedA);assert.equal(env.rows.get('MGT_BETA_V8:account-b'),savedB);
 }finally{env.restore()}
});

test('AI cannot run offline or after a connection drops during token refresh',async t=>{
 const env=environment({owner:'account-a',ready:true}),pending=deferred();try{
  const {cloud,syncs}=await open(t,env);await env.click('gym');const form=env.elements.get('gymForm');form.elements={name:{value:'Synthetic Gym'},location:{value:'Synthetic City'},address:{value:''},gymType:{value:'custom'},notes:{value:''}};form.querySelectorAll=()=>[];
  let refreshes=0;t.mock.method(CloudSync.prototype,'refresh',async()=>{refreshes++;await pending.promise});await env.click('gym-ai-search');navigator.onLine=false;pending.resolve();await tick();assert.equal(env.requests.some(row=>row.path==='/api/gym-research'),false);assert.equal(cloud.canSync(),false);await cloud.sync();assert.equal(syncs(),1);
  await env.click('gym-ai-search');assert.equal(refreshes,1);assert.equal(env.requests.some(row=>row.path==='/api/gym-research'),false);
 }finally{env.restore()}
});

test('offline beta renders preserved exercise photo bindings from CacheStorage without a network request',async t=>{
 const saved=C.defaultState(),date=C.iso();saved.ownerId='account-a';saved.nutrition.setupPromptSeen=true;saved.plan[date]=C.originalDay(saved,date);
 const name=saved.plan[date].exercises[0].name,manifest={exercises:[{id:'retained-photo',name,aliases:[],startPath:'media/preserved-start.webp'}],assets:[],lookup:{[C.norm(name)]:'retained-photo'}},before=JSON.stringify(manifest);
 const env=environment({owner:'account-a',online:false,cachedManifest:manifest});try{
  env.rows.set('MGT_BETA_V8:account-a',JSON.stringify(saved));rememberBetaAdmission(localStorage,project,{userId:'account-a',role:'member'});const {cloud,syncs}=await open(t,env);
  assert.match(env.elements.get('app').innerHTML,/src="\.\/media\/preserved-start.webp"/);assert.deepEqual(env.cacheReads,['https://synthetic.example.invalid/media-manifest.json']);assert.deepEqual(env.requests,[]);assert.equal(cloud.stopped,true);assert.equal(syncs(),0);assert.equal(JSON.stringify(manifest),before);
 }finally{env.restore()}
});

test('admitted MENEI settings cannot invalidate admission through legacy sign-in or signup actions',async t=>{
 let authChecks=0;const env=environment({owner:'account-a',ready:true});try{
  const {cloud,syncs}=await open(t,env,{request:async function(path){assert.equal(path,'/auth/v1/user');authChecks++;return this.session.user}});await env.click('view',{view:'settings'});
  assert.doesNotMatch(env.elements.get('app').innerHTML,/data-action="(?:signin|signup)"/);assert.match(env.elements.get('app').innerHTML,/To switch accounts, sign out/);assert.match(env.elements.get('app').innerHTML,/data-action="signout"/);assert.match(env.elements.get('app').innerHTML,/data-action="reset-password"/);
  const version=cloud.accountVersion;await env.click('signin');await env.click('signup');assert.equal(cloud.accountVersion,version);assert.equal(cloud.canSync(),true);assert.equal(cloud.getState().ownerId,'account-a');assert.equal(authChecks,1);assert.equal(syncs(),1);
 }finally{env.restore()}
});

test('existing preview mode retains its Settings sign-in and create-account controls',async t=>{
 const env=environment({owner:'account-a',beta:false});try{await open(t,env);await env.click('view',{view:'settings'});assert.match(env.elements.get('app').innerHTML,/data-action="signin"/);assert.match(env.elements.get('app').innerHTML,/data-action="signup"/)}finally{env.restore()}
});
