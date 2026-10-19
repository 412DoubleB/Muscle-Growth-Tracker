# Isolated cloud acceptance stage

Target: **MENEI Private Beta Test**, project `bhyrrxrpqaxiwpfxnwpa`.
Organization: Muscle Growth Tracker. The owner selected this organization and
approved the quoted $0/month new-project cost. This document does not authorize
any change to live project `tdmwpcueqxtnqyonucam`.

## Approved schema setup

The owner reviewed the creation-only SQL and approved it only for the test
project. It was applied there as `menei_isolated_beta_initial_reviewed`, database
migration version `20261019172435`. Exact input is retained in
`supabase/test-backend/initial-reviewed.sql` (SHA-256
`e07198db7716ea8bd586e7894e18d12a40e3d27ac8510950403ffb2ed5aeb89e`).

The migration created the private helper schema, three tables, three policies
and six functions. It replaced no objects or existing records. Both revision
comparisons use `IS DISTINCT FROM` so NULL cannot bypass the version check.
Stored function definitions do not execute their INSERT/UPDATE/DELETE statements
at creation. Future successful updates retain five previous revision backups;
future deletion of a test Auth user cascades to that user's associated records.
No users, secrets, deployed Edge Functions or cron jobs were created by setup.

## Completed validation

`scripts/rls-live.sql`, despite its historical filename, ran only in this isolated
project. Fifteen transactional assertions passed: initial/update revisions,
stale/NULL revision rejection, five-backup retention, per-account state/revision
visibility, cross-owner RPC denial, denied direct state writes, push ownership,
server-config restrictions and anonymous access denial. Every synthetic record
was rolled back. Independent post-test counts were all zero: Auth users, app
snapshots, revisions and push subscriptions. Security and performance advisors
both returned no findings.

The SQL check is not a test of email delivery, actual sign-in, concurrent HTTP
clients, real devices or push delivery. Those remain pending.

## Before connecting the private preview

1. In the **test project's** Authentication → URL Configuration, set Site URL
   and the allowed redirect URL to
   `https://menei-private-beta.crispcrown515.chatgpt.site/`.
   Dashboard: https://supabase.com/dashboard/project/bhyrrxrpqaxiwpfxnwpa/auth/url-configuration
2. Keep email confirmation enabled and anonymous sign-in disabled. Review signup
   access and mail delivery for the two dedicated test accounts. Do not use live
   account passwords or import personal history for the initial tests.
3. Retain owner-only Sites access. Connect only this exact test project through
   a reviewed preview configuration. Do not copy server keys, tokens, passwords
   or exports into the source or deploy archive. The isolated test-cloud preview pins every cloud request and its browser
   network policy to the test project. Scheduled push stays disabled.
4. Have the owner create and confirm test accounts using the normal Auth flow.
   Enter passwords only in the test app or approved private environment, never
   in chat, Git, or reports. Verify confirmation and recovery links return to
   the preview with its full trailing-slash path.
5. Run isolated HTTP acceptance, then same-account two-device/offline/conflict
   tests and different-account isolation tests. Confirm no account-A workout is
   offered as guest history to account B. Genuine guest import requires consent.
6. Before scheduled push, validate subscription shape, configure test-only
   server secrets/Edge Function/cron and test authorization/leases. No scheduling
   is enabled by this schema. Test closed-app delivery on a permissioned device
   and confirm completion suppression and timezone behavior.

URL allowlist reference: https://supabase.com/docs/guides/auth/redirect-urls
Mail configuration reference: https://supabase.com/docs/guides/auth/auth-smtp

## Guarded acceptance commands

Both HTTP acceptance scripts require `SUPABASE_URL`,
`SUPABASE_PUBLISHABLE_KEY` and `MENEI_TEST_PROJECT_REF`. The URL must exactly match
that independently selected project reference. They refuse the configured live
backend, redirects, URL credentials, alternate domains and server secret keys.
They do not default to tracked `config.json` for an execution target.

- `node scripts/api-live.mjs`: anonymous permission checks and Auth availability.
  The reminder endpoint is checked only when `MENEI_TEST_REMINDER_FUNCTION` is
  supplied. That check proves unauthorized requests are denied, not delivery.
