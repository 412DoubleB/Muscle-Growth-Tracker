import {withoutCompletionTiming} from './session-order.mjs?v=8.2.0';
import {supersetGroups,autoSupersets,entered} from './supersets.mjs?v=8.2.0';
import * as C from './core.mjs?v=8.2.0';
import {LEGACY_PLAN} from './legacy.mjs?v=8.2.0';

export const hasEntries=d=>!!d&&!d.deleted&&(d.status==='completed'||d.status==='skipped'||d.run?.done||d.sauna?.done||(d.exercises||[]).some(entered));
// Preparation is a day-level display choice, not a working set. Carry only this
// choice when replacing an unstarted workout; never copy its old exercise rows.
export function carryWarmupRoutine(previous,next){
  const result=C.clone(next),routine=previous&&!previous.deleted?previous.warmupRoutine:null;
  if(routine&&typeof routine==='object'&&!Array.isArray(routine)&&typeof routine.enabled==='boolean')result.warmupRoutine=C.clone(routine);
  return result;
}
export function programDayProtection(state,date){
  const records=[state.logs[date],C.expandPlanDay(state.plan[date])].filter(d=>d&&!d.deleted);
  if(records.some(d=>(d.exercises||[]).some(entered)))return 'Gym entries are already saved, including any load, band setting, reps, RIR or checked set.';
  if(records.some(d=>d.status==='completed'||d.status==='skipped'))return 'This workout is completed or skipped.';
  if(records.some(d=>d.run?.done||d.sauna?.done))return 'Completed running or sauna entries stay preserved too.';
  return '';
}
// Generation previews protect entered plan records as well as entered logs.
// The real workspace is never changed while reviewing new program options.
export function programGenerationState(state){
  const scratch=C.clone(state);
  for(const [date,packed] of Object.entries(state.plan))if(hasEntries(C.expandPlanDay(packed))&&!hasEntries(scratch.logs[date]))scratch.logs[date]=C.clone(C.expandPlanDay(packed));
  return scratch;
}
export function workoutChoices(state){
  const seen=new Set(),out=[];
  LEGACY_PLAN.forEach((p,i)=>{if(!seen.has(p[0])){seen.add(p[0]);out.push({id:'legacy:'+i,title:p[0],group:'Original v6 workouts'})}});
  for(const r of state.routines||[])if(!r.deleted)out.push({id:'routine:'+r.id,title:r.name,group:'Saved routines'});
  for(const [date,d] of Object.entries(state.plan||{}))if(!d.deleted&&!seen.has(d.title)){seen.add(d.title);out.push({id:'plan:'+date,title:d.title,group:'Generated workouts'})}
  return out;
}
function fresh(day,date,gymId){const d=C.clone(day);delete d.deleted;delete d.status;delete d.completedAt;return C.touch({...d,id:date,date,gymId,exercises:(d.exercises||[]).map(e=>({...e,id:C.uid(),sets:e.sets.map(s=>({...withoutCompletionTiming(s),id:C.uid(),w:'',r:'',rir:'',done:false}))})),run:d.run?{...d.run,done:false}:null,sauna:d.sauna?{...d.sauna,done:false}:null})}
export function workoutFromChoice(state,choice,date,gymId){
  if(choice==='keep')return C.clone(C.dayFor(state,date));
  if(choice==='auto'){
    const scratch=C.clone(state);delete scratch.logs[date];scratch.training={...scratch.training,frequency:7,restWeekdays:[]};
    const gym=scratch.gyms.find(g=>g.id===gymId&&!g.deleted);if(!gym)throw Error('Choose an active gym.');
    scratch.gymSchedules=[];scratch.training.defaultGym=gymId;
    return C.generateProgram(scratch,{start:date,days:1}).days[0];
  }
  const option=workoutChoices(state).find(o=>o.id===choice);if(!option)throw Error('Choose an available workout from the list.');
  const [type,...parts]=choice.split(':'),key=parts.join(':');let day;
  if(type==='legacy')day=C.originalDay(state,C.addDays('2026-10-01',+key));
  if(type==='routine'){const r=state.routines.find(r=>r.id===key&&!r.deleted);day={title:r.name,kind:'strength',exercises:r.exercises,notes:[],sauna:{minutes:+state.training.saunaMinutes||20,done:false}}}
  if(type==='plan')day=C.expandPlanDay(state.plan[key]);
  const chosen=fresh(day,date,gymId);return state.training.supersetMode==='supersets'?autoSupersets(chosen,e=>C.exerciseFor(e.exerciseId)||state.customExercises.find(x=>x.id===e.exerciseId),+state.training.restSeconds||60):chosen;
}
function equipmentNotes(state,day){const gym=state.gyms.find(g=>g.id===day.gymId);day.notes=(day.notes||[]).filter(n=>!n.startsWith('Equipment to check:'));for(const e of day.exercises){const cat=C.exerciseFor(e.exerciseId)||state.customExercises.find(x=>x.id===e.exerciseId);const missing=C.missingEquipment(cat,gym);if(missing.length)day.notes.push('Equipment to check: '+e.name+' — '+missing.join(', '))}}
// Validate only fresh automatic output. Existing short workouts, routines and
// recorded history keep their original size and are never repaired implicitly.
function reviewAutomaticWorkouts(days){
  const issues=days.filter(day=>day.kind==='strength'&&(day.exercises.length<6||day.exercises.length>9)).map(day=>({date:day.date,gymId:day.gymId,title:day.title,count:day.exercises.length,plannedExerciseCount:day.plannedExerciseCount??day.exercises.length,notes:C.clone(day.notes||[])}));
  if(!issues.length)return;
  const first=issues[0],error=Error('Automatic workouts need 6–9 exercises. '+first.date+' has '+first.count+' of '+first.plannedExerciseCount+' planned exercises. Review the gym inventory or exclusions before saving; no records were changed.');
  error.code='AUTOMATIC_WORKOUT_REVIEW';error.issues=issues;throw error;
}
export function editSession(state,from,{choice='keep',date=from,gymId,adjust='keep',runMinutes,saunaMinutes}={}){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||C.iso(C.dateOf(date))!==date)throw Error('Choose a valid workout date.');
  if(!['keep','swap-next','regenerate'].includes(adjust))throw Error('Choose a calendar adjustment.');
  const old=C.dayFor(state,from);if(old.status==='completed')throw Error('Unlock this completed day to edit it.');
  if(!state.gyms.some(g=>g.id===gymId&&!g.deleted))throw Error('Choose an active gym.');
  if(date!==from&&hasEntries(C.dayFor(state,date)))throw Error('The destination contains entered or completed work. Choose another date; no records were changed.');
  const next=C.clone(state),notices=[];let chosen=choice==='keep'?C.clone(old):carryWarmupRoutine(old,workoutFromChoice(state,choice,date,gymId));
  if(choice==='auto')reviewAutomaticWorkouts([chosen]);
  if(choice!=='keep'&&hasEntries(old)){const key=from+'~edit-'+C.uid();next.logs[key]={...C.clone(old),id:key};notices.push('The previous entered workout is preserved in History.')}
  let swapDate=null;
  if(adjust==='swap-next'&&date===from&&choice!=='keep')for(let i=1;i<=28;i++){const d=C.addDays(from,i),candidate=C.dayFor(state,d);if(candidate.title===chosen.title&&!hasEntries(candidate)){swapDate=d;break}}
  if(adjust==='swap-next'&&date===from&&choice!=='keep'&&!swapDate)notices.push('No matching unfinished workout in the next 28 days; only this session changed.');
  if(date!==from||swapDate){const target=date!==from?date:swapDate;
    const displaced=date!==from?C.dayFor(state,date):old;
    const back=fresh(displaced,date!==from?from:swapDate,C.scheduledGym(state,date!==from?from:swapDate)?.id);
    equipmentNotes(state,back);next.logs[back.date]=back;
    if(swapDate)notices.push('Swapped with '+swapDate+'.');
    if(date!==from)notices.push('The destination workout moved to '+from+'.');
  }
  chosen=C.touch({...chosen,id:date,date,gymId});
  if(runMinutes!==undefined)chosen.run=+runMinutes?{minutes:+runMinutes,done:choice==='keep'&&!!chosen.run?.done}:null;
  if(saunaMinutes!==undefined)chosen.sauna=+saunaMinutes?{minutes:+saunaMinutes,done:choice==='keep'&&!!chosen.sauna?.done}:null;
  if(!chosen.exercises.length)chosen.kind=chosen.run?'run':'rest';
  equipmentNotes(state,chosen);next.logs[date]=chosen;
  if(adjust==='regenerate'){
    const result=C.generateProgram(next,{start:C.addDays(date,1),days:28});
    reviewAutomaticWorkouts(result.days);
    for(const d of result.days)if(!hasEntries(next.logs[d.date])){
      const previous=next.logs[d.date]&&!next.logs[d.date].deleted?next.logs[d.date]:C.expandPlanDay(next.plan[d.date]);
      next.logs[d.date]=carryWarmupRoutine(previous,d);
    }
    notices.push('Rebuilt '+result.days.length+' future days; entered sessions were protected.');
    notices.push(...result.warnings);
  }
  return {state:next,date,notices};
}

