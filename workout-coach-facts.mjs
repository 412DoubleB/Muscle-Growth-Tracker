import * as C from './core.mjs?v=8.2.0';
import {sessionTimeline} from './session-order.mjs?v=8.2.0';
import {muscleFamilies,progressionContext} from './supersets.mjs?v=8.2.0';
import {resolveLoadSetup} from './equipment-loads.mjs?v=8.2.0';
import {COACH_EVIDENCE_VERSION} from './coach-evidence.mjs?v=8.2.0';

export const COACH_FACTS_VERSION=1;
const MAX_EXERCISES=12,MAX_SETS=12,MAX_FINDINGS=4;
const primary=role=>['working','top'].includes(role);
const number=value=>(typeof value==='number'||typeof value==='string'&&value.trim()!=='')&&Number.isFinite(+value)?+value:null;
const nonnegative=value=>{const n=number(value);return n!==null&&n>=0?n:null};
const positive=value=>{const n=number(value);return n!==null&&n>0?n:null};
const rir=value=>{const n=nonnegative(value);return n!==null&&n<=10?n:null};
const text=(value,max=120)=>typeof value==='string'?value.replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max):'';
const round=value=>Math.round(value*100)/100;
const oneOf=(value,choices,fallback)=>choices.includes(value)?value:fallback;
const roles=['working','top','warmup','ramp','backoff','drop'];
const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
function instant(value){
 if(typeof value!=='string')return null;
 const match=value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/);
 if(!match||!validDate(match[1])||+match[2]>23||+match[3]>59||+match[4]>59)return null;
 const zone=match[6],offset=zone==='Z'?0:(+zone.slice(1,3)*60+ +zone.slice(4))*(zone[0]==='-'?-1:1);
 if(zone!=='Z'&&(+zone.slice(4)>59||Math.abs(offset)>14*60))return null;
 const ms=Date.parse(value);if(!Number.isFinite(ms))return null;
 const local=new Date(ms+offset*60000).toISOString().slice(0,23),expected=`${match[1]}T${match[2]}:${match[3]}:${match[4]}.${(match[5]||'').padEnd(3,'0')}`;
 return local===expected?{raw:value,ms}:null;
}
const definition=(state,exercise)=>C.exerciseFor(exercise.exerciseId||exercise.name)||state.customExercises?.find(item=>item&&!item.deleted&&(item.id===exercise.exerciseId||!exercise.exerciseId&&C.norm(item.name)===C.norm(exercise.name)))||null;
const isManual=(exercise,meta)=>C.usesManualProgression(exercise,meta)||['seconds','metres'].includes(meta?.repUnit||exercise.repUnit)||['bodyweight','band'].includes(meta?.loadMode||exercise.loadMode);
function setFacts(set,index,unit,manual,mode='total'){
 const count=positive(set?.r),weight=nonnegative(set?.w),validCount=count!==null&&(unit!=='reps'||Number.isInteger(count));
 return {setIndex:index,role:oneOf(set?.role,roles,'working'),done:set?.done===true,valid:set?.done===true&&validCount&&(manual||weight!==null),weight:manual?null:weight,addedWeight:mode==='bodyweight'?weight:null,reps:count,rir:rir(set?.rir),band:text(set?.band,80)||null,checkedAt:instant(set?.checkedAt)?.raw||null};
}
function canonicalLogs(state){
 return Object.fromEntries(Object.entries(state.logs||{}).filter(([key,log])=>validDate(key)&&log&&key===log.date&&log.id===log.date&&!log.deleted&&log.status!=='skipped'));
}
function timingFacts(log,exercises){
 // Keep set indices intact while excluding invalid count/load rows from order.
 const safeLog={...log,exercises:(log.exercises||[]).slice(0,MAX_EXERCISES).map((exercise,i)=>({...exercise,sets:(exercise.sets||[]).slice(0,MAX_SETS).map((set,j)=>({...set,role:exercises[i]?.sets[j]?.role||'working',w:exercises[i]?.manualProgression?0:set.w,done:exercises[i]?.sets[j]?.valid===true&&instant(set.checkedAt)!==null}))}))};
 const timeline=sessionTimeline(safeLog),end=instant(log.completedAt),events=timeline.sets.filter(item=>instant(item.raw)),first=events[0],last=events.at(-1),notes=[];
 const validChecked=exercises.flatMap(e=>e.sets.filter(s=>s.valid)),working=validChecked.filter(s=>primary(s.role));
 let elapsedMinutes=null,chronologyReliable=true;
 if(!first)notes.push('No valid Done timestamps were recorded, so actual set order and a logged workout window are unavailable.');
 if(!end)notes.push('A valid workout-completion timestamp is unavailable.');
 if(end&&last&&end.ms<last.ms){chronologyReliable=false;notes.push('A Done timestamp occurs after workout completion. Clock inconsistency prevents a reliable order or duration estimate.');}
 if(end&&first&&chronologyReliable){const span=end.ms-first.ms;if(span>=0&&span<=24*60*60*1000)elapsedMinutes=round(span/60000);else {chronologyReliable=false;notes.push('Checks and completion span more than one day; a reliable workout window is unavailable.');}}
 if(elapsedMinutes!==null)notes.push('Logged workout-window estimate: first checked set to workout completion. Time before the first check and active training time are not measured; pauses are included.');
 const knownWorkingChecks=events.filter(item=>item.working).length,unknownChecks=Math.max(0,validChecked.length-events.length),unknownWorkingChecks=Math.max(0,working.length-knownWorkingChecks);
 if(unknownChecks)notes.push(`${unknownChecks} checked ${unknownChecks===1?'set has':'sets have'} no usable timestamp. Planned row order cannot fill in actual order.`);
 if(events.some((item,i)=>i>0&&item.ms===events[i-1].ms))notes.push('Some check times are tied. Their relative sequence is unknown.');
 const order=chronologyReliable?timeline.exercises.map(item=>({exerciseKey:exercises[item.index].exerciseKey,name:exercises[item.index].name,rank:item.position,firstCheckAt:item.first.raw,tied:item.tied})):[];
 const ordered=chronologyReliable?events.map(item=>({exerciseKey:exercises[item.index].exerciseKey,setIndex:item.setIndex,role:oneOf(item.role,roles,'working'),checkedAt:item.raw,rank:1+events.filter(other=>other.ms<item.ms).length,tied:events.some(other=>other!==item&&other.ms===item.ms)})):[];
 return {timing:{firstCheckAt:first?.raw||null,lastCheckAt:last?.raw||null,completedAt:end?.raw||null,elapsedMinutes,knownChecks:events.length,unknownChecks,knownWorkingChecks,unknownWorkingChecks,chronologyReliable,notes},order,events:ordered};
}
function setupFacts(state,exercise,gym,meta){
 if(!gym||gym.deleted||!meta||!Array.isArray(meta.equipmentRequirements)||meta.needsVariantSelection)return null;
 const setup=resolveLoadSetup(state,exercise,gym,meta);
 return {kind:setup.kind,step:setup.step,minimum:setup.minimum,plates:setup.plates.slice(0,12),sides:setup.sides,configured:setup.configured,unit:setup.unit,perHand:setup.perHand};
}
function previousFacts(state,exercise,date,gym,meta,manual,unit){
 const prior=C.lastHistory(state,exercise,date,gym?.id);if(!prior)return null;
 const mode=meta?.loadMode||exercise.loadMode,sets=(prior.sets||[]).slice(0,MAX_SETS).map((s,i)=>setFacts(s,i,unit,manual,mode)).filter(s=>s.valid);
 if(!sets.length)return null;
 const currentBands=[...new Set((exercise.sets||[]).filter(s=>s.done&&primary(s.role)).map(s=>text(s.band,80)).filter(Boolean))].sort();
 const oldBands=[...new Set(sets.map(s=>s.band).filter(Boolean))].sort();
 const sameRange=JSON.stringify(C.rangeOf(exercise.range))===JSON.stringify(C.rangeOf(prior.exercise.range)),sameBands=mode!=='band'||currentBands.length>0&&JSON.stringify(currentBands)===JSON.stringify(oldBands),comparable=sameRange&&sameBands;
 const time=sessionTimeline(prior.log),position=time.exercises.find(item=>item.index===prior.log.exercises.indexOf(prior.exercise));
 return {date:prior.log.date,gymId:text(prior.log.gymId,100),sameGym:prior.log.gymId===gym?.id,format:text(progressionContext(prior.exercise),32),range:text(prior.exercise.range,32),setType:oneOf(prior.exercise.setType,['straight','top','ramp','drop'],'straight'),comparable,reason:comparable?'Same exercise, repetition range and comparable session format; compare effort, placement and setup too.':!sameRange?'The selected repetition range changed; these records do not establish like-for-like target performance.':'Recorded band settings differ or are incomplete; resistance is not comparable.',sets,order:position?{rank:position.position,tied:position.tied,earlierWorkingSets:position.earlierSets.length,unknownWorkingChecks:time.unknownWorking}:null};
}
function nextFacts(state,exercise,date,gym,meta,manual,unit,setup){
 const loadMode=oneOf(meta?.loadMode||exercise.loadMode,['total','perHand','assistance','bodyweight','band'],'total');
 const base={mode:'unavailable',weight:null,reps:null,unit:state.profile?.units==='kg'?'kg':'lb',repUnit:unit,range:text(exercise.range||meta?.range,32),loadMode,reason:'Check the exercise variation and available equipment before choosing the next session load.',setup};
 if(manual)return {...base,mode:'manual',reason:loadMode==='band'?'Keep the band brand, level and setup consistent. Build controlled repetitions before deliberately choosing a harder band; tension is not converted to weight.':unit==='seconds'?'Build a comfortable controlled hold within the recorded seconds range. No added weight is inferred.':unit==='metres'?'Build comfortable controlled distance while keeping the setup consistent. Distance is not treated as a repetition count for weight increases.':'Build controlled repetitions and comfortable technique in this bodyweight variation. No body mass or added load is inferred.'};
 if(!setup||!C.supports(meta,gym))return base;
 const currentWork=C.completedSets(exercise);if(!currentWork.length||currentWork.some(s=>!Number.isInteger(+s.r)))return {...base,reason:'There are no valid checked whole-repetition working/top sets in this session to establish a next-session load.'};
 try{
  const result=C.progression(state,exercise,C.addDays(date,1),gym);
  const weight=nonnegative(result.weight),reps=positive(result.reps);
  const numeric=weight!==null&&reps!==null&&Number.isInteger(reps);return {...base,mode:numeric?'numeric':'unavailable',weight:numeric?weight:null,reps:numeric?reps:null,reason:text(result.reason,600),basisDate:result.previous?.date||null};
 }catch{return base}
}
function buildExercise(state,exercise,index,date,gym){
 const meta=definition(state,exercise),unit=oneOf(meta?.repUnit||exercise.repUnit,['reps','seconds','metres'],'reps'),manual=isManual(exercise,meta),mode=oneOf(meta?.loadMode||exercise.loadMode,['total','perHand','assistance','bodyweight','band'],'total'),sets=(exercise.sets||[]).slice(0,MAX_SETS).map((s,i)=>setFacts(s,i,unit,manual,mode)),checked=sets.filter(s=>s.valid),work=checked.filter(s=>primary(s.role));
 const setup=setupFacts(state,exercise,gym,meta),comparison=previousFacts(state,exercise,date,gym,meta,manual,unit);
 return {exerciseKey:`exercise-${index+1}`,exerciseId:text(meta?.id||exercise.exerciseId,100)||null,name:text(meta?.name||exercise.name,100)||'Unnamed exercise',group:text(meta?.group,40)||'Unknown',primary:text(meta?.primary,160),secondary:text(meta?.secondary,160),loadMode:mode,repUnit:unit,manualProgression:manual,format:text(progressionContext(exercise),32),setType:oneOf(exercise.setType,['straight','top','ramp','drop'],'straight'),range:text(exercise.range||meta?.range,32),targetRir:rir(exercise.targetRir)??rir(state.training?.targetRir)??2,sets,plannedWorkingSets:sets.filter(s=>primary(s.role)).length,checkedWorkingSets:work.length,checkedSets:checked.length,missingRir:work.filter(s=>s.rir===null).length,workingVolume:!manual&&unit==='reps'&&!['bodyweight','band','assistance'].includes(mode)?round(work.reduce((sum,s)=>sum+s.weight*s.reps*(mode==='perHand'?2:1),0)):null,equipmentAvailable:!!setup&&C.supports(meta,gym),loadSetup:setup,comparison,nextSession:nextFacts(state,exercise,date,gym,meta,manual,unit,setup)};
}
function nextPlanned(state,date,exercises,runOnly){
 const target=new Set(exercises.flatMap(e=>[...muscleFamilies(e.primary)]));
 if(!target.size&&!runOnly)return null;
 for(let offset=1;offset<=28;offset++){
  const nextDate=C.addDays(date,offset);let day;try{day=C.dayFor(state,nextDate)}catch{return null}
  if(!day||day.deleted||['completed','skipped'].includes(day.status))continue;
  const items=(Array.isArray(day.exercises)?day.exercises:[]).slice(0,MAX_EXERCISES).map(e=>definition(state,e)),groups=[...new Set(items.filter(Boolean).map(e=>text(e.group,40)).filter(Boolean))],overlap=items.some(meta=>meta&&[...muscleFamilies(meta.primary)].some(group=>target.has(group)));
  if(runOnly?!day.run:!overlap)continue;
  return {date:nextDate,title:text(day.title,100)||'Planned session',kind:oneOf(day.kind,['strength','run','rest'],'strength'),groups,exerciseIds:items.map(e=>text(e?.id,100)).filter(Boolean),planned:true};
 }
 return null;
}
const add=(section,id,value)=>{if(section.length<MAX_FINDINGS)section.push({id,text:text(value,700)});};
const loadLabel=e=>e.loadMode==='perHand'?`${e.nextSession.unit} per hand`:e.loadMode==='assistance'?`${e.nextSession.unit} assistance`:e.nextSession.unit;
const actualText=(e,s)=>`${s.weight} ${loadLabel(e)} × ${s.reps} reps at ${s.rir===null?'unknown':s.rir} RIR`;
function loadResponsesFor(e,events,date){
 if(e.manualProgression||e.repUnit!=='reps')return [];
 const [lo,hi]=C.rangeOf(e.range),out=[],timed=events.filter(item=>item.exerciseKey===e.exerciseKey&&primary(item.role)&&!item.tied).map(item=>e.sets[item.setIndex]).filter(s=>s.valid),work=e.sets.filter(s=>s.valid&&primary(s.role));
 const point=(s,day)=>({setIndex:s.setIndex,weight:s.weight,reps:s.reps,rir:s.rir,date:day,checkedAt:s.checkedAt});
 const addResponse=(kind,basis,from,to,message)=>{
  if(out.length>=3)return;
  const delta=from?(to.weight-from.weight)*(e.loadMode==='assistance'?-1:1):null;
  out.push({kind,basis,from:from?point(from,basis==='previous-workout'?e.comparison.date:date):null,to:point(to,date),harderLoadDelta:delta===null?null:round(delta),repDelta:from?round(to.reps-from.reps):null,rirDelta:from&&from.rir!==null&&to.rir!==null?round(to.rir-from.rir):null,text:text(message,600)});
 };
 const compare=(from,to,basis)=>{
  if(from.role!==to.role||from.rir===null||to.rir===null)return;
  const harder=(to.weight-from.weight)*(e.loadMode==='assistance'?-1:1),prefix=basis==='previous-workout'?`Compared with the same recorded working-set row on ${e.comparison.date}`:'Across successive timed working sets';
  if(harder>0&&(to.reps<from.reps||to.rir<from.rir)){
   const overshot=to.reps<lo||to.rir<e.targetRir;
   addResponse(overshot?'harder-load-overshot-target':'harder-load-in-range',basis,from,to,`${e.name}: ${prefix}, ${actualText(e,from)} changed to ${actualText(e,to)}. ${overshot?`The harder load coincided with ${to.reps<lo?'reps below the selected range':'less reserve than the chosen target'} and may have exceeded this session’s target. Consider rebuilding reps or a smaller equipment-compatible change.`:'The harder load reduced reps or reserve but stayed within the selected rep range and effort target. Fewer reps alone do not show that the increase was excessive.'} This comparison does not isolate the effects of load from recovery, exercise order or technique.`);
  }else if(harder<0&&(to.reps>from.reps||to.rir>from.rir)){
   addResponse('lower-load-response',basis,from,to,`${e.name}: ${prefix}, ${actualText(e,from)} changed to ${actualText(e,to)}. The easier load coincided with more reps or reserve; that can help rebuild the chosen target. It does not by itself prove better recovery or diagnose fatigue.`);
  }
 };
 // A known pair is not necessarily successive when another checked working set
 // lacks timing. Never fill a missing timestamp with planned row order.
 if(work.length===timed.length)for(let i=1;i<timed.length;i++)compare(timed[i-1],timed[i],'within-workout');
 const old=e.comparison;
 if(old?.comparable&&out.length<3){
  // Same ordinal role is a conservative comparison, rather than picking the
  // previous best set. Different placement remains an explicit uncertainty.
  for(const role of ['working','top']){
   const current=work.filter(s=>s.role===role),previous=old.sets.filter(s=>s.role===role);
   for(let i=0;i<Math.min(current.length,previous.length)&&out.length<3;i++)compare(previous[i],current[i],'previous-workout');
  }
 }
 // Capacity is an observed effort estimate. It never earns a blanket increase:
 // the separate existing progression checks all required sets and equipment.
 const spare=work.find(s=>s.reps>=hi&&s.rir!==null&&s.rir>e.targetRir);
 if(spare){
  if(out.length===3&&!out.some(x=>x.kind==='spare-capacity'))out.pop();
  addResponse('spare-capacity','current-set',null,spare,`${e.name}: set ${spare.setIndex+1} recorded ${actualText(e,spare)}, ${spare.reps>hi?`${spare.reps-hi} reps above`:'at the top of'} the ${lo}–${hi} range and ${round(spare.rir-e.targetRir)} more estimated RIR than the chosen ${e.targetRir} RIR target. This suggests spare capacity in that set. An increase still depends on all required working sets, reliable effort entries and an appropriate equipment increment.`);
 }
 return out;
}
function findingsFor(exercises,timing,events,upcoming,run){
 const out={pros:[],cons:[],fatigue:[],nextSession:[]},planned=exercises.reduce((n,e)=>n+e.plannedWorkingSets,0),checked=exercises.reduce((n,e)=>n+e.checkedWorkingSets,0),missing=exercises.reduce((n,e)=>n+e.missingRir,0);
 if(checked)add(out.pros,'recorded-working-sets',`You recorded ${checked} valid checked working/top ${checked===1?'set':'sets'} across ${exercises.filter(e=>e.checkedWorkingSets).length} ${exercises.filter(e=>e.checkedWorkingSets).length===1?'exercise':'exercises'}.`);
 if(planned>checked)add(out.cons,'incomplete-working-record',`${planned-checked} of ${planned} planned working/top sets do not have a valid checked entry. A completed workout can still contain partial logging; this report does not assume those sets were performed.`);
 if(missing)add(out.cons,'missing-effort-record',`${missing} checked working/top ${missing===1?'set has':'sets have'} no valid RIR. Those sets do not establish how much effort remained or earn a load increase from missing effort data.`);
 const below=[],zero=[];
 for(const e of exercises){
  const [lo]=C.rangeOf(e.range),work=e.sets.filter(s=>s.valid&&primary(s.role));
  if(e.repUnit==='reps'&&work.some(s=>s.reps<lo))below.push(e.name);
  if(work.some(s=>s.rir===0))zero.push(e.name);
  const responses=e.loadResponses||[];
  const overshot=responses.find(response=>response.kind==='harder-load-overshot-target'),spare=responses.find(response=>response.kind==='spare-capacity');
  if(overshot)add(out.cons,`load-response-${e.exerciseKey}`,overshot.text);
  if(spare)add(out.pros,`spare-capacity-${e.exerciseKey}`,spare.text);
  const old=e.comparison;
  if(old?.comparable&&work.length&&old.sets.length){
   const comparable=(a,b)=>a.role===b.role&&(e.manualProgression?e.loadMode==='band'?!!a.band&&a.band===b.band:e.loadMode==='bodyweight'?a.addedWeight===b.addedWeight:true:a.weight===b.weight);
   const match=work.find(s=>{const previous=old.sets.filter(p=>comparable(s,p));return previous.length&&s.reps>Math.max(...previous.map(p=>p.reps))});
   if(match){const prior=old.sets.filter(p=>comparable(match,p)).sort((a,b)=>b.reps-a.reps)[0];add(out.pros,`more-counts-${e.exerciseKey}`,`${e.name}: you recorded ${match.reps} ${e.repUnit} versus the prior best of ${prior.reps} on ${old.date}${e.manualProgression?' in the comparable recorded setup':` at the same logged load (${match.weight} ${loadLabel(e)})`}. Compare effort and technique before treating this as a strength gain.`);}
  }
  if(e.manualProgression||e.repUnit!=='reps')continue;
  const timed=events.filter(event=>event.exerciseKey===e.exerciseKey&&primary(event.role)&&!event.tied).map(event=>({event,set:e.sets[event.setIndex]}));
  if(timed.length!==work.length)continue;
  let signal=null;
  // Same-load fatigue evidence must be contiguous. A deliberate harder load
  // between two same-load entries changes the context and starts a new run.
  for(let i=0;i<timed.length-2&&!signal;i++){
   const first=timed[i],same=[first];
   for(let j=i+1;j<timed.length&&timed[j].set.role===first.set.role&&timed[j].set.weight===first.set.weight;j++)same.push(timed[j]);
   if(same.length<3)continue;
   const last=same.at(-1),ordered=same.every((x,j)=>j===0||x.set.reps<=same[j-1].set.reps),effortConsistent=first.set.rir===null||last.set.rir===null||last.set.rir<=first.set.rir;
   if(ordered&&first.set.reps-last.set.reps>=2&&effortConsistent){const decline=same.find((x,j)=>j>0&&x.set.reps<same[j-1].set.reps);signal={first,last,decline};}
  }
  if(signal)add(out.fatigue,`possible-fatigue-${e.exerciseKey}`,`${e.name}: timed comparable working sets fell from ${signal.first.set.reps} to ${signal.last.set.reps} reps at the same logged ${e.loadMode==='assistance'?'assistance':'load'}. The first recorded drop was checked on set ${signal.decline.set.setIndex+1} (${signal.decline.event.checkedAt}). This can be consistent with fatigue, but the checks do not measure physiological fatigue or its exact onset.${signal.first.set.rir===null||signal.last.set.rir===null?' Some RIR is unknown, so effort cannot be confirmed.':''}`);
 }
 if(below.length)add(out.cons,'below-chosen-range',`${below.slice(0,3).join(', ')} included checked working/top reps below the selected range. Review load, effort and recovery rather than forcing an increase.`);
 if(zero.length)add(out.cons,'zero-rir-recorded',`${zero.slice(0,3).join(', ')} included a recorded 0 RIR. That means no more repetitions were estimated to remain; it does not prove a failed repetition or poor technique.`);
 if(!out.fatigue.length)add(out.fatigue,'fatigue-not-established','The record does not establish where fatigue began. Comparable repeated-set performance and check times can suggest a pattern, but these logs do not measure fatigue.');
 if(run?.markedDone)add(out.pros,'run-marked-complete',`You marked the ${run.plannedMinutes===null?'scheduled':`${run.plannedMinutes}-minute scheduled`} run complete. The scheduled duration is not a measured running time; pace and heart-rate data are not present.`);
 if(upcoming)add(out.nextSession,'next-planned-muscle-session',`The currently planned next ${run&&!exercises.length?'run':'session sharing trained primary muscles'} is ${upcoming.date}: ${upcoming.title}. This is a plan, not a change to it; review recovery and equipment when you arrive.`);
 for(const e of exercises){if(e.nextSession.mode==='numeric')add(out.nextSession,`next-load-${e.exerciseKey}`,`${e.name}: the existing equipment-aware progression suggests ${e.nextSession.weight} ${e.nextSession.unit}${e.loadMode==='perHand'?' per hand':e.loadMode==='assistance'?' assistance':''} for ${e.nextSession.reps} reps. ${e.nextSession.reason}`);}
 const manual=exercises.find(e=>e.nextSession.mode==='manual');if(manual)add(out.nextSession,`next-manual-${manual.exerciseKey}`,`${manual.name}: ${manual.nextSession.reason}`);
 if(out.fatigue.some(f=>f.id.startsWith('possible-fatigue-')))add(out.nextSession,'priority-and-recovery','At the next session for these muscles, keep goal-priority work early when equipment allows. Preserve controlled repetitions and enough recovery to maintain the chosen effort; no plan or timer is changed by this report.');
 if(!checked&&!run?.markedDone)add(out.cons,'no-assessable-training','There are no valid checked working/top sets or marked-complete run entries to assess. Missing entries are not evidence of poor performance.');
 return out;
}

