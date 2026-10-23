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

## Stage 29 — visible fitness opening and daily motivation

The owner requested a noticeable 3.5–5-second fitness motion, with MENEI
transitioning to M and a visible daily quote. The old 1.6-second reveal was tied
to the first Home render and could disappear on immediate redraw. This change
uses a separate 4.5-second opening dialog, with a stylized globe-holding squat
made from two clipped render layers of the original image. The upper body moves
down/up while the leg region compresses/extends; this is CSS artwork animation,
not newly generated articulated character footage. MENEI contracts/crossfades
into the exact original M/wreath. All source artwork bytes/bindings are retained.

The dialog waits for its artwork, survives incidental Home redraws, automatically
closes after 4.5 seconds, and has Skip/Escape and an explicit Replay control.
A load-error/timeout fallback avoids blocking the app. Elapsed launch scenes
close on resume; reduced-motion users bypass launch. First-use safety notice
acknowledgment precedes launch, and an active recovery timer is not covered.
Daily motivation is a separately labeled prominent card above Home's hero,
remaining available after launch. No history/storage/schema, server/provider,
AI budget, legal acknowledgment or notification behavior changes.

Validation: npm test passed all 60 files (162638 ms); npm run check passed
28 JavaScript modules, 44 shell members, 162 originals, 113 WebP images and
35 protected pairs. Focused opening/streak tests cover image readiness, 4.5-second
auto-close, redraw continuity, no automatic replay, explicit replay/skip, reduced
motion, image failure/load timeout, elapsed background scenes and unchanged
records. git diff --check passed. No browser automation is available in this
managed environment. Phone visual acceptance of the stylized motion remains
pending; DOM tests are not browser animation QA. Publication receipt follows.

Private preview 32 publication: app source
4e8d2325753205eb851edd2748e6c5643b7c7866, exact pushed Sites source
66f97e3fda9bcf1ad0b816692ea19122f7906abb. Eight expected client/build members
changed versus preview 31, no members added/removed (175 total, 159 client).
All other members are byte-identical, including 121 protected media/font assets,
media bindings, all server/provider/migration files and runtime configuration.
Package audit excludes private inputs, credentials, exports and backups.
Previous preview archives retained. Gzip 153118905 bytes, SHA-256
938bd5ef6d751ec7381555be2d8b6f23982db85f1766750cec25c3dc70ece68e.
Native tar 155310080 bytes, 175 files, SHA-256
1d4aed78f896279855b56c6b3cc05b628ac8684ab0358bf262c69d4982dd5916.

Saved version:
appgprj_6ad593d6f15481918ded32373b877b03~appgver_e363ff6ed6fc8191a49cc06d6545e790.
Deployment appgdep_6ad976e7c3ac8191991707f2a1c3e3b7 succeeded at
2026-10-21 22:37:37 America/New_York; runtime revision remains 5.
URL https://menei-private-beta.crispcrown515.chatgpt.site.
Fresh provenance confirms source/count; fresh access read confirms one owner,
zero other users/editors/groups/external visitors/automations. No sharing,
GitHub push/main merge, live app/backend, AI key/budget, scheduled push or schema
change. Source credentials were cleared from orchestration storage.

Owner device check: open /update.html, confirm build 4e8d23257532, then Home.
Observe the 4.5-second globe squat and MENEI-to-M transition, or use Replay
opening on Home; quote should remain in Daily motivation above the hero.
Skip/Escape should close early, and reduced-motion should bypass animation.
Visual acceptance of the CSS motion is pending on the owner's device.

## Stage 30 — wall-ball toss/catch and closing wreath wordmark

Owner refinement: replace the opening globe squat with a squat-to-wall-ball toss,
catch in the exact original pose, then end. Preserve the MENEI lettering style;
start with wreath branches flanking the word and close them inward as the word
vanishes, leaving the original M/wreath. The 4.5-second launch, quote, automatic
close, Skip/Escape, Replay and reduced-motion behavior remain.

A supplemental transparent 1536x1024 PNG atlas contains a matching gold throwing
pose in the left half and a free globe in the right half. It was generated from
the existing mascot for this explicitly requested opening animation. This is
not an exercise-photo replacement or an inferred approval of deferred photos.
Existing mascot and logo bytes/bindings stay unchanged; the exact original
mascot catches/settles and holds for the last 0.9 seconds. The atlas is loaded
only by launch markup and included in the offline shell. Temporary SVG viewports
show its throw pose and globe separately. A stylized flight/rebound and brief
wall target cue accompany squat/drive/catch transitions. This is layered CSS
animation, not continuous generated video or a fully articulated 3D character.

The logo uses clipped render layers of the original emblem: branches start
outside MENEI, move inward during the word fade, and align with the original
central M. Both mascot art files must load before starting the animation clock;
replays own their callbacks so late image events from a skipped run cannot
prematurely start a replacement run. Failed/missing art still closes safely.
New atlas PNG SHA-256 and publication/validation receipt follow below.

Validation: all 60 npm test files passed (165920 ms), focused opening/streak tests
passed, and npm run check passed (28 JavaScript modules, 45 offline shell files,
162 original images, 113 WebP files, 35 protected exercise pairs). Focused UI
checks now require both original and supplemental artwork before playing, check
both wreath layers and throw/ball markup, and verify stale image callbacks cannot
start a replay. Existing read-only history, skip/replay, automatic-close, reduced
motion and fallback tests pass. git diff --check passed. Atlas dimensions/alpha
and the generated artwork were inspected; no browser automation is available, so
actual movement/layout acceptance still requires the owner's phone.
Atlas PNG SHA-256:
b75a01146848b5d5ea5bd36aeeb4c134cc8ae8fbed1543e04ede361558949629.

Private preview 33: app source c6198c8281d45d04e338ee3d1fda8a6a6d9b2908,
exact pushed Sites source 5dd04d6050822bbe63e2ce1549fe622dbd2b5568.
The atlas is the only added member; eight expected client/build members changed,
none removed (176 total, 160 client). All other members remain byte-identical to
preview 32, including 121 protected media/font assets, media bindings and every
server/provider/migration member. No private inputs, keys, exports or backups
included. Prior archives retained. Gzip: 155078261 bytes, SHA-256
1aa94794cd93e3ec1cabfac458ff649a52f72f27ba4d39f16e63ab868fc589b7.
Native tar: 157286400 bytes, 176 files, SHA-256
408ef5664802558d549c36109517d8363bdcfb66d1bf1018ce2c33fb527100e6.

Saved version:
appgprj_6ad593d6f15481918ded32373b877b03~appgver_ce9c28096dac8191b6c62498db66fe73.
Deployment appgdep_6ad97aae8e808191814939eb1998da79 succeeded at
2026-10-21 22:53:46 America/New_York, runtime revision 5 unchanged.
URL https://menei-private-beta.crispcrown515.chatgpt.site.
Fresh native provenance confirms exact source/count. Fresh audience read confirms
one owner, no other users/editors/groups/external visitors/automations. Source
credentials cleared from orchestration storage. No GitHub push/main merge,
sharing/live app/backend/schema, AI key/budget or scheduled-push changes.

Owner device acceptance: /update.html then Home (build c6198c8281d4); Replay
opening shows the sequence again. Check squat/throw/rebound/catch, exact original
pose for the last 0.9 seconds, MENEI flanked by wreath branches that close around
the final M, unchanged visible daily motivation, Skip/Escape and reduced motion.
Motion/phone layout acceptance remains pending; no browser QA was claimed.


## Stage 31 — continuous hands and contact during wall-ball motion

The owner rejected preview 33: hands vanished/reappeared during opacity switches
and the ball did not meet the catching hands. Replace its pose crossfades with a
continuous 2D sculptural rig. One opaque forearm/palm sprite per arm and one
single globe persist for the full sequence; no pose opacity switch is used.
The new supplemental atlas was generated specifically for skeletal rendering,
with central body, upper arms, forearms/hands and a free globe. Original assets,
the preview-33 atlas and all exercise-photo bindings remain unchanged.

wall-ball.mjs solves two-link elbow positions with constant bone lengths. Held
ball/palm targets share one coordinate model. Ballistic flight has a wall rebound;
Hermite carry/follow-through/receiving paths match positions and velocities at
release and catch, then lower the ball into the initial chest-held stance.
The same figure persists and holds for the last 0.9 seconds, without fading back
to another bitmap. Home still shows the exact original mascot after the opening
closes. The body dip keeps the feet planted; this remains illustrated 2D motion,
not a 3D simulation or generated video. Elbow blend caps hide cut texture ends.

requestAnimationFrame updates joint/ball transforms only; frame callbacks cancel
on Skip, expiry, image failure, or reduced-motion change. Artwork readiness and
stale-replay callback protections remain. The MENEI lettering/wreath animation,
daily quote, legal acknowledgment, workouts, history, runtime/server/provider,
AI budget and notification behavior are unchanged.

Native Inkscape SVG exports were inspected for held, release, airborne and catch
poses. This is static render QA of the actual SVG geometry, not browser QA or a
claim of owner acceptance. Initial render inspection caught atlas-cell leakage;
explicit cell/globe masks fixed it. A trial of clipped knee articulation had
visible seam artifacts and was excluded; the continuous planted-foot body dip
remains. No protected asset was edited. Browser automation remains unavailable.
Atlas SHA-256: be266a21f1d0559206ab2d4defc2fc041bb27dc5fcada8c394593be803a39c23.
Validation/publication receipt follows.

Validation: all 61 npm test files passed (155785 ms). npm run check passed:
29 JavaScript modules, 47 offline shell files, 162 originals, 113 WebP files and
35 protected exercise pairs. New geometric tests sample the full motion every
5 ms: upper/forearm bone lengths remain fixed; held palms share the ball's
contact model; release/catch positions and velocities are continuous; the ball
clears receiving hands during flight; final pose returns to the starting stance.
A strict settled-endpoint check caught floating-point residual dip, corrected to
an exact zero after settlement. UI checks advance an animation frame, confirm
arm transforms change without history writes, and verify frame cancellation on
close alongside existing loading/replay/Skip/reduced-motion checks. Diff check
passed. Phone/browser motion acceptance remains pending.

