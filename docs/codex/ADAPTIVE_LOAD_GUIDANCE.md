# Equipment-aware next-set recommendations

Status: implemented on an isolated development branch, not published. Owner phone acceptance and explicit live publication are pending. This changes frontend coaching and optional gym settings only; it does not run paid model calls or change the backend.

## Result

Keep the owner's strict increase gate: a completed working/top set must exceed the top of the rep range **and** have more than 2 RIR. The magnitude uses both excess reps and excess RIR, then selects a weight achievable with that exercise's saved equipment setup. Falling below the lower rep bound scales the back-off with the rep and effort shortfall. Other results hold the load.

Suggestions remain read-only. Applying one fills only the immediately following blank working/top row, preserving any entered reps/RIR, completed sets, all other rows and all historical logs. Existing locks and account/form isolation remain active. Prior-workout progression still requires its original qualifying working sets; its rounding now respects the equipment setup as well.

## Equipment setup

Each exercise card has **Load setup**, saved for the exercise at its gym. Pounds and kilograms have independent profiles in `gym.loadProfiles[exerciseId][unit]`; imported snapshots and existing recorded loads are not rewritten. This is additive schema-8 data, using the existing gym sync/export mechanisms.

- Stack/free weights: an exact step and starting/minimum load, such as 5 or 10 lb.
- Plates: available sizes for one side, one loading point or two matching sides, and the logged empty-bar/machine load when included in the total.
- Two-sided changes are doubled exactly once: one 10/25/35/45 lb plate on each side adds 20/50/70/90 lb total. Never double a previously recorded total.
- Landmine/Meadows rows and other clear one-point setups use one loading point. Other inferred equipment settings are explicitly suggestions and can be corrected.
- Dumbbells continue to use the weight of one dumbbell and the existing gym maximum.
- Saved setup wins over a legacy exercise increment. Without a saved setup, the explicit legacy increment remains a total/per-hand step, then equipment inference and existing unit-specific gym defaults apply.

Ordinary lb defaults include 2.5 and 5 lb plates as well as 10, 25, 35 and 45, so smaller curl changes are possible when those plates exist. Users should remove unavailable sizes. The UI never claims the inferred defaults were physically verified.

Machine sizes are `minimum + n × step`; plate sizes are `minimum + matching plate combinations`. Converted/imported off-grid history stays untouched, while a new suggestion aligns to the configured sizes. Prefer simple equal additions where possible; otherwise explain that plates need rebalancing. Plate removal never asserts that a particular plate is currently loaded.

## Estimation bounds

For ordinary positive loads, a bounded rep-capacity ratio uses `(30 + reps + RIR)` to estimate a change. This is a coaching heuristic, not a measured maximum or a promise of attainable reps. Normal increase budgets are 10% for isolation and 15% for compound movements, with a single-step allowance only when it also fits the estimated lower rep bound and the coarse-jump bound (20% isolation / 25% compound). Reductions are bounded to 15% / 20% or one available step. New rep targets are estimated at 2 RIR and kept within the programmed range, rather than always resetting to its minimum.

Assistance uses a separately bounded one/two-step effort score; counterweight is never treated as lifted resistance. Explicit zero resistance cannot justify more than a small 5 lb / 2.5 kg starting change. Missing/invalid RIR, fractional repetitions, seconds/metres, auxiliary rows and incomplete sets do not earn adaptive increases. If no eligible equipment weight fits, hold and explain the limitation.

Plate combination generation is bounded (32 plates per side, 200,000 scaled grid cells); extreme invalid/dense imported setups fall back to manual guidance. Actual plate counts, machine leverage and exact strength are not measured.

## Synthetic examples

| Exercise/setup | Logged result against 8–12 | Next-set suggestion |
| --- | --- | --- |
| Cable curl, 5 lb stack | 100 lb × 13, 3 RIR | 105 lb × 11, 2 RIR |
| Cable curl, 5 lb stack | 100 lb × 16, 5 RIR | 110 lb × 12, 2 RIR |
| Two-sided press, 10 lb plates | 200 lb × 16, 5 RIR | 220 lb total; add 10 lb each side |
| Cable curl, 5 lb stack | 100 lb × 5, 0 RIR | 85 lb × 9, 2 RIR |

The original mascot, opening animation, MENEI/wreath transition, exercise photos, app origin/PWA identity, cloud access, AI allowance, notifications and stored history are outside this change.
