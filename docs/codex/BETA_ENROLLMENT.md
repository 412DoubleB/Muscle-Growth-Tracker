# Twenty-account MENEI beta

## Authorized scope

The owner approved first-come admission for twenty accounts including the owner,
five AI gym-research attempts each and one hundred total including earlier owner
usage. The later clarification explicitly requires **MENEI sign-in only**:
no ChatGPT account, separate AI account, personal API key or extra download for
any tester. The search runs inside MENEI, using the owner's server-side provider
configuration. This updates the existing app in an isolated preview; it does not
replace or deploy over the live app.

The roughly $1.20 OpenAI estimate is not a hard dollar ceiling. The enforceable
limits are request counts and the existing bounded single-search request.
Failed, cancelled and timed-out provider attempts remain spent. There are no
automatic retries, credit purchases or billing changes. Membership and usage
persist across sign-ins, devices and deployments. The cap counts confirmed
MENEI accounts rather than independently verified natural persons.

## Admission and account boundaries

The Worker validates each service caller's MENEI access token against the fixed
MENEI Private Beta Test Auth endpoint (`bhyrrxrpqaxiwpfxnwpa`). Unverified JWT
claims can reject a request but cannot grant access. The server rejects missing,
expired, wrong-project, anonymous and unconfirmed identities, and accepts only
the identity confirmed by Auth. Caller-supplied IDs, email, user metadata and
Sites identity headers never grant beta membership or AI allowance.

Signing into MENEI joins the beta through a same-origin authenticated POST.
Repeated members retain their place; the twenty-first account sees a beta-full
message and cannot use protected beta services. No email waitlist is collected.
The owner first signs in while native Sites access is owner-only; a permanent
database latch closes bootstrap. First-come access must not open until the
owner's MENEI membership and hosted storage are verified. An unexpected prior
Sites-based owner claim fails closed; do not silently reset or remap that row.

Public app files and the fixed publishable Supabase config allow MENEI's own
sign-in screen to load without ChatGPT. They contain no personal records or
provider secret. The app does not load saved workspaces or start cloud sync
before admission. The server authorizes AI and member APIs independently of
client state. Supabase continues to isolate saved cloud records by auth.uid().
Its public Auth endpoint is not itself a twenty-row signup cap: the limit applies
to beta admission and services. A strict raw Auth-row limit would require a
separately reviewed test-backend admission integration.

The original generic D1 schema is retained, including the historical
site_user_id column name; new member values use the menei: prefix followed by the
verified MENEI user ID. The original owner-trial usage, fixed cohort, additive
migration history and shared provider lease remain preserved. There is no reset
endpoint or automatic seat recycling.

Each tester uses their own MENEI test account and synthetic records. Existing
gym and repeating schedule templates need review during setup. Saved device
workspaces and private backups remain intact. Offline copies and local records
are not remotely revoked or encrypted by online admission; use separate browser
profiles on shared devices. Offline continuation must remain local-only and
must not grant AI or cloud access from a cached admission marker.

## Activation status

The initial ChatGPT-based gate was published as owner-private version 9 with AI
disabled, then superseded by the owner's MENEI-only clarification before public
enrollment opened. Its access policy was never widened. The revised MENEI-only sign-in implementation passed all 35 Node test files,
npm run check and diff checks. Thirty entry UI regressions cover admission,
account transitions, recovery, local offline continuation and reconnect gating.
Eleven Auth tests validate rejection and bounded network behavior; seven Worker
integration groups cover MENEI identity, admission, quotas and prior-owner
transition safety. Native Chromium at 360/430 pixels verified MENEI sign-in,
in-app AI with mocked responses, a full twenty-account cohort, existing-member
return without allowance reset, offline /beta reopening and reconnect
verification. Cloud and AI responses were synthetic; no actual paid lookup or
real Supabase account record was created by these checks.

The existing approved OpenAI key remains in a separate working session's ignored
.env.local. This session cannot read that workspace, and no supported secure
file-to-runtime transfer has been verified. Do not display it, attach it, include
it in a source package or create a duplicate key as a workaround. No paid search
has run. Testers will never perform this owner-side provider setup.

Before opening the beta, verify hosted schema readiness and ownerAccountReady
through the owner-private readiness endpoint, confirm real MENEI account
admission, and verify real account-isolation/email acceptance. Before enabling
AI, securely install the existing server key and verify readiness, then exercise
one approved real lookup. The pending full conversation export and exact photo
approval-to-file links remain documented; they do not block work with sufficient
requirements, and all existing images stay unchanged.
