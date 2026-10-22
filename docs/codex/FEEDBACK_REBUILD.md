# Owner feedback rebuild scope

This is a technical requirements register, not a private conversation transcript.
The maintenance release remains unpublished to the live GitHub app. New work stays
in the owner-only preview; live backend/publication approval is still separate.

| Request | Existing behavior / next work |
| --- | --- |
| Brighter background M and globe athlete | Raise backdrop visibility approximately from 3/10 to 5/10 with CSS; preserve image bytes |
| Metric / US customary settings | Connect a system selector to load units; display food mass/volume accordingly; nutrition macros remain grams |
| Nutrition quantities | Convert compatible mass/volume for ingredients, pantry, shopping and exports without changing stored food quantities |
| Easier recipe import | JSON upload/paste already exists; clearer discovery now; URL/photo/OCR is a later provider-reviewed import workflow |
| Uneven gym increments | Current input accepts arbitrary decimals; no algorithm deliberately adds 5.1; expose distinct lb/kg steps and remove ambiguous number spinners |
| First-use health/legal notice | Cover medical limits, injury, allergies, food safety and AI estimates; acknowledgment and later access; legal review before public release, no liability guarantee |
| Soldier muscle avatar | New asset/design review; preserve existing exercise images and bindings |
| Day streak / popup | One combined streak feature, grounded in actual canonical completed sessions; healthy rest-day behavior needs a clear definition |
| Today workout/nutrition secondary screens | Home entry points and secondary overlays, with daily motivation |
| One-hour upcoming-workout push | Add workout time/timezone and review isolated test scheduler; closed-app push requires permission/backend/device validation; remains disabled until separately activated |
| Muteable audio / motivation | Rest completion cue on by default: original two-tone chime repeated four times, one second apart (about 3.4 seconds total), with explicit Mute/Unmute. Mute/Stop cancels remaining repetitions. The Done/timer gesture arms audio automatically; no separate enable prompt. This policy enables previous default-off settings once, then preserves explicit mutes. Broader spoken/motivational audio remains queued |
| Manual superset pairing | Existing pairing is restricted to unstarted exercises; improve selection/advice while preserving recorded structure |
| Live next-set loads | Already implemented: above upper rep bound + more than 2 RIR increases; below lower bound decreases; explicit application protects entered values |
| Exercise order / fatigue context | Record future set/session timing and order without inventing historical timestamps; advice is contextual, not a diagnosis |
| Cross-body preacher illustration | UNRESOLVED / DEFERRED by owner: revisit with all photos later. Palm-up/supinated grip remains selected. Corrected START candidate is unapproved; no FINISH generation or app replacement until review resumes |
| Watches / Samsung Health / Fitbit / MapMyRun | Separate capability/OAuth/native-health integration review and per-user consent; no connection or data sharing yet |
| Automatic set/round rest | Implemented for newly checked valid sets in today's workout after successful save; paired working sets wait for both rows of a round. Auto rest can be disabled. Historical edits, redraw, duplicate checks and sync do not start rest |
| Completed-pair rest overlay | Automatic, mandatory 3-minute blocking rest only AFTER ALL working sets of the pair finish, including unmatched extras. Applies to the selected workout regardless of scheduled date or the ordinary set/round rest setting. No start/confirmation prompt. Stop (or Escape) always dismisses; at zero it remains until manually stopped. Owner reconfirmed: no blocking popup between rounds |
| Launch animation / quote | Animate existing decorative assets with reduced-motion support; dismissible, no input interception after intro |
| Estimated workout duration | Show near Home top, label as estimate, account for sets/rest/supersets/run/sauna without writing history |
| Home on startup | Fix refresh destination from recipes to Home; retain intentional recipe links |

Repeated items consolidated: backdrop brightness; streaks; reminders/motivation;
audio/rest cues; superset rest behavior. These are one feature per row, not duplicate
implementations. Existing partial features are identified above.

Photo work is deferred at the owner's request. Chat image/file delivery failed,
so the corrected cross-body START has not received visual acceptance. Keep the
candidate privately without treating deferral as rejection or approval. Revisit
this correction and the broader photo review later, preserving existing approvals,
assets and bindings. Stop the proposed preview review-page work; no review page
has been published. Continue other rebuild work independently.
