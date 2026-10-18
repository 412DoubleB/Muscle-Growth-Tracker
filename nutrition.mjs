import {addDays,clone,hash,norm,now,touch,uid,dayFor} from './core.mjs?v=8.1.0';
import {ORIGINAL_RECIPE_SPECS} from './recipes.mjs?v=8.1.0';
import {EXTRA_FOOD_ROWS} from './foods-extra.mjs?v=8.1.0';

export function targetsForDate(state,date){const n=state.nutrition,day=dayFor(state,date),next=dayFor(state,addDays(date,1)),training=day.kind==='strength'||day.kind==='run',nextTraining=next.kind==='strength'||next.kind==='run';const value=(a,b)=>a!==''&&a!=null&&Number.isFinite(+a)?+a:+b;return {...n,calories:value(training?n.trainingCalories:n.restCalories,n.calories),carbs:value(!training&&nextTraining&&n.preTrainingCarbs!==''&&n.preTrainingCarbs!=null?n.preTrainingCarbs:training?n.trainingCarbs:n.restCarbs,n.carbs),dayType:training?'Training day':'Recovery day',nextDayType:nextTraining?'Training tomorrow':'Recovery tomorrow'}}
export function leftoversAvailable(state,leftover){const reserved=Object.values(state.meals).flatMap(d=>d.items||[]).filter(m=>!m.deleted&&m.leftoverId===leftover.id&&!m.leftoverConsumed).reduce((n,m)=>n+(+m.householdServings||+m.servings||1),0);return Math.max(0,+leftover.qty-reserved)}

