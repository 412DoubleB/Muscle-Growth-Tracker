import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';
import * as W from '../workouts.mjs';
import * as N from '../nutrition.mjs';
import {lookupGyms,GYM_DIRECTORY,researchLink} from '../gyms.mjs';
import {validatePhoto,safePhoto,preparePhoto} from '../photos.mjs';

test('original recipe upgrade adds detailed recipes once and preserves every saved recipe and meal snapshot',()=>{
 const state=C.defaultState();state.recipes=[C.clone(N.STARTER_RECIPES[0]),{id:'mine',name:'My recipe',steps:['Keep me']}];state.meals['2026-10-18']={id:'2026-10-18',items:[{recipeSnapshot:C.clone(state.recipes[0])}]};const before=C.clone(state);
 N.addOriginalRecipes(state);N.addOriginalRecipes(state);
 assert.equal(state.recipes.length,N.ORIGINAL_RECIPES.length+2);assert.deepEqual(state.recipes.slice(0,2),before.recipes);assert.deepEqual(state.meals,before.meals);
 for(const r of N.ORIGINAL_RECIPES){assert.ok(r.ingredients.length>=6);assert.ok(r.steps.length>=4);assert.match(r.source,/Original.*not kitchen tested/);assert.ok(r.prepMinutes>=10);const m=N.recipeMacros(r);for(const n of Object.values(m))assert.ok(Number.isFinite(n)&&n>=0);assert.ok(m.calories>150&&m.calories<1000);}
});
test('allergen checkboxes override preferences including hidden soy, fish, milk and wheat ingredients',()=>{
 const state=C.defaultState();N.addOriginalRecipes(state);state.nutrition={...state.nutrition,allergens:['soy','milk','fish','wheat','peanut'],mealCategories:['plant','fish'],snackCategories:['dairy']};
 for(const r of state.recipes)if(N.allowedRecipe(r,state.nutrition)){const tags=r.ingredients.flatMap(i=>N.foodFor(i.foodId).tags);assert.ok(!tags.some(t=>state.nutrition.allergens.includes(t)));}
 const result=N.generateMeals(state,{start:'2026-10-18',days:3});assert.ok(Object.keys(result.meals).length===3);
 for(const d of Object.values(result.meals))for(const m of d.items)assert.ok(N.allowedRecipe(m.recipeSnapshot,state.nutrition));
 assert.equal(N.allowedRecipe(N.ORIGINAL_RECIPES.find(r=>r.id==='o-harissa-tofu'),{allergens:['soy']}),false);
});
test('food category choices score actual ingredients, while zero-carb and tomorrow targets remain valid',()=>{
 const chicken=N.ORIGINAL_RECIPES[0];assert.equal(N.preferenceScore(chicken,{mealCategories:['poultry']},'Lunch'),1);assert.equal(N.preferenceScore(chicken,{mealCategories:['fish']},'Lunch'),0);
 const state=C.defaultState();state.logs['2026-10-18']={kind:'rest'};state.logs['2026-10-19']={kind:'strength'};state.nutrition.preTrainingCarbs=280;state.nutrition.restCarbs=0;assert.equal(N.targetsForDate(state,'2026-10-18').carbs,280);state.nutrition.preTrainingCarbs='';assert.equal(N.targetsForDate(state,'2026-10-18').carbs,0);
});
test('v6 workout dropdown retains #1 through #5 and saved routines without carrying entered loads',()=>{
 const s=C.defaultState();const choices=W.workoutChoices(s);for(const family of ['Chest + Biceps','Back + Triceps','Legs'])for(let i=1;i<=5;i++)assert.ok(choices.some(o=>o.title===family+' #'+i));
 s.routines=[{id:'mine',name:'My workout',exercises:[C.makeExercise(C.CATALOG[0])]}];s.routines[0].exercises[0].sets[0].w=50;
 const d=W.workoutFromChoice(s,'routine:mine','2026-10-18','station');assert.equal(d.title,'My workout');assert.equal(d.exercises[0].sets[0].w,'');assert.notEqual(d.exercises[0].id,s.routines[0].exercises[0].id);
});
test('replacing a started workout durably archives the complete prior record in History',()=>{
 const s=C.defaultState(),date='2026-10-19';const old=C.ensureLog(s,date);old.exercises[0].sets[0]={...old.exercises[0].sets[0],w:55,r:9,rir:2,done:true};old.customNote='preserve';const before=C.clone(old);
 const result=W.editSession(s,date,{choice:'legacy:1',date,gymId:'station'});assert.equal(result.state.logs[date].title,'Legs #1');const archived=Object.entries(result.state.logs).find(([k])=>k.startsWith(date+'~edit-'))[1];assert.deepEqual(archived.exercises,before.exercises);assert.equal(archived.customNote,'preserve');assert.deepEqual(s.logs[date],before);C.validateState(result.state);
});
test('changing dates swaps the destination workout back, uses scheduled gyms and blocks entered destinations atomically',()=>{
 const s=C.defaultState(),from='2026-10-19',date='2026-10-22',old=C.dayFor(s,from),target=C.dayFor(s,date);const r=W.editSession(s,from,{choice:'keep',date,gymId:'station'});assert.equal(r.state.logs[date].title,old.title);assert.equal(r.state.logs[from].title,target.title);assert.equal(r.state.logs[from].gymId,C.scheduledGym(s,from).id);
 const d=C.ensureLog(s,date);d.exercises[0].sets[0].rir=2;const before=C.clone(s);assert.throws(()=>W.editSession(s,from,{date,gymId:'station'}),/destination contains entered/);assert.deepEqual(s,before);
});
test('next matching workout swap and regeneration preserve future entered and completed sessions',()=>{
 const s=C.defaultState(),from='2026-10-01';const next=W.editSession(s,from,{choice:'legacy:1',date:from,gymId:'crunch',adjust:'swap-next'});assert.equal(next.state.logs['2026-10-02'].title,'Chest + Biceps #1');assert.equal(next.state.logs[from].title,'Legs #1');
 const keep=C.ensureLog(s,'2026-10-05');keep.exercises[0].sets[0].w=25;keep.status='completed';const entry=C.ensureLog(s,'2026-10-06');entry.exercises[0].sets[0].rir=1;
 const result=W.editSession(s,from,{choice:'auto',date:from,gymId:'station',adjust:'regenerate'});assert.deepEqual(result.state.logs['2026-10-05'],keep);assert.deepEqual(result.state.logs['2026-10-06'],entry);assert.equal(result.state.logs[from].gymId,'station');for(const e of result.state.logs[from].exercises)assert.ok(C.supports(C.exerciseFor(e.exerciseId),s.gyms[1]));
});
test('gym lookup requires matching location words and never promotes generic facilities into specific machines',()=>{
 const matches=lookupGyms('Crunch Pleasant Hills');assert.equal(matches.length,1);assert.equal(matches[0].equipment.find(e=>e.name==='Dumbbells').max,120);assert.equal(matches[0].complete,false);assert.ok(matches[0].equipment.every(e=>e.status==='published'));assert.equal(lookupGyms('Crunch Pleasant Hills','California').length,0);assert.equal(lookupGyms('Unknown Gym').length,0);assert.equal(lookupGyms('').length,0);
 const m=GYM_DIRECTORY.find(g=>g.name==='Crunch Monroeville');assert.equal(m.equipment.length,0);assert.match(m.status,/coming soon/);const url=new URL(researchLink('My Gym','Pittsburgh'));assert.equal(url.origin,'https://chatgpt.com');assert.match(url.searchParams.get('q'),/My Gym in Pittsburgh/);
});
test('photo validation rejects active or oversized content; phone conversion errors are actionable',async()=>{
 assert.throws(()=>validatePhoto({type:'image/svg+xml',size:50}),/JPEG/);assert.throws(()=>validatePhoto({type:'image/jpeg',size:16*1024*1024}),/15 MB/);assert.equal(safePhoto('javascript:alert(1)'),'');assert.equal(safePhoto('data:image/svg+xml;base64,PHN2Zz4='),'');assert.equal(safePhoto('data:image/jpeg;base64,AAAA'),'data:image/jpeg;base64,AAAA');
 const prior=globalThis.Image;globalThis.Image=class{set src(v){queueMicrotask(()=>this.onerror())}};try{await assert.rejects(preparePhoto(new File(['test'],'phone.heic',{type:'image/heic'})),/Export it as JPEG/)}finally{globalThis.Image=prior}
});
test('phone photo processing creates a bounded center crop and strips the original file from saved profile content',async()=>{const priorImage=globalThis.Image,priorDocument=globalThis.document;let draw;globalThis.Image=class{naturalWidth=1600;naturalHeight=1200;set src(v){queueMicrotask(()=>this.onload())}};globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},drawImage(...args){draw=args}}),toDataURL:(type,quality)=>{assert.equal(type,'image/jpeg');assert.equal(quality,.78);return 'data:image/jpeg;base64,AAAA'}})};try{const result=await preparePhoto(new File(['phone photo'],'photo.jpg',{type:'image/jpeg'}));assert.equal(result,'data:image/jpeg;base64,AAAA');assert.deepEqual(draw.slice(1),[200,0,1200,1200,0,0,320,320]);}finally{globalThis.Image=priorImage;globalThis.document=priorDocument}});
