# Private owner push pilot

Current status: the owner confirmed immediate notification display and the
two-minute closed-app test. Exact one-hour workout reminder delivery remains
pending. The isolated sender is version 3 with high delivery urgency; preview 47
and runtime revision 6 are current. The earlier setup/diagnosis sections below
describe their original stage, not the latest acceptance status. See
[RELEASE_READINESS.md](RELEASE_READINESS.md) and DEVELOPMENT.md for current checks
and deployment receipts. Live-app push and broader pilot access are unchanged.

The owner requested built-in one-hour workout reminders and clarified that a
calendar-only path does not satisfy that request. This stage configures the
isolated test backend and owner-private preview for real Web Push. The live
GitHub app and its original Supabase project are unchanged. No notifications
were sent to a real device during setup; owner permission and phone acceptance
are still required.

## Behavior

Settings contains a usual workout start time and its own IANA time zone. Saving
it preserves the existing daily reminder time, meal choices, unknown fields and
history. Failed writes restore the previous complete workspace. Home shows the
usual start on current/future uncompleted lifting/running days. It is planned
scheduling information, never an invented historical start time.

On the owner pilot, save that time, choose Enable push on this device and allow
browser notifications. Test with app closed schedules a server test roughly two
minutes later; the minute scheduler normally makes it arrive in 2–3 minutes.
The test belongs to that subscription, not every device. Device opt-in is
separate from shared schedule preferences. The sender chooses the newest saved
schedule using existing reminder timestamps, so closing before main-state sync
does not overwrite a freshly registered device's settings or suppress its test.
Disabling unsubscribes this device; other devices keep their own opt-in.

Working reminders are due one hour before the saved start. The sender checks
both today's and tomorrow's local workout date, including reminders on the
previous evening. Completed, skipped, deleted and recovery days are excluded.
Meal preferences and the prior daily-time path remain available. Repeat clock
times use the earlier occurrence; nonexistent DST times are not silently moved.
The phone/OS still controls notification permissions, background restrictions
and actual delivery. The app cannot guarantee delivery through a force-stop or
blocked notifications.

Calendar export remains optional. Explicit workout times create UTC events with
one-hour alarms and motivational text. Without that setting, legacy floating
calendar events and their 15-minute alarms remain unchanged. Event identities,
recorded gyms, completed/skipped alarm suppression, escaping and UTF-8 folding
are preserved. Imported events do not automatically sync with later app edits.

## Server and access controls

Only isolated project `bhyrrxrpqaxiwpfxnwpa` is changed. The new
`menei-push-reminders` function rejects a different project and authenticates the
scheduler through a 96-character random secret. JWT gateway checking is disabled
because the function performs this server-secret authentication itself. VAPID
private material is generated inside the Edge runtime and stored in encrypted
Vault through service-only RPCs. It never passes through tool arguments,
terminal output, client code, local env files or logs. Existing key namespaces
are not rotated or overwritten. Only the public VAPID key is published.

The private pilot allowlist contains the existing confirmed MENEI owner account.
RLS adds a restrictive pilot predicate to the existing own-user policy. All
privileged configuration/key/claim functions are private-schema definers with
empty search paths and service-only invoker wrappers. The public config table
contains a public key only and grants read access intentionally. Up to five
device subscriptions are allowed per pilot account. No workout/auth/history
rows are rewritten.

Claim/finish leases use random tokens and separate bounded deduplication slots
for workouts, meals, tests and legacy messages. A test cannot reset a previously
sent workout slot; an old job cannot finish another job's lease. Only approved
FCM/Mozilla/Apple/Windows push hosts receive Web Push. Expired 404/410 device
subscriptions are removed; workout/history records remain intact. Logs and
responses contain static status/counts, not subscription endpoints, secrets or
workout payloads.

The scheduler `menei-private-beta-push-v1` runs once per minute. It uses pg_cron,
pg_net and an internal Vault lookup rather than embedding a credential in job
text. This uses existing Supabase resource allowances (about 43,200 scheduled
invocations per 30 days); it does not use OpenAI searches or alter their budget.
The first-20 membership, D1 accounting, website sharing and AI keys are unchanged.
Sites runtime revision 6 adds only the push flag and public key. Readiness is
limited to private bootstrap mode; the client also requires the signed-in owner
role. Other accounts remain disabled.

## Applied source and verification

Migrations:

- `20261022182210_menei_private_owner_push_pilot.sql`
- `20261022182451_menei_push_pilot_service_policy.sql`

The CLI could not create local migration files in this executor (read-only
telemetry path in 2.121.0; the 2.81.3 installation also failed). Native migration
operations generated the canonical versions above; local files use those exact
server-returned names and applied SQL. The initial direct cron-table update was
rolled back atomically, confirmed by absent tables/extension, and replaced with
the documented `cron.alter_job` API. No partial migration was retained.

The Edge bundle contains index.ts, logic.mjs, schedule.mjs, legacy.mjs and
its deno.json. The browser and sender schedule modules are byte-identical,
checked by tests. Original `send-reminders` files remain unchanged. The deployed
function is version 2, bundle SHA-256
`7dd824ed0dbe396a4439c7ab04102a8222ce5f600378ed9396475e576717a457`.
The existing function's redeploy required an explicit relative deno.json import
map path; the stale absolute path was rejected without replacing version 1.

