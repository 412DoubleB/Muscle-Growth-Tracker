import test from 'node:test';
import assert from 'node:assert/strict';
import {CloudSync} from '../cloud.mjs';
import {defaultState} from '../core.mjs';

const project='bhyrrxrpqaxiwpfxnwpa',url='https://'+project+'.supabase.co';
const configKey='MGT_BETA_CLOUD_CONFIG:'+project,authKey='MGT_BETA_AUTH:'+project;
const memory=()=>{const rows=new Map();return {rows,getItem:key=>rows.get(key)??null,setItem:(key,value)=>rows.set(key,String(value)),removeItem:key=>rows.delete(key)}};
const session={access_token:'synthetic-test-token',refresh_token:'synthetic-refresh',expires_at:Date.now()/1000+3600,user:{id:'test-user'}};
const response=data=>({ok:true,status:200,text:async()=>JSON.stringify(data)});

test('test preview isolates credentials and sync bases without deleting the old workspace',async()=>{
 const storage=memory(),state=defaultState();state.ownerId=session.user.id;
 storage.setItem('MGT_BETA_CLOUD_CONFIG',JSON.stringify({url:'https://other.supabase.co',key:'sb_publishable_other'}));
 storage.setItem('MGT_BETA_AUTH',JSON.stringify({...session,user:{id:'old-user'}}));
 storage.setItem('MGT_BETA_V8:old-user','preserved synthetic old workspace');
 storage.setItem('MGT_BETA_SYNC_BASE:test-user','preserved old sync base');
 const before=[...storage.rows],requests=[];
 const cloud=new CloudSync({storage,allowedProject:project,getState:()=>state,applyState:value=>Object.assign(state,value),fetcher:async(request,options)=>{requests.push({request,options});return response(request.includes('mgt_beta_states')?[]:request.includes('mgt_beta_commit')?{version:1}:null)}});
 assert.equal(cloud.config,null);assert.equal(cloud.session,null);
 cloud.configure(url,'sb_publishable_synthetic');cloud.saveSession(session);await cloud.sync();
 assert.equal(requests.length,2);assert.ok(requests.every(request=>request.request.startsWith(url+'/')));assert.ok(requests.every(request=>request.options.redirect==='error'&&request.options.credentials==='omit'));
 assert.equal(JSON.parse(storage.getItem('MGT_BETA_SYNC_BASE:'+project+':test-user')).version,1);
 await cloud.signOut();assert.equal(storage.getItem(authKey),null);
 for(const [key,value]of before)assert.equal(storage.getItem(key),value);
 cloud.stop();
});

test('test preview rejects other projects even if its in-memory connection is altered',async()=>{
 const storage=memory();let calls=0;
 const cloud=new CloudSync({storage,allowedProject:project,fetcher:async()=>{calls++;return response(null)}});
 assert.throws(()=>cloud.configure('https://other.supabase.co','sb_publishable_synthetic'),/isolated test project/);
 cloud.configure(url,'sb_publishable_synthetic');
 await assert.rejects(cloud.request('@other.example.invalid/auth',{auth:false}),/request target/);
 cloud.config.url='https://other.supabase.co';
 await assert.rejects(cloud.request('/auth/v1/signup',{auth:false}),/isolated test project/);
 await assert.rejects(cloud.legacyBackup(),/disabled/);
 await assert.rejects(cloud.savePush({},{}),/disabled/);
 await assert.rejects(cloud.removePush('synthetic'),/disabled/);
 assert.equal(calls,0);cloud.stop();
});

test('only matching project-scoped configuration can restore a saved test session',()=>{
 for(const savedUrl of [url,'https://other.supabase.co']){
  const storage=memory();storage.setItem(configKey,JSON.stringify({url:savedUrl,key:'sb_publishable_synthetic'}));storage.setItem(authKey,JSON.stringify(session));
  const before=[...storage.rows],cloud=new CloudSync({storage,allowedProject:project});
  assert.equal(cloud.session?.user?.id||null,savedUrl===url?'test-user':null);
  assert.deepEqual([...storage.rows],before);cloud.stop();
 }
});

