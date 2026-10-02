MUSCLE GROWTH TRACKER PWA

This folder is a complete Progressive Web App.

IMPORTANT:
Android/Chrome cannot install a PWA directly from a file:// URL in Downloads.
The folder must be served over HTTPS (or localhost during development).

Files:
- index.html — exact tracker
- manifest.webmanifest — Android install metadata
- sw.js — offline service worker
- icon.svg — app icon

Once hosted over HTTPS:
1. Open index.html/site URL in Chrome on Android.
2. Chrome menu (⋮).
3. Tap "Install app" or "Add to Home screen".
4. Launch Muscle Tracker from the home screen.

DATA:
Workout history is saved locally in the installed app/browser.
Use Export Backup regularly. Import Backup restores the history.
