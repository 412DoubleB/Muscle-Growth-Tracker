import * as C from './core.mjs?v=8.1.1';
import {LEGACY_PLAN} from './legacy.mjs?v=8.1.1';

export const hasEntries=d=>!!d&&!d.deleted&&(d.status==='completed'||d.status==='skipped'||d.run?.done||d.sauna?.done||(d.exercises||[]).some(e=>e.sets?.some(s=>s.done||s.w!==''&&s.w!=null||s.r!==''&&s.r!=null||s.rir!==''&&s.rir!=null)));
export function workoutChoices(state){
  const seen=new Set(),out=[];
  LEGACY_PLAN.forEach((p,i)=>{if(!seen.has(p[0])){seen.add(p[0]);out.push({id:'legacy:'+i,title:p[0],group:'Original v6 workouts'})}});
  for(const r of state.routines||[])if(!r.deleted)out.push({id:'routine:'+r.id,title:r.name,group:'Saved routines'});
  for(const [date,d] of Object.entries(state.plan||{}))if(!d.deleted&&!seen.has(d.title)){seen.add(d.title);out.push({id:'plan:'+date,title:d.title,group:'Generated workouts'})}
  return out;
}
function fresh(day,date,gymId){const d=C.clone(day);delete d.deleted;delete d.status;delete d.completedAt;return C.touch({...d,id:date,date,gymId,exercises:(d.exercises||[]).map(e=>({...e,id:C.uid(),sets:e.sets.map(s=>({...s,id:C.uid(),w:'',r:'',rir:'',done:false}))})),run:d.run?{...d.run,done:false}:null,sauna:d.sauna?{...d.sauna,done:false}:null})}
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
  return fresh(day,date,gymId);
}
function equipmentNotes(state,day){const gym=state.gyms.find(g=>g.id===day.gymId);day.notes=(day.notes||[]).filter(n=>!n.startsWith('Equipment to check:'));for(const e of day.exercises){const cat=C.exerciseFor(e.exerciseId)||state.customExercises.find(x=>x.id===e.exerciseId);const missing=C.missingEquipment(cat,gym);if(missing.length)day.notes.push('Equipment to check: '+e.name+' — '+missing.join(', '))}}
export function editSession(state,from,{choice='keep',date=from,gymId,adjust='keep',runMinutes,saunaMinutes}={}){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||C.iso(C.dateOf(date))!==date)throw Error('Choose a valid workout date.');
  if(!['keep','swap-next','regenerate'].includes(adjust))throw Error('Choose a calendar adjustment.');
  const old=C.dayFor(state,from);if(old.status==='completed')throw Error('Unlock this completed day to edit it.');
  if(!state.gyms.some(g=>g.id===gymId&&!g.deleted))throw Error('Choose an active gym.');
  if(date!==from&&hasEntries(C.dayFor(state,date)))throw Error('The destination contains entered or completed work. Choose another date; no records were changed.');
  const next=C.clone(state),notices=[];let chosen=choice==='keep'?C.clone(old):workoutFromChoice(state,choice,date,gymId);
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
    for(const d of result.days)if(!hasEntries(next.logs[d.date]))next.logs[d.date]=d;
    notices.push('Rebuilt '+result.days.length+' future days; entered sessions were protected.');
    notices.push(...result.warnings);
  }
  return {state:next,date,notices};
}
