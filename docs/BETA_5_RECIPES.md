# Beta 5 — expanded recipes and recipe uploads

The private beta now contains **100 detailed original AI-authored recipes**, including the previous 16. The 84 additions are varied dishes rather than automatically renamed ingredient combinations.

| Meal | Recipes |
| --- | ---: |
| Breakfast | 18 |
| Lunch | 31 |
| Dinner | 33 |
| Snack | 18 |

Thirty-eight recipes are vegan. Recipes include measured whole-yield ingredient quantities, 4–6 substantive preparation/cooking steps, serving yield, preparation/cooking times, approximate macros and storage guidance. Examples include banana-flax cottage cheese pancakes, chicken rolls with spinach/ricotta, beef/black bean tortilla bake, walnut-crusted fish, tempeh dishes, lentil bakes and savory protein snacks. Every original is explicitly AI-authored and not kitchen tested. No third-party recipe text or photos were copied.

The food list now has 115 approximate planning references, including more proteins, vegetables, grains, fruit, legumes, herbs and sauces. Product labels and raw/dry/cooked state still matter. Safe-temperature/storage facts were checked against the FoodSafety.gov references linked inside each recipe; recipe methods themselves have not been tested in a kitchen.

## Using the collection

Nutrition → Recipes offers search, meal type, total preparation/cooking time, 25g+ protein, 50g+ carbs, under-30g carbs, compatibility with current diet/exclusions, and batch-yield filters. Results load 24 at a time. “Plan this meal” adds a selected recipe through the normal serving/household editor.

The meal planner scores recipes against date-specific calorie, protein and carbohydrate targets before balancing portions. Training/rest/tomorrow target settings continue to follow the workout calendar. It reports a deviation greater than 15% from any calorie/macro target. Hard dietary exclusions take priority over favorites; existing and eaten meals remain protected. More recipes improve options but do not guarantee every macro target can be met exactly.

## Adding recipes

“Upload recipes” accepts a `.json` collection from the device or pasted recipe JSON. The dialog includes a downloadable example, the complete original 100-recipe pack and a copyable ChatGPT prompt using the supported ingredient references. This does not require an AI API key or imply that the app itself runs a live AI service.

The import preview shows new recipes, duplicates, invalid rows and nutrition notes. No recipes are added until the user selects Add. Duplicate names/IDs, including archived versions, are skipped; existing recipes and meal snapshots are never replaced. Custom ingredients require complete per-serving macro estimates. Until reviewed, custom-ingredient recipes are excluded from automatic planning that has allergen/food exclusions. Known allergen declarations remain enforced after review.

The importer limits collections to 250 recipes / 5 MB, validates quantities/yields/units/steps/source URLs, and treats file content as untrusted text. Recipe URLs must use HTTPS. Recipe export contains recipe data without profile, account or workout data.

`dist/recipe-library.json` contains the portable full collection. The source recipe modules remain authoritative; the JSON file is a companion import/export asset. Active app records, imports, original recipes and existing meal snapshots remain separate records in the current beta account.

## Validation

76 automated tests pass, including 100-recipe schema/content/macronutrient checks, vegan ingredient checks, full collection round-trip, duplicate handling, invalid quantity/unit/source rejection, meal/history preservation, target-sensitive recipe choice, UI filters/pagination, import preview and HTML escaping. Static syntax/import/shell checks pass for 18 JS files and 27 shell paths. Browser/phone QA remains unavailable; real-device upload/file-picker behavior, layout, cloud-account sync and notifications remain acceptance tests.

The original GitHub app, workout history mechanisms, media assets and Supabase backend configuration were not modified by this update.