export function buildWorkoutCoachFacts(state,date){
 if(!state||!validDate(date))throw Error('Choose a valid completed workout date.');
 const log=state.logs?.[date];if(!log||log.deleted||log.status!=='completed'||log.date!==date||log.id!==date)throw Error('Complete this workout before opening its coach report.');
 const safeState={...state,logs:canonicalLogs(state)},gym=state.gyms?.find(g=>g.id===log.gymId&&!g.deleted),raw=Array.isArray(log.exercises)?log.exercises:[],exercises=raw.slice(0,MAX_EXERCISES).map((exercise,index)=>buildExercise(safeState,exercise,index,date,gym)),{timing,order,events}=timingFacts(log,exercises),style=oneOf(log.trainingStyle||state.training?.trainingStyle,['hypertrophy','strength','endurance'],'hypertrophy');
 const run=log.run?{markedDone:log.run.done===true,plannedMinutes:positive(log.run.minutes),type:text(log.run.type,80)||'Scheduled run'}:null;
 for(const e of exercises)e.loadResponses=loadResponsesFor(e,events,date);
 const upcoming=nextPlanned(safeState,date,exercises,!!run&&!exercises.length),limitations=['This report describes logged entries and selected published guidance, not a measured diagnosis or a survey of every fitness-industry opinion.','Form, pain, physiological fatigue, active duration and actual inter-set rest are not measured by these entries.','Reopening a saved report should show its original snapshot; later edits or changed plans can make that snapshot out of date.'];
 if(exercises.some(e=>e.missingRir))limitations.push('Some effort entries are missing. Missing RIR is unknown, not zero or proof that a load increase is earned.');
 if(timing.unknownChecks)limitations.push('Some Done timestamps are missing or invalid. Known times do not establish a complete session sequence.');
 if(!timing.chronologyReliable)limitations.push('Clock inconsistency prevents reliable chronological conclusions.');
 if(raw.length>MAX_EXERCISES||raw.some(e=>(e.sets||[]).length>MAX_SETS))limitations.push('The report is bounded to the first 12 exercises and 12 sets per exercise; additional entries are not analyzed.');
 if(exercises.some(e=>!e.comparison))limitations.push('Some exercises have no comparable prior checked working sets. A first record is a starting point, not evidence of improvement.');
 const facts={version:COACH_FACTS_VERSION,evidenceVersion:COACH_EVIDENCE_VERSION,workout:{id:date,date,status:'completed',title:text(log.title,120)||'Completed workout',kind:oneOf(log.kind,['strength','run','rest'],'strength'),units:state.profile?.units==='kg'?'kg':'lb',goal:oneOf(state.training?.planGoal,['general','muscle','strength','endurance'],style==='hypertrophy'?'muscle':style),trainingStyle:style,experience:oneOf(state.training?.planExperience||state.training?.experience,['Beginner','Returning','Intermediate','Advanced'],'Intermediate'),run},timing,order,events,exercises,upcoming,findings:findingsFor(exercises,timing,events,upcoming,run),limitations,context:{gymId:text(log.gymId,100)||null,training:{split:text(state.training?.split,32),frequency:nonnegative(state.training?.frequency),targetRir:rir(state.training?.targetRir),movementLevel:oneOf(state.training?.movementLevel,['supported','standard','advanced'],'standard'),allowFloorWork:state.training?.allowFloorWork!==false},bounds:{exercises:MAX_EXERCISES,setsPerExercise:MAX_SETS},plannedExerciseCount:raw.length}};
 const bytes=()=>new TextEncoder().encode(JSON.stringify(facts)).length;
 if(bytes()>32000){
  facts.limitations.push('Detailed prior-set comparisons were omitted to keep this review compact. Load-response observations retain their recorded comparison points.');
  for(const e of facts.exercises)e.comparison=null;
 }
 if(bytes()>32000){
  facts.limitations.push('Additional exercises were omitted from this bounded report. The workout and its complete saved entries are unchanged.');
  while(bytes()>32000&&facts.exercises.length>1){
   facts.exercises.pop();const keys=new Set(facts.exercises.map(e=>e.exerciseKey));
   facts.order=facts.order.filter(item=>keys.has(item.exerciseKey));facts.events=facts.events.filter(item=>keys.has(item.exerciseKey));
   facts.findings=findingsFor(facts.exercises,facts.timing,facts.events,facts.upcoming,run);
  }
 }
 return facts;
}
