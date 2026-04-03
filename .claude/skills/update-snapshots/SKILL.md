---
name: update-snapshots
description: Update Playwright visual regression snapshot baselines via Docker
argument-hint: 'optional: specific test file to update snapshots for'
---

Update visual regression snapshot baselines.

If $ARGUMENTS provided, update snapshots for that specific test:
`npx playwright test $ARGUMENTS --update-snapshots`

Otherwise, run the full Docker-based update (required for consistent cross-platform snapshots):
`npm run test:visual:update`

Snapshots are stored in fixtures/reference-snapshots/ named per browser (Desktop-Chrome-, Desktop-Firefox-, Desktop-Edge-).
Remind the user to commit the updated PNG files after running.
