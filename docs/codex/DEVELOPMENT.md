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

Reviewed package: app source 9af8a0b7199e5b2bfd9079c83c844f9fc864b555,
Settings preview build 9af8a0b7199e. Sites source
325e7d008b6412523ac5ba0f74b26ef3a350f01b was pushed and remote-verified.
Archive: 173 files, 153100985 bytes, SHA-256
0e34d059cf597f2db7750fefedf774747d73a6da50ed08eb9e4113ee02ec08dc.
All 121 protected media/font files, the media manifest, migrations and
unrelated package members match owner-private version 15. Only client profile,
UI wording, provider instructions, the shared server profile and generated
release metadata differ. Private inputs, records, exports, backups and runtime
keys are excluded. Prior saved preview versions remain available.

Stage 13 deployed successfully as owner-only preview version 16 at
2026-10-20T14:40:26.356766+00:00, preserving runtime revision 5:
https://menei-private-beta.crispcrown515.chatgpt.site.
Saved version: appgprj_6ad593d6f15481918ded32373b877b03~appgver_2b807624dd688191aae767b0df7503a1.
Deployment: appgdep_6ad77d3bc3148191aaa5e1f0cc7e1bbf.
Native provenance matches the pushed source and 173 archive members. Fresh
access verification retains the same single owner, no groups, no extra editors
and no automations. The live GitHub app and live backend remain unchanged.
Owner acceptance remains: refresh the private preview, confirm Settings build
9af8a0b7199e, reopen the gym with Commercial selected and use Preview equipment
autofill, Add suggestions to checklist, review and Save gym. This proposes 58
unbranded common types without a new paid search, plus distinct saved/current
research items. An old research result is not rewritten to invent new brand
evidence. Named Hammer Strength models need explicit cited support in research
or manual selection; the new prompt's real-world search yield is not yet tested.

### Stage 14: common cable attachments and pulldown grips

The owner approved editable common attachment estimates and explicitly requested
close, wide and neutral lat-pulldown grips. The commercial proposal adds eleven
existing canonical attachment types to the previous 58, for 69 distinct types:
rope, D-handles, straight cable bar, EZ cable bar, V-bar, ankle strap, wide lat
bar, neutral pulldown handle, close-grip pulldown handle, straight lat bar and
close neutral row handle. Other gym-type profiles are unchanged. This list
describes equipment types rather than quantities or proof of installation.

Common attachments have their own Estimated section. Published branch claims
remain first and take precedence; separately cited wider estimates keep their
sources and labels. Attachments remain removable before Save. Adding a handle
does not infer a cable configuration, dual station, available load or physical
confirmation. The existing exercise compatibility rules still require the
matching station and grip; no exercise/image binding or alias was changed.
The common-estimate allowlist now includes the explicitly approved attachments,
while unsupported specialist hardware still requires evidence or manual entry.

No AI request is needed for the expanded common list. Provider code, search
limits, runtime revision 5, scheduled push and backend settings are unchanged.
This stage makes no paid requests, key changes, quota resets, migrations or
record mutations. Search/preview affect the draft until explicit Add and Save;
existing equipment, notes, history, backups and private evidence remain intact.

Validation: npm test passed all 37 test files on Node 24.19.0. Focused equipment
tests passed all 22 cases, including the exact close/wide/neutral grip plus
compatible station requirements, rejection of grips alone or a mismatched grip,
and no dual-cable/crossover inference from the complete commercial proposal.
All 42 focused UI cases passed: 69 proposed / 49 new / 20 existing, source
precedence, explicit Add, removal of a grip before Save, and saved/reopened
inventory with original manual limits and history preserved. Common estimates
carry no fabricated source/date/limit. npm run check passed with 26 root
JavaScript modules, 42 shell entries, 162 original catalog assets, 113 web images
and 35 paired movements. Diff/syntax and independent preservation review passed.
No live search or device/browser acceptance was performed for validation.

Reviewed package: app source 54f0404eabbc764fa278449e55a39146fb89dc1c,
Settings preview build 54f0404eabbc. Sites source
89394d04f82263be958adcf86cbb73e3857c4cd5 was pushed and remote-verified.
Archive: 173 files, 153101432 bytes, SHA-256
13f945e815a31bbd503bc6dbbae5dddf4abb589ef80a7da0a7d52d3360a92853.
All 121 protected media/font files, the media manifest, provider code,
migrations and unrelated package members match owner-private version 16.
Private inputs, records, exports, backups and runtime keys are excluded.

Stage 14 deployed successfully as owner-only preview version 17 at
2026-10-20T15:01:04.788870+00:00, preserving runtime revision 5:
https://menei-private-beta.crispcrown515.chatgpt.site.
Saved version: appgprj_6ad593d6f15481918ded32373b877b03~appgver_d0f4b038b3dc819195ea9567091e0f2f.
Deployment: appgdep_6ad78222696881919a7f2735f3b7515f.
Native provenance matches the pushed source and 173 archive members. Fresh
access verification retains the same single owner, no groups, no extra editors
and no automations. Prior preview versions, live GitHub app and live backend
remain unchanged. Owner acceptance remains: refresh the private preview,
confirm Settings build 54f0404eabbc and reopen the Commercial gym autofill.
Inspect Estimated common cable attachments, Add suggestions to checklist,
untick unavailable grips and Save gym. No new paid search is needed. Actual gym
availability and the owner's device presentation remain for owner review.

### Stage 15: session-edit generation review

The owner accepted the current gym/attachment setup and authorized the next
development stage at our discretion. This records acceptance of that gym flow,
not full beta acceptance, a physical inventory audit or image approval recovery.
Two-device sync, installed-device push and private conversation/photo evidence
remain separate outstanding items. The live app and backend remain excluded.

The next bounded stage addresses the saved 6–9-exercise requirement in Edit
session. Before changing behavior, controlled 2027-01-04 synthetic fixtures
reproduced two bypasses: Auto-generate for this gym could save a 1/6 or 5/9
lifting session with sparse equipment; Auto-generate the next 28 unlogged days
could also save incomplete strength rows, including zero-exercise days. The
main program builder already blocks these rows. The cause is the missing
equivalent validation in workouts.editSession, not the original count-test
failure or a reason to rewrite stored sessions.

The existing edit preview also refreshed only when the workout choice changed,
leaving the visible exercise list stale after gym/date changes and omitting the
shortfall notes. The intended correction makes the draft review current and
blocks newly generated incomplete automatic edits atomically before save.
Manual, routine, legacy, historical and entered short sessions remain allowed
and preserved. Existing legacy-only repair rules, generator selection, image
bindings, storage schemas, accounts and provider limits are outside this stage.

The engine now checks only newly generated automatic replacements and future
generated rows for 6–9 exercises, before any result can be returned for saving.
Raw zero-exercise strength output is checked before the existing rest/run
normalization. A structured review error identifies affected dates, gyms,
counts/targets and notes. Failure rejects the complete edit, including any
proposed date swap, conditioning change or replacement archive. The diagnostic
workout choice still returns its shortfall for review. Manual, routine, legacy
and existing saved short choices bypass the new automatic minimum.

Edit session now starts with a populated, cloned dry-run preview of the date,
gym, workout, exercise count/target and equipment notes. Gym/date/choice and
calendar-adjustment changes refresh it; future regeneration shows the next
28 days and protected-record count. Conditioning fields remain user-controlled
on gym/date/adjustment changes. Invalid previews disable Save. Submit recomputes
the engine result before confirmation, snapshot or state replacement, and a
corrected draft clears only the session's prior error. Preview itself performs
no persistence, confirmations or snapshots.

Validation: npm test passed all 39 test files on Node 24.19.0. New engine tests
passed 6/6, including controlled 5/9 and 0/7 output, atomic failed regeneration
after proposed swap/archive/conditioning changes, complete/zero-load/history
protection, compatible 6–9 automatic results and manual/routine/legacy/saved
short choices. New UI tests passed 7/7 for current inputs, shortfall/error
recovery, no preview/failed-submit writes or snapshots/confirmations, conditioning
preservation, authoritative valid Save and archival history. Existing feedback
and broad UI tests also passed. npm run check passed with 26 root JavaScript
modules, 42 shell entries, 162 original catalog assets, 113 web images and
35 paired movements. Diff/syntax and independent preservation review passed.
These are synthetic DOM/engine checks, not physical-device/browser acceptance.
No live records, backend, AI allowance, images or private evidence were changed.

