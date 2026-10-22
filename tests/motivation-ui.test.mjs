import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';
const date='2027-01-04';
function environment({reduced=false,loaded=true}={}){
 const names=['document','localStorage','sessionStorage','window','navigator','location','history','confirm','setInterval','setTimeout','clearTimeout','fetch','FormData'];
 const previous=new Map(names.map(n=>[n,Object.getOwnPropertyDescriptor(globalThis,n)]));
 const state=C.defaultState();state.profile.safetyNoticeVersion=1;state.nutrition.setupPromptSeen=true;
 const day=(d,status='completed')=>({id:d,date:d,title:'Synthetic consistency session',kind:'strength',gymId:'crunch',status,exercises:[{...C.makeExercise(C.exerciseFor('Plank'),{count:1}),sets:[{id:'synthetic-set',role:'working',w:0,r:30.5,rir:2,rest:17,done:true,unknown:'retain'}]}]});
 state.logs={'2027-01-01':day('2027-01-01'),'2027-01-03':day('2027-01-03'),[date]:day(date,'in-progress'),'2027-01-03~copy':day('2027-01-03')};state.plan={'2027-01-02':{id:'2027-01-02',date:'2027-01-02',kind:'rest',exercises:[]}};const legacy=C.defaultState(),legacyRaw=JSON.stringify(legacy);state.legacySnapshots=[{id:String(C.hash(legacyRaw)),data:legacy},{id:'private-retained',data:{unchanged:0}}];
 const rows=new Map([['MGT_BETA_V8:guest',JSON.stringify(state)],['MGT28v6',legacyRaw]]),elements=new Map(),listeners=new Map(),requests=[],timers=new Map();let timerId=0;
 class Element{constructor(id){Object.assign(this,{id,innerHTML:'',textContent:'',value:'',open:false,hidden:false,complete:loaded,naturalWidth:1024,dataset:{},classes:new Set(),events:new Map()});this.classList={add:c=>this.classes.add(c),remove:c=>this.classes.delete(c),toggle(){}}}addEventListener(n,fn){this.events.set(n,fn)}showModal(){this.open=true}close(){this.open=false}focus(){}}
 const element=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)};
 globalThis.document={documentElement:{dataset:{preview:'local'}},activeElement:{tagName:'BODY'},hidden:false,getElementById:element,addEventListener:(n,fn)=>listeners.set(n,[...(listeners.get(n)||[]),fn]),querySelector:s=>s==='dialog[open]'&&element('modal').open?element('modal'):null,querySelectorAll:()=>[]};
 globalThis.localStorage={getItem:k=>rows.get(k)??null,setItem:(k,v)=>rows.set(k,String(v)),removeItem(){assert.fail('No stored history may be removed')}};globalThis.sessionStorage={getItem:()=>null,setItem(){},removeItem(){}};
 globalThis.window={addEventListener(){},scrollTo(){},matchMedia:()=>({matches:reduced,addEventListener(){}})};Object.defineProperty(globalThis,'navigator',{value:{onLine:true,vibrate(){}},configurable:true});globalThis.location={origin:'https://synthetic.example.invalid',pathname:'/',search:'',hash:'',href:'https://synthetic.example.invalid/'};globalThis.history={replaceState(){}};globalThis.confirm=()=>true;globalThis.setInterval=()=>0;globalThis.setTimeout=(fn,ms)=>{timers.set(++timerId,{fn,ms});return timerId};globalThis.clearTimeout=id=>timers.delete(id);
 globalThis.fetch=async path=>{requests.push(path);assert.ok(['./config.json','./media-manifest.json'].includes(path));return {ok:true,json:async()=>path==='./config.json'?{}:{exercises:[],assets:[],lookup:{}}}};
 globalThis.FormData=class{constructor(form){this.pairs=Object.entries(form.values||{}).flatMap(([k,v])=>Array.isArray(v)?v.map(x=>[k,String(x)]):[[k,String(v)]])}getAll(k){return this.pairs.filter(x=>x[0]===k).map(x=>x[1])}has(k){return this.pairs.some(x=>x[0]===k)}[Symbol.iterator](){return this.pairs[Symbol.iterator]()}};
 return {rows,elements,requests,element,legacyRaw,fireTimer(ms){const entry=[...timers].find(([,v])=>v.ms===ms);assert.ok(entry,'Expected timer '+ms);timers.delete(entry[0]);entry[1].fn()},async event(name,event){for(const fn of listeners.get(name)||[])fn(event);await new Promise(r=>setImmediate(r))},get html(){return element('app').innerHTML},get state(){return JSON.parse(rows.get('MGT_BETA_V8:guest'))},async click(action,data={}){for(const fn of listeners.get('click')||[])fn({target:{closest:()=>({dataset:{action,...data},disabled:false})},preventDefault(){}});await new Promise(r=>setImmediate(r))},async submit(values){for(const fn of listeners.get('submit')||[])fn({target:{id:'generatorForm',values,dataset:{}},preventDefault(){}});await new Promise(r=>setImmediate(r))},restore(){for(const [n,d]of previous)if(d)Object.defineProperty(globalThis,n,d);else delete globalThis[n]}};
}
test('opening survives Home redraws, waits for art, runs 4.5 seconds, closes automatically and only replays on request',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment({loaded:false});try{
  await import('../app.mjs?motivation-ui=home');const scene=env.element('openingScene'),before=[...env.rows];
  assert.match(env.html,/Training day streak/);assert.match(env.html,/>2<span> training days in a row/);assert.ok(env.html.indexOf('Daily motivation')<env.html.indexOf('meneiHero'));assert.match(env.html,/<blockquote class="dailyQuote">[^<]+/);
  assert.equal(scene.open,true);assert.equal(scene.classes.has('playing'),false);assert.match(scene.innerHTML,/openingWord">MENEI/);assert.match(scene.innerHTML,/openingEmblem/);assert.match(scene.innerHTML,/openingUpper/);assert.match(scene.innerHTML,/Daily motivation/);
  const content=scene.innerHTML;assert.match(content,/openingWreathLeft/);assert.match(content,/openingWreathRight/);assert.match(content,/openingThrow/);assert.match(content,/openingBall/);assert.match(content,/greek-wall-ball-atlas.png/);
  env.element('openingUpper').events.get('load')();assert.equal(scene.classes.has('playing'),false);env.element('openingAtlas').events.get('load')();assert.equal(scene.classes.has('playing'),true);
  await env.click('view',{view:'nutrition'});await env.click('view',{view:'today'});assert.equal(scene.innerHTML,content);assert.equal(scene.open,true);assert.deepEqual([...env.rows],before);
  env.fireTimer(4500);assert.equal(scene.open,false);await env.click('view',{view:'today'});assert.equal(scene.open,false);
  await env.click('replay-opening');assert.equal(scene.open,true);await env.click('skip-launch');assert.equal(scene.open,false);env.element('openingUpper').events.get('load')();assert.equal(scene.open,false);
  await env.click('streak-details');assert.match(env.element('modalBody').innerHTML,/rest days preserve/);assert.deepEqual([...env.rows],before);assert.deepEqual(env.requests,['./config.json','./media-manifest.json']);
 }finally{env.restore()}
});
test('late artwork from a skipped opening cannot start its replacement before both new images are ready',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment({loaded:false});try{
  await import('../app.mjs?motivation-ui=stale-atlas');const stale=env.element('openingAtlas').events.get('load');await env.click('skip-launch');await env.click('replay-opening');
  stale();env.element('openingUpper').events.get('load')();assert.equal(env.element('openingScene').classes.has('playing'),false);
  env.element('openingAtlas').events.get('load')();assert.equal(env.element('openingScene').classes.has('playing'),true);env.fireTimer(4500);assert.equal(env.element('openingScene').open,false);
 }finally{env.restore()}
});
test('reduced motion skips launch while keeping daily motivation and all records',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment({reduced:true});try{
  await import('../app.mjs?motivation-ui=reduced');const before=[...env.rows];assert.equal(env.element('openingScene').open,false);assert.match(env.html,/Daily motivation/);await env.click('replay-opening');assert.equal(env.element('openingScene').open,false);assert.deepEqual([...env.rows],before);
 }finally{env.restore()}
});
test('failed artwork and expired background launch dismiss without trapping the app',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment({loaded:false});try{
  await import('../app.mjs?motivation-ui=launch-fallback');env.fireTimer(5000);assert.equal(env.element('openingScene').open,false);
  await env.click('replay-opening');env.element('openingUpper').events.get('error')();assert.equal(env.element('openingScene').open,false);
  await env.click('replay-opening');env.element('openingUpper').events.get('load')();env.element('openingAtlas').events.get('load')();t.mock.timers.tick(4501);await env.event('visibilitychange',{});assert.equal(env.element('openingScene').open,false);assert.match(env.html,/Daily motivation/);
 }finally{env.restore()}
});
test('completing a genuine workout celebrates a new milestone once per date and preserves other history and checked values',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment();try{
  await import('../app.mjs?motivation-ui=milestone');const before=env.state;await env.click('complete');assert.equal(env.state.logs[date].status,'completed');assert.match(env.element('modalBody').innerHTML,/3 training days in a row/);assert.equal(env.rows.get('MGT_BETA_STREAK_NOTICE:guest'),date);
  for(const key of ['2027-01-01','2027-01-03','2027-01-03~copy'])assert.deepEqual(env.state.logs[key],before.logs[key]);assert.deepEqual(env.state.logs[date].exercises,before.logs[date].exercises);assert.deepEqual(env.state.legacySnapshots,before.legacySnapshots);
  await env.click('close-modal');await env.click('unlock');await env.click('complete');assert.equal(env.element('modal').open,false);assert.equal(env.rows.get('MGT28v6'),env.legacyRaw);
 }finally{env.restore()}
});
test('strength and hypertrophy program previews accept the fixed 60-second rest without bypassing set/rep constraints or writing plans',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(date+'T12:00:00Z').getTime()});const env=environment();try{
  await import('../app.mjs?motivation-ui=rest-validation');const before=env.state;
  for(const [focus,sets,range]of [['strength',4,'1-5'],['hypertrophy',3,'8-10']]){
   await env.submit({start:date,days:28,frequency:4,experience:'Intermediate',split:'upper-lower',trainingStyle:focus,sets,range,restSeconds:60,defaultGym:'crunch',minRepeatDays:14,runEvery:2,saunaMinutes:20,restWeekdays:[0]});assert.match(env.element('modalBody').innerHTML,/data-action="apply-program"/);await env.click('close-modal');
  }
  await env.submit({start:date,days:28,frequency:4,experience:'Intermediate',split:'upper-lower',trainingStyle:'strength',sets:1,range:'8-10',restSeconds:60,defaultGym:'crunch'});assert.match(env.element('toast').textContent,/For Strength/);assert.deepEqual(env.state.plan,before.plan);assert.deepEqual(env.state.logs,before.logs);
 }finally{env.restore()}
});
