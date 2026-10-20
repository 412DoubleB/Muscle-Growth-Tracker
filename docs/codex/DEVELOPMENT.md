# Development toward private beta

Branch: `dev/generator-preservation-private-beta`, based on handoff commit
`88540ef6ed83a9607f494f0184c64c879e32d21d`. Development is now authorized by
the owner. The original intake reports remain historical records. Publishing,
merging into main and changing the live backend still require separate approval.

Private originals, conversation excerpts, file identifiers and evidence stay
outside this repository. The completed intake verified 16 transport parts,
258 indexed members, 254 source originals and 225 original images. These counts
do not establish approval of every image or complete conversation coverage.

## Stage 1: generator failure

Cause established before changing the assertion:

- The original UI harness completed the real current day's workout, then built
  a fixed block starting on 2026-10-19.
- With the clock fixed at 2026-10-19 noon UTC, the original test reproduced
  `15 !== 16`. With it fixed at 2026-10-18 noon UTC, all 23 UI tests passed.
- `generateProgram` deliberately excludes protected dates from its replacement
  rows. A clean block has 16 strength days. With October 19 completed, it has
  15 new strength days and one unchanged completed workout in `logs`.
- `apply-program` also protects entered workouts. Adding a sixteenth replacement
  or overwriting that log would violate preservation requirements.

The UI harness now fixes its clock inside the block and checks 15 new rows,
16 effective strength days, no replacement row for the completed date, and deep
identity of all logs before/after saving. Engine coverage checks completed dates
on a lifting slot, a recovery slot and outside the block, plus a clean 16-day
strength count. Production lifting generation was not changed for this failure.

## Stage 2: recorded interval runs and regeneration

Requirement: optional quality running stays limited and respects recovery.
The existing generator capped quality runs generated in a single preview, but
started with an empty weekly allowance. It could add another interval run to a
week already containing a recorded interval run. A failing synthetic regression
established this before the runtime change.

The generator now reserves training weeks containing protected interval runs
before constructing replacement days. This includes records after the first
replacement date and records before a partial preview. Weeks use the existing
training-start anchor. Deleted/skipped records do not reserve a week. Easy runs
remain available. Tests verify that all existing logs remain identical.

## Stage 3: mobile first-run nutrition setup

Fresh-profile Chromium checks found horizontal overflow inside the initial
nutrition dialog at 360px and 430px. The small-screen `.grid.formGrid` rule
retained two columns despite narrow modal content. At widths up to 560px,
form grids now use one shrinkable column. This is a presentation change only;
no preference values, default targets or stored meals are rewritten.

## Requirements comparison and remaining stages

This comparison identifies existing implementation and automated evidence. It
is not owner-device acceptance or a claim that every historical idea is done.

| Area | Existing implementation / evidence | Remaining work or acceptance |
| --- | --- | --- |
| Identity and design | Existing logo, athlete, palette, offline font; release/UI/progress checks | Preserve bytes and bindings; review changed mobile flows locally |
| Catalog and equipment | `catalog.mjs`, `gyms.mjs`; core/additional/feedback tests | Automatic verified gym discovery remains requested; current lookup is curated with a research handoff |
| Programs and sessions | `core.mjs`, `training.mjs`, `workouts.mjs`, `supersets.mjs`; training/superset/UI tests | Generator count corrected in tests; recorded-quality-run gap fixed; continue actual-browser interaction coverage |
| Nutrition | `nutrition.mjs`, `recipe-packs.mjs`, `recipes.mjs`; core/additional/recipe-pack/UI tests | First-run/mobile form acceptance, real custom imports and existing meal snapshots on a test copy |
| History and backups | `upgrade.mjs`, core import/merge/store functions; upgrade/release/feedback tests | Owner-device export and separate-origin recovery comparison; never replace live data with fixtures |
| Accounts and sync | Existing `cloud.mjs`; mocked two-identity/conflict/retry tests | Real confirmation/recovery emails, offline two-device conflict recovery and account isolation acceptance; no live calls performed here |
| Notifications | Existing service-worker push/reminder logic and calendar fallback; core/update tests | Installed-device noon/closed-app delivery, permission and timezone acceptance |
| Progress | `progress.mjs`; calculation/filter/UI tests | Real-device keyboard/touch review with a private test copy; filters must remain read-only |
| Private beta access | No new hosting or deployment | Select access-controlled hosting or local-only testing; a public branch is not private hosting |
| Photo continuity | Existing assets and media manifest unchanged | Reconcile original messages to exact image hashes privately; do not regenerate or remap unresolved assets |

Next stages are browser/mobile/offline regression coverage, synthetic backup
round trips and account-boundary testing, then an access-controlled beta
candidate. External email, actual device push and live backend configuration
remain acceptance gates. A pending complete conversation export does not block
work supported by the saved requirement register.

## Validation

- `npm test`: all 12 test files passed after stages 1 and 2.
- UI harness: all 23 tests also passed with `TZ=America/New_York`.
- `npm run check`: passed (22 JavaScript files, 38 shell entries, 162 source
  image identities, 113 WebP assets, 35 pairs; reminder syntax only).
- Local Chromium 154 with a fresh synthetic profile: passed at 1440px, 430px
  and 360px. No page/dialog horizontal overflow, artwork loaded, generator
  preview/save succeeded, and 84 saved plan rows survived an offline reload
  under the controlling service worker. No uncaught JavaScript exceptions.
  External HTTPS requests were blocked throughout this browser run.
- `git diff --check`: passed.

No actual owner records, original browser storage, live backend or deployed app
were modified. No schema, storage-key, account, manifest-identity, media-binding
or release-version changes were needed.

## Stage 4: isolated owner preview

