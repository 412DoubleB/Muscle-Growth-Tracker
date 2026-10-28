import * as C from './core.mjs?v=8.2.0';
import {SPLITS,WORKOUT_FORMATS} from './training.mjs?v=8.2.0';
import {resolveMovementOptions} from './accessible-programming.mjs?v=8.2.0';
import {ACCESSIBLE_SOURCES} from './accessible-exercises.mjs?v=8.2.0';

// These are original MENEI adaptations. Source links describe the guidance,
// not a license, endorsement, or reproduction of a trainer's published plan.
export const PLAN_SOURCES=[
 {id:'acsm-2026',title:'ACSM resistance-training guidance',url:'https://acsm.org/resistance-training-guidelines-update-2026/',author:'American College of Sports Medicine',published:'2026-03-17',credit:'General adult resistance-training principles; original MENEI programming.'},
 {id:'cleveland-beginner',title:'A published beginner workout example',url:'https://health.clevelandclinic.org/workout-routine',author:'Ben Kuharik, exercise specialist · Cleveland Clinic',published:'2025-03-10',credit:'Beginner progression and recovery reference; not a copy of the published routine.'},
 {id:'nsca-older-client',title:'A trainer’s older-adult program-design blueprint',url:'https://www.nsca.com/education/articles/ptq/strength-training-for-the-older-clienta-blueprint-for-program-design/',author:'Robert Linkul, MS, CSCS, NSCA-CPT · NSCA',published:'2017-06',credit:'Movement progression and individualization reference; proprietary tables and photographs are not reproduced.'},
 {id:'cdc-older-adults',title:'CDC activity guidance for adults 65+',url:'https://www.cdc.gov/physical-activity-basics/guidelines/older-adults.html',author:'Centers for Disease Control and Prevention',published:'2025-12-04',credit:'Strength, aerobic activity and balance guidance; an age group is not an assessment of ability.'},
 {id:'ace-bodyweight',title:'A trainer’s bodyweight program-design examples',url:'https://www.acefitness.org/continuing-education/certified/february-2021/7780/how-to-design-body-weight-training-workouts-using-the-ace-integrated-fitness-training-model/',author:'Pete McCall · American Council on Exercise',published:'2021-02',credit:'Movement, mobility and bodyweight-programming reference; original MENEI adaptations.'}
];

export const PLAN_APPROACHES=[
 {id:'auto',label:'Choose for me',description:'Suggest a starting approach using age and experience, then keep your overrides.',sourceIds:['acsm-2026']},
 {id:'foundation',label:'Foundation / returning',description:'A manageable full-body starting plan with room to build consistency and technique.',sourceIds:['acsm-2026','cleveland-beginner']},
 {id:'build',label:'Build strength and muscle',description:'Goal-focused resistance training adapted to your experience, schedule and equipment.',sourceIds:['acsm-2026','ace-bodyweight']},
 {id:'active50',label:'Active 50+',description:'Strength and useful movement patterns, with recovery and mobility reminders. Available at any adult age.',sourceIds:['acsm-2026','nsca-older-client']},
 {id:'balance65',label:'Strength, balance & mobility · 65+',description:'A strength foundation with optional balance and mobility practice. Your ability and choices determine the workload.',sourceIds:['acsm-2026','nsca-older-client','cdc-older-adults']}
];

const EXPERIENCES=['Beginner','Returning','Intermediate','Advanced'];
const GOALS=['general','muscle','strength','endurance'];
const PREFERENCES=['any','machines','free','bodyweight','bands','calisthenics'];
const numeric=value=>(typeof value==='number'||typeof value==='string'&&value.trim()!=='')&&Number.isFinite(+value);
function integer(value,min,max,label){if(!numeric(value)||!Number.isInteger(+value)||+value<min||+value>max)throw Error(`${label} must be a whole number from ${min} to ${max}.`);return +value}
function oneOf(value,allowed,label){if(!allowed.includes(value))throw Error(`Choose a valid ${label}.`);return value}
const automatic=value=>value===undefined||value==='auto';
const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&C.iso(C.dateOf(value))===value;
function repRange(value){
 if(typeof value!=='string'||!/^\d{1,2}(?:-\d{1,2})?$/.test(value))throw Error('Use an ordered rep range from 1 to 30, such as 8-12.');
 const [lo,hi=lo]=value.split('-').map(Number);if(lo<1||hi>30||lo>hi)throw Error('Use an ordered rep range from 1 to 30, such as 8-12.');
 return lo===hi?String(lo):`${lo}-${hi}`;
}

