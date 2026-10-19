# Cloud connection fix — MENEI 8.1.2

Date: October 19, 2026.

## Trigger and result

CloudSync saved native browser fetch directly on a class instance and invoked it as this.fetcher(...). Browsers reject that receiver with `Failed to execute 'fetch' on 'Window': Illegal invocation`, before a sign-in, sign-up, recovery, or sync request can reach Supabase.

The default transport is now a forwarding function that calls globalThis.fetch(...). Explicitly injected fetch implementations remain supported. Authentication endpoints, credentials, permissions, account isolation, and synchronization behavior are unchanged.

The release uses fresh 8.1.2 module queries and a new service-worker shell cache. The standalone refresh page now displays the current release instead of its stale 8.0.0 label. No app storage keys, data schema, manifest identity, exercise/media identities, user records, or database configuration are changed.

## Verification

- Added a regression test that fails on the previous default transport by enforcing the browser's receiver requirement, then passes with the fix. It also checks authentication URL, method, payload, and public-key header.
- Added coverage retaining injected transport behavior and server error reporting.
- Fixed the existing UI test's completed-workout fixture to use October 1 rather than the execution date. Otherwise October 19 overlaps its generated block and correctly protects a completed session, making a 16-unstarted-session assertion date dependent. Product scheduling behavior was not changed.
- All 126 automated tests passed.
- Static validation passed: 22 JavaScript files, 38 offline-shell files, 162 original image identities, and all 113 shipped WebP hashes.
- Read-only checks against the configured live project confirmed the Auth API is reachable, email sign-in is enabled, email confirmation is required, and anonymous snapshot reads return HTTP 401.
- A real-account sign-up/sign-in and two-device sync were not performed. No user password was obtained or used, and no confirmation or reset email was sent during verification. Native local-browser automation could not start because the environment's Chromium download did not return a browser archive; this is not counted as a passed browser authentication test.

## Remaining owner setup

The app configuration still marks authRedirectConfigured as false. The administrator should review Supabase Authentication → URL Configuration and retain existing allowed redirects while adding the exact app address if absent:

https://412doubleb.github.io/Muscle-Growth-Tracker/

Settings: https://supabase.com/dashboard/project/tdmwpcueqxtnqyonucam/auth/url-configuration

After refreshing to 8.1.2, create a MENEI account if one has not been created, confirm its email, sign in, and sync. The Supabase administrator's dashboard login does not itself create a MENEI Auth user. Existing device workouts should only be imported into the appropriate signed-in account through the explicit copy/import flow.

## Cost and scope

This is a maintenance fix to the existing free-tier connection. It adds no AI calls, paid APIs, subscriptions, or service upgrades. The previously deferred paid features remain deferred. It does not apply the separate requested free-feature rebuild.
