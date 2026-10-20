# Requirements and decisions to preserve

This register consolidates the visible owner requests, recovered project files, retrieved decision excerpts and the pinned 8.1.1 source. It is not a complete transcript export or a new request to implement every historical idea. Latest explicit owner decisions supersede older proposals. Existing accepted behavior and entered history must survive any future changes.

Evidence anchors: README.md; docs/REQUIREMENTS.md (historical beta trace); docs/EXERCISE_AUDIT.md; docs/MEDIA_AUDIT.md; media-manifest.json; docs/MENEI_NEXT_REBUILD.md; docs/MENEI_BACKGROUND.md; current tests; private equipment/approval register and retrieved evidence.

## Preservation and identity
- Keep all working features, approved photos, exercise/media IDs, aliases, saved routines, recipes, meals, gyms, account settings and workout history.
- Current name: MENEI — Motivation · Excellence · Nutrition · Exercise · Intensity.
- Use the exact uploaded M/pointed-leaf wreath: preserve geometry and leaf shape/count/placement. Keep the original JPEG, raster-backed SVG containers, current icon and decorative gold Greek athlete.
- Preserve the current black/gold design: #000000 background, #101214 icon background, #FFB81C gold, #F5F5F2 main text. Gold buttons have black labels. Cinzel 800 wordmark/OFL is bundled; system font for controls/data.
- Home contains Strength / Nutrition / Progress plus established logging/navigation. Decorative artwork cannot intercept input and is hidden from screen readers.
- Keep existing GitHub Pages URL, PWA identity/scope, schema 8 and local/cloud storage identities. Features remain free and unlocked during development. Monetization is deferred.
- Latest instruction: preservation-only handoff. Earlier permission to publish 8.0/8.1 does not authorize publishing this handoff or a new rebuild.

## Exercise catalog, equipment and media
- Audit every original exercise/alias, anatomical group and concrete equipment requirement. Preserve distinct machine, cable, barbell, dumbbell, seated/lying and slash-label variants.
- Require all necessary equipment and attachments; a barbell does not imply plates and a cable column does not imply two pulleys. Use only compatible exercises in a gym.
- Show recommended equipment in the Exercise tab and guides.
- Preserve the approved 125-row exercise/equipment mapping and sequential START-then-FINISH image process. Equipment approval does not imply image approval. PHOTOS.md governs preservation.
- Do not hide missing media or claim generic guide panels are approved exercise pairs.

## Programs, sessions and running
| Choice | Required behavior |
| --- | --- |
| Splits | Full Body; Upper / Lower; Push / Pull / Legs; Bro / Body Part; retained paired/body-part and saved custom rotations |
| Strength / Power | 3–6 sets, 1–5 reps, 3–5 minutes rest |
| Hypertrophy | 3–4 sets, 6–15 reps, 1.5–3 minutes rest; effort/RIR remains explicit |
| Muscular endurance | 2–3 sets, 15–20+ reps, 45–60 seconds rest |
| Program length | Continue beyond 28 days; 4/6/12/24/52-week previews with ongoing generation and rotation, not a fixed 28-day replay |
| Lifting session length | New built-in/generated lifting sessions use 6–9 exercises; show equipment shortfalls instead of silently saving four |
| Historical short sessions | Keep saved sessions and entered sets. Owner accepted one earlier Chest + Biceps state; do not use later defaults to rewrite history |
| Running | Match training focus/experience and recovery context; retain Zone 2; quality running optional, limited and placed away from leg-day recovery conflicts |

- Edit session: session title becomes the v6-style workout dropdown with variants #1–#5, saved routines and real generated replacements.
- Swap dates or the next matching workout; recalculate the unlogged schedule when needed. Entered/completed sessions stay protected, with complete prior revisions in History.
- Add/swap/remove exercises; save/reuse routines and custom rotations. Retain original v6 workout exercise lists.
- Progressive overload uses usable completed working sets, reps and RIR; increments respect equipment, per-hand loads and decreasing assistance.
- Advanced sets include warm-up, ramp, top, back-off and percentage drop sets; distinct load rules and roles.
- Optional progressive-overload supersets: auto/manual pairing, A1/A2, independent exercise histories, straight-vs-superset progression separation, rounds and appropriate rest. Pairing must not reduce the number of exercises.
- Session tools include explicit 2-minute and 3-minute timers plus training-focus rest. Timers retain elapsed time through navigation.
- Complete workout confirms and locks edits; explicit unlock; skip remains available.
- Quick tour belongs in global Help/Settings. Profile avatar supports a phone/file photo upload.

