import test from 'node:test';
import assert from 'node:assert/strict';
import {buildProgress,progressRecords,estimateStrength,progressPanel,compactProgress} from '../progress.mjs';

const catalog=[{id:'press',name:'Bench press',loadMode:'total',repUnit:'reps'}];
const set=(w,r,extra={})=>({w,r,rir:2,done:true,role:'working',...extra});
const log=(date,sets,extra={})=>({date,gymId:'a',status:'completed',exercises:[{exerciseId:'press',name:'Bench press',sets}],...extra});
const state=(logs,extra={})=>({logs,gyms:[{id:'a',name:'Gym A'},{id:'b',name:'Gym B'}],profile:{units:'lb'},customExercises:[],...extra});
const model=(s,filters={})=>buildProgress(s,catalog,{period:'all',...filters},'2026-10-18');

test('more reps at the same load raise the combined trend; an actual single remains the logged weight',()=>{
 const s=state({'2026-10-01':log('2026-10-01',[set(100,8)]),'2026-10-08':log('2026-10-08',[set(100,10)])}),m=model(s);
 assert.equal(m.points.length,2);assert.ok(m.change>0);assert.equal(m.latest.set.w,100);assert.equal(m.latest.set.r,10);
 assert.equal(estimateStrength(100,1),100);assert.equal(estimateStrength(100,11),null);assert.equal(estimateStrength(0,8),null);
});
test('unchecked work, warm-up, drop, ramp and back-off sets never inflate the graph',()=>{
 const s=state({'2026-10-01':log('2026-10-01',[set(100,8),...['warmup','drop','ramp','backoff'].map(role=>set(900,10,{role})),set(999,10,{done:false}),set('',10),set(90,''),set(100,Infinity)])});
 assert.equal(model(s).latest.set.w,100);assert.equal(model(s,{metric:'volume'}).latest.value,800);
});
test('gym and straight/superset history stay separate and filters never alter saved history',()=>{
 const a=log('2026-10-01',[set(100,8)]),b=log('2026-10-08',[set(400,10)],{gymId:'b'}),c=log('2026-10-12',[set(60,8)]);c.exercises[0].supersetId='pair';
 const s=state({'2026-10-01':a,'2026-10-08':b,'2026-10-12':c}),before=structuredClone(s);
 const straight=model(s,{gym:'a',format:'straight'});assert.deepEqual(straight.points.map(p=>p.date),['2026-10-01']);
 const paired=model(s,{gym:'a',format:'superset'});assert.deepEqual(paired.points.map(p=>p.date),['2026-10-12']);
 assert.equal(model(s,{gym:'b'}).latest.set.w,400);assert.deepEqual(s,before);
});
test('preserved duplicate versions, deleted logs, skipped workouts and future dates do not become trend points',()=>{
 const canonical=log('2026-10-01',[set(100,8)]),s=state({'2026-10-01':canonical,'2026-10-01~backup':log('2026-10-01',[set(999,10)]),'2026-10-02':log('2026-10-02',[set(999,10)],{deleted:true}),'2026-10-03':log('2026-10-03',[set(999,10)],{status:'skipped'}),'2027-01-01':log('2027-01-01',[set(999,10)])});
 assert.equal(model(s).points.length,1);assert.equal(model(s).latest.set.w,100);
 assert.doesNotMatch(progressPanel(model(s)),/chartLine/);assert.match(progressPanel(model(s)),/Log another session/);
});
test('period boundaries and actual logged dates are respected, and decreases remain decreases',()=>{
 const s=state({'2026-09-18':log('2026-09-18',[set(200,10)]),'2026-09-19':log('2026-09-19',[set(120,10)]),'2026-10-18':log('2026-10-18',[set(100,8)])});
 const m=model(s,{period:'30'});assert.equal(m.points.length,2);assert.equal(m.points[0].date,'2026-09-19');assert.ok(m.change<0);assert.match(progressPanel(m),/−/);
});
test('per-hand loads stay per hand for strength but count both hands in volume; kilogram labels are retained',()=>{
 const s=state({'2026-10-01':log('2026-10-01',[set(40,10),set(40,8)])},{profile:{units:'kg'}});s.logs['2026-10-01'].exercises[0].loadMode='perHand';
 assert.equal(model(s,{metric:'volume'}).latest.value,1440);assert.equal(model(s,{metric:'weight'}).latest.value,40);
 assert.match(progressPanel(model(s,{metric:'reps'})),/40 kg \/ hand × 10/);
});
test('assistance uses the lowest counterweight, bodyweight uses reps, timed exercise uses seconds, and none invents a max',()=>{
 for(const [mode,repUnit,metric,value]of [['assistance','reps','weight',40],['bodyweight','reps','reps',10],['total','seconds','reps',10]]){
  const s=state({'2026-10-01':log('2026-10-01',[set(60,8),set(40,10)])});s.logs['2026-10-01'].exercises[0].loadMode=mode;
  const m=buildProgress(s,[{...catalog[0],repUnit}],{period:'all'},'2026-10-18');assert.equal(m.selection.metric,metric);assert.equal(m.latest.value,value);assert.ok(!m.metrics.some(([id])=>id==='strength'));
 }
});
test('high-rep sessions still offer real load, reps and volume without extending the 1RM estimate range',()=>{
 const s=state({'2026-10-01':log('2026-10-01',[set(75,15)])});assert.equal(model(s).points.length,0);
 assert.equal(model(s,{metric:'reps'}).latest.value,15);assert.equal(model(s,{metric:'weight'}).latest.value,75);
});
test('empty history is honest, custom and legacy exercises are discoverable, and labels are escaped',()=>{
 assert.match(compactProgress(model(state({}))),/Log your first working sets/);
 const s=state({'2026-10-01':log('2026-10-01',[set(80,8)]),'2026-10-08':log('2026-10-08',[set(80,10)])});
 for(const l of Object.values(s.logs)){delete l.exercises[0].exerciseId;l.exercises[0].id=Math.random().toString();l.exercises[0].name='<script>custom</script>'}
 const m=model(s);assert.equal(m.exercises.length,1);assert.equal(m.points.length,2);assert.doesNotMatch(progressPanel(m),/<script>/);assert.match(progressPanel(m),/&lt;script&gt;/);
 s.logs['bad-date']=log('bad-date',[set(200,8)]);assert.equal(progressRecords(s).length,2);
});
test('graph has an accessible label, focusable point links, units and an exact session-data table',()=>{
 const m=model(state({'2026-10-01':log('2026-10-01',[set(100,8)])})),html=progressPanel(m);
 assert.match(html,/role="img" aria-label=/);assert.match(html,/data-action="progress-point"/);assert.match(html,/<caption/);assert.match(html,/scope="col"/);assert.match(html,/100 × 8/);
});
test('the default exercise favors usable recent history over a long inactive archive',()=>{
 const s=state({'2026-01-01':log('2026-01-01',[set(100,8)]),'2026-01-08':log('2026-01-08',[set(100,10)]),'2026-10-01':log('2026-10-01',[set(40,8)])});
 s.logs['2026-10-01'].exercises[0].exerciseId='curl';s.logs['2026-10-01'].exercises[0].name='Curl';
 const m=buildProgress(s,catalog,{},'2026-10-18');assert.equal(m.selection.exercise,'curl');assert.equal(m.points.length,1);
});
test('null or omitted loads are incomplete; a real zero-load bodyweight set remains valid',()=>{
 const s=state({'2026-10-01':log('2026-10-01',[set(null,8),set(undefined,8),set(0,10)])});
 assert.equal(model(s,{metric:'reps'}).latest.set.w,0);assert.equal(model(s,{metric:'reps'}).latest.sets.length,1);
});