Reviewed package: app source 24e7ea3957c41377fc82e7a3752a9130b1493cdf,
Settings preview build 24e7ea3957c4. Sites source
f35c4f52f8350fe45eb1ffc47ca7011508b053f3 was pushed and remote-verified.
Archive: 173 files, 153102842 bytes, SHA-256
bc303ed995e9f8983cb2b518be85b48fdb5725b46e414cec418fbaf9d78b3886.
All 121 protected media/font files, the media manifest, gym profiles, provider
and server modules, migrations and unrelated package members match owner-private
version 17. Only client app/session-edit code and generated revision/cache
metadata differ. Private inputs, records, exports, backups and runtime keys are
excluded. Prior saved preview versions remain available.

Stage 15 deployed successfully as owner-only preview version 18 at
2026-10-20T20:51:52.849097+00:00, preserving runtime revision 5:
https://menei-private-beta.crispcrown515.chatgpt.site.
Saved version: appgprj_6ad593d6f15481918ded32373b877b03~appgver_8f1dcec1849481918585cf0c29263286.
Deployment: appgdep_6ad7d45c02c081918ddd1ba7027cba90.
Native provenance matches the pushed source and 173 archive members. Fresh
access verification retains the same single owner, no groups, no extra editors
and no automations. The live GitHub app, live backend and prior saved versions
remain unchanged. Owner-device acceptance remains: refresh the private preview,
confirm Settings build 24e7ea3957c4, open Edit session on an unstarted workout
and inspect the preview while changing gym, date and calendar adjustment.
Automatic shortfalls must block Save; changing fields alone must not save.
Review manual short-workout handling and valid saves using synthetic entries.
Two-device sync, installed-device push and private evidence gaps remain pending.

### Stage 16: training-calendar display and export consistency

The owner's Next instruction authorizes another bounded private-beta stage;
phone acceptance of the prior session-edit flow has not yet been supplied.
Controlled calendar review established that paging Program from 2027-01-04
forward 28 days displayed February 1–28, while its download still exported
January 4–31. The export action ignored programOffset. The monthly station dot
was a scheduled-shift overlay, while session lists and export already used the
saved workout gym. Preserve that distinction instead of silently changing gym
recurrence or history.

Direct synthetic calendar-file checks also established inaccurate Zone 2 text
for interval runs, missing LOCATION metadata, alarms on completed/skipped
workouts, bare carriage returns in imported text and long unfolded Unicode
lines. The planned correction aligns the Program export with its visible range,
keeps other-screen exports anchored to the selected date, displays the workout
gym separately from the scheduled marker and serializes truthful gym/run/status
metadata safely. Completed/skipped events retain their date and identifier
without an alarm. No saved sessions or preferences are rewritten.

Existing floating calendar-local start times, stable valid event identifiers,
one-hour calendar blocks and 15-minute alerts for unfinished sessions remain the
export contract. Timezone conversion and scheduled push activation are outside
this stage; actual phone-calendar import remains a device acceptance check.
There are no backend, provider, key, quota, image or private-evidence changes.

Implemented the bounded correction above. Monthly cells and 28-day rows look up
the saved workout gym directly; an unresolved saved gym is shown as Unassigned
instead of borrowing the scheduled location. The station dot remains a schedule
overlay. Program shows its exact date range and exports that range; exports from
other screens retain the selected-date anchor. The calendar explains its local
clock semantics. Eight synthetic exporter tests and three DOM-contract tests
cover dates, paging, saved locations, alarms, Unicode/text safety and unchanged
workspace, legacy and backup values. These are not browser or phone-import tests.

The first full run on 2026-10-21 passed 39/41 test files. An untouched archive of
pre-stage HEAD d4bc86d0e54d044bebe4b825b44ccf043ea4f2bb reproduced both failing
files. In core.test.mjs the requested 2026-10-19 block used today's default
training rotation anchor, changing whether the protected first workout occupied
a lifting slot. The fixture now explicitly anchors training to 2026-10-19;
the existing expectation of 15 newly generated lifting days is unchanged.
Two beta-entry offline tests assumed today's original workout had exercises,
which was false on 2026-10-21. Those tests now mock local noon on the known
strength day 2026-10-19. Their edit, photo and preservation assertions remain
unchanged. Focused reruns passed 24/24 core and 30/30 beta-entry tests. No
generator, workout schedule or offline behavior changed to accommodate tests.

Final validation on Node 24.19.0: npm test passed all 41 test files (0 failures,
0 skipped); npm run check passed. An independent read-only runtime review found
no remaining material issue. The UI checks use a synthetic DOM, so phone layout
and calendar import still require owner-device acceptance. Viewing, paging and
exporting did not write workspace/legacy/backup values or make backend requests.

The sanitized private-preview package was built from app commit
bee12d760762abc9f91e639291cd69b53eef2631 and pushed only to the existing Sites
repository as 71a1505f95df4123a7da92095374b97a5f158250. Its 173 members
(157 client files) exactly match the reviewed source archive. Only app.mjs,
notifications.mjs and six preview build/version metadata files differ from
preview 18. All 121 packaged media/font assets and media-manifest.json match
the prior preview and source; all server, provider and migration bytes are
identical. No private input, runtime key, backup or account export is included.
The local 153,103,595-byte gzip archive has SHA-256
26e8e1a59d693129512b9a4a87b12a87540c08d2d2297a2af61b8f58e3afc335.
The prior preview 18 archive remains available for rollback. Source upload
alone is not evidence of successful deployment; the native receipt follows.

Private preview 19 deployment succeeded on 2026-10-21 at
12:35:54.579489 UTC. Native deployment
appgdep_6ad8b194473081919749286703c5d982 targets saved version
appgprj_6ad593d6f15481918ded32373b877b03~appgver_65c4cce3930c8191911f5311eb8cb3f9
at https://menei-private-beta.crispcrown515.chatgpt.site. The saved version
confirms the exact pushed source commit and 173 archive members. Sites stores
the uncompressed tar (155,258,880 bytes), SHA-256
385e95f5d52bdb244fea42fb82e25feaa5145cec6d10d693ca38395fe180c755;
that is a different representation from the local gzip hash above.

Fresh post-deployment access verification confirms the same custom owner-only
allowlist: one owner, no other users, editors, groups or external visitors, and
no automations. Runtime revision remains 5. No runtime settings, keys, AI quota,
scheduled push or backend configuration were changed. There was no GitHub push,
main merge, live-app deployment or Supabase mutation.

Owner acceptance: refresh through /update.html, confirm Settings build
bee12d760762, then page the Program schedule and export its displayed range.
Inspect dates, saved gym locations and run labels in the phone's calendar import
preview before adding events. Completed/skipped sessions should have no new
reminder alarm. Calendar applications may retain previously imported events;
device-specific import/update behavior has not been verified here. Prior
session-edit phone acceptance, two-device sync, installed-device push and the
private conversation/photo-evidence gaps remain pending.

Owner acceptance update: the owner reported that the exported calendar imported
successfully on the phone, then accepted the requested event date, time, gym
and reminder check. Basic phone-calendar export/import acceptance is now passed
by owner report. Calendar-client/version details and repeated-import behavior
were not independently observed. Prior session-edit phone acceptance, two-device
sync, installed-device push and private evidence reconciliation remain pending.
This status update changes documentation only; no app, data, backend or
deployment action was performed.

### Stage 17: progressive-overload recommendation guardrails

The owner authorized the next rebuild stage and explicitly requested a check
that workout recommendations follow progressive overload. Existing double
progression builds reps within the saved exercise range, then changes load by
one increment only after the required checked working/top sets reach the upper
bound with usable RIR. Strength, hypertrophy and endurance retain their own
saved set/rep/rest prescriptions; straight and superset histories stay separate.

Controlled synthetic review established these recommendation issues before
changing behavior:

- Assisted Dip at 60 lb counterweight for 6 reps in an 8–10 range recommended
  55 lb, making missed-rep work harder. More counterweight is easier. Mixed
  assisted weights also selected the largest counterweight as the hardest set.
- Preserved edit/restore/import copies could outrank the active date-keyed
  workout. A saved 100 lb copy overrode an active 40 lb workout and produced
  a 105 lb recommendation, while Progress correctly used the active record.
- Machine history separation depended on words in exercise names. Face Pull,
  Leg Extension, Pec Deck and assisted movements could inherit another gym's
  machine/cable loads despite their audited equipment requirements.
- Negative or nonfinite increments could reverse progression or produce invalid
  suggestions. Missing/null set loads could be interpreted as completed zeroes.
- Assisted warmup/ramp/backoff/drop percentage rows reduced counterweight,
  making nominal easier sets harder. There is no saved machine-force or
  historical-bodyweight model supporting such automatic percentage suggestions.

