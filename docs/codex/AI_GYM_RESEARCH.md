# Private gym-search activation review

**Wider research update (2026-10-20):** the owner accepted a real location
result, then requested branch-supported equipment first and annotated estimates
from broader gym research when the branch's list is incomplete. New source
broadens the same single web search to chain/type context. The published list
stays separate from up to twelve cited wider-source estimates and an optional
cited gym-type suggestion. Each estimate has its source, explanation, checked
date and fixed estimated provenance. It cannot supply a weight limit. Exact
branch facts take precedence; a chain's equipment is not claimed present at the
branch. Generic facility descriptions cannot establish specific machines or
attachments. This remains a reviewable proposal, not a complete inventory.

The editable review shows published branch items first, wider-search estimates
next and common setup suggestions separately. Selecting a candidate can fill a
Custom setup with its suggested type; an already selected non-Custom type stays
selected. The common commercial profile now offers 23 optional items. Generic
profile suggestions have no claimed web evidence; only the separate broader
research entries carry wider-source citations. Existing selections, manual
items, notes and load limits remain until explicit edits/Save gym. The expanded
research needs owner acceptance after publication; see DEVELOPMENT.md.

**Current review (2026-10-20):** owner-only preview version 13 deployed
successfully with the address fix and safe diagnostics, preserving runtime
revision 5 and AI enablement. A later retry of the unchanged, verified package
succeeded after the earlier hosting errors. The owner had tested real searches
on version 12. A successful empty-result
screen and a separate HTTP 502 were observed; neither establishes a confirmed
usable gym result. Synthetic reproduction found that literal token matching can
discard an otherwise matching address when E/East, St/Street or PA/Pennsylvania
differ. The shared client/server comparison now recognizes bounded US address
abbreviations, keeps city and house-number checks separate, and preserves saved
identities, signatures and IDs. It does not infer equipment or alter gym records.

The 502's original cause cannot be recovered from existing logs; raw provider
output was not retained. New failure diagnostics record only a fixed event,
allowlisted category and optional numeric upstream status. Queries, account
identifiers, keys and raw provider bodies are excluded. Public messages now
distinguish an unvalidated response from a successful search with no confirmed
candidate. The request model, citations, limits, timeouts and no-retry policy are
unchanged. All 37 test files and the static/media checks pass with synthetic
data. The next owner lookup remains an acceptance check; no tool-driven paid
request or counter reset was performed. See DEVELOPMENT.md for publication.

The owner approved a replacement key and manually entered it directly in native
Sites settings as a secret; it was never sent through chat or packaged. Native
metadata confirms the masked entry and owner-only access. The older activation
and pre-activation descriptions below are historical and superseded here.

**Twenty-account scope update (2026-10-20):** Testers need only a MENEI account;
no ChatGPT account, separate AI account, personal key or download is required.
 the owner subsequently approved
first-come admission for twenty MENEI accounts including the owner, five
attempts each and one hundred total (including earlier owner usage), estimated
at roughly $1.20. `BETA_ENROLLMENT.md` describes the admission boundary and
remaining activation steps. The original five-attempt table and migration below
remain historical accounting and are preserved. The new cohort uses an additive
migration, durable membership and an append-only attempt ledger; deployment and
sign-in do not reset either allowance. This approval does not establish hosted
storage readiness, install a runtime key or prove real provider acceptance.

This is prepared source, not an activated service. The existing owner-private
preview remains version 7. No paid request, runtime-secret update, database
provisioning, migration, source upload or deployment was performed for this stage.

**Later activation update:** the owner approved the five-attempt trial and the
reviewed preview-only counter. The same owner-only Site is now version 8,
deployed with AI disabled and runtime revision 1. See the activation receipt in
`DEVELOPMENT.md`. The paragraphs above describe the pre-approval preparation;
they are not the current deployment status. Secure key installation, an
application-level hosted counter check and real provider acceptance remain
pending. No paid attempt has run.

The owner reported successful secure creation of one `MENEI Private Beta` key in
Default project from a separate working coding session. That session saved it
to its ignored, untracked `.env.local`; the key was not shared with this session.
The installed OpenAI Developers secure setup workflow remains mandatory. No
conversation transcript or private evidence is included in this source.

## Behavior

- Same-origin `POST /api/gym-research` accepts only name, city/location and optional
  street address, with bounded strings and an 8 KiB streamed body limit. It
  requires Sites-injected visitor identity and the existing owner-only audience.
- The server calls only OpenAI's fixed Responses endpoint. It sends the gym
  identity and canonical equipment vocabulary, never profile, account, workout,
  meal, export, backup or private-conversation records.
- The pinned model is `gpt-6-luna`, Standard tier, low reasoning, `store:false`,
  one web-search tool call and at most 2,500 output tokens (including reasoning).
  The application aborts after 35 seconds and never retries, repairs, continues
  or switches models automatically. An abort is not a guarantee that provider
  processing or billing stops.
- Strict structured output is checked again on the server. At most three
  location candidates use canonical equipment. Each location/equipment/setup source
  URL must match actual returned search/citation metadata and pass public-HTTPS
  validation. Model-supplied IDs, extra fields and uncited limits are rejected.
  New estimates live in a separate bounded field, with server-fixed status and
  no weight limits. Checked dates and stable candidate IDs come from the server.
- Source citations establish where the AI attributes a claim, not independent
  proof that it interpreted that source correctly. Confirm the address,
  operating status and equipment. Source links use neutral labels rather than
  claiming an arbitrary source is official. Closed locations cannot be applied.
- Existing local gym-type estimates remain separate editable suggestions.
  Research, selecting a location and adding suggestions stay in the draft until
  Save gym. Existing equipment, limits, notes, history and images are preserved.
