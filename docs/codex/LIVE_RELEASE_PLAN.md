# Live update preparation

Status: preparation only. No live publication, backend mutation, account migration
or audience expansion is authorized by this document. Preserve the existing live
URL, PWA identity, original cloud accounts and all saved history.

## Candidate scope

Include the accepted maintenance, training, nutrition, storage, unit preferences,
superset pairing, workout-order, automatic rest and Home improvements recorded in
FEEDBACK_REBUILD.md. Keep daily quotes text-only and rest chimes unchanged.
Spoken workout cues are disabled in source for the launch candidate; their
implementation is retained for later work. Wearable sync and photo correction
remain deferred. No new IP agreement has been activated.

## Deployment differences that must be resolved before live publication

| Component | Existing live path | Current private candidate | Release requirement |
| --- | --- | --- | --- |
| Frontend | GitHub Pages project path `/Muscle-Growth-Tracker/` | Sites origin root | Preserve project-relative assets, manifest identity, service-worker scope and storage keys; never copy preview identity into the live app |
| Account/cloud | Original live Supabase project and accounts | Fixed isolated test project with MENEI beta admission | Preserve live accounts and namespaces; no automatic account or history transfer |
| AI gym research | No corresponding same-origin Worker API on GitHub Pages | Sites Worker, D1 membership/quotas, verified test-project identity, server secret | Needs an explicitly reviewed production service/auth route before being presented as available at the live URL; static publication cannot provide it |
| Workout push | Original live reminder configuration | Isolated owner pilot, private VAPID material, sender v3, minute scheduler | Needs a separately reviewed live deployment/access configuration and device opt-in; do not copy private keys or assume preview subscriptions follow the live origin |

The reviewed Worker accepts only the isolated test project, uses same-origin POST
checks and requires the existing beta campaign. The frontend uses private-entry
markers and runtime configuration to select that flow. Pointing an existing live
account at the preview API is not a supported production integration. Do not
weaken identity/origin checks, replace live Auth with test Auth, reset budgets or
claim a static update enables the tested backend services.

## Concrete publication steps remaining

1. Connected and airplane-mode reopening are owner-accepted. The exact scheduled
   one-hour workout reminder remains pending; preserve those separate results.
2. Review the production service scope above before claiming AI and one-hour push
   as live features. A frontend-only maintenance update and a full service-backed
   release have different prerequisites; neither is silently selected here.
3. A local 8.2.0 frontend candidate and reviewed packaging/check scripts are now
   prepared; see RELEASE_8_2_0.md. Keep deploymentReady=false until the production
   integration is ready. See RELEASE_RECOVERY.md: a blind downgrade to original
   8.1.1 is incompatible with compressed recovery copies. The live main ref was
   read-only verified at fa142c3fc7c96c498b73b5943eac12ca49152dfb on 2026-10-23.
   Capture the actual final artifact/backend receipt before publication.
4. Present that concrete release and required backend changes for explicit owner
   authorization before any GitHub main merge, live backend change or publication.

This plan does not request new credentials, reset data or expand access. Current
private and live accounts, AI usage limits and all protected media stay intact.


The intended user setup is one MENEI account, which also handles cloud sync.
Email confirmation and profile/gym setup are normal onboarding, not separate
service accounts. Notification permission is needed for reminders; Home-screen
installation is optional. No ChatGPT/OpenAI account, API key or extra AI app is
required. Live AI/reminder integration and first-20 allowance continuity remain
owner-side deployment work; do not shift that setup to testers.


## October 23 production preparation

The concrete service/permission rollout is now in PRODUCTION_ACTIVATION.md; the
user-facing instructions and invitation are in start.html and USER_SETUP.md.
A new rc2 frontend and separate service archive retain original live identities,
the existing D1 campaign and the current owner-preview client. A local Postgres
run verified the proposed service-only reminder ledger/leases and preservation.
Neither the service archive nor a frontend package has been deployed. The prior
owner-private preview 48 is unchanged.

The owner confirmed the screenshot email is the intended live MENEI email, but
read-only Auth metadata finds no account under it in the original live project.
Creating/confirming that account is an owner action, not a reason to transfer
private-preview records automatically or allocate a new AI owner seat. A staged
release can first publish the corrected frontend with AI disabled and the guide
marked pending, allow the owner to confirm their live account, then link only the
service allowance and verify owner-only production before opening the campaign.
This staged publication still needs explicit release authorization. Do not call
the first frontend stage a completed full release or send the invitation then.