- `node scripts/cloud-smoke.mjs`: requires two dedicated confirmed test accounts
  plus `MENEI_ALLOW_TEST_WRITES=1`. It can create synthetic snapshots for those
  accounts if absent. It expects permission/identity errors, not generic server
  failures, for cross-account and anonymous denials.

Keep test credentials and captured results outside public Git. Missing settings
produce an explicit skip; a skip is not a pass. No HTTP acceptance or real email
claim is made until those checks are actually run against the isolated project.


## Isolated test-cloud preview implementation

The separate Sites preview can now run in `test-cloud` mode. Its HTML pins the
project reference and permits connections only to the same origin and the exact
test Supabase origin. Connection editing, original-cloud imports and push controls
are hidden and guarded. Test credentials and sync bases use project-scoped keys;
existing generic credentials and saved workspaces are retained. Missing runtime
configuration pauses network activity and preserves a matching saved test-account
workspace for offline use. Local signout remains available.

The tiny Sites Worker obtains only the test publishable client key from the
native secret environment variable `MENEI_TEST_PUBLISHABLE_KEY`. It serves that
public client setting to signed-in owner requests at same-origin `/config.json`,
with `private, no-store`. No runtime key is in the source or archive. This is a
public browser key, never a service-role/server key; per-account RLS remains the
data boundary. The Sites platform independently restricts site access to its owner.

The owner's supplied dashboard screenshot shows the correct test project and the
preview URL in Site URL and Redirect URLs. A screenshot cannot confirm a final
Save action. Keep those settings restricted to the preview and retain email
confirmation.

An attempted anonymous HTTP acceptance run from this environment was blocked by
the session network proxy (403 on CONNECT to the test host). It did not complete
and is not counted as a pass. Previously completed rollback-only SQL acceptance
remains valid. Email delivery, reset/confirmation callbacks, two-device HTTP sync
and real-device conflicts still require testing in the owner's browser. No live
backend changes, test Auth users, push deployment or scheduling were performed
for this preview update.


## Published test-cloud preview — October 19, 2026

Owner-private Sites version **2** deployed successfully with environment revision
1. Same preview URL and project; the owner remains the sole allowed user, with
zero groups, external visitors or additional editors. Scheduled push is disabled.

- App source commit: `4ed5446344581a10e17afeedcb1e34444bb39bd4`.
- Separate Sites source commit: `ce164e75afe400887c2d6e8edef1069987d30a09`.
- Saved version: `appgprj_6ad593d6f15481918ded32373b877b03~appgver_e81a533259dc81919d6aa95b82e21b6b`.
- Deployment: `appgdep_6ad65874151c8191904462c40721e506` (succeeded).
- Archive: 158 files, 153,055,033 bytes,
  SHA-256 `0efa91c42878747bee0aca0d7f8bd2ed9b28da416fb7ec1d9888e36963ffd31e`.

The archive contains `.openai/hosting.json`, `dist/server/index.js` plus its
asset-binding configuration, and 155 runtime files under `dist/client/`.
All 121 shipped image/font files exactly match the existing source. The initial
archive layout was rejected before a version was created; correcting the Worker
entrypoint to `dist/server/index.js` resolved deployment validation. Private source
and build helpers use the same Site ID and exact pushed source commit. No private
records, conversations, backups, exports or runtime keys were uploaded.

Native deployment and access verification passed. An additional read-only HTTP
probe of the hosted preview was blocked by the environment proxy before reaching
the site; independent hosted asset/owner-session configuration requests therefore
remain unverified here. Recent native Worker error logs were empty. Local browser
QA used a synthetic runtime key, owner identity and HTTP boundary, not real email
accounts. Do not count it as end-to-end Auth or two-device acceptance.

Version 1 remains saved for rollback to the device-only preview if needed:
`appgprj_6ad593d6f15481918ded32373b877b03~appgver_0f252fdf739481919b974bce42be3965`.
Use only the private-version deployment operation and preserve owner-only access.


## Runtime configuration routing correction

After version 2, the owner reported that Create account showed the generic
private-preview cloud-disabled error. A concrete packaging collision reproduced
that failure: `dist/client/config.json` was a static placeholder without cloud
settings, at the same path handled by the Worker. Static-first hosting returned
the placeholder and the client deliberately paused cloud access. Hosted HTTP
inspection remains restricted by this environment, so the static-first behavior
is reproduced locally rather than asserted as a captured hosted response.

