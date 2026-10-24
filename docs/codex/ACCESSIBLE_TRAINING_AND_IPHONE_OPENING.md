# Accessible training and iPhone opening candidate

This is unpublished development following the personalized-training preview. It does not change live MENEI or its services.

## Exercise and plan additions

- 43 additive exercises: 39 strength, 3 mobility and 1 balance. All 197 existing catalog records and image bindings stay intact.
- Core, bodyweight, bands, calisthenics, supported options and warm-up/balance filters in Library and the session exercise picker.
- Smart plans have editable movement-support and floor-work choices alongside age, experience, goal, schedule and equipment. Support defaults follow experience; age alone does not forbid an exercise or prescribe a load.
- Actual saved inventory controls compatibility. Bands do not imply an anchor, ankle attachment, loop band, chair or wall. Mobility and balance do not pad strength slots. Incomplete generated sessions remain blocked for review.
- Existing generators exclude the additive family unless accessible programming is explicitly active. The MENEI Split retains its original key and muscle pairings.
- Band sets record brand, level and setup. Bodyweight/manual work tracks repetitions or duration; no numerical band tension, estimated maximum or weight-volume is fabricated. A stored zero on completion means no added external load.
- Optional muscle-focused preparation offers supported seated/standing alternatives with confirmed equipment. It never creates sets, changes training dates or doubles existing run preparation time.
- Instructions are original MENEI adaptations informed by credited NHS, ACE, NASM, CDC and existing training references. No source photos or complete proprietary trainer routines are copied. New exercise pictures remain unresolved; existing pictures are unchanged.

## iPhone opening correction

The lower-body WebGL canvas was nested in SVG foreignObject. A successful GPU draw could hide the complete SVG fallback even when WebKit failed to composite the nested canvas. The canvas now uses an ordinary HTML layer between aligned SVG background and foreground layers, with the complete SVG fallback retained.

The opening now waits only for the animation atlas, including image decoding where available. An unrelated original-image request no longer delays or skips playback. Loading has a visible original-art placeholder and a bounded 15-second wait, followed by the full 4.5-second playback when ready. Skip/replay, stale callbacks, reduced-motion preferences and background catch-up stay protected.

The approved artwork, corrected hand, motion geometry and MENEI/wreath-to-M animation are unchanged. Automated layout/pose tests do not replace confirmation on a physical iPhone.

## Release boundary

No backend, auth, push, AI quota, API credential, storage schema/key, PWA identity or live publication is changed. Review a private sample preview and obtain the owner's explicit live-publication instruction before a public release. Validation results and preview receipts are kept outside this public source tree.

## Validation

All 89 test files pass with the complete test suite; static checks pass with 43 JavaScript files, 65 offline shell entries and protected artwork checks. Private sample-page smoke checks pass without app storage or API access. The initial full run exposed a library test that assumed a fixed page position; it now follows the actual pagination control while retaining exact equipment/media assertions. Band-only entry preservation has four dedicated regression cases. Physical iPhone animation acceptance remains pending.
