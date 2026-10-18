# Muscle Growth Tracker private beta: exercise and equipment audit

Audited the recovered r7 `MASTER_EXERCISES` (167 records), all 125 unique PLAN names, `meta`, `equipmentNeeds`, and `Exercise_Asset_Equipment_Mapping.md`. The recovered archives and source HTML were read only. No exercise image, workout log, source archive, or live app was modified.

## Result

`exercise-audit.mjs` exports the pure, deterministic `buildCatalog(legacyMasters, legacyPlan)` and `normalizeExerciseName` helpers. With the recovered r7 inputs, the result contains **195 canonical exercise records and 321 aliases**, covering **all 291 exact legacy spellings** found across the master list and PLAN. Records include stable name-derived IDs, anatomy, movement, load mode, instructions, and equipment requirements. Case and punctuation variants remain available for matching old logs and media.

The canonical group counts are Legs 44, Back 40, Chest 29, Biceps/forearms 27, Shoulders 21, Triceps 20, Core 11, and Full Body 3. This includes five preserved legacy composite labels that should not be generated as new exercises.

## Corrections made

- Leg curls are hamstring exercises; they cannot become biceps curls through substring matching. Leg extension is quadriceps work.
- Pallof press is anti-rotation core work. It cannot be classified as a chest press.
- Lateral raises, rear-delt flies/rows, reverse pec deck, face pulls, and shoulder presses are resolved before broad press/fly/row matching.
- Calf press is calf work, not a chest press or a quadriceps leg press. Seated calf raises identify the soleus emphasis; standing/leg-press variants identify gastrocnemius and soleus. Tibialis raises are distinct ankle dorsiflexion work.
- `Leg press - high feet` is a distinct foot-position variation with its own ID, alias, and setup guide. It remains a quadriceps/glute exercise; it is not promoted to an isolated hamstring substitute.
- Wrist curl and reverse wrist curl are distinct records, movements, and instructions. Both retain supported-forearm cues requested during image approval. Their subgroup/muscle tags identify forearms while their top-level group remains Biceps for the existing UI.
- Cable High Curls requires two opposing cable pulleys and has its own setup/cues.
- Hanging knee raise now requires a pull-up bar, matching the recovered asset specification. Captain’s Chair Knee Raise is available as a separate arm-supported variant.
- Barbell total load, dumbbell per-hand load, bodyweight, and assistance are explicit. Assisted movements state that reducing assistance increases difficulty. Single-dumbbell goblet squat uses total load. Planks/battle ropes use seconds; carries/sled work use metres.

## Equipment contract

`equipment` and `equipmentRequirements` contain the same `string[][]` clauses. **Every outer clause is required (AND); any equipment label inside a clause is an allowed alternative (OR).** `equipmentLabel` is only display text. For example, incline dumbbell press requires Dumbbells AND Adjustable Bench. A machine preacher curl requires its dedicated machine; a preacher bench alone does not qualify.

Two-pulley flies, rear-delt cable flies, Cable Y-Raise, and Cable High Curls require a Dual Cable / Functional Trainer or Cable Crossover. A single cable column does not satisfy their two-pulley setup. Single-arm cable exercises can use a single column, dual trainer, or crossover. Pulldowns do not accidentally inherit generic straight-arm-pulldown requirements.

Free-weight exercises include their required benches, racks, bars, plates, or support pads. Dedicated plate-loaded and selectorized machines remain distinct. T-bar row accepts a dedicated T-bar machine plus plates OR the full landmine/barbell/plates/close-handle setup; the OR-of-complete-setups is represented correctly using the same AND/OR clause contract.

The following inventory labels are more specific than the recovered r7 equipment list and should be offered in gym editing. Their presence must come from a saved inventory or an explicit user selection, not from assuming generic Cable Attachments contains every attachment:

| Additional equipment label | Purpose |
|---|---|
| Bench-Press Rack | Rack alternative for barbell bench work |
| Chest-Supported Row Machine | Distinguishes supported machine row from free-standing row machines |
| Close Neutral Row Handle | Neutral seated/T-bar row setup |
| Close-Grip Pulldown Handle | Close-grip vertical pull |
| Neutral Pulldown Handle | Neutral-grip vertical pull |
| Straight Lat Bar | Underhand pulldown |
| Wide Lat Bar | Wide-grip pulldown |
| Wide Row Bar | Wide cable/rear-delt row |
| EZ Cable Bar | Incline cable skull crusher |
| Dip Belt / Weighted Vest | Added-load dip/pull-up variant |
| Hip Thrust Pad | Barbell hip-thrust setup |
| Step / Plyo Box | Step-up support |

Existing generic labels such as Cable Station, Cable Attachments, Seated Row, or Dip / Pull-up Station may be retained during migration, but they must not silently certify a precise attachment or distinct machine. Gym inventories remain user supplied; this audit does not verify physical equipment at either gym.

## Legacy composite labels and media handling

Five old labels represent multiple different exercises or loading modes. They remain searchable with all aliases for history matching. Each has `legacyComposite: true`, `needsVariantSelection: true`, `defaultExcluded: true`, and explicit `variantOptions`:

| Legacy label | Named variations |
|---|---|
| Assisted / weighted pull-up | Assisted Pull-Up, Weighted Pull-Up, Pull-Up |
| Weighted / assisted dips | Assisted Dip, Weighted Dip, Dip |
| Pendulum squat / Smith squat | Pendulum Squat, Smith Machine Squat |
| Hip thrust / glute drive | Barbell Hip Thrust, Machine Hip Thrust / Glute Drive |
| Wrist curl + reverse wrist curl | Wrist Curl, Reverse Wrist Curl |

All pull-up and chin-up library records remain present and are `defaultExcluded` because the user requested that generated programs omit them. Hanging core work is not excluded by that setting. Dips remain available.

The recovered equipment mapping is explicitly proposed; its “Choice” rows are not evidence of final user approval. No new media approval is inferred. Two legacy generic names conflict between the r7 master and proposed asset specification: Spider Curl (EZ bar versus dumbbells) and Rear-Delt Row (cable versus supported dumbbells). Both concrete variants now exist, and the generic alias follows the existing r7 master. The affected canonical rows expose `mediaNeedsVariantReview` and `variantOptions`. Existing approved files must be preserved; inspect their actual equipment before linking them to a new named variant. Never replace an approved image with a placeholder or generate a new image based only on this audit.

## Generator integration

- Use `defaultExcluded` and `needsVariantSelection` when selecting candidates.
- `trainingGroups` has `legs1` for quadriceps/glute squat work, `legs2` for hamstring/glute hinge/curl/hip-extension work, and `legs_accessory` for calves/adductors/abductors/tibialis. Other values match the top-level body group. This supports the user’s requested seven-group ordering.
- `subgroup`, `muscleTags`, and `movement` distinguish variations and preserve shoulder and calf specificity.
- Catalog set/rep values are defaults. Keep per-session PLAN prescriptions, completed logs, advanced-set structures, and history exactly as stored; the audit never rewrites them.
- Match migrated records using aliases; do not rename or delete stored legacy log entries. Canonical IDs can be added alongside original names.
- Unknown custom exercises remain the caller’s responsibility. Do not turn a missing or unrecognized equipment list into a verified compatibility claim.

## Verification performed

Executed the module against the recovered r7 constants with Node assertions. Checks covered all legacy names resolving; unique IDs; byte-identical deterministic output; valid requirement clauses/load-mode enums; no unclassified movement records; leg-curl/core/rear-delt/shoulder/calf/wrist classifications; separate assisted/bodyweight/per-hand modes; default pull-up/chin-up exclusion; and positive/negative equipment cases for T-bar rows, incline dumbbell press, Cable High Curls, and machine preacher curls. The catalog build does not mutate its input arrays. Integration still needs app-level QA of gym inventory editing, media association, generator selection, and old-history migration.

## Beta.7 station coverage

Standing Dumbbell Calf Raise and Seated Dumbbell Calf Raise are distinct added variants, bringing the current app catalog to 197 canonical records and 323 aliases. Standing uses dumbbells on a level floor; seated requires dumbbells plus a flat bench. Both log load per hand, have specific free-weight instructions, and do not inherit a machine image or imply any unconfirmed station machine. All 291 original spellings and original media identities remain intact.