The bounded correction keeps all source history and entered set values intact.
Recommendations use active date-keyed history, validated values and increments,
equipment-aware gym boundaries and inverse assistance difficulty. Unsupported
assisted accessory-set weights remain manual with explicit guidance; Apply
suggested loads skips unavailable values. Normal loaded-exercise percentage
rules and the existing lb/kg fallback increments remain unchanged. No schema,
exercise catalog, image binding, backend, runtime key or AI-limit change is
part of this stage. Device acceptance and final validation are recorded below.

Independent review also reproduced an Apply issue: with blank weight but entered
6 reps and 0 RIR, applying a load suggestion silently changed reps to 8. A
failing UI regression established this before the fix. Apply now fills suggested
reps only when that field is empty; entered reps (including zero), RIR, checked
sets and unknown fields remain intact. Manual assistance rows are skipped rather
than saved as null loads. Assistance hold/failure explanations now explicitly
describe keeping or reducing assistance instead of ambiguously adding weight.

Focused engine verification passed 20 synthetic cases after the expanded red
baseline (13 passed / 7 failed). It checks reps-first progression across all
three training styles, effort/completion gates, lb/kg/exercise increments,
assistance direction and mixed loads, archived history, actual session editing,
legacy imports, gym/format boundaries, invalid values and manual auxiliary
assistance rows. Four initial UI integration tests passed; a fifth entered-reps
regression was then added and fixed. Full-suite validation follows below.

The following nutrition stage is supported by a separate synthetic review:
editing a saved meal currently copies the current library recipe even for a
time-only edit; archived recipes prevent keeping the saved meal; generic edits
can overbook leftover servings or change their recipe while retaining a
leftover reservation. The proposed next stage preserves saved meal snapshots
and validates leftover edits. Those nutrition paths are unchanged in Stage 17.

Final validation on Node 24.19.0: npm test passed all 43 test files (0 failures,
0 skipped), including 20 new engine cases and all five new UI integration cases;
npm run check and git diff --check passed. Existing training/superset, progress,
calendar, import/recovery and account tests remain passing. The synthetic DOM
checks verify read-only recommendation display, explicit application, retained
history/backup copies, entered zeroes, reps/RIR, checked sets and manual assisted
accessory rows. No real account, original backup or paid AI request was used.
Browser/device review of this changed guidance remains pending; no new mobile
layout, data migration, live backend or scheduling acceptance is implied.

The sanitized preview package was built from app commit
c99d549c92e1fcb85e5931f5a7377808f9882855 and pushed only to the existing Sites
repository as 3d5015e27a876fb566ec3748668d577c5c4d1ad5. The 173-member
archive (157 client files) exactly matches reviewed source. Compared with
preview 19, only app.mjs, core.mjs and six preview build/version metadata files
changed. All 121 packaged image/font assets and media-manifest.json match the
prior preview and source. All backend/provider/migration bytes are identical;
private inputs, account exports, backups and runtime keys are excluded.
The 153,104,811-byte local gzip archive has SHA-256
eaf6f82730078406e9d132385e6216b12c741722d24d02333db7e1e0d308a02e.
Preview 19's rollback archive remains intact. The native deployment receipt
and post-deployment access verification follow below.

Private preview 20 deployed successfully on 2026-10-21 at
13:15:53.899351 UTC. Deployment appgdep_6ad8bafdd9c881919f0691d7d8a89358
targets saved version
appgprj_6ad593d6f15481918ded32373b877b03~appgver_1d3b5b67c7748191bf78b764788d5bbc
at https://menei-private-beta.crispcrown515.chatgpt.site. Native saved-version
provenance confirms the exact source commit and 173 files. Sites stores the
155,258,880-byte uncompressed tar with SHA-256
25688272da05c1a1795c4c0fc10036516662c3e9416c8e28ac7d396ef3a93bbe,
which differs from the compressed local archive representation above.

Fresh post-deployment checks confirm unchanged owner-only custom access: exactly
one owner, no editors, groups, external visitors or automations. Runtime revision
remains 5. No AI attempts were spent or reset, runtime settings changed, GitHub
pushes, main merges, live-app deployments or Supabase mutations were performed.
Scheduled push remains disabled.

Owner-device review: refresh through /update.html and confirm Settings build
c99d549c92e1. Inspect Next guidance on a workout with prior checked working
sets: build reps within the saved range, hold without earned effort/completion,
then use one load increment (or less assistance) when progression is earned.
Assisted auxiliary-set weights stay manual. Applying to synthetic entries must
retain existing loads, reps/RIR and checked sets. This phone review, prior
session-edit acceptance, two-device sync and installed-device push remain
pending. The previously accepted phone-calendar check stays passed. Private
conversation/photo-evidence reconciliation remains separate and unresolved.

### Stage 18: current-workout next-set guidance

The owner explicitly requested recommendations that react to checked sets in
the current workout, rather than waiting for a later workout date. Historical
next-workout double progression remains separate and unchanged. For the latest
checked working/top set and its immediately following unfinished working/top
set, valid reps above the saved range with more than 2 RIR suggest one increment
harder; reps below the range suggest one increment easier; other valid results
hold the load. Targets stay inside the saved rep range. Missing/invalid effort
or performance values do not drive this guidance. Assistance reverses the load
direction; zero floors and available dumbbell limits still apply. Time/distance
counts and auxiliary-set prescriptions are not interpreted as rep-based load
adjustments.

The gold recommendation panel names the next set and the checked set used.
Checking a set redraws the panel; editing reps/RIR/load updates the guidance,
button and placeholders without redrawing inputs or changing their values.
Use suggestion for set N explicitly fills only that next blank load and any
blank reps. An entered load is kept for manual editing, and existing reps/RIR,
checked sets and all other future sets remain intact. Completed/skipped workouts
do not offer current-workout adjustments. No set is checked or load applied
automatically. No schema, exercise/media, backend, runtime-key or AI-limit
changes are needed. The previously proposed nutrition stage stays queued.

The pure feature tests were first red against the absent capability, then passed
after implementation. Focused DOM checks passed for all nine recommendation UI
cases, including immediate checked-set updates, reactive edits, one-set-only
application, entered-load protection and completed-workout locks. The existing
entered-zero preservation test now expects the next-set guidance from the latest
checked set instead of the earlier workout's anchor; its protected-value
assertions remain unchanged. Final full-suite results and publication receipt
follow below. Phone acceptance of this new flow remains pending.

Final validation on Node 24.19.0: npm test passed all 44 test files with no
failures or skipped files; npm run check and git diff --check passed. All nine
pure next-set cases and all nine recommendation DOM cases pass, along with
the existing 20 historical-progression checks and account/calendar/recovery
regressions. These checks use controlled synthetic data and a DOM contract
harness, not a real phone or a paid/provider/backend request.

The sanitized package was built from app commit
427b795ccbd408b70ab388e18f1ee250e0666059 and pushed only to the existing Sites
repository as 99ae129aa7914ee2c22ac27e28546a50933de4a3. Its 173 members
(157 client files) match the reviewed source byte-for-byte. Only app.mjs,
core.mjs and six preview build/version metadata files differ from preview 20.
All 121 packaged image/font assets and media-manifest.json match prior source
and preview; all backend, provider and migration files remain identical. Private
inputs, account exports, backups and runtime keys are excluded. The previous
preview archive remains intact for rollback. The 153,105,438-byte local gzip
archive has SHA-256
c62e505388ae9cebe469201d33ab6c0157006924d1df3a60449068b7b02d5787.
The native deployment receipt and fresh access verification follow below.

Private preview 21 deployed successfully on 2026-10-21 at
13:44:28.882989 UTC. Deployment appgdep_6ad8c1b098288191a51969163444d6e7
targets saved version
appgprj_6ad593d6f15481918ded32373b877b03~appgver_2c56264786c08191a7bbf8150dae07e7
at https://menei-private-beta.crispcrown515.chatgpt.site. Saved-version
provenance confirms the exact pushed commit and 173 archive members. Sites
stores the uncompressed 155,269,120-byte tar with SHA-256
9881065838a4972c2f1e6da0b194b8741b16eab2aaa27b794b63979514572dfd;
the local gzip representation has the different hash recorded above.

Fresh access verification confirms the same custom owner-only allowlist: one
owner, no other users, editors, groups, external visitors or automations.
Runtime revision stays 5. There were no runtime-setting, key, AI-budget,
backend or migration changes, GitHub pushes, main merges or live-app deployments.
Scheduled push stays disabled; all original images and record bindings remain.

Phone acceptance is pending: refresh through /update.html, confirm Settings
build 427b795ccbd4 and inspect Next set guidance after checking an actual working
set. For a 6–10 rep range, valid 11+ reps with 3+ RIR suggest one increment
harder, fewer than 6 reps suggest one easier increment, and other valid results
hold. Use suggestion for set N fills only a blank next load and blank reps.
Previously entered values must remain untouched; a checked-set reps/RIR edit
should refresh advice without moving focus or filling another set. Real phone
layout, prior session-edit acceptance, two-device sync, installed-device push
and private evidence reconciliation remain outstanding; accepted calendar
testing stays passed. No full conversation-history transfer is implied.


