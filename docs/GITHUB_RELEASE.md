# GitHub release 8.0.0

Source: reviewed private beta 8.0.0-beta.8, commit 739ded0cb7c4ad99f1d529c64df7e2d150bc3db9.
Authorization: owner approved the current feature set for a new GitHub version on October 17, 2026.

The release preserves app URL/scope, original storage keys and existing backend namespaces. Device migration copies data into the V8 workspace before the first application save. It never clears authentication, old app records or browser databases. Legacy snapshots and conflicting dates are retained. Existing V8 settings are preserved on a merge.

Repository: https://github.com/412DoubleB/Muscle-Growth-Tracker. The existing `main` branch publishes the app from its root at https://412doubleb.github.io/Muscle-Growth-Tracker/.

The exact pre-upgrade commit is `1134fa2b808351c3b2d76f5bd412a48fe798ce7f`, preserved and verified in `backup/pre-v8-2026-10-18`. A separate source ZIP was also verified against all five original Git blob hashes. The new release is applied on the existing repository history; the rollback branch is retained.

Prepublication validation passed: 111 automated tests, 21 JavaScript syntax checks, 32 offline shell URL checks, and all 113 shipped WebP asset hashes. Publication is verified separately through the repository's GitHub Pages deployment and byte comparisons against the tested release. See the repository Actions page for deployment status; this document records the release inputs and validation, rather than device acceptance.

Phone/browser rendering, two-device real-account reconciliation and actual closed-app push delivery remain tests to perform during continued use. The owner has approved moving forward while issues found later are addressed.

The additional release checks cover first-launch import, exact source-key preservation, duplicate prevention, existing-V8 settings, legacy zero loads/completion/RIR, recipe yields, kg/lb preservation, quota/malformed-data recovery, account isolation, actual app bootstrap and the GitHub project subpath for manifest/offline/reminder URLs.

Final asset verification found five empty WebP files in the beta package. Release preparation restores them from their original PNG identities with full-size lossless encoding and pixel-by-pixel equality checks. Original hashes and mappings stay unchanged; all shipped WebP bytes must match the manifest. The static validator now rejects empty, invalid-header, wrong-size or wrong-hash image files.