Private preview 34 publication: app source
2b46fcc72014b275f75f7c73367b83af0c7ff1b1, exact pushed Sites source
640223a7694072fdf03b9efe414bc361f87ece2e. Two new members (rig PNG and
wall-ball.mjs), eight expected client/build changes, none removed: 178 files,
162 client. All other members remain byte-identical to preview 33, including
122 retained media/font assets (the original assets plus the preview-33 atlas),
image bindings and all server/provider/migration files. No runtime keys, private
inputs, exports or backups are included; previous archives retained.
Gzip: 157144420 bytes, SHA-256
76c797ff0d9584ca15b50ff010e997bc0b23131f3314cd9b9018f5817871e93a.
Native tar: 159365120 bytes, 178 files, SHA-256
f8c58d01269e92f7275a5f163a98a7485dc803fe88c6813e27f2f33f4735e1da.

Saved version:
appgprj_6ad593d6f15481918ded32373b877b03~appgver_3baa111da82c81918c81682ea9de515f.
Deployment appgdep_6ad9805051788191a8ebb1558f6fdf30 succeeded at
2026-10-21 23:17:48 America/New_York; runtime revision remains 5.
URL https://menei-private-beta.crispcrown515.chatgpt.site.
Fresh native provenance confirms source/count; fresh access read confirms one
owner, no other users/editors/groups/external visitors/automations. An expired
source Git token was refreshed using the same Site credential workflow before
successful push; no extra version/deployment was created by that push failure.
Source credentials cleared from orchestration storage. No GitHub push/main
merge, audience/live app/backend/schema, AI key/budget or scheduled-push change.

Owner device check: /update.html, then Home, build 2b46fcc72014. Replay opening:
check continuous visible arms/palms, globe release/separation/rebound and receiving
hands, lowering into chest-held stance, and existing quote/MENEI/wreath sequence.
Skip/Escape and reduced motion should remain effective. This is a 2D illustrated
rig; static render/geometric tests do not establish phone animation acceptance.


## Stage 32 — hand proportions, views and wrist articulation

The owner rejected preview 34's hand anatomy. Its front-facing cupped palms were
built into the forearm sprites and rotated rigidly with the arm. New supplemental
art provides a right near hand in dorsal/three-quarter view and an opposite left
far hand in side/back view, referenced to the original mascot grip. Individual
hands have four fingers and a thumb with natural tapered proportions; the image
and assembled poses were visually inspected, not auto-certified as anatomically
correct. No canonical image or previous atlas was rewritten.

The old palm regions are excluded by forearm render masks. Separate upper arm,
forearm, wrist and hand links keep the wrist neutral instead of rotating the
entire old forearm/palm drawing. A smooth elbow-plane projection allows the near
arm to rise without flipping the hand backward. Model segment lengths are 225
upper arm, 195 forearm and 60 wrist-to-grip; projection preserves 3D link lengths
without claiming to be a complete 3D character renderer. Hand textures use
independent wrist-to-grip anchors. Near grip moves onto the globe face, and the
far forearm/hand renders behind the globe, matching natural occlusion rather
than showing an outward-facing palm through the ball.

Native Inkscape exports of the actual SVG were inspected at hold, intermediate
lift, release, flight and catch. Hand proportions and grip orientation were
compared with the original mascot. This is static pose inspection, not browser
playback or owner acceptance. The existing 4.5-second timing, ball trajectory,
MENEI/wreath, daily quote and Skip/Escape/Replay/reduced-motion behavior remain.
Launch now waits for the separate hand image too. Bone-length, neutral-wrist,
contact, release/catch continuity and depth-order checks cover the new geometry.
No workout/history/profile/schema, provider, AI-budget or notification changes.

Hand asset: transparent RGBA, 1774x887. SHA-256:
6affc31ca3943d75e2fd648505356b20c51db5af898f4b1adf9e11fadf891f22.
Validation and publication receipt follows.

Validation: all 61 test files passed (158586 ms), npm run check passed (29 JS
modules, 48 offline shell files, 162 originals, 113 WebP assets, 35 protected
pairs), and git diff --check passed. Updated geometry tests check upper arm,
forearm and wrist-to-grip link lengths in model coordinates, neutral wrist/hand
alignment, contact, release/catch continuity and far-hand/globe/near-hand depth
order. The UI suite passed again after strengthening the guard that waits for
the separate hand image before starting. These checks establish geometry and
loading behavior; visual anatomy and motion acceptance remain owner checks.

During artwork loading the rig stays hidden until all images are ready, avoiding
a brief partial figure with unloaded hands. Quote, wordmark and Skip remain
available. This adds only a CSS readiness guard; checked loading/class-state
behavior is unchanged.

Private preview 35: app source b5f5d72ddefb9ecaf7dcf9dbafae6eafed4c28b8
(including hand geometry/art commit 2fbb9620ccb0bdfd5b95185e0a002308f0ff6fc8),
exact pushed Sites source 6e776b8a3591507046da3a312b76b03a52047256.
One new hand PNG, nine expected client/build member changes, no removals:
179 total files, 163 client. All other members are byte-identical to preview 34,
including 123 retained media/font assets, the media manifest and all
server/provider/migration members. No keys, personal inputs, exports or backups
included; previous archives retained. Gzip: 158378304 bytes, SHA-256
a4faff792ea68f90686578c59ebe1dcf2a91bfe6a62f768e1e10ebde4b9516a7.
Native tar: 160634880 bytes, 179 files, SHA-256
2239b7283b8ca915ad8b197b3e33e9fde6a956ca12e1af91a75d681020491a56.

Saved version:
appgprj_6ad593d6f15481918ded32373b877b03~appgver_be6089264a8c8191824528b94cf247db.
Deployment appgdep_6ad986937cac8191b728f1d8f9d856cf succeeded at
2026-10-21 23:44:33 America/New_York; runtime revision 5 unchanged.
URL https://menei-private-beta.crispcrown515.chatgpt.site.
Fresh provenance confirms source/count; fresh audience read confirms one owner,
zero other users/editors/groups/external visitors/automations. Credentials were
cleared from orchestration storage. No GitHub push/main merge, sharing/live
app/backend/schema, AI key/budget or scheduled-push change.

Owner check: /update.html then Home (build b5f5d72ddefb); Replay opening. Inspect
near dorsal hand, far hand behind the sphere, wrist connection and grip during
lift/release/catch. First-use image loading should show no partial rig. Quote,
MENEI/wreath, Skip/Escape and reduced motion remain. This is still a 2D
illustration; rendered poses and numeric checks do not establish final anatomy
or phone-motion acceptance.


## Preview 35 provisional acceptance and next feedback item

The owner approved the opening animation and hand correction for now. Further
visual refinement can be revisited later. This acceptance applies only to the
opening; the cross-body preacher illustration and broader exercise-photo review
remain unresolved/deferred. No image bytes or bindings changed for this step.

Next: manual superset pairing guidance. Any two eligible unstarted exercises may
be chosen, including non-neighboring exercises. Muscle-overlap and compound-lift
cautions are advisory; lower-overlap alternatives come only from eligible,
unpaired exercises already in the workout. Metadata is heuristic, not a claim
that a pairing is optimal for a person. No extra AI/provider requests. The draft
updates without saving; only Save changes the pair. Entered sets and the other
member of a started pair remain protected. Timer policy stays 60 seconds between
sets and 3 minutes only after every set of the pair.

Validation: all 62 test files passed (172026 ms); npm run check passed (29 JS
modules, 48 offline shell entries, 162 original media identities, 113 WebP
assets, 35 protected pairs), and git diff --check passed. The new UI contract
checks cover live draft guidance, disabled duplicate selections, alternative
selection without writes, intentional shared-muscle pairing, protected recorded
partners, preserved zero loads/unknown set fields and retained conflict/legacy
copies. Existing rest-timer and progression checks pass. No browser/phone visual
QA is claimed for this pairing screen; that remains the next owner check.

Private preview 36: app source 5644bad995cec654c10ebc8d2a6b2605881fe685;
exact pushed Sites source 94148da678defdc26bb4f50e72770285df25fe4d.
Eight expected client/build changes, no additions or removals; 179 packaged files,
163 client. All 124 retained media/font assets, media-manifest bindings and all
server/provider/migration members are byte-identical to preview 35. No keys,
personal records, exports or backups included. Previous archives retained.
Uploaded gzip: 158380672 bytes, SHA-256
20b44880ef67656fd3c01a17d4f66bf7611f164f1c0b75a19a93f478fed280db.
Local Git tar: 160645120 bytes, SHA-256
b7027de31584c267fc80c43031abf048cbccd6c84e3ca5fa8ad2bd4a2237feae.
Saved-version archive reports 179 files, 160634880 bytes, SHA-256
8e498904e63128ad9ce3eaa6eba2ad43095c68aa022e98dfa4dd1496515314e8;
its source provenance matches the exact pushed Sites commit above. Local Git tar
and native stored archive hashes are recorded separately.

Saved version:
appgprj_6ad593d6f15481918ded32373b877b03~appgver_ca94a62a9e908191b8b69791ac99307b.
Deployment appgdep_6ad9ec1e8fd0819183dc9d4a947a274d succeeded at
2026-10-22 06:57:44 America/New_York; runtime revision 5 unchanged.
URL https://menei-private-beta.crispcrown515.chatgpt.site.
Fresh audience read: owner-only custom access, one owner, zero other users,
editors, groups, external visitors or automations. Source credentials cleared
from orchestration storage. No public GitHub push/main merge, live app/backend,
sharing, schema, AI key/budget or scheduled-push change.

Owner check: /update.html, Home → Supersets (build 5644bad995ce). Choose a pair
with overlapping main muscles, preview an alternative, or keep the intentional
pair and Save. Viewing/changing draft choices should not change the workout;
recorded exercises and their paired partners should be unavailable. Exercise
order, entered values and the accepted rest policy remain intact.

## Same-day lifting and running program options