The owner authorized a private preview while retaining the live app unchanged.
`scripts/build-preview.mjs` creates a separate static package. It does not edit
`config.json`, the live PWA manifest, existing images or release metadata in the
source checkout. The separate package has:

- A clear device-only preview banner and an owner testing checklist.
- No live Supabase URL/key or VAPID key in its runtime configuration.
- Cloud client disabled before stored auth/config are read; sign-in, sync,
  cloud import and scheduled push actions are blocked and hidden in Settings.
- A same-origin connection policy as a second guard against live backend calls.
- A separate origin, preview app name and preview cache identifier. Relative PWA
  identity/scope and all original image bytes/bindings remain intact.
- Local logging, backup/import/recovery, recipes and offline functionality.

The independent owner-private Sites source checkout lives outside this GitHub
repository. Only the sanitized runtime package is published there. Private
continuity evidence, conversations, owner exports, backend files and tests are
not copied into it. The live GitHub Pages app and backend are not deployed or
modified. The hosting access control is separate from MENEI's disabled cloud
account controls; the preview is for the owner, not public beta hosting.

Validation: all 13 Node test files and static checks passed. New tests cover
ignored preexisting auth credentials, no cloud requests/timers, safe package
contents, unchanged media manifest and a synthetic backup round trip including
zero loads, unknown set fields, meals, recovery snapshots and account identity.
Local Chromium verified 1440/430/360px layouts, first-run setup, disabled cloud
forms, generator preview/save and offline reload retaining 84 plan rows, with
no JavaScript exceptions. Real email, two-device cloud sync and scheduled push
remain excluded from this preview and require separate acceptance.

### Private preview publication status — deployed

Candidate runtime source: `b4530f9ebb85e05bbd945648d771a0e0bdffce1c`.
The package contains 155 runtime files / 154,941,621 bytes: 143 unchanged
public-baseline files, four development source files and eight generated preview
files. An explicit allowlist/provenance comparison found no unexpected files,
private continuity evidence, owner records, exports or runtime configuration keys.
The package retains the original media manifest and image bytes.

The separate Sites project is deployed at
`https://menei-private-beta.crispcrown515.chatgpt.site`. Native deployment
verification succeeded. Post-deployment access verification confirmed exactly
one allowed owner/viewer, no groups, no external visitors and no additional
editors. Cloud sync and scheduled push remain disabled.

The initial upload to that project's separate source repository was blocked by automatic
approval review. The review requires explicit owner approval for this specific
hosting destination and sanitized source/assets upload. A second review after
provenance and owner-only-access verification retained that requirement. Do not
retry the upload or use another route without that approval. The owner subsequently
explicitly approved the exact 155-file sanitized package, separate repository and
private-preview destination. The authorized upload and private deployment then
succeeded. No push to GitHub main, live-backend mutation or live-app deployment
occurred.


Published Sites source commit: `dfcb6c9ee40710b610f87197679b1cbad68258fb`.
Saved preview version: 1.
Deployment: `appgdep_6ad596af80b88191b2d76ef1bb06b9e1` (succeeded).
The archive was built from that exact pushed source. No private conversations,
personal records, backups, exports or runtime keys were included. MENEI's account
controls remain disabled in this preview; Sites owner-only access protects the
site independently. Use the same owning ChatGPT account to open the test link.

## Owner preview review — October 19, 2026

The owner completed the device-only testing checklist and reported no issues.
This records owner review of the existing private preview, including the local
workflows covered by that checklist. It does not establish acceptance of the
excluded cloud features.

Remaining acceptance: cloud sign-in and recovery emails, two-device sync and
conflict recovery, and installed-device scheduled push. These require an
isolated test backend and dedicated test accounts before enabling them in the
preview. The current preview remains device-local. This review does not authorize
changes to the live Supabase project, GitHub main, or the live app.

## Stage 5: isolated cloud preparation

The owner selected the Muscle Growth Tracker organization, approved the quoted
$0/month project, and approved the reviewed creation-only migration specifically
for MENEI Private Beta Test (`bhyrrxrpqaxiwpfxnwpa`). Setup and fifteen rollback-only
SQL checks passed on that project; no synthetic users or data remain. Both
advisors returned no findings. See `ISOLATED_BACKEND.md` for the exact SQL source,
target guardrails and outstanding Auth/device steps. The live project was not
changed, and preview cloud sync and scheduled push remain disabled.

Local client hardening now rejects stale account responses after signout,
account switches and pending token refreshes; old results cannot write another
workspace or sync base. The guest-import prompt is limited to an actual guest
workspace, protecting account A's history when signing into empty account B.
Synthetic regressions cover both account isolation and genuine guest consent.

Stage 5 verification: all 16 local Node test files passed; static checks and
`git diff --check` passed. These source changes are local to the development
branch and have not been deployed to the private preview or live app. Real Auth
email/redirect acceptance and two-device HTTP sync remain pending the test-only
configuration and dedicated accounts described in `ISOLATED_BACKEND.md`.


## Stage 6: owner-private test-cloud client

The preview builder now supports a separately pinned test-cloud mode. The Sites
Worker reads the test publishable key from native runtime secrets and provides
same-origin owner-authenticated configuration; the key is absent from the source
and archive. Test account controls are visible while project/key editing,
original-cloud imports and scheduled push remain blocked. Existing live/generic
credential keys are preserved. Matching saved test workspaces remain available
when configuration cannot load, with network paused until reconnect/reload.

Review also reproduced and fixed a first-sync preservation issue: consented guest
workouts could be hidden by the remote-first account load. A real client-flow
regression now verifies both the guest and pre-existing remote workout in the
merged account/commit, with original guest records and snapshots retained.

