# Session preparation and personalized training options

Status: development candidate; live publication requires separate owner approval. The owner requested muscle-specific warm-up/cool-down options, bands, age-aware trainer-style plans, and the display name The MENEI Split.

## What changes

Home offers optional Warm-up and Cool-down guides. They resolve the day's actual catalog/custom muscle metadata, include comfortable dynamic preparation and light rehearsal before lifting, and gentle stretches after gradual cool-down. Light band options appear only when the user explicitly selects that they have a band; turning the option off restores equipment-free suggestions. Unknown custom anatomy receives general guidance. Rest-day mobility stays optional.

These guides do not add exercise rows, create logs, mark anything complete, change timers or assign loads. The main duration estimate already includes generic lifting preparation; extra drills/stretches are not automatically added. Explicit running warm-up/cool-down phases remain inside the listed run time. Manual runs with missing phase durations do not receive fabricated timing metadata.

Program offers Smart plans. Original MENEI starting approaches include Foundation / returning, Build strength and muscle, Active 50+, and Strength, balance & mobility · 65+. Adults can explicitly choose any approach. Automatic age bands (18–49 / 50–64 / 65+) organize suggestions; they are not physiological cutoffs or restrictions on ability.

Each user can choose age for the plan, experience, goal, approach, lifting days, split, working sets, rep range, saved gym, equipment preference, running frequency, supersets, no-lifting weekdays, repeat spacing and pull-up exclusions. Suggestions fill only choices left automatic. Beginner/returning plans retain the existing three-set cap and reject an explicit four-set request rather than silently changing it. Missing/invalid ages and under-18 ages cannot become adult presets. Existing programs and profiles are preserved.

Equipment preferences bias compatible selections and explain when the saved inventory/rotation needs a mix. They do not claim the inventory has been physically confirmed or invent equipment. Loads remain blank initially and use existing performance/RIR/equipment progression after logging; age never sets a lifting weight. New smart plans do not inherit interval running from an earlier program.

Previewing does not write user data. Saving uses the established snapshot/protected-workout path. Smart previews capture account context and a canonical signature of relevant program inputs; a same-account in-flight cloud update to training, logs, plans, equipment or related inputs invalidates the preview before any snapshot/write. Closing the preview clears it. Smart plans reopen with their selected values through Change preferences.

The renamed **The MENEI Split** retains key `split` and its exact original Chest + Biceps, Back + Triceps, Legs, Shoulders + Abs slots. There are no image or mascot changes.

## Published references

The module includes direct source links and credits; wording and MENEI adaptations are original. No trainer's proprietary table, photographs or full published program is reproduced, and no endorsement is implied.

- [ACSM 2026 resistance-training guidance](https://acsm.org/resistance-training-guidelines-update-2026/): individualized adult training; bands and bodyweight can be useful tools.
- [Ben Kuharik / Cleveland Clinic beginner routine](https://health.clevelandclinic.org/workout-routine): a published beginner planning example.
- [Robert Linkul / NSCA older-client blueprint](https://www.nsca.com/education/articles/ptq/strength-training-for-the-older-clienta-blueprint-for-program-design/): a real older-adult trainer framework; its proprietary tables are not copied.
- [CDC older-adult activity guidance](https://www.cdc.gov/physical-activity-basics/guidelines/older-adults.html): strength, aerobic activity and balance, adjusted to abilities.
- [Pete McCall / ACE bodyweight programming](https://www.acefitness.org/continuing-education/certified/february-2021/7780/how-to-design-body-weight-training-workouts-using-the-ace-integrated-fitness-training-model/): movement and bodyweight-programming examples.
- [American Heart Association preparation/recovery guidance](https://www.heart.org/en/healthy-living/exercise-and-physical-activity/fitness-basics/warm-up-cool-down): gradual activity and comfortable stretching.

MENEI retains its owner-selected 60-second set rests and three-minute exercise/pair-completion timer. This is one reason these are adaptations rather than exact reproductions of the published plans. The existing session timers allow more recovery when needed.

## Preservation and validation

No API credentials, paid model requests, schema migrations, storage identities, backend mutations or notifications are needed. Optional training/day metadata records the chosen approach, age, goal, experience and equipment preference through the existing record/merge contracts. Preparation toggles are dialog-local; they do not move training.updatedAt and invalidate historical rest-day inference.

Focused coverage: 8 preparation checks, 11 personalized-planning checks and 6 UI integration checks. Independent generator comparison matches pre-change output across 210 dates when no equipment preference is selected. Broader test and package results are recorded in the external release review. Browser/physical-device acceptance is separate from these synthetic tests.
