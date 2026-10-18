// Original AI-authored development recipes for Muscle Growth Tracker.
// Not kitchen tested. Weights are raw/dry except ingredients explicitly named cooked.
// Water is untracked; all other ingredients are included in the ingredient lists.
export const BREAKFAST_SNACK_SPECS = [
  ['x-bs-lemon-berry-oat-bake','Lemon-berry baked oats with vanilla yogurt','Breakfast',4,15,35,[['oats',200],['milk',400],['eggs',200],['yogurt',400],['berries',300],['maple',30],['lemon',30],['bakingpowder',8],['vanilla',4],['olive',8]],[
    'Heat the oven to 375°F / 190°C. Use all 8 g oil to grease a 20 cm / 8 inch square baking dish. Whisk the eggs, milk, maple syrup, baking powder, 2 g vanilla and 15 g lemon juice until combined.',
    'Stir the oats into the egg mixture. Fold in 200 g berries and pour into the dish, distributing the fruit evenly. Scatter the remaining 100 g berries over the surface.',
    'Bake for 30–35 minutes, until the center is set and reaches 160°F / 71°C. If the top browns before the middle sets, cover loosely with foil and continue baking.',
    'Stir the yogurt with the remaining 2 g vanilla and 15 g lemon juice. Rest the oat bake for 10 minutes, then cut into four portions and serve each with one quarter of the yogurt.',
    'For packed breakfasts, cool the bake promptly in shallow containers and refrigerate the yogurt separately. Reheat a chilled baked portion to 165°F / 74°C before adding its cold yogurt.'
  ],['Vegetarian','High protein']],
  ['x-bs-banana-cottage-pancakes','Banana-flax cottage cheese pancakes','Breakfast',3,15,20,[['flour',150],['cottage',300],['eggs',150],['milk',180],['banana',240],['flax',18],['cinnamon',3],['bakingpowder',6],['olive',12],['yogurt',180]],[
    'Blend cottage cheese, eggs, milk and 120 g banana until mostly smooth. Whisk flour, flax, cinnamon and baking powder in a separate bowl, then stir in the blended mixture. Let the batter stand for 5 minutes.',
    'Heat a nonstick skillet over medium-low heat. Measure the oil into a small dish and use it in thin layers across the batches. For each pancake, add about 60 ml batter and spread into a small round.',
    'Cook for 3–4 minutes until the edges look firm and bubbles hold on the surface. Flip gently and cook another 2–3 minutes. Check that the thick center reaches 160°F / 71°C and has no wet batter; reduce heat if the outside colors too quickly.',
    'Repeat with all the batter and remaining measured oil. Slice the remaining 120 g banana. Divide the pancakes, banana and 180 g yogurt evenly into three servings.',
    'If storing, cool pancakes in a single layer before refrigerating. Keep the yogurt and banana separate; reheat chilled pancakes to 165°F / 74°C.'
  ],['Vegetarian','High protein']],
  ['x-bs-southwest-breakfast-wraps','Sweet potato, black bean & egg breakfast wraps','Breakfast',4,20,30,[['tortilla',240],['eggs',200],['whites',320],['blackbeans',240],['sweetpotato',300],['peppers',200],['cheddar',80],['olive',12],['cumin',3],['paprika',3],['salt',2]],[
    'Heat the oven to 425°F / 220°C. Dice sweet potato into 1 cm cubes and peppers into small pieces. Toss with 8 g oil, cumin, paprika and 1 g salt; roast on a lined tray for 22–28 minutes, turning once, until the potato is tender.',
    'Drain and rinse the cooked black beans. Add them to the vegetable tray for the last 5 minutes so they heat through without drying out.',
    'Whisk eggs, whites and the remaining 1 g salt. Heat the remaining 4 g oil in a nonstick skillet over medium-low heat. Add the egg mixture and stir gently for 5–7 minutes until set and at least 160°F / 71°C.',
    'Warm the tortillas in a dry skillet for 15–20 seconds per side. Divide all the vegetables, beans, eggs and grated cheddar evenly among four equal tortilla portions. Fold in the sides and roll tightly.',
    'Serve immediately, or cool the fillings promptly before assembling refrigerated wraps. Reheat chilled wraps until the center reaches 165°F / 74°C; keep wrapping material away from direct heat.'
  ],['Vegetarian','High protein']],
  ['x-bs-mushroom-ricotta-toast','Thyme mushroom & ricotta egg toast','Breakfast',2,15,15,[['bread',160],['eggs',100],['whites',180],['mushrooms',250],['ricotta',120],['spinach',80],['olive',10],['thyme',1],['lemon',20],['salt',1],['pepper',1]],[
    'Slice mushrooms and roughly chop spinach. Mix ricotta with lemon juice, thyme, 0.5 g salt and half the pepper. Toast the bread until crisp at the edges.',
    'Heat 6 g oil in a wide skillet over medium-high heat. Cook mushrooms for 6–8 minutes, stirring occasionally, until their released liquid evaporates and they begin to brown. Add spinach and cook for 1 minute until wilted; transfer to a bowl.',
    'Whisk eggs and whites with the remaining 0.5 g salt and remaining pepper. Lower the heat to medium-low, add the remaining 4 g oil and stir the eggs gently for 4–6 minutes until set and at least 160°F / 71°C.',
    'Divide the toast between two plates. Spread each with half the ricotta mixture, then add half the mushrooms, spinach and eggs. Serve promptly so the toast stays firm.'
  ],['Vegetarian','High protein']],
  ['x-bs-pear-quinoa-porridge','Cinnamon pear quinoa porridge with walnuts','Breakfast',3,15,25,[['quinoa',150],['milk',450],['yogurt',450],['pear',300],['walnuts',30],['cinnamon',3],['maple',20],['vanilla',3]],[
    'Rinse quinoa in a fine sieve. Put it in a saucepan with 300 ml water and 300 ml of the measured milk. Bring just to a simmer, then cover and cook over low heat for 15–20 minutes, stirring occasionally to prevent sticking.',
    'Core the pears and cut into small cubes. Put them in a second pan with 30 ml water, all the maple syrup and 2 g cinnamon. Cover and cook over medium-low heat for 6–8 minutes until tender but still holding their shape.',
    'When the quinoa is tender, stir in the remaining 150 ml milk, vanilla and remaining 1 g cinnamon. Simmer uncovered for 2–3 minutes to make a loose porridge, adding a little water if needed.',
    'Let the porridge cool for 3 minutes, then fold in 300 g yogurt. Divide between three bowls and add the pears, their pan juices, the remaining 150 g yogurt and chopped walnuts in equal portions.',
    'For meal prep, refrigerate cooled porridge and toppings separately. Reheat the porridge with a splash of water until steaming hot, then add cold yogurt and walnuts.'
  ],['Vegetarian','High protein']],
  ['x-bs-miso-breakfast-rice','Miso-ginger breakfast rice with eggs & edamame','Breakfast',3,15,25,[['rice',180],['eggs',150],['whites',300],['edamame',240],['mushrooms',240],['spinach',90],['miso',24],['soysauce',15],['ginger',9],['olive',12]],[
    'Cook the dry rice according to its package water and timing. Cook the shelled edamame according to its package, then drain. Whisk miso, soy sauce, finely grated ginger and 45 ml warm water into a smooth sauce.',
    'Slice mushrooms. Heat 8 g oil in a wide skillet over medium-high heat and cook mushrooms for 6–8 minutes until browned and their liquid has evaporated. Add spinach and edamame and stir for 1–2 minutes.',
    'Push the vegetables to one side and lower the heat to medium-low. Add the remaining 4 g oil to the empty side. Whisk eggs and whites, pour them into that space and stir gently until fully set and at least 160°F / 71°C.',
    'Fold the cooked rice and miso sauce through the eggs and vegetables. Cook for 2–3 minutes, turning gently, until everything is hot. Divide into three bowls.',
    'If packing for later, spread the rice mixture into shallow containers and refrigerate promptly within 1 hour. Reheat one portion only once to 165°F / 74°C. Check the miso and soy sauce labels for wheat.'
  ],['Vegetarian','High protein']],
  ['x-bs-broccoli-egg-cups','Broccoli-cheddar egg cups with whole grain toast','Breakfast',4,15,25,[['eggs',300],['whites',400],['broccoli',300],['cheddar',100],['milk',120],['olive',8],['bread',240],['salt',2],['pepper',1]],[
    'Heat the oven to 375°F / 190°C. Use the measured oil to grease a 12-cup muffin pan thoroughly. Cut broccoli into very small florets and steam over simmering water for 3–4 minutes, until bright green and just tender. Drain and pat dry.',
    'Whisk eggs, whites, milk, salt and pepper in a jug. Grate the cheddar. Divide the broccoli and 75 g cheddar among the muffin cups.',
    'Pour the egg mixture evenly into the cups, leaving a little room at the top. Scatter the remaining 25 g cheddar over them. Bake for 18–25 minutes until the centers are set and reach 160°F / 71°C.',
    'Rest the cups for 5 minutes before easing them out with a flexible spatula. Toast the bread. Serve three egg cups and one quarter of the bread per person.',
    'For make-ahead portions, cool promptly in shallow containers and refrigerate. Reheat chilled egg cups until their centers reach 165°F / 74°C, and toast the bread separately.'
  ],['Vegetarian','High protein']],
  ['x-bs-apple-french-toast-bake','Apple-raisin French toast bake with yogurt','Breakfast',4,20,35,[['bread',280],['eggs',250],['whites',250],['milk',400],['apple',400],['raisins',40],['cinnamon',4],['vanilla',5],['maple',30],['olive',8],['yogurt',400]],[
    'Heat the oven to 350°F / 180°C. Grease a medium baking dish with all the oil. Core apples, dice them into 1 cm pieces and put in a saucepan with 40 ml water and 2 g cinnamon. Cover and soften over medium heat for 6–8 minutes.',
    'Cut bread into 2 cm cubes. Whisk eggs, whites, milk, vanilla, maple syrup and the remaining 2 g cinnamon until combined. Fold in bread, raisins and cooked apples, including their small amount of pan liquid.',
    'Transfer to the dish and press the bread down lightly. Let stand for 10 minutes so the custard soaks in. Cover with foil and bake for 20 minutes.',
    'Remove the foil and bake for a further 12–18 minutes until the middle reaches 160°F / 71°C and no liquid egg mixture remains. Rest for 10 minutes before cutting into four portions.',
    'Serve each portion with 100 g yogurt. Refrigerate cooled leftovers promptly with the yogurt in separate containers; reheat a chilled baked portion to 165°F / 74°C.'
  ],['Vegetarian','High protein']],
  ['x-bs-peach-buckwheat-bowls','Vanilla buckwheat bowls with peaches & almonds','Breakfast',3,15,20,[['buckwheat',150],['soymilk',450],['soyprotein',60],['peach',400],['almonds',36],['maple',20],['vanilla',3],['cinnamon',2]],[
    'Rinse the buckwheat groats and put in a saucepan with 300 ml water and 300 ml soy milk. Bring to a gentle simmer, cover and cook on low for 12–18 minutes, stirring occasionally, until tender. Add a splash of water if needed.',
    'Whisk soy protein into the remaining 150 ml cold soy milk until smooth. Remove the cooked buckwheat from the heat and stir in this mixture, vanilla, cinnamon and all the maple syrup.',
    'Pit and dice peaches. Fold half into the warm buckwheat and leave for 3 minutes to soften slightly. Chop almonds coarsely.',
    'Divide the porridge between three bowls and top with the remaining peaches and almonds. For a cold version, refrigerate the porridge promptly, then add toppings just before serving.'
  ],['Vegan','Vegetarian','High protein']],
  ['x-bs-chickpea-shakshuka','Smoky chickpea shakshuka with soft scrambled eggs','Breakfast',3,20,30,[['eggs',300],['whites',250],['chickpeas',300],['tomato',600],['peppers',200],['onion',150],['olive',15],['cumin',3],['paprika',3],['garlic',9],['salt',2],['bread',180]],[
    'Dice onion and peppers; chop tomatoes and mince garlic. Heat 10 g oil in a wide skillet over medium heat. Cook onion and peppers for 7–9 minutes until softened, then add garlic, cumin, paprika and 1 g salt for 1 minute.',
    'Add tomatoes and 80 ml water. Simmer uncovered for 12–15 minutes, stirring occasionally, until thickened. Drain and rinse chickpeas, stir them in and simmer for another 4–5 minutes.',
    'Whisk eggs and whites with the remaining 1 g salt. Heat the remaining 5 g oil in a separate nonstick skillet over medium-low heat. Add the egg mixture and stir slowly for 5–7 minutes until set and at least 160°F / 71°C.',
    'Toast the bread while the eggs cook. Divide the tomato-chickpea sauce among three shallow bowls, spoon the eggs on top and serve with equal portions of toast.',
    'Keep packed eggs and sauce chilled, separate from the bread. Reheat both hot components to 165°F / 74°C before serving.'
  ],['Vegetarian','High protein','Mediterranean']],
  ['x-bs-chocolate-banana-oat-bake','Chocolate-banana protein oat bake with peanut swirl','Breakfast',4,15,35,[['oats',220],['soymilk',500],['soyprotein',80],['banana',360],['flax',30],['cocoa',25],['pb',50],['maple',25],['bakingpowder',8],['vanilla',4]],[
    'Heat the oven to 350°F / 180°C and line a 20 cm / 8 inch square baking dish with baking paper. Mash 240 g banana in a large bowl. Whisk in soy milk, maple syrup, vanilla and flax; let stand for 5 minutes.',
    'Mix oats, soy protein, cocoa and baking powder separately, breaking up any cocoa lumps. Stir the dry mixture into the banana mixture until no powdery patches remain, then spread in the lined dish.',
    'Mix peanut butter with 20–30 ml warm water until it falls from a spoon. Dot it over the batter and drag a knife through the dots to make a shallow swirl. Slice the remaining 120 g banana and arrange on top.',
    'Bake for 30–35 minutes until the center is firm, the edges pull slightly from the paper and a skewer comes out with moist crumbs rather than wet batter. Rest for 15 minutes before cutting into four portions.',
    'Cool saved portions promptly and refrigerate in covered containers. Warm a refrigerated portion until steaming hot, or eat it cold with a splash of water stirred in if the oats have firmed up.'
  ],['Vegan','Vegetarian','High protein']],
  ['x-bs-savory-lentil-oats','Savory mushroom-lentil oats with scrambled eggs','Breakfast',3,15,25,[['oats',150],['lentils',300],['mushrooms',300],['spinach',120],['eggs',150],['whites',240],['olive',12],['garlic',9],['thyme',2],['salt',2],['pepper',1]],[
    'Slice mushrooms and mince garlic. Heat 8 g oil in a saucepan over medium-high heat. Cook mushrooms for 7–9 minutes until browned, then add garlic and thyme and stir for 30 seconds.',
    'Add oats, cooked lentils, 600 ml water, 1 g salt and half the pepper. Bring to a simmer and cook uncovered over medium-low heat for 6–8 minutes, stirring frequently, until the oats soften. Add a little extra water if very thick.',
    'Stir spinach into the oats until wilted, then cover off the heat. Whisk eggs, whites, remaining 1 g salt and remaining pepper.',
    'Heat the remaining 4 g oil in a nonstick skillet over medium-low heat. Add the eggs and stir gently for 4–6 minutes until set and at least 160°F / 71°C.',
    'Divide the savory oats into three bowls and top each with one third of the eggs. Serve hot; refrigerate saved portions promptly and reheat to 165°F / 74°C.'
  ],['Vegetarian','High protein']],
  ['x-bs-mango-chia-oat-pots','Mango-lime chia oat pots with pumpkin seed crunch','Breakfast',3,15,0,[['yogurt',600],['milk',300],['chia',60],['oats',90],['mango',450],['pumpkinseeds',30],['lime',30],['maple',20],['vanilla',3]],[
    'Whisk yogurt, milk, lime juice, maple syrup and vanilla in a bowl until smooth. Stir in chia seeds and oats, making sure no dry clumps remain.',
    'Let stand for 10 minutes, then stir again to break up any chia clusters. Divide the mixture between three covered jars and refrigerate for at least 4 hours or overnight until the seeds swell and the oats soften.',
    'Dice the peeled mango. Keep half for topping and mash the other half with a fork into a chunky puree. Refrigerate both in covered containers while the pots set.',
    'Stir one third of the mango puree into each pot. Top with equal portions of diced mango and pumpkin seeds just before serving. Loosen a very thick pot with 15–30 ml water.'
  ],['Vegetarian','High protein']],
  ['x-bs-tempeh-sweet-potato-hash','Lime-cumin tempeh & sweet potato breakfast skillet','Breakfast',3,20,30,[['tempeh',450],['sweetpotato',450],['corn',180],['peppers',240],['onion',120],['olive',12],['lime',45],['cumin',3],['paprika',3],['cilantro',12],['salt',2]],[
    'Cut sweet potato into 1 cm cubes. Cover with water in a saucepan, bring to a simmer and cook for 6–8 minutes until nearly tender. Drain well. Dice onion, peppers and tempeh into small pieces.',
    'Heat 8 g oil in a wide nonstick skillet over medium-high heat. Add sweet potato and cook for 6–8 minutes, turning occasionally, until browned at the edges. Transfer to a plate.',
    'Add the remaining 4 g oil, onion and peppers to the skillet. Cook over medium heat for 5 minutes, then add tempeh, cumin, paprika, salt and 60 ml water. Cover and cook for 6–8 minutes, or longer if the tempeh package requires it.',
    'Return sweet potato to the pan with the cooked, drained corn. Stir over medium heat for 3–4 minutes until hot throughout and most of the liquid evaporates.',
    'Remove from the heat and stir in lime juice and chopped cilantro. Divide into three portions; refrigerate cooled leftovers promptly and reheat to 165°F / 74°C.'
  ],['Vegan','Vegetarian','High protein']],
  ['x-bs-lemon-white-bean-dip','Lemon-thyme white bean dip with crunchy vegetables','Snack',2,15,0,[['whitebeans',250],['yogurt',120],['tahini',20],['lemon',30],['garlic',4],['thyme',1],['cucumber',200],['carrot',160],['bread',80],['olive',8],['salt',1]],[
    'Drain and rinse the cooked white beans. Reserve 40 g beans for a chunky finish. Finely grate the garlic and cut cucumber and carrot into dipping sticks.',
    'Blend the remaining 210 g beans with yogurt, tahini, lemon juice, garlic, thyme, olive oil and salt for 45–60 seconds, scraping down the sides. Add 15–30 ml water only if needed to make a thick, scoopable dip.',
    'Mash the reserved beans lightly and fold them into the dip. Cover and refrigerate for 15 minutes so the garlic and thyme flavor the mixture.',
    'Toast the bread and cut into strips. Divide the dip, vegetables and bread equally between two snack plates. Keep the dip and vegetables chilled separately from the toast when packing.'
  ],['Vegetarian','Mediterranean']],
  ['x-bs-berry-chia-cheesecake','Vanilla berry-chia cheesecake snack pots','Snack',3,15,0,[['cottage',450],['yogurt',240],['chia',30],['berries',240],['vanilla',3],['maple',15],['lemon',15]],[
    'Blend cottage cheese, yogurt, vanilla, maple syrup and lemon juice for 45–60 seconds until smooth. Scrape the sides once so no curds remain around the edge.',
    'Mash 120 g berries with a fork. Stir the chia into the blended cheese mixture, then fold in the mashed berries in a few strokes to leave a loose ripple.',
    'Divide between three covered jars. Let stand for 10 minutes, stir once more to prevent chia clumps, then refrigerate for at least 2 hours until lightly thickened.',
    'Top each pot with 40 g of the remaining berries before eating. Use fresh berries or handle frozen berries exactly as their package instructs; keep the prepared pots chilled.'
  ],['Vegetarian','High protein']],
  ['x-bs-roasted-peach-ricotta','Cinnamon-roasted peaches with ricotta cream & walnuts','Snack',2,15,20,[['ricotta',220],['yogurt',180],['peach',300],['walnuts',20],['honey',15],['cinnamon',2],['vanilla',2]],[
    'Heat the oven to 400°F / 200°C. Pit peaches and cut into thick wedges. Place in a small lined baking dish with 20 ml water, 10 g honey and all the cinnamon; turn gently to coat.',
    'Roast for 15–20 minutes until the peaches are tender and juices bubble at the edges. Stir once halfway through and add a splash of water if the dish dries out.',
    'Whisk ricotta, yogurt, vanilla and the remaining 5 g honey until creamy. Chop walnuts into small pieces.',
    'Divide the ricotta cream between two bowls. Let the peaches cool for 5 minutes, then add half the peaches and their juices to each bowl and scatter with walnuts. Keep chilled if serving later.'
  ],['Vegetarian','High protein']],
  ['x-bs-tuna-dill-mini-wraps','Tuna-dill mini wraps with cucumber crunch','Snack',3,15,0,[['tuna',240],['tortilla',120],['yogurt',90],['cucumber',180],['mustard',15],['lemon',20],['dill',6],['pepper',1],['romaine',60]],[
    'Drain the ready-to-eat canned tuna thoroughly. Mix yogurt, mustard, lemon juice, finely chopped dill and pepper in a bowl.',
    'Dice 90 g cucumber finely and pat dry. Fold it and the tuna into the yogurt dressing without crushing the tuna completely. Wash and dry the romaine leaves.',
    'Warm the tortillas in a dry skillet over medium heat for about 15 seconds per side so they bend easily, then let them cool for a minute. Divide romaine and tuna filling evenly among three 40 g tortilla portions.',
    'Roll each portion tightly, cut across the middle and serve with the remaining 90 g cucumber sliced into sticks. If packing, chill promptly and keep the cucumber sticks separate.'
  ],['High protein']],
  ['x-bs-edamame-avocado-dip','Edamame-avocado lime dip with vegetable sticks','Snack',2,15,5,[['edamame',200],['avocado',100],['silkentofu',150],['lime',30],['cumin',1],['carrot',160],['cucumber',160],['salt',1],['cilantro',8]],[
    'Cook shelled edamame according to its package, then drain and rinse under cold water until cool. Pat dry so the dip will not be watery.',
    'Blend edamame with the avocado, drained ready-to-eat silken tofu, lime juice, cumin and salt. Add 15–30 ml water as needed and pulse until mostly smooth with a little texture.',
    'Finely chop cilantro and fold all of it through the dip. Cut carrot and cucumber into sturdy sticks.',
    'Divide the dip and vegetable sticks equally between two containers. Refrigerate until serving, with a cover pressed close to the dip surface to slow avocado browning.'
  ],['Vegan','Vegetarian']],
  ['x-bs-pumpkin-oat-bars','Banana-raisin oat bars with pumpkin seeds','Snack',4,15,25,[['oats',120],['soyprotein',60],['pumpkinseeds',35],['banana',200],['raisins',45],['soymilk',180],['cinnamon',2],['bakingpowder',4],['olive',8],['vanilla',3]],[
    'Heat the oven to 350°F / 180°C. Line a small loaf tin or roughly 15 cm / 6 inch square baking dish with baking paper. Mash the banana and whisk in soy milk, olive oil and vanilla.',
    'Mix oats, soy protein, cinnamon and baking powder in another bowl. Stir into the banana mixture, then fold in raisins and 25 g pumpkin seeds. Leave for 5 minutes so the oats absorb some liquid.',
    'Press the mixture evenly into the tin and scatter the remaining 10 g pumpkin seeds on top. Bake for 22–28 minutes until the center is firm and a skewer has no wet batter clinging to it.',
    'Cool in the tin for 15 minutes, then lift onto a rack. Once completely cool, cut into four snack portions. Refrigerate in a covered container; these are soft baked bars rather than crisp granola bars.'
  ],['Vegan','Vegetarian','High protein']],
  ['x-bs-apple-yogurt-crumble','Warm cinnamon apples with almond-oat crumble & yogurt','Snack',3,15,20,[['yogurt',600],['apple',450],['oats',75],['almonds',30],['maple',20],['cinnamon',3],['olive',8],['lemon',15]],[
    'Heat the oven to 375°F / 190°C. Core and dice the apples. Toss in a small baking dish with lemon juice, 10 g maple syrup, 2 g cinnamon and 30 ml water.',
    'Chop almonds and mix with oats, olive oil, the remaining 10 g maple syrup and remaining 1 g cinnamon. Spread on a separate lined tray in a thin layer.',
    'Bake apples for 18–22 minutes until tender, stirring once. Bake the oat mixture alongside for 10–14 minutes, turning halfway, until golden; remove it earlier if the almonds brown quickly.',
    'Let both mixtures cool for 5 minutes. Divide yogurt among three bowls and top each with one third of the apples, their juices and crumble. Keep the crumble separate from chilled portions until serving.'
  ],['Vegetarian','High protein']],
  ['x-bs-roasted-pepper-cottage-dip','Roasted red pepper cottage cheese dip with toast','Snack',3,15,25,[['cottage',450],['peppers',300],['garlic',9],['olive',10],['paprika',2],['lemon',30],['parsley',9],['bread',120],['pepper',1]],[
    'Heat the oven to 425°F / 220°C. Remove pepper stems and seeds and cut peppers into large pieces. Toss peppers and peeled garlic cloves with all the olive oil and spread on a lined tray.',
    'Roast for 20–25 minutes, turning once, until the peppers soften and brown at the edges. Let cool for 10 minutes, keeping any tray juices.',
    'Blend cottage cheese, roasted peppers, roasted garlic, tray juices, paprika, lemon juice and black pepper until creamy. Chop the parsley finely and stir all of it into the dip.',
    'Toast the bread and cut into strips. Divide the dip and toast equally into three snack servings. Chill the dip promptly if saving it and pack the toast separately.'
  ],['Vegetarian','High protein','Mediterranean']],
  ['x-bs-cocoa-date-bites','Cocoa-date oat bites with walnuts','Snack',4,20,10,[['dates',160],['oats',90],['walnuts',40],['cocoa',20],['soyprotein',60],['soymilk',80],['vanilla',3],['cinnamon',1]],[
    'Heat the oven to 350°F / 180°C. Spread the oats and walnuts on a lined tray and toast for 8–10 minutes, stirring once, until fragrant. Let cool fully; do not replace these oats with raw flour.',
    'Cover the pitted dates with hot water for 10 minutes, then drain thoroughly. Pulse cooled oats and walnuts in a food processor until finely chopped, but stop before they become a paste.',
    'Add drained dates, cocoa, soy protein, soy milk, vanilla and cinnamon. Pulse until the mixture clumps when pressed between two fingers. Scrape the bowl as needed; if crumbly, pulse in water 5 ml at a time.',
    'Divide into 16 equal pieces and roll into balls with clean hands. Refrigerate for at least 1 hour to firm. Four bites make one snack serving; keep the remaining bites refrigerated in a covered container.'
  ],['Vegan','Vegetarian']],
  ['x-bs-savory-chickpea-yogurt-jars','Dill yogurt & chickpea crunch jars','Snack',3,15,0,[['yogurt',450],['chickpeas',240],['cucumber',240],['tomato',180],['dill',9],['lemon',30],['olive',9],['salt',1],['pepper',1]],[
    'Drain and rinse the cooked chickpeas, then let them drain well. Dice cucumber and tomato; remove only any very watery seed pulp from the tomato before weighing the usable 180 g.',
    'Whisk yogurt with lemon juice, olive oil, finely chopped dill, salt and pepper. Divide the dressing between three wide jars or bowls.',
    'Toss the chickpeas, cucumber and tomato together and spoon evenly over the yogurt. Keep the layers separate if packing to limit water released into the dressing.',
    'Cover and refrigerate until eating. Stir the vegetables and chickpeas into the yogurt just before serving; add 10–15 ml water only if a thinner dressing is preferred.'
  ],['Vegetarian','High protein','Mediterranean']],
  ['x-bs-zucchini-ricotta-muffins','Savory zucchini-ricotta snack muffins','Snack',4,20,25,[['flour',120],['eggs',100],['whites',160],['ricotta',200],['zucchini',240],['parmesan',30],['milk',100],['olive',12],['bakingpowder',6],['salt',1],['pepper',1]],[
    'Heat the oven to 375°F / 190°C. Line an 8-cup muffin pan with baking cups. Grate zucchini, then squeeze firmly in a clean towel to remove excess water; the listed 240 g is its weight before squeezing.',
    'Whisk eggs, whites, ricotta, milk and oil until combined. In a second bowl, mix flour, baking powder, salt and pepper, then fold the dry ingredients into the wet mixture just until no dry flour remains.',
    'Fold in all the squeezed zucchini and 20 g grated vegetarian hard cheese. Divide among eight cups and scatter the remaining 10 g cheese over the tops.',
    'Bake for 22–28 minutes until risen and golden, the centers reach 160°F / 71°C and a skewer has no wet batter. Rest in the pan for 5 minutes, then move to a rack.',
    'Two muffins make one snack serving. Cool saved muffins promptly before refrigerating. Reheat chilled muffins until their centers reach 165°F / 74°C.'
  ],['Vegetarian','High protein']],
  ['x-bs-peanut-frozen-yogurt','Peanut-banana frozen yogurt clusters','Snack',4,20,0,[['yogurt',600],['pb',60],['banana',300],['whey',40],['cocoa',15],['maple',20],['vanilla',4]],[
    'Line a small freezer-safe tray with baking paper. Whisk yogurt, whey, maple syrup and vanilla until smooth; let stand for 3 minutes, then whisk again to remove any powdery lumps.',
    'Dice the banana and fold all of it into the yogurt. Mix peanut butter, cocoa and 20–30 ml warm water in a small bowl until smooth and spoonable.',
    'Spoon the yogurt mixture into 16 equal mounds on the lined tray. Divide the peanut-cocoa mixture evenly among the mounds and swirl lightly through the top of each with a clean teaspoon.',
    'Freeze uncovered for 3–4 hours until firm, then transfer to a sealed freezer container. Four clusters make one snack serving. Let a portion soften for 5–10 minutes before eating; keep the remaining clusters frozen.'
  ],['Vegetarian','High protein']],
  ['x-bs-sesame-tofu-fingers','Sesame tofu fingers with ginger-peanut dip','Snack',3,20,25,[['tofu',450],['sesame',15],['soysauce',18],['maple',12],['ginger',9],['lime',30],['olive',9],['carrot',210],['cucumber',210],['pb',20]],[
    'Heat the oven to 425°F / 220°C. Drain tofu, press gently in a clean towel and cut into finger-size strips. Mix 12 g soy sauce, 6 g maple syrup, 4 g grated ginger and all the olive oil.',
    'Toss tofu carefully with the mixture, spread on a lined tray and scatter all the sesame seeds over it. Bake for 22–28 minutes, turning once, until golden at the edges and hot throughout.',
    'Whisk peanut butter with the remaining 6 g soy sauce, remaining 6 g maple syrup, remaining 5 g ginger, all the lime juice and 30–45 ml warm water to form a dipping sauce.',
    'Cut carrot and cucumber into sticks. Divide tofu, vegetables and dip into three equal snack portions. Serve warm or refrigerate cooled tofu promptly; keep the raw vegetables and dip separate.'
  ],['Vegan','Vegetarian','High protein']],
  ['x-bs-smoky-egg-bean-toast','Smoky egg & white bean toast bites','Snack',2,15,15,[['eggs',100],['whites',160],['whitebeans',160],['bread',80],['yogurt',80],['mustard',10],['paprika',2],['parsley',6],['lemon',20],['pepper',1],['olive',5]],[
    'Drain and rinse the cooked white beans. Mash them coarsely with yogurt, mustard, lemon juice, paprika and pepper. Chop parsley and stir half of it into the bean mixture.',
    'Whisk eggs and whites. Heat all the oil in a nonstick skillet over medium-low heat, pour in the eggs and stir gently for 4–6 minutes until set and at least 160°F / 71°C.',
    'Toast the bread until crisp and cut into sturdy bite-size pieces. Divide bean mash and scrambled eggs equally over the toast, then scatter with all the remaining parsley.',
    'Divide the toast bites between two plates and serve immediately. For later use, chill the egg and bean mixtures promptly in separate covered containers and toast the bread just before assembling; reheat the eggs to 165°F / 74°C.'
  ],['Vegetarian','High protein']]
];
