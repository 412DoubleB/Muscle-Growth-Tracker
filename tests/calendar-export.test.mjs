import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';
import {calendarFile} from '../notifications.mjs';

const fixedNow=new Date('2026-10-20T15:04:05.000Z');
const unfold=ics=>ics.replace(/\r\n[ \t]/g,'');
function readText(value){return value.replace(/\\([\\,;nN])/g,(_match,char)=>/[nN]/.test(char)?'\n':char)}
function property(ics,name){const line=unfold(ics).split('\r\n').find(row=>row.startsWith(name+':'));return line?.slice(name.length+1)}
function fixture(){return {id:'synthetic-calendar',reminders:{time:'12:00',timezone:'America/New_York'},training:{defaultGym:'scheduled'},gyms:[{id:'scheduled',name:'Scheduled station',address:'1 Shift Road'},{id:'recorded',name:'Recorded gym',address:'2 Actual Street, Pittsburgh, PA'}],gymSchedules:[{id:'shift',gymId:'scheduled',type:'interval',every:1,durationDays:1,start:'2026-10-01',priority:10}]}}
function day(extra={}){return {id:'2026-11-01',date:'2026-11-01',title:'Upper body',kind:'strength',gymId:'recorded',exercises:[{name:'Synthetic exercise',sets:[{w:0,r:10,rir:0,done:true}]}],run:null,sauna:null,notes:[],...extra}}

test('calendar exports the actual recorded gym and interval details without changing source data',t=>{
 t.mock.timers.enable({apis:['Date'],now:fixedNow});
 const state=fixture(),days=[day({run:{type:'Controlled aerobic intervals',minutes:34,blocks:[{repeat:4,workMinutes:2,recoveryMinutes:2}]},sauna:{minutes:20}})],before=C.clone({state,days});
 assert.equal(C.scheduledGym(state,days[0].date).id,'scheduled');
 const ics=calendarFile(state,days),description=readText(property(ics,'DESCRIPTION'));
 assert.equal(readText(property(ics,'LOCATION')),'Recorded gym · 2 Actual Street, Pittsburgh, PA');assert.ok(!ics.includes('Scheduled station'));
 assert.match(description,/Controlled aerobic intervals.*34/);assert.match(description,/Sauna.*20/);assert.doesNotMatch(description,/Zone 2 run/);
 assert.equal(property(ics,'DTSTAMP'),'20261020T150405Z');assert.equal(property(ics,'DURATION'),'PT60M');assert.match(ics,/TRIGGER:-PT15M/);assert.deepEqual({state,days},before);
});

test('run-walk and legacy run records retain truthful labels rather than inventing Zone 2',()=>{
 for(const [run,expected]of [[{type:'Easy run / walk',minutes:20},'Easy run / walk'],[{minutes:30},'Run']]){
  const ics=calendarFile(fixture(),[day({kind:'run',exercises:[],run})]),description=readText(property(ics,'DESCRIPTION'));
  assert.ok(description.includes(expected));assert.ok(description.includes(String(run.minutes)));assert.doesNotMatch(description,/Zone 2/);
 }
});

test('completed and skipped events retain their identity and status but have no reminder alarms',()=>{
 const state=fixture();
 for(const status of ['completed','skipped']){
  const current=day({status}),ics=calendarFile(state,[current]);
  assert.match(ics,/BEGIN:VEVENT\r\n/);assert.equal(property(ics,'UID'),'mgt-beta-2026-11-01-synthetic-calendar@muscle-growth-tracker');assert.equal(property(ics,'DTSTART'),'20261101T120000');
  assert.match(readText(property(ics,'DESCRIPTION')),new RegExp(status,'i'));assert.doesNotMatch(ics,/BEGIN:VALARM|TRIGGER:/);
 }
 assert.match(calendarFile(state,[day()]),/BEGIN:VALARM/);assert.match(calendarFile(state,[day({status:'in-progress'})]),/BEGIN:VALARM/);
});

