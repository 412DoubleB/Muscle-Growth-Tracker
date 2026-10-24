# Automatic recovery days in the training streak

Status: implemented on the isolated development branch; live publication pending owner approval.

Scheduled rest days add one day to an existing streak automatically. No Complete action or rest-day log is required. One completed workout starts the streak; rest alone does not create one. The Home card labels the count as days in a row and keeps the separate completed-training total limited to real workouts.

For example, a completed Monday workout, scheduled Tuesday rest and completed Wednesday workout give a three-day streak and two completed training days. An unfinished Thursday workout keeps that streak open until Thursday ends. If Thursday is missed, Friday starts with no current streak.

## Schedule evidence and preservation

- Active canonical saved workout records take precedence over saved plans. A saved strength/run day is never replaced with inferred rest.
- Explicit saved recovery days count without completion, including an uncompleted rest log.
- Unsaved recovery is projected from the current original, automatic or custom program's actual lift/run cadence. The projection shares cadence logic with program generation and never generates workouts, creates IDs or writes state.
- Inference is limited to dates on or after both the active program's start and the local date of its valid update timestamp. Original Program uses its fixed 2026-10-01 anchor, matching its calendar. Later preferences cannot classify unknown earlier history as recovery. Deleted or invalid date-keyed records also block inference.
- Switching to Original Program follows that program's active calendar from its effective date. Old plans retained only for history cannot label a current workout day as rest or hide a current rest day. Earlier explicit saved plans remain historical evidence; active workout logs still take precedence.
- A no-lifting weekday can contain a run. Such a date still requires a completed workout; it is not a rest-day credit.
- Unknown gaps, invalid/archive keys and future dates never earn credits. Deleted logs do not earn workout credit; an independently saved valid rest plan can still establish recovery. Today retains its existing midnight grace.
- Rest credits do not change workout status, completed-workout totals, last completed workout date or saved logs/plans. Viewing Home does not create milestone notices. Milestones still require a new genuine workout completion.

No schema, storage key, account, backend, notification, media or mascot changes are needed. Existing historical best/streak displays may increase when recorded rest days now contribute to the day count; saved records themselves remain unchanged.

## Validation

Validation on 2026-10-24 UTC:

- `npm test`: all 81 test files passed, with no failures or skips.
- `npm run check`: passed JavaScript syntax/imports, offline shell and protected-media checks.
- Focused coverage: 11 streak checks, 7 UI checks and 5 schedule-kind checks passed. These cover automatic and saved recovery, unchanged workout totals, rest-only history, missed runs/lifting, deleted/malformed records, program-effective boundaries, switching to Original Program, local dates/DST, generator cadence parity and read-only Home rendering.
- Independent comparison of pre-change and refactored program generation matched across five configurations / 175 dates, excluding generated IDs and timestamps.

Physical-phone acceptance remains a release check: after updating, view Home on a scheduled rest day and confirm the streak appears without marking Complete. This development check does not claim device testing or publication.