The test client now uses the dedicated extensionless `/api/preview-config` route,
which has no static counterpart. The builder removes stale test-cloud
`config.json`, and the service worker does not precache runtime settings. Both
static-first and Worker-first dispatch can reach the handler. Local preview/live
source configuration paths remain unchanged. Bootstrap failures produce a fixed,
sanitized reason and a reload retry action; no response contents, runtime keys
or email tokens are included in diagnostic messages. Saved workspaces and account
credentials remain intact when offline or configuration is unavailable.

The configuration handler serves fixed shared public-client settings behind the
verified owner-only Sites access boundary. It does not depend on per-visitor
identity headers and can also serve platform-authorized service calls. This is
not a user-record endpoint: it exposes only the test publishable browser key,
the pinned test URL and disabled-push settings. No server/service-role key is
accepted or returned. Supabase RLS still enforces account data separation. This
supersedes version 2's redundant per-visitor identity gate and `/config.json` route;
Sites access restrictions remain unchanged.


Correction validation: all 18 Node test files and static/diff checks passed. The
actual built package is covered by an asset-first routing regression, including
removal of a stale placeholder, runtime key exclusion, unchanged image/font bytes
and media bindings. Synthetic browser QA also used asset-first dispatch: runtime
configuration returned 200 and the real Create account action made exactly one
mocked POST to the pinned test signup endpoint, then showed the email-confirmation
status without an error. No actual backend requests were made by that test.
Mobile layouts (1440/430/360), 84-day generation/save, offline workspace/history
and safe failure/retry behavior passed. Hosted Auth/email acceptance still needs
the owner's retry; the environment's network restriction remains unchanged.


The correction is deployed as owner-private **version 3**, environment revision 1.
Native deployment succeeded; post-deployment access still has only the owner,
with no groups, external viewers or additional editors. Same preview URL.

- App source: `71b7bb6f537e8625807eac7d4f81334a10cb2fc3`.
- Sites source: `498e750556789ef742c104885fb93130d816c4ec`.
- Saved version: `appgprj_6ad593d6f15481918ded32373b877b03~appgver_087e2271da18819199d91bbb2e25be9b`.
- Deployment: `appgdep_6ad65c59708481919b1e24b1397f2fce` (succeeded).
- Archive: 157 files, 153,055,473 bytes, SHA-256
  `775257aabeda2c830771a0f56887e85e1546879ecea820bbf227eee15d51e70e`.

No GitHub push/merge, live-app/backend changes, image replacements or account/data
resets were performed. Test backend schema and scheduled-push configuration remain
unchanged. Refresh the preview to load the corrected client before retrying signup.


## Native browser request receiver correction

The owner's next screenshot showed the test connection ready and a different
failure on Create account: `Failed to execute 'fetch' on 'Window': Illegal invocation`.
No personal account identifiers from that screenshot are retained in source.
The prior routing correction therefore loaded configuration, but exposed an
existing client transport defect: the default unbound browser `fetch` was saved
as a CloudSync property and invoked with the CloudSync object as its receiver.
Chromium rejects that receiver before sending the request.

A native Chromium reproduction confirmed the exact error with global fetch left
unmodified and zero auth requests dispatched. Earlier browser QA had replaced
fetch with an arrow function, which hid the receiver requirement. The corrected
default transport binds global fetch to its global receiver. Custom injected
transports and all request-target/account/push guards remain unchanged. A new
receiver-sensitive regression fails before the fix and passes afterward for both
Auth and authenticated-account requests. Existing workout records and credentials
are not migrated, cleared or reset.


After the fix, native Chromium with no fetch replacement passed signup, recovery,
signin, snapshot/commit sync and signout. CDP fulfilled synthetic responses at the
network boundary, including CORS preflights; all 12 external request attempts were
intercepted before any transport. Signup displayed the email-confirmation status.
No JavaScript exceptions, console API errors or online network errors occurred.
Layout, program save and offline preservation checks also passed. All 18 Node
test files, static checks and diff checks passed. These prove browser request
plumbing and preservation, not real email delivery or server account acceptance.


