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
   or exports into the source or deploy archive. Current preview configuration
   remains device-local, with sync and scheduled push disabled.
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