- The client preserves readiness from test-cloud configuration, prevents duplicate
  submissions, ignores stale results and shows fixed safe error messages.

## Durable five-attempt trial

The proposed trial allows five outbound Responses attempts total for this Site,
not five per device/day/login/deployment. A single atomic SQLite/D1 reservation
spends an attempt before outbound work and admits only one active request. A
90-second lease and 10-second completion cooldown prevent overlap. Failed,
cancelled, invalid or timed-out attempts are not refunded. Missing/corrupt
storage fails closed. Readiness checks never create a fresh counter or spend an
attempt. There is no reset endpoint.

`GYM_AI_TRIAL_ID` is fixed at `menei-gym-ai-trial-1`; redeployment must preserve
that ID, the existing database binding and its row.

The only proposed migration is generated by Drizzle from
`tools/gym-ai-schema/schema.mjs`:

```sql
CREATE TABLE `menei_gym_ai_trials` (
  `id` text PRIMARY KEY NOT NULL,
  `used` integer DEFAULT 0 NOT NULL,
  `lease_id` text,
  `lease_until` integer DEFAULT 0 NOT NULL,
  `next_allowed_at` integer DEFAULT 0 NOT NULL
);
```

It adds one empty preview-only accounting table. It removes/replaces nothing,
copies no saved app records and touches neither Supabase project. It stores only
the fixed trial ID, counts, lease nonce and timing values; no gym query or account
record is stored there. Generated SQL, snapshot and journal are kept together.

## Required activation actions and review boundary

After separate owner approval of this trial and its preview-only storage:

1. Preserve the same Sites project and owner-only audience. Prepare its existing
   manifest with `"d1":"GYM_AI_LIMITS"`; do not create a different Site or invent
   a hosted database ID. The builder includes migration metadata under
   `dist/.openai/drizzle` and a matching built hosting manifest.
2. From the session that holds the key, configure `OPENAI_API_KEY` as a native
   Sites runtime secret using a supported secure handoff. Never display it,
   send it in a conversation or include `.env.local` in source/archive. Stop and
   report if that session lacks a secure file-to-runtime mechanism.
3. First deploy with `MENEI_GYM_AI_ENABLED` absent/false. Verify injected storage
   and applied schema through private `GET /api/gym-research-status`, which
   returns only operational booleans and quota counts, never records or keys.
   This diagnostic performs no model request or counter initialization.
4. Only after successful storage/key readiness and the owner's trial approval,
   set `MENEI_GYM_AI_ENABLED=true` and apply that runtime revision through the
   normal owner-private deployment. Preserve the test Supabase key and all other
   runtime entries. Scheduled push stays disabled.
5. The first approved real search must confirm actual account/model support,
   source quality and the quota increment. Do not count mock tests as real
   provider acceptance. Keep the saved version-7 rollback.

The custom Worker artifact's hosted D1 injection/migration execution is not yet
verified. It deliberately omits a made-up Wrangler database ID and remains
unavailable if Sites does not supply the declared binding. Resolve any native
deployment issue without enabling paid requests. Neither a successful build nor
an installed plugin proves hosted readiness.

Preparation commands (local files only):

```sh
npm ci --prefix tools/gym-ai-schema --ignore-scripts --no-audit --no-fund
npm --prefix tools/gym-ai-schema run generate
node scripts/build-preview.mjs /path/to/existing/sites/checkout/dist/client test-cloud
node scripts/build-preview-server.mjs /path/to/existing/sites/checkout --budget
```

The last command prepares a logical binding and migration files; only the native
publication workflow can provision/apply hosted resources. Preserve migration
history after application; do not rerun generation for unchanged schema.

## Pricing reviewed on 2026-10-19

Current Standard rates: $0.10 per million model input tokens, $0.50 per million
output tokens, plus $0.01 per web-search call and retrieved input tokens.
At 2,000 prompt/schema tokens, 10,000 retrieved tokens and the full 2,500 output
tokens each, five attempts cost about **$0.062** in OpenAI usage. At 128,000
retrieved tokens each, the same arithmetic is about **$0.121**; cache-write rates
can differ. These are conditional estimates, not a hard dollar guarantee or a
quote for Sites hosting/storage. Low search context is not a numeric token cap.
The enforced authorization boundary is five attempts with no automatic retries.
No credits are purchased and billing settings are not changed by this proposal.

Primary references:

- https://developers.openai.com/api/docs/models/gpt-6-luna
- https://developers.openai.com/api/docs/pricing
- https://developers.openai.com/api/docs/guides/tools-web-search
- https://developers.openai.com/api/docs/guides/structured-outputs
- https://github.com/openai/openai-node/blob/master/src/resources/responses/responses.ts

## Validation and remaining acceptance

Synthetic tests cover provider request/response validation, source citations,
invalid or incomplete responses, request cancellation, response-size limits,
safe errors and no retries. Actual SQLite integration verifies the generated
migration, competing connections, leases, quota persistence and preservation of
unrelated zero-load history. An integrated route/provider/quota test verifies
exactly five outbound attempts across Worker instances, including one provider
failure, with the sixth rejected before outbound work.

Native Chromium at 360 and 430 pixels verified one POST for a double click,
citations/provenance, explicit draft/review/save behavior, stale-result rejection,
safe quota errors and no overflow or JavaScript errors. Synthetic custom
equipment, notes, load limits, increments, zero-load completed workout, nutrition,
unknown preferences and backups survived save/reload. There were no external
HTTPS requests.

Actual hosted provisioning, runtime secret handoff, model acceptance, paid
searches and owner review of a real gym result remain pending. Physical
two-device acceptance, full conversation export and exact photo
approval-to-file evidence also remain pending; they do not authorize image
replacement or block independently specified gym-search work.