test('calendar text unfolds and round-trips Unicode, punctuation, backslashes and all newline forms',()=>{
 const state=fixture(),text=('Équipement 🏋️, floor; \\ machine\r\nSecond line\rThird line\n'+'界'.repeat(12)).repeat(3);
 state.gyms[1].name=text;state.gyms[1].address='North, room; \\1\r\n入口';
 const days=[day({title:text})],before=C.clone({state,days}),ics=calendarFile(state,days),expected=text.replace(/\r\n?/g,'\n');
 assert.equal(readText(property(ics,'SUMMARY')),expected);assert.equal(readText(property(ics,'LOCATION')),expected+' · North, room; \\1\n入口');
 assert.match(ics,/\r\n /,'Long lines use calendar continuation whitespace');
 for(const line of ics.split('\r\n'))assert.ok(new TextEncoder().encode(line).length<=75,'Every physical line fits 75 octets');
 assert.doesNotMatch(ics.replace(/\r\n/g,''),/[\r\n]/);assert.doesNotMatch(ics,/�/);assert.deepEqual({state,days},before);
});

test('calendar text cannot insert new properties or events through carriage returns and controls',()=>{
 const state=fixture();state.gyms[1].name='Actual\u0000 gym\rLOCATION:Injected\u007f';state.gyms[1].address='Address\u000b\u0085';
 const ics=calendarFile(state,[day({title:'Title\r\nBEGIN:VEVENT\rSUMMARY:Injected\u0001'})]),lines=unfold(ics).split('\r\n');
 assert.equal(lines.filter(line=>line==='BEGIN:VEVENT').length,1);assert.equal(lines.filter(line=>line.startsWith('SUMMARY:')).length,1);assert.equal(lines.filter(line=>line.startsWith('LOCATION:')).length,1);
 assert.doesNotMatch(ics.replace(/\r\n/g,''),/[\u0000-\u0008\u000b-\u001f\u007f-\u009f]/);
 assert.equal(readText(property(ics,'SUMMARY')),'Title\nBEGIN:VEVENT\nSUMMARY:Injected');assert.equal(readText(property(ics,'LOCATION')),'Actual gym\nLOCATION:Injected · Address');
});

test('event identity is stable across export times and titles while local dates remain floating across DST',t=>{
 t.mock.timers.enable({apis:['Date'],now:fixedNow});
 const state=fixture();state.reminders.time='09:05';
 const dates=['2026-10-31','2026-11-01','2026-11-02'];
 for(const date of dates){
  const current=day({date,id:date}),first=calendarFile(state,[current]);t.mock.timers.tick(1000);const changed=calendarFile(state,[{...current,title:'Edited title',gymId:'scheduled'}]);
  assert.equal(property(first,'UID'),property(changed,'UID'));assert.equal(property(first,'UID'),'mgt-beta-'+date+'-synthetic-calendar@muscle-growth-tracker');
  assert.equal(property(first,'DTSTART'),date.replaceAll('-','')+'T090500');assert.equal(property(changed,'DTSTART'),property(first,'DTSTART'));assert.notEqual(property(first,'DTSTAMP'),property(changed,'DTSTAMP'));assert.doesNotMatch(first,/DTSTART;|VTIMEZONE/);
 }
});

test('rest days are omitted and missing recorded gyms never fall back to a scheduled location',()=>{
 const state=fixture(),ics=calendarFile(state,[day({kind:'rest'}),day({date:'2026-11-02',id:'2026-11-02',gymId:'missing'})]);
 assert.equal((ics.match(/BEGIN:VEVENT/g)||[]).length,1);assert.equal(property(ics,'DTSTART'),'20261102T120000');assert.doesNotMatch(ics,/Scheduled station|1 Shift Road|Recorded gym/);
 assert.equal(calendarFile(state,[day({kind:'rest'})]).includes('BEGIN:VEVENT'),false);
});

test('malformed imported dates cannot become event headers and invalid reminder times use the existing noon default',()=>{
 const state=fixture(),before=C.clone(state);
 for(const date of ['2026-02-30','2026-13-01','2026-11-01\r\nBEGIN:VEVENT'])assert.throws(()=>calendarFile(state,[day({date})]),/valid workout date/);
 assert.deepEqual(state,before);
 for(const time of ['25:00','09:60','12:00\r\nBEGIN:VEVENT']){
  const draft={...state,reminders:{...state.reminders,time}},ics=calendarFile(draft,[day()]);
  assert.equal(property(ics,'DTSTART'),'20261101T120000');assert.equal(unfold(ics).split('\r\n').filter(line=>line==='BEGIN:VEVENT').length,1);assert.equal(draft.reminders.time,time);
 }
});
