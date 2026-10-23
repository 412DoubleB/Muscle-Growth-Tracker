import {BREAKFAST_SNACK_SPECS} from './recipes-breakfast-snacks.mjs?v=8.2.0';
import {MEAT_FISH_SPECS} from './recipes-meat-fish.mjs?v=8.2.0';
import {PLANT_SPECS} from './recipes-plant.mjs?v=8.2.0';
// Original recipes written for Muscle Growth Tracker. No third-party recipe text.
// These are development recipes, not kitchen-tested recipes. Quantities are raw/dry
// except ingredients explicitly described as cooked, canned, or drained.
export const ORIGINAL_RECIPE_SPECS = [
  ['o-lemon-chicken','Lemon-oregano chicken with blistered pepper rice','Lunch',2,15,25,[['chicken',400],['rice',150],['peppers',250],['spinach',80],['olive',20],['lemon',60],['garlic',8],['oregano',2],['salt',2]],[
    'Rinse the rice and cook it with the water amount on its package. Keep covered off the heat for 5 minutes, then fluff.',
    'Cut chicken into 2 cm pieces. Toss with half the oil, minced garlic, oregano, salt and half the lemon juice. Keep raw chicken separate from the vegetables.',
    'Heat a wide skillet over medium-high heat. Add the remaining oil and sliced peppers; cook 6–8 minutes, stirring occasionally, until browned at the edges. Transfer to a plate.',
    'Add chicken in one layer. Cook for 8–12 minutes, turning as it browns, until the thickest pieces reach 165°F / 74°C. Add a splash of water if the pan dries out.',
    'Return the peppers, fold in spinach until wilted, and finish with the remaining lemon juice. Divide the rice and chicken mixture between two servings.'
  ],['Mediterranean','High protein']],
  ['o-smoky-turkey','Smoky turkey, black bean & tomato skillet','Dinner',3,15,25,[['turkey',500],['blackbeans',360],['tomato',400],['peppers',250],['onion',150],['olive',15],['garlic',10],['paprika',5],['cumin',3],['lime',40],['rice',120],['salt',3]],[
    'Cook rice according to its package. Drain and rinse the cooked black beans.',
    'Dice onion and peppers. Heat oil in a large skillet over medium heat and cook the vegetables for 7–9 minutes until softened.',
    'Add turkey, garlic, smoked paprika, cumin and salt. Break the turkey into small pieces and cook 8–10 minutes until it reaches 165°F / 74°C.',
    'Add chopped tomatoes, beans and 100 ml water. Simmer uncovered for 10–12 minutes, stirring, until the sauce coats a spoon.',
    'Stir in lime juice, taste, and divide over the rice. Keep the lime finish separate when freezing portions.'
  ],['High protein']],
  ['o-miso-salmon','Miso-ginger salmon with crisp broccoli & rice','Dinner',2,15,25,[['salmon',360],['rice',130],['broccoli',350],['miso',24],['ginger',12],['garlic',6],['maple',12],['lime',30],['olive',12]],[
    'Heat the oven to 425°F / 220°C. Start the rice using package water and timing.',
    'Cut broccoli into small florets, toss with the oil, and spread on a lined tray. Roast for 10 minutes.',
    'Mix miso, finely grated ginger and garlic, maple syrup, lime juice and 15 ml water. Pat the salmon dry and spread the mixture over its top.',
    'Move broccoli to the sides and place salmon on the tray. Roast for about 10–15 minutes more, checking the thickest part of the fish reaches 145°F / 63°C. Remove fish when ready; leave broccoli longer if needed.',
    'Serve with the rice, scraping cooked glaze from the tray over each portion. Check the miso label for soy and any wheat ingredients.'
  ],['High protein']],
  ['o-harissa-tofu','Harissa tofu & chickpeas with lemon quinoa','Lunch',3,15,30,[['tofu',600],['chickpeas',300],['quinoa',150],['peppers',300],['olive',20],['harissa',30],['lemon',60],['garlic',8],['cumin',3],['salt',2]],[
    'Heat the oven to 425°F / 220°C. Drain tofu, press it with a clean towel, and tear into bite-size pieces. Drain and rinse the chickpeas.',
    'Mix harissa, oil, grated garlic, cumin, salt and half the lemon juice. Toss with tofu, chickpeas and sliced peppers.',
    'Spread in a single layer on a lined tray. Roast for 25–30 minutes, turning once, until peppers soften and tofu edges brown.',
    'Meanwhile rinse quinoa and cook according to the package. Rest covered for 5 minutes, then fluff and stir in the remaining lemon juice.',
    'Divide quinoa and the tray mixture into three portions. Harissa heat varies; taste a small amount before mixing and reduce it if preferred.'
  ],['Vegan','Vegetarian','Mediterranean']],
  ['o-peanut-tofu','Ginger peanut tofu with lime cabbage slaw','Dinner',2,20,20,[['tofu',450],['rice',100],['cabbage',250],['carrot',120],['pb',40],['soysauce',20],['lime',50],['ginger',12],['olive',12],['maple',10]],[
    'Cook the rice. Drain and dry tofu well, then cut into 2 cm cubes.',
    'Whisk peanut butter, soy sauce, grated ginger, maple syrup, half the lime juice and 40–60 ml warm water into a pourable sauce.',
    'Thinly slice cabbage and grate the carrot. Toss with the remaining lime juice and one quarter of the sauce.',
    'Heat oil in a nonstick skillet over medium-high heat. Brown tofu for 10–14 minutes, turning gently so several sides color.',
    'Turn heat to low. Add the remaining sauce and a splash of water; stir for 1–2 minutes until hot and glossy. Serve over rice with the cold slaw. Check soy sauce for wheat.'
  ],['Vegan','Vegetarian']],
  ['o-tomato-lentil','Roasted tomato, lentil & spinach pasta','Dinner',3,15,30,[['lentils',450],['pasta',210],['tomato',600],['spinach',150],['olive',25],['garlic',12],['oregano',3],['lemon',30],['salt',3]],[
    'Heat the oven to 425°F / 220°C. Halve tomatoes and toss with oil, sliced garlic, oregano and salt in a roasting dish.',
    'Roast for 25–30 minutes until the tomatoes collapse and release their juices. Mash roughly with a fork.',
    'Cook pasta according to package directions, reserving 200 ml cooking water before draining.',
    'Combine the roasted tomatoes with cooked lentils in a wide pan. Add pasta, spinach and a little reserved water. Toss over medium heat for 2–3 minutes until spinach wilts.',
    'Finish with lemon juice. Add enough remaining pasta water to make a loose sauce, then divide into three servings.'
  ],['Vegan','Vegetarian','Mediterranean']],
  ['o-chicken-tzatziki','Oregano chicken with cucumber yogurt & roasted potatoes','Dinner',2,20,35,[['chicken',400],['potato',500],['yogurt',180],['cucumber',150],['olive',20],['lemon',50],['garlic',8],['oregano',3],['salt',3]],[
    'Heat the oven to 425°F / 220°C. Cut potatoes into 2 cm pieces and toss with half the oil, half the oregano and half the salt. Roast on a tray for 30–35 minutes, turning halfway.',
    'Grate cucumber and squeeze out excess water. Mix with yogurt, half the finely grated garlic and half the lemon juice. Refrigerate while cooking the chicken.',
    'Slice chicken into thick strips and coat with the remaining oil, garlic, oregano and salt.',
    'Cook chicken in a skillet over medium-high heat for 8–12 minutes, turning, until the thickest pieces reach 165°F / 74°C.',
    'Finish chicken with the remaining lemon juice. Serve with potatoes and cold cucumber yogurt. Store the yogurt separately so the potatoes can be reheated.'
  ],['Mediterranean','High protein']],
  ['o-tuna-bean','Lemon-dill tuna & white bean crunch salad','Lunch',2,20,0,[['tuna',280],['whitebeans',300],['cucumber',200],['tomato',200],['onion',50],['olive',15],['lemon',50],['mustard',15],['dill',8],['bread',100],['salt',1]],[
    'Drain tuna and cooked white beans. Rinse the beans and let them drain thoroughly.',
    'Dice cucumber and tomatoes. Finely chop onion and dill.',
    'Whisk lemon juice, mustard, oil and salt in a large bowl. Stir in beans and vegetables, then fold in tuna gently.',
    'Let stand in the refrigerator for 10 minutes so the beans absorb the dressing. Serve with toasted bread; keep bread separate when packing.',
    'Use ready-to-eat canned tuna. Check mustard and bread labels for allergens, and keep the salad chilled.'
  ],['Mediterranean','High protein']],
  ['o-pepper-eggs','Smoky pepper & spinach breakfast egg bake','Breakfast',3,15,30,[['eggs',300],['whites',300],['peppers',250],['spinach',120],['onion',100],['feta',60],['olive',10],['paprika',3],['bread',150],['salt',2]],[
    'Heat the oven to 375°F / 190°C. Grease a small baking dish with a little of the measured oil.',
    'Dice onion and peppers. Cook in the remaining oil over medium heat for 7–9 minutes. Add spinach and paprika and stir until wilted.',
    'Whisk eggs, egg whites and salt. Fold in the vegetables and crumbled feta, then pour into the dish.',
    'Bake for about 22–30 minutes until the center is set and reaches 160°F / 71°C. Begin checking early if the dish is shallow.',
    'Rest for 5 minutes, cut into three portions, and serve with toast. Cool packed portions promptly and refrigerate.'
  ],['Vegetarian','High protein','Mediterranean']],
  ['o-apple-oats','Cinnamon apple cheesecake overnight oats','Breakfast',2,15,0,[['oats',100],['yogurt',300],['cottage',200],['milk',150],['apple',250],['maple',20],['cinnamon',3],['lemon',20]],[
    'Grate the apple, keeping the skin if desired, and toss with lemon juice.',
    'Blend cottage cheese with milk until smooth, or mash well with a fork for a more textured bowl.',
    'Stir in yogurt, oats, maple syrup, cinnamon and grated apple. Divide between two covered jars.',
    'Refrigerate for at least 6 hours so the oats soften. Stir before eating and loosen with a splash of water if needed.',
    'Eat cold. Add any crunchy toppings only when serving; extra toppings change the saved macro estimate.'
  ],['Vegetarian','High protein']],
  ['o-choc-cherry','Chocolate-cherry protein overnight oats','Breakfast',2,10,0,[['oats',110],['soymilk',350],['soyprotein',45],['cherries',200],['cocoa',15],['maple',20],['pb',20]],[
    'Whisk soy milk, protein powder, cocoa and maple syrup until no dry pockets remain.',
    'Stir in oats and half the pitted cherries. Divide between two covered jars.',
    'Refrigerate for at least 6 hours. Stir thoroughly; add a little water if your protein powder makes the mixture too thick.',
    'Top with the remaining cherries and peanut butter before serving. Use fresh cherries or frozen cherries handled according to their package instructions.'
  ],['Vegan','Vegetarian','High protein']],
  ['o-tofu-scramble','Golden tofu, potato & pepper breakfast hash','Breakfast',3,20,30,[['tofu',600],['potato',450],['peppers',250],['onion',100],['spinach',100],['olive',25],['turmeric',3],['paprika',3],['garlic',8],['salt',3]],[
    'Dice potatoes into 1 cm cubes. Place in a saucepan, cover with water, bring to a simmer and cook 6–8 minutes until just tender. Drain well.',
    'Drain tofu and pat dry. Crumble coarsely with your hands.',
    'Heat half the oil in a large skillet over medium-high heat. Brown the potatoes for 8–10 minutes, turning occasionally. Transfer to a plate.',
    'Add remaining oil, diced onion and peppers. Cook 6–8 minutes, then add tofu, minced garlic, turmeric, paprika, salt and 30 ml water. Cook 5–7 minutes until hot.',
    'Fold in potatoes and spinach, stir until spinach wilts, and divide into three servings.'
  ],['Vegan','Vegetarian']],
  ['o-cocoa-yogurt','Cocoa-orange yogurt cream with toasted almonds','Snack',2,15,0,[['yogurt',500],['whey',30],['cocoa',12],['orange',200],['almonds',30],['honey',15]],[
    'Toast almonds in a dry skillet over medium heat for 3–4 minutes, stirring often. Cool before chopping.',
    'Whisk yogurt, whey, cocoa and honey until smooth. If very thick, stir in 15–30 ml water.',
    'Peel the orange, remove seeds and cut into small pieces. Fold half into the yogurt and divide into two bowls.',
    'Top with the remaining orange and cooled almonds. Keep almonds separate if packing ahead.'
  ],['Vegetarian','High protein']],
  ['o-berry-cheesecake','Lemon-berry cottage cheese cream','Snack',2,10,0,[['cottage',400],['yogurt',150],['berries',200],['lemon',20],['maple',20],['oats',30]],[
    'Toast oats in a dry skillet over medium-low heat for 4–5 minutes, stirring, until lightly golden. Cool completely.',
    'Blend cottage cheese, yogurt, lemon juice and maple syrup until smooth, scraping the sides once.',
    'Divide the cream into two bowls. Fold in half the berries and place the rest on top.',
    'Scatter with the cooled oats just before eating. Follow frozen berry package instructions if using them instead of fresh fruit.'
  ],['Vegetarian','High protein']],
  ['o-cocoa-tofu','Chocolate peanut tofu pudding with berries','Snack',2,15,0,[['silkentofu',400],['soyprotein',35],['cocoa',18],['pb',30],['maple',25],['berries',150]],[
    'Drain the silken tofu. Use a ready-to-eat product and follow its package handling instructions.',
    'Blend tofu, soy protein, cocoa, peanut butter and maple syrup for 45–60 seconds. Scrape the sides, then blend again until completely smooth.',
    'Add 15–30 ml water only if needed to make a spoonable pudding. Divide into two covered pots and refrigerate for at least 30 minutes.',
    'Top with berries when serving. Keep chilled; check protein powder and peanut butter labels for allergens.'
  ],['Vegan','Vegetarian','High protein']],
  ['o-crunch-chickpea','Smoky chickpea & edamame snack cups','Snack',3,10,30,[['chickpeas',300],['edamame',300],['olive',15],['paprika',4],['cumin',2],['lime',30],['salt',2]],[
    'Heat the oven to 400°F / 200°C. Drain cooked chickpeas and dry thoroughly with a clean towel.',
    'Toss chickpeas with oil, paprika, cumin and salt. Spread on a tray and roast for 25–30 minutes, shaking twice, until the outside begins to crisp.',
    'Cook shelled edamame according to its package and drain well.',
    'Divide chickpeas and edamame into three portions. Squeeze lime over them just before serving. For packed snacks, chill promptly and expect the chickpeas to soften.'
  ],['Vegan','Vegetarian']],
  ...BREAKFAST_SNACK_SPECS,...MEAT_FISH_SPECS,...PLANT_SPECS
];
