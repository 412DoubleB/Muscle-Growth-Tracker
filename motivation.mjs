import {iso,dateOf,addDays,daysBetween,scheduledDayKind} from './core.mjs?v=8.2.0';

const validDate=date=>/^\d{4}-\d{2}-\d{2}$/.test(date)&&iso(dateOf(date))===date;
const positive=n=>n!==''&&n!=null&&Number.isFinite(+n)&&+n>0;
const validSet=s=>s.done&&positive(s.r)&&s.w!==''&&s.w!=null&&Number.isFinite(+s.w)&&+s.w>=0;
const activity=day=>(day.exercises||[]).some(e=>(e.sets||[]).some(validSet))||day.run?.done&&positive(day.run.minutes);
const recovery=day=>day?.kind==='rest'&&!(day.exercises||[]).some(e=>((e.sets||[]).length||(e.setTemplates||[]).length))&&!positive(day.run?.minutes);

// Current preferences can prove unsaved recovery only since they took effect.
// Older unknown gaps must not be reclassified by a later programme change.
function scheduleEffectiveDate(training){
 if(!['original','automatic','custom'].includes(training?.mode)||typeof training.updatedAt!=='string')return null;
 const start=training.mode==='original'?'2026-10-01':training.startDate;if(!validDate(start))return null;
 const updated=new Date(training.updatedAt);if(!Number.isFinite(updated.getTime()))return null;
 return [start,iso(updated)].sort().at(-1);
}

// Read-only: rest counts automatically without completing or creating a log.
// Archived/conflicting copies and unknown historical gaps never earn credit.
export function trainingStreak(state,asOf=iso()){
 const rawLogs=state.logs||{},rawPlans=state.plan||{};
 const logs=new Map(Object.entries(rawLogs).filter(([date,day])=>validDate(date)&&date<=asOf&&day?.date===date&&!day.deleted));
 const plans=new Map(Object.entries(rawPlans).filter(([date,day])=>validDate(date)&&date<=asOf&&day&&!day.deleted&&(!day.date||day.date===date)));
 const effective=scheduleEffectiveDate(state.training);
 const dayAt=date=>{
  const log=logs.get(date);if(log)return log;
  const plan=plans.get(date),currentOriginal=state.training?.mode==='original'&&effective&&date>=effective;
  // Original Program keeps old plans for history but its active calendar
  // ignores them. Only its earlier saved plans remain schedule evidence here.
  if(plan&&!currentOriginal)return plan;
  // Invalid or deleted date-keyed records are not permission to infer recovery.
  if(Object.hasOwn(rawLogs,date)||Object.hasOwn(rawPlans,date)&&!plan||!effective||date<effective)return null;
  try{return scheduledDayKind(state,date)==='rest'?{kind:'rest'}:null}catch{return null}
 };
 const dates=[...new Set([...Object.keys(rawLogs),...Object.keys(rawPlans),asOf])].filter(date=>validDate(date)&&date<=asOf).sort();
 let current=0,best=0,total=0,previous=null,lastCompleted=null,todayCompleted=false;
 for(const date of dates){
  if(previous&&current&&daysBetween(date,previous)>1){
   for(let missing=addDays(previous,1);missing<date;missing=addDays(missing,1)){
    if(!recovery(dayAt(missing))){current=0;break}
    best=Math.max(best,++current);
   }
  }
  const log=logs.get(date),day=dayAt(date),completed=log?.status==='completed'&&activity(log);
  if(completed){current++;total++;best=Math.max(best,current);lastCompleted=date;if(date===asOf)todayCompleted=true}
  else if(recovery(day)){if(current)best=Math.max(best,++current)}
  else if(date!==asOf)current=0;
  previous=date;
 }
 return {current,best,total,lastCompleted,todayCompleted,recoveryDay:recovery(dayAt(asOf))};
}

// Original, unattributed text: stable per local calendar date; no AI/API call.
const quotes=[
 'Build the habit. Let the progress follow.',
 'One honest set is a step forward.',
 'Recovery is part of the work.',
 'Choose steady progress over a perfect day.',
 'Show up for the person you are becoming.',
 'Train with purpose. Recover with patience.',
 'Small choices become a stronger routine.'
];
export function dailyMotivation(date=iso()){
 let hash=0;for(const c of String(date))hash=(hash*31+c.charCodeAt(0))>>>0;
 return quotes[hash%quotes.length];
}
export function streakMilestone(before,after){return after.todayCompleted&&after.current>before.current&&[1,3,7,14,30,60,100].includes(after.current)}
