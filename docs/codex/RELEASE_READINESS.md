# Current web update readiness

Current release: MENEI 8.2.0, limited beta at the original GitHub Pages URL.
Live email confirmation and cloud sync are owner-accepted. Live owner AI admission
is accepted after the API-only/private-service transport correction. The first
20-account campaign is open; five attempts each and previous usage are preserved.
The production reminder sender and minute scheduler are active. Provider delivery
and physical Android receipt of the live two-minute closed-app test are accepted.
No iPhone physical push or exact one-hour workout delivery is claimed. See the
latest receipt in PRODUCTION_ACTIVATION.md for source/deployment versions. Earlier
entries below describe their original private-preview stages.

## Verified and accepted at the reported scope

- Owner confirmed the updated private preview opens normally while connected
  and also opens in airplane mode. This accepts basic connected access and
  offline reopening; offline access uses retained device records, not online
  authentication. Exact record comparison, offline editing/reconnect sync and
  the explicit service-outage continuation button were not separately reported.
- Owner confirmed phone-to-Mac edits and meal/purchase/pantry/shopping sync,
  generated meals with existing records retained, and backup preview/cancel.
  These observations do not establish a full restore or concurrent-conflict test.
- Owner accepted the revised automatic rest flow, storage-save correction and
  current mascot animation provisionally. Deferred illustration work stays open.
- Owner confirmed immediate notification display and the two-minute closed-app
  push test. Exact one-hour workout reminder delivery is still a separate check.
- Preview 48 passed all 71 test files in one full regression run
  (350045.551425 ms), after focused admission/account tests passed. This includes
  explicit local continuation during service timeouts with cloud/AI paused and
  denial/recovery/account-change protection. Speech remains disabled. Older
  preview results remain in DEVELOPMENT.md as historical evidence.
- Preview 47 fixes obsolete private app-file cache cleanup. Its six affected
  update/offline/package/push test files passed (8974.054945 ms), plus a VM check
  of the packaged worker with all 53 cached shell entries. The active offline
  Home/code, unrelated caches and API/Auth bypass were retained. This is not a
  new full-suite or physical-phone result.
- Static validation passed again during this readiness review: 33 JavaScript
  modules, 53 offline entries, 162 original image identities, 113 WebP assets and
  35 retained movement pairs. No browser or physical-device result is inferred.

## Next device checks

1. On an upcoming uncompleted lifting/running day, save a usual workout start
   time and time zone far enough ahead that the one-hour reminder is still in
   the future. Confirm sync and device push opt-in, then close the app. Check the
   notification around one hour before that start, allowing the minute scheduler
   and platform delivery delay. Do not change completed/skipped history to force
   a reminder or reset delivery slots. A start time is not an alert time.
Basic online/offline opening no longer needs repeating. Full restore and
concurrent-conflict recovery remain separate test-account/origin checks. The
explicit service-outage continuation path can be observed if an outage recurs;
do not force a real failure or clear data for that test. The owner's confirmation
does not claim exact record auditing or a different installed-app mode.

## Publication preparation still to complete

- Updated rc2 frontend is retained at
  `/workspace/work/menei-8.2.0-20261023-rc2`; prepared production services at
  `/workspace/work/menei-8.2.0-services-20261023-rc2`, both from `4582bab9d2e6`.
  All 174 frontend and 191 service-input hashes plus both archive hashes and
  generated syntax were independently verified. All 170 original private-preview
  client files remain byte-identical. The actual packaged gateway imports resolve
  and deny anonymous private-preview routes while permitting public API preflight.
  No hosted service/audience change was made. The frontend remains
  `deploymentReady=false` and its AI activation flag is false. See
  PRODUCTION_ACTIVATION.md for the exact staged change, account dependency and
  remaining physical/hosted checks. See RELEASE_RECOVERY.md for the original
  reader's compressed-snapshot downgrade limitation.
- Keep deferred spoken workout cues disabled in the launch artifact. Preview
  46 uses a fixed false source gate; no speech instance is constructed, no voice
  receipt is written and no speech is requested. Accepted rest timers/chimes are
  unchanged. Retaining the helper for later work does not make speech accepted.
- Activate and verify the prepared production integration: Sites hosts the beta's Worker/D1 AI
  services and isolated Auth; GitHub Pages alone cannot run that backend. The currently published
  tested push is an isolated owner pilot; the prepared production sender retains
  original live keys/subscriptions and needs live schema/deployment verification. Copying static files must not be represented
  as enabling AI or push for live users. No audience/backend cutover is approved
  by this checklist.
- Keep the approved AI campaign limits: first 20 MENEI accounts, five attempts
  each, 100 total including prior usage. Do not reset seats, counters or keys.
- Review first-use health/privacy/IP wording and rights-holder details before
  activating new terms. Existing health acknowledgment is not consent to a new
  IP agreement. IP_PROTECTION_REVIEW.md remains a draft, with no legal guarantees.
- Obtain explicit owner authorization for the concrete live release/cutover;
  private-preview approval does not publish the live app.

## Explicitly deferred

Spoken workout encouragement is unresolved and deferred to post-launch by the
owner. The first checked set produced no speech on the phone; rest timing still
worked. Do not treat the synthetic speech checks as physical acceptance. Stop
voice debugging and the proposed Test workout voice button; no such button was
implemented or deployed. Daily quotes remain text-only. Speech acceptance does
not block this release; existing rest timers/chimes stay in scope.

Wearable/fitness-service sync is a future post-launch upgrade and is not a
current release dependency. Do not request health permissions or create provider
credentials now. Exercise-photo review, including the unresolved supinated
cross-body preacher curl, remains deferred. Further mascot refinement is also
deferred after provisional acceptance. No quote playback is requested.

See DEVELOPMENT.md for the private preview 48 publication receipt. This step
changed only client outage recovery and private build metadata. No notification,
provider request, account data, backend setting, media asset, sharing policy or
live deployment changed. The concrete live cutover plan is in LIVE_RELEASE_PLAN.md.

The completed setup guide has separate iPhone/Android installation, account/sync,
profile/units, gym/program, nutrition/allergens, start-time/time-zone, permissions,
notification tests, audio/mute, optional calendar and backup/update sections.
Home-screen installation is necessary for iOS push. Production-account binding
and one-hour delivery remain distinct from local/package validation. The planned
public start.html link must not be sent as an available updated guide yet.


## Current launch-preparation receipt

The current versioned candidate is rc5, source 182075eceaec44e3a6770092ab5624a9333288a3,
in /workspace/releases/menei-8.2.0 (release/8.2.0-ready). All 74 test files pass;
all 174 frontend/191 service-input hashes, both archives and 84 generated syntax
checks pass. See DEVELOPMENT.md for exact receipts; rc1–rc4 are earlier inputs.
The final guide, release branch and prepared original-project AI/push integrations
are complete locally. No live publication, native audience change or backend
mutation has been made. Code readiness is not hosted/email/device acceptance.

Launch is still blocked by unconfigured Custom SMTP (owner screenshot/reply),
owner live-account confirmation/allowance linking and controlled production
activation/verification. The owner reports Auth redirect URLs already correct.
They use Gmail without a business domain; EMAIL_SETUP.md is the next owner-only
step. Do not invite outside testers or disable email confirmation to bypass mail.
