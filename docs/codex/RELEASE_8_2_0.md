# MENEI 8.2.0 candidate

Status: unpublished frontend candidate. The existing live app and owner-private
preview are unchanged. `deploymentReady` stays false until the live service
integration and final publication review are complete. This is an update for the
existing app URL, not a replacement account system or a second fitness app.

## User setup at launch

1. Open the MENEI link; create one MENEI account and confirm the email if prompted.
   That same account provides cloud sync. No separate Supabase/cloud account.
2. Review the welcome/health notice and set up profile, nutrition preferences,
   gym inventory and workout schedule. Existing users keep their saved records.
3. Allow notifications on each device for workout reminders. Home-screen
   installation is required for iPhone/iPad closed-app push on supported systems;
   it is optional for ordinary browser use/Android. See start.html for separate
   Apple/Android installation and manual setup instructions.

AI gym search runs inside MENEI, with no ChatGPT/OpenAI account, personal API key
or extra AI download. The approved beta allows the first 20 confirmed accounts,
five attempts each, 100 total including prior usage. Internet access is needed
for cloud sync and AI; retained admitted device workspaces support local use.
Public admission is not open yet; the current preview remains owner-private.

## Included frontend changes

- Home startup, workout-duration estimates, visible background artwork, daily
  on-screen motivation and completed-training streaks.
- Metric/US preferences and compatible ingredient, pantry and shopping quantities.
- Progressive-overload advice from completed history and checked current sets;
  explicit application preserves entered values and independent exercise loads.
- Automatic/manual superset pairing with A1/A2 labels, pairing cautions, protected
  same-day program changes and recorded exercise-order/fatigue context.
- Automatic 60-second set rests and 3-minute exercise/pair completion rests; the
  completion screen closes at zero and supports Stop. Existing four-chime audio
  and mute controls remain.
- Storage quota recovery, preserved sync/conflict copies, meal/pantry/leftover
  safeguards and read-only backup review before explicit merge. Existing JSON
  recipe import remains available; URL/photo import is not newly included.
- First-use health notice and improved account-outage recovery in the private
  beta. Formal IP terms remain a draft; no new ownership agreement is activated.

AI location research and editable confirmed/estimated equipment suggestions,
plus one-hour closed-app workout reminders, remain intended release features.
Their production backend connection is still required before this draft can be
published with those features available at the existing live URL. The static
frontend archive alone does not provide the Sites Worker/D1 or push scheduler.
The original live account backend/configuration and PWA identity are preserved.

Spoken workout cues, wearable integrations and exercise-photo corrections remain
post-launch/deferred. Daily quotes stay text-only. Mascot refinement is deferred
following provisional acceptance. Original media and bindings are preserved.

## Packaging and evidence

Run from a clean reviewed source checkpoint:

    node scripts/build-release-candidate.mjs /workspace/work/<new-empty-directory>

The builder reads tracked Git objects, excludes backend/source/private files,
uses version 8.2.0 consistently for the candidate's runtime/imports/cache/updater,
and preserves config, manifest identity and 124 protected image/font assets.
It writes a frontend tarball, per-file hashes and an unpublished release manifest.
It never pushes, publishes, changes sharing or touches a device workspace.
The generated account heading says MENEI account & cloud sync to avoid suggesting
that users need two accounts. The private preview remains on its current version.

The runtime baseline passed all 71 test files before packaging work. Candidate
checks separately verify generated version/module paths, asset identities, saved
zero loads and unknown fields, recovery readers, GitHub project-path cache and
notification/update links. No physical browser/device acceptance of the staged
8.2.0 artifact is claimed. See DEVELOPMENT.md for exact results and artifact
receipts. REVIEW: live AI service, live reminder setup, pending actual one-hour
reminder acceptance, final health/privacy/terms scope and owner authorization.

See RELEASE_RECOVERY.md before planning any source rollback. The original live
snapshot reader is incompatible with the newer compressed recovery format.


## Prepared production service inputs

The rc2 frontend and service archives are prepared from commit `4582bab9d2e6`.
Live account verification, original campaign allowance linking, exact-origin CORS,
owner-only production testing and retained owner-preview protection are implemented
in reviewed source. The new reminder handler reuses the existing live sender URL,
Vault configuration and device subscriptions, with a separate service-only delivery
ledger. These changes are prepared, not activated. See PRODUCTION_ACTIVATION.md.

`start.html` and USER_SETUP.md contain the installation/permission instructions and
ready-to-copy launch invitation. The planned public guide link is
https://412doubleb.github.io/Muscle-Growth-Tracker/start.html . Do not describe it
as published/available until activation and hosted verification. Both platform
sections separate notification permission, media/rest sounds, optional calendar
import and backups. Ordinary testers configure no provider/cloud keys.