### Stage 19: saved meal and leftover edit protection

The owner accepted the strict above-range / more-than-2-RIR next-set rule;
that behavior remains unchanged. The next queued requirements stage protects
saved nutrition records. A controlled synthetic reproduction confirmed that a
time-only edit replaced a saved recipe with its current library copy, and generic
leftover edits could overbook reservations or retain a batch after changing recipe.

Meal editing now builds a validated draft without mutating the workspace. Keeping
the recipe retains the saved snapshot, even if its library entry was archived or
removed. The form labels that saved option explicitly. A deliberate recipe change
captures the selected current recipe and resets recipe-specific cooking checks.
Existing unknown fields, eaten state and same-recipe cooking checks remain.
Legacy meals without snapshots acquire one only on explicit save.

Leftover edits count other reservations while excluding the meal's own reservation,
reject excess servings, missing/expired batches and recipe switches, and preserve
already-consumed records. Portion bounds are validated before persistence. Successful
meal edits snapshot the workspace for recovery and roll back in-memory state on
save failure. No schema, images, workout, backend, AI budget or key changes.

Synthetic unit checks were red before the fix and pass afterward. The DOM contract
check verifies an archived saved recipe remains selectable and a time edit preserves
its ingredients/instructions, checks, recipes, workout history and legacy snapshots.
Final full-suite results, package provenance and phone acceptance follow below.

Final checks: npm test passed all 46 test files; npm run check and git diff
--check passed on Node 24.19.0. The six added controlled tests cover preserved
snapshots, deliberate switches, reservations, invalid/consumed records, legacy
meals and the meal-edit DOM flow. Actual phone rendering remains an acceptance
check; no real account/provider/backend calls were used for these tests.


Private preview 22 deployed successfully on 2026-10-21 at 14:17:32.753379 UTC
(10:17 AM America/New_York), deployment appgdep_6ad8c92301948191989d0fe4f3acda03,
saved version appgprj_6ad593d6f15481918ded32373b877b03~appgver_ed892cabe4b4819194cf6c33b9f35f22.
App commit eb3f45a4d437091b05c23738ab5fc3e59eef92a0 was built into Sites source
8537973449467e7226a492d404f02f234e1b45d9. The 173-file package (157 client)
changes only app.mjs, nutrition.mjs and six preview metadata files. All 121
protected media/font assets, media bindings, backend/provider/migration files
and workout recommendation code match preview 21. Private evidence, exports,
backups and runtime keys are excluded. Previous preview archive retained.

Local gzip: 153106072 bytes, SHA-256
a868e781c36090961fe4a34f0abe81df4fcdd774b592d0ca77dbeed2b3bb0cdd.
Native uncompressed tar: 155269120 bytes, SHA-256
c4d52f4622203e31368efe68ab9d7f75cf0718b0e96110d7869ad43fdc077b64.
Fresh native verification confirmed exact source, 173 files, successful deployment,
runtime revision 5, and custom owner-only access (one owner, zero other users,
editors, groups, external visitors or automations). No GitHub pushes, main merges,
live deployment, backend mutation, key, budget or scheduled-push changes.

Phone acceptance pending: refresh /update.html, confirm build eb3f45a4d437,
and use a synthetic meal. Edit its time after changing or archiving its library
recipe; the saved meal should retain its original recipe and cooking checks.
For a prepared batch, try an edit above available servings; it should reject
without changing the meal. Keep real history and backups intact. Prior phone
calendar acceptance stays passed; two-device sync, installed push, broader
session edits and exact private photo/conversation evidence remain outstanding.


### Stage 20: pantry and prepared-meal accounting

Owner acceptance: a meal edited on the phone appeared after refreshing the Mac.
That basic phone-to-Mac meal-edit sync passes. This does not establish concurrent
conflict recovery, every record type, saved-recipe or leftover-limit phone acceptance.

The next requirements review reproduced two stock-accounting gaps with synthetic
records: already-deducted cooking ingredients still reserved pantry stock in the
shopping list, and marking a leftover meal eaten silently clamped insufficient
inventory to zero. Shopping now excludes pantry-consumed meals. Raw pantry
consumption ignores deleted meals and prepared-leftover meals. The eaten toggle
builds a draft, validates batch availability/expiry and other reservations before
charging stock once, and rejects impossible consumption without marking eaten.
Unmarking eaten retains the existing consumption marker and does not invent stock.
The UI snapshots successful changes for recovery and rolls back in-memory values
on save failure. No migration, backend, photo, workout or AI-setting changes.

Focused unit checks were red before the fix and green afterward. UI contract
coverage checks once-only consumption and that insufficient stock produces an
error without any persisted changes. Full checks and deployment receipt follow.

Final validation: npm test passed all 48 test files; npm run check and git diff
--check passed. Five new stock unit tests and two DOM contract cases use
controlled synthetic meals/dates. No real provider, account or backend calls
were made by these tests. Actual phone pantry/leftover acceptance remains pending.


Private preview 23 deployed successfully 2026-10-21 at 22:22:24.157291 UTC
(6:22 PM America/New_York). Deployment appgdep_6ad93b1424088191a77722fdaccb39df
uses saved version
appgprj_6ad593d6f15481918ded32373b877b03~appgver_6a017b7d5874819183137da415b8b6b4
at https://menei-private-beta.crispcrown515.chatgpt.site.
App source fed250c17defa006c6360b744b04fec31f29483b built into pushed Sites
commit 676e2eb99d9630793e1096d442c79c640c136e3c. All 173 packaged members match
that reviewed source; 157 are client files. Only app.mjs, nutrition.mjs and six
preview metadata files differ from preview 22. All 121 protected media/font
assets, media bindings, workout recommendations and server/provider/migration
files remain identical. Private inputs, exports, backups and keys are excluded.
The previous preview archive is retained for rollback.

Local gzip: 153106548 bytes, SHA-256
b11965ae33b2ccfe949b0bb96a77f22bb80c3dcd4e748cd066a596e397e849e2.
Native uncompressed tar: 155269120 bytes, SHA-256
cd1df93421198ee632d3290cfa520e98ef6d70ff5ed49355eea3ecb148b581de.
Native provenance confirms exact pushed source and 173 members. Fresh access
verification confirms unchanged owner-only custom access, no other users,
editors, groups, external visitors or automations. Runtime revision remains 5.
No GitHub pushes, main merges, live app/backend deployments, schema changes,
key changes, AI requests/limit changes or scheduled-push changes occurred.

Phone review pending: refresh /update.html and confirm build fed250c17def.
Using synthetic meals, deduct cooking ingredients once and check that Shopping
does not add that cooked meal's ingredients again. With a prepared batch, mark
its assigned meal eaten and verify one deduction; unmark/re-mark should not
deduct twice. Insufficient or expired stock must leave the meal unchanged and
show a review message. Preserve real history and backups. Basic phone-to-Mac
meal-edit sync and phone-calendar import stay passed; concurrent conflict
recovery, saved-recipe/leftover phone checks, installed push and exact private
conversation/photo evidence reconciliation remain pending.


### Stage 21: generated meal-plan preservation and preview freshness

Owner reports purchasing the day's ingredients on the phone, seeing reduced
pantry quantities on the Mac after cooking, and an empty Mac shopping list for
the covered day. The phone-to-Mac purchase/pantry/shopping check passes at that
reported scope. It does not establish exact quantity auditing, double-deduction
phone acceptance, concurrent conflict recovery or every record type.

The next review found that saving a generated plan into a day containing only
removed meals replaced the day and discarded its removed records and unknown
fields. Meal previews also remained applicable after cancellation or changed
planning inputs. Controlled synthetic UI checks reproduce those preservation
and cancellation failures before the fix. This stage retains removed records
when adding a new plan, snapshots explicit saves, validates planning context
before applying a preview, and cancels pending meal drafts on close/Escape.
Existing active/eaten meals, recipes, batches, pantry and workout history stay
intact. No data migration, media, backend, key, AI or workout-rule changes.

Final checks: npm test passed all 50 test files; npm run check and git diff
--check passed. Four pure planning cases and three DOM contract cases cover
removed records, preserved active meals, canceled/stale previews, changed
targets/account/preferences/stock, recovery snapshots and unchanged batches.
Tests use controlled synthetic dates/records, without provider/backend requests.
Phone rendering and generation acceptance remain pending.


