# Owner feedback rebuild scope

This is a technical requirements register, not a private conversation transcript.
The maintenance release remains unpublished to the live GitHub app. New work stays
in the owner-only preview; live backend/publication approval is still separate.
Current release checks and deferred work are consolidated in
[RELEASE_READINESS.md](RELEASE_READINESS.md).

| Request | Existing behavior / next work |
| --- | --- |
| Brighter background M and globe athlete | Raise backdrop visibility approximately from 3/10 to 5/10 with CSS; preserve image bytes |
| Metric / US customary settings | Connect a system selector to load units; display food mass/volume accordingly; nutrition macros remain grams |
| Nutrition quantities | Convert compatible mass/volume for ingredients, pantry, shopping and exports without changing stored food quantities |
| Easier recipe import | JSON upload/paste already exists; clearer discovery now; URL/photo/OCR is a later provider-reviewed import workflow |
| Uneven gym increments | Current input accepts arbitrary decimals; no algorithm deliberately adds 5.1; expose distinct lb/kg steps and remove ambiguous number spinners |
| First-use health/legal notice | Cover medical limits, injury, allergies, food safety and AI estimates; acknowledgment and later access; legal review before public release, no liability guarantee |
| IP protection / anti-copying terms | Added to first-use legal scope: review ownership, limited app license, copying/redistribution/reverse-engineering restrictions where enforceable, branding, third-party rights and public-source exposure. See IP_PROTECTION_REVIEW.md. Terms cannot monopolize an idea or guarantee no imitation; no legal terms activated yet |
| Soldier muscle avatar | New asset/design review; preserve existing exercise images and bindings |
| Day streak / popup | Training-day streak/best/total on Home, based on valid completed canonical logs. Explicit saved rest days preserve without adding a day; missed recorded workouts or unknown gaps break. Today has grace until midnight. Milestone popup only on new genuine completion; no import/sync/view replay |
| Today workout/nutrition secondary screens | Home entry points and secondary overlays, with daily motivation |
| One-hour upcoming-workout push | Usual start time/timezone in Settings and future Home summary; one-hour UTC calendar alerts after explicit time save. Isolated owner push pilot now has a server sender, minute scheduler, device opt-in and two-minute closed-app test. Owner confirmed immediate and closed-app test delivery; exact one-hour workout reminder acceptance remains pending. First-20 AI enrollment unchanged |
| Muteable audio / motivation | Rest completion cue on by default: original two-tone chime repeated four times, one second apart (about 3.4 seconds total), with explicit Mute/Unmute. Mute/Stop cancels remaining repetitions. The Done/timer gesture arms audio automatically; no separate enable prompt. This policy enables previous default-off settings once, then preserves explicit mutes. Brief browser-voice cues after the first valid saved set and explicit workout completion are implemented in private preview 45, using the same mute control and account/device-scoped replay prevention. Daily quotes stay text-only: no Hear today’s quote action, per owner correction. Voice stops on mute, Stop, account changes and page hiding; rest chimes remain unchanged. Actual phone voice playback remains pending |
| Automatic superset combinations | Match across the actual workout using muscle/compound overlap, working-set counts and order as a tie-breaker. Show A1/A2, B1/B2 in preview, Home and calendar. Preserve independent progression and entered/existing pair structure. Demanding free-weight leg compounds remain straight; same-muscle/compound fallback pairs display cautions. Apply selected format after loading custom routines too |
| Manual superset pairing | Choose any two unstarted exercises, with live muscle-overlap/compound-lift cautions and lower-overlap alternatives from this workout. Cautions are advisory; saving is explicit. Entered sets and their paired partners stay protected |
| Live next-set loads | Already implemented: above upper rep bound + more than 2 RIR increases; below lower bound decreases; explicit application protects entered values |
| Exercise order / fatigue context | Done checks on today's workout record device time/offset. Home → Workout order shows chronological checks, working/top exercise order and earlier working sets. Cards flag possible muscle overlap and different historical placement. Old/backdated/unknown times stay unknown; partial/tied order is labeled. Advice does not auto-reorder exercises or change rep/RIR load rules |
| Cross-body preacher illustration | UNRESOLVED / DEFERRED by owner: revisit with all photos later. Palm-up/supinated grip remains selected. Corrected START candidate is unapproved; no FINISH generation or app replacement until review resumes |
| Watches / Samsung Health / Fitbit / MapMyRun | DEFERRED to a post-launch upgrade by owner. Not a blocker for the current web release. Initial capability review found native Android/Health Connect or provider OAuth dependencies; recheck current provider requirements when resumed. No connection, health permission, data sharing or integration implementation yet |
| Automatic set/round rest | Latest owner policy: 60 seconds between every individual set, including supersets and all set roles/formats, on the selected workout date. Newly checked valid saved rows start rest; redraw, duplicate checks and sync do not. Ordinary rest can be set to manual |
| Exercise/pair completion rest | Latest owner policy supersedes mandatory manual dismissal: automatic 3-minute blocking popup after ALL sets of a standalone exercise or ALL sets of both exercises in a superset pair, including warm-ups, back-offs, drops and extras. Closes automatically at zero; Stop/Escape can dismiss early. Applies regardless of ordinary rest setting or workout date; no start/confirmation prompt |
| Launch animation / quote | 4.5-second continuous 2D joint animation replaces rejected pose crossfades. Same solid hands/ball persist through squat, release, flight/rebound, catch and chest-held settlement. Separate right/left dorsal and oblique hand views replace rejected front-facing palms; forearm/wrist/hand links retain neutral wrist alignment and the far hand is naturally occluded by the globe. Limb/contact geometry and release/catch continuity are checked; owner provisionally accepted the preview 35 animation/hands; further visual refinement is deferred. Original MENEI/wreath sequence, quote, Skip/Escape, Replay and reduced motion retained. Supplemental rig atlas/module; original media/logo assets remain unchanged. Preview 35 approved for now; this does not approve deferred exercise photos |
| Estimated workout duration | Show near Home top, label as estimate, account for sets/rest/supersets/run/sauna without writing history |
| Recovery storage quota | Losslessly compress account-scoped device recovery copies and the active account/project's sync comparison cache; read old JSON and compressed copies. On quota, compact only that cache and retry the primary/recovery write. Keep full primary JSON/history/legacy keys intact. Failed program writes preserve the draft and prior saved state for retry; no record clearing |
| Same-day program changes | Lifting/running options in Settings default to today, with Start today shortcut and explicit eligibility/preview. Saving updates today and future unstarted workouts, then opens Home. Any gym load/reps/RIR/check protects the day; completed/skipped/run/sauna records and entered plan rows remain protected. Recheck at Save, including entries added after preview |
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
