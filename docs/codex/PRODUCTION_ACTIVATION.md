# Prepared 8.2.0 production activation — not applied

Owner request: make the update ready to publish and provide one shareable
installation guide, with separate iPhone/Android and manual setup instructions.
This prepares the concrete changes. It does not itself authorize publishing,
changing a native audience, changing the live backend or migrating account data.

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