// Planning estimate, not elapsed exercise time or a claim about an individual's pace.
export function estimateWorkoutDuration(day,catalog=C.CATALOG){
 const exercises=day.exercises||[],groups=supersetGroups(day),paired=new Set(groups.flatMap(g=>g.members.map(m=>m.index)));
 const active=e=>{const meta=catalog.find(c=>c.id===e.exerciseId)||e,[lo,hi]=C.rangeOf(e.range||meta.range||'8-10'),count=(lo+hi)/2;return (e.sets||[]).reduce((n,s)=>n+(meta.repUnit==='seconds'?count:meta.repUnit==='metres'?count/.8:Math.max(15,count*3)),0)};
 let seconds=exercises.length?300+Math.max(0,exercises.length-1)*60:0;
 exercises.forEach((e,i)=>{seconds+=active(e);if(!paired.has(i)){const count=e.sets?.length||0;seconds+=Math.max(0,count-1)*60+(count?180:0)}});
 for(const g of groups){const counts=g.members.map(m=>m.exercise.sets?.length||0);seconds+=Math.max(0,counts.reduce((a,b)=>a+b,0)-1)*60;if(counts.every(Boolean))seconds+=180;}
 const liftingMinutes=Math.ceil(seconds/60),minutes=item=>Number.isFinite(+item?.minutes)&&+item.minutes>0?+item.minutes:0,runMinutes=minutes(day.run),saunaMinutes=minutes(day.sauna),totalMinutes=liftingMinutes+runMinutes+saunaMinutes;
 return {liftingMinutes,runMinutes,saunaMinutes,totalMinutes,lowMinutes:Math.floor(totalMinutes*.8),highMinutes:Math.ceil(totalMinutes*1.2)};
}