Owner confirmed preview 36 works. Next requested behavior: change the program
on the day of the workout while no gym entries have been added. Implementation
uses today onward as the stated default; the date picker still supports choosing
another start date. Settings previously used whichever date was last viewed.
It now opens the options with today's local date and provides a Start today
shortcut. The form and review explain whether the first day can update or must
remain protected. Saving a new program starting today opens its updated workout
on Home, making the result immediately visible.

No arbitrary date lock was removed: generation already allowed an unstarted day.
The new controls make that path explicit. Any saved load (including zero), reps,
RIR (including zero), or checked set protects the day. Existing protection for
completed/skipped workouts, completed runs and sauna stays intact. Entered plan
records now receive the same protection as logs during preview and at Save,
including an entry added after preview. Preview uses a cloned scratch workspace;
changes are applied only by Save, with the existing recovery snapshot. Historical
logs, conflicting copies, meals, pantry, recipes and unrelated planned days stay
preserved. No schema, asset, backend, AI-budget or push change.

Validation: all 64 test files passed (184702 ms). npm run check passed: 29 JS
modules, 48 offline shell entries, 162 original identities, 113 WebP assets and
35 protected pairs. git diff --check and packaged module syntax checks passed.
Focused UI checks cover Settings after browsing a future date, Start today with
no writes, read-only preview, today's new sets/reps/running options on Home,
zero-load/RIR protection, entered plan rows and an entry added after preview.
Past logs, retained copies, future recorded sessions, unrelated plans, meals,
recipes, pantry and raw legacy storage remain equal in synthetic checks. No
browser/phone visual QA is claimed for this new screen behavior.

Private preview 37: app source 04f84400ba77f7d8332160560a72439c9777d9e9;
exact pushed Sites source 740b232a1857b4378d84a673dd00b96e9537a752.
Eight expected client/build changes, no additions/removals; 179 packaged files,
163 client. All 124 retained media/font assets, media-manifest bindings and
server/provider/migration members are identical to preview 36. No private
records, exports, backups or keys included. Previous archives retained.
Uploaded gzip: 158381710 bytes, SHA-256
7b9826a60e120ef0c96f3df41cb7a614457c6974f8cd9fba5737a9253c42cf91.
Local Git tar: 160645120 bytes, SHA-256
b7da0b712f7b419fd1e0f0e82e8b9884c54586ea8bdf59dfa74c2254fed0a30a.
Saved-version archive: 179 files, 160645120 bytes, SHA-256
f3d1e211657d7985b5af7fa641df9520ddcb337a1427ecd722498ea7d7430abf.
Local and native archive hashes are recorded separately; fresh source provenance
matches the exact pushed commit above.

Saved version:
appgprj_6ad593d6f15481918ded32373b877b03~appgver_7e9958ed72d481918642a825bd798afa.
Deployment appgdep_6ad9f3f354908191a0547f6183fba4e1 succeeded at
2026-10-22 07:31:19 America/New_York; runtime revision 5 unchanged.
URL https://menei-private-beta.crispcrown515.chatgpt.site.
Fresh audience read: one owner; zero other users, editors, groups, external
visitors or automations. Source credentials cleared from orchestration storage.
No public GitHub push/main merge, live app/backend, sharing, schema, AI-key/budget
or scheduled-push change.

Owner check: /update.html, Settings → Edit lifting & running options → Start today
(build 04f84400ba77). With no gym entries, preview and Save program + update today
should show the revised workout on Home. With load, reps, RIR or a checked set,
the review should explain that the day stays protected while future unstarted
workouts take the new options. Preserve completed conditioning too.

## Recovery snapshot storage quota fix

Owner reported a browser Storage.setItem quota failure on the account-scoped
MGT_BETA_SNAPSHOTS key while saving a program. A full recovery copy could exceed
localStorage even after the existing three-copy retention reduced to one copy.
Recovery snapshots now use lossless UTF-16 compression, with a versioned envelope,
uncompressed length and checksum. Existing JSON-array recovery keys remain
readable and only compact when a new snapshot is requested. Unknown fields,
Unicode, zero values, original snapshots and other account keys are preserved.
Main workspace JSON, schema 8, raw legacy keys and cloud wire format are unchanged.
No records or other account keys are cleared to make room. Unreadable recovery
copies fail closed without overwriting the saved value. Existing retention remains
at most three recovery copies; pressure may reduce it to the latest full copy.

Bundled lz-string 1.5.0 (MIT, pieroxy) provides the lossless codec. The pinned
registry source hash and ESM-only footer adaptation are recorded in vendor/README.md;
the full license ships beside the module. No runtime provider/dependency download.
Offline shell and isolated preview builder include the codec. Recovery browsing
and JSON export decode both old and compressed formats; exports stay ordinary
complete workspace JSON. Tests read decoded contents rather than assuming an
internal recovery-key representation.

Program Save now builds a candidate workspace, writes it successfully, and only
then closes the preview or clears its draft. A failed snapshot or primary write
keeps the prior state and draft available for retry. The review has an Export
backup action; errors explain the save failure instead of exposing raw setItem
messages. Storage errors do not silently skip the recovery copy.

Synthetic 5 MiB quota tests reproduce the rejected uncompressed full-state copy,
then verify compressed recovery creation and a subsequent program save. A UI test
exports the compressed recovery through the app and compares the complete JSON to
the prior workspace, including large retained originals and unknown fields.
Additional failures cover snapshot and primary writes, unchanged durable state,
no false completion, and retrying the same open draft. No user-data export was
accessed and no user storage was cleared for testing.

Validation: all 65 test files passed (202921 ms); npm run check passed with 30
root JS modules, 50 offline shell entries, 162 originals, 113 WebP assets and
35 protected pairs. Vendored ESM syntax and git diff --check passed. The direct
program UI suite also passed all five checks, including the large-workspace
84-day preview, compressed recovery JSON export and both write-failure retries.
Registry tarball SHA-512 matches npm's pinned package integrity. These are
synthetic storage/DOM checks; the owner's browser retry remains the device check.

Private preview 38: app source a49d16f9cc4878879bb77f65bfb8cac73ae31074;
exact pushed Sites source 86925957cf0bb8a5b26a7305dbbe92d5c872da71.
Four additions (recovery module, codec, license, provenance README), eight
expected client/build changes, no removals. 183 files, 167 client. All 124
existing media/font assets, media-manifest bindings and all server/provider/
migration members are byte-identical to preview 37. No personal records,
exports, backups, keys or package cache included. Previous archives retained.
Uploaded gzip: 158386863 bytes, SHA-256
4206f9e4a1d706b663c365e635301dcab34b8cf0cea18a42e70bdf356ba21dce.
Local Git tar: 160675840 bytes, SHA-256
41243f10512ff79d199db37667540dfecd3225b39b47f3166cc67be4df4271f0.
Saved-version archive: 183 files, 160665600 bytes, SHA-256
3854974fcda64bcdd0b8ae3a3e610b21254afc3db5e528b4635079daf039d8e0.
Local and native archive hashes are separate; fresh source provenance matches
the exact pushed source commit above.

Saved version:
appgprj_6ad593d6f15481918ded32373b877b03~appgver_9bfb82cf8a8c8191a6efcbcf84ff1508.
Deployment appgdep_6ad9f7fe7e5c81918a817ac921acc9ba succeeded at
2026-10-22 07:48:27 America/New_York; runtime revision 5 unchanged.
URL https://menei-private-beta.crispcrown515.chatgpt.site.
Fresh audience read: one owner, zero other users/editors/groups/external visitors
or automations. Credentials cleared from orchestration storage. No public GitHub
push/main merge, live app/backend, sharing, schema, AI key/budget or scheduled-push
change. No user storage was cleared, and no user data was read in testing.

Owner check: /update.html (build a49d16f9cc48), reopen lifting/running options,
preview the program and retry Save. Existing recovery copies should still browse
and export through Settings. If the primary write still cannot fit, the preview
must remain open with the prior saved program intact and an Export backup action.

## Automatic superset matching and explicit program pair labels

Owner confirmed the storage fix saves, but selecting Supersets did not produce
visible A1/A2, B1/B2 pairs. Reproduction identified adjacent-only matching that
could produce zero pairs on a single-muscle day; previews also flattened the
exercise names even when pairs existed. Custom-block and continuing custom
routine paths replaced generated exercises after pairing, dropping the format.

Automatic pairing now evaluates the actual workout as a whole. For at most 16
eligible exercises it maximizes the number of two-exercise pairs, then minimizes
catalog-based primary/assisting-muscle and compound overlap, unequal working-set
counts and distance in the original order. Larger manually assembled sessions
use a bounded greedy fallback with the same costs. This is a practical heuristic
within the selected exercise list, not a claim of personally optimal training.
Demanding free-weight lower-body compounds stay straight; machine leg work can
pair. Same-muscle/compound combinations remain possible when the selected split
has limited alternatives, with fatigue cautions shown on Home. Broad Legs group
labels no longer incorrectly imply calves and quads share a primary muscle.

Exercise arrays, IDs, sets, entries and counts are retained. Existing manual pairs
and any entered member/partner stay protected. Each exercise keeps independent
load, reps, RIR and superset progression context. Global raw exercise order is
unchanged; the displayed execution groups put each chosen pair together. The
existing 60-second set and final 3-minute whole-pair rest rules remain unchanged.
No exercise is silently substituted to manufacture a pair.

Generator review, custom review, Home and the calendar now show explicit A1/A2,
B1/B2 names. New custom blocks, continuing routine calendars and fresh routine
choices apply the selected format after loading their final exercise list.
Existing paired routines retain their chosen pairs. Straight-set mode is unchanged.
No saved history is retroactively auto-paired, and no automatic migration is run.

Focused checks cover cross-list press/curl pairing, first-exercise eligibility,
single-muscle days, demanding leg exclusions, odd/large lists, idempotence,
recorded partners, compact plans, saved/continuing routines and visible labels.
The integrated program check includes an 84-day Supersets preview in a large
workspace under a synthetic 5 MiB storage limit, preserving the quota fix.

