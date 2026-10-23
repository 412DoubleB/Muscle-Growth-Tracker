# MENEI 8.2.0 production activation record

Owner request: make the update ready to publish and provide one shareable
installation guide, with separate iPhone/Android and manual setup instructions.
The owner subsequently authorized the staged frontend and service rollout. Read
the latest receipts below for actual deployed state; the original plan and
intermediate candidate evidence remain historical. No account/history migration
was performed.

## Exact release scope

- Frontend remains `https://412doubleb.github.io/Muscle-Growth-Tracker/`.
  Preserve its manifest identity, account backend, schema 8, namespaces and all
  protected media. The guide will be `start.html` under that same path.
- New testers create one MENEI account in the original live Auth project
  `tdmwpcueqxtnqyonucam`. They need no provider accounts/keys. Email confirmation
  and each device's notification permission remain user actions.
- Add `/api/live/{join,status,research,research-status}` to the EXISTING Sites
  project `appgprj_6ad593d6f15481918ded32373b877b03`, on the existing domain
  `https://menei-private-beta.crispcrown515.chatgpt.site`.
  Public API requests use original live MENEI Auth, exact-origin CORS and bearer
  verification. They use the EXISTING `GYM_AI_LIMITS` D1 campaign and existing
  server-side OPENAI_API_KEY. No new key, reset campaign or model test is needed.
- Native Sites access must permit anonymous API transport when this is approved.
  The release Worker independently restricts all non-live-API routes, including
  the retained preview/config/assets, to the platform-authenticated Site owner.
  Use the documented platform-injected Site-scoped ID, not email, client input
  or a user-editable claim. The existing private preview app/assets are retained;
  public consumers use the GitHub frontend and do not sign into ChatGPT.
  Verify worker-first routing and unauthenticated preview denial before activating
  frontend AI. Never expose owner preview/workspace records as public assets.
- The first 20 campaign seats include the prior owner. Five attempts each,
  100 total including earlier usage. Existing failed attempts still count.
  New production members use `menei:live:<Auth UUID>`; the original campaign
  owner's approved live UUID maps to their existing preview membership UUID.
  This is a service membership link only, NOT a transfer of workouts/accounts.
  No automatic email matching, second owner allocation or new owner allowance.
- Read-only preflight found one prior campaign member and no active lease.
  The screenshot email currently has NO matching original-live Auth account.
  The owner confirmed the screenshot email for live use. A live account under
  that email still needs to be created/confirmed by its owner during the staged
  release before its UUID can be linked to existing preview usage. Do not
  invent a UUID or create an account for the owner. If a second preview member
  exists by activation, stop and review that member's allowance link too.
- Existing live reminder function `mgt-beta-send-reminders` version 2 is active;
  existing `mgt-beta-reminders` job 1 runs minutely. Vault configuration names are
  present. Keep that URL, cron job, cron secret and existing VAPID keypair.
  Replace the sender with the prepared original-project-only handler and add the
  service-only delivery ledger in `supabase/production/push-delivery.sql`.
  Do not copy the isolated owner pilot, isolated credentials or its VAPID keys.

## Operator actions after the release is authorized

1. Confirm the owner's original live account and the exact existing beta owner
   membership. Record the approved link privately; do not publish account UUIDs,
   emails, tokens or state exports. Set server variables
   `MENEI_LIVE_OWNER_ID`, `MENEI_LINKED_BETA_OWNER_ID`,
   `MENEI_PRIVATE_SITE_OWNER_ID` and the existing live publishable client key as
   `MENEI_LIVE_PUBLISHABLE_KEY`. These are not tester setup tasks.
2. Inspect current service/native versions and recheck account/D1 counts, usage,
   leases and original main ref. Capture the actual existing sender source and
   deployment metadata for a preservation-aware recovery plan. Do not retrieve
   private key values or record raw device endpoints. Keep pilot/production
   configuration and user data distinct.
3. Pause ONLY the named live cron job using `cron.alter_job`; do not unschedule
   it or reset completed slots. Apply the reviewed creation-only delivery SQL to
   the live project, record the native generated migration version, then run
   rollback-only permission/lease tests and security advisors on that schema.
   The local WASM Postgres check is evidence, not a remote acceptance result.
4. Deploy the prepared sender to the EXISTING function slug, with its pinned
   web-push dependency and explicit relative deno.json import map. Keep existing
   own-cron authentication / verify_jwt=false. Restore the original job schedule
   only after configuration/authorization checks pass. Do not send a test push
   or model request without a requested device test.
5. Push and save the exact reviewed Sites source + archive, preserving the Site
   and D1 IDs. Install the release multiplexer, retaining original preview files.
   Add `MENEI_LIVE_API_ENABLED=true`, start with `MENEI_LIVE_PHASE=owner`, and preserve the existing AI flag/key and
   private-preview variables. The explicit public API/native audience change is
   part of the release authorization, not assumed from private preview approval.
   Verify allowed CORS/preflight, unauthorized live requests rejected, no research
   reservation on GET/invalid requests, owner-only private routes, same D1 usage
   and no platform sign-in redirect for anonymous production API transport.
