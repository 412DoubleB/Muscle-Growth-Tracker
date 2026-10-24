// Read-only views of canonical workout history. Archived/conflicting copies
// remain available in History but never double-count toward a progress trend.
import {completedSets, norm, iso, addDays, usesManualProgression} from './core.mjs?v=8.2.0';
import {progressionContext} from './supersets.mjs?v=8.2.0';

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const round = value => Math.round(value * 10) / 10;
const display = value => round(value).toLocaleString(undefined, {maximumFractionDigits:1});
const identity = exercise => exercise.exerciseId || 'name:' + norm(exercise.name);
const periodOptions = [['30','30 days'],['90','90 days'],['365','1 year'],['all','All time']];
const countUnit=record=>record.repUnit==='seconds'?'sec':record.repUnit==='metres'?'m':'reps';
const manualSetDescription=(set,record)=>`${record.loadMode==='band'?`Band: ${typeof set.band==='string'&&set.band.trim()?set.band.trim():'setting not recorded'} · `:''}${display(+set.r)} ${countUnit(record)}`;

export function estimateStrength(weight, reps) {
  if (!Number.isFinite(weight) || weight <= 0 || !Number.isInteger(reps) || reps < 1 || reps > 10) return null;
  // Epley estimate for multiple reps; an actual single stays its logged load.
  return reps === 1 ? weight : weight * (1 + reps / 30);
}

export function progressRecords(state, catalog = []) {
  const meta = [...catalog, ...(state.customExercises || [])];
  return Object.entries(state.logs || {}).filter(([key, log]) =>
    log && key === log.date && /^\d{4}-\d{2}-\d{2}$/.test(log.date) &&
    Number.isFinite(Date.parse(log.date+'T12:00:00Z')) && !log.deleted && log.status !== 'skipped'
  ).flatMap(([, log]) => (log.exercises || []).flatMap(exercise => {
    const definition = meta.find(e => e.id === exercise.exerciseId || (!exercise.exerciseId && norm(e.name) === norm(exercise.name)));
    const manual=usesManualProgression(exercise,definition);
    const repUnit = definition?.repUnit || exercise.repUnit || 'reps';
    const measured = ['seconds','metres'].includes(repUnit);
    const sets = completedSets(exercise).filter(s => s.w != null && (measured || Number.isInteger(+s.r)));
    if (!sets.length) return [];
    return [{
      date:log.date, exerciseId:definition?.id || identity(exercise), name:definition?.name || exercise.name || 'Exercise',
      gymId:log.gymId || 'unknown', gym:state.gyms?.find(g => g.id === log.gymId)?.name || 'Unspecified gym',
      format:progressionContext(exercise), loadMode:exercise.loadMode==='band'||definition?.loadMode==='band'?'band':exercise.loadMode || definition?.loadMode || 'total',
      ...(manual?{manualProgression:true}:{}),
      repUnit, sets
    }];
  })).sort((a,b) => a.date.localeCompare(b.date));
}

function bestSet(sets, metric, mode) {
  return sets.reduce((best, set) => {
    const value = metric === 'strength' ? estimateStrength(+set.w, +set.r) : metric === 'reps' ? +set.r : +set.w;
    if (value === null) return best;
    if (!best || (metric === 'weight' && mode === 'assistance' ? value < best.value : value > best.value) ||
      (value === best.value && +set.r > +best.set.r)) return {value, set};
    return best;
  }, null);
}