Validation: all 65 test files passed (259341 ms); npm run check passed (30 root
JS modules, 50 offline entries, 162 original identities, 113 WebP assets and
35 protected pairs). git diff --check passed. The integrated UI suite includes
the 84-day Supersets save in a large workspace, explicit labels in preview/Home/
calendar, protected history and the custom-block path. Existing independent
progression, rest-timer and recovery-storage checks pass. A representative 84-day
matching/generation measurement completed in 813 ms on this executor; that is not
a phone performance or browser visual acceptance claim. No paid API requests.

Private preview 39: app source d11af39839a50e9b5d5cde4d74290c60d2b1b073;
exact pushed Sites source 48f8d86823d6fa5408ce51d8e5ff003864875ab5.
Ten expected client/build member changes, no additions/removals; 183 files,
167 client. All 124 retained media/font assets, media-manifest bindings, recovery
codec/license and server/provider/migration members remain identical to preview 38.
No private records, exports, backups or runtime keys included. Archives retained.
Uploaded gzip: 158388318 bytes, SHA-256
68b1f683a6617fe7a4bcd7fc5a6581b5bd1b20db5c3a6e5a15616ade6e84a6a9.
Local Git tar: 160675840 bytes, SHA-256
98148f15ae897e4229fadf3d9e0c67de7cb8d2bd8fcf550dd484d9e9bb6eba5d.
Saved-version archive: 183 files, 160675840 bytes, SHA-256
b1c9134d0ac47ecd46c77029426aa47f60f5c2a7e9f84b07f071f98775948850.
Local and native archive hashes are separate; fresh source provenance matches
the exact pushed commit above.

Saved version:
appgprj_6ad593d6f15481918ded32373b877b03~appgver_627d98b53e548191af0177df0a6ab7ea.
Deployment appgdep_6ad9ff03a20881918233db373507df29 succeeded at
2026-10-22 08:18:24 America/New_York; runtime revision 5 unchanged.
URL https://menei-private-beta.crispcrown515.chatgpt.site.
Fresh audience read: one owner, zero other users/editors/groups/external visitors
or automations. Credentials cleared from orchestration storage. No public GitHub
push/main merge, live app/backend, sharing, schema, AI key/budget or scheduled-push
change. User-device acceptance of the new pairing display is pending.

Owner check: /update.html (build d11af39839a5), lifting/running options → Supersets
→ Preview → Save again. The preview must show the actual A1/A2, B1/B2 pair names;
Home and calendar must agree. Demanding free-weight legs may remain straight,
limited single-muscle splits show fatigue cautions, and each lift keeps its own
progression. Already recorded sessions remain unchanged.

## Primary workspace quota retry — isolated private preview

The owner confirmed the new pair labels but encountered the friendly primary
device-save failure. Recovery compression alone does not remove the other full
workspace-sized local copy: the sync baseline used for three-way comparisons.
The primary workspace stays ordinary schema-8 JSON at its original key.

Encode future sync baselines losslessly using the existing pinned LZString
codec, with a versioned envelope, decoded length and checksum. Old raw JSON
baselines remain readable. Preserve the complete baseline, including version,
timestamps, unknown fields and all saved copies; no merge input is discarded.
Corrupt caches fail closed rather than silently becoming an empty baseline.

On a primary or recovery quota error, LocalStore may compact the exact current
account/project's existing baseline and retry once. Require the enabled cloud
client, signed-in user, workspace owner and LocalStore scope to agree. Never
enumerate or compact another account's cache. Do not touch auth, raw legacy
keys, history, other workspaces or primary JSON format. If space is still
insufficient, existing atomic program-save rollback/draft protection remains.
No startup migration, backend request/schema/auth change, cache clearing or
history pruning is introduced. Sync HTTP payloads remain full ordinary JSON.

Focused synthetic checks pass for a full 84-day Supersets primary write under
a 5 MiB UTF-16 quota after compaction, complete recovery snapshots, exact-key
isolation, unknown fields, Unicode and corruption handling. Existing JSONB,
three-way merge, account-switch and CAS retry checks pass with both raw and
encoded baseline reads. Real phone acceptance remains a separate owner check.

Validation: all 66 test files passed (318662 ms). npm run check passed with
30 root JS modules, 50 offline entries, 162 original identities, 113 WebP assets
and 35 protected pairs. git diff --check passed. Program draft rollback, recovery
exports, independent progression, automatic rest and synthetic sync checks pass.
No real browser visual/phone acceptance or live backend operation was performed.

Private preview 40: app source dcdafdaba174345d77f5e1fb1895c3b5a99b9bbf;
exact pushed Sites source 8a592cae059b7ba942155755912fb6e77423e8b1.
Ten expected client/build member changes, no additions/removals; 183 files,
167 client. All 124 retained media/font assets, media-manifest bindings and
server/provider/migration members remain identical to preview 39. The four
runtime module changes are app, core, cloud and recovery. No private records,
exports, backups or runtime keys included. Archive retained.
Uploaded gzip: 158389269 bytes, SHA-256
df94d5bb143256470edb67d3a4d8684310e99c37de331192ba862e8b09b0053c.
Local Git tar: 160686080 bytes, SHA-256
252cad41d63a11175a7157a51cae71a5c068087d79efb2cc66b1a698ee840f42.
Saved-version archive: 183 files, 160675840 bytes, SHA-256
95ce01e0ca986b33a4a4914e0d1400530fcb627ff038ca820f313462bfe91872.
Local and native archive hashes describe separate representations; fresh source
provenance matches the exact pushed commit above. Every uploaded local member
matched the clean pushed checkout byte for byte.

Saved version:
appgprj_6ad593d6f15481918ded32373b877b03~appgver_05dd6649a09c81918f54fdb297bd87b6.
Deployment appgdep_6ada35f5839c81919e0826ecaf405591 succeeded at
2026-10-22 12:12:57 America/New_York; runtime revision 5 unchanged.
URL https://menei-private-beta.crispcrown515.chatgpt.site.
Fresh audience read: one owner, zero other users/editors/groups/external visitors
or automations. Source credentials cleared from orchestration storage. No public
GitHub push/main merge, live app/backend, sharing, schema, AI key/budget or
scheduled-push change. User-device storage acceptance remains pending.

Owner check: /update.html (build dcdafdaba174), then reopen the program preview
and retry Save this program. Confirm the saved program appears with A1/A2 pairs
and that prior workout history remains available. If it still cannot fit, the
existing failure path retains the draft and prior saved workspace; do not clear
site data, history or other accounts to force a save.

Owner accepted the preview 40 save behavior. Continue the feedback rebuild;
storage acceptance is no longer the active blocker.

## Recorded workout order and fatigue context — isolated private preview

Add optional checkedAt metadata on new valid Done transitions in today's
workout, preserving the device's date/time and UTC offset. Duplicate Done,
ordinary field edits, view/redraw and sync do not stamp new times. Backdated and
future-date logging stays untimed. Unchecking retains the inactive check time;
an explicit recheck today records the new check time. Failed saves restore the
prior complete log, including metadata, before starting any timer.

Home's strength overview has a Workout order button. Its read-only timeline
shows all timed checks, including interleaved supersets. Working/top first-check
times determine recorded exercise order; earlier timed working sets are counted
separately from warm-up/ramp/back-off/drop work. Unknown times and partial order
are labeled. Equal timestamps are ties, without inventing an order. Device check
times do not measure actual exercise start/finish or session duration, and clock
accuracy is not guaranteed.

Exercise cards show recorded placement, preceding working sets and catalog-based
primary/assisting muscle overlap. Prior comparison uses the existing canonical,
gym/portable and straight/superset-compatible history selector. Different order
is noted only with complete, untied timing on both sides. No automatic reorder,
load reduction or fatigue diagnosis is introduced; reps/RIR progression remains
unchanged. No old logs are backfilled or migrated.

New routine saves, custom blocks, continuing calendars and fresh workout choices
omit check times from new blank sets. Their original saved histories and source
routines retain every field. Timing uses existing schema-8 optional-field and
export/sync preservation; no backend changes or new keys. The new pure module
is included in offline precaching. Photos remain deferred.

Focused checks pass for local check transitions, duplicates, invalid/backdated
rows, offsets, equal times, invalid calendars, partial history, interleaved order,
muscle context, unchanged load recommendations and clean routine reuse. The app
integration check covers Home/modal display, read-only viewing, prior/legacy
preservation and failed-save rollback. Existing rest, workout recommendations,
program-save and session-edit suites passed in the focused run.

Validation: all 67 test files passed (391118 ms). npm run check passed with
31 root JS modules, 51 offline entries, 162 original identities, 113 WebP assets
and 35 protected pairs. git diff --check passed. Checks use synthetic data and a
DOM contract harness; real phone/browser visual acceptance is still pending.
No paid requests, backend mutations or scheduled-push activation were performed.

Private preview 41: app source 9bc5606dfc9d38e37e91860f26bb49c5062f1c29;
exact pushed Sites source 32570adb51286d6d1306b4e330c6fe3c7761ed89.
Ten expected changed client/build members plus session-order.mjs; no removals.
184 files, 168 client. All 124 retained media/font assets, media-manifest bindings
and server/provider/migration members remain identical to preview 40. The storage
retry codec/cloud behavior is retained. No private records, exports, backups or
runtime keys included. Every uploaded member matches the clean pushed checkout.
Uploaded gzip: 158392011 bytes, SHA-256
95a2e82d5a33e90d689abe93e64f571db7da50fa49923e9c60e3442eeba39c09.
Local Git tar: 160686080 bytes, SHA-256
640d4647b075f0c6ede69aedf541282985ae3c9c7a02bb8c3494e1d3caf932ab.
Saved-version archive: 184 files, 160686080 bytes, SHA-256
bdad4018430c4a7a984c8f06109d48971ca15fa34236c7d35331fb34352c7a3b.
Local and native hashes describe separate archive representations; fresh saved
source provenance matches the exact pushed commit above. Archive retained.

