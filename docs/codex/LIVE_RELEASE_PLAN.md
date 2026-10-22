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

1. Finish the scheduled one-hour reminder and installed/offline device checks
   in RELEASE_READINESS.md; preserve prior acceptance and unresolved results.
2. Review the production service scope above before claiming AI and one-hour push
   as live features. A frontend-only maintenance update and a full service-backed
   release have different prerequisites; neither is silently selected here.
3. Prepare the chosen release version, exact artifact, release notes and rollback
   reference from a clean reviewed source. Recheck project-path/offline behavior
   and preservation; exclude private exports, credentials and preview-only files.
4. Present that concrete release and required backend changes for explicit owner
   authorization before any GitHub main merge, live backend change or publication.

This plan does not request new credentials, reset data or expand access. Current
private and live accounts, AI usage limits and all protected media stay intact.