export function buildProgress(state, catalog = [], filters = {}, asOf = iso()) {
  const period = periodOptions.some(([id]) => id === filters.period) ? filters.period : '90';
  const since = period === 'all' ? '0000-01-01' : addDays(asOf, 1 - +period);
  const records = progressRecords(state, catalog).filter(r => r.date <= asOf);
  const choices = new Map();
  for (const r of records) {
    const choice = choices.get(r.exerciseId) || {id:r.exerciseId, name:r.name, dates:new Set(), recentDates:new Set(), latest:r.date};
    choice.dates.add(r.date); if(r.date >= since) choice.recentDates.add(r.date); choice.latest = r.date; choices.set(r.exerciseId, choice);
  }
  const exercises = [...choices.values()].sort((a,b) => b.recentDates.size-a.recentDates.size || b.latest.localeCompare(a.latest) || a.name.localeCompare(b.name));
  const exercise = choices.has(filters.exercise) ? filters.exercise : exercises[0]?.id;
  const matching = records.filter(r => r.exerciseId === exercise);
  const gyms = [...new Map(matching.map(r => [r.gymId,{id:r.gymId,name:r.gym}])).values()];
  const gym = gyms.some(g => g.id === filters.gym) ? filters.gym : matching.at(-1)?.gymId;
  const atGym = matching.filter(r => r.gymId === gym);
  const formats = [...new Set(atGym.map(r => r.format))];
  const format = formats.includes(filters.format) ? filters.format : atGym.at(-1)?.format;
  const comparable = atGym.filter(r => r.format === format);
  const meta = comparable.at(-1) || matching.at(-1) || {loadMode:'total',repUnit:'reps'};
  const manual=meta.manualProgression===true,loaded = !manual&&!['bodyweight','assistance'].includes(meta.loadMode) && meta.repUnit === 'reps';
  const countLabel=meta.repUnit==='seconds'?'Time':meta.repUnit==='metres'?'Distance':'Reps';
  const metrics = manual?[['reps',countLabel],['sets','Working sets']]:[...(loaded ? [['strength','Estimated strength']] : []), ['weight',meta.loadMode === 'assistance' ? 'Assistance' : meta.loadMode === 'bodyweight' ? 'Added weight' : 'Weight'], ['reps',countLabel], ...(loaded ? [['volume','Working volume']] : [])];
  const metric = metrics.some(([id]) => id === filters.metric) ? filters.metric : loaded ? 'strength' : !manual&&meta.loadMode === 'assistance' ? 'weight' : 'reps';
  const sessions = new Map();
  for (const r of comparable.filter(r => r.date >= since)) {
    const row = sessions.get(r.date) || {...r,sets:[]};
    row.sets.push(...r.sets); sessions.set(r.date,row);
  }
  const points = [...sessions.values()].flatMap(row => {
    const best = bestSet(row.sets, metric === 'volume' ? 'weight' : metric==='sets'?'reps':metric, row.loadMode);
    if (!best) return [];
    const value = metric === 'volume' ? row.sets.reduce((sum,s) => sum + +s.w * +s.r * (row.loadMode === 'perHand' ? 2 : 1),0) : metric==='sets'?row.sets.length:best.value;
    return [{...row,value,set:best.set}];
  });
  const first = points[0], latest = points.at(-1);
  const change = first && latest && points.length > 1 ? latest.value-first.value : null;
  const percent = change !== null && first.value !== 0 ? change/first.value*100 : null;
  const units = state.profile?.units || 'lb';
  const unit = metric==='sets'?'sets':metric === 'reps' ? meta.repUnit === 'reps' ? 'reps' : meta.repUnit === 'seconds' ? 'sec' : 'm' : metric === 'volume' ? units+'·reps' : units;
  const note = manual?(metric==='sets'?'Checked working-set count per session.':'Highest checked working-set repetitions or duration per session.') : metric === 'strength' ? 'Estimated from checked working sets of 1–10 reps. Compare similar effort and form; this is not a tested max.' : metric === 'volume' ? 'Checked working load × reps, summed per session. More sets can raise volume without a strength increase.' : metric === 'weight' && meta.loadMode === 'assistance' ? 'Lowest checked assistance per session. Less assistance can indicate progress; compare the reps too.' : metric === 'weight' ? 'Heaviest checked working set per session, with its actual reps shown below.' : 'Highest checked working-set count per session, with its actual load shown below.';
  return {exercises,gyms,formats,metrics,meta,points,latest,change,percent,unit,units,note,selection:{exercise,gym,format,period,metric},name:matching[0]?.name || 'Your strength progress',loadNote:manual?(meta.loadMode==='band'?'Band level and setup are recorded as descriptions, not pounds or kilograms. Compare counts with the same brand, level and setup; these trends do not measure band force.':'Progress follows controlled repetitions or duration. No estimated maximum or added-weight trend is calculated for this variation.'):meta.loadMode === 'perHand' ? 'Loads are per dumbbell. Working volume counts both hands.' : meta.loadMode === 'bodyweight' ? 'Weight is added load only; historical bodyweight is not estimated.' : ''};
}

