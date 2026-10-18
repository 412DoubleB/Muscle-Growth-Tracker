// Original AI-authored development recipes for Muscle Growth Tracker.
// Not kitchen tested. Weights are raw/dry unless the food reference says otherwise.
// Water is the only untracked ingredient; use the measured oil for pans and trays.
export const MEAT_FISH_SPECS = [
  ['x-mf-shawarma-wraps','Spiced chicken flatbread wraps with cucumber yogurt','Lunch',3,20,20,[['chicken',450],['tortilla',210],['yogurt',180],['cucumber',180],['cabbage',180],['tomato',180],['olive',18],['lemon',45],['garlic',9],['cumin',4],['paprika',4],['turmeric',2],['salt',3]],[
    'Slice chicken into thin strips on a separate board. Toss with half the oil, minced garlic, cumin, paprika, turmeric and half the salt; leave refrigerated while preparing the vegetables.',
    'Grate cucumber and squeeze out excess water. Mix with yogurt and half the lemon juice. Thinly shred cabbage, dice tomato and toss them with the remaining lemon juice and salt.',
    'Heat a large skillet over medium-high heat. Add the remaining oil and chicken in one uncrowded layer, working in batches if necessary. Cook for 8–12 minutes, turning, until the thickest strips reach 165°F / 74°C.',
    'Transfer chicken to a clean plate. Warm tortillas in the dry skillet over medium heat for 20–30 seconds per side until flexible; avoid cooking them until brittle.',
    'Divide chicken, cabbage salad and cucumber yogurt among the tortillas. Fold in the sides and roll tightly. Pack the cold yogurt and salad separately if the chicken will be reheated later.'
  ],['High protein','Mediterranean']],
  ['x-mf-turkey-couscous-soup','Turkey-zucchini meatball and couscous soup','Lunch',3,25,30,[['turkey',450],['couscous',180],['zucchini',300],['carrot',180],['onion',120],['tomato',300],['olive',15],['garlic',9],['parsley',18],['lemon',35],['oregano',3],['salt',3],['pepper',1]],[
    'Grate half the zucchini and squeeze it dry in a clean towel. Mix with turkey, half the finely chopped parsley, half the oregano and half the salt. Shape into 18 small meatballs; refrigerate while starting the soup.',
    'Dice the remaining zucchini, carrot and onion. Heat oil in a wide pot over medium heat and soften onion and carrot for 7–9 minutes. Add minced garlic and the remaining oregano; stir for 30 seconds.',
    'Add chopped tomatoes, the remaining salt, pepper and 900 ml water. Bring to a gentle simmer, add the meatballs without stacking, cover and simmer for 12–16 minutes until their centers reach 165°F / 74°C.',
    'Add diced zucchini and simmer for 5 minutes. Meanwhile put couscous in a heatproof bowl, add boiling water according to its package, cover and stand for the stated time, then fluff.',
    'Stir lemon juice and remaining parsley into the soup. Divide couscous among three bowls and ladle soup and six meatballs into each. For storage, chill couscous separately so it does not absorb all the broth.'
  ],['High protein','Mediterranean']],
  ['x-mf-salmon-soba-salad','Sesame salmon soba salad with edamame and crunchy vegetables','Lunch',2,20,20,[['salmon',280],['soba',140],['edamame',100],['cabbage',180],['carrot',120],['cucumber',150],['sesame',15],['soysauce',24],['lime',40],['ginger',10],['olive',10],['maple',12]],[
    'Heat the oven to 400°F / 200°C. Rub salmon with the measured oil and place on a lined tray. Bake for 12–18 minutes, depending on thickness, until the center reaches 145°F / 63°C; transfer to a clean plate.',
    'Cook soba according to its package, adding edamame only for the cooking time specified on the edamame package. Drain, rinse briefly with cold water and drain thoroughly.',
    'Whisk soy sauce, lime juice, grated ginger, maple syrup and 20 ml water in a large bowl. Shred cabbage, cut carrot into fine matchsticks and thinly slice cucumber.',
    'Toast sesame seeds in a dry skillet over medium-low heat for 2–3 minutes, stirring continuously until lightly golden. Immediately tip onto a cool plate to prevent scorching.',
    'Toss noodles, edamame and vegetables with the dressing. Divide into two portions, flake salmon over the top and finish with sesame. Serve promptly or chill; keep the fish cold if taking the salad to work.'
  ],['High protein']],
  ['x-mf-tuna-sweetpotato-cakes','Tuna and sweet potato cakes with tangy cabbage slaw','Lunch',3,25,40,[['tuna',360],['sweetpotato',600],['oats',90],['eggs',100],['yogurt',150],['cabbage',300],['carrot',150],['olive',20],['lemon',45],['mustard',18],['dill',10],['paprika',3],['salt',2]],[
    'Peel sweet potato and cut into 2 cm cubes. Cover with water in a saucepan, simmer for 12–15 minutes until easily pierced, then drain very well. Mash and spread in a wide bowl to cool for 10 minutes.',
    'Shred cabbage and carrot. Whisk yogurt, half the lemon juice, half the mustard, chopped dill and half the salt; toss with the vegetables and refrigerate.',
    'Heat the oven to 425°F / 220°C. Drain ready-to-eat canned tuna. Mix it into the cooled sweet potato with oats, eggs, paprika, remaining mustard, lemon juice and salt. Shape into nine equal cakes with damp hands.',
    'Brush a lined tray and the tops of the cakes with all the measured oil. Bake for 12 minutes, turn carefully with a wide spatula, and bake 10–14 minutes more until browned and the centers reach 160°F / 71°C for the egg mixture.',
    'Let cakes stand for 5 minutes so they firm up. Serve three per portion alongside the cold slaw. Refrigerate packed cakes and slaw separately; reheat cooked cakes to 165°F / 74°C.'
  ],['High protein']],
  ['x-mf-beef-kofta-flatbread','Beef kofta flatbreads with herbed tomato and yogurt','Lunch',3,25,20,[['beef',450],['bread',210],['yogurt',150],['tomato',300],['cucumber',200],['onion',100],['olive',15],['lemon',45],['parsley',18],['garlic',8],['cumin',4],['paprika',3],['salt',3],['pepper',1]],[
    'Finely grate half the onion and squeeze out excess liquid. Mix it with beef, minced garlic, cumin, paprika, pepper, half the parsley and half the salt. Form nine short, evenly thick kofta logs.',
    'Dice tomato, cucumber and remaining onion. Toss with half the lemon juice, one third of the oil and the remaining parsley and salt. Keep chilled while the beef cooks.',
    'Mix yogurt with the remaining lemon juice and 15 ml water. Heat a large skillet over medium-high heat with the remaining oil; add kofta in one layer without crowding.',
    'Cook for 10–14 minutes, turning several times to brown the sides, until the center of every kofta reaches 160°F / 71°C. Reduce heat to medium if the outside browns before the center cooks.',
    'Toast bread and spread with the lemon yogurt. Divide kofta and chopped salad among three servings, spooning excess salad liquid alongside instead of soaking the bread. Pack bread separately for later meals.'
  ],['High protein','Mediterranean']],
  ['x-mf-pork-apple-barley','Mustard pork, apple and barley lunch salad','Lunch',3,20,45,[['pork',450],['barley',180],['apple',250],['spinach',120],['mushrooms',250],['olive',20],['mustard',25],['lemon',40],['thyme',3],['garlic',8],['salt',3],['pepper',1]],[
    'Rinse barley and simmer in water according to its package, usually 30–45 minutes, until tender with a slight chew. Drain well and spread in a wide bowl.',
    'Trim pork tenderloin and pat dry. Rub with one third of the oil, half the thyme, half the salt and the pepper. Heat the oven to 425°F / 220°C.',
    'Heat an oven-safe skillet over medium-high heat. Sear pork for 2 minutes on each of four sides, then roast for approximately 10–18 minutes until its thickest point reaches 145°F / 63°C. Rest for at least 3 minutes before slicing.',
    'While pork rests, heat another third of the oil in a skillet over medium heat. Cook sliced mushrooms for 7–9 minutes until their water evaporates; add minced garlic and remaining thyme for the final minute.',
    'Whisk mustard, lemon juice, remaining oil and salt with 20 ml water. Toss barley, mushrooms, diced apple and spinach with the dressing, then top with sliced pork. Serve warm or cool promptly and refrigerate for a chilled lunch.'
  ],['High protein']],
  ['x-mf-shrimp-pineapple-rice','Pineapple shrimp fried rice with peas and egg','Lunch',3,20,30,[['shrimp',500],['rice',180],['eggs',150],['pineapple',180],['peas',150],['carrot',150],['onion',100],['olive',20],['soysauce',25],['ginger',12],['garlic',8],['lime',35]],[
    'Cook rice according to its package. Spread freshly cooked rice on a large tray for 10–15 minutes to release steam while preparing the other ingredients; use it promptly rather than leaving it at room temperature.',
    'Pat peeled shrimp dry. Dice pineapple, carrot and onion, and mince ginger and garlic. Beat eggs in a small bowl; keep the raw shrimp and egg utensils away from the cooked rice.',
    'Heat half the oil in a large wok or skillet over medium-high heat. Add shrimp in batches and cook for 3–5 minutes, turning, until opaque and firm throughout. Transfer to a clean plate.',
    'Add the remaining oil, onion and carrot; stir-fry for 5–7 minutes. Stir in garlic and ginger for 30 seconds, push vegetables aside, and add eggs. Scramble until fully set, then mix with the vegetables.',
    'Add rice, peas, pineapple and soy sauce. Stir-fry for 4–6 minutes until peas are cooked and everything is steaming hot. Return shrimp just long enough to heat through, finish with lime juice and divide immediately into three portions.'
  ],['High protein']],
  ['x-mf-chicken-ricotta-pasta','Chicken, tomato and ricotta baked pasta','Lunch',4,20,35,[['chicken',500],['pasta',280],['ricotta',120],['mozzarella',80],['tomato',600],['spinach',180],['onion',150],['olive',20],['garlic',12],['basil',18],['oregano',3],['salt',4],['pepper',1]],[
    'Heat the oven to 400°F / 200°C. Cook pasta in water until 2 minutes short of its package timing. Reserve 250 ml cooking water, then drain; it will finish cooking in the sauce.',
    'Cut chicken into 2 cm cubes. Heat half the oil in a deep skillet over medium-high heat and cook chicken for 8–12 minutes, stirring, until the largest pieces reach 165°F / 74°C. Transfer to a clean bowl.',
    'Add remaining oil and diced onion to the skillet. Cook over medium heat for 6–8 minutes, then stir in minced garlic, oregano, salt and pepper for 30 seconds. Add chopped tomatoes and simmer for 10 minutes.',
    'Stir spinach into the tomato sauce until wilted. Fold in pasta, cooked chicken, chopped basil and enough reserved water to make a loose sauce. Transfer to a baking dish and dot ricotta evenly over the top.',
    'Scatter grated mozzarella over the dish and bake for 15–20 minutes until bubbling throughout and the cheese is melted. Rest for 5 minutes before dividing into four portions; keep chilled portions covered so the pasta stays moist.'
  ],['High protein','Mediterranean']],
  ['x-mf-turkey-lentil-peppers','Turkey and lentil stuffed peppers with tomato rice','Lunch',3,25,45,[['turkey',350],['lentils',360],['rice',120],['peppers',600],['tomato',400],['onion',120],['mozzarella',60],['olive',15],['garlic',9],['oregano',3],['paprika',3],['salt',3]],[
    'Heat the oven to 400°F / 200°C. Halve peppers lengthwise and remove seeds. Brush their outside with one third of the oil, place cut-side up in a baking dish and bake for 12 minutes.',
    'Cook rice according to its package. Drain cooked lentils well. Finely dice onion and chop tomatoes, keeping half the tomatoes separate for the baking dish.',
    'Heat remaining oil in a skillet over medium heat and soften onion for 6 minutes. Add turkey, minced garlic, oregano, paprika and salt; break up and cook for 8–10 minutes until turkey reaches 165°F / 74°C.',
    'Add half the tomatoes and simmer for 5 minutes. Fold in rice and lentils. Spread remaining tomatoes and 100 ml water around the peppers, then pack the filling evenly into the six pepper halves.',
    'Cover the dish and bake for 20 minutes. Uncover, scatter mozzarella over the filling and bake another 8–12 minutes until peppers are tender and filling is steaming throughout. Serve two halves per portion with the tomato juices.'
  ],['High protein','Mediterranean']],
  ['x-mf-cod-chickpea-stew','Paprika cod and chickpea stew with fluffy couscous','Lunch',3,20,30,[['cod',500],['chickpeas',300],['couscous',120],['tomato',500],['zucchini',300],['onion',120],['olive',15],['lemon',40],['garlic',9],['parsley',15],['paprika',4],['cumin',2],['salt',3]],[
    'Pat cod dry and cut into six large pieces. Drain and rinse cooked chickpeas. Dice onion and zucchini, chop tomatoes, and mince garlic.',
    'Heat oil in a wide lidded saucepan over medium heat. Cook onion and zucchini for 7–9 minutes. Stir in garlic, paprika and cumin for 30 seconds without letting the spices burn.',
    'Add tomatoes, chickpeas, salt and 200 ml water. Bring to a simmer and cook uncovered for 10–12 minutes until the tomatoes break down and the sauce thickens slightly.',
    'Nestle cod into the sauce, cover and simmer gently for 8–12 minutes until the thickest fish pieces reach 145°F / 63°C. Meanwhile prepare couscous with boiling water using its package ratio and stand time.',
    'Fluff couscous and divide among three bowls. Gently stir lemon juice and chopped parsley into the stew without breaking the fish apart. Spoon two cod pieces and the chickpea sauce over each serving.'
  ],['High protein','Mediterranean']],
  ['x-mf-chicken-peanut-noodles','Peanut chicken and cabbage noodle skillet','Lunch',3,20,25,[['chicken',450],['soba',180],['cabbage',300],['carrot',180],['peppers',180],['pb',45],['soysauce',25],['lime',45],['ginger',12],['garlic',8],['olive',10],['chili',1]],[
    'Whisk peanut butter, soy sauce, lime juice, finely grated ginger, chili and 100 ml warm water into a smooth sauce. Slice chicken thinly on a separate board, then shred cabbage and cut carrot and peppers into fine strips.',
    'Cook soba in water according to its package. Reserve 150 ml cooking water before draining, then rinse briefly so the noodles do not clump.',
    'Heat oil in a large nonstick skillet over medium-high heat. Cook chicken in an even layer for 8–12 minutes, turning, until the thickest strips reach 165°F / 74°C. Transfer to a clean plate.',
    'Add vegetables and 50 ml water to the skillet. Cover for 3 minutes, uncover and stir-fry for 4–5 minutes until just tender. Add minced garlic and cook for 30 seconds.',
    'Reduce heat to low. Add peanut sauce, noodles and chicken; toss for 2–3 minutes until hot. Loosen with reserved noodle water a little at a time so the sauce coats rather than glues the noodles together.'
  ],['High protein']],
  ['x-mf-beef-bean-burgers','Beef and black bean burgers with sweet potato wedges','Lunch',3,25,35,[['beef',400],['blackbeans',240],['oats',60],['bread',150],['sweetpotato',450],['tomato',150],['romaine',90],['onion',80],['olive',15],['mustard',25],['paprika',4],['cumin',3],['salt',3]],[
    'Heat the oven to 425°F / 220°C. Cut sweet potato into slender wedges, toss with two thirds of the oil, half the paprika and half the salt, and roast on a lined tray for 30–35 minutes, turning halfway.',
    'Drain black beans and pat dry. Mash coarsely in a bowl, then mix with beef, oats, finely grated onion, cumin and remaining paprika and salt. Shape into three equally thick patties and chill for 10 minutes.',
    'Heat remaining oil in a large skillet over medium heat. Cook patties for approximately 5–7 minutes per side, turning once carefully, until each center reaches 160°F / 71°C; lower heat if they brown too quickly.',
    'Toast bread and spread with mustard. Slice tomato and wash and dry romaine. Let cooked burgers stand on a clean plate for 3 minutes so they hold together when lifted.',
    'Build three bread sandwiches with patties, tomato and romaine. Divide roasted wedges alongside. For packed lunches, keep the bread and salad separate from patties and wedges until serving.'
  ],['High protein']],
  ['x-mf-salmon-quinoa-boats','Salmon and quinoa stuffed zucchini with lemon ricotta','Lunch',2,25,35,[['salmon',300],['quinoa',100],['zucchini',500],['ricotta',100],['tomato',250],['olive',10],['lemon',35],['garlic',6],['dill',10],['salt',2],['pepper',1]],[
    'Heat the oven to 400°F / 200°C. Rinse quinoa and cook with water according to its package. Rest covered for 5 minutes, then fluff.',
    'Halve zucchini lengthwise and scoop out the soft centers, leaving sturdy shells. Chop the scooped flesh. Rub shells with half the oil and place in a baking dish; roast for 12 minutes.',
    'Place salmon on a second lined tray, rub with remaining oil and half the salt, and bake for 12–18 minutes until the thickest part reaches 145°F / 63°C. Remove any bones and flake with a clean fork.',
    'Mix quinoa with salmon, chopped zucchini flesh, diced tomato, minced garlic, chopped dill, pepper, remaining salt and half the lemon juice. Spoon evenly into the warm zucchini shells.',
    'Bake stuffed zucchini for 12–15 minutes until the shells are tender and the filling is steaming hot. Stir remaining lemon juice into ricotta, loosen with 10–20 ml water, and spoon over the two servings after baking.'
  ],['High protein','Mediterranean']],
  ['x-mf-pork-fajita-wraps','Pork fajita wraps with black beans and avocado lime cream','Lunch',3,20,25,[['pork',450],['tortilla',240],['blackbeans',180],['peppers',300],['onion',150],['avocado',100],['olive',15],['lime',45],['garlic',8],['cumin',4],['paprika',4],['cilantro',15],['salt',3]],[
    'Cut tenderloin across the grain into strips about 1 cm thick. Toss with half the oil, minced garlic, cumin, paprika and half the salt. Slice peppers and onion into similar-width strips.',
    'Mash avocado with half the lime juice and 15–30 ml water to make a spoonable cream. Stir in chopped cilantro and the remaining salt. Drain and rinse cooked black beans.',
    'Heat a wide skillet over medium-high heat. Add remaining oil and cook peppers and onion for 8–10 minutes until tender with browned edges. Transfer to a bowl and cover.',
    'Cook pork in the same skillet in uncrowded batches for 5–8 minutes, turning, until the thickest pieces reach 145°F / 63°C. Rest the pork for at least 3 minutes, then combine with vegetables, beans and remaining lime juice; heat gently until beans are hot.',
    'Warm tortillas in a dry skillet for 20–30 seconds per side. Divide the pork mixture and avocado cream among them and fold into wraps. Keep avocado cream chilled and separate for make-ahead lunches.'
  ],['High protein']],
  ['x-mf-chicken-raisin-braise','Cumin chicken and chickpea braise with raisin couscous','Dinner',3,20,35,[['chicken',450],['chickpeas',240],['couscous',120],['raisins',45],['carrot',240],['tomato',400],['onion',150],['olive',15],['lemon',40],['garlic',9],['cumin',4],['cinnamon',1],['parsley',18],['salt',3]],[
    'Cut chicken into large bite-size pieces and pat dry. Dice onion, slice carrots into thin half-moons, chop tomatoes and drain and rinse cooked chickpeas.',
    'Heat oil in a lidded saucepan over medium-high heat. Brown chicken for 4–5 minutes, turning; it will finish cooking in the sauce. Transfer temporarily to a plate used only for this partly cooked chicken.',
    'Reduce heat to medium, add onion and carrot, and cook for 7 minutes, loosening browned bits with 30 ml water. Stir in minced garlic, cumin and cinnamon for 30 seconds.',
    'Add tomatoes, chickpeas, salt, chicken with its juices and 200 ml water. Cover and simmer gently for 15–20 minutes until carrot is tender and every chicken piece reaches 165°F / 74°C. Uncover for the last 5 minutes if the sauce is thin.',
    'Prepare couscous according to its package, adding raisins before pouring in the boiling water. Fluff after standing, stir lemon juice and chopped parsley into the braise, and divide both components among three plates.'
  ],['High protein','Mediterranean']],
  ['x-mf-turkey-sweetpotato-pie','Turkey and pea cottage pie with sweet potato topping','Dinner',3,25,50,[['turkey',450],['sweetpotato',600],['cottage',150],['peas',180],['carrot',180],['onion',120],['mushrooms',200],['tomatopaste',40],['olive',15],['garlic',8],['thyme',3],['salt',3],['pepper',1]],[
    'Heat the oven to 400°F / 200°C. Peel and dice sweet potato, cover with water in a saucepan and simmer for 15–18 minutes until very tender. Drain thoroughly, then mash with cottage cheese and half the salt.',
    'Dice onion, carrot and mushrooms. Heat oil in a large skillet over medium heat and cook vegetables for 8–10 minutes until softened and mushroom liquid has mostly evaporated.',
    'Add turkey, minced garlic, thyme and pepper. Break turkey into small pieces and cook for 8–10 minutes until it reaches 165°F / 74°C. Stir tomato paste through the mixture for 1 minute.',
    'Add peas, remaining salt and 200 ml water. Simmer uncovered for 6–8 minutes until peas are cooked and the filling is moist but not watery. Transfer to a small baking dish.',
    'Spread sweet potato mash over the filling and rake the surface with a fork. Bake for 20–25 minutes until bubbling at the edges and steaming in the center; rest 8 minutes before cutting into three portions.'
  ],['High protein']],
  ['x-mf-beef-barley-stew','Beef, mushroom and white bean barley stew','Dinner',4,20,55,[['beef',600],['barley',240],['whitebeans',240],['mushrooms',400],['carrot',240],['onion',180],['tomato',400],['tomatopaste',40],['olive',20],['garlic',12],['thyme',4],['parsley',20],['salt',4],['pepper',2]],[
    'Rinse barley and drain cooked white beans. Dice carrot and onion, quarter mushrooms, chop tomatoes and mince garlic. Have 1.2 liters water ready for the stew.',
    'Heat half the oil in a large heavy pot over medium-high heat. Add beef, break into rough bite-size crumbles and brown for 8–10 minutes until it reaches 160°F / 71°C. Transfer to a bowl with a clean utensil.',
    'Add remaining oil and the mushrooms to the pot. Cook for 6–8 minutes until browned, then add onion and carrot and cook another 5 minutes. Stir in garlic, thyme, pepper and tomato paste for 1 minute.',
    'Return beef and add barley, tomatoes, salt and the water. Bring to a boil, reduce to a gentle simmer, cover loosely and cook for 30–40 minutes, stirring occasionally, until barley is tender. Add small amounts of water if it becomes dry.',
    'Stir in white beans and simmer uncovered for 5–8 minutes until heated through and the stew thickens. Fold in chopped parsley and divide among four bowls; the barley will absorb more broth during storage, so add water when reheating.'
  ],['High protein']],
  ['x-mf-pork-dijon-tray','Dijon pork tenderloin with roasted potatoes and green beans','Dinner',3,20,40,[['pork',500],['potato',750],['greenbeans',450],['yogurt',150],['olive',20],['mustard',30],['lemon',35],['garlic',9],['thyme',3],['salt',3],['pepper',1]],[
    'Heat the oven to 425°F / 220°C. Cut potatoes into 2 cm pieces and toss with half the oil, half the thyme and half the salt. Spread on a large lined tray and roast for 18 minutes.',
    'Trim and pat dry the pork. Mix half the mustard with one quarter of the oil, minced garlic, pepper and the remaining thyme; rub over the tenderloin.',
    'Move potatoes to the sides of the tray and place pork in the center. Roast for 15 minutes. Toss trimmed green beans with remaining oil and salt, then add them to the tray, using a second tray if necessary to avoid crowding.',
    'Continue roasting for 8–15 minutes, removing pork as soon as its thickest point reaches 145°F / 63°C. Rest pork for at least 3 minutes. Leave potatoes and beans in the oven until tender and browned if they need longer.',
    'Whisk yogurt with remaining mustard and lemon juice. Slice pork across the grain and divide among three plates with potatoes and beans; spoon the cold yogurt sauce alongside rather than baking it.'
  ],['High protein']],
  ['x-mf-salmon-coconut-curry','Salmon and vegetable coconut curry with rice','Dinner',3,20,30,[['salmon',450],['rice',180],['coconutmilk',250],['peas',150],['cauliflower',350],['spinach',120],['onion',120],['olive',10],['ginger',15],['garlic',9],['curry',6],['lime',45],['salt',3]],[
    'Start rice in water according to its package. Cut cauliflower into small florets, dice onion, mince garlic and ginger, and cut salmon into six large pieces.',
    'Heat oil in a wide lidded saucepan over medium heat. Cook onion for 6–8 minutes, then stir in ginger, garlic and curry powder for 45 seconds until fragrant.',
    'Add coconut milk, 250 ml water, salt and cauliflower. Bring to a gentle simmer, cover and cook for 8–10 minutes until the cauliflower is nearly tender.',
    'Add peas and nestle salmon into the sauce. Cover and simmer gently for 8–12 minutes until peas are cooked and the thickest fish pieces reach 145°F / 63°C; avoid vigorous boiling, which breaks up the fish.',
    'Fold spinach into the sauce until wilted and finish with lime juice. Divide rice among three bowls and add two salmon pieces with vegetables and curry sauce to each.'
  ],['High protein']],
  ['x-mf-shrimp-tomato-pasta','Garlic shrimp pasta with roasted tomatoes, spinach and feta','Dinner',3,20,30,[['shrimp',600],['pasta',180],['tomato',600],['spinach',180],['feta',60],['olive',15],['garlic',12],['lemon',40],['basil',18],['oregano',3],['salt',3],['chili',1]],[
    'Heat the oven to 425°F / 220°C. Halve tomatoes and toss in a roasting dish with two thirds of the oil, oregano, half the salt and half the minced garlic. Roast for 20–25 minutes until collapsed and juicy.',
    'Cook pasta according to its package, reserving 250 ml cooking water before draining. Pat peeled shrimp dry while the pasta cooks.',
    'Heat remaining oil in a wide skillet over medium-high heat. Add shrimp in one layer, working in batches, and cook for 3–5 minutes, turning, until opaque and firm throughout. Add remaining garlic and chili during the final 30 seconds.',
    'Turn heat to medium-low and add roasted tomatoes with all their juices, spinach and remaining salt. Stir for 1–2 minutes until the spinach wilts, then fold in pasta and enough reserved water to loosen the sauce.',
    'Remove from heat and add lemon juice and torn basil. Divide among three plates and crumble feta over each serving. Serve immediately so the shrimp stay tender.'
  ],['High protein','Mediterranean']],
  ['x-mf-cod-crunch-tacos','Oven cod tacos with corn slaw and avocado yogurt','Dinner',3,25,25,[['cod',600],['tortilla',210],['corn',180],['cabbage',250],['carrot',120],['avocado',100],['yogurt',120],['olive',15],['lime',45],['paprika',4],['cumin',3],['garlic',6],['cilantro',15],['salt',3]],[
    'Heat the oven to 425°F / 220°C. Pat cod dry and cut into thick strips. Coat with oil, paprika, cumin, minced garlic and half the salt, then arrange on a lined tray without touching.',
    'Bake fish for approximately 12–18 minutes, checking early for thin pieces, until the thickest strips reach 145°F / 63°C. Remove finished pieces to a clean warm plate.',
    'Meanwhile shred cabbage and grate carrot. Drain cooked corn and toss with cabbage, carrot, half the lime juice, chopped cilantro and remaining salt.',
    'Mash avocado with yogurt and remaining lime juice until mostly smooth. Add 15–30 ml water if needed for a spreadable sauce. Warm tortillas in a dry skillet over medium heat for 20–30 seconds on each side.',
    'Divide avocado yogurt, cod and corn slaw among the tortillas. Serve three equal portions promptly; keep sauce and slaw chilled and separate from cooked fish if packing for later.'
  ],['High protein']],
  ['x-mf-turkey-meatloaf','Tomato-glazed turkey meatloaf with cottage cheese mash','Dinner',4,25,60,[['turkey',600],['oats',100],['eggs',100],['cottage',200],['potato',800],['broccoli',500],['onion',150],['carrot',150],['tomatopaste',60],['mustard',25],['olive',15],['thyme',4],['garlic',10],['salt',4],['pepper',2]],[
    'Heat the oven to 375°F / 190°C. Finely grate onion and carrot. Mix turkey with oats, eggs, the grated vegetables, minced garlic, thyme, pepper and half the salt, handling only until combined.',
    'Use one third of the measured oil to lightly coat a lined baking tray. Shape the mixture into a low loaf roughly 8 cm thick. Mix tomato paste, mustard and 40 ml water; spread over the loaf.',
    'Bake for approximately 45–60 minutes until the center reaches 165°F / 74°C. Start checking at 40 minutes and tent loosely with foil if the glaze darkens too quickly. Rest for 10 minutes before slicing.',
    'While the loaf bakes, peel and cube potatoes. Simmer in water for 15–20 minutes until tender, drain, and mash with cottage cheese and remaining salt. Add a little hot water if the mash is too stiff.',
    'Steam broccoli for 5–7 minutes until tender-crisp and toss with remaining oil. Cut meatloaf into four portions and serve with mash and broccoli, spooning any cooked tray juices over the meat.'
  ],['High protein']],
  ['x-mf-chicken-ricotta-rolls','Spinach-ricotta chicken rolls with tomato quinoa','Dinner',3,30,35,[['chicken',450],['ricotta',180],['quinoa',150],['spinach',180],['tomato',400],['olive',15],['garlic',9],['lemon',35],['basil',15],['oregano',3],['salt',3],['pepper',1]],[
    'Heat the oven to 400°F / 200°C. Rinse quinoa and cook according to its package. Slice chicken horizontally into six thin cutlets and gently flatten between sheets of parchment to an even thickness.',
    'Heat one third of the oil in a skillet over medium heat. Add spinach and stir for 1–2 minutes until wilted; cool slightly, squeeze out excess liquid and chop. Mix with ricotta, half the minced garlic, pepper and half the salt.',
    'Divide the ricotta mixture across the chicken cutlets, leaving a small border. Roll each from a short end and secure with a toothpick; keep raw chicken away from the cooked quinoa and remaining vegetables.',
    'Place chopped tomatoes in a baking dish with remaining garlic, oil, salt and oregano. Set chicken rolls seam-side down in the tomatoes and bake for 25–35 minutes until the center of every roll, including its filling, reaches 165°F / 74°C.',
    'Rest rolls for 5 minutes and remove every toothpick before serving. Fold lemon juice, chopped basil and some cooked tomato juices through quinoa. Serve two rolls per portion with quinoa and the remaining tomatoes.'
  ],['High protein','Mediterranean']],
  ['x-mf-beef-enchilada-skillet','Beef and black bean tortilla bake with peppers','Dinner',3,20,35,[['beef',400],['blackbeans',240],['tortilla',180],['cheddar',80],['tomato',500],['peppers',250],['onion',120],['tomatopaste',35],['olive',10],['garlic',9],['cumin',4],['paprika',4],['lime',35],['cilantro',15],['salt',3]],[
    'Heat the oven to 400°F / 200°C. Cut tortillas into wide strips. Drain and rinse cooked black beans, dice peppers and onion, chop tomatoes and mince garlic.',
    'Heat oil in a large oven-safe skillet over medium-high heat. Add beef and cook for 8–10 minutes, breaking it up, until it reaches 160°F / 71°C. Transfer to a bowl using a clean utensil.',
    'Reduce heat to medium and cook peppers and onion in the skillet for 7–9 minutes. Add garlic, cumin, paprika and tomato paste; stir for 1 minute, then add tomatoes, salt and 150 ml water.',
    'Simmer sauce for 8 minutes until slightly thickened. Fold beef, black beans and tortilla strips into the sauce, leaving some strips visible on top. Scatter grated cheddar over the skillet.',
    'Bake for 12–15 minutes until bubbling throughout and the cheese is melted. Rest for 5 minutes, then finish with lime juice and chopped cilantro. Divide into three portions, including both crisp edges and saucy center.'
  ],['High protein']],
  ['x-mf-pork-ginger-soba','Ginger pork and cabbage soba stir-fry with sesame','Dinner',3,25,20,[['pork',450],['soba',180],['cabbage',350],['mushrooms',250],['carrot',150],['sesame',15],['olive',15],['soysauce',30],['ginger',18],['garlic',9],['vinegar',30],['maple',15],['chili',1]],[
    'Slice pork tenderloin thinly across the grain. Shred cabbage, slice mushrooms and cut carrot into thin matchsticks. Whisk soy sauce, vinegar, maple syrup, grated ginger, chili and 60 ml water in a small bowl.',
    'Cook soba in water according to its package, reserving 150 ml cooking water. Drain and rinse briefly to stop sticking. Toast sesame in a dry skillet over medium-low heat for 2 minutes and set aside.',
    'Heat half the oil in a wide skillet over medium-high heat. Cook pork in small batches for 4–7 minutes, turning, until the thickest pieces reach 145°F / 63°C. Transfer to a clean plate and rest at least 3 minutes.',
    'Add remaining oil and mushrooms to the skillet; cook for 4 minutes. Add cabbage and carrot and stir-fry for 5–7 minutes until just tender, then add minced garlic for the final 30 seconds.',
    'Add the sauce, noodles and rested pork. Toss over medium heat for 2–3 minutes until hot, adding reserved noodle water as needed for a light coating. Divide into three bowls and scatter sesame over each.'
  ],['High protein']],
  ['x-mf-chicken-pepper-rice','One-pan paprika chicken rice with peppers and peas','Dinner',3,20,40,[['chicken',500],['rice',180],['peas',150],['peppers',250],['tomato',350],['onion',120],['olive',20],['garlic',9],['paprika',5],['oregano',2],['lemon',40],['parsley',18],['salt',3]],[
    'Cut chicken into 3 cm pieces and pat dry. Dice onion and peppers, chop tomatoes and rinse rice if its package recommends it. Check the rice package for its normal water ratio.',
    'Heat half the oil in a deep lidded skillet over medium-high heat. Brown chicken for 4–5 minutes, turning, then transfer to a plate; it will finish cooking with the rice.',
    'Add remaining oil, onion and peppers to the skillet. Cook over medium heat for 7 minutes, then add minced garlic, paprika, oregano and rice. Stir for 1 minute before adding tomatoes and salt.',
    'Return chicken with its juices. Add the package amount of hot water for the rice, reducing it by about 100 ml to account for the tomatoes. Cover and simmer gently for the package cooking time, usually 15–20 minutes; add peas for the final 5 minutes.',
    'Check that rice is tender, peas are cooked and chicken reaches 165°F / 74°C. If rice is firm, add 30–60 ml hot water and cook covered a few minutes longer. Rest off heat for 5 minutes, then finish with lemon juice and chopped parsley.'
  ],['High protein','Mediterranean']],
  ['x-mf-shrimp-lentil-soup','Coconut shrimp and red lentil soup with lime rice','Dinner',3,20,35,[['shrimp',450],['redlentils',120],['rice',120],['coconutmilk',250],['tomato',350],['carrot',180],['spinach',120],['onion',120],['olive',10],['ginger',15],['garlic',9],['curry',5],['lime',45],['cilantro',18],['salt',3]],[
    'Rinse red lentils thoroughly. Start rice in a separate saucepan with water according to its package. Dice onion and carrot, chop tomato and mince garlic and ginger.',
    'Heat oil in a soup pot over medium heat. Cook onion and carrot for 7–9 minutes, then stir in ginger, garlic and curry powder for 45 seconds until fragrant.',
    'Add lentils, tomatoes, coconut milk, salt and 650 ml water. Bring to a boil, reduce to a steady gentle simmer and cook for 18–22 minutes, stirring occasionally, until the lentils break down and carrot is tender.',
    'Add peeled shrimp and simmer for 3–5 minutes until opaque and firm throughout. Stir in spinach for the final minute until wilted; add a little water if the soup has become thicker than desired.',
    'Stir half the lime juice into the cooked rice and the rest into the soup. Divide rice among three bowls, ladle shrimp and lentil soup over it, and finish with chopped cilantro.'
  ],['High protein']],
  ['x-mf-cod-walnut-crust','Walnut-crusted cod with roasted vegetables and lemon bulgur','Dinner',3,25,35,[['cod',600],['bulgur',150],['walnuts',60],['yogurt',90],['zucchini',300],['peppers',300],['olive',15],['mustard',20],['lemon',45],['garlic',9],['parsley',18],['oregano',3],['salt',3],['pepper',1]],[
    'Heat the oven to 425°F / 220°C. Cut zucchini and peppers into 2 cm chunks, toss with two thirds of the oil, oregano and half the salt, and spread on a lined tray. Roast for 15 minutes.',
    'Cook bulgur with water according to its package. Meanwhile finely chop walnuts and mix with half the minced garlic, pepper and remaining salt. Pat cod dry and divide into three equal portions.',
    'Brush the fish tops with mustard and press the walnut mixture firmly onto it. Move vegetables toward the tray edges and add fish on a separate piece of parchment; drizzle fish with remaining oil.',
    'Roast for approximately 12–18 minutes until the thickest fish portion reaches 145°F / 63°C and vegetables are tender. Check the crust early and cover loosely with foil if the walnuts darken before fish is cooked.',
    'Mix yogurt with half the lemon juice and remaining garlic. Fluff bulgur with remaining lemon juice and chopped parsley. Divide fish, vegetables and bulgur among three plates and spoon the yogurt sauce alongside.'
  ],['High protein','Mediterranean']]
];