Saved version:
appgprj_6ad593d6f15481918ded32373b877b03~appgver_36a8c9184eb481919757d90b4ecd6196.
Deployment appgdep_6ada3e13f0d08191a0d38010bc5a79e7 succeeded at
2026-10-22 12:47:31 America/New_York; runtime revision 5 unchanged.
URL https://menei-private-beta.crispcrown515.chatgpt.site.
Fresh audience read: one owner, zero other users/editors/groups/external visitors
or automations. Source credentials cleared from orchestration storage. No public
GitHub push/main merge, live app/backend, sharing, schema, AI key/budget or
scheduled-push change. Exercise photos remain deferred. User-device acceptance
of the new timing display is pending.

Owner check: /update.html (build 9bc5606dfc9d), then Home → Workout order in the
strength summary. Check valid sets in today's workout as training proceeds;
verify chronological checks and recorded working-set order, including alternating
supersets. Old/backdated entries must keep unknown timing. Reviewing this modal
must not change loads, recommendations or history. Existing automatic rest rules
remain active; Stop or timer expiry dismisses final blocking recovery as before.

## One-hour workout scheduling and direct push — private owner pilot

The owner confirmed discovery of Workout order, then requested the next stage
and clarified that direct MENEI push is required. Added a usual start time and
separate time zone, timezone-aware one-hour calendar exports, and actual isolated
Web Push service/device controls. See PUSH_REMINDERS.md for behavior, applied
migrations, secret handling, access, verification and pause procedure.

The new Supabase Edge function and minute scheduler are active only in the test
project, with one confirmed owner allowlisted and zero devices enrolled at setup.
No real notification has been sent; phone permission and closed-app acceptance
remain pending. No live app/backend, sharing, AI key/budget or deferred photo
change. Runtime revision 6 adds the public push key and opt-in readiness flag;
other entries and secret values remain intact.

The first full regression run passed all 68 test files (251257 ms), followed by
focused capability and close-before-sync checks. The final full run passed all 68 test files (272250 ms); final static checks
passed with 32 root JS modules, 52 offline entries, 162 original identities,
113 WebP assets and 35 protected pairs. Follow-up copy/device-preference checks
also passed. Actual database rollback tests
and scheduled HTTP readiness checks passed. Existing password-protection warning
is recorded with its remediation link in PUSH_REMINDERS.md.

Private preview 42: app source d9b53e4d442578d211a4aa04f0dfba0d37296125;
exact pushed Sites source 8bdb76122404fc7baf633bdc5a451d6c585faa71.
Ten expected changed members plus workout-schedule.mjs; no removals. 185 files,
169 client. The server change is only its public push-capability config response.
All 124 retained media/font assets, media-manifest bindings, other provider/budget
and Sites migration members remain identical to preview 41. Supabase migrations
were applied separately as documented above. No private records, exports,
backups, credentials or runtime secret values are in the archive.
Every uploaded local member matched the clean pushed checkout byte for byte.
Uploaded gzip: 158394434 bytes, SHA-256
bdfa7541646973438cd3b811864c16ce6faf79e114ccdc09cc03905fe85d3517.
Local Git tar: 160696320 bytes, SHA-256
a3afc63aefbeedfbd360af42cd17e6588cf6c978e43260daf2a58cec4b37917b.
Saved-version archive: 185 files, 160696320 bytes, SHA-256
57fe7c1832da4effaaca8b777bf3c0c68e5377b7fa98d1ae3f580ad2db90fbd4.
Local/native hashes describe separate archive representations; fresh source
provenance matches the exact pushed commit. Archive retained.

Saved version:
appgprj_6ad593d6f15481918ded32373b877b03~appgver_666a4d784cc881919d9830ee2e9ae6b9.
Deployment appgdep_6ada599dcf608191b48a3a67fccd0f46 succeeded at
2026-10-22 14:44:57 America/New_York; applied runtime revision 6.
URL https://menei-private-beta.crispcrown515.chatgpt.site.
Fresh audience read: one owner, zero other users/editors/groups/external visitors
or Sites automations. The separately configured Supabase minute job remains
active, with HTTP 200 ready=true/sent=0/failed=0 checks. Workspace/revision counts
remain 1/5, with one allowed owner pilot and zero real device subscriptions.
Runtime public key was verified to match the sender's public key. No real phone
delivery is claimed. Source credentials and bearer-bearing site results cleared
from orchestration storage. No public GitHub push/main merge, live app/backend,
sharing, AI key/budget or protected-media change.

Owner check: /update.html (build d9b53e4d4425), then Settings. Save the usual
workout time and time zone. Choose Enable push on this device → Allow. Choose
Test with app closed · 2 min, close MENEI, and allow roughly 2–3 minutes for the
server test. Actual notification permission and delivery are owner-device checks.
Calendar alerts are optional; they are not required for this direct push path.


### Private push controls correction

The owner’s signed-in Settings screenshot exposed a client configuration bug:
the accepted pushServiceReady value was overwritten with false and its public
VAPID key was omitted. Preserve those validated server values in runtimeConfig.
This restores the existing owner-only Enable/Test controls and passes the public
key into browser registration; it does not bypass admission or widen the pilot.
An integrated beta-entry test failed before the fix and passes afterward for
owner controls/registration; member, offline and server-disabled paths remain
blocked. Synthetic tests do not establish physical phone delivery. No backend,
credential, runtime environment, user-data, live-app or media change is needed.

Private preview 43 publication: source fix
0171e738991ab2865cb19a6393505fa467152b6d, exact pushed Sites source
00ff6cb8d81bedbc31fcd45bd56125791a0c6577. All 68 regression test files passed
(261430.620376 ms); npm run check passed with 32 root modules, 52 offline entries,
162 original image identities, 113 WebP assets and 35 protected pairs. New owner
controls/registration test failed before the fix and passed afterward. Browser
permission/subscription responses were synthetic; physical delivery is pending.

The archive contains 185 files (169 client). Only app.mjs, index build identifier,
service-worker cache identifier and four build/help metadata members changed.
All 124 protected media/font assets, media-manifest bindings, server code and
all other archive members remain identical to preview 42. Every archive member
matched the clean exact pushed checkout. Uploaded gzip: 158394420 bytes, SHA-256
40bf1f5c3d6a20d4138838a63c1e4566d6b1d35f9e5047729b901f62b2fa3e7e.
Native saved archive: 185 files, 160696320 bytes, SHA-256
97bc30f62b94769dd67ec9c3ce28dad7005041bc805edc0fb9843db6373aece9.
These are separate archive representations; provenance was checked against the
exact pushed commit. No private export or runtime credential was packaged.

Saved version:
appgprj_6ad593d6f15481918ded32373b877b03~appgver_7cd5ae2a14988191a62326c798b95c6d.
Deployment appgdep_6ada76f395888191a2bd39c8305419e9 succeeded at
2026-10-22 16:50:10 America/New_York, applying existing runtime revision 6.
URL https://menei-private-beta.crispcrown515.chatgpt.site.
Fresh audience: one owner, no other users/editors/groups/external visitors or
Sites automations. No Supabase mutation, public GitHub push/main merge, live-app
update, sharing change, AI request/key/budget change or data reset occurred.
An initial source push could not reach the sandbox proxy; the same authorized
private source workflow succeeded with the tool's additional network access.
Source credential and bearer-bearing Site results were cleared after use.

Owner check: open /update.html, choose Load latest version, then Settings
(build 0171e738991a). Save usual workout time/timezone, Enable push on this device
and Allow. Use Test with app closed · 2 min and wait about 2–3 minutes after
closing MENEI. Acceptance requires a real device result; no delivery claim yet.


### Device notification display diagnosis

The owner test registered and reached the push provider with zero sender failures,
but sound/popup acceptance remains unresolved. The supplied Android site category
already allows alerts, sound, vibration and popups. Expose the existing local
persistent-notification test in owner Settings to isolate display from transport.
Its toast reports Chrome acceptance only; the closed-app test stays separate.
Explicitly request non-silent/replacement alerts and a short vibration pattern for
local and push notifications, retaining tags and server duplicate suppression.
No claim is made that this establishes the cause of the first missed alert or
guarantees physical device delivery. No background sender, admission, account or
runtime setting change is needed. The live app stays unchanged.

Private preview 44 publication: app source
fe81ccd72059b0b0ed3a37a85560705a2cd5e515; exact pushed Sites source
ba521ca4d3ef58bfac7583fe3a4a00c99adb60fe. Both focused notification/UI test files
passed. Full regression passed all 68 test files (256009.559783 ms); static checks
passed (32 root modules, 52 offline entries, 162 original image identities,
113 WebP assets and 35 protected pairs). Physical sound/popup and closed-app
notification delivery remain unresolved until the owner checks the phone.

The archive has 185 files (169 client). Eight expected changed client members:
app/notifications, index/cache build identifiers, release/preview-build metadata,
and setup/preview-guide build references. No additions/removals. All 124 retained
media/font files, media-manifest bindings, server/migration/provider/budget code
and every other member remain identical to preview 43. Each uploaded member
matched the clean exact pushed checkout byte for byte. Uploaded gzip: 158394520
bytes, SHA-256
8ed71fb8389e45627c9424f2c021393d1ee2b401bdab2456abb0c87ea0a57650.
Native saved archive: 185 files, 160696320 bytes, SHA-256
350e50559c5e9a05f622cd0ae204d86e97f0f33620d842e8ad2e2b00605872a0.
Separate archive representations; saved source provenance matches the pushed SHA.
No credentials, private exports, backups or user records were packaged.

Saved version:
appgprj_6ad593d6f15481918ded32373b877b03~appgver_f0f9042d985481919b1704e1a791ea87.
Deployment appgdep_6ada822325c08191902d228c6e6c5e98 succeeded at
2026-10-22 17:37:50 America/New_York with existing runtime revision 6.
URL https://menei-private-beta.crispcrown515.chatgpt.site.
Fresh audience: one owner; no other users/editors/groups/external visitors or
Sites automations. Credentials and bearer-bearing Site results cleared after use.
No server push was triggered, backend mutated, runtime setting changed, public
GitHub/main updated, live app published, sharing changed, AI usage incurred or
user data reset during this correction.

