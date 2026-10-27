export const SPLITS=[['full','Full Body Split'],['upper-lower','Upper / Lower Split'],['ppl','Push / Pull / Legs (PPL) Split'],['bro','Bro Split (Body Part Split)'],['seven','Seven muscle groups'],['split','The MENEI Split']];
export const TRAINING_STYLES={
 strength:{label:'Strength / Power',sets:4,setMin:3,setMax:6,range:'1-5',repMin:1,repMax:5,rest:240,restMin:180,restMax:300,rir:2,summary:'3–6 sets · 1–5 reps · 3–5 min rest',cue:'Use controlled heavy strength work and stop with clean reps available. Dedicated explosive power work uses lighter loads and fast intent; it is not automatically treated as a maximal lift.'},
 hypertrophy:{label:'Hypertrophy (Muscle Growth)',sets:3,setMin:3,setMax:4,range:'6-15',repMin:6,repMax:15,rest:120,restMin:90,restMax:180,rir:1,summary:'3–4 sets · 6–15 reps · 1.5–3 min rest',cue:'Finish close to failure, usually with 1–2 clean reps in reserve. Failure is optional; it is not required on every set.'},
 endurance:{label:'Muscular Endurance',sets:2,setMin:2,setMax:3,range:'15-20',repMin:15,repMax:50,rest:60,restMin:45,restMax:60,rir:2,summary:'2–3 sets · 15–20+ reps · 45–60 sec rest',cue:'Use a load you can control for the full range. Keep technique consistent as fatigue builds.'}
};
export const trainingStyle=key=>TRAINING_STYLES[key]||TRAINING_STYLES.hypertrophy;
export function splitSession(split,index){const choices={
 full:[['Full body',['quads','Chest','hamstrings','Back','Shoulders','Core']]],
 'upper-lower':[['Upper body',['Chest','Chest','Back','Back','Shoulders','Biceps','Triceps']],['Lower body',['quads','quads','hamstrings','hamstrings','calves','Core']]],
 ppl:[['Push',['Chest','Chest','anterior-delt','lateral-delt','Triceps','Triceps']],['Pull',['Back','Back','Back','rear-delt','Biceps','Biceps']],['Legs',['quads','quads','hamstrings','hamstrings','calves','Core']]],
 bro:[['Chest',['Chest','Chest','Chest','Chest','Chest','Chest']],['Back',['Back','Back','Back','Back','Back','Back']],['Legs',['quads','quads','quads','hamstrings','hamstrings','calves','calves']],['Shoulders',['anterior-delt','lateral-delt','lateral-delt','rear-delt','rear-delt','upper-traps']],['Arms',['Biceps','Biceps','Biceps','Triceps','Triceps','Core']]],
 split:[['Chest + Biceps',['Chest','Chest','Chest','Chest','Chest','Biceps','Biceps','Biceps','Biceps']],['Back + Triceps',['Back','Back','Back','Back','Back','Triceps','Triceps','Triceps']],['Legs',['quads','quads','quads','quads','hamstrings','hamstrings','calves','calves']],['Shoulders + Abs',['anterior-delt','lateral-delt','lateral-delt','rear-delt','rear-delt','upper-traps','Core','Core']]],
 seven:[['Seven muscle groups',['quads','Chest','hamstrings','Back','Biceps','Triceps','Shoulders']]]};
 const list=choices[split]||choices.seven;return list[((index%list.length)+list.length)%list.length];
}
export function runningSession(training,{date,dayIndex,legDay,legsTomorrow,recentLegs,week=0}){
 if(!(training.runEvery>0)||dayIndex%+training.runEvery!==0)return null;
 const style=training.trainingStyle||'hypertrophy',beginner=training.experience==='Beginner';
 const easy={type:beginner?'Easy run / walk':'Easy aerobic run',minutes:beginner?20:style==='strength'?25:style==='endurance'?30+5*((week%4+4)%4):30,intensity:'Conversational effort · RPE 3–4 / 10',warmup:5,cooldown:5,done:false,blocks:[],guidance:'Warm up with 5 minutes of walking or easy jogging and cool down for 5 minutes; both are included in the total. Adjust the pace so you can talk comfortably.'};
 if(legDay||legsTomorrow||recentLegs){easy.minutes=beginner?15:20;easy.type=beginner?'Recovery walk / run':'Recovery aerobic run';easy.guidance+=' Keep this short and easy around lower-body work; walk instead if legs are fatigued.';return easy}
 if(training.runningQuality&&style==='endurance'&&!beginner&&week%2===1){return {...easy,type:'Controlled aerobic intervals',minutes:34,intensity:'Work intervals RPE 6–7 / 10; never all-out',warmup:10,cooldown:8,blocks:[{repeat:4,workMinutes:2,recoveryMinutes:2}],guidance:'10 min easy warm-up; 4 × (2 min comfortably hard + 2 min easy); 8 min easy cool-down. Skip intervals when fatigued. This is scheduled only away from adjacent leg sessions.'}}
 if(style==='strength')easy.guidance+=' Prioritize lifting. On the same day, separate the run and lifting by at least 3 hours where practical.';
 else easy.guidance+=' If combining sessions, lift first when muscle growth is your priority. Extend duration only when recovery is comfortable.';
 return easy;
}