Private preview 24 deployed successfully 2026-10-21 at 22:34:39.771331 UTC
(6:34 PM America/New_York), deployment appgdep_6ad93df510508191af1b4897497354cb,
saved version appgprj_6ad593d6f15481918ded32373b877b03~appgver_f1334d376640819185726f12542ee624,
at https://menei-private-beta.crispcrown515.chatgpt.site.
App commit 238c13b6f37951ded45871cf1abcc4f92adb6a05 built into exact pushed
Sites source 1a3955728c59aee1b380a8447a40341a9e736652. All 173 members match
reviewed source byte-for-byte (157 client files). Only app.mjs, nutrition.mjs
and six preview metadata files differ from preview 23; all 121 protected assets,
media bindings, workout recommendations and server/provider/migrations match.
Private inputs, account exports, backups and runtime keys are excluded. The
previous preview archive is retained for rollback.

Local gzip: 153106793 bytes, SHA-256
bfdefe6bfacfb39527c3b4d03a5d44905a673247fe1ba4f931d1e0e036d0d702.
Native uncompressed tar: 155269120 bytes, SHA-256
3cb8abdbc07ef4d4a9763c4e9e0669d1b8097f8123965b0c89df2427efd0fb58.
Native provenance confirms exact pushed source and 173 members; fresh access
verification confirms unchanged owner-only custom audience (one owner, no other
users, groups, editors, external visitors or automations). Runtime revision 5.
No GitHub pushes, main merges, live app/backend changes, AI requests or budget,
key, schema or scheduled-push changes occurred.

Phone review pending: refresh /update.html and confirm build 238c13b6f379.
Choose an empty future date in Nutrition, generate a seven-day preview, close it
and confirm no meals were saved. Generate again and save; existing active meals
must remain intact. Removed meal records are retained in the saved workspace and
backup; the DOM/pure checks verify this preservation. A changed planning input
must require a new preview before saving. Basic phone-to-Mac meal edit and
purchase/pantry/shopping sync plus calendar import remain passed. Concurrent
conflict recovery, complete phone recipe/leftover edge cases, installed push and
exact private conversation/photo evidence reconciliation remain pending.


### Stage 22: review a backup before merging

Owner acceptance: generating and saving a new meal plan on the phone appeared
good with existing meals unchanged. Basic phone meal-plan acceptance passes.
This does not establish removed-record byte auditing, stale-input phone checks
or concurrent conflict recovery. Earlier calendar and basic cross-device meal,
purchase, pantry and shopping checks remain passed at their reported scope.

The next saved requirement is backup/recovery. File selection previously merged
after a generic confirmation. It now prepares the existing merge in memory and
shows backup format, record/set-row/meal/recipe/gym counts, source/current units
and pending conflict-review count. Counts include removed/preserved records.
Selection and Cancel do not write; Merge is explicit, checks account and exact
workspace freshness, snapshots for recovery, then applies the reviewed result.
Closing/Escape, account changes and later file selections invalidate the pending
review. Invalid files fail before persistence, and failed saves restore in-memory
state. Existing import conversion/conflict rules and original legacy bytes remain.
No live backend, schema, account authentication, image, workout or AI changes.

Final checks: npm test passed all 52 test files; npm run check and git diff
--check passed. Five new pure checks and three DOM contract checks exercise
summary/read-only review, explicit merge, recovery snapshot, legacy conversion,
zeroes/unknown fields, canceled/stale/invalid imports and preserved account
identity. The earlier short-session restoration UI check now explicitly clicks
Merge after review, retaining all its history-preservation assertions. Existing
account-switch-during-file-read checks also pass. Synthetic data only; no real
backup import, paid API or backend request. Phone review remains pending.


Private preview 25 deployed successfully 2026-10-21 at 22:47:10.843693 UTC
(6:47 PM America/New_York), deployment appgdep_6ad940e3f5188191b41e562136d0bcc7,
saved version appgprj_6ad593d6f15481918ded32373b877b03~appgver_decbd9f73bf48191b7c119792085458f,
at https://menei-private-beta.crispcrown515.chatgpt.site.
App commit 5738deee8b9690495606c06b305568d6d722d485 built into exact pushed
Sites source 7566f76a8179282a5f4e6ff6a46645a2f7d579f4. All 173 members match
reviewed source byte-for-byte (157 client files). Only app.mjs, core.mjs and six
preview metadata files differ from preview 24. All 121 protected assets, media
bindings, nutrition module and server/provider/migration files remain identical.
Private inputs, user backup exports, conversations and runtime keys are excluded.
The previous preview archive is retained for rollback.

Local gzip: 153107217 bytes, SHA-256
5469195351ce527f2524a1e26f95c6167fae3b0aca34ac69b640f7f3a7fc22ce.
Native uncompressed tar: 155269120 bytes, SHA-256
00ff53da094383de77051c4f66f37788c67d986e263ecdb8ff76a857fc21f816.
Native provenance confirms exact pushed source and 173 members; fresh access
verification confirms unchanged owner-only custom audience (one owner, no other
users, groups, editors, external visitors or automations). Runtime revision 5.
No GitHub pushes, main merges, live app/backend changes, schema changes, keys,
AI calls/limits or scheduled-push changes occurred.

Phone review pending: refresh /update.html and confirm build 5738deee8b96.
In Settings / Your data choose Import backup, select a backup, inspect the
read-only summary, then Cancel. Data should remain unchanged. Explicit merge
and recovery on the actual device remain separate acceptance checks; do not
represent the synthetic merge as an owner phone-history restore. Basic calendar,
phone-to-Mac meal/purchase/pantry/shopping and new meal-plan checks stay passed.
Concurrent conflict recovery, full recipe/leftover edge cases, installed push
and private conversation/photo evidence reconciliation remain pending.


### Stage 23: measured workout counts in logging and progress

Owner acceptance: after selecting a backup and canceling review, meals remained
and workouts appeared unchanged. The basic phone preview/cancel check passes at
that reported scope; exact full-workout comparison and real restore stay separate.

The next training/progress review reproduced that valid checked fractional seconds
and metres were discarded by the graph's whole-number reps filter. Measured
counts now retain decimals using catalog/custom/saved unit metadata. Reps remain
whole-number trend data. Logging fields for time/distance offer decimal input and
accept any positive precision, with actual units in their accessible labels;
ordinary rep inputs keep their existing whole-number presentation. Checked,
auxiliary, date, archive and incompleteness filters stay intact. No strength or
rep-volume estimate is invented for measured counts. Existing recorded values,
workout recommendation rules, schema and images are unchanged.

Three focused model cases and one logging-to-progress DOM flow were red before
the fix and pass afterward. They cover fractional measured values, custom/saved
metadata, retained exclusions, decimal field labels and read-only graph views.
Final full checks and private preview receipt follow below.

Final checks: npm test passed all 53 test files; npm run check and git diff
--check passed. All 15 progress-model cases and the new measured logging DOM
case pass. The dedicated logging flow and static check were repeated after
restricting unit labels to the known seconds/metres/reps values. No unchecked
unit text is interpolated into an input label. Checks use synthetic workouts
and controlled dates; no real account/backend/provider requests. Actual phone
decimal-keyboard/graph acceptance remains pending.


Private preview 26 deployed successfully 2026-10-21 at 22:58:53.387669 UTC
(6:58 PM America/New_York), deployment appgdep_6ad943a25830819194d8444d7b348bf6,
saved version appgprj_6ad593d6f15481918ded32373b877b03~appgver_d72889f83b208191b604b792c4919b9d,
at https://menei-private-beta.crispcrown515.chatgpt.site.
App commit 9e249e2fc692e16e72f640e3bdb04bf0e9e256a2 built into exact pushed
Sites source 85b3548826baa408319bb46c996982a53e50536a. All 173 members match
reviewed source byte-for-byte (157 client files). Only app.mjs, progress.mjs and
six preview metadata files differ from preview 25. All 121 protected media/font
assets, bindings, recommendation core, nutrition and server/provider/migrations
remain identical. Private inputs, exports, backups and runtime keys are excluded.
The previous preview archive is retained for rollback.

Local gzip: 153107241 bytes, SHA-256
943ab22096c62433731748c5ed8cede611c9d6f6f560f64465735375a4de2516.
Native uncompressed tar: 155269120 bytes, SHA-256
44d1cccc57e16250ea39cc2e909e6b6d17f3276bedd2680be50a1be9c531b838.
Native provenance confirms exact pushed source and 173 members; fresh access
verification confirms unchanged owner-only audience (one owner, no other users,
groups, editors, external visitors or automations). Runtime revision remains 5.
No GitHub pushes, main merges, live app/backend or schema changes, AI calls,
key/budget changes or scheduled-push changes occurred.