Owner check: /update.html → Load latest version → Settings → Test notification
now. Leave MENEI open for this immediate test and check the notification panel as
well as sound/popup. It tests local Chrome display only. A success toast is not
proof of physical presentation. Next diagnosis depends on the real device result;
do not mark closed-app delivery accepted merely because the provider accepted it.


### Timely background push priority

Immediate local notification display is now owner-confirmed; closed-app delivery
remains unresolved. Server tests have provider acceptance without sender errors.
The sender omitted urgency and therefore used pinned web-push's normal priority.
Explicit high urgency is appropriate for this low-volume, time-sensitive visible
owner pilot. Only the sendNotification options change; TTL, timeout, authentication,
project/account/pilot isolation, due windows and duplicate suppression stay intact.
No new test push, replay, quota reset, VAPID key or frontend deployment is needed.
An actual-handler VM regression fails before and passes after the option change,
with negative auth/project/dedup cases. Full regression validation is in progress.

Priority correction verification and deployment:
App/backend source 194a45a99552eac80cda56162786e5906714d02e. Full regression
passed all 69 test files (284705.977384 ms); focused sender/schedule tests and
TypeScript syntax passed. Static checks passed (32 root modules, 52 offline
entries, 162 original identities, 113 WebP assets and 35 protected pairs).
The actual-handler regression failed before urgency=high and passed afterward;
negative cron/project/dedup cases passed. All test credentials and provider/database
responses were synthetic. No paid model request was made.

Native deployed only menei-push-reminders in isolated project
bhyrrxrpqaxiwpfxnwpa, existing function ID
45b9f05d-b86b-474d-8693-7c0d66a15cc1, version 3 ACTIVE at
2026-10-22 17:54:03 America/New_York. Bundle SHA-256
03336ca9df25541b3e8346e4c973616d35702eefc93570e38ed372f3e6d00737.
The five-file bundle retains explicit relative deno.json import-map configuration.
Only the sendNotification options changed; no key, schema, migration, cron command,
pilot, user state, delivered slot or runtime setting was changed. The existing
minute job remains active. Its post-deployment run at 17:55 America/New_York
returned HTTP 200, ready=true, sent=0, failed=0, expired=0. No test was triggered
or delivered slot replayed during deployment. Original keys remain in Vault.

The owner confirmed that the delayed two-minute closed-app test arrived before
this priority deployment. Immediate local display and basic closed-app delivery
are therefore accepted. Reduced latency under the new priority is not separately
phone-verified. Exact one-hour workout delivery remains pending a future valid
scheduled reminder; the previously saved start time put its one-hour alert in the
past. A start time is not an on-start alert setting. Completed/skipped workouts
remain suppressed. The feedback register now distinguishes these acceptance states.

Sites preview 44 and runtime revision 6 remain unchanged; no phone refresh is
required for this backend-only correction. No public GitHub push/main merge,
live-app/backend mutation, sharing change, new credential, AI budget reset,
protected-media change or data reset occurred. Both source checkouts remain clean.


## Workout motivation audio — isolated private preview

The next remaining feedback item is brief workout motivation audio. The owner
subsequently declined Hear today’s quote. That proposed button/action was removed
before publication; daily and opening quotes remain text only. The automatic
start cue is “First set logged. One set at a time.” Completion says that the
workout is complete, progress is saved and recovery matters. No quote is spoken.

workout-voice.mjs uses the browser's SpeechSynthesis API, preferring an available
local English voice. Otherwise the browser's available English/default voice is
used; device/browser voice availability and playback vary. There is no OpenAI or
other app API request, sound download, new account or credential. Only these
short generic messages go to the browser's speech engine, never workout data.
Unsupported/failing speech does not prevent logging, timers, quotes or navigation.

Only a successful explicit current-day local Done save or Complete action calls
the transition detector. A valid checked set requires entered nonnegative load
(including zero) and positive reps/count. Completed runs with positive minutes
can receive the completion cue. No auto-speech on launch, view, sync, import,
backdated/future edits, deleted/rest days or empty completion. First-row speech
means first logged set, not a measured workout-start time. Saved history and
load/progression logic remain unchanged.

Reuse the existing per-account/device rest sound preference: sound remains on
by default and explicit mutes remain respected. Home's daily motivation section
has the same Mute/Unmute sound control. Mute and Stop cancel voice immediately;
account/workspace changes and hidden pages also cancel. No old cue is replayed
when unmuting. Existing 60-second/180-second rest timing and four repeated chimes
remain unchanged; spoken cues do not replace completion sounds or push alerts.

A separate MGT_BETA_WORKOUT_VOICE:<scope> receipt stores only version, the current
cue date and two consumed-event flags. In-memory fallback prevents replay within
the session if receipt writes fail. No primary/legacy/user data is cleared or
rewritten; these receipts stay outside cloud sync and workout history. Reload,
uncheck/recheck and unlock/re-complete do not replay consumed cues. Audio state
is not approval of deferred exercise images or a change to the launch animation.

Pure/helper tests cover valid transitions, scope/reload deduplication, muted
consumption, cancellation and unavailable voice/storage. Integrated UI tests
exercise actual Done/Complete/Stop/mute paths, failed-save silence and account
change cancellation. The new first-load UI fixture uses a valid retained legacy
snapshot rather than the older opaque preservation marker. Existing rest,
opening, streak and account tests remain in the regression run. Full validation
and private publication receipt follow; physical voice acceptance is pending.


Workout-audio validation and private preview 45 receipt:
Runtime feature source b78287ac19bf60cb4e58ec2a525df80088a3afa7; exact pushed
Sites source 593dc7f1e2c37ce30fe6a2f0dd4e98c224d6ea14. Helper/transition,
first-set/Complete/Stop/mute/failed-save and account-cancellation checks passed.
Static checks passed: 33 root modules, 53 offline entries, 162 original identities,
113 WebP assets and 35 retained pairs. Browser/CUA QA was unavailable; actual phone
voice playback is pending. Daily/launch quotes remain text-only as requested.

The full 70-file regression run passed 69 files and identified one outdated
all-other-storage-keys assertion in workout-recommendations-ui: a first Done now
also writes the documented account-scoped audio receipt. The test now explicitly
checks that receipt's version/date/start/completion flags and compares every
remaining legacy/backup/storage entry byte for byte. Its entire file then passed
on rerun (29878.360231 ms). The other 69 results remain valid because no runtime
code changed after that run. The first run took 286963.540136 ms; this is not
represented as a single green full-suite run. No test was removed or disabled,
and progression, primary state and preserved-history comparisons stay strict.
The receipt expectation adjustment is committed with this publication record.

Archive: 186 files, 170 client. Added workout-voice.mjs; seven expected existing
client changes (app, index, service-worker cache/shell, release/preview-build and
setup/preview-guide build references). No removals. All 124 protected media/font
assets, media-manifest bindings, server/migrations/provider/budget members and
all other existing bytes remain identical to preview 44. Every uploaded member
matched the clean pushed checkout. No quote-playback action or spoken daily quote
remains in the app or voice module. Uploaded gzip: 158395897 bytes, SHA-256
21fb22c2a1642513890205f0c2a112807ef02058be3857d295424d08edf9e911.
Native saved tar representation: 186 files, 160696320 bytes, SHA-256
ddd11a4e77944c095138b4b86129bf56cc5ac14de0c03c4f8759a7f295602169.
These are separate archive representations; saved provenance matches the exact
pushed source. Runtime secrets, exports, private records and backups are excluded.

Saved version:
appgprj_6ad593d6f15481918ded32373b877b03~appgver_2a6bf95b742c81918a840cd4f7e791f1.
Deployment appgdep_6ada8c71e17481918d245281cc48e6d2 succeeded at
2026-10-22 18:21:50 America/New_York, preserving runtime revision 6.
URL https://menei-private-beta.crispcrown515.chatgpt.site.
Fresh audience remains one owner, zero other users/editors/groups/external
visitors/Sites automations. Source credentials and bearer-bearing Site results
cleared after use. The isolated push sender remains version 3; it was not changed
or invoked by this feature. No live-app/backend change, public GitHub push/main
merge, sharing change, AI/key/budget change, photo change or data reset occurred.
Both source checkouts are clean after this receipt commit.

Owner check: /update.html → Load latest version (build b78287ac19bf).
For a fresh current-day workout, the first valid saved Done can speak the brief
first-set message. Existing started workouts do not gain a retroactive start cue.
Completing today's valid workout can speak the completion message. Mute near the
text quote or in timer controls cancels speech and rest sound. No Hear today's
quote button is present; device/browser voice support determines real playback.


## Wearable capability review — deferred after launch

The next-item review checked current primary Samsung, Android and Google Health
provider documentation and inspected the existing web app's run storage. This
checkout has no Android project or implemented wearable/OAuth connection.
The owner then chose to hold this work for a later upgrade; recommendation is to
keep it outside the current web release. No watch model or account details are
required now. Do not build or activate a connector, request health permissions,
create provider credentials or treat wearable sync as a launch dependency.

Findings to reverify when resumed: Samsung Health's Health Connect route requires
an Android component and per-user data permissions. Installed web/PWA status does
not itself provide the Android SDK bridge. Recorded activity/heart-rate sync is a
different capability from live watch sensor monitoring. Google currently lists
legacy Fitbit Web API turn-off for October 30, 2026 and directs integrations to
Google Health API with Google OAuth and restricted-scope review; older September
announcements are superseded by the current official overview. Public MapMyFitness
OAuth documentation does not establish that a new client has been approved.

Primary sources reviewed 2026-10-22:
- https://developer.samsung.com/health/health-connect-faq.html
- https://developer.android.com/health-and-fitness/health-connect/get-started
- https://developer.android.com/health-and-fitness/health-services
- https://developers.google.com/health/about
- https://developer.mapmyfitness.com/docs/v71_OAuth_2_Intro/