Stage 6 checks: all 18 Node test files, static validation and diff whitespace
checks passed. Synthetic browser QA passed at 1440, 430 and 360 pixels, including
account controls, unchanged artwork, 84-day program/save, service worker/offline
reload and retained test account/session data. No external HTTPS requests were
made during browser QA. Actual test-backend HTTP checks were blocked by the
session network proxy, so they are not counted as passed. Real email callbacks,
password recovery, two-device sync/conflicts and device push remain pending.
No live app/backend or existing images/history were changed.


Stage 6 publication: owner-private preview version 2 deployed successfully at the
same Sites URL, using only MENEI Private Beta Test. Native post-deployment access
verification still shows one allowed owner, no groups/external viewers/additional
editors. Runtime environment revision 1 supplies the test public client key outside
the archive. See `ISOLATED_BACKEND.md` for source/archive provenance, the retained
version-1 rollback and the hosted HTTP verification limit. No GitHub push/merge,
live-app deployment or live-backend change was performed.

## Stage 7: gym setup and exercise-library context

The owner approved continued frontend rebuilding while deferring physical
two-device acceptance. The requested gym setup searches the exact location,
uses published equipment when available, supplements it with editable common
gym-type estimates, and permits correcting missing or wrong equipment. Estimates
are authorized starting suggestions; they are not published facts or image
approvals. The live app/backend, existing images and history remain protected.

Exercise-library cards and guides now use the library's selected gym rather than
the current workout's gym. Every gym shows requirements without an invented
inventory check. Workout guides keep their recorded gym. Browsing is read-only.

Gym setup now previews published-directory equipment and optional gym-type
estimates before adding them to the editable checklist. Existing selections,
custom apparatus, notes and limits are preserved. Published dumbbell limits need
an explicit opt-in; templates never invent a maximum. Nothing is saved before
Save gym. Saving snapshots the prior workspace and rolls back an unsuccessful
storage write. Source evidence, unselected published items and estimates remain
distinct. Changing location invalidates current source attribution; an unrelated
notes edit preserves equipment confirmation when the inventory and limits match.

Live AI lookup is not active. The current source-backed directory still contains
only two researched locations; the estimated templates are local suggestions.
The client has a bounded, same-origin research interface with stale-response
guards, but no enabled server provider or AI credential has been provisioned.
The preview truthfully disables its AI-search control. An OpenAI Developers
connection was suggested for supported secure API setup; suggestion is not
installation, connection, billing approval or a successful real search.

Before activation, implement and validate the owner-private server endpoint,
source/citation checks, request limits and error handling, then complete the
provider's required key/cost approval. Store any API credential only in Sites
runtime secrets. Send only the gym name/location/address, never account records,
workouts, exports or backups. Confirm the exact returned address and operating
status before adding its equipment. A paid request, live-backend change or public
deployment is not authorized merely by this frontend stage.

Stage 7 validation: all 26 Node test files passed, including 11 pure gym-autofill
regressions, six DOM-backed gym setup cases and three library-context cases.
Static checks and diff checks passed. Native Chromium at 360 and 430 pixels
verified 12 estimated commercial-gym suggestions, no workspace saves before
Save gym, manual removal/addition, preserved notes and load limits, provenance
after reload, read-only library browsing and unchanged image bindings. Synthetic
completed workouts, zero loads, old gyms and backup entries remained unchanged.
No external HTTPS requests or JavaScript errors occurred.

Native form validation exposed an existing increment-input constraint that
rejected both 5 and 2.5 lb: `min=0.1` offset its half-pound step grid. The field
now accepts positive decimal increments without changing stored values. New
dialog content also resets its scroll position so an exercise guide opens at
its heading and equipment explanation. The latter presentation adjustment was
verified with the focused UI suites and a native browser follow-up.

Stage 7 published successfully as owner-private **version 7**, environment
revision 1, at the same private preview URL. Post-deployment access remains one
owner and no groups, external viewers or additional editors.

- App source: `0412295d505b5c816513af65c61f19260d1ee259`.
- Sites source: `d36b461795ffa9da86baf0dbcdec8ccadda0e1f3`.
- Saved version: `appgprj_6ad593d6f15481918ded32373b877b03~appgver_72d3f34f5bac8191a6cbe41fdcb0aca5`.
- Deployment: `appgdep_6ad687eb44948191b340332d4d22c98e` (succeeded).
- Archive: 157 files, 153,068,060 bytes, SHA-256
  `426b4c352f622d8365a2d84945afb313227befa8752dfce5a5607a041540a22a`.

The package has 154 client files; all 121 shipped image/font hashes and the media
manifest match source. Private evidence, conversations, account records, exports,
backups and runtime key values are excluded. The Worker and runtime configuration
are unchanged: only the isolated test backend is allowed, scheduled push stays
disabled, and no live AI provider/API calls are enabled. OpenAI Developers was
still not installed at the final connection check. Real live-AI research and
physical-device acceptance of this new gym flow remain pending. No GitHub
push/merge, live-app deployment or live-backend mutation occurred. Version 6
remains saved for rollback.

## Stage 8: prepared AI gym-search connection

The owner completed secure OpenAI key creation in a separate working coding
session after this older thread's Platform connection continued to reject
requests. This supersedes stage 7's historical installation status: OpenAI
Developers is installed, and the owner reported one key securely saved to the
other session's ignored `.env.local`. No key or full conversation was transferred
to this workspace. No paid request or runtime configuration change followed.

Prepared a disabled-by-default owner-private server endpoint, source validation,
fixed safe errors and a durable five-attempt trial counter. Client readiness,
citations, duplicate prevention and stale-draft protection are wired and tested.
The generated additive preview-only counter migration and activation/cost review
are in `AI_GYM_RESEARCH.md`. Existing app records, images, bindings and live
services remain protected.

