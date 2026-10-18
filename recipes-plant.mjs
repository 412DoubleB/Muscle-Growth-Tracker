// Original AI-authored development recipes for Muscle Growth Tracker.
// Not kitchen tested. Amounts are raw/dry unless the food reference says cooked.
// Water is the only untracked ingredient used in the instructions.
export const PLANT_SPECS = [
  ['x-pl-tempeh-barley','Crisp tempeh, broccoli & lemon-mustard barley salad','Lunch',3,20,40,[['tempeh',450],['barley',150],['broccoli',450],['carrot',150],['olive',20],['mustard',25],['lemon',60],['parsley',20],['garlic',8],['salt',3]],[
    'Rinse the pearl barley. Simmer in plenty of water for the package time, usually 30–40 minutes, until tender with a little chew. Drain well and spread in a shallow bowl to release steam.',
    'Heat the oven to 425°F / 220°C. Cut broccoli into small florets and carrots into thin half-moons. Toss with half the oil and half the salt; roast on a lined tray for 20–25 minutes, turning once, until tender and browned at the edges.',
    'Cut tempeh into 1 cm strips. Place in a skillet with 60 ml water, cover and simmer for 5 minutes. Uncover, let the water evaporate, add the remaining oil and brown for 6–8 minutes, turning gently. Cook longer if the package requires it.',
    'Whisk mustard, lemon juice, finely grated garlic, remaining salt and 30 ml water. Chop the parsley and stir it into the dressing.',
    'Fold warm barley, roasted vegetables and tempeh together with the dressing. Rest for 5 minutes so the grain absorbs the lemon, then divide into three portions. Cool packed portions promptly.'
  ],['Vegan','Vegetarian','High protein']],

  ['x-pl-lentil-patties','Smoky lentil-oat patties with apple-cabbage slaw','Lunch',3,25,30,[['lentils',600],['oats',150],['pumpkinseeds',45],['cabbage',300],['apple',200],['onion',100],['olive',20],['lemon',50],['mustard',20],['paprika',5],['cumin',3],['garlic',8],['salt',3]],[
    'Heat the oven to 400°F / 200°C. Drain the cooked lentils thoroughly and pat away surface moisture. Pulse the oats and pumpkin seeds in a processor to coarse crumbs, or chop the seeds and crush the oats with a rolling pin.',
    'Finely dice the onion and garlic. Cook in half the oil over medium heat for 6–8 minutes until softened. Stir in paprika and cumin for the final 30 seconds, then take off the heat.',
    'Mash two thirds of the lentils into a thick paste. Mix in the remaining lentils, oat-seed crumbs, cooked onion mixture and two thirds of the salt. Rest for 10 minutes; the mixture should hold together when squeezed. Add a spoonful of water only if crumbly.',
    'Form six firm patties and brush both sides with the remaining oil. Bake on a lined tray for 25–30 minutes, turning carefully after 18 minutes, until the edges are browned and the centers are hot and firm.',
    'Thinly shred the cabbage and grate the apple. Toss with lemon juice, mustard and remaining salt. Serve two patties per portion with the slaw; keep the slaw separate when packing.'
  ],['Vegan','Vegetarian']],

  ['x-pl-edamame-wraps','Chickpea-edamame crunch wraps with lemon tahini','Lunch',3,20,10,[['edamame',400],['chickpeas',300],['tortilla',180],['tahini',30],['carrot',180],['romaine',150],['cucumber',180],['lemon',55],['garlic',6],['cumin',3],['salt',2]],[
    'Cook the shelled edamame according to its package instructions. Drain and cool under running water, then drain again. Rinse and drain the cooked chickpeas.',
    'Mash the chickpeas and half the edamame coarsely with a fork. Stir in the remaining edamame, cumin and half the salt; keep some whole beans for texture.',
    'Whisk tahini with lemon juice, finely grated garlic, remaining salt and 45–60 ml water. It will thicken at first; keep whisking until smooth and spreadable.',
    'Grate the carrot, dice cucumber and shred romaine. Pat the cucumber dry. Warm the tortillas briefly in a dry skillet, about 20 seconds per side, so they bend without cracking.',
    'Divide bean mixture, vegetables and sauce among the tortillas. Fold the sides inward and roll tightly, keeping the filling centered. Serve immediately or pack sauce and filling separately for later assembly.'
  ],['Vegan','Vegetarian','Mediterranean']],

  ['x-pl-seitan-pilaf','Mushroom-seitan bulgur pilaf with green beans','Lunch',3,15,30,[['seitan',400],['bulgur',150],['mushrooms',300],['greenbeans',300],['onion',150],['olive',20],['garlic',10],['thyme',3],['lemon',50],['parsley',20],['salt',3]],[
    'Cook bulgur with the water amount and timing on its package. Rest covered for 5 minutes, then fluff. Trim green beans and cut into 3 cm pieces; steam for 5–7 minutes until tender-crisp.',
    'Slice mushrooms and dice onion. Heat half the oil in a large skillet over medium-high heat. Brown mushrooms for 7–9 minutes, stirring occasionally, until their released water has evaporated. Transfer to a bowl.',
    'Cut the ready-cooked seitan into bite-size strips. Add remaining oil to the skillet with onion and cook for 5–6 minutes. Add seitan and cook for 4–6 minutes, turning, until browned and piping hot.',
    'Add minced garlic, thyme and salt; stir for 30 seconds. Return mushrooms and green beans, add 60 ml water and scrape up the browned pan juices. Simmer for 2 minutes.',
    'Fold in bulgur, lemon juice and chopped parsley. Heat gently for 2–3 minutes until evenly hot, adding a little water if dry, then divide into three portions.'
  ],['Vegan','Vegetarian','High protein']],

  ['x-pl-whitebean-soup','Creamy white-bean soup with paprika chickpeas & toast','Lunch',3,20,30,[['whitebeans',600],['chickpeas',300],['bread',100],['spinach',180],['carrot',180],['onion',150],['olive',20],['garlic',12],['paprika',4],['thyme',3],['lemon',40],['salt',3]],[
    'Heat the oven to 400°F / 200°C. Rinse and drain both cooked beans. Dry the chickpeas well, toss with half the oil, paprika and one third of the salt, and spread on a lined tray.',
    'Roast chickpeas for 25–30 minutes, shaking twice, until their surfaces are dry and lightly crisp. They will soften once added to soup, so keep them separate until serving.',
    'Dice onion and carrot. Warm remaining oil in a large saucepan over medium heat and cook the vegetables for 8–10 minutes. Add chopped garlic and thyme and stir for 1 minute.',
    'Add white beans, remaining salt and 700 ml water. Simmer for 15 minutes until the carrot is soft. Blend about one third of the soup and return it to the pot, or crush some beans with a potato masher.',
    'Stir spinach into the soup for 2–3 minutes until wilted, then add lemon juice. Toast the bread in a dry toaster or skillet. Divide soup into three bowls and top with chickpeas; serve toast alongside.'
  ],['Vegan','Vegetarian','Mediterranean']],

  ['x-pl-tempeh-soba','Ginger-peanut tempeh soba salad with crunchy cabbage','Lunch',3,20,20,[['tempeh',450],['soba',150],['cabbage',250],['carrot',200],['pb',30],['soysauce',25],['lime',60],['ginger',18],['olive',10],['maple',15]],[
    'Cook soba noodles according to their package. Drain, rinse under cool water to remove excess surface starch and drain thoroughly. Cut very long noodles once or twice for easier mixing.',
    'Cut tempeh into small cubes. Simmer in a skillet with 80 ml water, covered, for 5 minutes. Uncover, evaporate the water, add oil and cook over medium-high heat for 7–9 minutes until several sides are browned. Follow any longer package cooking requirement.',
    'Whisk peanut butter, soy sauce, lime juice, finely grated ginger, maple syrup and 50–70 ml warm water until smooth and pourable.',
    'Thinly shred cabbage and grate carrots. Toss them with one third of the dressing and leave for 5 minutes to soften slightly.',
    'Combine noodles, tempeh, dressed vegetables and the remaining sauce. Toss thoroughly, loosening with a little water if needed. Divide into three portions and chill promptly if packing for later.'
  ],['Vegan','Vegetarian','High protein']],

  ['x-pl-tofu-peppers','Quinoa, corn & smoky tofu stuffed peppers','Lunch',3,20,40,[['tofu',600],['quinoa',150],['corn',150],['peppers',450],['tomato',250],['onion',120],['olive',15],['garlic',10],['cumin',4],['paprika',4],['lime',40],['salt',3]],[
    'Heat the oven to 400°F / 200°C. Rinse quinoa and cook according to its package, then rest covered for 5 minutes. Halve the peppers lengthwise and remove seeds, keeping the shells intact.',
    'Place pepper halves cut-side up in a baking dish with 60 ml water. Cover tightly and bake for 15 minutes to begin softening them.',
    'Drain tofu and press dry with a clean towel. Crumble it coarsely. Dice onion and tomatoes; mince garlic. Heat oil in a skillet and cook onion over medium heat for 6 minutes.',
    'Add tofu, garlic, cumin, paprika and salt. Cook for 7–9 minutes, stirring, until hot and lightly browned. Stir in tomatoes and drained cooked corn for 3 minutes, then fold in quinoa and lime juice.',
    'Spoon the filling into the pepper halves, mounding it gently; put any extra filling around the peppers. Bake uncovered for 20–25 minutes until peppers are tender and the filling is hot throughout. Divide into three servings.'
  ],['Vegan','Vegetarian','High protein']],

  ['x-pl-blackbean-tacos','Roasted sweet-potato & black-bean tacos with seed crunch','Lunch',3,20,30,[['blackbeans',600],['tortilla',180],['sweetpotato',300],['pumpkinseeds',45],['romaine',180],['tomato',200],['olive',15],['lime',60],['cumin',4],['paprika',4],['garlic',8],['salt',3]],[
    'Heat the oven to 425°F / 220°C. Cut sweet potato into 1 cm cubes and toss with oil, paprika, half the cumin and half the salt. Roast on a lined tray for 25–30 minutes, turning halfway, until browned and tender.',
    'Toast pumpkin seeds in a dry skillet over medium heat for 3–4 minutes, stirring, until fragrant and beginning to pop. Tip onto a plate and cool.',
    'Rinse and drain the cooked black beans. Put in a saucepan with minced garlic, remaining cumin and salt, and 80 ml water. Simmer for 6–8 minutes; mash about one third of the beans to thicken, then add half the lime juice.',
    'Shred romaine and dice tomatoes. Warm tortillas in a dry skillet for 20–30 seconds per side until flexible. Keep them covered with a clean towel.',
    'Divide beans and sweet potato among the tortillas. Add romaine, tomatoes and toasted seeds, and finish with the remaining lime juice. Serve immediately; keep the wet filling separate from tortillas for packed meals.'
  ],['Vegan','Vegetarian']],

  ['x-pl-redlentil-soup','Golden red-lentil, cauliflower & edamame soup','Lunch',3,20,40,[['redlentils',180],['edamame',450],['cauliflower',400],['coconutmilk',300],['spinach',120],['onion',150],['ginger',15],['garlic',10],['curry',8],['olive',15],['lemon',45],['salt',3]],[
    'Rinse the dry red lentils thoroughly. Dice onion, finely chop ginger and garlic, and cut cauliflower into small florets. Heat oil in a large saucepan over medium heat.',
    'Cook onion for 7–8 minutes until soft. Add ginger, garlic and curry powder and stir for 1 minute, lowering the heat if the spices begin to catch.',
    'Add lentils, coconut milk, salt and 800 ml water. Bring to a boil, then simmer gently for 30 minutes, stirring frequently near the end and adding water if needed. The lentils should be completely soft and breaking down, not crunchy.',
    'Add cauliflower after the lentils have simmered for 15 minutes. Add edamame for at least its full package cooking time near the end, ensuring both vegetables are tender and piping hot; extend the simmer if needed.',
    'Stir in spinach for 2–3 minutes until wilted. Add lemon juice and enough water for a thick but spoonable soup. Divide into three portions; the soup will thicken as it stands.'
  ],['Vegan','Vegetarian','High protein']],

  ['x-pl-tofu-potato-salad','Lemon-dill tofu & potato salad with green beans','Lunch',3,20,30,[['tofu',600],['potato',600],['greenbeans',300],['tahini',35],['mustard',25],['lemon',65],['dill',12],['onion',80],['olive',10],['garlic',6],['salt',3]],[
    'Cut potatoes into 2 cm chunks. Put in a saucepan, cover with water and bring to a simmer. Cook for 12–16 minutes until a knife enters easily, then drain and let steam-dry for 5 minutes.',
    'Trim green beans and steam for 5–7 minutes until tender-crisp. Cool briefly under running water and drain well. Finely dice the onion and chop dill.',
    'Drain tofu, press dry and cut into 2 cm cubes. Heat oil in a nonstick skillet over medium-high heat and cook tofu for 10–12 minutes, turning gently, until the edges are golden and the centers are hot.',
    'Whisk tahini, mustard, lemon juice, grated garlic, salt and 60–80 ml water into a smooth dressing. Stir in dill and onion.',
    'Fold warm potatoes and tofu into the dressing without breaking them, then add green beans. Divide into three portions. Serve warm or chill promptly in shallow containers for a cold packed lunch.'
  ],['Vegan','Vegetarian']],

  ['x-pl-lentil-cabbage-rolls','Lentil-mushroom cabbage rolls in thyme-tomato sauce','Lunch',3,30,60,[['lentils',600],['buckwheat',120],['mushrooms',300],['cabbage',600],['tomato',450],['tomatopaste',60],['onion',150],['olive',20],['garlic',10],['thyme',3],['salt',3]],[
    'Heat the oven to 375°F / 190°C. Cook buckwheat according to its package. Carefully loosen six to nine large cabbage leaves from the head; blanch them in simmering water for 3–5 minutes until flexible, then drain. Thin the thick central ribs with a knife.',
    'Finely chop mushrooms and onion. Cook them in half the oil over medium-high heat for 8–10 minutes until the mushrooms have released their liquid and it has evaporated. Add half the minced garlic and half the thyme for 1 minute.',
    'Mix the mushroom mixture with drained cooked lentils, buckwheat and half the salt. Mash a small amount of the filling so it holds together. Divide among the cabbage leaves, fold in the sides and roll into parcels.',
    'In the same pan, warm remaining oil with remaining garlic for 30 seconds. Add chopped tomatoes, tomato paste, remaining thyme and salt, and 200 ml water. Simmer for 10 minutes, crushing the tomatoes to make a loose sauce.',
    'Spread half the sauce in a baking dish, arrange rolls seam-side down and spoon over remaining sauce. Cover and bake for 35–40 minutes until the cabbage is tender and filling is hot throughout. Divide rolls and sauce into three portions.'
  ],['Vegan','Vegetarian','Mediterranean']],

  ['x-pl-basil-tofu-pasta','Roasted zucchini & basil-tofu pasta salad','Lunch',3,20,30,[['tofu',600],['pasta',180],['tomato',300],['zucchini',300],['basil',20],['balsamic',30],['olive',15],['garlic',8],['lemon',30],['salt',3]],[
    'Heat the oven to 425°F / 220°C. Drain tofu and pat dry, then cut into 2 cm cubes. Cut zucchini into thick half-moons. Toss both with oil and half the salt and spread on a lined tray.',
    'Roast for 25–30 minutes, turning halfway, until tofu edges brown and zucchini is tender. Let cool for 10 minutes while preparing the pasta.',
    'Cook pasta according to its package until tender. Drain, rinse briefly with cool water and drain thoroughly; excess water will dilute the dressing.',
    'Finely chop basil and garlic. Whisk with balsamic vinegar, lemon juice, remaining salt and 30 ml water. Dice tomatoes and stir them into the dressing so their juices join the sauce.',
    'Fold pasta, roasted tofu and zucchini into the tomato-basil mixture. Rest for 5 minutes, toss again and divide into three portions. Refrigerate promptly if serving later.'
  ],['Vegan','Vegetarian','Mediterranean','High protein']],

  ['x-pl-broccoli-jackets','Broccoli-cheddar baked potatoes with cottage-cheese cream','Lunch',3,15,65,[['cottage',450],['potato',750],['broccoli',450],['cheddar',90],['onion',90],['olive',10],['mustard',15],['pepper',2],['salt',2]],[
    'Heat the oven to 425°F / 220°C. Scrub three similar-size potatoes totaling the measured weight, dry them and prick each several times with a fork. Rub with half the oil and half the salt.',
    'Bake directly on a tray for 50–65 minutes until the centers are soft when pierced; larger potatoes may need longer. Meanwhile, dice onion and cut broccoli into small florets.',
    'Heat remaining oil in a skillet over medium heat and cook onion for 6–8 minutes. Add broccoli and 60 ml water, cover and steam for 5–7 minutes until tender. Uncover and evaporate remaining water.',
    'Blend or mash cottage cheese with mustard, pepper and remaining salt. Grate the cheddar, choosing a cheese labeled suitable for vegetarians.',
    'Split each hot potato and loosen the flesh with a fork. Add cottage-cheese cream and broccoli, sprinkle with cheddar and return to the oven for 4–6 minutes until the cheese melts. Serve one filled potato per portion.'
  ],['Vegetarian','High protein']],

  ['x-pl-ricotta-bean-melts','Spinach, ricotta & white-bean folded tortilla melts','Lunch',3,20,20,[['whitebeans',450],['ricotta',300],['mozzarella',90],['tortilla',180],['spinach',150],['tomato',200],['olive',10],['garlic',8],['oregano',2],['salt',2]],[
    'Rinse and drain cooked white beans, then mash coarsely. Dice tomatoes finely, letting excess juice drain into a small bowl. Mince garlic and grate mozzarella; use cheeses labeled suitable for vegetarians.',
    'Heat half the oil in a nonstick skillet over medium heat. Add garlic for 30 seconds, then spinach and oregano. Cook for 2–3 minutes until wilted and most moisture has evaporated.',
    'Mix beans, ricotta, cooked spinach, salt and half the mozzarella. Spread the filling over one half of each tortilla, keeping a 2 cm border. Scatter over remaining mozzarella and fold the tortillas shut.',
    'Brush the skillet with remaining oil and cook the folded tortillas in batches over medium-low heat for 3–4 minutes per side, pressing gently, until crisp and the centers are piping hot. Lower the heat if the bread browns before the filling warms.',
    'Rest for 2 minutes before cutting so the filling settles. Divide into three portions and serve with diced tomatoes. Keep the drained tomato juice for another use or stir a little into the tomatoes for serving.'
  ],['Vegetarian','Mediterranean','High protein']],

  ['x-pl-tempeh-ragu','Slow-simmered tempeh & mushroom pasta ragu','Dinner',3,20,40,[['tempeh',450],['pasta',180],['tomato',600],['carrot',150],['mushrooms',250],['onion',150],['tomatopaste',50],['olive',15],['garlic',10],['basil',15],['oregano',3],['salt',3]],[
    'Finely dice onion and carrot, chop mushrooms and mince garlic. Crumble tempeh into small pieces. Heat oil in a large deep skillet over medium heat.',
    'Cook onion and carrot for 8–10 minutes until softened. Add mushrooms and tempeh, increase to medium-high and cook for 8–10 minutes, stirring, until mushrooms lose their moisture and tempeh begins to brown.',
    'Stir in garlic, tomato paste and oregano for 1 minute. Add chopped tomatoes, salt and 250 ml water. Bring to a simmer, then cook gently for 25 minutes, stirring occasionally, until thick; follow any longer tempeh package requirement.',
    'Cook pasta according to its package. Reserve 150 ml cooking water before draining. Tear the basil leaves into small pieces.',
    'Fold pasta and basil into the ragu. Add reserved pasta water a little at a time until the sauce coats the noodles, and heat for 2 minutes. Divide into three portions.'
  ],['Vegan','Vegetarian','High protein']],

  ['x-pl-lentil-shepherd','Lentil, pea & thyme shepherd’s pie','Dinner',4,25,50,[['lentils',750],['potato',750],['peas',300],['carrot',200],['onion',150],['olive',25],['soymilk',150],['thyme',3],['garlic',10],['tomatopaste',50],['salt',3]],[
    'Heat the oven to 400°F / 200°C. Peel potatoes if desired, cut into equal chunks and simmer in water for 15–20 minutes until very tender. Drain thoroughly and steam-dry for 2 minutes.',
    'Dice onion and carrot and mince garlic. Heat two thirds of the oil in a wide saucepan over medium heat and cook onion and carrot for 8–10 minutes. Add garlic, thyme and tomato paste for 1 minute.',
    'Add drained cooked lentils, peas, half the salt and 200 ml water. Simmer for 10–12 minutes until carrots and peas are tender, following the peas’ package cooking instructions. Mash a few lentils to make a thick filling.',
    'Warm the soy milk without boiling. Mash potatoes with it, remaining oil and remaining salt until smooth enough to spread. Spoon lentil filling into a baking dish and cover with the mash, roughing the surface with a fork.',
    'Bake for 20–25 minutes until the edges bubble and the top begins to brown. Rest for 10 minutes before dividing into four portions; the filling will firm slightly as it stands.'
  ],['Vegan','Vegetarian']],

  ['x-pl-cauliflower-curry','Roasted cauliflower, chickpea & tofu coconut curry','Dinner',3,20,40,[['tofu',450],['chickpeas',300],['cauliflower',450],['coconutmilk',300],['rice',120],['onion',150],['curry',8],['ginger',15],['olive',15],['garlic',10],['lime',40],['salt',3]],[
    'Heat the oven to 425°F / 220°C. Cut cauliflower into small florets. Drain tofu, pat dry and tear into bite-size pieces. Toss both with half the oil and half the salt, then roast on a lined tray for 25–30 minutes, turning once.',
    'Cook rice with the water amount and timing on its package. Keep covered off the heat for 5 minutes, then fluff.',
    'Dice onion and finely chop ginger and garlic. Heat remaining oil in a deep saucepan over medium heat and cook onion for 7–8 minutes. Add ginger, garlic and curry powder and stir for 1 minute.',
    'Add coconut milk, rinsed cooked chickpeas, remaining salt and 150 ml water. Simmer gently for 10 minutes. Fold in roasted tofu and cauliflower and simmer for 5 minutes more until everything is piping hot.',
    'Stir in lime juice and loosen with a little water if the sauce is too thick. Divide curry and rice into three portions, keeping the rice separate for storage if convenient.'
  ],['Vegan','Vegetarian','High protein']],

  ['x-pl-seitan-fajita-bake','Smoky seitan & black-bean fajita tray with rice','Dinner',3,20,35,[['seitan',330],['rice',180],['peppers',400],['onion',200],['blackbeans',300],['olive',20],['lime',50],['cumin',4],['paprika',4],['garlic',8],['cilantro',15],['salt',3]],[
    'Heat the oven to 425°F / 220°C. Slice peppers, onion and ready-cooked seitan into strips. Mix oil, minced garlic, cumin, paprika, half the lime juice and two thirds of the salt.',
    'Toss peppers and onion with two thirds of the spice mixture. Spread in a large roasting dish and roast for 15 minutes until beginning to soften.',
    'Cook rice according to its package. Rest covered for 5 minutes before fluffing. Rinse and drain cooked black beans.',
    'Toss seitan with the remaining spice mixture and add to the roasting dish with black beans and 50 ml water. Stir and roast for another 12–15 minutes until vegetables are tender and seitan and beans are piping hot.',
    'Stir remaining lime juice, remaining salt and chopped cilantro into the rice. Divide rice and the roasted mixture into three portions, spooning the pan juices over the top.'
  ],['Vegan','Vegetarian','High protein']],

  ['x-pl-sesame-tofu-noodles','Sesame tofu, green-bean & mushroom noodle skillet','Dinner',3,20,25,[['tofu',550],['soba',180],['greenbeans',450],['mushrooms',300],['soysauce',30],['sesame',20],['olive',15],['ginger',20],['garlic',10],['maple',15],['lime',40]],[
    'Drain tofu and press dry, then cut into 2 cm cubes. Trim green beans and cut into short lengths; slice mushrooms. Cook soba according to its package, drain and rinse briefly to prevent sticking.',
    'Toast sesame seeds in a dry wide skillet over medium heat for 2–3 minutes, stirring, until fragrant. Remove to a small bowl. Whisk soy sauce, maple syrup, lime juice and 80 ml water.',
    'Heat two thirds of the oil in the skillet over medium-high heat. Brown tofu in a single layer for 10–12 minutes, turning gently, then transfer to a plate.',
    'Add remaining oil, mushrooms and beans. Cook for 4 minutes, then add finely chopped ginger and garlic, the soy mixture and another 50 ml water. Cover and simmer for 5–7 minutes until the beans are tender-crisp.',
    'Return tofu, add noodles and half the sesame seeds, and toss over medium heat for 2–3 minutes until hot and coated. Add water sparingly if the pan dries out. Divide into three portions and finish with remaining seeds.'
  ],['Vegan','Vegetarian','High protein']],

  ['x-pl-kidney-quinoa-boats','Kidney-bean & quinoa zucchini boats with pumpkin seeds','Dinner',3,25,45,[['kidneybeans',600],['quinoa',180],['zucchini',750],['tomato',400],['onion',150],['pumpkinseeds',45],['olive',15],['cumin',4],['oregano',3],['garlic',10],['salt',3]],[
    'Heat the oven to 400°F / 200°C. Halve the zucchini lengthwise and scoop out the soft centers, leaving walls about 1 cm thick. Chop the scooped flesh and set aside. Place shells in a baking dish with 60 ml water, cover and bake for 15 minutes.',
    'Rinse quinoa and cook according to its package, then rest covered for 5 minutes. Use ready-cooked canned kidney beans only; rinse and drain them. This timing is not suitable for dry kidney beans.',
    'Dice onion and tomatoes and mince garlic. Heat oil in a skillet and cook onion over medium heat for 7 minutes. Add chopped zucchini flesh, garlic, cumin and oregano; cook for 5 minutes until most liquid evaporates.',
    'Stir in tomatoes, kidney beans and salt and simmer for 8–10 minutes. Mash a few beans, then fold in cooked quinoa. Spoon generously into the softened zucchini shells, placing extra filling around them.',
    'Scatter pumpkin seeds over the filling. Bake uncovered for 20–25 minutes until zucchini is tender and filling is hot throughout; cover loosely if seeds brown too quickly. Divide into three portions.'
  ],['Vegan','Vegetarian','Mediterranean']],

  ['x-pl-chickpea-cabbage','Smoky chickpea-cabbage braise with crisp tofu & couscous','Dinner',4,25,40,[['tofu',600],['chickpeas',400],['cabbage',450],['carrot',200],['tomato',400],['olive',20],['paprika',5],['garlic',10],['lemon',50],['couscous',120],['onion',150],['salt',3]],[
    'Heat the oven to 425°F / 220°C. Drain tofu, pat dry and cut into 2 cm cubes. Toss with half the oil, half the paprika and one third of the salt. Roast on a lined tray for 25–30 minutes, turning once, until golden at the edges.',
    'Thinly slice onion and cabbage, cut carrots into small half-moons and chop tomatoes. Heat remaining oil in a large lidded pan over medium heat and cook onion and carrots for 7–8 minutes.',
    'Add minced garlic and remaining paprika for 30 seconds. Fold in cabbage, tomatoes, rinsed cooked chickpeas, remaining salt and 200 ml water. Cover and simmer for 20–25 minutes, stirring occasionally, until cabbage and carrots are tender.',
    'Prepare couscous with the boiling-water quantity and standing time on its package. Fluff with a fork, then stir in half the lemon juice.',
    'Finish the braise with remaining lemon juice. Divide couscous and vegetables into four portions and place crisp tofu on top immediately before serving. Keep tofu separate when storing if you prefer firmer edges.'
  ],['Vegan','Vegetarian']],

  ['x-pl-redlentil-dal','Red-lentil spinach dal with edamame & rice','Dinner',4,20,45,[['redlentils',240],['rice',180],['spinach',250],['coconutmilk',200],['onion',200],['tomato',400],['ginger',20],['garlic',10],['turmeric',3],['cumin',4],['olive',15],['edamame',300],['lemon',50],['salt',4]],[
    'Rinse the dry red lentils thoroughly. Dice onion and tomatoes, and finely chop ginger and garlic. Heat oil in a large saucepan over medium heat and cook onion for 8–10 minutes until soft.',
    'Stir in ginger, garlic, turmeric and cumin for 1 minute. Add tomatoes and cook for 5 minutes until beginning to collapse. Add lentils, coconut milk, salt and 900 ml water and bring to a boil.',
    'Lower to a gentle simmer and cook for at least 30 minutes, stirring frequently and adding water if needed to prevent sticking. The lentils should be completely soft and breaking down. Simmer longer if any remain firm.',
    'Meanwhile cook rice according to its package and rest covered for 5 minutes. Add shelled edamame to the dal near the end and simmer for at least its full package cooking time, extending the cooking as required.',
    'Stir spinach into the dal for 2–3 minutes until wilted, then add lemon juice. Adjust consistency with water and divide dal and rice into four portions.'
  ],['Vegan','Vegetarian','High protein']],

  ['x-pl-bean-barley-pot','White-bean, mushroom & pea barley pot','Dinner',4,20,50,[['whitebeans',750],['barley',180],['mushrooms',450],['peas',250],['onion',150],['olive',20],['lemon',50],['thyme',3],['garlic',12],['spinach',150],['salt',3]],[
    'Rinse barley, slice mushrooms, dice onion and mince garlic. Heat half the oil in a large heavy saucepan over medium-high heat. Cook mushrooms for 8–10 minutes until their released liquid evaporates and the edges brown, then remove to a bowl.',
    'Add remaining oil and onion to the pan. Cook over medium heat for 7 minutes, then add garlic and thyme for 1 minute. Stir in barley to coat it.',
    'Add salt and 1 litre water, bring to a boil and simmer gently for 30–40 minutes, or the barley package time, stirring occasionally. Add more water in small amounts if the barley begins to stick before becoming tender.',
    'Rinse and drain cooked white beans. Return mushrooms to the pot with beans and peas. Simmer for 7–10 minutes until hot and the peas are cooked, following any longer pea package cooking time.',
    'Fold in spinach for 2–3 minutes until wilted, then stir in lemon juice. The finished dish should be loose and spoonable rather than dry; add water if necessary. Divide into four portions.'
  ],['Vegan','Vegetarian','Mediterranean']],

  ['x-pl-pineapple-tempeh','Sweet-sour pineapple tempeh with broccoli rice','Dinner',3,20,30,[['tempeh',450],['rice',150],['pineapple',300],['broccoli',450],['peppers',250],['tomatopaste',50],['vinegar',35],['soysauce',30],['maple',20],['olive',15],['ginger',15],['garlic',10]],[
    'Cook rice according to its package. Cut broccoli into small florets and steam for 6–8 minutes until tender-crisp. Chop pineapple and peppers into bite-size pieces.',
    'Cut tempeh into cubes. Simmer in a wide skillet with 80 ml water, covered, for 5 minutes. Uncover, evaporate the water and add two thirds of the oil. Brown tempeh for 7–9 minutes, turning, then transfer to a plate; follow any longer package cooking requirement.',
    'Whisk tomato paste, vinegar, soy sauce, maple syrup and 100 ml water until smooth. Finely chop ginger and garlic.',
    'Heat remaining oil in the skillet. Cook peppers over medium-high heat for 5–6 minutes, add pineapple and cook for 2 minutes, then stir in ginger and garlic for 30 seconds. Add the sauce and simmer for 3–4 minutes until slightly thickened.',
    'Return tempeh and toss for 2–3 minutes until hot and glossy, adding a little water if the sauce reduces too far. Fold broccoli into the rice and divide between three portions with the pineapple tempeh.'
  ],['Vegan','Vegetarian','High protein']],

  ['x-pl-blackbean-sweetpotato-cakes','Sweet-potato black-bean cakes with quinoa & lime salad','Dinner',4,30,45,[['blackbeans',750],['sweetpotato',450],['oats',100],['quinoa',150],['pumpkinseeds',45],['olive',20],['romaine',250],['tomato',300],['lime',70],['cumin',5],['paprika',4],['garlic',10],['salt',4]],[
    'Heat the oven to 400°F / 200°C. Cut sweet potato into 2 cm cubes and steam for 12–15 minutes until very soft. Drain thoroughly and spread out for 5 minutes so excess moisture can escape. Cook rinsed quinoa according to its package.',
    'Rinse and drain cooked black beans, pat dry and mash coarsely with the sweet potato. Pulse oats into coarse crumbs, or crush with a rolling pin. Stir into the mash with grated garlic, cumin, paprika and half the salt; rest for 10 minutes.',
    'Form eight firm cakes. Brush a lined tray and the tops of the cakes with the measured oil. Bake for 30–35 minutes, turning carefully after 20 minutes, until firm with browned edges. Let stand for 5 minutes before moving.',
    'Toast pumpkin seeds in a dry skillet over medium heat for 3–4 minutes, stirring, until fragrant. Chop romaine and tomatoes. Stir half the lime juice and remaining salt into the cooked quinoa.',
    'Divide quinoa, romaine and tomatoes into four portions. Add two cakes per serving, scatter over pumpkin seeds and finish with remaining lime juice. Keep raw salad separate from hot cakes when packing.'
  ],['Vegan','Vegetarian']],

  ['x-pl-harissa-seitan','Harissa seitan, chickpea & vegetable roast with couscous','Dinner',3,20,35,[['seitan',300],['chickpeas',300],['couscous',150],['zucchini',450],['carrot',300],['harissa',35],['olive',20],['lemon',50],['parsley',20],['garlic',10],['salt',3]],[
    'Heat the oven to 425°F / 220°C. Cut carrots into thin batons and zucchini into thick half-moons. Slice ready-cooked seitan into strips, and rinse and drain cooked chickpeas.',
    'Mix harissa, oil, minced garlic, half the lemon juice and salt. Toss carrots with one third of the mixture and roast in a large dish for 12 minutes; carrots need a head start to soften.',
    'Toss zucchini, chickpeas and seitan with remaining harissa mixture. Add them to the carrots, spread evenly and roast for 20–25 minutes more, stirring once, until carrots are tender and seitan and beans are piping hot. Add 30 ml water if the paste begins to scorch.',
    'Prepare couscous with the water amount and standing time on its package. Fluff and mix with remaining lemon juice and finely chopped parsley.',
    'Divide couscous and roasted mixture into three portions, spooning over pan juices. Harissa heat and salt vary; use a mild product if preferred and check its ingredient label for personal exclusions.'
  ],['Vegan','Vegetarian','Mediterranean','High protein']],

  ['x-pl-lentil-lasagna','Spinach-ricotta lentil lasagna bake','Dinner',4,30,50,[['pasta',210],['ricotta',350],['lentils',450],['spinach',200],['tomato',600],['mozzarella',120],['onion',150],['garlic',10],['olive',15],['oregano',3],['salt',3]],[
    'Heat the oven to 375°F / 190°C. Use whole-wheat pasta in a short shape such as penne. Cook for 2 minutes less than its package time because it will finish in the oven. Drain, reserving 150 ml cooking water.',
    'Dice onion and tomatoes and mince garlic. Heat oil in a saucepan over medium heat and cook onion for 7–8 minutes. Add garlic and oregano for 1 minute, then tomatoes and salt. Simmer for 15 minutes until saucy.',
    'Rinse and drain cooked lentils and stir them into the tomato sauce. Put spinach in a separate pan with 30 ml water, cover and wilt for 2–3 minutes. Cool briefly, squeeze out excess liquid and chop.',
    'Mix spinach with ricotta, choosing ricotta and mozzarella labeled suitable for vegetarians. Fold pasta into the lentil sauce, adding enough reserved cooking water to keep it loose. Layer half in a baking dish, spoon over half the spinach ricotta and repeat; top with grated mozzarella.',
    'Cover and bake for 20 minutes, then uncover for 10–15 minutes until bubbling and lightly golden. Rest for 10 minutes before dividing into four portions.'
  ],['Vegetarian','Mediterranean','High protein']],

  ['x-pl-chickpea-shakshuka','Chickpea-feta shakshuka with whole-grain toast','Dinner',4,20,35,[['chickpeas',400],['eggs',200],['whites',250],['feta',80],['tomato',600],['peppers',300],['onion',150],['bread',180],['olive',20],['paprika',5],['cumin',3],['garlic',10],['salt',3]],[
    'Dice onion, peppers and tomatoes and mince garlic. Heat oil in a large lidded skillet over medium heat. Cook onion and peppers for 10–12 minutes until soft, stirring occasionally.',
    'Stir in garlic, paprika and cumin for 1 minute. Add tomatoes, salt and 100 ml water and simmer uncovered for 12–15 minutes, crushing tomatoes with a spoon, until a thick sauce forms.',
    'Rinse and drain cooked chickpeas and stir them into the sauce. Simmer for 3–4 minutes until hot. Beat whole eggs and egg whites together in a bowl, using the measured edible weights.',
    'Make shallow spaces in the sauce and pour the egg mixture into them in portions. Crumble vegetarian-suitable feta over the top. Cover and cook over low heat for 7–12 minutes until eggs are fully set and reach 160°F / 71°C in the center; avoid leaving runny pockets.',
    'Toast the bread while the eggs cook. Divide shakshuka and toast into four portions and serve promptly. For reheating, keep toast separate and heat the cooked egg dish thoroughly.'
  ],['Vegetarian','Mediterranean','High protein']]
];
