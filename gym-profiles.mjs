// Optional common-setup estimates, never claims about a particular gym floor.
// Share the bounded vocabulary with research validation. Specialist attachments,
// dual-cable configurations and quantitative limits need separate evidence.
export const GYM_TYPES=Object.freeze(Object.fromEntries(Object.entries({
 commercial:{label:'Commercial gym',estimates:['Dumbbells','Adjustable Bench','Barbell','Olympic Plates','Squat Rack','Single Cable Column','Lat Pulldown','Leg Press 45°','Leg Extension','Seated Leg Curl','Selectorized Chest Press','Seated Cable Row','Smith Machine','Kettlebells','Pec Deck / Chest Fly','Selectorized Shoulder Press','Biceps Curl Machine','Triceps Extension Machine','Treadmill','Stationary Bike','Elliptical','Rower','Stair Climber'],note:'A common commercial setup estimate. Check each machine, configuration, attachment and available load at this location.'},
 strength:{label:'Strength gym',estimates:['Barbell','Olympic Plates','Adjustable Bench','Squat Rack','Dumbbells'],note:'A provisional free-weight setup with a rack and adjustable bench; specialist machines and attachments remain unknown.'},
 hotel:{label:'Hotel fitness room',estimates:['Dumbbells'],note:'A small fitness room may have light dumbbells; weights and other equipment need checking.'},
 home:{label:'Home gym',estimates:[],note:'Home setups vary. Enter the equipment you actually have.'},
 workplace:{label:'Workplace / fire station',estimates:['Dumbbells','Bench'],note:'Basic workplace suggestions only; no particular station setup is verified.'},
 custom:{label:'Custom setup',estimates:[],note:'Start with your own checklist.'}
}).map(([id,profile])=>[id,Object.freeze({...profile,estimates:Object.freeze(profile.estimates)})])));

export const ESTIMATED_EQUIPMENT=Object.freeze([...new Set(Object.values(GYM_TYPES).flatMap(profile=>profile.estimates))]);