The full 30-file Node test suite and static checks passed. Subsequent focused
checks also passed after read-only readiness diagnostics and multiple-search
response rejection were added. Native Chromium at 360/430 pixels passed the
synthetic AI review/apply/save, quota and stale-result checks with no external
HTTPS requests. Hosted D1 injection, secure runtime binding and real provider
acceptance remain unverified. The deployed private preview stays version 7;
activation requires separate approval of the five-attempt costs and new
preview-only accounting resource. Nothing was pushed, deployed or activated.

### Stage 8 activation approval and disabled publication

The owner subsequently approved the reviewed five-attempt OpenAI trial,
estimated costs and additive preview-only counter. That approval remains valid;
do not ask for it again merely because setup crosses coding sessions. The hard
limit is five outbound attempts, not a fixed dollar cap. Failed or timed-out
attempts count. No credit purchase or change to either Supabase project is
authorized by this approval.

The sanitized package was pushed only to the separate Sites source repository
and deployed as owner-private **version 8**, with AI still disabled:

- App source: `4b4639dd0efdd51ed6c723fd28ba6e30994cc9c5`.
- Sites source: `c2f2332d6c1aadc88fb8d8e973981739e6a4e1b2`.
- Saved version: `appgprj_6ad593d6f15481918ded32373b877b03~appgver_86f774946c0081919de2324e1d9e964e`.
- Deployment: `appgdep_6ad6a5f89a788191940e8f0f3285914c` (succeeded).
- Runtime revision: 1; the existing test public client key is preserved, with no
  OpenAI runtime key or enable flag added by this session.
- Archive: 164 files, 153,078,564 bytes; SHA-256
  `41803649d6073701d2fb5e4655c9617cd98ae23824f28687fc623086d3cdb287`.
- Audience verified after publication: exactly one owner, no groups or external
  viewers. Version 7 and its prior archive remain available for rollback.

All 121 protected image/font hashes and the media manifest remain unchanged.
The package excludes private records, conversations, exports, backups, local env
files and runtime key values. The native publication succeeded with the logical
`GYM_AI_LIMITS` binding and generated migration metadata; an application-level
storage read has **not** yet been verified. A scoped service-status request from
this execution session failed at transport without an HTTP response. An owner
browser check of `/api/gym-research-status` is pending; it performs no model
request or quota initialization.

The key is still in the other working coding session's ignored `.env.local`.
This session cannot access that workspace, and its native runtime setter has no
file-import parameter. No supported automatic file-to-runtime handoff has been
verified. Do not print the key to work around this limit, attach it to a chat,
create a duplicate key, infer installation from the presence of a local file,
or set the enable flag before actual storage/key readiness. No paid AI request
has run. The first real search needs the owner's legitimate signed-in browser;
the shared service diagnostic does not supply visitor identity for paid POSTs.

The GitHub app, GitHub main and both Supabase projects remain unchanged.

## Stage 9: first-come twenty-account beta preparation

The owner approved expanding the separate Sites beta to the first twenty
signed-in ChatGPT accounts, including the owner, with five AI attempts each and
one hundred total including earlier owner usage. This supersedes the prior
owner-only audience requirement only after enforced admission is verified.

The Worker now gates protected assets, config, diagnostics and research on
durable membership. A same-origin POST claims a slot; GETs do not enroll. The
owner bootstraps first while native access is still owner-only, and a permanent
database latch prevents another owner claim. Public admission will serve only a
minimal join/full page to nonmembers. Unknown phases and missing or partially
migrated storage fail closed. The old trial row, spent usage and original
migration remain intact; an additive migration provides campaign, membership
and append-only attempt tables with atomic SQLite triggers and a shared lease.

Account transitions now discard unfinished UI drafts and reject delayed
backup, recipe and photo completions from an earlier account. A changed
ChatGPT browser fingerprint blocks startup before workspace reads or backup
exports. Cross-tab logout invalidates only in-memory cloud credentials. The
service worker bypasses auth, admission and API routes. Saved records,
workspaces, exports, image files/bindings, schema and existing storage/PWA
identities are preserved. Testers should use separate browser profiles; the
fingerprint guard does not encrypt or revoke offline copies.

The sanitized builder excludes the obsolete beta-report.html and adds current
admission, cloud-account and template-review instructions. It still omits live
config, private conversations, evidence, backups, exports and runtime keys.

Validation passed: all 33 Node test files, npm run check and diff checks;
thirteen focused real-SQLite accounting tests, five Worker integration groups,
fourteen account UI regressions, and native Chromium at 360/430 pixels covering
owner enrollment, account-context blocking, retained workspace restoration and
the twenty-first-account full message. No external or paid requests were made
by browser QA. Hosted D1, real provider acceptance, email/reset delivery and
actual two-account cloud isolation remain acceptance gaps. See
BETA_ENROLLMENT.md for the precise admission boundary and activation sequence.

Runtime revision 2 prepares owner bootstrap and explicitly disables AI. It
preserves the existing test public key. No OpenAI secret was installed and no
audience was widened. The existing key remains in the separate working session;
the supported secure handoff is still unresolved. A publication receipt follows
after the reviewed source and package are deployed.

## Stage 10: MENEI-only sign-in clarification

The owner clarified that testers must not need a ChatGPT account, another AI
account or an extra download. This supersedes stage 9's identity choice. The
private version 9 publication completed with source a150e31b33d305a54f894d95ae0b2411728564e8,
saved version appgprj_6ad593d6f15481918ded32373b877b03~appgver_2aeb5b587ad08191a4238cb374865100,
deployment appgdep_6ad6bcfd62688191a229724bd4b6831e and runtime revision 2.
It remained owner-only with AI disabled; no public enrollment was opened.