Future work must preserve existing manually logged runs/lifting, retain source
identity and avoid duplicate activities or invented heart-rate samples. Provider
choice, actual device, import-vs-live scope and native packaging remain undecided.
No app, backend, runtime, audience, media, credential or health-data change was
made. Private preview 45 and push sender version 3 remain current. This update
only records the post-launch deferral; no deployment or runtime test is needed.

## Spoken workout cues — unresolved, deferred to post-launch

The owner reported no speech after the first checked set; only the rest timer
ran. This was explicitly the first checked set, so an already-started workout
cannot explain the report. The physical speech failure is unresolved; no device
root cause has been established. Inspection found that speech-engine errors
were not surfaced, but that alone does not establish why the phone was silent.

Before any runtime edits, the owner deferred this work to post-launch. Stop the
proposed Test workout voice button, error-display work and further debugging.
No proposed control or speech fix was implemented, tested or deployed. Preview
45 remains deployed with its existing unaccepted speech implementation; exclude
that optional feature during concrete live-release preparation. Existing rest
timers, four-chime audio and mute controls remain in scope and unchanged. Daily
quotes remain text-only. Wearable integration is separately deferred.

Updated FEEDBACK_REBUILD.md and RELEASE_READINESS.md to remove speech acceptance
from the current launch checklist while retaining the unresolved result. Fresh
Sites metadata confirmed preview 45 and the unchanged owner-only audience. A
short-lived source credential was obtained for the investigation but was not
used or persisted, and was cleared from session storage when work stopped.
No app files, deployment, backend, sharing, media, workout data or settings were
changed. Documentation-only deferral; no runtime rerun is needed.

## Launch scope preparation — spoken cues switched off

Following the owner's instruction to continue with spoken cues and wearable
sync deferred, the launch candidate explicitly sets WORKOUT_VOICE_ENABLED=false.
The app does not construct WorkoutVoice, request speech, write voice receipts or
call the speech engine while this fixed source gate is off. The existing helper
is retained for future work without a user-facing switch, new test control or
attempt to debug the phone failure. Daily motivation copy describes only the
on-screen quote and existing rest-chime mute. No quote playback was added.

RestAudio, rest-timer policy, progression, cloud storage, schema and recorded
workouts are unchanged. Integrated tests now verify no speech on first Done or
Complete, mute/unmute, Stop and account changes while retaining automatic 60/180
second rest, completion state, failed-save silence and legacy preservation. The
load-guidance test requires no new speech receipt and once again compares every
non-primary storage entry, without exclusions. Deferred helper tests remain.

The four affected test files passed (87594.757147 ms); static validation passed
33 modules, 53 offline entries, 162 original identities, 113 WebP and 35 pairs.
The full regression result and private publication receipt follow separately.
No browser/CUA was available; the deferred phone-speech failure is not resolved.

LIVE_RELEASE_PLAN.md records concrete deployment differences: original live
GitHub project path and cloud identity versus root-origin Sites Worker/D1,
fixed isolated test Auth and owner push pilot. Copying static files cannot
activate those backend services for live users. Do not weaken origin/identity
checks or replace original accounts to bypass that requirement. Live scope,
version/artifact/rollback and explicit cutover authorization remain separate.
No backend, audience, key, AI budget or live-app change is part of this step.


Launch-scope validation and private preview 46 receipt:
Full npm test passed all 70 files in one run, zero failed/skipped/cancelled
(282007.092984 ms). This supersedes the prior preview's split-run result as the
current candidate validation. Focused four-file checks and static checks passed
as recorded above. No runtime changes followed validation. Browser/CUA was
unavailable; no new physical-device result is claimed.

Runtime source 3eda3bfa219c3e5c54b1bc374605d348720c1e06, exact pushed Sites source
7cc32256c7032990d9008790b62c422481bba5c4. Archive 186 files / 170 client,
158395907 bytes, SHA-256
23109e883c2798ff72da0478b99c824a9005b7fab09f4dfb0124f400066abe61.
All members match the clean pushed source. Only app.mjs, workout-voice.mjs and
six expected private build/cache metadata members changed. All 124 protected
media/font assets, media bindings, server and migration members and every other
existing member are byte-identical to preview 45. No files were added/removed.
No private inputs, exports, account records or runtime keys were packaged.

Saved version:
appgprj_6ad593d6f15481918ded32373b877b03~appgver_0e45db5cf01081918ab57855edb83bb3.
Deployment appgdep_6ada9c474bac8191a29607982813d47b succeeded at
2026-10-22 23:29:24.475185 UTC; runtime revision 6 unchanged.
URL https://menei-private-beta.crispcrown515.chatgpt.site.
Fresh audience remains one owner, zero additional users/editors/groups/external
visitors/automations. Source credential cleared from session storage after use.
No live app/backend change, public GitHub push/merge, sharing change, provider
request, AI limit/key reset, data reset or protected-media change occurred.
The isolated push sender remains v3 and was not invoked by this publication.

Owner can load /update.html to receive build 3eda3bfa219c. Daily quotes stay
text-only; speech is disabled and is no longer an acceptance gate. Existing
rest timers/chimes remain unchanged. Next device checks are the future scheduled
one-hour workout reminder and installed/offline reopening; never reset data or
invent workout completion to force a test. LIVE_RELEASE_PLAN.md records remaining
production backend/cutover prerequisites. Live publication remains separate.

## Offline/update review — clean obsolete private shell caches

The next release check found that buildPreview renames the service-worker cache
to menei-owner-preview-<12-hex-commit>, but activation only removed the older
mgt-private-beta family and two known legacy cache names. Consequently, repeated
private updates retained obsolete app-file caches. This is a reproduced cleanup
bug, not an established cause of earlier localStorage quota failures; Cache
Storage and localStorage are distinct stores.

Activation now also recognizes the exact generated private-cache name pattern.
It keeps the active CACHE, retains unrelated caches including similar names
without a 12-hex build suffix, and leaves the existing legacy cleanup unchanged.
Only the service-worker activation predicate changed. Shell installation,
network/offline fetch rules, update activation, push handlers and app modules
are unchanged. No account/workout store, IndexedDB, cloud record or subscription
is cleared. The standalone updater still preserves sign-in, history and push.

A new VM regression failed before the fix because an obsolete private cache
survived activation. Afterward it verifies removal of two prior build caches and
legacy shell caches, preservation of the current and unrelated caches, and
offline fetching of the current cached code after activation. This is controlled
service-worker coverage, not actual installed-phone or browser QA.

Six affected test files passed in one run (8974.054945 ms): updates, release,
preview, test-cloud-preview, preview-worker and push-schedule. Static validation
passed 33 modules / 53 shell entries / 162 originals / 113 WebP / 35 pairs.
The preceding full 70-file run remains the baseline; it was not rerun or claimed
as a new full-suite result for this one-predicate change. No runtime changes
followed these checks. Exact private publication receipt follows separately.
Speech stays disabled; wearables/photos remain deferred. The one-hour reminder
and physical installed/offline reopening checks remain pending, not accepted
merely because the owner asked to continue.


Offline/update correction — private preview 47 receipt:
Runtime source 103544ed83dc0bff265b3046454cecba22fa3321, exact pushed Sites
source 2b22c33ae037e44fe72cf8b562920a00452219f3. The packaged worker was also
executed in a VM against the actual checkout files: all 53 shell entries installed,
two obsolete build caches were removed, the active Home and app module loaded
offline, an unrelated cache remained, and API/no-store/Auth traffic bypassed the
cache. No browser/CUA was available; installed-phone acceptance is pending.

Archive contains 186 files / 170 client, 158395942 bytes, SHA-256
230d11aca35d198dc43c43157e4ca60d01a36c30035d07e0f8d08c83b73403f7.
Every member matches the clean pushed checkout. Only sw.js and five expected
private build metadata members changed. All 124 protected media/font assets,
media bindings, app.mjs and all other client modules, server/migrations and all
remaining existing members match preview 46 byte for byte. No additions/removals,
private inputs, exports or runtime keys. Speech remains disabled.

The first native publication returned a plain tool error without a saved version
or deployment ID. Read-only reconciliation found latest version 46 and no version
for this source. One retry reused the exact unchanged project/source/archive and
succeeded; no duplicate version/deployment was initiated after a successful result.
Saved version:
appgprj_6ad593d6f15481918ded32373b877b03~appgver_3abca6486ee48191a5f1402c67c0725a.
Deployment appgdep_6ada9e684d888191ab4b5e37b7c313bd succeeded at
2026-10-22 23:38:28.354119 UTC; runtime revision 6 unchanged.
URL https://menei-private-beta.crispcrown515.chatgpt.site.
Native saved provenance confirms the exact pushed source, 186 files and normalized
tar size 160696320, SHA-256
59b2dab5ec40be7133e5dfd3f44f2778376892bea6c5776ab5012af63638e29d.
Uploaded gzip and saved tar are distinct representations, not equal archive bytes.

Fresh access remains one owner, zero additional users/editors/groups/external
visitors/automations. Source credentials and bearer-bearing/signed-URL responses
were cleared from session storage. No public GitHub push/main merge, live-app or
backend change, sharing change, notification, provider request, AI budget/key
change, user data reset or media change occurred. Isolated sender v3 remains
unchanged. Both checkouts are clean after the receipt commit.

Owner check: load /update.html online and open Home (build 103544ed83dc), then
close/reopen with airplane mode enabled and inspect existing saved entries.
Restore the connection afterward. Do not clear storage, uninstall, sign out or
create artificial workout records for this check. The one-hour reminder remains
pending separately; asking to move on did not establish device acceptance.

## Connected Auth 504 — explicit device-local continuation

The owner encountered Cloud request failed (504) while connected, not during
airplane-mode testing. The isolated project reported ACTIVE_HEALTHY at review;
aggregate edge logs showed three /auth/v1/token 504s alongside 30 token successes
and 187 successful /auth/v1/user requests in the tool's 24-hour window. No raw
tokens, passwords, IDs, account records or subscription endpoints were retrieved.
These observations establish transient token-endpoint failures, not their exact
infrastructure cause or that the owner's current credentials were rejected.