function chart(model, context, selected = null, compact = false) {
  const {points,unit} = model;
  if (!points.length) return `<div class="progressEmpty">${model.exercises.length ? 'No checked sets match this view. Try another metric or a longer period.' : 'Log your first working sets to start your graph.'}</div>`;
  const width=640,height=compact?148:238,left=compact?8:58,right=14,top=18,bottom=compact?12:34;
  const values=points.map(p=>p.value),min=Math.min(...values),max=Math.max(...values),padding=Math.max((max-min)*.2,max*.05,1),low=Math.max(0,min-padding),high=max+padding;
  const start=Date.parse(points[0].date+'T12:00:00Z'),end=Date.parse(points.at(-1).date+'T12:00:00Z');
  const coordinates=points.map(p=>({x:start===end?(left+width-right)/2:left+(Date.parse(p.date+'T12:00:00Z')-start)/(end-start)*(width-left-right),y:top+(high-p.value)/(high-low)*(height-top-bottom)}));
  const path=coordinates.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
  const active=points.some(p=>p.date===selected)?selected:points.at(-1).date;
  const label=([id,text])=>model.selection.metric===id?text:'';
  const description=`${model.name}. ${model.metrics.map(label).join('')}, ${unit}. ${points.length} logged sessions. ${points.length===1?'One session is a starting point; log another to show a trend.':'Line follows actual logged dates.'}`;
  return `<svg class="strengthChart ${compact?'compactChart':''}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escape(description)}"><title>${escape(description)}</title>${[0,.5,1].map(t=>{const y=top+t*(height-top-bottom);return `<line class="chartGrid" x1="${left}" y1="${y}" x2="${width-right}" y2="${y}"/>${compact?'':`<text class="chartAxis" x="${left-9}" y="${y+4}" text-anchor="end">${display(high-t*(high-low))}</text>`}`}).join('')}${points.length>1?`<path class="chartArea" d="${path} L${coordinates.at(-1).x},${height-bottom} L${coordinates[0].x},${height-bottom} Z"/><path class="chartLine" d="${path}"/>`:''}${coordinates.map((p,i)=>compact?`<circle class="chartDot" cx="${p.x}" cy="${p.y}" r="${i===points.length-1?5:3}"/>`:`<a href="#${context}-progress-detail" data-action="progress-point" data-context="${context}" data-date="${points[i].date}" aria-label="${escape(points[i].date+' · '+display(points[i].value)+' '+unit+' · '+(points[i].manualProgression?manualSetDescription(points[i].set,points[i]):points[i].set.w+' × '+points[i].set.r))}"><circle class="chartHit" cx="${p.x}" cy="${p.y}" r="12"/><circle class="chartDot ${points[i].date===active?'selected':''}" cx="${p.x}" cy="${p.y}" r="${points[i].date===active?6:4}"/><title>${escape(points[i].date+' · '+display(points[i].value)+' '+unit)}</title></a>`).join('')}${compact?'':`<text class="chartAxis" x="${left}" y="${height-6}">${points[0].date}</text>${points.length>1?`<text class="chartAxis" x="${width-right}" y="${height-6}" text-anchor="end">${points.at(-1).date}</text>`:''}`}</svg>`;
}

function changeHtml(model) {
  if (model.change === null) return '<span class="sub">A starting point. Your next session will add to the trend.</span>';
  const sign=model.change>0?'+':model.change<0?'−':'';
  return `<span class="progressChange">${sign}${display(Math.abs(model.change))} ${escape(model.unit)}${model.percent!==null?' · '+sign+display(Math.abs(model.percent))+'%':''}</span><span class="tiny"> since first session in this period</span>`;
}