Real database tests used temporary subscription/pilot rows inside rollback-only
transactions. They verified own-account writes, other-account invisibility,
service-only configuration, five-device limits, duplicate claims, wrong-lease
rejection and independent test/workout deduplication. No device was contacted.
The first scheduled HTTP responses were 200 with ready=true, sent=0 and failed=0.
Initial retained counts stayed one workspace, five revisions, zero subscriptions.
The owner pilot was then enabled; actual device subscription remains opt-in.

Security advisors show no new findings after the explicit service-only policy.
The prior unrelated warning remains: leaked-password protection is disabled.
It was not changed in this task. See
https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection.

## Pause and rollback

Pause the scheduler with `cron.alter_job` for the job named
`menei-private-beta-push-v1`, setting active=false. Set the Sites
MENEI_PUSH_ENABLED flag to false and deploy the chosen saved version to apply
that revision. Disable the pilot row if access must be revoked. Keep Vault keys,
workspaces, revisions and original app identities; do not clear or reset user
data. Existing browser permissions can also be revoked through device settings.


## Private preview capability correction

The owner reported that Settings showed “Scheduled push is not active for this
account” after successful sign-in. The deployed worker and revision 6 were ready,
but loadRuntimeConfig validated pushServiceReady and then replaced it with false.
The app also dropped the validated public VAPID key. Retain both validated values
in memory so the admitted online owner can see Enable and the closed-app test.
The existing server-ready, isolated-project, owner admission, current-account and
offline gates remain in force. Public-key validation still runs before assignment.

An integrated beta-entry regression reproduces the missing owner controls before
the fix. After the fix it drives Settings → Enable through permission, browser
subscription with the runtime public key, and account-bound registration. Member,
server-disabled and offline cases retain their restrictions. All test records
and transport responses are synthetic; no real push was sent by these tests.
The private sender, scheduler, runtime environment, audience and user records did
not require changes. Actual Samsung delivery remains pending owner acceptance.


## Device display diagnosis and repeat alerts

A real owner test registered one FCM subscription. The sender recorded provider
acceptance with zero failures, but the owner reported no sound or popup. Provider
acceptance is not a device display receipt. The owner's Android site category
already permits Alert, sound, vibration and popup; do not ask to toggle those
again without new evidence. Physical notification-panel visibility is pending.

The owner Settings card now includes Test notification now, using the existing
persistent service-worker showNotification API directly. This does not send a
server push or change a subscription, and the explanatory copy distinguishes it
from Test with app closed. A successful promise reports only that Chrome accepted
the device test; it does not claim the owner heard or saw an alert. Errors still
flow to the existing visible toast/error path.

Local and push notifications explicitly request silent=false, a short vibration
pattern and renotify=true with a nonempty tag. This asks for a fresh alert when
replacing an existing tagged notification; it cannot override OS/channel settings
or prove why the first test was not seen. Scheduler deduplication stays unchanged.
The local test uses the existing PNG icon/badge. Original images are unchanged.
The Notifications standard defines replacement alerts and platform preferences:
https://notifications.spec.whatwg.org/#dom-notification-renotify.

Integrated UI coverage drives the new owner button through showNotification
without a cloud registration write. Helper tests cover repeat alerts and denied
permission; a service-worker VM dispatch verifies waitUntil holds notification
creation and uses alert options on repeated tags. All responses are synthetic.
No new backend, tracking receipt, account, credential or push send is introduced.


## Background delivery priority

The owner verified that Test notification now displays a real phone notification.
Closed-app delivery is still not accepted. Subsequent server tests reached FCM
with zero sender errors, which is provider acceptance only. The sender previously
omitted urgency, so pinned web-push 3.6.7 selected normal priority. Set urgency to
high for these time-sensitive user-visible reminders and tests. Keep TTL 900,
network timeout 10000, the minute schedule, cron authentication, pilot restrictions,
slot leases and duplicate suppression unchanged. Do not resend a completed slot
or rotate keys to test this change; a new owner-requested test creates a new slot.

Primary references:
https://github.com/web-push-libs/web-push#sendnotificationpushsubscription-payload-options
https://firebase.google.com/docs/cloud-messaging/customize-messages/setting-message-priority

An actual-handler VM test runs the stripped TypeScript with synthetic database,
provider and cron credentials. It failed for missing high urgency before the
change and passes with high urgency plus bounded TTL/timeout. Additional cases
retain duplicate suppression, reject invalid cron authentication and prevent
requests to a different project. No real provider request occurs in these tests.

A saved workout time is the workout start, not the alert time: its reminder is
one hour earlier. Saving a start with less than an hour remaining does not create
an on-start alert or retroactively replay an already expired reminder window.
The two-minute test can be sent on the next minute tick after its exact due time.
These timing rules remain unchanged. Neither high priority nor a successful
showNotification promise overrides device settings or proves physical delivery.
