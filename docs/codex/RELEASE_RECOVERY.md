# Release recovery procedure

Preparation only; no rollback, deployment or data operation has been run.
A source archive is not a backup of phone/browser or cloud records.

## Checkpoints to retain before publication

- Capture the actual current live Git/Pages source and deployed artifact again
  before publication. The preservation intake checkpoint is
  `fa142c3fc7c96c498b73b5943eac12ca49152dfb`; it is not assumed to be a fresh
  production deployment receipt.
- Retain the exact proposed release source, frontend archive, per-file/archive
  hashes and the approved live backend/environment changes. Keep private data
  exports separately; never put user records or credentials in the repository.
- Retain the known owner-private preview 48 source/version and its unchanged
  isolated backend separately. Its test-project configuration is not a live-app
  rollback artifact and must never replace live accounts.

## Recovery reader compatibility

The original 8.1.1 LocalStore.snapshot parses an array directly and calls unshift.
The new recovery format is a losslessly compressed JSON envelope. Executing the
exact original reader against a synthetic new recovery envelope fails before
saving. A blind source downgrade therefore breaks recovery operations even when
schema 8 primary records still load. Older cloud code also lacks the new sync-base
reader. Do not describe the original checkpoint as a verified safe data downgrade.

Prefer a forward correction from the last reviewed preservation-compatible code.
Any emergency frontend must retain recovery.mjs, vendor/lz-string.mjs, compatible
LocalStore snapshot/read behavior and compatible cloud sync-base reading, together
with their module/offline dependencies. Verify new compressed and older JSON
copies, current primary records, unknown fields, zero loads and original legacy
bytes on a separate synthetic account/origin before release. Do not decode or
rewrite the owner's only copies as an improvised rollback.

## Operational recovery after an approved live release

1. Identify whether failure is frontend code, account service, AI or reminders.
   Preserve existing records, auth, backups, subscriptions and quota/seat counts.
2. If the problem is an added service, pause only its reviewed production switch
   or scheduler as specified by that service's release receipt. Keep keys, saved
   delivery slots and membership/usage history. Do not touch the test pilot or
   original services by guessing a project/job identifier.
3. Prepare and validate the preservation-compatible correction, preserving the
   original app URL/path, manifest id/scope and account backend. Use a fresh
   app-file cache identifier and the existing update flow; do not clear browser
   storage, unregister the app, delete databases or run destructive down-migrations.
4. Publish only after explicit authorization for the concrete correction. Verify
   the deployment, identity/path, account isolation, offline reopening and saved
   records. Restore optional services only after their failure is understood.

This procedure does not promise provider availability or lossless downgrade of
unreviewed backend/data changes. The current candidate has not changed the live
backend, production records or sharing policy.