export function compactProgress(model) {
  return `<article class="card overviewProgress"><div class="eyebrow">Progress</div><h3>${escape(model.name)}</h3>${model.latest?`<div class="metric">${display(model.latest.value)} <small>${escape(model.unit)}${model.selection.metric==='strength'?' estimated':''}</small></div>`:''}${chart(model,'home',null,true)}<div>${changeHtml(model)}</div><button class="btn small ghost" data-action="progress" ${model.selection.exercise?`data-exercise="${escape(model.selection.exercise)}"`:''}>Explore progress ↗</button></article>`;
}

export function progressPanel(model, context='detail', selected=null) {
  const choose=(key,label,options,value)=>`<label class="field">${label}<select id="${context==='detail'&&key==='exercise'?'progressExercise':context+'-progress-'+key}" data-progress-key="${key}" data-progress-context="${context}" ${!options.length?'disabled':''}>${options.map(([id,text])=>`<option value="${escape(id)}" ${id===value?'selected':''}>${escape(text)}</option>`).join('')}</select></label>`;
  const {selection,points,latest}=model;
  const point=points.find(p=>p.date===selected)||latest;
  return `<section class="card progressPanel" aria-label="Strength progress"><div class="row between wrap"><div><div class="eyebrow">Your work, over time</div><h2>Strength progress</h2></div><span class="tag gray">${points.length} session${points.length===1?'':'s'}</span></div><div class="progressFilters">${choose('exercise','Exercise',model.exercises.map(e=>[e.id,e.name]),selection.exercise)}${choose('gym','Gym',model.gyms.map(g=>[g.id,g.name]),selection.gym)}${choose('format','Format',model.formats.map(f=>[f,f==='superset'?'Superset':'Straight sets']),selection.format)}${choose('period','Period',periodOptions,selection.period)}</div><div class="progressMetrics" aria-label="Progress metric">${model.metrics.map(([id,text])=>`<button class="btn small ${id===selection.metric?'primary':'ghost'}" data-action="progress-metric" data-context="${context}" data-metric="${id}" aria-pressed="${id===selection.metric}">${text}</button>`).join('')}</div><div class="progressHeadline">${latest?`<div class="metric">${display(latest.value)} <small>${escape(model.unit)}${selection.metric==='strength'?' estimated':''}</small></div>`:''}<div>${changeHtml(model)}</div></div>${chart(model,context,selected)}${point?`<div class="progressPoint" id="${context}-progress-detail" aria-live="polite"><b>${escape(point.date)}</b><span>${display(point.value)} ${escape(model.unit)}${selection.metric==='strength'?' estimated':''}</span><span class="sub">${selection.metric==='reps'?'Selected set':'Best set'}: ${point.manualProgression?escape(manualSetDescription(point.set,point)):`${display(+point.set.w)} ${escape(model.units + (point.loadMode === 'perHand' ? ' / hand' : ''))} × ${point.set.r} ${escape(point.repUnit==='reps'?'reps':point.repUnit)}`}${point.set.rir!==''&&point.set.rir!=null?' · '+escape(point.set.rir)+' RIR':''}</span></div>`:''}<p class="sub">${escape(model.note)} ${escape(model.loadNote)}</p><p class="tiny">Same exercise, gym and session format. Warm-ups, ramp, back-off and drop sets are excluded. ${points.length===1?'Log another session to begin the trend.':''}</p>${points.length?`<details class="collapsible"><summary>View session data</summary><div class="tableWrap"><table class="dataTable"><caption class="sub">${escape(model.name)} · ${escape(model.gyms.find(g=>g.id===selection.gym)?.name)} · ${selection.format==='superset'?'Superset':'Straight sets'}</caption><thead><tr><th scope="col">Date</th><th scope="col">${escape(model.metrics.find(([id])=>id===selection.metric)?.[1])} (${escape(model.unit)})</th><th scope="col">Checked working sets</th></tr></thead><tbody>${points.map(p=>`<tr><th scope="row">${p.date}</th><td>${display(p.value)}</td><td>${p.sets.map(s=>p.manualProgression?escape(manualSetDescription(s,p)):`${display(+s.w)} × ${s.r}`).join(' · ')}</td></tr>`).join('')}</tbody></table></div></details>`:''}</section>`;
}