The revised flow uses only MENEI test-account sign-in. A server helper checks
each token with the fixed test Supabase Auth endpoint and returns only the
verified account ID. It rejects anonymous/unconfirmed, expired and wrong-project
identities and never trusts Sites headers, caller IDs or editable user metadata.
The existing durable membership and accounting schema stays immutable; member
keys are now explicitly namespaced to MENEI IDs. No backend schema or saved
Supabase record is changed by this authentication integration.

Public static code and publishable client configuration enable the MENEI sign-in
screen. Private workspace loads, cloud sync and AI services require admission;
the app gates before reading saved workspaces. New accounts can create/confirm
their MENEI account and recover a password in the app. Signing in enrolls the
first twenty confirmed accounts. The AI button researches a location inside
MENEI and sends only the gym identity; it never asks a tester for an API key or
redirects them to another AI account. The normal GitHub app flow is unchanged.

The owner-side runtime key handoff and hosted storage checks remain pending;
this clarification does not authorize exposing secrets or resetting history.
The live app, GitHub main, live Supabase project and scheduled push stay outside
this work. See BETA_ENROLLMENT.md for the current scope and activation boundary.

Stage 10 combined validation passed all 35 Node test files, npm run check and
diff checks. The entry suite has thirty regressions, Auth eleven and Worker
seven integration groups. Independent review verified the fixed Auth endpoint,
prior-Sites-owner fail-closed transition, durable quotas, account separation and
offline network gating. Native Chromium at 360/430 pixels passed MENEI-only
sign-in, integrated synthetic AI search, full-cohort denial, retained guest
bytes, member return without a new slot/allowance, offline /beta reload with
cached media manifest and reconnect revalidation. All cloud/provider responses
were mocked; there were no external or paid requests.

Previously admitted accounts can continue local workouts offline using a
project/account/campaign-bound device receipt. No token refresh, model request
or cloud synchronization runs offline. Reconnect pauses old sync listeners until
configuration, Auth and membership are reverified. Explicit online denials
remove only that operational receipt, preserving saved workspaces. Cached media
metadata preserves the existing image references. The test-cloud service worker
allows /beta app-shell offline fallback while still bypassing all Auth/API
requests; the root app's existing route behavior is retained. New beta Settings
uses sign-out to switch accounts rather than silently invalidating admission
through an old sign-in/create-account action.

No migration SQL, journal or existing owner-trial accounting changed in stage
10. No Supabase mutation, image change, history reset, GitHub push or audience
change was performed. The reviewed MENEI-only build is ready for an owner-only
publication using runtime revision 2 (bootstrap, AI disabled).

### Stage 10 publication receipt

The MENEI-only setup build was deployed successfully as **version 10** at
https://menei-private-beta.crispcrown515.chatgpt.site with runtime revision 2.
Native access was reread after publication: custom audience, owner only, one
allowed user, no groups or additional editors. The audience was not widened.

- App source: 85fd9396a61056fbd42dd5639da4ecc37c77265d.
- Separate Sites source: 7cbb380b86609643bb65844580a666b1665bca8c, pushed and
  independently matched to its remote branch before saving.
- Saved version: appgprj_6ad593d6f15481918ded32373b877b03~appgver_3d4983e9b79881918fbe16cb3d6711c3.
- Deployment: appgdep_6ad6c26bb55881919c70e4a6d3a8886c (succeeded).
- Archive: 169 files / 153089671 bytes, SHA-256
  c48f3a757bfe72479b669664ac7b6d8a2fbac67adba4f563ad6d63148961ac0d.
- Client: 155 files; all 121 protected image/font assets and the media manifest
  matched source hashes. Private records, conversation evidence, backups, exports,
  live config, runtime keys and the obsolete report were excluded.

The server key is still absent from this runtime and AI remains explicitly off.
The owner must open the revised preview and sign into their existing MENEI test
account to validate actual Auth, hosted storage and owner bootstrap. Deployment
tools have no legitimate app-user session to do that for them. Actual two-account
cloud isolation, email/reset delivery and a real provider lookup remain unverified.
Only after owner readiness is confirmed may first-come MENEI admission open;
normal testers will not need ChatGPT accounts. There was no paid request,
Supabase mutation, GitHub push, merge, live deployment or image/history change.

### Stage 10 follow-up: signup message

The MENEI beta entry now describes a successful signup request without claiming
that a confirmation email was delivered. A successful response without a session
can also occur for an existing account. The entry gives conditional inbox/spam
guidance and directs existing users to sign in or reset their password. Its header
also reports only that the request was received. The response remains generic;
the app does not infer or disclose whether an email has an account.

The existing synthetic signup/reset UI check covers both the entry and header
messages and confirms no saved workspace is read. It passed, along with the full
beta-entry UI file before the header adjustment, syntax and diff checks. No Auth
configuration, email sending, authentication behavior, storage, images or backend
records changed. Actual password-reset email delivery still needs user testing.

The wording fix deployed successfully as owner-only preview **version 11** with
runtime revision 2; AI remains disabled and no runtime setting changed.
App source: c03904b58ba2de1c753b7743a2c47e5107e5de60.
Separate Sites source: 5555c27f765b6f4658b97338197cdb0591f5b416 (remote verified).
Saved version: appgprj_6ad593d6f15481918ded32373b877b03~appgver_21754d8fe14481918a9c5d113ece165b.
Deployment: appgdep_6ad6c54700fc8191a74f4b256fca6dcb (succeeded).
Archive: 169 files, 153089789 bytes, SHA-256
71ae73b6b8b3258264f98c172c9f786ff0f5d2301f163f28c4692cf1f5ec8c27.
Only the reviewed app message and five generated revision/cache metadata files
differ from version 10; all 121 protected media/font assets remain identical.