6. Verify original live Auth email confirmation/recovery redirect includes the
   exact live URL with trailing slash. Preserve existing allowed URLs. This
   management setting is not exposed by the current Supabase connector; verify
   it in the owner's Dashboard if needed. Test actual mail/callback on a permitted
   test account without sharing passwords/tokens. Do not label it verified from
   the old `authRedirectConfigured=false` client marker or a creation response.
7. Only after the owner-only production pilot and service verification, set
   `MENEI_LIVE_PHASE=open`, enable `live-services.json`, remove the guide's
   pending-release notice, produce a fresh fully hashed frontend artifact and
   record its exact source/environment/service versions. Review the diff from
   original main. Merge/publish the existing live app only under the explicit
   release authorization. Do not push the prepared candidate as though it already
   includes activated services.
8. Verify hosted version/assets, account callbacks/sync, offline Home reopening,
   original data/zero values and a future one-hour workout notification on an
   opted-in device. Android local and two-minute tests were accepted in the
   private preview; the final production origin and Apple device need their own
   physical checks. Synthetic checks do not prove sound, email or delivery.
9. Send `https://412doubleb.github.io/Muscle-Growth-Tracker/start.html` only after
   that guide and activated release are published. That path is planned, not
   currently a verified updated/public guide. A ready-to-copy invitation is in
   USER_SETUP.md. It must not send new testers to the owner-private preview.

## Preservation and recovery

The SQL adds one new table and two service-only invoker functions. It does not
alter original state, revision or push tables/policies, or delete history. Claim
leases bind subscription, kind, slot and random token. Test/workout delivery slots
are separate. Legacy completed slots and in-flight original leases are honored.
Expired push subscriptions may be removed by the sender as before; no workout
record is removed. See RELEASE_RECOVERY.md before any code downgrade.

Pause only the new live API flag and/or the named live cron job if needed.
Retain campaign membership, counters, server secrets, device subscriptions and
delivery ledger. Restore the captured sender version only with a reviewed
deduplication plan; do not blindly replay previously delivered reminders.
No destructive database rollback, account migration or automatic data reset.

## Launch scope and remaining evidence

Health notice remains implemented. IP-protection terms are a draft; no new
agreement is activated. Spoken workout cues stay disabled; wearable sync,
photo corrections and further mascot refinement stay deferred.
The guide separates calendar export (optional, imported copies) from push and
open-app rest audio. Home-screen installation is required for iOS push, optional
for ordinary browser use/Android. Notification permissions apply per device.
Actual upcoming one-hour delivery, production email/redirect and Apple physical
acceptance remain release checks, not claims established by local tests.


## Email confirmation readiness — October 23 owner check

The owner reports the exact original live URL with trailing slash is saved in
both Site URL and Redirect URLs. This is owner-reported configuration acceptance,
not a captured real mail delivery/callback. No redirect-setting change is needed
from testers.

Custom SMTP readiness still needs confirmation. Supabase documents that its default
mailer only sends to project-team addresses and is not for production. Before
inviting outside testers, verify a configured production mail service/sender and
successful confirmation and reset delivery to a permitted non-team test email.
Do not add testers to the Supabase project team or disable email confirmation to
bypass this requirement. SMTP settings/credentials belong in the owner's secure
Supabase Dashboard, never chat, source, the client bundle or tester instructions.
Current connector tools cannot read or change Auth SMTP management settings.
Reference: https://supabase.com/docs/guides/auth/auth-smtp .

This is an operator dependency. It does not add a service account or download for
MENEI users. If a mail provider is not configured, public signup is not ready; do
not advertise the full release or send the launch invitation.


The owner subsequently supplied a screenshot and explicit confirmation: Custom
SMTP is OFF. They use Gmail and have no business domain/email. See EMAIL_SETUP.md
for the owner-only configuration path; no credential/configuration is complete.
All 74 versioned release test files passed. Current prepared inputs are rc5 from
182075eceaec44e3a6770092ab5624a9333288a3; source is the 8.2.0 release worktree.
Public sharing and production activation remain pending, not implied by these
test results. The production account and mail dependencies remain real.

## Authorized first publication stage — October 23