Phone acceptance pending: refresh /update.html and confirm build 9e249e2fc692.
In a synthetic test workout log a Plank with 0 added load and 30.5 seconds,
check Done, then select Plank in Explore progress. Decimal input should be
available and the graph details should retain 30.5 seconds. A measured carry
can similarly retain fractional metres. Do not rewrite original history to test.
Basic calendar, meal/purchase/pantry/shopping sync, meal-plan and backup-review
cancel checks stay passed at their reported scopes. Actual restore, concurrent
conflict recovery, recipe/leftover edge cases, installed push and exact private
conversation/photo evidence reconciliation remain pending.


### Stage 24: feedback foundation — Home, units, visibility and first-use notice

New owner feedback is tracked as derived technical requirements in
FEEDBACK_REBUILD.md, with repeated/already-implemented requests identified.
The owner selected the blocking 3-minute superset rest only after all rounds
of the exercise pair finish. That timer/audio/streak work is a later batch;
closed-app push and health-service connections remain separate integrations.
The completed maintenance candidate is retained on
`dev/generator-preservation-private-beta` at 7a7b77a; this new feedback work uses
`dev/feedback-rebuild-2026-10-21`, without modifying the live app.

The first batch fixes the refresh entry that deliberately sent startup to
#recipes. Refresh now opens Home; intentional recipe/program/library links
still work. The automatic first-run nutrition popup is removed. A read-only
session estimate near Home's top accounts for lifting sets/rest/transitions,
paired rest once, running and sauna. It is labeled as an estimate with a range,
not measured workout time. Future timing/order logging remains queued.

Backdrop opacity increases from .12 to .20 on desktop and .10 to .17 on mobile,
approximately matching the requested 3-to-5 visibility change. No image bytes,
geometry, bindings or original exercise photos change.

Settings now offers Metric / US customary. Explicit load-unit changes retain
recovery confirmation/snapshot and preserve raw imported snapshots, blanks,
zeroes and unknown set fields. Exercise increment choices are remembered per
unit instead of repeatedly converting the physical size of a weight step.
Food displays convert compatible mass/volume for cooking ingredients, pantry,
shopping and list export, while keeping stored recipe/meal quantities intact.
US fluid ounces are volume, ounces are mass; there is no mass/volume conversion
without density. Nutrition macro grams remain standard. The raw recipe editor
labels stored units to avoid silent precision changes on save.

Gym steps have separate lb/kg text fields with suggested sizes, plus an explicit
5 lb / 2.5 kg draft preset. Saved custom steps remain unchanged until edited.
The code accepts arbitrary positive values and contains no rule deliberately
choosing 5.1; the owner's exact saved-value origin is not established. The new
controls avoid ambiguous number spinners. Dumbbell limits display selected load
units while retaining the existing canonical-pound gym contract.

A first-use notice covers medical limits, injury symptoms, allergens, food safety,
AI estimates and backups. Explicit acknowledgment is saved to the profile;
Health & safety remains accessible afterward. This is informational wording,
not a promise of immunity or a reviewed legal waiver. Legal review remains a
public-release task. Existing JSON recipe upload/paste is easier to discover
from today's meals. Website/photo recipe ingestion remains separate work.

Focused pure and DOM checks pass for food dimensions, preserved load/blank/zero
conversion, per-unit increments, duration estimates, startup, notice acknowledgment
and selected-unit cooking/gym controls. Existing refresh and UI regressions pass.
Full validation, package audit and publication receipt follow below.

Final validation: npm test passed all 56 test files; npm run check and git diff
--check passed. New pure cases cover quantity dimensions, preserved unit changes,
per-unit increments and session estimates; new DOM cases cover Home/notice/time
estimate, unchanged meal quantities across systems and explicit gym controls.
Existing gym research, preservation, account, recommendation and recovery tests
remain passing. Real phone layout and system-change recovery remain acceptance
checks; tests use only controlled synthetic records.

Visual review of the existing cross-body START and FINISH confirms the owner's
report: the named pair depicts a conventional preacher finish, despite the correct
named manifest link. The owner chose palm-up/supinated grip for the correction.
The corrected START is a separate review candidate outside repository/preview;
FINISH and any image replacement must wait for START approval under PHOTOS.md.
No existing image or binding is altered by this feedback batch.


Private preview 27 deployed successfully 2026-10-21 at 23:31:06.171292 UTC
(7:31 PM America/New_York), deployment appgdep_6ad94b2f83a88191bef4efc71cc9bad8,
saved version appgprj_6ad593d6f15481918ded32373b877b03~appgver_76dce4f8d33081919fb70c0da6d366f4,
at https://menei-private-beta.crispcrown515.chatgpt.site.
Feedback app commit bfd9a064c03f6ba8097eab89643905df0772c4a8 built into exact
pushed Sites source b19ea940e230f801e3f6ace9ff0b82a1dc80dd5d. All 173 package
members match the reviewed source (157 client). Fourteen expected client files
change: app/core/nutrition/workouts/recipe-packs/styles/update-client/update plus
six build metadata files. All 121 protected media/font assets and manifest bindings
remain byte-identical, as do server/provider/migration files. Private inputs,
exports, backups, generated photo candidates and runtime keys are excluded.
The previous preview archive is retained for rollback.

Local gzip: 153109004 bytes, SHA-256
50f7e801011df49a39b1f1bdbcc8072b0a2429dcc34671661f2eeffc117295d6.
Native uncompressed tar: 155279360 bytes, SHA-256
f761971fb7f0c921175bef593cb341f2dae594dd1bd14b6dd372982142a6cb6a.
Native provenance confirms exact source and 173 members; fresh access verification
confirms unchanged owner-only audience and no other users, editors, groups,
external visitors or automations. Runtime revision stays 5. No GitHub pushes,
main merges, live app/backend changes, schema migration, runtime key/AI-budget
change or scheduled-push activation occurred. Image generation for the explicit
pose correction is separate from app AI gym-search usage and remains a candidate.

The corrected palm-up cross-body START candidate was generated outside the public
repository and preview. Its exact file identity/hash and unapproved status are
recorded privately; no FINISH was generated. Owner START approval is pending.
The existing START and FINISH remain unchanged in the app. No general image
approval or full private conversation-history transfer is implied.

Phone review pending: refresh /update.html, confirm Home opens and Settings build
bfd9a064c03f. Review the first-use notice, backdrop visibility and Home session
estimate. On a synthetic workspace, save a measurement-system change and compare
cooking/shopping displays; saved food quantities, workouts, unknown fields and raw
snapshots must remain. Review gym lb/kg steps and use the explicit draft preset
only if desired, then Save. Recipe upload/paste is reachable from meals. Legal
wording still needs professional review before public release. Remaining feedback
features are explicitly tracked in FEEDBACK_REBUILD.md, including the selected
completed-pair blocking rest behavior. Earlier maintenance candidate remains
separate and unchanged on its development branch. Actual restore, concurrent sync
recovery, phone edge cases, installed push and private evidence reconciliation
remain distinct acceptance tasks.

### Photo review deferred — 2026-10-21 (America/New_York)

Owner deferred the unresolved cross-body preacher correction and requested a later
review of all photos after repeated image/file display failures in chat. The
palm-up START candidate remains privately retained and unapproved. No FINISH was
generated; existing app images, bindings and prior approvals are unchanged. The
proposed owner-only photo review page was stopped before source edits or
publication. Preview 27 remains deployed. This deferral does not block other
feedback rebuild work.

## Stage 25 — automatic rest and completed-superset recovery

Added a pure completion transition and device-session timer controller. A newly
checked valid set in today's workout starts its prescribed rest only after the
workout save succeeds. Paired working sets wait until both exercises finish the
same round. Finishing all working sets of both exercises, including unmatched
extras, starts the owner's selected 180-second blocking rest screen. Warm-up,
ramp, back-off and drop rows keep their separate prescribed rest. Duplicate
checks, redraw, sync, unchecks, failed saves and edits to past dates do not start
timers. No recorded loads, reps, RIR or exercise structure are rewritten.

The rest tray stays visible across app tabs. Elapsed-time countdowns catch up
after sleep and same-account reload. Pair rest stays on screen at zero until Stop;
Stop is always available and Escape also stops it. The overlay blocks background
entry and ordinary app actions. Account changes pause the UI; each account's
transient timer resumes only in that account. Timer/session keys and device-local
Auto rest and Sound preferences are separate from workout data and cloud records.
The existing numeric timer-end key remains compatible with manual controls;
only scoped metadata resumes signed-in timers. Legacy history keys and raw
imported snapshots remain intact.

