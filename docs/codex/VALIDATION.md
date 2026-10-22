# Handoff validation

For current private-update validation and remaining device checks, read
[RELEASE_READINESS.md](RELEASE_READINESS.md). The results below describe the
original preservation intake, not the latest preview's regression status.

## Current baseline rerun — 2026-10-19 UTC
Pinned commit: fa142c3fc7c96c498b73b5943eac12ca49152dfb (8.1.1).
Environment: Linux, Node 24.19.0, UTC. package.json supports Node >=22.

| Check | Observed result |
| --- | --- |
| npm test | 124 tests; 123 passed, one failed |
| Failing test | tests/ui.test.mjs: "generator form previews a block and saves active training preferences" |
| Failure | Assertion expected 16, actual 15, at tests/ui.test.mjs:31 |
| npm run check | Passed; see check output in the private continuity pack |
| Runtime fixes | None; failure retained for read-only investigation |
| Browser/mobile QA in this handoff | Not performed |
| Live Supabase / email / device / push checks in this handoff | Not performed; no backend mutations |
| User history backup in this handoff | Not exported; source backup does not include phone/browser or live account records |

Earlier 8.1.1 documentation reports 124 tests and desktop/430/360px/offline Chromium checks passing at release. Preserve that historical report, but do not describe it as the current rerun result. The generator mismatch may involve test date/environment assumptions; the cause has not been established. Do not change the test expectation without investigating the actual behavior.

## Preservation verification
BASELINE.json records all 194 original tracked files: Git blob SHA, byte length and SHA-256. The handoff adds AGENTS.md and docs/codex/* only. None of the original runtime, images, manifests, release metadata, test files, backend code or existing docs is edited. Verify the remote main ref remains at the pinned source commit after publishing the documentation branch.

## Later acceptance checklist
These items are not authorized mutations during the intake task:
- Real phone/browser data export and recovery using a separate test origin/account; compare exact session/set counts, units, zero loads and conflict copies.
- Profile/nutrition preferences, 6–9 compatible generated lifting exercises, all splits/focus prescriptions, long-running continuation and saved short-session protection on the actual device.
- Superset progression separation, session locking, workout swaps and full preserved revisions.
- Recipes, imports, existing meal snapshots, allergy exclusions, leftovers, pantry and grocery allocation.
- Auth URL allowlist including the full app path/trailing slash; confirmation and password-reset delivery; custom SMTP status if needed. No keys or credentials in the repo.
- Two-device/offline sync, concurrent edits/conflicts, account separation and recovery.
- Noon closed-app push on an installed/permissioned device, time zone and completion suppression.
- Mobile/offline/service-worker update regression checks with synthetic data before an owner-approved release.

A real private beta needs access controls or local-only testing. Keeping a branch off main prevents this handoff from publishing over the live app; it does not make a public repository private.