After explicit owner approval, the exact rc5 frontend was published through PR 2
(https://github.com/412DoubleB/Muscle-Growth-Tracker/pull/2). Staging source is
0f17e76ec61696e7a3eeac354dc8d4d6e6739e7d, merged main is
0249f68c523ce2dd97f4ee01672ffb3a40c07d6a. All 174 candidate runtime files were
rechecked against the merged Git objects. The runtime-only stage intentionally
excludes development/private continuity documents and server inputs. The main
repository test/package metadata still describes the old baseline; the complete
74-file release test evidence belongs to the versioned release checkout.

AI configuration remains false and the guide retains its pending-release notice.
No service/backend/native-audience changes are authorized by this first-stage
approval. SMTP form save is owner-confirmed; real email/callback verification and
owner live-account creation still require the owner device. Network policy blocks
direct github.io HTTP reads in this session, so hosted delivery is checked through
GitHub Pages deployment receipts plus the owner device, not claimed from Git reads.
GitHub Pages run 39981933296 tracks this publication. See the private local
work/menei-8.2.0-staged-publication.json receipt for current provider outcome.

## Service rollout receipt — October 23

The owner explicitly approved service activation after confirming their live email
and cloud sync. Live reminder sender version 3 is deployed at the original slug,
with migration 20261023160936 and the original minute cron job 1 active. Native
permission checks and rollback-only lease/deduplication assertions passed. The
actual scheduler returned ready:true, zero failures and zero sends (no live push
subscriptions). Physical live-origin notification acceptance remains pending.

Automatic approval review rejected changing the original preview host's native
audience to public. That change was not applied. The safer implementation keeps
the original Site natively custom/owner-private and adds an API-only transport
Site, appgprj_6adb8996cdf48191930e235637773a9a, at
https://menei-live-api.crispcrown515.chatgpt.site . It has no frontend or assets
and forwards only the four pinned /api/live routes. A server-only native service
access credential is transferred directly between native tools in session memory;
it is stored as a Sites secret, never source, files or output. The original
service still verifies live MENEI tokens and owns the existing D1/key/counters.
No second AI campaign or allocation was created. The API bridge forwards no
cookies or platform identity, refuses arbitrary paths/queries/redirects and does
not forward Set-Cookie/Location. Controlled route/CORS/header tests passed.

A one-time operator check under original native owner-only access captured a
SHA-256 binding of the platform Site identity after the owner opened the check.
The retained preview gate accepts that binding; raw platform identity was not
logged or committed. Temporary operator code was removed from deployment 50.
Original Site: commit 57d5d0c823eef5e5dc4cbd1a92cf7cffc1938770, environment 7.
API-only Site: commit b4f6be4bc7e095e8fdea49b880c2bbec29ee78cb, environment 1,
version 1. Both native deployments succeeded. Gateway remains phase owner.
The owner's existing five attempts are exhausted and stay exhausted. New beta
accounts will receive five each within the existing 20/100 caps after opening.

PR 3 connects the frontend to the pinned API-only origin and changes the service
worker build bytes to refresh the shell. Source fd9162b84c92be8b6a9e5b81784a331d1f3bfa93,
merged main b57de56772217ca7b32ebdb46335ec3c464c0fd8. Version remains 8.2.0; the
installation guide stays pending. Focused account/gym/live-service/update checks
and static checks passed. No paid lookup was made. Owner browser admission and
real notification checks precede phase open and release invitation. Direct HTTP
reads of hosted URLs remain blocked by this executor's network policy; provider
deployment receipts and owner browser observations are recorded separately.

## Accepted AI link and open limited beta — October 23

The owner reports that the live AI gym beta card confirms a beta place. Native
private Worker logs independently show POST /api/live/join returned 200 in owner
phase. The API bridge uses native service access without browser login headers;
MENEI authorization travels inside a bounded HTTPS request body, not a custom
header that could be recorded in header logs. It is restored only inside the
natively private Worker and verified against the unchanged live Supabase Auth
project. Exact packaged bridge/private POST and GET integration passed, as did
focused access-control tests. Redirects are never followed with credentials.

Current private service source 6779478a550fbe226ecac50f288f5fa143ea80f7, saved
version 52, environment 9 with MENEI_LIVE_PHASE=open. Deployment
appgdep_6adb90f97040819195b339069dd2fbc2 succeeded. Native audience remains custom,
with one owner. Public API-only source 9b2995d63fdb83c8be67be5abb997b75f1a34a66,
saved version 3, environment 1; deployment
appgdep_6adb8e2b74d08191aace2e8624ccb5dd succeeded. Existing D1 membership still
contains one owner; the owner's five prior attempts remain used. No tool-driven
paid model request, allowance reset or extra owner seat was made.

One live push subscription and a completed test delivery slot are now recorded.
The scheduler repeatedly returned HTTP 200, ready:true with no failures. This
proves provider acceptance, not the phone's visible/sounding notification; owner
physical receipt is pending. Original private-preview immediate/closed-app device
checks were previously accepted. iPhone physical acceptance, exact production
one-hour workout delivery, password-reset delivery and outside-team mail delivery
remain unverified. Do not broaden these claims based on synthetic tests or a saved
form. The limited-beta guide includes each user's device tests and troubleshooting.

## Final Android device confirmation

The owner explicitly confirms that the live closed-app two-minute test
notification arrived. This accepts physical Android delivery at the live origin;
no additional claim about sound, iPhone or the exact one-hour workout trigger is
implied. Live AI admission, email confirmation and cloud sync are owner-accepted.
The limited-beta guide is cleared for publication under the existing release
authorization, with the remaining platform/timing checks disclosed in metadata.
