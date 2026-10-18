import {clone,hash,norm,now} from './core.mjs?v=8.1.1';
import {foodFor,FOODS,recipeMacros,convertQty} from './nutrition.mjs?v=8.1.1';

export const MAX_PACK_BYTES=5*1024*1024;
export const MAX_PACK_RECIPES=250;
const slots=['Breakfast','Lunch','Dinner','Snack'];
const units=['g','kg','mg','oz','lb','ml','l','tsp','tbsp','cup','each','unit'];
const record=v=>v&&typeof v==='object'&&!Array.isArray(v);
function textValue(v,label,max,required=true){if(v==null&&!required)return '';if(typeof v!=='string'||required&&!v.trim()||v.length>max)throw Error(`${label} must be ${required?'non-empty ':''}text of at most ${max} characters.`);return v.trim()}
function numberValue(v,label,min,max){if(typeof v==='boolean'||v===''||v==null||!Number.isFinite(+v)||+v<min||+v>max)throw Error(`${label} must be between ${min} and ${max}.`);return +v}
export function safeSourceUrl(v){if(!v)return '';const s=textValue(v,'Source URL',2000);try{const u=new URL(s);if(u.protocol!=='https:'||u.username||u.password)throw Error();return u.href}catch{throw Error('Source URL must be an HTTPS address.')}}
export function normalizeRecipe(input){
 if(!record(input))throw Error('Recipe must be an object.');
 const name=textValue(input.name,'Recipe name',160),servings=numberValue(input.servings,'Recipe yield',.25,100);
 const selected=Array.isArray(input.slots)?input.slots:[input.slot||'Lunch'];if(!selected.length||selected.some(s=>!slots.includes(s)))throw Error('Meal slots must be Breakfast, Lunch, Dinner or Snack.');
 if(!Array.isArray(input.ingredients)||!input.ingredients.length||input.ingredients.length>80)throw Error('Use 1–80 measured ingredients.');
 let unknown=false;
 const ingredients=input.ingredients.map((i,index)=>{
  if(!record(i))throw Error('Ingredient '+(index+1)+' must contain quantity, unit and name or foodId.');
  const qty=numberValue(i.qty,'Ingredient '+(index+1)+' quantity',.001,100000),unit=textValue(i.unit,'Ingredient unit',12).toLowerCase();if(!units.includes(unit))throw Error('Unsupported ingredient unit: '+unit+'.');
  const food=foodFor(i.foodId||i.name);if(i.foodId&&!food)throw Error('Unknown foodId '+String(i.foodId).slice(0,60)+'. Use a food reference ID or a custom name without foodId.');
  const name=food?.name||textValue(i.name,'Ingredient name',200);if(food&&convertQty(qty,unit,food.unit)===null)throw Error(name+': use a mass/volume unit compatible with '+food.unit+'.');
  if(!food)unknown=true;
  return {name,qty,unit,...(food?{foodId:food.id,packageQty:food.packageQty,aisle:food.aisle}:{}),...(i.packageQty!=null?{packageQty:numberValue(i.packageQty,'Package size',.001,100000)}:{})};
 });
 const steps=typeof input.steps==='string'?input.steps.split('\n').filter(s=>s.trim()):input.steps;if(!Array.isArray(steps)||!steps.length||steps.length>40)throw Error('Use 1–40 cooking steps.');
 const tags=Array.isArray(input.tags)?input.tags.map(v=>textValue(v,'Recipe tag',60)):[];if(tags.length>30)throw Error('Use at most 30 recipe tags.');
 const allergens=Array.isArray(input.allergens)?input.allergens.map(v=>textValue(v,'Allergen',60).toLowerCase()):[];
 const recipe={id:'',name,servings,slots:[...new Set(selected)],ingredients,steps:steps.map(s=>textValue(s,'Cooking step',4000)),tags:[...new Set(tags)],allergens:[...new Set(allergens)],manualMacros:unknown||input.manualMacros===true,origin:'imported',source:textValue(input.source,'Supplied source',500,false)||'Imported recipe · source supplied by you',sourceUrl:safeSourceUrl(input.sourceUrl),aiGenerated:input.aiGenerated===true,allergenReviewRequired:unknown,updatedAt:now()};
 for(const key of ['prepMinutes','cookMinutes'])if(input[key]!=null&&input[key]!=='')recipe[key]=numberValue(input[key],key,0,1440);
 for(const key of ['storage','notes'])if(input[key]!=null)recipe[key]=textValue(input[key],key,3000,false);
 if(recipe.manualMacros)for(const key of ['calories','protein','carbs','fat'])recipe[key]=numberValue(input[key],key+' per serving',key==='calories'?1:0,key==='calories'?5000:1000);
 const macro=recipeMacros(recipe);if(macro.calories<1)throw Error('Recipe needs a positive calorie estimate.');
 const identity=norm(name)+'|'+ingredients.map(i=>[i.foodId||norm(i.name),i.qty,i.unit].join(':')).sort().join('|')+'|'+servings;
 recipe.id='recipe-import-'+hash(identity);return recipe;
}
export function previewRecipePack(raw,existing=[]){
 const list=Array.isArray(raw)?raw:record(raw)?raw.recipes:null;
 if(!Array.isArray(list)||!list.length)throw Error('Choose a recipe JSON file containing a recipes array. Download the template to see the format.');
 if(list.length>MAX_PACK_RECIPES)throw Error('Import at most '+MAX_PACK_RECIPES+' recipes at a time.');
 if(record(raw)&&raw.format&&raw.format!=='mgt-recipes')throw Error('Unsupported recipe file format.');
 if(record(raw)&&raw.version!=null&&raw.version!==1)throw Error('This recipe file version is not supported.');
 const recipes=[],errors=[],duplicates=[],warnings=[],seenNames=new Set(existing.map(r=>norm(r.name))),seenIds=new Set(existing.map(r=>r.id));
 for(let index=0;index<list.length;index++)try{
  const recipe=normalizeRecipe(list[index]),originalId=typeof list[index]?.id==='string'?list[index].id:'';
  if(seenNames.has(norm(recipe.name))||seenIds.has(recipe.id)||originalId&&seenIds.has(originalId)){duplicates.push({name:recipe.name,reason:'Already saved or repeated in this file; existing version kept.'});continue}
  seenNames.add(norm(recipe.name));seenIds.add(recipe.id);recipes.push(recipe);
  if(recipe.allergenReviewRequired)warnings.push(recipe.name+': custom ingredients need an allergen review before use with allergen exclusions.');
  const m=recipeMacros(recipe),fromMacros=m.protein*4+m.carbs*4+m.fat*9;if(Math.abs(fromMacros-m.calories)/m.calories>.3)warnings.push(recipe.name+': calorie and macro estimates differ substantially; review the supplied nutrition.');
 }catch(e){errors.push({row:index+1,name:typeof list[index]?.name==='string'?list[index].name.slice(0,160):'Recipe '+(index+1),message:e.message})}
 return {recipes,errors,duplicates,warnings};
}
export function mergeRecipePack(state,preview,{reviewedAllergens=false}={}){
 const next=clone(state),seen=new Set(next.recipes.map(r=>norm(r.name)));let added=0;
 for(const r of preview.recipes){if(seen.has(norm(r.name))||next.recipes.some(x=>x.id===r.id))continue;next.recipes.push({...clone(r),allergenReviewRequired:reviewedAllergens?false:r.allergenReviewRequired,updatedAt:now()});seen.add(norm(r.name));added++}
 next.updatedAt=now();return {state:next,added};
}
export function exportRecipePack(recipes){return {format:'mgt-recipes',version:1,title:'MENEI recipes',exportedAt:now(),recipes:clone(recipes.filter(r=>!r.deleted))}}
export function recipePrompt(prefs={}){return `Create 10 original detailed practical recipes for MENEI. Return ONLY one valid JSON object with format:"mgt-recipes",version:1,recipes:[...]. Do not copy third-party recipe text. Include real measured quantities, complete 4–6 step cooking instructions, timings and sensible servings. Mark aiGenerated:true and source:"AI-authored original recipe; not kitchen tested". Recipe fields: name, slots:["Breakfast"|"Lunch"|"Dinner"|"Snack"], servings, prepMinutes, cookMinutes, ingredients:[{foodId,qty,unit}], steps:[strings], tags:["Vegetarian"|"Vegan"|"High protein"|"Mediterranean" when appropriate], storage. Quantities cover the WHOLE recipe yield and use the raw/dry/cooked state in the food reference name. Use only foodIds below; water is untracked. Do not invent food values. Poultry must reach165F/74C; groundbeef160F/71C; wholepork145F/63C then3min rest; fish145F/63C; eggdishes160F/71C. These food values are approximate, and finished recipes are not kitchen tested. Current diet:${prefs.diet||'Any'}; avoid:${[prefs.exclude,...(prefs.allergens||[])].filter(Boolean).join(', ')||'none specified'}. Daily targets:${prefs.calories||2400}kcal,${prefs.protein||200}g protein; portions will be adjusted by the app. Food references (id, name, unit):\n`+FOODS.map(f=>[f.id,f.name,f.unit].join(' | ')).join('\n')}