## Gym discovery and firefighter schedules
- Multiple gyms with exact editable inventories and exercise compatibility.
- Recurrence supports every X days/weeks, weekday rules, start/end dates, duration, precedence and the 24-on/72-off firefighter anchor.
- Known-gym lookup separates dated official-source facts, user confirmation and unknown equipment. A brand name or generic facility list cannot prove a specific machine/attachment.
- Current implementation uses a curated directory (two Crunch locations) plus an external ChatGPT research prompt for unknown locations. No free live equipment API or automatic web scraping is configured. The broader automatic verified lookup remains a requested capability, not a claim of current implementation.
- Later development clarification: the owner requests exact-location AI search with published equipment when available plus editable estimates for a common gym-type setup. Keep published facts, estimated suggestions and owner confirmation distinct. Review/apply affects an editable draft; Save gym remains explicit. Preserve manual equipment and weight limits. This does not authorize inferring image approval or silently rewriting workouts. The owner subsequently approved a bounded AI trial and then a first-come twenty-account beta: five attempts per account, one hundred total including earlier owner usage. See BETA_ENROLLMENT.md for the approved audience, durable limits and remaining activation checks; see DEVELOPMENT.md stage 7 for the original gym setup work.

## Nutrition, recipes and meal planning
- Discoverable nutrition preferences in initial setup and Settings: current goal, diet style, food categories, main meals, breakfast, snacks, allergens, favorites, exclusions and repeat spacing.
- Training/rest calorie and carbohydrate targets, optional recovery-before-training carbohydrate planning and tomorrow's workout context; planned food is distinct from eaten daily macros.
- A large collection of real, detailed healthy meals compatible with targets; original AI-authored recipes are acceptable. Current collection: 100 detailed original recipes and approximate food-reference macros.
- Recipes need measured ingredients, yields, steps, cooking checklists, time/meal filters and search/pagination. Preserve custom recipes and existing meal snapshots when upgrading the collection.
- Add/upload/paste more recipes via validated JSON, preview errors/duplicates before import, export collection/template, edit/archive recipes, manual per-serving macros and household scaling.
- Any later internet-sourced recipes need a documented permitted source/license or original adaptation and provenance. Do not copy a site's expressive directions/photos wholesale. Current recipe collection is original AI-authored, not represented as retrieved site recipes or kitchen-tested.
- Allergen exclusions override preference scoring, including hidden ingredient allergens. Unknown custom ingredients require reviewed macros/allergens.
- Daily/3-day/weekly shopping lists; compatible-unit conversions, package estimates, pantry stock/expiry, purchase-to-pantry actions, 3/5-day sufficiency.
- Ingredient reuse and prepared-leftover expiry/reservation; do not allocate stock twice or add groceries for reserved prepared meals.

## History, sync and notifications
- Copy legacy MGT28v6, or MGT28v5 only when v6 is absent; keep original bytes/keys and raw snapshot. Repeated migration/import must be idempotent.
- Existing V8 data wins; conflicts retain both versions. Shared legacy data goes to the guest workspace before explicit import into a signed-in account. Never silently mix accounts.
- JSON backup/export, recovery copies, preserve zero loads, unknown fields, unit conversions and entered history. New beta origins do not inherit live browser storage.
- Supabase email/password account creation, confirmation, sign-in and recovery; per-account isolation; automatic active-app sync, offline queue, compare-and-swap revisions, three-way merge/conflict review and five cloud revision backups.
- Original cloud-backup import remains read-only; no resetting original tables to make a new build work.
- Noon reminders while closed through service-worker Push, permission/device controls, protected reminder job and completion suppression. Preserve test and calendar fallback.
- Real email delivery, URL allowlist, SMTP status, two-device conflict recovery, actual phone-history restore and closed-app push require separate owner/device acceptance. Prior transactional backend tests do not prove these.

## Progress and offline behavior
- Graph uses existing checked working/top sets; no additional logging. Default estimated strength uses Epley for 2–10 reps and actual logged load for a single.
- Offer actual Weight, Reps and Working volume. Per-hand volume counts both hands. Assistance uses lower counterweight; bodyweight defaults to reps without inventing historical weight; timed/distance movements retain units.
- Exclude warm-up/ramp/back-off/drop, unchecked/incomplete, skipped/deleted/future and preserved conflict duplicates.
- Exercise, gym, straight/superset and 30d/90d/1y/all filters; actual dates, honest first-to-latest changes including decreases, keyboard/tap details and exact table. Empty/one-session states cannot invent gains. Filters never write history.
- Preserve responsive/PWA/offline behavior, correct project-path caches, account separation, recovery after quota problems and a refresh/update route that does not clear data.

## Status discipline
Current source is 8.1.1, not the older r7 mockup. Historical missing-feature claims must be checked against source and tests before being called regressions. Current handoff checks: 123/124 tests passed; one generator UI assertion remains unresolved; static checks passed. See VALIDATION.md. No new live backend or owner-device acceptance is implied.