Native request correction deployed successfully as owner-private **version 4**,
environment revision 1. Post-deployment native access verification remains sole
owner, zero groups/external viewers/additional editors, at the same preview URL.

- App source: `f326869351bef16ce6b49f5cff7444607dd4d569`.
- Sites source: `49ca3090c4d65538227346d17cc39783bd08a776`.
- Saved version: `appgprj_6ad593d6f15481918ded32373b877b03~appgver_7d6e9f09e6248191823ff7f34c5581db`.
- Deployment: `appgdep_6ad65ed7e9948191b7bce3a1c962feea` (succeeded).
- Archive: 157 files, 153,055,432 bytes, SHA-256
  `d7338460a94c2e66df7348a5f3ce13f0bd038b6c3a023c3fb2740bd1c15f7a03`.

All 121 shipped images/fonts match source bytes. No private evidence, personal
records or runtime keys are archived. No live app/backend changes, GitHub push,
merge, image replacement, saved-history reset or push scheduling were performed.
Owner should refresh the preview before retrying real signup. Browser-native
synthetic transport acceptance passed; real email delivery and two-device/server
acceptance remain pending. The hosted-read proxy restriction remains unchanged.


## JSON object ordering and conflict preservation

The owner reported successful phone sync with many saved conflicts. This confirms
transport on that device, but is not a clean two-device merge acceptance. The
client compared records using JSON.stringify text, which treats object insertion
order as significant. PostgreSQL JSONB can return the same object values with
keys reordered. A synthetic state with 100 original recipes, seven settings/gym
records and one completed workout reproduced exactly 108 false conflicts when
only object keys changed. Repeated no-edit sync also unnecessarily committed new
revisions. No real account payloads are retained in these regression fixtures.

The correction uses canonical JSON comparison, recursively ignoring object-key
order while retaining JSON value semantics and array ordering. Missing/undefined
object fields follow existing JSON wire normalization; null, zero, types, array
order and substantive nested fields still matter. Existing record-level timestamp
comparison remains limited to that record's own updatedAt. No-op cloud comparison
ignores only the workspace's root updatedAt; nested record edits still synchronize.

Existing conflict IDs, resolution IDs, raw local/remote copies and their order
are retained. The correction does not clear or auto-resolve earlier conflicts or
change the historical conflict-ID algorithm. The review screen classifies matching
copies and displays genuinely differing saved values first without editing them.
The owner should export a private preview backup before making explicit choices.
Real nutrition/workout differences must be reviewed; they cannot be treated as
mere object-order changes. No blanket choice or server-side data repair is part
of this update.


Validation: all 21 Node test files, static checks and diff checks passed. New
regressions cover JSONB-like nested key reordering, no-base seeded records,
undefined wire normalization, zero loads/types/null/array ordering, timestamp-only
changes, one-sided edits with a reordered base, real concurrent set edits,
no-edit zero-commit sync, single-edit-then-quiescent sync and preservation of all
108 pre-existing synthetic conflict records. Opening review makes zero storage
writes; genuine choices retain the pre-choice recovery snapshot. The final
wording adjustment was verified by rerunning the focused review UI test.

The only remote operations for this investigation were read-only aggregate
checks against MENEI Private Beta Test. No remote records or schema were changed,
and no complete account payloads were retrieved. Client-side fixtures use only
synthetic records. After publication the owner should refresh both devices;
older open client versions can still apply the old comparison logic. Existing
saved conflicts remain until explicitly reviewed. Export private device backups
first and do not upload them into the source repository.


JSON comparison correction deployed successfully as owner-private **version 5**,
environment revision 1. Post-deployment access remains sole owner, with no groups,
external viewers or additional editors. Same private preview URL.

- App source: `3f8b265cf2601d499978c60e75d0b737557d4d29`.
- Sites source: `50a8ac1d88aa5dd7a7ba5126ee32f753f0d858f1`.
- Saved version: `appgprj_6ad593d6f15481918ded32373b877b03~appgver_df38dfa5c9ac81918c25fa9ad79893cb`.
- Deployment: `appgdep_6ad6741299c88191a7db7877fe67a50e` (succeeded).
- Archive: 157 files, 153,055,883 bytes, SHA-256
  `60be5e725331bec934e651b93725461a8fbbe38813619748e3af70fbe4becf95`.