export function buildPersonalizedProgram(state,options={}){
 if(!state||typeof state!=='object'||!state.training||!Array.isArray(state.gyms)||!options||typeof options!=='object'||Array.isArray(options))throw Error('Open a saved MENEI workspace before building a smart plan.');
 const ageInput=options.age??state.profile?.age;
 if(ageInput===''||ageInput==null)throw Error('Enter your age to build an adult smart plan.');
 const age=integer(ageInput,18,120,'Age for an adult smart plan');
 const experience=oneOf(options.experience??state.training.experience??'Beginner',EXPERIENCES,'experience level'),beginner=['Beginner','Returning'].includes(experience);
 const goal=oneOf(options.goal??'general',GOALS,'training goal');
 const requestedApproach=oneOf(options.approach??'auto',PLAN_APPROACHES.map(x=>x.id),'plan approach');
 const approachId=requestedApproach==='auto'?(age>=65?'balance65':beginner?'foundation':age>=50?'active50':'build'):requestedApproach;
 const approach=PLAN_APPROACHES.find(x=>x.id===approachId),start=options.start??C.iso();
 if(!validDate(start))throw Error('Choose a valid start date for the smart plan.');
 const days=integer(options.days??28,1,366,'Preview days');
 const restInput=options.restWeekdays??state.training.restWeekdays??[];
 if(!Array.isArray(restInput)||restInput.some(value=>!numeric(value)||!Number.isInteger(+value)||+value<0||+value>6)||new Set(restInput.map(Number)).size!==restInput.length)throw Error('Choose each no-lifting weekday once, from Sunday through Saturday.');
 const restWeekdays=restInput.map(Number),available=7-restWeekdays.length;
 if(!available)throw Error('Leave at least one weekday available for training.');
 const suggestedFrequency=approachId==='foundation'||approachId==='balance65'?2:3;
 const frequency=automatic(options.frequency)?Math.min(suggestedFrequency,available):integer(options.frequency,1,7,'Training days per week');
 if(frequency>available)throw Error('Training days exceed the available weekdays. Change the frequency or no-lifting weekdays.');
 const split=automatic(options.split)?frequency<=3?'full':frequency===4?'upper-lower':'ppl':oneOf(options.split,SPLITS.map(([id])=>id),'lifting split');
 const experiencedStrength=goal==='strength'&&!beginner;
 const suggestedSets=goal==='endurance'?2:experiencedStrength?3:approachId==='foundation'||approachId==='balance65'||beginner?2:3;
 const sets=automatic(options.sets)?suggestedSets:integer(options.sets,1,4,'Working sets');
 if(beginner&&sets>3)throw Error('Beginner and returning plans support up to 3 working sets per exercise. Choose 1, 2 or 3 sets, or update your experience level.');
 const range=automatic(options.range)?goal==='endurance'?'15-20':experiencedStrength?'3-5':approachId==='balance65'?'10-15':'8-12':repRange(options.range);
 const equipmentPreference=oneOf(options.equipmentPreference??'any',PREFERENCES,'equipment preference');
 const movement=resolveMovementOptions({movementLevel:options.movementLevel??'auto',floorWork:options.floorWork??'auto',experience});
 const runEvery=integer(options.runEvery??0,0,4,'Running frequency');if(![0,2,3,4].includes(runEvery))throw Error('Choose no runs, or runs about every 2, 3 or 4 days.');
 const supersetMode=oneOf(options.supersetMode??state.training.supersetMode??'off',WORKOUT_FORMATS.map(([id])=>id),'workout format');
 const defaultGym=options.defaultGym??state.training.defaultGym??state.gyms.find(g=>!g.deleted)?.id;
 if(typeof defaultGym!=='string'||!state.gyms.some(g=>!g.deleted&&g.id===defaultGym))throw Error('Choose an available default gym before building the smart plan.');
 const minRepeatDays=integer(options.minRepeatDays??state.training.minRepeatDays??14,0,42,'Minimum days before repeating');
 const excludePullups=options.excludePullups??state.training.excludePullups??true;if(typeof excludePullups!=='boolean')throw Error('Choose whether to exclude pull-ups and chin-ups.');
 const training=C.touch({...state.training,mode:'automatic',startDate:start,frequency,split,sets,range,experience:experience==='Returning'?'Beginner':experience,trainingStyle:goal==='endurance'?'endurance':experiencedStrength?'strength':'hypertrophy',restSeconds:60,runEvery,runningQuality:false,restWeekdays,supersetMode,defaultGym,minRepeatDays,excludePullups,equipmentPreference,accessibleProgramming:true,...movement,planApproach:approachId,planAge:age,planGoal:goal,planExperience:experience});
 const reasons=[
  requestedApproach==='auto'?`The suggested approach uses age ${age} and your ${experience.toLowerCase()} experience; you can choose a different approach.`:`You chose ${approach.label}; age does not restrict that choice.`,
  'Your goal, experience and selected schedule set the starting workload. Age alone never determines a lifting weight.',
  'Use completed sets and your reps in reserve to guide progression. The plan leaves loads blank for you to choose and record. Bands and bodyweight variations use recorded setup, repetitions and control rather than guessed weight increases.',
  `Movement options: ${movement.movementLevel}. ${movement.allowFloorWork?'Floor exercises are allowed when compatible with your choices.':'Floor exercises are excluded.'} This follows your support and experience choices, not an age restriction.`,
  'MENEI uses original adaptations informed by the linked sources; this is not an exact published trainer program.'
 ];
 if(beginner&&goal==='strength')reasons.push('A beginner or returning strength plan starts with controlled moderate-rep practice before heavier low-rep work.');
 if(experience==='Returning')reasons.push('Returning uses beginner starting-volume rules while you rebuild consistency; the selected experience is retained with this plan.');
 if(approachId==='active50')reasons.push('Make time for comfortable mobility and recovery alongside strength work. This age label does not limit your strength potential.');
 if(approachId==='balance65')reasons.push('Add optional supported balance and comfortable mobility practice alongside strength and aerobic activity. These reminders are not logged working sets.');
 if(automatic(options.frequency)&&frequency<suggestedFrequency)reasons.push('The suggested frequency was fitted to the weekdays you left available.');
 if(equipmentPreference!=='any')reasons.push('Equipment is a preference within the saved gym inventory. Other compatible equipment may fill gaps or provide rotation alternatives.');
 if(runEvery)reasons.push('Runs use easy conversational effort, the selected cadence and the program’s existing lower-body recovery rules. Intervals are not enabled by this plan.');
 if(supersetMode==='alternating')reasons.push(`MENEI Overload starts on ${start}: a superset week followed by a straight-set week, then repeats. Each week lasts seven calendar days; missed or rest days do not restart it. Each format keeps its own progression history.`);
 const copy=C.clone({...state,training}),generated=C.generateProgram(copy,{start,days});
 for(const day of generated.days)Object.assign(day,{planApproach:approachId,planAge:age,planGoal:goal,planExperience:experience});
 const sourceIds=new Set([...approach.sourceIds,...(['bodyweight','calisthenics'].includes(equipmentPreference)?['ace-bodyweight']:[])]);
 const additionalSources=ACCESSIBLE_SOURCES.filter(source=>equipmentPreference==='bands'?['ace-bands','nhs-strength'].includes(source.id):movement.movementLevel==='supported'?['nhs-strength','nhs-sitting'].includes(source.id):source.id==='nhs-strength');
 const summary={approachId,supersetMode,age,ageBand:age>=65?'65+':age>=50?'50-64':'18-49',label:approach.label,experience,goal,frequency,split,sets,range,equipmentPreference,...movement,restSeconds:60,reasons,sources:[...PLAN_SOURCES.filter(source=>sourceIds.has(source.id)),...additionalSources]};
 const incomplete=generated.days.filter(day=>day.kind==='strength'&&(day.exercises.length<6||day.exercises.length>9));
 return {...generated,training,start,summary,invalid:incomplete.length>0};
}
