# MENEI 8.1.2

Version 8.1.2 fixes cloud authentication and sync failing with the browser error `Failed to execute 'fetch' on 'Window': Illegal invocation`. The default cloud transport now preserves the native fetch receiver. Existing injected test transports, app identity, browser storage, accounts, and backend configuration are retained. See [cloud connection fix and validation](docs/CLOUD_FETCH_FIX_8_1_2.md).

Version 8.1.1 of the existing workout and nutrition PWA, branded MENEI. The approved identity uses Pittsburgh black and gold, the owner's exact M and pointed-leaf wreath, and Strength / Nutrition / Progress dashboard cards. This update adds a true black background with the M/wreath above a gold Greek soldier lifting a stone. See the [background artwork record](docs/MENEI_BACKGROUND.md). It updates the existing app in place and retains its data and account configuration.

A gold progress graph reads existing checked working sets. The default estimated-strength trend combines weight and reps; users can also view actual weight, reps and working volume, filter by exercise/gym/session format/period, inspect points, and open the session-data table. Empty and single-session histories never show fabricated improvement. See [design and graph rules](docs/MENEI_NEXT_REBUILD.md).

The site remains buildless and installable. The existing app URL, manifest identity, browser storage keys, schema, cloud configuration, migration, workout history and media identities are retained. All features remain free and unlocked during development. Cinzel is bundled with its OFL license for the brand wordmark; interface controls use the system font. The app icons use the supplied M and pointed-leaf wreath artwork unchanged, embedded in a square SVG container with background spacing; the small favicon keeps the M alone.

## Deploy to the existing app

Publish these files at the root of the repository’s existing GitHub Pages source folder. Keep the current Pages branch, app URL and relative directory structure. This app does not need a package install or build step. Include `.nojekyll` and the complete `media/` directory.

Before replacing files, preserve the current repository commit with a backup tag or branch. Update files in one commit; retain unrelated existing assets and settings. Wait for the GitHub Pages deployment to succeed and verify `release.json`, `index.html` and versioned modules at the existing app address.

Expected address: https://412doubleb.github.io/Muscle-Growth-Tracker/

## History and recovery

On first launch at the existing GitHub app origin, version 8 copies `MGT28v6` (or `MGT28v5` when v6 is absent) into the version 8 workspace. Original keys are not changed or deleted. The copied data includes an original snapshot; conflicting dates retain both records. Reopening the app does not duplicate an already-imported snapshot.

If already signed in, old shared-device history is staged in the guest workspace until explicitly copied using Settings → Your data → Copy previous device history. It is not automatically uploaded into another account.

If a version 8 workspace already exists, its newer profile, program settings and gym inventories are preserved while older history is merged. Parse errors and storage-quota failures leave the original values intact and provide an original-backup download.

Data entered only in the private beta belongs to a different website origin. Import its exported JSON backup here, or sign in to the same cloud account and merge its synchronized data. Updating GitHub cannot read guest data from the separate beta origin.

A rollback uses the preserved pre-upgrade repository commit. Original browser keys remain available to that version. Export version 8 data before rolling back so new workouts can also be merged again later.

## Cloud and reminders

The existing Supabase project and isolated owner-only storage remain configured through `config.json`. The established internal `mgt_beta_*` database names and browser storage names are retained for continuity. No server secret belongs in this repository.

The original cloud backup table remains read-only to the version 8 importer. New changes use the existing version-checked synchronization endpoint and conflict review. Sign in using the configured Supabase account. Authentication redirect URLs should include the complete app path above, including `/Muscle-Growth-Tracker/`, as well as the private beta URL if it is still used.

Push permissions and device subscriptions are specific to the website origin. Enable notifications at the GitHub app address. The existing reminder service uses relative notification links, so they open the subscribed app’s own scope.

## Validate

Use Node 22 or newer:

```
npm test
npm run check
```

Tests cover generation, progression, supersets, original imports, account isolation, recipes/meals, inventory, conflict preservation, update handling and the first-launch migration. Automated DOM checks are not a substitute for phone/browser layout or delivery testing. The owner approved the previous 8.0.0 release on October 17, 2026, and the full MENEI rebuild and live update on October 18, 2026. The requested gold athlete background follows that rebuild as 8.1.1.

## Retained features

- Generated lifting sessions with 6–9 exercises, original paired variations, rolling calendars, multiple splits/focuses and firefighter schedules.
- Optional supersets, advanced set roles, independent progression, history and restore controls.
- Recommended equipment, setup/form guidance and retained exercise media identities.
- 100 original detailed recipes, nutrition preferences, meal planning, recipe uploads, pantry, shopping and leftovers.
- Profile photo upload, account sync, offline logging and reminders.

The media coverage audit and historical development verification reports are retained in `docs/`. No missing photograph is represented as a completed image.
