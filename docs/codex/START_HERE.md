# Start here: Codex continuity handoff

Prepared 2026-10-19 UTC. This adds documentation only. It does not publish a new app build.

## Pinned source
| Item | Value |
| --- | --- |
| Repository | 412DoubleB/Muscle-Growth-Tracker (public) |
| Source version | MENEI 8.1.1 |
| Source commit | fa142c3fc7c96c498b73b5943eac12ca49152dfb |
| Source tree | 01235f48157f16b8451981bcac7260af2db92f87 |
| Preservation branch | backup/pre-codex-8.1.1-2026-10-19 |
| Handoff branch | handoff/codex-8.1.1-2026-10-19 |
| Current app | https://412doubleb.github.io/Muscle-Growth-Tracker/ |
| Runtime | Buildless JavaScript ES modules; Node >=22 for tests |

BASELINE.json records the exact Git blob, size and SHA-256 of every original tracked file. All 194 original files are preserved; newly added handoff documents are outside that manifest. This includes the service worker, release version, manifest, original artwork and exercise media.

## What travels with the project
- The full Git history, current runtime, tests, existing requirements and audit documents.
- Root AGENTS.md, the current requirement register, photo rules, baseline hashes and an honest validation report.
- A separate private continuity pack with retrieved decision/approval excerpts, a source-file inventory, original mapping text and current brand-guide text. Attach it privately to Codex if that environment supports attachments; otherwise copy the relevant text into its task. Never commit it to this public repo.
- Original project chats and source files remain in their current project. The file index is a locator, not a claim that every original image/archive was embedded in the continuity pack.
- Current phone/browser history and Supabase data remain where they are. No data export, reset, import or backend mutation was performed for this handoff.

## Completeness limits
Conversation retrieval supplied selected excerpts rather than a complete, verbatim project transcript. The private ledger records evidence strength, later corrections and unresolved exact image links. Preserve the original project as the authoritative record; add a complete conversation export privately when available. Do not equate missing retrieval evidence with withdrawal of approval.

The older docs/REQUIREMENTS.md is a historical beta trace. Its claims of a separate private site, no publication, pending phone import and unavailable browser QA describe that stage. The current source is the published 8.1.1 app. Read the status and supersession notes in this folder before treating historical statements as current requirements.

## First Codex task (copy)
```text
Use 412DoubleB/Muscle-Growth-Tracker, branch handoff/codex-8.1.1-2026-10-19.
This is a preservation-only intake. Read AGENTS.md and docs/codex/START_HERE.md.
Use the private continuity pack as supporting evidence if attached.

Verify every file in docs/codex/BASELINE.json against the pinned 8.1.1 commit.
Run npm test and npm run check. Report baseline failures without editing code or tests.
Read the requirements and photo policy. Identify unresolved evidence and actual acceptance gaps.
Return a concise inventory and a proposed first development task.

Do not change runtime files, regenerate or replace images, alter history, run backend
mutations, merge into main or deploy. Do not assume full chat history transferred
automatically. Keep the original project and private records intact.
```

## Later development
Choose this handoff branch as the base of the first development task. Use separate feature branches and synthetic test records. Keep the live origin, saved history, storage keys and Supabase identity stable. Evaluate database changes with a recovery plan and test account before any live mutation. Use an access-controlled preview for a private beta; a branch in this public repository does not make the beta private.

A new Codex environment grants code access; it does not itself transfer the owner's entire ChatGPT project, authenticate the owner inside the app, export phone history or change Supabase Auth redirect settings.

