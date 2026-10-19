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