// Approximate label-style values per 100 g (or 100 ml for liquids).
// Ingredient quantities in the built-in recipes are raw/dry unless explicitly cooked.
export const FOODS=[
 ['chicken','Chicken breast, raw',23,0,2,110,'g',500,[], 'Meat & fish'],
 ['turkey','Ground turkey, lean raw',21,0,8,160,'g',450,[], 'Meat & fish'],
 ['salmon','Salmon, raw',20,0,13,208,'g',450,[], 'Meat & fish'],
 ['tuna','Tuna, canned drained',25,0,1,109,'g',140,[], 'Meat & fish'],
 ['tofu','Firm tofu',15,3,8,144,'g',400,['vegan'],'Chilled'],
 ['lentils','Lentils, cooked',9,20,0.4,116,'g',400,['vegan'],'Cans & grains'],
 ['chickpeas','Chickpeas, cooked',8.9,27.4,2.6,164,'g',400,['vegan'],'Cans & grains'],
 ['eggs','Whole egg, edible weight',12.6,0.7,9.5,143,'g',600,['vegetarian','egg'],'Chilled'],
 ['whites','Egg whites',11,0.7,0.2,52,'g',500,['vegetarian','egg'],'Chilled'],
 ['yogurt','Greek yogurt, plain nonfat',10,3.6,0.4,59,'g',900,['vegetarian','milk'],'Chilled'],
 ['cottage','Cottage cheese, low fat',12,3.4,2.3,85,'g',450,['vegetarian','milk'],'Chilled'],
 ['whey','Whey protein, vanilla',80,8,6,400,'g',900,['vegetarian','milk'],'Pantry'],
 ['soyprotein','Soy protein powder',85,3,1,361,'g',500,['vegan','soy'],'Pantry'],
 ['oats','Rolled oats, dry',13,68,7,389,'g',1000,['vegan'],'Cans & grains'],
 ['rice','Rice, dry',7,80,0.7,365,'g',1000,['vegan'],'Cans & grains'],
 ['quinoa','Quinoa, dry',14,64,6,368,'g',500,['vegan'],'Cans & grains'],
 ['pasta','Whole wheat pasta, dry',13,70,2.5,348,'g',450,['vegan','wheat'],'Cans & grains'],
 ['bread','Whole grain bread',12,43,4,255,'g',600,['vegan','wheat'],'Bread'],
 ['potato','Potato, raw',2,17,0.1,77,'g',2000,['vegan'],'Produce'],
 ['banana','Banana, peeled',1.1,23,0.3,89,'g',700,['vegan'],'Produce'],
 ['berries','Mixed berries',0.7,12,0.3,50,'g',450,['vegan'],'Produce'],
 ['broccoli','Broccoli, raw',2.8,7,0.4,34,'g',500,['vegan'],'Produce'],
 ['spinach','Spinach, raw',2.9,3.6,0.4,23,'g',150,['vegan'],'Produce'],
 ['peppers','Sweet peppers, raw',1,6,0.3,31,'g',500,['vegan'],'Produce'],
 ['tomato','Tomatoes',0.9,3.9,0.2,18,'g',400,['vegan'],'Produce'],
 ['olive','Olive oil',0,0,100,884,'g',450,['vegan'],'Pantry'],
 ['pb','Peanut butter',25,20,50,588,'g',450,['vegan','peanut'],'Pantry'],
 ['almonds','Almonds',21,22,50,579,'g',250,['vegan','tree nut'],'Pantry'],
 ['avocado','Avocado, edible flesh',2,8.5,15,160,'g',300,['vegan'],'Produce'],
 ['milk','Milk, 1%',3.4,5,1,42,'ml',1900,['vegetarian','milk'],'Chilled'],
 ['soymilk','Unsweetened soy milk',3.3,0.7,1.8,33,'ml',1000,['vegan','soy'],'Chilled'],
 ['honey','Honey',0,82,0,304,'g',350,['vegetarian'],'Pantry'],
 ['maple','Maple syrup',0,67,0,260,'g',350,['vegan'],'Pantry'],
 ['blackbeans','Black beans, cooked drained',9,24,0.5,132,'g',400,['vegan'],'Cans & grains'],
 ['whitebeans','White beans, cooked drained',8,21,0.5,127,'g',400,['vegan'],'Cans & grains'],
 ['edamame','Edamame, shelled',12,9,5,121,'g',400,['vegan','soy'],'Frozen'],
 ['silkentofu','Silken tofu, ready to eat',5,2,3,55,'g',400,['vegan','soy'],'Chilled'],
 ['lemon','Lemon juice',0.4,7,0.2,22,'g',200,['vegan'],'Produce'],
 ['lime','Lime juice',0.4,8,0.1,25,'g',200,['vegan'],'Produce'],
 ['garlic','Garlic',6.4,33,0.5,149,'g',60,['vegan'],'Produce'],
 ['onion','Onion',1.1,9.3,0.1,40,'g',1000,['vegan'],'Produce'],
 ['ginger','Fresh ginger',1.8,18,0.8,80,'g',100,['vegan'],'Produce'],
 ['cabbage','Green cabbage',1.3,5.8,0.1,25,'g',1000,['vegan'],'Produce'],
 ['carrot','Carrots',0.9,10,0.2,41,'g',1000,['vegan'],'Produce'],
 ['cucumber','Cucumber',0.7,3.6,0.1,15,'g',300,['vegan'],'Produce'],
 ['apple','Apple',0.3,14,0.2,52,'g',1000,['vegan'],'Produce'],
 ['orange','Orange, peeled',0.9,12,0.1,47,'g',1000,['vegan'],'Produce'],
 ['cherries','Cherries, pitted',1,16,0.2,63,'g',450,['vegan'],'Produce'],
 ['feta','Feta cheese',14,4,21,264,'g',200,['vegetarian','milk'],'Chilled'],
 ['miso','Miso paste',12,26,6,198,'g',300,['vegan','soy','wheat'],'Pantry'],
 ['soysauce','Soy sauce',8,5,0.6,53,'g',250,['vegan','soy','wheat'],'Pantry'],
 ['harissa','Harissa paste',2,10,10,140,'g',150,['vegan'],'Pantry'],
 ['mustard','Dijon mustard',4,6,4,66,'g',200,['vegan','mustard'],'Pantry'],
 ['cocoa','Unsweetened cocoa powder',20,58,14,228,'g',200,['vegan'],'Pantry'],
 ['oregano','Dried oregano',9,69,4,265,'g',15,['vegan'],'Herbs & spices'],
 ['paprika','Smoked paprika',14,54,13,282,'g',40,['vegan'],'Herbs & spices'],
 ['cumin','Ground cumin',18,44,22,375,'g',40,['vegan'],'Herbs & spices'],
 ['turmeric','Ground turmeric',10,67,3,312,'g',40,['vegan'],'Herbs & spices'],
 ['cinnamon','Ground cinnamon',4,81,1,247,'g',40,['vegan'],'Herbs & spices'],
 ['dill','Fresh dill',3.5,7,1,43,'g',20,['vegan'],'Produce'],
 ['salt','Salt',0,0,0,0,'g',500,['vegan'],'Herbs & spices']
,...EXTRA_FOOD_ROWS].map(([id,name,protein,carbs,fat,calories,unit,packageQty,tags,aisle])=>({id,name,protein,carbs,fat,calories,unit,packageQty,tags,aisle}));
export const foodFor=id=>FOODS.find(f=>f.id===id||norm(f.name)===norm(id));
// Soy is an intrinsic allergen in tofu, regardless of brand wording.
foodFor('tofu').tags.push('soy');
for(const id of ['salmon','tuna'])foodFor(id).tags.push('fish');
foodFor('pb').tags.push('peanuts');
const ingredient=(id,qty)=>{const f=foodFor(id);return {foodId:id,name:f.name,qty,unit:f.unit,packageQty:f.packageQty,aisle:f.aisle}};
function recipe(id,name,slot,items,steps,tags=['Any']){return {id,name,slots:[slot],servings:1,ingredients:items.map(([id,q])=>ingredient(id,q)),steps,tags,updatedAt:'2026-10-17T00:00:00.000Z',source:'Built-in estimates; check your product labels.'}}
export const STARTER_RECIPES=[
 recipe('r-yogurt','Protein yogurt & oat bowl','Breakfast',[['yogurt',250],['oats',50],['whey',20],['berries',100],['pb',15]],['Mix yogurt and protein powder.','Stir in oats; top with berries and peanut butter.','For overnight oats, cover and refrigerate.'],['Vegetarian']),
 recipe('r-eggs','Eggs, whites & whole grain toast','Breakfast',[['eggs',100],['whites',180],['bread',80],['spinach',50],['olive',5]],['Warm the oil in a pan.','Cook spinach, then add eggs and whites; cook through.','Toast the bread and serve.'],['Vegetarian']),
 recipe('r-cottage','Cottage cheese banana bowl','Breakfast',[['cottage',250],['banana',120],['oats',40],['almonds',15]],['Slice the banana.','Combine cottage cheese, oats, banana and almonds.'],['Vegetarian']),
 recipe('r-vegan-oats','Soy protein overnight oats','Breakfast',[['oats',60],['soymilk',250],['soyprotein',25],['berries',100],['pb',15]],['Mix oats, milk and protein powder.','Add berries and peanut butter.','Cover and refrigerate overnight.'],['Vegan','Vegetarian']),
 recipe('r-chicken-rice','Chicken, rice & broccoli','Lunch',[['chicken',200],['rice',80],['broccoli',200],['olive',12]],['Cook the dry rice according to its package.','Cook chicken until the thickest part reaches 165°F / 74°C.','Steam broccoli and serve with the oil.']),
 recipe('r-turkey-pasta','Turkey tomato pasta','Lunch',[['turkey',200],['pasta',80],['tomato',150],['spinach',50],['olive',8]],['Cook pasta according to the package.','Brown turkey until it reaches 165°F / 74°C.','Simmer tomatoes and spinach with the turkey; toss with pasta and oil.']),
 recipe('r-tuna','Tuna & avocado toast','Lunch',[['tuna',180],['bread',100],['avocado',80],['tomato',100]],['Drain the canned tuna.','Toast bread; top with avocado, tuna and sliced tomato.']),
 recipe('r-tofu-quinoa','Tofu quinoa & peppers','Lunch',[['tofu',230],['quinoa',65],['peppers',200],['olive',8]],['Cook dry quinoa according to package directions.','Brown tofu and peppers in oil until hot.','Serve over the quinoa.'],['Vegan','Vegetarian']),
 recipe('r-salmon','Salmon, potatoes & greens','Dinner',[['salmon',200],['potato',300],['broccoli',150],['olive',8]],['Roast potatoes with oil until tender.','Bake salmon until the thickest part reaches 145°F / 63°C.','Steam broccoli and serve.']),
 recipe('r-chicken-quinoa','Chicken quinoa & avocado','Dinner',[['chicken',200],['quinoa',75],['avocado',70],['spinach',80],['olive',5]],['Cook quinoa according to package directions.','Cook chicken to 165°F / 74°C.','Serve with spinach, avocado and oil.']),
 recipe('r-lentil','Lentil tofu rice bowl','Dinner',[['lentils',200],['tofu',200],['rice',45],['peppers',150],['olive',8]],['Cook dry rice.','Heat cooked lentils, tofu and peppers until hot.','Serve with rice and oil.'],['Vegan','Vegetarian']),
 recipe('r-chickpea','Chickpea quinoa & tofu salad','Dinner',[['chickpeas',150],['tofu',200],['quinoa',45],['tomato',150],['olive',8]],['Cook quinoa and let cool.','Combine cooked chickpeas, tofu and tomatoes.','Toss with quinoa and oil.'],['Vegan','Vegetarian']),
 recipe('r-shake','Vanilla banana protein shake','Snack',[['whey',35],['milk',250],['banana',120],['pb',15]],['Blend milk, protein powder, banana and peanut butter.','Serve chilled.'],['Vegetarian']),
 recipe('r-yogurt-snack','Greek yogurt, berries & almonds','Snack',[['yogurt',300],['berries',100],['almonds',25],['honey',10]],['Combine all ingredients.'],['Vegetarian']),
 recipe('r-soy-shake','Plant protein banana shake','Snack',[['soyprotein',35],['soymilk',250],['banana',120],['pb',15]],['Blend all ingredients until smooth.'],['Vegan','Vegetarian']),
 recipe('r-tofu-snack','Tofu & peanut protein bowl','Snack',[['tofu',150],['soyprotein',20],['berries',100],['pb',15],['maple',10]],['Blend tofu and protein powder until smooth.','Top with berries, peanut butter and maple syrup.'],['Vegan','Vegetarian'])
];
export const ORIGINAL_RECIPES=ORIGINAL_RECIPE_SPECS.map(([id,name,slot,servings,prepMinutes,cookMinutes,items,steps,tags])=>({...recipe(id,name,slot,items,steps,tags),servings,prepMinutes,cookMinutes,collection:'original-2026-10',source:'Original AI-authored Muscle Growth Tracker recipe · not kitchen tested.',aiGenerated:true,storage:'Cool promptly and refrigerate in shallow covered containers. Use cooked leftovers within 3–4 days; reheat cooked leftovers to 165°F / 74°C. Follow ingredient labels and local food-safety guidance.',safetyUrl:'https://www.foodsafety.gov/food-safety-charts/cold-food-storage-charts'}));
export function addOriginalRecipes(state){for(const r of ORIGINAL_RECIPES)if(!state.recipes.some(x=>x.id===r.id))state.recipes.push(clone(r));return state}
export const PREFERENCE_OPTIONS={
 meal:[['poultry','Chicken & turkey'],['fish','Fish & seafood'],['meat','Lean beef & pork'],['plant','Beans, lentils & tofu'],['grains','Rice, pasta & whole grains'],['vegetables','Vegetables & salads']],
 breakfast:[['oats','Oats & whole grains'],['eggs','Egg breakfasts'],['dairy','Yogurt & cottage cheese'],['fruit','Fruit'],['plant','Plant-based breakfasts']],
 snack:[['dairy','Yogurt & cottage cheese'],['fruit','Fruit'],['nuts','Nuts & nut butter'],['seeds','Seeds & seed butter'],['shake','Protein shakes & pudding'],['savory','Savory plant snacks']]
};
const categoryFoods={poultry:['chicken','turkey'],fish:['salmon','tuna','cod','shrimp'],meat:['beef','pork'],plant:['tofu','silkentofu','soyprotein','chickpeas','lentils','blackbeans','whitebeans','edamame','tempeh','seitan','redlentils','kidneybeans'],grains:['rice','pasta','quinoa','bread','oats','couscous','barley','soba','buckwheat','bulgur','tortilla'],vegetables:['broccoli','spinach','peppers','cabbage','cucumber','zucchini','mushrooms','cauliflower','greenbeans','asparagus','romaine'],oats:['oats','bread'],eggs:['eggs','whites'],dairy:['yogurt','cottage','milk','whey'],fruit:['banana','berries','apple','orange','cherries','pineapple','mango','peach','pear'],nuts:['almonds','pb','walnuts'],seeds:['pumpkinseeds','chia','flax','tahini','sesame'],shake:['whey','soyprotein','silkentofu'],savory:['chickpeas','edamame']};
export function preferenceScore(r,prefs,slot){const selected=prefs[slot==='Breakfast'?'breakfastCategories':slot==='Snack'?'snackCategories':'mealCategories']||[];return selected.filter(c=>(categoryFoods[c]||[]).some(id=>r.ingredients.some(i=>i.foodId===id))).length}
export function recipeMacros(r,portions=1){const totals={calories:0,protein:0,carbs:0,fat:0};if(!r.manualMacros&&r.ingredients?.length&&r.ingredients.every(i=>foodFor(i.foodId))){for(const it of r.ingredients){const f=foodFor(it.foodId),v=convertQty(+it.qty,it.unit,f.unit);if(v===null)throw Error(`Incompatible unit for ${it.name}.`);for(const key in totals)totals[key]+=f[key]*v/100}}else for(const key in totals)totals[key]=(+r[key]||0)*(+r.servings||1);for(const key in totals)totals[key]=totals[key]/(+r.servings||1)*portions;return totals}
export function dayMacros(state,date,eatenOnly=false){const out={calories:0,protein:0,carbs:0,fat:0};for(const m of state.meals[date]?.items||[]){if(m.deleted||eatenOnly&&!m.eaten)continue;const r=(m.recipeSnapshot||state.recipes.find(r=>r.id===m.recipeId));if(!r)continue;const macros=recipeMacros(r,+m.servings||1);for(const k in out)out[k]+=macros[k]}return out}
const unitMap={g:['mass',1],kg:['mass',1000],mg:['mass',.001],oz:['mass',28.349523125],lb:['mass',453.59237],ml:['volume',1],l:['volume',1000],tsp:['volume',4.92892],tbsp:['volume',14.7868],cup:['volume',236.588],each:['count',1],unit:['count',1]};
export function convertQty(q,from,to){const a=unitMap[String(from).toLowerCase()],b=unitMap[String(to).toLowerCase()];if(norm(from)===norm(to))return q;return a&&b&&a[0]===b[0]?q*a[1]/b[1]:null}
export function allowedRecipe(r,prefs){if(r.deleted)return false;if(r.allergenReviewRequired&&((prefs.allergens||[]).length||String(prefs.exclude||'').trim()))return false;const excluded=[...(prefs.exclude||'').split(/[,;\n]/),...(prefs.allergens||[])].map(x=>x.trim().toLowerCase()).filter(Boolean);const tokens=[r.name,...(r.tags||[]),...(r.allergens||[]),...(r.ingredients||[]).flatMap(i=>[i.name,...(foodFor(i.foodId)?.tags||[])])].join(' ').toLowerCase();if(excluded.some(x=>tokens.includes(x)))return false;return prefs.diet==='Vegan'?(r.tags||[]).includes('Vegan'):prefs.diet==='Vegetarian'?(r.tags||[]).some(t=>['Vegan','Vegetarian'].includes(t)):true}
function prefsStyleScore(r,diet,m){return diet==='Mediterranean'?(r.tags?.includes('Mediterranean')?-60:20):diet==='High protein'?-Math.min(80,m.protein*4/Math.max(1,m.calories)*100):diet==='Lower carb'?m.carbs*4/Math.max(1,m.calories)*100:0}
export function generateMeals(state,{start,days=7,replace=false}={}){const macroCache=new WeakMap();const baseMacros=r=>{if(!macroCache.has(r))macroCache.set(r,recipeMacros(r));return macroCache.get(r)};const out={},warnings=[],recipes=state.recipes.filter(r=>allowedRecipe(r,state.nutrition)),slots=['Breakfast','Lunch','Dinner','Snack'],lastUsed=new Map(),leftoverStock=(state.leftovers||[]).filter(l=>!l.deleted).map(l=>({...clone(l),available:leftoversAvailable(state,l)})).sort((a,b)=>a.expiry.localeCompare(b.expiry));for(const [date,day]of Object.entries(state.meals))if(date<start)for(const m of day.items||[])if(!m.deleted)lastUsed.set(m.recipeId,date);for(let d=0;d<days;d++){const date=addDays(start,d),targets=targetsForDate(state,date);if(state.meals[date]?.items?.some(m=>!m.deleted)&&!replace){warnings.push(`${date}: existing meals preserved.`);continue}if(state.meals[date]?.items?.some(m=>m.eaten)){warnings.push(`${date}: eaten meals preserved.`);continue}const items=[];for(const slot of slots){const household=+state.nutrition.servings||1;const left=['Lunch','Dinner'].includes(slot)?leftoverStock.find(l=>l.expiry>=date&&l.available>=household&&allowedRecipe(l.recipeSnapshot,state.nutrition)):null;if(left){items.push({id:uid(),recipeId:left.recipeId,recipeSnapshot:clone(left.recipeSnapshot),slot,servings:1,householdServings:household,leftoverId:left.id,eaten:false,doneSteps:[]});left.available-=household;continue}const candidates=recipes.filter(r=>(r.slots||[]).includes(slot));if(!candidates.length){warnings.push(`${date}: no ${slot.toLowerCase()} recipe fits your diet and exclusions.`);continue}const preferred=(slot==='Breakfast'?state.nutrition.breakfastFoods:slot==='Snack'?state.nutrition.snackFoods:state.nutrition.preferredFoods)||'';const words=preferred.split(/[,;\n]/).map(x=>x.trim().toLowerCase()).filter(Boolean);const scoreRecipe=r=>{const text=[r.name,...r.ingredients.map(i=>i.name)].join(' ').toLowerCase();const repeated=lastUsed.has(r.id)&&lastUsed.get(r.id)>addDays(date,-(+state.nutrition.mealRepeatDays||2));const available=r.ingredients.filter(i=>state.pantry.some(p=>!p.deleted&&+p.qty>0&&(!p.expiry||p.expiry>=date)&&(p.foodId&&p.foodId===i.foodId||norm(p.name)===norm(i.name)))).length;const macros=baseMacros(r);const style=prefsStyleScore(r,state.nutrition.diet,macros),fraction=({Breakfast:.25,Lunch:.3,Dinner:.3,Snack:.15})[slot],fit=['calories','protein','carbs'].reduce((n,k)=>n+Math.abs(macros[k]-(+targets[k]||1)*fraction)/Math.max(1,(+targets[k]||1)*fraction)*(k==='protein'?2:1),0)*25;return(repeated?1000:0)-words.filter(w=>text.includes(w)).length*80-preferenceScore(r,state.nutrition,slot)*80-available*10-(r.collection?35:0)+style+fit+(hash(date+r.id)%20)};const recipeScores=new Map(candidates.map(r=>[r,scoreRecipe(r)]));candidates.sort((a,b)=>recipeScores.get(a)-recipeScores.get(b));const r=candidates[0];if(lastUsed.has(r.id)&&lastUsed.get(r.id)>addDays(date,-(+state.nutrition.mealRepeatDays||2)))warnings.push(date+': '+r.name+' repeated because matching choices are limited.');lastUsed.set(r.id,date);items.push({id:uid(),recipeId:r.id,recipeSnapshot:clone(r),slot,servings:1,householdServings:+state.nutrition.servings||1,eaten:false,doneSteps:[]})}const score=()=>{const totals={calories:0,protein:0,carbs:0,fat:0};for(const m of items){const macro=baseMacros(m.recipeSnapshot);for(const k in totals)totals[k]+=macro[k]*m.servings}return Object.keys(totals).reduce((sum,k)=>sum+Math.pow((totals[k]-(+targets[k]||1))/(+targets[k]||1),2)*(k==='protein'?2:1),0)};for(let round=0;round<8;round++)for(const m of items){if(m.leftoverId)continue;let best=score(),portion=m.servings;for(let p=.5;p<=2.5;p+=.25){m.servings=p;const s=score();if(s<best){best=s;portion=p}}m.servings=portion;m.householdServings=portion*(+targets.servings||1)}out[date]=touch({id:date,date,items});const totals=items.reduce((acc,m)=>{const v=recipeMacros(m.recipeSnapshot,m.servings);for(const k in acc)acc[k]+=v[k];return acc},{calories:0,protein:0,carbs:0,fat:0});if(Object.keys(totals).some(k=>Math.abs(totals[k]-(+targets[k]||0))/Math.max(1,+targets[k]||0)>.15))warnings.push(`${date}: available recipes fall more than 15% from at least one calorie or macro target; review portions.`)}return {meals:out,warnings}}
export function shoppingList(state,start,days=7){const stock=state.pantry.filter(p=>!p.deleted&&+p.qty>0).map(clone).sort((a,b)=>(a.expiry||'9999').localeCompare(b.expiry||'9999')),needed=new Map(),warnings=[];for(let d=0;d<days;d++){const date=addDays(start,d);for(const m of state.meals[date]?.items||[]){if(m.deleted||m.eaten||m.leftoverId)continue;const r=m.recipeSnapshot||state.recipes.find(x=>x.id===m.recipeId);for(const it of r?.ingredients||[]){let q=+it.qty*(m.householdServings||m.servings||1)/(+r.servings||1),have=0;for(const p of stock){if(norm(p.name)!==norm(it.name)&&!(p.foodId&&p.foodId===it.foodId))continue;if(p.expiry&&p.expiry<date)continue;const converted=convertQty(+p.qty,p.unit,it.unit);if(converted===null){warnings.push(`${p.name}: pantry unit ${p.unit} cannot be compared with ${it.unit}.`);continue}const used=Math.min(q,converted);p.qty-=convertQty(used,it.unit,p.unit);q-=used;have+=used;if(q<=0)break}const f=foodFor(it.foodId),unit=f?.unit||it.unit,key=(it.foodId||norm(it.name))+'|'+unit;let row=needed.get(key)||{id:key,name:it.name,foodId:it.foodId,qty:0,unit,have:0,packageQty:+it.packageQty||f?.packageQty||null,aisle:it.aisle||f?.aisle||'Other'};const amount=convertQty(q,it.unit,unit),available=convertQty(have,it.unit,unit);if(amount===null){warnings.push(`${it.name}: recipe units need review.`);continue}row.qty+=amount;row.have+=available;needed.set(key,row)}}}return {items:[...needed.values()].filter(x=>x.qty>.0001).map(x=>({...x,qty:Math.ceil(x.qty*10-1e-8)/10,packages:x.packageQty?Math.ceil(x.qty/x.packageQty):null})).sort((a,b)=>a.aisle.localeCompare(b.aisle)||a.name.localeCompare(b.name)),warnings:[...new Set(warnings)]}}
export function consumePantry(state,date,mealId){const meal=state.meals[date]?.items.find(x=>x.id===mealId);if(!meal||meal.pantryConsumed)return;const r=meal.recipeSnapshot||state.recipes.find(x=>x.id===meal.recipeId);for(const it of r?.ingredients||[]){let remaining=+it.qty*(meal.householdServings||meal.servings||1)/(+r.servings||1);for(const p of state.pantry.filter(p=>!p.deleted&&(!p.expiry||p.expiry>=date)).sort((a,b)=>(a.expiry||'9999').localeCompare(b.expiry||'9999'))){if(norm(p.name)!==norm(it.name)&&!(p.foodId&&p.foodId===it.foodId))continue;const available=convertQty(+p.qty,p.unit,it.unit);if(available===null)continue;const use=Math.min(remaining,available);p.qty=Math.max(0,+p.qty-convertQty(use,it.unit,p.unit));p.updatedAt=now();remaining-=use;if(remaining<=0)break}}meal.pantryConsumed=true;state.meals[date].updatedAt=now()}