Sound is initially off. An explicit sound toggle enables a quiet two-tone
completion cue; AudioContext is created/resumed only from user interaction. Mute
or Stop silences active tones. Visible completion remains available without audio.
This is in-app timer audio, not closed-app push; phone/background audio delivery
still depends on browser/OS behavior. No provider call, new permission prompt,
downloaded media or backend activation is involved. The session planning estimate
now includes the final 3-minute recovery for each nonempty pair.

Synthetic controller and UI checks cover ordinary and unequal paired sets,
round/final distinction, failed saves, past-date edits, account isolation,
reload/sleep, duplicate completion suppression, blocked edits, manual Stop,
explicit audio opt-in and history preservation. Real phone audio/focus/layout and
installed/offline acceptance remain device checks. All existing artwork remains
untouched; unresolved photo review stays deferred.

### Stage 25 validation and private preview 28

The final full `npm test` run passed all 58 files with no failures or skips
(177638 ms). `npm run check` passed 27 JavaScript files, 43 shell members, 162
original image identities, 113 WebP assets and 35 existing pairs; `git diff
--check` passed. The first broad run found legacy numeric timer-key compatibility;
that was fixed without weakening its assertions. Focused regression checks and
the subsequent complete run passed. Browser rendering and real-device audio were
not verified by the DOM harness.

App source 2c40baa4a26c0c82fffb5070cbcd12452c178369 was packaged into exact
pushed Sites source f409243c2f85d7dc7cc42ab785655d64bf450ff7. The archive contains
174 files (158 client). Its only added member is rest-timers.mjs; nine expected
client/UI/build metadata files changed. All other package members are identical
to preview 27, including 121 protected media/font assets, image-manifest bindings,
server/provider code and migrations. No photo review page or candidate was added.
Private inputs, exports, backups and runtime keys are excluded.

Native private deployment appgdep_6ad95904b69481918123fb79dec4affc succeeded at
2026-10-21 20:30:11 America/New_York. Saved version 28:
appgprj_6ad593d6f15481918ded32373b877b03~appgver_778ff8caf3748191ba264fcb4b5ac384.
URL: https://menei-private-beta.crispcrown515.chatgpt.site.
Local gzip is 153113451 bytes, SHA-256
b2c394621c10e64ab27df14e38669ffa4bb592578a0903c0ab0463c025fcd6b0.
Native tar is 155289600 bytes, SHA-256
906de2918601166106cc05a7487260c82650f0bc8402af24b79a5b32975f2104.
Native provenance confirms the exact source and 174 members. A fresh access read
confirms owner-only audience (one owner; zero other users, editors, groups,
external visitors or automations). Runtime revision remains 5. No GitHub push,
main merge, live app/backend change, schema migration, key/AI-budget change or
scheduled-push activation occurred. The previous archive is retained for rollback.

Phone acceptance: open /update.html and confirm Settings preview build 2c40baa4a26c.
In a synthetic workout today, check a valid ordinary set and verify the tray;
check paired sets round by round, confirming no rest on the first member alone
and the final 3-minute screen only after the whole pair. Stop must dismiss at any
time, including after zero, without changing logged fields. Enable Sound with a
tap, verify the completion cue, mute it, and check focus/phone layout. Reload and
sleep should catch up; other app tabs should still finish rest. Closed-app sound
and scheduled push are not promised or enabled by this change.

## Stage 26 — unconditional final-pair popup and default-on audio

Owner reported the final superset rest still required a manual start and requested
automatic audio with a mute control. Inspection found the completion handler
gated every automatic rest on selectedDate === today and the ordinary Auto rest
preference. The final-pair completion now bypasses both gates: checking its last
valid unfinished working set automatically opens the 180-second blocking dialog
after a successful save, even if the workout has another scheduled date or
ordinary set/round rest is manual. There is no confirmation or start action.
Ordinary set/round timing retains its existing optional/today behavior.

Owner reconfirmed that the blocking popup belongs only AFTER ALL rounds of the
pair, not between rounds. Unmatched working sets still count toward completion.
Redraws, sync, duplicate checks and completed history do not manufacture a new
completion event. Stop remains available immediately and after the timer reaches
zero; Escape also stops it. No recorded loads, reps, RIR or structure are changed.

Timer audio is now on by default. Policy 2 enables previous unversioned default-off
preferences once; an explicit Mute saved under the new policy persists. Buttons
say Mute sound / Unmute sound, with aria-pressed representing mute. The checked
Done or manual-timer gesture automatically arms browser audio; there is no
separate enable prompt. Audio still depends on browser/OS availability and volume.
No sound is played on page load, and no closed-app push is enabled.

Regression coverage includes final completion on another scheduled date with the
old disabled/default-off preferences, automatic sound without an enable click,
explicit persistent mute, one completion cue, manual dismissal and preservation
of other dates and legacy snapshots. Real-phone playback/layout acceptance is
still separate from synthetic DOM checks. Backend, budgets and deferred photos
remain unchanged.

Stage 26 audio refinement: owner requested the same sound four times because
the single chime was too brief. The original 660/880 Hz two-tone chime, gain and
envelope are preserved. Four copies start one second apart (about 3.4 seconds
total). All eight tone voices are tracked so Mute/Stop immediately cancels the
remaining sequence. A controlled audio-clock regression verifies pitches,
spacing, four repetitions and cancellation; the UI verifies only one sequence
per timer completion.

### Stage 26 validation and private preview 29

Full `npm test` passed all 58 files with zero failures or skips (152540 ms) for
the automatic-popup/default-on-audio correction. After the subsequent four-chime
refinement, the controller/audio and UI regression files both passed (13725 ms),
and `npm run check` passed again (27 JS, 43 shell members, protected media checks).
`git diff --check` passed. No browser rendering or physical-phone playback is
claimed from these synthetic checks.

Final app source cca8bc186c879c2d51ef6f2d2e0da1f76256a7dd is in exact pushed
Sites source 715d1868d1ebc9f8def16501d1a9f58c79397218. The archive retains 174
members (158 client), adding/removing none. Eight expected client/UI/build
metadata members changed. All remaining members are byte-identical to preview 28,
including 121 protected media/font assets, image-manifest bindings and all server,
provider and migration files. No photo candidate or review page was packaged.
Private inputs, exports, backups and runtime keys remain excluded.

Native private deployment appgdep_6ad95d0dbea08191b02160131ce8e2c1 succeeded at
2026-10-21 20:47:20 America/New_York. Saved version 29:
appgprj_6ad593d6f15481918ded32373b877b03~appgver_0cacd9d26428819186da2eb86c503432.
URL: https://menei-private-beta.crispcrown515.chatgpt.site.
Local gzip: 153113727 bytes, SHA-256
0b4835f1dda4beffde571a745116ca2be51bfcc607dbfe434a99384e6939e69c.
Native tar: 155289600 bytes, SHA-256
e15975f1f5486444aa38ed24f91f14425d48feee095a8172331b1e07455c2266.
Native provenance confirms exact pushed source and 174 members. A fresh access
read confirms unchanged owner-only audience (one owner, zero other users,
editors, groups, external visitors or automations). Runtime revision stays 5.
No GitHub push, main merge, live app/backend change, schema migration, key/budget
change or scheduled-push activation occurred. Preview 28 archive is retained.

Phone acceptance: refresh /update.html and confirm Settings preview build
cca8bc186c87. In a synthetic pair, check its final unfinished working set after
all other working rounds/extras are checked. The 3-minute popup must open without
a Start or confirmation action, stay until Stop, and leave recorded values intact.
Sound is on by default; after expiry the original chime should sound four times,
one second apart. Mute/Stop must silence pending repetitions; explicit Mute must
remain muted after reload. Test phone volume/browser availability separately.

## Stage 27 — universal 60-second set rest and automatic recovery dismissal

Owner extended recovery rest to non-superset exercises, then specified 60 seconds
between every set for all workouts and automatic dismissal at zero. This newer
instruction supersedes the earlier paired-round-only rest and mandatory manual
Stop policies. Every individual checked set now starts 60 seconds, including
supersets, warm-up, ramp, working/top, back-off, drop and custom/measured sets.
The final unfinished set instead starts 180 seconds after every set of a standalone
exercise or every set of both superset exercises is done. Unequal counts and
auxiliary rows must all finish before pair recovery. Completing one paired round
does not start 3-minute recovery while other sets remain.

Completion rest blocks background entry while active, then closes automatically
and restores focus/sync scheduling at zero. Stop/Escape can end rest early. Sleep
and reload use the elapsed deadline; expired legacy completion popups do not
reopen or replay a stale chime. The four-chime sequence and remembered mute remain.
All automatic transitions still require a valid newly checked row and successful
save; readings, redraws, duplicate checks and synchronization do not start rest.
Ordinary automatic rest respects the device's Auto/Manual choice on any selected
workout date; completion recovery is automatic regardless of that preference.

