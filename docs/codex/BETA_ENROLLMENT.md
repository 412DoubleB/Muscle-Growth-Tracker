# Twenty-account beta

## Authorized scope

On 2026-10-19/20 the owner approved first-come enrollment for twenty signed-in
ChatGPT accounts, including the owner. Each admitted account receives five gym
research attempts, with at most one hundred attempts across the cohort. The
previous owner trial's spent attempts count within those limits. Membership and
usage persist across sign-ins and deployments; a new browser does not grant
another allowance to the same account. This caps accounts, not independently
verified natural persons.

The estimate discussed was about $1.20 in OpenAI usage for one hundred attempts.
It is an estimate, not a dollar billing ceiling. The enforceable limits are the
attempt counts and the existing bounded, single-search request. Failed,
cancelled and timed-out provider attempts remain spent. No automatic retries,
credit purchases or billing changes are authorized.

This changes only the separate Sites beta. It does not authorize GitHub main
changes, deployment over the existing app, changes to the live Supabase project,
scheduled push, image replacement or removal of saved records.

## Admission and account boundaries

Sites sign-in supplies the trusted Site-scoped visitor identity. An explicit
same-origin enrollment POST claims a durable slot; merely opening a link does
not. Existing members keep their slot when the cohort is full. Additional
visitors receive a full/waitlist message; no waiting-list email or personal
record is collected. There is no automatic seat recycling or quota reset.

Admission must run before protected HTML, assets, configuration and APIs. A
public landing page is needed for first-come joining, but app access is granted
only to enrolled accounts. Never widen Sites access while this gate is absent
or hosted storage is unverified. Missing or damaged storage fails closed.

The owner enrolls first while native Sites access is still owner-only. A
one-time database latch closes owner bootstrap permanently. Only after that
identity and the deployed gate are verified may the runtime move to open
enrollment and native access allow the enrollment landing page.

The MENEI cloud account is separate from ChatGPT beta admission. It continues to
use only MENEI Private Beta Test (`bhyrrxrpqaxiwpfxnwpa`), with account-scoped
records and existing recovery copies. The live project
`tdmwpcueqxtnqyonucam` is outside this work. Supabase's public Auth endpoint is
not itself a twenty-account signup limit: the twenty-account limit applies to
beta app admission and its online services. A strict cap on raw Auth user rows
would require a separately reviewed test-backend admission integration.

Each tester should use their own browser profile and MENEI test account, and
synthetic test records. Existing gym inventories and schedule templates need
review during setup. Device workspaces and exported backups are retained.
Downloaded offline app copies and browser-local data cannot be remotely revoked
by an online enrollment check; do not represent this as shared-device storage
encryption or remote data erasure.

## Activation status

Implementation and synthetic validation are complete. Native access remains
owner-only while the setup build is prepared. Version 8 has AI disabled. The key created in a separate
working session has not been installed into this Site's runtime by this session;
no supported file-to-runtime secret transfer has been verified. Never put that
key into a prompt, attachment, source package or ordinary tool output, and do not
create a duplicate key to work around the missing transfer.

Before opening enrollment, verify hosted schema/binding readiness, enroll the
owner through their real signed-in browser and verify the resulting role and
member count. Before enabling AI, additionally install the existing approved
key through a supported secure runtime-secret workflow and verify readiness.
Synthetic provider fixtures do not establish actual model access, email delivery
or two-account cloud isolation. The pending full conversation export and exact
photo approval-to-file links remain documented; they do not block sufficient
requirements, and existing images stay unchanged.

Validation: all 33 Node test files and `npm run check` passed. The focused
database suite covers thirteen admission/accounting cases; route integration
covers five groups of protected-route, enrollment, quota and storage failures.
Fourteen account UI regressions cover delayed imports, stale drafts, changed
browser identity and cross-tab logout. Native Chromium checks at 360 and 430
pixels exercised owner form enrollment, changed-account blocking, restoration
of the original workspace and the twenty-first-account full message with no
external or paid requests. Media checks retained all existing image bindings
and expected hashes. These checks use synthetic accounts and local SQLite;
they are not hosted D1 or real Supabase account-isolation acceptance.
