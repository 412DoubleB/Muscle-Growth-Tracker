# Optional warm-up routine on the workout screen

The day's Your workout section offers Add warm-up routine. It opens the existing muscle-specific guide for review, including optional light-band alternatives. Add to this workout saves a day-level warmupRoutine intent and displays the guide before the exercise cards. Remove warm-up routine reverses that choice. Completed/skipped workouts retain a read-only guide.

The attached guide is derived from the current workout's muscles and confirmed equipment. It is separate from working sets, progression, completion, rest timers and training streaks. No training preference timestamp changes. Existing running preparation remains included in its recorded duration.

The day-level choice survives JSON/cloud storage, compact plans, date swaps and changes to unstarted workouts/programs. It does not block day-of program changes when no gym entries exist. Stale previews reject account, date, workout or equipment changes before saving. Failed saves restore the prior workspace.

No new asset, runtime module, storage key, schema migration, external service or paid AI request is required. The current age-aware plans and iPhone opening correction remain intact.

Validation: all 90 regression test files and static checks pass, plus 11 focused training UI cases and 6 warm-up preservation cases. The owner explicitly approved this follow-up after the initial approval-review rejection. Build 20261024.4 is published through PR 9 as merge 838ec26adb6b7f3b109302a2b5c7d9522f435f32. Pages deployment 40243479564 completed successfully, and the deployed main tree exactly matches the approved five-file release.