Exercise labels, manual set-rest controls, generator/pair setup and Home session
estimates now follow the same 60/180 timing. Stored legacy rest values and entered
history are not rewritten; new forms display the current 60-second policy. Schema,
identities, all exercise photos/bindings, backend, budgets and scheduled push are
unchanged. This policy applies to set-based workouts; it does not invent strength
sets for standalone run or sauna completion controls.

Synthetic checks cover every set format and rep/time/distance convention, arbitrary
completion order, unequal pairs, auxiliary sets, automatic exercise/pair popup
dismissal, manual early stop, reload/sleep expiry, one audible sequence, preserved
entered fields/legacy snapshots and the matching duration estimate. Actual phone
rendering, audio and focus still need device acceptance.

### Stage 27 validation and private preview 30

Final `npm test` passed all 58 files with zero failures/skips (216552 ms).
`npm run check` passed (27 JS, 43 shell members, 162 original image identities,
113 WebP assets, 35 protected pairs); `git diff --check` passed. The first broad
run identified two UI contract updates: the old superset display assertion still
expected its saved 180-second value instead of the new 60-second active policy,
and measured single-set logging now opens recovery before another exercise.
Tests now assert the new policy and dismiss that screen before continuing, while
retaining raw metadata, decimal-value and read-only history assertions. Focused
regressions and the final complete run passed. No physical-device/browser render
or audio delivery is claimed by these checks.

App implementation 8dc92b2a51615c00cde09653614f18cc8cec580e plus UI regression
commit 74658ed2cbba0dc2d69e97d1e536c7b58f6b0121 was packaged in exact pushed
Sites source 4b5edf5c32bfc8446859667d177068a4b4258d49. The package contains
174 members (158 client), adding/removing none. Nine expected client/UI/build
members changed. All other members remain byte-identical to preview 29, including
121 protected media/font assets, image-manifest bindings, server/provider code
and migrations. Private inputs, backups, exports, runtime keys and unapproved
photo candidates remain excluded. Previous preview archives are retained.

Native private deployment appgdep_6ad96d3b612081918f7b601b9338f79b succeeded at
2026-10-21 21:56:21 America/New_York. Saved version 30:
appgprj_6ad593d6f15481918ded32373b877b03~appgver_c0e0b8a534588191a762d8674cf38d79.
URL: https://menei-private-beta.crispcrown515.chatgpt.site.
Local gzip: 153113717 bytes, SHA-256
19db90ea9777bc9bb1c596d0dc8c82bb2f351f48de8eb754a26dfedc8d86bb36.
Native tar: 155289600 bytes, SHA-256
4a53f1ce88eb10fc3e2e538cff059cda204aa4badc2a73e15abf1749498684f1.
Native provenance confirms exact source and 174 members. Fresh access verification
confirms owner-only audience: one owner and zero other users, editors, groups,
external visitors or automations. Runtime revision stays 5. No GitHub push, main
merge, live app/backend change, schema migration, key/AI-budget change or scheduled
push activation occurred. Deferred photo work remains untouched.

Phone acceptance: load /update.html and confirm Settings preview build
74658ed2cbba. In a synthetic workout, checking an unfinished individual set should
start 60 seconds. Checking the last unfinished set of an exercise or whole pair
should instead open 180-second recovery. The screen should block edits while
active, close automatically at zero, and allow Stop/Escape to end early. Verify
the four-chime cue and Mute on the phone, then confirm entered values remain.

### Owner acceptance of preview 30

Owner reported the timer change works and requested the next rebuild stage. This
records acceptance of the observed timer flow, not proof of every device/format,
background audio, account isolation or recovery scenario.

## Stage 28 — recorded training streaks, daily motivation and opening artwork

Added IP protection to the first-use legal requirements with a separate review
draft (IP_PROTECTION_REVIEW.md). It covers eligible ownership, permitted use,
copying/redistribution/reverse-engineering restrictions where enforceable,
branding and registration review, third-party rights, user data exports, valid
acceptance/versioning, and existing public-source exposure. No top-level license
file was found; this does not establish absence of other rights. Terms cannot
monopolize an app idea, undo public disclosure or guarantee no imitation. This
is requirements work, not an activated legal agreement or filing. The current
health acknowledgment was not silently repurposed as IP consent.

Home now shows current/best training-day streak and total completed training
days, with deterministic original daily motivation. The read-only counter uses
date-keyed canonical completed logs with a valid checked set (including a genuine
zero bodyweight load) or completed positive-duration run. It excludes deleted,
future and preserved/conflicting copies. Explicit saved rest days preserve the
streak without adding days. Missing known workout days break after that date;
today has grace until midnight. Unknown gaps do not invent historical rest days
or bridge a streak. Existing schedules are never regenerated to infer past effort.

Fresh completion milestones (1, 3, 7, 14, 30, 60, 100) can show a dismissible
message with the daily quote. This only follows successful explicit completion
today, is remembered per account/date outside workout data, and is not replayed
by viewing, importing or syncing older history. Details explain counting and
recovery. No additional audio or provider requests are made.

The existing emblem and globe athlete get a short opening reveal on first Home
render of each page load. Later logging/navigation redraws do not restart it.
Skip is available while it plays; reduced-motion disables it. Artwork bytes,
geometry/bindings and all exercise photos remain intact. This is a CSS reveal
of the existing artwork, not a newly articulated or regenerated character.

Inspection also found that the previous fixed 60-second generator field was
rejected by strength/hypertrophy legacy rest-range validation. The UI now accepts
the owner's 60-second policy while retaining set/rep constraints and other valid
legacy rest prescriptions. Focus summaries reflect the active policy. A preview
regression covers both modes and confirms invalid set/rep choices still fail
without plan/history writes. No recorded rest values are retroactively rewritten.

Schema, app/storage identities, raw legacy snapshots, backend, AI allowance,
runtime keys, scheduled-push state and deferred photo review remain unchanged.

### Stage 28 validation and private preview 31

Final `npm test` passed all 60 files, zero failures/skips (168432 ms).
`npm run check` passed 28 JS files, 44 shell members, 162 original image identities,
113 WebP assets and 35 protected pairs; `git diff --check` passed. New pure/UI
tests cover canonical streaks, recovery/unknown gaps, incomplete/invalid activity,
future/deleted/archived exclusions, zero loads, runs, daily-text stability,
milestones, duplicate suppression, no writes from viewing, one opening reveal
per page and valid 60-second strength/hypertrophy program previews. The first
new UI fixture used malformed legacy data and hit the existing recovery gate;
it was corrected to a valid retained legacy snapshot. No recovery assertion or
data-protection behavior was weakened. Actual phone motion/layout and acceptance
of the new streak presentation remain device checks.

App source 31953c41c9a7c4ef78ae55f1ffe374d998f394f6 was packaged in exact pushed
Sites source 492ffff789ab53d42c12688a2119e09528b7ca16. The archive has 175
members (159 client): motivation.mjs is the sole addition, eight expected
client/UI/build members change, and none are removed. All other members remain
byte-identical to preview 30, including 121 protected media/font assets, image
manifest bindings and all server/provider/migration files. No legal/IP agreement
was activated, no media candidate/review page was uploaded, and private inputs,
exports, backups and runtime keys are excluded. Prior archives are retained.

Native private deployment appgdep_6ad972f32ed88191bc548851361af5fb succeeded at
2026-10-21 22:20:49 America/New_York. Saved version 31:
appgprj_6ad593d6f15481918ded32373b877b03~appgver_6b5efd4b8d9481918f4182e7b63ea8b5.
URL: https://menei-private-beta.crispcrown515.chatgpt.site.
Local gzip: 153116989 bytes, SHA-256
d9dfafccd27af4f37a2223dff100e19c89d1696419cb860f4794d9a0f32030af.
Native tar: 155299840 bytes, SHA-256
5dc82be64fb8d14575f5409f1701af798eb8dd2336c5d5367e005bf5aa4ca57b.
Native provenance confirms exact source/175 members. A fresh access read confirms
owner-only audience: one owner, zero other users, editors, groups, external
visitors or automations. Runtime revision stays 5. No GitHub push, main merge,
live app/backend change, schema migration, source-license/access change,
key/AI-budget change or scheduled-push activation occurred.

Phone acceptance: refresh /update.html, confirm Settings preview build
31953c41c9a7, and check Home's streak/How it counts, daily quote, brief existing-art
reveal and Skip. Reduced-motion should disable the reveal. Complete a synthetic
valid workout today to check a new milestone when eligible, keeping backups and
prior records intact. A repeated unlock/re-completion of that date should not
replay the milestone. The IP review is a documented requirement/draft only and
still needs ownership/jurisdiction, licensing and professional legal review.
