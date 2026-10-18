# MENEI 8.1.0 — design and release notes

Approved direction: October 18, 2026. Release `8.1.0` is based on the existing `8.0.0` app and was authorized for the live update on October 18, 2026.

## Identity and layout

**Motivation · Excellence · Nutrition · Exercise · Intensity**

| Token | Value | Use |
|---|---|---|
| Black | `#101214` | Main background, app-icon background |
| Pittsburgh-inspired gold | `#FFB81C` | M emblem, main actions, progress line |
| White | `#F5F5F2` | Main text, MENEI wordmark |
| Steel | `#626970` | Supporting palette reference; not small body text |
| Panel | `#191C20` | Cards |
| Muted text | `#ADB0B6` | Secondary labels on dark surfaces |

The approved [M and pointed-leaf wreath](../brand-mark-reference.jpg) is retained unchanged. The implementation uses fixed CSS colors and reads saved logs.

Use the exact M and pointed-leaf wreath from the owner’s supplied reference, `brand-mark-reference.jpg`, for the app icon and large decorative emblem. The source JPEG is preserved unchanged and embedded in SVG display containers; these are raster-backed SVGs, not traced vector artwork. Only surrounding spacing is adjusted for the square icon. A thin screenshot edge is kept outside the display viewport without altering the artwork. The small favicon and navigation mark retain the M alone. Wordmark: Cinzel 800 with approximately 0.1em tracking; it complements the concept rather than claiming to reproduce generated lettering exactly. Bundle the font and its OFL license for offline use. Controls and data use the system sans-serif font.

Home has a branded intro and three cards: Strength, Nutrition and Progress. The compact gold graph opens a full progress view. History also exposes the full graph. The workout logger, exercise library, meal planning, calendar and settings remain available in their established navigation.

## Graph rules

- Use actual checked working/top sets. Exclude incomplete, warm-up, ramp, back-off and drop sets, deleted/skipped records, future entries and preserved duplicate/conflict copies. Original records stay saved.
- Compare one exercise, gym and straight/superset format at a time. Do not pool equipment-specific loads across gyms or sum different exercises into a strength score.
- Default for resistance exercises: **Estimated strength**, the best per-session Epley value from 1–10 rep sets. For 2–10 reps use `weight × (1 + reps / 30)`; for a single use its actual load. This is a trend estimate, not a tested max or direct muscle-growth measurement. RIR is displayed but not added into the calculation; similar effort and form matter.
- More reps at the same weight can raise this estimate. Actual Weight and Reps views remain available. High-rep sessions remain available in Weight, Reps and Volume even when excluded from the estimate.
- Working volume is the sum of `load × reps` across checked working sets; two dumbbells count twice in volume. Strength and weight remain per dumbbell when logged per hand. Volume can rise because of extra sets.
- Bodyweight movements default to reps. Do not infer historical bodyweight or estimate a combined max from added weight alone. Assisted movements default to the lowest assistance with actual reps shown; less assistance is not treated as a weaker lift. Timed/distance exercises use their correct count units.
- Offer 30 days, 90 days, 1 year and all-time filters. X positions follow actual logged dates. Changes compare first and latest sessions in the selected period, including decreases.
- Tapping or keyboard-activating a point displays its date, value and actual set. Supply an accessible label and exact session-data table.
- Empty history shows guidance. A single session shows one point and no rising line or percentage. Filters and graph selections do not write workout data.

## Continuity

Retain the existing GitHub Pages path, manifest `id`, scope and start URL. Keep browser storage keys, schema 8, cloud project/settings, account isolation, migration, exercise/media IDs and saved routines/logs. The new version uses fresh module queries and its own service-worker cache. The graph module, font and artwork are included in the offline shell. Payments and subscriptions are outside this update.

## Verification

The automated suite covers the existing app plus graph calculations, rep gains, exclusions, gym/format boundaries, units, bodyweight/assistance/time handling, true decreases, honest empty/single-point states, escaped labels, accessible data and read-only UI filtering. All 124 automated tests and the static/offline-shell checks pass. Headless Chromium checks at 1440, 430 and 360 px found no page overflow or JavaScript errors; full graph controls, keyboard point selection, and the graph after an offline reload also passed. Screenshots of desktop/mobile home and the mobile graph were inspected. No new live database checks are implied by this visual update.

## References

- [Cinzel font source and license](https://github.com/google/fonts/tree/main/ofl/cinzel).
- [Validation study of submaximal 1RM prediction equations](https://pubmed.ncbi.nlm.nih.gov/12741856/): estimates vary with repetitions and test conditions. The calculation and product limits above are explicit implementation choices.
