const validTime=time=>typeof time==='string'&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time);
export function workoutSchedule(time,timezone){
 if(!validTime(time))throw Error('Choose a workout start time, such as 18:00.');
 if(typeof timezone==='string')timezone=timezone.trim();
 try{if(typeof timezone!=='string'||!timezone.trim())throw Error();new Intl.DateTimeFormat('en',{timeZone:timezone}).format(new Date())}catch{throw Error('Use a valid workout time zone, such as America/New_York.');}
 return {workoutTime:time,workoutTimezone:timezone};
}
// Resolve the saved wall-clock time using that date's actual zone offset.
// Repeated DST times use the earlier occurrence; missing times fail explicitly.
export function workoutStartUtc(date,time,timezone){
 workoutSchedule(time,timezone);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T12:00:00Z'))||new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date)throw Error('Use a valid workout date before exporting the calendar.');
 const formatter=new Intl.DateTimeFormat('en-CA',{timeZone:timezone,calendar:'iso8601',numberingSystem:'latn',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 const wall=ms=>{const p=Object.fromEntries(formatter.formatToParts(new Date(ms)).map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}`};
 const target=date+'T'+time+':00',nominal=Date.parse(target+'Z'),offsets=new Set();
 for(let hours=-36;hours<=36;hours+=6){const ms=nominal+hours*3600000;offsets.add(Date.parse(wall(ms)+'Z')-ms)}
 const matches=[...offsets].map(offset=>nominal-offset).filter(ms=>wall(ms)===target).sort((a,b)=>a-b);
 if(!matches.length)throw Error(`${date} at ${time} does not occur in ${timezone} because the clocks change. Choose another workout time before exporting.`);
 return {utc:new Date(matches[0]).toISOString(),ambiguous:matches.length>1};
}
