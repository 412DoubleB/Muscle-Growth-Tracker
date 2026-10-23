# Current web update readiness

This is the current release checklist, not authorization to publish. Historical
setup and handoff reports remain evidence for their original stages. The latest
private implementation is preview 48, build `68ee9d9b7aa4`, with isolated push
sender version 3. Live GitHub Pages and its backend remain unchanged.

## Verified and accepted at the reported scope

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

1. Recheck connected reopening after the reported Auth 504. Load the latest
   private build; if the service still times out, verify Retry connection and the
   eligible same-account Open saved data on this device path. A connected service
   timeout was reported; physical airplane-mode reopening is still unverified.
2. On an upcoming uncompleted lifting/running day, save a usual workout start
   time and time zone far enough ahead that the one-hour reminder is still in
   the future. Confirm sync and device push opt-in, then close the app. Check the
   notification around one hour before that start, allowing the minute scheduler
   and platform delivery delay. Do not change completed/skipped history to force
   a reminder or reset delivery slots. A start time is not an alert time.
3. Check installed/offline reopening and a normal update on the phone without
   clearing storage. Full restore and concurrent-conflict recovery require a
   separate test account/origin; do not experiment on the owner's only history.

## Publication preparation still to complete

- Prepare the exact reviewed release package, version/release notes and rollback
  reference. Compare it with the current live origin/path and PWA identities.
- Keep deferred spoken workout cues disabled in the launch artifact. Preview
  46 uses a fixed false source gate; no speech instance is constructed, no voice
  receipt is written and no speech is requested. Accepted rest timers/chimes are
  unchanged. Retaining the helper for later work does not make speech accepted.
- Explicitly reconcile deployment scope: Sites hosts the beta's Worker/D1 AI
  services and isolated Auth; GitHub Pages alone cannot run that backend. Current
  push is an isolated owner pilot. Copying static files must not be represented
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
