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
