# Beta 4 — feedback implementation

## Workouts and running

- Calendar browsing has no 28-day cutoff. Original first-block workouts stay intact; later dates select fresh exercise variants. Automatic and saved custom-routine calendars continue beyond their saved preview.
- Preview lengths: 4, 6, 12, 24 and 52 weeks. Unlogged plans are compacted for device storage and expanded when used; entered sets are never compacted away.
- Added Full Body, Upper/Lower, Push/Pull/Legs and Bro splits alongside the existing structures. PPL assigns rear delts to Pull and front/side delts to Push.
- User-requested focus presets: Strength/Power 3–6 sets, 1–5 reps, 180–300 sec rest; Hypertrophy 3–4 sets, 6–15 reps, 90–180 sec rest; Endurance 2–3 sets, 15–20+ reps, 45–60 sec rest. Every generated set stores its actual rest target. Beginner set volume is capped at three. Power-specific loading differs from heavy strength work and is explained in the focus description.
- Running adjusts to lifting focus, experience and adjacent lower-body work. Most sessions stay conversational. Optional endurance intervals appear at most once per eligible week, away from adjacent leg sessions; limited recovery space produces an explanation. Durations and interval blocks are shown in the workout.
- Edit session restores v6 named workouts, including #1–#5, saved routines, generated choices and automatic generation. Date moves swap an unfinished destination back to the original date. Entered destinations are blocked. Replacing entered work creates a durable History revision. Optional next-matching swaps and 28-day regeneration preserve entered/completed sessions.

## Food, profile and navigation

- Nutrition setup appears on first use and remains in Settings and Nutrition. Select current goal, diet, breakfast/main-meal/snack categories, allergens, specific favorites, repeat spacing and training/recovery/tomorrow targets.
- Added 16 original recipes with seasonings, measured quantities, preparation/cooking times, full directions, ingredient/step checkboxes and storage guidance. Recipes are labeled original and not kitchen tested; no third-party recipe text or photos were copied. Existing saved recipes and meal snapshots remain intact.
- Session tools label 2-minute rest clearly and add 3-minute rest (plus 4/5 minutes for strength). Each exercise can start its saved rest target directly.
- Quick tour moved to global Help and Settings.
- Profile photos upload from the phone/computer, center-crop and resize to 320px, then follow account synchronization and exports. Unsupported phone formats get a conversion message. Real phone picker/decode behavior still needs device acceptance.

## Gym lookup scope and sources

The lookup is a curated source-backed directory, not a live AI service or complete floor audit. Applying a result requires an address confirmation. Existing user equipment stays selected and is not silently promoted to verified status. Users can confirm their own checklist separately.

| Location | Published evidence | Unverified |
| --- | --- | --- |
| Crunch Pleasant Hills, 601 Clairton Blvd, Suite 38 | Dumbbells to 120 lb; kettlebells to 50 lb; Olympic platforms, circuit, TRX and HIITZone are advertised | Specific machines, cable configuration, plates, racks, benches, attachments and current availability |
| Crunch Monroeville, 3700 William Penn Hwy | Location identity; page says coming soon and hours closed | Opening and all specific equipment |

Official sources reviewed October 18, 2026:

- https://www.crunch.com/locations/pleasant-hills (weight limits also appeared in indexed official membership comparison content)
- https://www.crunch.com/locations/monroeville
- https://www.crunch.com/terms-of-use — no deployed automated scraper

Unfamiliar gyms have a ChatGPT research prompt/link. An unrestricted automatic in-app ChatGPT web lookup is not configured; the UI states this clearly.

Training and food-safety references (paraphrased facts only):

- https://acsm.org/resistance-training-guidelines-update-2026/
- https://pubmed.ncbi.nlm.nih.gov/34757594/
- https://www.foodsafety.gov/food-safety-charts/safe-minimum-internal-temperatures
- https://www.foodsafety.gov/food-safety-charts/cold-food-storage-charts

The original GitHub deployment, image assets and existing Supabase tables remain unchanged. This update is for owner-only testing. Browser/phone QA, actual backup restoration, real cross-device account sync and closed-app notification delivery remain acceptance work.