### Stage 10 follow-up: hosted account verification

The hosted admission request returned HTTP 503 before enrollment. Server Auth
verification used `redirect: 'error'`, which Cloudflare Workers rejects before
sending a request. The [current Workers Request documentation](https://developers.cloudflare.com/workers/runtime-apis/request/#parameters)
requires `manual` mode and explicit rejection of redirect responses instead.
The synthetic Auth regression reproduced the failure before the fix.

Both server Auth verification and the gym provider adapter now use manual
redirect handling. Their existing non-2xx checks reject all tested redirect
statuses without a second request or forwarding credentials to another origin.
The fixed Auth endpoint, confirmation checks, timeouts, body limits and generic
errors remain enforced. Browser fetch behavior is unchanged. AI remains off.

Validation: all 11 Auth checks, 8 Worker integration groups, the provider test
file, 2 preview-config checks, syntax and diff checks passed. A new integration
uses the real Auth validator with synthetic upstream responses and SQLite
membership storage to verify owner admission without bypassing authentication.
No actual account was created or enrolled by these tests, no email was sent, and
there was no paid provider call. Hosted admission still requires the owner's
retry. No schema, data, runtime settings, images or live backend changed.

The fix deployed successfully as owner-only preview **version 12**, runtime
revision 2. App source: 14afa49b821af3b6978649c77a27d849ae735d4e.
Separate Sites source: be4564b3b0fff17b422629e547581ab57c69b113 (remote verified).
Saved version: appgprj_6ad593d6f15481918ded32373b877b03~appgver_25f282205cb081919edd9e15f4d32af0.
Deployment: appgdep_6ad6c7e7c020819199b1cfe4094b5419 (succeeded).
Archive: 169 files, 153089810 bytes, SHA-256
df33498bc6e9573536832c3636117ea35fdef7d2256cd3b09a0f0f5d8020398b.
Only two server adapters and five generated revision/cache metadata files
changed from version 11; all 121 protected media/font assets remain identical.
Native access remains custom, one allowed owner, no groups or extra editors.
The development environment could not reach the owner-private readiness URL,
so real hosted account admission remains pending the owner's browser retry.

### Owner acceptance and AI runtime activation

The owner subsequently completed password recovery and reopened the app. Hosted
MENEI owner admission was verified. The provider key originally saved in another
session could not be transferred using the available native tools. The owner
explicitly approved a replacement and manually saved it directly in Sites as
the OPENAI_API_KEY secret. Native runtime revision 4 confirmed that masked entry
alongside the unchanged test-cloud secret and private bootstrap settings.

Read-only hosted checks found one matching MENEI owner/campaign, closed bootstrap,
no member attempts, and zero original-trial usage before activation. No seats,
history or budget counters were reset. The only tool-written runtime change
was MENEI_GYM_AI_ENABLED from false to true, producing revision 5. Native access
was verified as one allowed owner, no groups and no extra editors before and
after deployment. No schedule was created.

Existing saved version 12 was redeployed without a source upload or new version:
appgprj_6ad593d6f15481918ded32373b877b03~appgver_25f282205cb081919edd9e15f4d32af0.
Deployment appgdep_6ad6d55d155c8191a41096e90d0b5c01 succeeded with runtime revision
5 at https://menei-private-beta.crispcrown515.chatgpt.site.

The tested app/Worker code, schemas, media, history and five-per-account/
one-hundred-total accounting are unchanged, so no source test rerun was needed.
No paid request was made by the tools; the owner's next real lookup is the
remaining provider acceptance check and consumes an attempt. Secret metadata
and successful deployment do not verify the secret's value, model permissions
or billing. The original key remains untouched. No GitHub push, merge, live
app/backend deployment, private evidence upload or audience expansion occurred.

### Stage 10 follow-up: gym identity comparison and safe diagnostics

An exact street address can differ from its published spelling through standard
abbreviations. The server's former token-by-token filter rejected E/East,
St/Street and PA/Pennsylvania variants even when the candidate named the same
location. The client review helper repeated this comparison. Controlled,
fictional provider responses reproduce the rejection independently of billing,
network access or a user's account.

The shared comparison now handles bounded US street, direction, state, dotted
initial and ZIP-extension variants. It checks city and house number separately,
rejects conflicting units, cities, directions and requested branch words, and
keeps unfamiliar formats conservative. It does not rewrite saved queries,
location signatures, candidate IDs, evidence or gym inventories. The new module
is included in both the Worker artifact and offline shell. Existing equipment,
manual items, notes and load limits survive explicit preview/apply in synthetic
integration tests. Source citations and operating-status safeguards remain.

A separate hosted request returned HTTP 502. Its raw response was not retained,
so the abbreviation bug is not claimed as the cause of that failure. Provider
failures now log only a fixed event, an allowlisted category and an optional
numeric HTTP status. No query, account, key, header or provider body is logged.
Reporting failure cannot delay the response or lease release. Public messages
avoid blaming the address for an invalid response; an empty successful search
is described separately. The beta search button keeps its intended label after
completion. No automatic retry, extra tool call or budget change was added.

Validation: all 37 test files passed with Node 24.19.0. npm run check passed
(25 root JavaScript modules, 41 shell entries, 162 original catalog assets,
113 web images and 35 paired movements). Focused tests cover both matching
callers, wrong-location rejection, draft preservation, diagnostic redaction,
upstream failures, durable quotas and the built Worker. This investigation made
no paid request and reset no allowance. Actual provider-result acceptance still
requires the owner's browser; two-device sync, full conversation export and
exact photo approval-to-file evidence remain pending. No image, history,
schema, runtime setting, Supabase data or live-app change was made.

Initial publication was blocked by the hosting service. App source commit
9650b54622b1ec5d2306b70aa298d7e97d4a945a was built into separate Sites source
e04e83e4659d8e34438637f91f184813229597e9; the pushed remote HEAD was verified.
The reviewed archive has 171 files, 153097377 bytes and SHA-256
a5a3351bbfa8d8ffe9782586de5d49ad927ae57606205fd0984f4ae202ce1891.
Both copies of the shared helper are present. All 121 protected image/font
files, the media manifest, migrations and every unrelated archive member match
version 12. Private evidence, records and runtime keys are excluded.

The native owner-private save/deploy call returned an internal error, then a
timeout on one retry of the same unchanged archive. Saved-version reconciliation
after each failure found no new version or deployment; latest remains version
12 at its existing source and deployment. The supported Git-triggered private
publication option was also checked and returned publish_on_push_accepted=false,
so no automatic publication is assumed. Fresh access inspection still shows one
allowed owner, no groups and no extra editors. Do not spend another AI attempt
to test the fix until a new saved version has deployed successfully. Resume with
the verified Sites source/archive after hosting recovery, reconcile saved
versions first, and retain version 12 as rollback. No additional source tests
are needed unless code or build inputs change.

The hosting blocker cleared on a later retry of the same verified source and
unchanged archive. Owner-only preview version 13 deployed successfully at
2026-10-20T13:34:16.176432+00:00 with runtime revision 5:
https://menei-private-beta.crispcrown515.chatgpt.site.
Saved version: appgprj_6ad593d6f15481918ded32373b877b03~appgver_7025eb26152081918fe069700c940cf5.
Deployment: appgdep_6ad76dcd45648191aa6ba6faa6b3df3c.
Native saved-version provenance matches Sites source
e04e83e4659d8e34438637f91f184813229597e9 and all 171 archive members. Fresh
access verification confirmed one allowed owner, no groups, no extra editors
and no automations. Version 12 remains available for rollback. There was no
code/build input change or test rerun, paid request, counter reset, runtime
setting change, Supabase mutation, GitHub push or live-app deployment. The
owner's next lookup is the remaining provider-result acceptance check.

### Stage 11: published-first equipment and broader research estimates

The owner reported that the real location search worked, but its equipment list
was sparse. They requested branch-supported items first, followed by annotated
estimates from a wider gym search. The provider now uses the same single search
for branch facts and broader chain/type context. Its separate estimatedEquipment
field has up to twelve canonical items, each with an actual returned source,
an explanation and a checked date. Status and wider-web provenance are fixed on
the server. Estimates cannot carry max/unit fields. The optional setup suggestion
also requires a cited source and explanation. Generic facility claims cannot
establish a specific machine, attachment or cable configuration.

The candidate and preview show published branch items first, cited wider-source
estimates second and generic gym-type estimates separately. Published facts win
duplicates; wider-source estimates replace generic suggestions without promoting
them to branch facts. An explicit candidate choice can fill Custom with the
suggested type, while a selected non-Custom type stays selected. The commercial
profile now offers 23 common suggestions. Generic fallback items are not labeled
as web-researched. Checklist badges retain broader estimates' sources and reasons
through saving. Preview/add/save remain separate; manual inventory, notes,
increments, confirmation rules, source history and weight limits are preserved.
Only an explicitly accepted, published branch dumbbell limit can change dbMax.

New fields stay separate from the old published list, so cached older clients
can still display published results. The server parser accepts the exact legacy
shape or the complete new shape; partial/unknown shapes fail closed. Shared
profiles are included in the client, Worker and offline shell. Candidate IDs,
location signatures, image bindings and storage identities are unchanged.

Validation: all 37 test files and npm run check passed on Node 24.19.0, with
26 root JavaScript modules and 42 shell entries. Synthetic tests cover cited
specialist estimates versus generic inference, missing/unsafe sources, guessed
limits, publication precedence, setup choice, editable removal, preserved saved
records, legacy compatibility, closed/wrong locations, one request/search and
the built Worker. Static checks retain 162 original catalog assets, 113 web
images and 35 paired movements. Independent review found no material issue.
There was no paid request, extra search, budget reset, model/output-limit
increase, schema/runtime change, backend mutation or image/history replacement.
Real acceptance of a broader result remains with the owner after publication;
the existing common-profile preview is available without another AI attempt.

Stage 11 deployed successfully as owner-only preview version 14 at
2026-10-20T13:51:11.777749+00:00, preserving runtime revision 5:
https://menei-private-beta.crispcrown515.chatgpt.site.
App source: 49c2a5b7c1d56df1fb526b99d679ccf64f57e87f.
Sites source: 864ab5b2c2b30ac76bb043d6fc4cec21c9f1d6ef (remote verified).
Saved version: appgprj_6ad593d6f15481918ded32373b877b03~appgver_84b3636897988191a855b4f5a04497c9.
Deployment: appgdep_6ad771c522e881918f8409471186c1ed.
Archive: 173 files, 153099449 bytes, SHA-256
cbf6d78f10411caaef4809765c94084044f3770fecc0ec0988dcd4971f3ba424.
Native provenance matches the pushed source and archive member count. Fresh
access verification retains one allowed owner, no groups, no extra editors and
no automations. All 121 protected media/font files, the media manifest,
migrations and unrelated package members match version 13. No records, private
evidence, exports, backups or runtime keys were included. Source version 8.1.1
and prior saved versions remain intact; no live app/backend change occurred.

### Stage 12: equipment counts and retained draft research

The owner reported fewer than ten items after adding suggestions, with Commercial
gym selected. Synthetic reproduction of the current Commercial profile yields
23 distinct common types and selects them in the editable checklist. The exact
phone state is not available, so neither a particular cached build nor a null
setup recommendation is claimed as the cause of that report.

Two separate issues were established: the preview described only new additions,
which can be fewer than ten when many items are already selected, and changing
the gym type before Add could discard a newly chosen research result. The
review now distinguishes total proposed types, new additions and already
selected types. The post-Add message reports the actual selected checklist count
and the need to Save gym. Candidate guidance points to the combined preview.
Fresh selected research remains in a guarded draft context through type/notes/
equipment edits and repreview, without another search. Location, form or account
changes invalidate that context. No research is applied or saved implicitly.

Private preview HTML now carries the source revision for a matching Settings
build label. This distinguishes preview updates while preserving displayed app
version 8.1.1, PWA identity, storage and release contracts. It does not claim a
phone has loaded the newest build merely because native deployment succeeded.

Validation: npm test passed all 37 test files on Node 24.19.0. The final focused
gym UI rerun passed all 40 cases, including 23 proposed / 3 new / 20 existing,
Save/reopen, retained published and broader-search evidence without another
mocked request, and invalidation after identity changes, successful/failed new
searches and reopening. npm run check passed with 26 root JavaScript modules,
42 shell entries, 162 original catalog assets, 113 web images and 35 paired
movements. Syntax, diff and independent preservation review passed. There were
no paid requests, quota resets, provider changes, migrations or runtime-setting
changes. The owner's exact phone result remains unconfirmed and needs the new
visible counts/build identifier for acceptance; no cache cause is inferred.

Reviewed preview package: app source 9c48b6120115f3edf465aea3ccdf4a17cf4e5ae2,
Settings preview build 9c48b6120115. Sites source
50ec8f32792463210280e0428dd892ea35487f88 was pushed and remote-verified.
Archive: 173 files, 153099892 bytes, SHA-256
1900b67ee43354dd44c3afeb392c70bfb18c237f657e118ba0a69c17a397820d.
All 121 protected media/font files, the media manifest, server modules,
migrations and unrelated package members match owner-private version 14. No
private inputs, account records, exports, backups or runtime keys are packaged.

Stage 12 deployed successfully as owner-only preview version 15 at
2026-10-20T14:17:27.556657+00:00, preserving runtime revision 5:
https://menei-private-beta.crispcrown515.chatgpt.site.
Saved version: appgprj_6ad593d6f15481918ded32373b877b03~appgver_5d337258a3b88191aa1a454e4e106043.
Deployment: appgdep_6ad777d6fa7481918988c5d61f9ec5c9.
Native provenance matches the pushed source and all 173 archive members. Fresh
access verification retains the same single owner, no groups, no extra editors
and no automations. Existing saved versions remain available. The live GitHub
app and live backend remain unchanged; this release makes no record mutations.
Owner acceptance remains: refresh the private preview, inspect Settings build
9c48b6120115, then reopen the gym with Commercial selected and use Preview
equipment autofill, Add suggestions to checklist and Save gym. This free path
requires no new AI search. Record the proposed and selected counts if the
under-ten result persists; neither native publication nor synthetic testing
proves what the owner's phone has loaded or the exact earlier phone cause.

### Stage 13: fuller commercial equipment proposals

After accepting the count correction, the owner requested a fuller commercial
inventory proposal with named machines such as Hammer Strength where research
supports them. The commercial common-setup profile now offers 58 distinct
canonical, unbranded equipment types, preserving the previous 23 and adding
press/row variants, leg and hip machines, calves, core, benches and functional
basics. Other gym-type profiles remain unchanged. These are editable estimates,
not a claim that every type is installed at the selected branch. Brands,
attachments, uncommon specialist configurations and load limits are not inferred
from this generic profile. The proposal count is equipment types, not quantities.

The research prompt prioritizes specifically sourced missing machine variants
within its existing twelve wider-estimate slots. Hammer Strength requires an
explicitly supported brand plus movement/model; a general brand mention does
not expand into every model. Branch-specific support stays Published, chain or
broader gym-type support stays Estimated, and unsourced variants stay unknown.
The UI explains the difference between unbranded common suggestions and sourced
brand/variant suggestions. Search and preview remain drafts; explicit Add and
Save are still required. Existing inventory, manual selections, notes, limits,
history, image files/bindings and backups are not replaced.

The existing runtime key and revision 5 are retained. The one-request,
one-web-search, 2500-output-token, twelve-estimate and timeout limits are
unchanged. No paid request, key creation, quota reset, backend mutation or
runtime-setting change is part of this stage. Live search quality and the exact
gym's installed models still require source/device review; synthetic tests do
not establish a real branch inventory or guarantee complete web results.

Validation: npm test passed all 37 test files on Node 24.19.0. All 41 focused
gym UI cases passed, including 58 proposed / 38 new / 20 already selected,
explicit Add/Save/reopen, separate published and broader-estimated Hammer
Strength variants, no sibling model expansion, no inferred limits and preserved
manual selections, notes and history. Focused profile/provider tests passed;
canonical coverage, unchanged smaller profiles, missing sources, legacy response
compatibility, published precedence and request budgets remain covered. npm run
check passed with 26 root JavaScript modules, 42 shell entries, 162 original
catalog assets, 113 web images and 35 paired movements. Diff/syntax and an
independent preservation review passed. Browser/device acceptance and real
search accuracy remain unverified; no paid search was performed for validation.
