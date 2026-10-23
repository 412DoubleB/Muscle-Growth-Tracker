import {iso,dateOf,daysBetween} from './core.mjs?v=8.2.0';

const validDate=date=>/^\d{4}-\d{2}-\d{2}$/.test(date)&&iso(dateOf(date))===date;
const positive=n=>n!==''&&n!=null&&Number.isFinite(+n)&&+n>0;
const validSet=s=>s.done&&positive(s.r)&&s.w!==''&&s.w!=null&&Number.isFinite(+s.w)&&+s.w>=0;
const activity=day=>(day.exercises||[]).some(e=>(e.sets||[]).some(validSet))||day.run?.done&&positive(day.run.minutes);
const recovery=day=>day?.kind==='rest'&&!(day.exercises||[]).some(e=>((e.sets||[]).length||(e.setTemplates||[]).length))&&!positive(day.run?.minutes);

// Only recorded canonical dates and explicitly saved rest days are evidence.
// Never regenerate historical schedules or count archived/conflicting copies.
export function trainingStreak(state,asOf=iso()){
 const logs=new Map(Object.entries(state.logs||{}).filter(([date,day])=>validDate(date)&&date<=asOf&&day?.date===date&&!day.deleted));
 const plans=new Map(Object.entries(state.plan||{}).filter(([date,day])=>validDate(date)&&date<=asOf&&day&&!day.deleted&&(!day.date||day.date===date)));
 const dates=[...new Set([...logs.keys(),...plans.keys(),asOf])].sort();
 let current=0,best=0,total=0,previous=null,lastCompleted=null,todayCompleted=false;
 for(const date of dates){
  if(previous&&daysBetween(date,previous)>1)current=0;
  const log=logs.get(date),day=log||plans.get(date),completed=log?.status==='completed'&&activity(log);
  if(completed){current++;total++;best=Math.max(best,current);lastCompleted=date;if(date===asOf)todayCompleted=true}
  else if(!recovery(day)&&date!==asOf)current=0;
  previous=date;
 }
 return {current,best,total,lastCompleted,todayCompleted,recoveryDay:recovery(logs.get(asOf)||plans.get(asOf))};
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
