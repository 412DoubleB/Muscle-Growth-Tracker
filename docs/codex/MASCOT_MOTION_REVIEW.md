# Opening mascot reconstruction review

Development baseline: `1f96596` (reviewed MENEI 8.2.0 source). This branch is an
isolated candidate. It has not replaced the public app.

The owner initially requested exact original artwork through the existing
4.5-second squat, wall-ball toss, catch and return. Only the flat original image
is available. After the limitation was explained, the owner explicitly approved
reconstruction of the **opening animated character only**, as close as possible
to the original. That approval does not authorize changing the mascot elsewhere,
changing the MENEI/wreath-to-M transition, or publishing to the live app.

## Artwork and motion

- New coherent atlas: `artwork/greek-wall-ball-reconstructed.png` (1536×1024).
  SHA-256 `07d8b6cfd2d156ffa19a74fd28ccee435961f8a8ec9a9a733bda9f6487efac26`.
  It references the original helmet, crest, sash, skirt, belt, greaves, sandals,
  anatomy and rough globe. It is an approximation, not an identical photo.
- Natural upper-arm silhouettes replace the old mechanical joint disks. Each
  forearm, wrist and five-fingered hand is one continuous piece. Organic overlap
  masks soften elbow seams; no independent wrist hinge or artificial joint cap.
- Stable planar arm IK avoids the old 180-degree projected elbow flip and limb
  collapse. Release/catch hand and ball velocities match; one ball persists.
- Feet retain fixed perspective anchors. Actual hip/knee articulation replaces
  whole-leg vertical compression. A shared lower-body skin mesh connects the
  original continuous reconstructed leg/skirt texture without hard-cut gaps.
- An optional WebGL path renders that shared skin in one indexed draw instead
  of updating hundreds of SVG pieces. It uploads the already-loaded atlas once,
  keeps the complete SVG fallback, restores it on context loss/errors, and frees
  resources on finish/skip/replay. No new network calls, accounts or saved state.
- The opening remains 4.5 seconds, with Skip, explicit replay, load timeout,
  background expiry and reduced-motion behavior preserved.

## Preservation

All 124 existing artwork/logo/font files were compared against the release
source and remain byte-identical. `styles.css` is byte-identical. The complete
opening identity markup is also identical. The original mascot remains bound
elsewhere in the app, and all previous animation assets remain preserved.

No exercise photographs, app identity/scope, storage keys, cloud/auth settings,
provider keys, beta limits, reminders, workouts or nutrition data were changed.
The shell list only adds the new motion/skin modules and reconstructed atlas for
future offline use. Release metadata remains 8.2.0 pending publication review.

## Validation and review boundary

- Final `npm test`: 77 test files passed, zero failures. `npm run check` and
  `git diff --check` passed (2026-10-23).
- Pose tests sample bone lengths, bend direction, neutral wrists, fixed feet,
  continuous release/catch, exactly one flight, and return to the resting pose.
- Skin tests verify shared edges, finite positive triangle areas throughout the
  sequence, exact resting texture placement, rigid torso join and fixed sandals.
- WebGL mock tests cover buffers/UVs, single texture upload/draw, fallbacks,
  context loss, cleanup and replay. These do not establish real GPU appearance.
- Opening UI tests cover image readiness, stale callbacks, skip/replay, reduced
  motion, redraw survival, failed loads and preservation of saved records.
- Static SVG frames were rendered and visually inspected for holding, squat,
  release, flight and catch. This is illustrated 2D motion, not a 3D simulation.
- Real phone/browser playback, including the accelerated path, remains an owner
  preview check. No browser acceptance is claimed from mock tests or stills.

The separate self-contained review includes Play, normal/slow speed, a time
slider and the unchanged original mascot for reference. It bundles only public
artwork/font/code, uses no app account or service worker, and changes no data.

## Far-hand correction

The owner accepted the rest of the reconstruction and requested only the far
hand's thumb side corrected. The atlas and all pose/motion code stay unchanged.
Only the far palm/fingers are reflected around their fixed wrist-to-palm axis;
the original wrist collar and forearm pixels remain, with a short palm-side
blend. This is a constant drawing correction, not a new animated wrist joint.
A regression verifies opposite handedness, fixed wrist/palm anchors, unchanged
atlas SHA-256, and the exact baseline digest of every accepted transform at
91 times across the sequence. Hold, release, flight and catch stills were
inspected. The isolated private demo is updated; public app publication remains
pending separate authorization.