function environment(config,{savedAccount=false,projectAttribute=project}={}){
 const names=['document','localStorage','sessionStorage','window','navigator','location','history','confirm','setInterval','setTimeout','fetch','PushManager'];
 const previous=new Map(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
 const storage=memory(),elements=new Map(),listeners=new Map(),requests=[];
 const state=defaultState();state.nutrition.setupPromptSeen=true;state.profile.name='Synthetic saved account';state.ownerId=savedAccount?'test-user':null;
 state.logs['2026-10-01']={id:'2026-10-01',date:'2026-10-01',title:'Synthetic retained log',kind:'rest',status:'completed',gymId:'crunch',exercises:[]};
 storage.setItem('MGT_BETA_V8:'+(savedAccount?'test-user':'guest'),JSON.stringify(state));
 storage.setItem('MGT_BETA_CLOUD_CONFIG',JSON.stringify({url:'https://other.supabase.co',key:'sb_publishable_other'}));
 storage.setItem('MGT_BETA_AUTH',JSON.stringify({...session,user:{id:'old-user'}}));
 if(savedAccount){storage.setItem(configKey,JSON.stringify({url,key:'sb_publishable_synthetic'}));storage.setItem(authKey,JSON.stringify(session))}
 class Element{
  constructor(id){Object.assign(this,{id,innerHTML:'',textContent:'',value:'',open:false,dataset:{},elements:{},classList:{add(){},remove(){}}})}
  addEventListener(){}showModal(){this.open=true}close(){this.open=false}focus(){}
 }
 globalThis.document={documentElement:{dataset:{preview:'test-cloud',testProject:projectAttribute}},getElementById:id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)},activeElement:{tagName:'BODY'},hidden:false,addEventListener:(name,fn)=>listeners.set(name,[...(listeners.get(name)||[]),fn]),querySelector:()=>null,querySelectorAll:()=>[]};
 globalThis.localStorage=storage;globalThis.sessionStorage=memory();globalThis.window={addEventListener(){},scrollTo(){}};
 Object.defineProperty(globalThis,'navigator',{value:{onLine:true,vibrate(){}},configurable:true});
 globalThis.location={origin:'https://synthetic.example.invalid',pathname:'/',href:'https://synthetic.example.invalid/',hash:'',search:''};
 globalThis.history={replaceState(){}};globalThis.confirm=()=>false;globalThis.setInterval=()=>0;globalThis.setTimeout=()=>0;
 globalThis.fetch=async(request,options)=>{requests.push({request,options});if(request==='./config.json')return {ok:config!==null,json:async()=>config};if(request==='./media-manifest.json')return {ok:true,json:async()=>({exercises:[],assets:[],lookup:{}})};assert.ok(request.startsWith(url+'/'),'Only the isolated project may receive a request');return response(request.includes('/auth/v1/token')?session:request.includes('mgt_beta_states')?[]:request.includes('mgt_beta_commit')?{version:1}:null)};
 return {storage,state,requests,elements,async click(action,data={}){const button={dataset:{action,...data},disabled:false};for(const listener of listeners.get('click')||[])listener({target:{closest:()=>button},preventDefault(){}});await new Promise(resolve=>setImmediate(resolve))},restore(){for(const [name,descriptor]of previous)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name]}};
}

test('test-cloud account controls use runtime configuration, hide credentials and skip push on logout',async()=>{
 const env=environment({supabase:{url,key:'sb_publishable_synthetic'},pushServiceReady:false});
 const oldConfig=env.storage.getItem('MGT_BETA_CLOUD_CONFIG'),oldAuth=env.storage.getItem('MGT_BETA_AUTH');
 try{
  await import('../app.mjs?test-cloud=account');await env.click('view',{view:'settings'});
  const settings=env.elements.get('app').innerHTML;
  assert.match(settings,/separate private beta test account/);assert.match(settings,/data-action="signup"/);assert.match(settings,/data-action="reset-password"/);assert.match(settings,/data-action="sync"/);
  assert.doesNotMatch(settings,/Advanced connection settings|name="key"|name="url"|data-action="legacy-cloud"|id="reminderForm"|data-action="enable-push"/);
  document.getElementById('cloudForm').elements={email:{value:'synthetic@example.invalid'},password:{value:'synthetic-password'}};
  await env.click('signin');assert.equal(JSON.parse(env.storage.getItem(authKey)).user.id,'test-user');
  assert.ok(env.requests.some(request=>request.request.startsWith(url+'/auth/v1/token')));
  globalThis.PushManager=function(){};
  navigator.serviceWorker={get ready(){throw Error('Logout must not access push subscriptions')}};
  await env.click('signout');assert.equal(env.storage.getItem(authKey),null);
  assert.equal(env.storage.getItem('MGT_BETA_CLOUD_CONFIG'),oldConfig);assert.equal(env.storage.getItem('MGT_BETA_AUTH'),oldAuth);
  assert.ok(!env.requests.some(request=>request.request.includes('mgt_beta_push')));
  assert.equal(env.elements.get('toast')?.textContent||'','');
 }finally{env.restore()}
});

test('unavailable or mismatched runtime configuration keeps saved test history accessible without cloud calls',async t=>{
 for(const [name,config,projectAttribute]of [['offline',null,project],['wrong-url',{supabase:{url:'https://other.supabase.co',key:'sb_publishable_synthetic'},pushServiceReady:false},project],['wrong-pin',{supabase:{url,key:'sb_publishable_synthetic'},pushServiceReady:false},'other']])await t.test(name,async()=>{
  const env=environment(config,{savedAccount:true,projectAttribute});
  try{
   await import('../app.mjs?test-cloud='+name);await env.click('view',{view:'settings'});
   assert.doesNotMatch(env.elements.get('app').innerHTML,/could not open/);
   assert.match(env.elements.get('cloudStatus').textContent,/Test cloud unavailable/);
   const saved=JSON.parse(env.storage.getItem('MGT_BETA_V8:test-user'));assert.deepEqual(saved.logs,env.state.logs);
   if(name!=='wrong-pin')assert.match(env.elements.get('app').innerHTML,/Synthetic saved account/);
   assert.equal(env.requests.filter(request=>request.request.startsWith('https:')).length,0);
   await env.click('enable-push');assert.match(env.elements.get('toast').textContent,/disabled/);
   assert.equal(env.requests.filter(request=>request.request.startsWith('https:')).length,0);
  }finally{env.restore()}
 });
});