Source inspection and synthetic regressions reproduced the poor recovery path:
restore/reconnect paused the workspace and presented generic sign-in on a service
timeout; a failed runtime-config response also erased the retained admission
receipt even for 5xx errors. This is separate from the corrected app-file cache
cleanup. Current Supabase session documentation was reviewed; no session lifetime,
refresh-token policy, gateway authentication or backend setting was changed.
https://supabase.com/docs/guides/auth/sessions

Temporary transport failures, 408/429 and 5xx now produce a clear retry message.
Known admission-denial codes, 401/403, malformed configuration, account-change
AbortError and recovery flows cannot use that classification to gain access.
Temporary config failures retain the device receipt; explicit denials and invalid
configuration still revoke it as before. No blind password/token retry was added.

After a classified failure, Open saved data on this device is available only for
the current cached isolated-project identity with its prior campaign/user receipt,
outside password recovery. Selection is explicit, rechecks the account context
and receipt, and requires an existing valid workspace owned by that same user.
Missing/mismatched workspaces are neither created nor rebound. A sign-in attempt
for a different email cannot expose the earlier account's local continuation.
Account changes invalidate the in-memory offer; the receipt never authorizes
network requests or reserves a seat.

Local continuation uses the established offline account-loading path, reads media
bindings from Cache Storage, leaves cloud stopped and network admission false,
and disables AI/push readiness. Home labels device-local use and provides Retry
cloud connection while online. That explicit retry reloads runtime configuration
and checks Auth and server admission before cloud/AI/push readiness resumes.
Denied retries close the local workspace view and preserve saved edits. Existing
auth rows, raw legacy records, recovery copies, schema and quotas remain intact.
No original cloud account/data migration or claim of offline encryption/revocation.

The admission/UI regressions failed before the fix for the unavailable local
action and erased config-timeout receipt. Afterward the three focused test files
passed (52732.244848 ms), plus the two added recovery/denied-retry tests
(944.83831 ms). Coverage includes the actual expired-token refresh path, explicit
continuation with no further Auth/cloud requests, retained local edits, successful
revalidation, unadmitted users, wrong-owner/missing data, another-email sign-in,
cross-tab changes, recovery and real denial. Static checks passed 33 modules / 53
offline entries / 162 originals / 113 WebP / 35 retained pairs. Full regression
and private publication receipts follow separately. No browser/CUA or new phone
acceptance is claimed; this does not prove Auth will never time out again.


Connected-timeout correction — private preview 48 receipt:
Full npm test passed all 71 files, zero failed/skipped/cancelled, in
350045.551425 ms. All new negative and positive outage/admission cases passed
alongside preserved history, nutrition, progression, rest, cache/update and push
checks. No runtime changed after this run; static checks also passed as above.
No browser/CUA or physical-phone acceptance is inferred.

Runtime source 68ee9d9b7aa46653f4e355fc96e73dd2a113d6a7; exact pushed Sites
source f40d0debcaab3abaff0fba113c8ae23b3eb37abb. Archive 186 files / 170 client,
158396429 bytes, SHA-256
ce51ed345c248d77add93e74eecc6269f32bf43b8ed41b529ac223c3e0ba788c.
All members matched the clean pushed checkout. Only app.mjs, beta-entry.mjs and
six expected private build/cache metadata members differ from preview 47. All
124 protected media/font assets, media bindings, all other existing client
modules, server/migrations and remaining members are byte-identical. No file
addition/removal, private export, account data or runtime secret in the package.
The workout-voice fixed source gate remains false.

Saved version:
appgprj_6ad593d6f15481918ded32373b877b03~appgver_9f27cae9241881919b057c7a715d863a.
Deployment appgdep_6adaadd9a3a081919e97491aa0f238d2 succeeded at
2026-10-23 00:44:20.299103 UTC, unchanged runtime revision 6.
URL https://menei-private-beta.crispcrown515.chatgpt.site.
Native saved provenance confirms exact pushed source, 186 files and normalized
tar size 160696320, SHA-256
1efd2f1c1ce489fea4769531d1760e3986ab1f4dd64e9b66c2ee706744833f67.
Uploaded gzip and saved tar are distinct representations, not equal archive bytes.

Fresh audience remains one owner; zero additional users/editors/groups/external
visitors/automations. The expired earlier source credential was discarded and a
fresh one obtained before push; credential and raw publication response were
cleared from session storage afterward. No public GitHub push/merge, live-app or
backend mutation, account migration, sharing change, new secret, paid AI search,
seat/usage reset, media change or data reset occurred. Supabase operations were
read-only health and aggregate log checks; no Auth setting/policy was altered.
The isolated push sender remains v3 and was not invoked for a new notification.

Owner check: /update.html → Load latest version, build 68ee9d9b7aa4. Existing
valid sessions can reopen normally when the service is available. If a temporary
failure repeats, Retry connection rechecks stored Auth and admission without
blind password resubmission. Eligible previously admitted accounts can explicitly
open existing saved device data with cloud/AI/push setup paused, then retry from
Home. Rejected sessions remain blocked; no fallback for new/unadmitted identities.
This repairs client recovery, not the underlying provider's ability to guarantee
availability. Connected recovery, actual offline reopening and the exact one-hour
workout reminder still require their respective phone acceptance.


## Preview 48 owner acceptance — connected and airplane-mode opening

The owner reports that the app opened in airplane mode and normally while
connected after the timeout-recovery update. Record both basic connected access
and airplane-mode reopening as accepted; do not ask to repeat those same checks.
Offline opening uses the retained same-account device workspace, not a new online
Auth request. This report does not establish exact full-history comparison,
offline edit/reconnect synchronization, installed-vs-browser launch differences,
or that the explicit outage-continuation button was exercised during a new 504.
The exact one-hour workout reminder remains pending independently.

Updated RELEASE_READINESS.md and FEEDBACK_REBUILD.md only. No runtime changes,
new tests, deployment, notification, backend/account mutation, sharing change,
provider request or data reset. Private preview 48 and sender v3 remain current;
all prior preservation and live-publication boundaries remain in force.


## Local 8.2.0 candidate preparation — no publication

After owner acceptance of connected and airplane-mode opening, prepared a
tracked-Git frontend packager, draft release notes and a preservation-aware
recovery procedure. The candidate targets the existing GitHub project URL and
original public client configuration/account backend. Version 8.2.0 is proposed
in the staged artifact only; root runtime/private preview 48 remains 8.1.1.
The source builder never pushes, deploys, updates a service or reads browser data.

It selects only tracked frontend files and original media/fonts/vendor assets,
excludes beta-report, preview-only outputs, backend/scripts/tests/docs and env
files, preserves manifest identity/config/media bindings and all 124 protected
assets, and emits per-file/archive hashes with deploymentReady=false. Import,
stylesheet, core version, cache and updater queries agree on 8.2.0. Candidate
wording says MENEI account & cloud sync to clarify one-account onboarding.
No IP agreement or deferred speech/wearable/photo work was activated.

Production Worker/D1/Auth integration for AI, exact one-hour live push and final
release/terms review remain prerequisites. A static archive cannot enable the
private backend services at the live URL. Existing beta seats/usage must be
preserved during that later integration. Users need only a MENEI account, email
confirmation as configured, profile/gym setup and notification permission for
reminders; Home-screen install is optional. They do not configure provider keys
or create separate cloud/ChatGPT/OpenAI accounts.

Recovery review found a genuine downgrade limitation: executing the exact
original 8.1.1 LocalStore.snapshot against a synthetic compressed recovery envelope
fails at unshift. The test verifies neither the primary state nor recovery bytes
were overwritten by that failure. A blind original-code rollback is therefore
not a verified recovery plan. Preserve current recovery/sync-base readers and
use a validated forward correction; retain original source as evidence only.
Read-only git ls-remote confirms public main is still the original preservation
checkpoint fa142c3fc7c96c498b73b5943eac12ca49152dfb. No public push/merge occurred.

The three candidate/release/update test files passed (10961.882015 ms). Tests
exercise a real staged archive, hashes, all protected assets, live config/PWA
identity, runtime version/import resolution, zero/unknown field preservation,
new snapshot readback, the exact old-reader limitation, GitHub subpath shell,
notification links and standalone updater destination. The original validation
attempt could not spawn a nested Node syntax checker (EPERM); generated-file
syntax checks run separately through the executor on the final retained artifact.
No test was disabled; package/import/preservation assertions remain strict.
The unchanged runtime baseline retains its earlier 71-file passing run; this is
not claimed as a new full 72-file suite. Root static checks and final artifact
verification results follow with the retained package receipt. No browser/device
or production-backend acceptance is inferred from these checks.


### Retained unpublished 8.2.0 candidate receipt — 2026-10-23

Source commit: `833ed102a4bcf329e882aa72b3369c9613f06b31`.
Directory: `/workspace/work/menei-8.2.0-20261023-rc1`.
Archive: `menei-8.2.0-candidate.tar.gz`, 158247173 bytes; SHA-256
`0e065e13fd76116411dd38f2d81c6697a3825981a374919c44fb4932da20cd0a`.
RELEASE_MANIFEST.json and ARCHIVE.json retain the exact file/archive evidence.
Release notes and recovery instructions are copied beside, outside, the site.
All 170 staged file byte counts/hashes and archive paths/hash/size independently
verified. Executor syntax checks passed for all 34 generated JS/MJS files. Root
static checks passed: 33 modules, 53 offline entries, 162 original identities,
113 WebP assets and 35 retained movement pairs. These checks complement the
three focused passing test files; no new full-suite/device result is claimed.

Local backup branch `backup/pre-release-8.2.0-live-2026-10-23` points to the
read-only verified public main baseline
`fa142c3fc7c96c498b73b5943eac12ca49152dfb`. The artifact is explicitly not
deployment-ready: production AI/Auth integration, one-hour reminder acceptance
and final release/terms review remain. No live push, deployment, backend/audience
change, provider request, credential change or saved-user-data mutation occurred.
Private preview 48 remains the current published private version.
