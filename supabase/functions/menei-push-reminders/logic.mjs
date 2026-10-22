import {localClock,dueReminder,allowedPushEndpoint} from './legacy.mjs';
import {workoutStartUtc} from './schedule.mjs';
export {allowedPushEndpoint};
const windowMs=15*60000;
const due=(now,at)=>Number.isFinite(at)&&now>=at&&now-at<windowMs;
const quotes=['A little progress is still progress.','Show up for the next rep.','Consistency starts with the next step.'];
export function pushPreferences(statePrefs={},devicePrefs={}){
 const stamp=p=>Number.isFinite(Date.parse(p?.updatedAt))?Date.parse(p.updatedAt):0;
 const latest=stamp(devicePrefs)>stamp(statePrefs)?{...statePrefs,...devicePrefs}:{...devicePrefs,...statePrefs};
 return {...latest,enabled:devicePrefs?.enabled===true,testAt:devicePrefs?.testAt};
}
export function dueItems(now,state,prefs){
 if(!prefs?.enabled)return [];
 const items=[],ms=now.getTime(),test=Date.parse(prefs.testAt||'');
 if(due(ms,test))items.push({kind:'test',slot:prefs.testAt,message:{title:'MENEI test reminder',body:'Your server notification reached this device. Scheduled workout reminders can arrive while MENEI is closed.',url:'./',tag:'menei-push-test'}});
 if(!prefs.workoutTime){const legacy=dueReminder(now,state,prefs);if(legacy)items.push({kind:'legacy',...legacy});return items}
 if(prefs.workout){
  const zone=prefs.workoutTimezone||prefs.timezone;
  try{
   const today=localClock(now,zone).date,tomorrow=new Date(Date.parse(today+'T12:00:00Z')+86400000).toISOString().slice(0,10);
   for(const date of [today,tomorrow]){
    const day=state.logs?.[date]||state.plan?.[date]||state.notificationSchedule?.[date];if(!day||day.deleted||!['strength','run'].includes(day.kind)||['completed','skipped'].includes(day.status))continue;
    const start=Date.parse(workoutStartUtc(date,prefs.workoutTime,zone).utc);if(!due(ms,start-3600000))continue;
    const title=String(day.title||'your workout').replace(/[\r\n\u0000-\u001f]/g,' ').slice(0,100),quote=quotes[date.split('-').join('')%quotes.length];
    items.push({kind:'workout',slot:date+':'+prefs.workoutTime+':'+zone,message:{title:'MENEI · Workout in 1 hour',body:`${title} starts in one hour. ${quote}`,url:'./',tag:'menei-workout-'+date}});
   }
  }catch{ /* Bad imported times cannot move a reminder to an invented hour. */ }
 }
 if(prefs.meals){const meal=dueReminder(now,state,{...prefs,workout:false});if(meal)items.push({kind:'meals',...meal})}
 return items;
}