All 121 shipped image/font files match the existing source. Private evidence,
account exports, backups and runtime keys are excluded. No GitHub push/merge,
live-app/backend changes, database migrations, server-side repairs or automatic
conflict resolutions were performed. Scheduled push remains disabled. Owner review
of differing saved nutrition values and clean two-device/offline acceptance are
still pending; the existing conflict count is deliberately retained.


## Explicit review while preserving current settings

After selecting a preferred saved nutrition setup, the owner still had a separate
older nutrition conflict. Both copies in that remaining entry were older than the
selected active settings. The prior two-button screen could only restore one of
those historical copies, so another choice could undo the desired setup.

The review workflow now offers explicit Keep current settings/item and a batch
acknowledgment for matching pairs. These actions keep active records unchanged,
mark only selected reviews resolved and retain complete saved copies plus the
pre-action current value in recovery records. Historical A/B selections also
retain recovery records. Nothing is acknowledged on load, opening review or sync;
the owner must click an action. A local snapshot precedes every modifying action.

Recovery records use uniquely identified `kind: reviewed-conflict` entries in the
existing `legacySnapshots` collection, which older clients already union during
sync. The schema number, browser storage keys, original source entries and their
relative order are unchanged. A new root archive field would not have the same
old-client preservation guarantee. Reviewed entries are ordered deterministically
for convergence; cloud no-op comparison also tolerates old-client review ordering
and resolution-marker ordering without reordering the saved marker array.
Authored array ordering remains meaningful. Existing conflicts/resolution IDs
are retained; no arbitrary historical-ID collision repair is claimed.

The screen shows active nutrition settings separately from saved versions A/B,
puts genuinely different reviews first and groups matching saved copies. Reviewed
copies remain visible in a recovery section and exported backups. Explicit restore
preserves the then-current value for recovery before applying the selected copy.
Original-source counts exclude these new reviewed-copy entries. No server-side
record repair or automatic bulk cleanup is part of this feature.

Validation: all 23 Node test files, static checks and diff checks passed. Synthetic
regressions cover 107 explicit reviews, atomic validation and storage failures,
historical selection/recovery, independent backup import and concurrent device
reviews. Two simulated clients retain all recovery records, do not resurrect
reviewed conflicts and settle without repeated cloud writes. Older-client review
ordering is tolerated while actual recovery values and authored array changes
remain meaningful.

Chromium at 360 pixels verified opening review without writes, keeping current
nutrition, acknowledging 106 matching pairs and reaching zero pending reviews
without changing active settings, workouts, zero loads or image bindings. A
1,840,431-byte synthetic backup restored all 107 recovery entries on a separate
origin; explicit historical restoration and restoration of the kept value also
passed. A realistic 815,347-byte synthetic sync base remained present throughout.
No external browser requests or JavaScript errors occurred. This verifies
synthetic recovery, not the contents of the owner's private backup or acceptance
on a second physical device.

Deployed successfully as owner-private **version 6**, environment revision 1.
Post-deployment access remains sole owner, with no groups, external viewers or
additional editors. The URL is unchanged.

- App source: `be2e51f16841f1b316d6d2497deeac164c295558`.
- Sites source: `c09da9352face3e39f1ff9391ff0bc5261af5829`.
- Saved version: `appgprj_6ad593d6f15481918ded32373b877b03~appgver_16f3f05cd4bc8191b89ac7229fbedec5`.
- Deployment: `appgdep_6ad67c9f2a0881918c7e02b1ec8c8bc6` (succeeded).
- Archive: 157 files, 153,059,756 bytes, SHA-256
  `8bd019ce012392b65bc307d3de0822515ccfac270e3d9e15e72a1a385152e56d`.

All 121 shipped image/font hashes match the existing source. The package contains
154 runtime client files and excludes private evidence, account exports, backups
and runtime key values. The configuration Worker is unchanged and still pins
only MENEI Private Beta Test with scheduled push disabled. No GitHub push/merge,
live-app/backend mutation or database migration was performed. Publication does
not resolve the owner's pending reviews; after refresh, the owner can explicitly
keep current nutrition and acknowledge matching copies. Closing review schedules
sync. Physical-device acceptance of these actions remains pending.
