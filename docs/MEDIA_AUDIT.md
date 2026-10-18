# Muscle Growth Tracker recovered media audit

Inspected all 162 recovered PNG originals visually using contact sheets, plus full-size checks of ambiguous equipment, wrist positions, leg-curl roller placement, hip-thrust plates and cable-pullover head position.

## Coverage

- 125 exact source exercise labels retained as canonical entries or aliases.
- 121 canonical media entries, including the separated wrist-curl movements and additional named archived variants.
- 35 canonical movements have both recovered Start and Finish references; 3 have one pose.
- 13 have only guides/composite imagery; 70 have no matching media.
- All 162 PNG originals are recorded with SHA-256, Library identity, original filename, dimensions and creation time.
- 113 single-pose originals converted losslessly to full-size WebP (146.4 MiB). Each conversion was checked pixel-for-pixel after decoding. No cropping, retouching, scaling, generation or deletion.
- Original source files remain untouched in recovered-assets/Workout Program and their Library locations.

## Approval state

All recovered references carry `recovered-needs-approval-verification` and `approved: false`. Project history includes many approvals but does not link each approval to a specific image hash. Filenames such as “correct”, newer timestamps, or visual plausibility are not treated as proof of approval. No new generation was done because the locked START → approval → FINISH workflow applies.

## Findings and conflicts

1. The old architecture manifest declares 2,500 required avatar/exercise poses. Those are planned paths, not proof of generated files. The recovered collection contains 162 PNG originals, including guides and app mockups.
2. Sources named “Mid-shin Romanian deadlift finish”, “Pronated grip Romanian deadlift finish”, and “Romanian Deadlift with Two Hex Dumbbells” visibly use dumbbells. They are mapped to DB Romanian deadlift, never to barbell RDL.
3. Original “Wrist curl + reverse wrist curl” contains two movements. Separate wrist-curl and reverse-wrist-curl entries retain two distinct pairs; the compound source label has component references.
4. Wrist revisions need verification for pronation versus supination, finish range and distal forearm contact with the bench. Seated leg curls need verification for heel/roller contact and adult leg proportions. EZ-bar revisions need verification of the user's approved outer-angle grip.
5. The newer neutral-head cable-pullover start is selected over the earlier head-up revision. Older revisions remain gallery entries.
6. Multi-pose images, grids, muscle-highlight infographics, and app mockups are preserved in the manifest but excluded from primary single-pose Start/Finish. No composite was cropped into a new pose.
7. Two incline-press source singles use a busy gym background, which conflicts with the locked charcoal-wall standard. They remain gallery records and are not primary images.
8. Generic plate-loaded chest-press singles are mapped to Converging chest press. The exact Hammer Strength model is not verified, so the brand-specific flat/incline entries are not falsely marked complete.
9. Walking DB lunge has only its finish pose. A reverse-lunge start was not substituted. Flat DB press and decline machine press have only their start pose.
10. Assisted pull-up references are preserved for the library and excluded from default generation per the user's existing no pull-ups/chin-ups preference.
11. Cable High Curls is represented as a requested movement with missing media. No placeholder was labeled as a real approved exercise photo.
12. No standalone anatomical muscle-highlight image files were recovered. Existing highlight graphics remain embedded in the historical guides, preserved by original identity/hash; they were not extracted or replaced.

## Integration

`dist/media-manifest.json` contains `assets`, `exercises`, and a normalized `lookup`. Each exercise has direct `startPath`/`finishPath`, asset IDs, aliases, gallery IDs, coverage, and notes. Paths are relative to the dist root. Missing images are null. The app should show the review state and never present these recovered selections as newly verified approvals.

## Missing or incomplete canonical movements

- Walking DB lunge: partial.
- Wrist curl + reverse wrist curl: missing.
- Barbell bench: guide-only.
- Decline machine press: partial.
- Decline press: guide-only.
- Flat DB press: partial.
- Hammer Strength incline: guide-only.
- Wide-grip lat pulldown: guide-only.
- Seated cable row: guide-only.
- DB lateral raise: guide-only.
- Bent-over DB rear-delt fly: guide-only.
- Seated DB shoulder press: guide-only.
- Straight-bar pressdown: guide-only.
- Decline DB press: guide-only.
- Concentration curl: guide-only.
- Dumbbell overhead triceps extension: guide-only.
- Incline DB fly: guide-only.
- Chest-supported DB row: missing.
- Chest-supported Hammer row: missing.
- Chest-supported row: missing.
- Close-neutral pulldown: missing.
- Hammer Strength low row: missing.
- High cable row: missing.
- Kneeling cable pullover: missing.
- Landmine Meadows row: missing.
- Landmine single-arm row: missing.
- Neutral-grip pulldown: missing.
- Rear-delt row: missing.
- Single-arm cable pullover: missing.
- Single-arm high-to-low cable row: missing.
- Single-arm kneeling lat pulldown: missing.
- Single-arm machine row: missing.
- T-bar row: missing.
- Underhand pulldown: missing.
- Wide cable row: missing.
- Wide chest-supported row: missing.
- Wide/high row: missing.
- Cable fly: missing.
- Cable Pallof press: missing.
- Cable rear-delt crossover: missing.
- Cable rear-delt fly: missing.
- Calf press: missing.
- DB squeeze press: missing.
- Dip machine: missing.
- Dips: missing.
- Hammer Strength flat press: missing.
- High-to-low cable crossover: missing.
- Incline cable fly: missing.
- Leg press: missing.
- Leg press - high feet: missing.
- Low-to-high cable fly: missing.
- Machine shoulder press: missing.
- Pec deck: missing.
- Reverse pec deck: missing.
- Single-leg press: missing.
- Smith incline press: missing.
- Standing landmine press: missing.
- Weighted / assisted dips: missing.
- Cable crunch: missing.
- Decline crunch: missing.
- Hanging knee raise: missing.
- Seated calf: missing.
- Seated calf raise: missing.
- Standing calf: missing.
- Standing calf raise: missing.
- Cable lateral: missing.
- Cable lateral raise behind body: missing.
- Cable Y-raise: missing.
- Face pull: missing.
- Lateral-raise machine: missing.
- Lean-away cable lateral: missing.
- Machine lateral raise: missing.
- Single-arm cable lateral: missing.
- EZ-bar lying extension: missing.
- EZ-bar skull crusher: missing.
- Incline cable skull crusher: missing.
- Leg extension: missing.
- Overhead cable extension: missing.
- Overhead cable triceps extension: missing.
- Overhead rope extension: missing.
- Reverse-grip pressdown: missing.
- Rope pressdown: missing.
- Single-arm cable pressdown: missing.
- Single-arm reverse pressdown: missing.
- V-bar pressdown: missing.
- Cable High Curls: missing.
