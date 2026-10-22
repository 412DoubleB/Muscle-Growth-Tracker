import {dailyMotivation} from './motivation.mjs?v=8.1.1';
import {workoutSchedule,workoutStartUtc} from './workout-schedule.mjs?v=8.1.1';
export {workoutSchedule,workoutStartUtc} from './workout-schedule.mjs?v=8.1.1';
export function publicKeyBytes(value){const normalized=value.replace(/-/g,'+').replace(/_/g,'/');const raw=atob(normalized+'='.repeat((4-normalized.length%4)%4));return Uint8Array.from(raw,c=>c.charCodeAt(0))}
export async function testNotification(){if(!('Notification' in globalThis))throw Error('This browser does not support notifications.');if(await Notification.requestPermission()!=='granted')throw Error('Notifications are not permitted. Change the browser’s site permission to enable them.');const registration=await navigator.serviceWorker.ready;await registration.showNotification('MENEI',{body:'Your notifications are working on this device.',icon:'./icon-192.png',badge:'./icon-192.png',tag:'mgt-beta-test',renotify:true,silent:false,vibrate:[200,100,200],data:{url:'./'}})}
export async function enablePush(cloud,preferences,vapid){
 if(!('serviceWorker' in navigator)||!('PushManager' in globalThis))throw Error('Push is unavailable here. On iPhone, add the app to the Home Screen and open it there.');
 if(!vapid)throw Error('The push service public key is unavailable.');if(!cloud.session)throw Error('Sign in to your MENEI account first.');
 const context=cloud.accountContext(),check=()=>cloud.requireCurrentAccount(context);let created=false,sub;
 try{
  if(await Notification.requestPermission()!=='granted')throw Error('Notification permission was not granted.');check();
  const registration=await navigator.serviceWorker.ready;check();sub=await registration.pushManager.getSubscription();check();
  if(!sub){sub=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:publicKeyBytes(vapid)});created=true;check()}
  await cloud.savePush(sub.toJSON(),{...preferences,enabled:true});check();return sub;
 }catch(error){if(created&&sub){try{await sub.unsubscribe()}catch{}}throw error}
}
export async function requestPushTest(cloud,preferences){
 const context=cloud.accountContext(),registration=await navigator.serviceWorker.ready;cloud.requireCurrentAccount(context);
 const sub=await registration.pushManager.getSubscription();cloud.requireCurrentAccount(context);if(!sub)throw Error('Enable push on this device first.');
 await cloud.savePush(sub.toJSON(),{...preferences,enabled:true,testAt:new Date(Date.now()+120000).toISOString()});cloud.requireCurrentAccount(context);
}
export async function disablePush(cloud){
 const context=cloud.accountContext(),registration=await navigator.serviceWorker.ready;cloud.requireCurrentAccount(context);
 const sub=await registration.pushManager.getSubscription();cloud.requireCurrentAccount(context);if(!sub)return;
 let error;try{await cloud.removePush(sub.endpoint)}catch(e){error=e}
 cloud.requireCurrentAccount(context);await sub.unsubscribe();return {serverCleanup:!error};
}
function calendarText(value){return String(value??'').replace(/\r\n?/g,'\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/g,'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;')}
function foldedCalendarLine(line){
 const encoder=new TextEncoder();let folded='',part='',octets=0;
 // Iterate code points so a fold cannot split an emoji's UTF-8 bytes. The
 // continuation space counts toward the next physical line's 75-octet limit.
 for(const character of line){const size=encoder.encode(character).length;if(octets+size>75){folded+=part+'\r\n';part=' ';octets=1}part+=character;octets+=size}
 return folded+part;
}
function calendarMinutes(value){return value!==''&&value!=null&&Number.isFinite(+value)&&+value>=0?' · '+(+value)+' min':''}
export function calendarFile(state,days){
 const rows=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//MENEI//Version 8//EN','CALSCALE:GREGORIAN'],requestedTime=state.reminders?.time||'12:00',time=(/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(requestedTime)?requestedTime:'12:00').replace(':','')+'00',checkedAt=new Date().toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
 for(const d of days){
  if(d.kind==='rest')continue;
  const parsed=/^\d{4}-\d{2}-\d{2}$/.test(d.date)?new Date(d.date+'T12:00:00Z'):null;
  if(!parsed||Number.isNaN(parsed.getTime())||parsed.toISOString().slice(0,10)!==d.date)throw Error('Use a valid workout date before exporting the calendar.');
  const gym=state.gyms.find(g=>g.id===d.gymId),location=[gym?.name,gym?.address].filter(value=>value!=null&&String(value).trim()).join(' · '),count=d.exercises.length,suppressed=['completed','skipped'].includes(d.status),details=[gym?.name||'',count+' '+(count===1?'exercise':'exercises')];
  if(d.run)details.push((typeof d.run.type==='string'&&d.run.type.trim()?d.run.type:'Run')+calendarMinutes(d.run.minutes));
  if(d.sauna)details.push('Sauna'+calendarMinutes(d.sauna.minutes));
  if(suppressed)details.push(d.status==='completed'?'Completed workout':'Skipped workout');
  const scheduled=state.reminders?.workoutTime!==''&&state.reminders?.workoutTime!=null,zone=state.reminders?.workoutTimezone||state.reminders?.timezone;
  const start=scheduled?workoutStartUtc(d.date,state.reminders.workoutTime,zone):null;
  if(start){details.push('Planned workout start: '+state.reminders.workoutTime+' '+zone);if(start.ambiguous)details.push('Repeated clock time: using the earlier occurrence');}
  // Preserve legacy floating events until the user explicitly saves a start time.
  rows.push('BEGIN:VEVENT','UID:'+calendarText('mgt-beta-'+d.date+'-'+state.id+'@muscle-growth-tracker'),'DTSTAMP:'+checkedAt,'DTSTART:'+(start?start.utc.replace(/[-:]/g,'').replace('.000',''):d.date.replace(/-/g,'')+'T'+time),'DURATION:PT60M','SUMMARY:'+calendarText(d.title));
  if(location)rows.push('LOCATION:'+calendarText(location));
  rows.push('DESCRIPTION:'+calendarText(details.filter(Boolean).join('; ')));
  if(!suppressed)rows.push('BEGIN:VALARM','TRIGGER:'+(start?'-PT60M':'-PT15M'),'ACTION:DISPLAY','DESCRIPTION:'+calendarText(start?`${d.title} starts in 1 hour. ${dailyMotivation(d.date)}`:'Workout reminder'),'END:VALARM');
  rows.push('END:VEVENT');
 }
 rows.push('END:VCALENDAR');return rows.map(foldedCalendarLine).join('\r\n')+'\r\n';
}
