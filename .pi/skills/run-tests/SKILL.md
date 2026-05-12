---
name: run-tests
description: Commands for running the current Playwright docs snapshot suite, listing tests, focusing failures, updating text snapshots, and opening reports.
---

# Skill: Run Tests

All commands run from the repository root.

This repo currently has no npm scripts in `package.json`. Use direct `npx playwright ...` commands unless scripts are added later.

---

## Primary Docs-Snapshot Run

```bash
npx playwright test tests/scrapper/playwright-docs.spec.ts --project="Desktop Chrome"
```

This is the normal verification command for the active framework.

To run all active docs snapshot specs:

```bash
npx playwright test tests/scrapper --project="Desktop Chrome"
```

The configured `Desktop Firefox` project also collects the same tests, but the spec skips every non-`Desktop Chrome` run in `beforeEach`. Broad `npx playwright test` therefore includes skipped Firefox copies.

---

## Discover Tests

```bash
npx playwright --version
npx playwright test --list
```

As of 2026-05-12, local discovery reports Playwright `1.59.1` and 1312 collected tests across 3 spec files.

---

## Focus a Failure

Use `--grep` with an exact title fragment or URL slug from the failure.

```bash
npx playwright test tests/scrapper/playwright-docs.spec.ts --project="Desktop Chrome" --grep "<failed title or slug>"
```

Examples:

```bash
npx playwright test tests/scrapper/playwright-docs.spec.ts --project="Desktop Chrome" --grep "playwright-dev-docs-test-cli"
```

---

## Update Text Snapshots

Only update snapshots after inspecting the diff and confirming the live docs change is valid.

Preferred focused command:

```bash
npx playwright test tests/scrapper/playwright-docs.spec.ts --project="Desktop Chrome" --grep "<failed title or slug>" --update-snapshots
```

Then verify without updating:

```bash
npx playwright test tests/scrapper/playwright-docs.spec.ts --project="Desktop Chrome" --grep "<failed title or slug>"
```

Do not run a broad `--update-snapshots` unless every failure in the run has already been reviewed and accepted.

---

## Useful Playwright Flags

```bash
npx playwright test tests/scrapper/playwright-docs.spec.ts --project="Desktop Chrome" --headed
npx playwright test tests/scrapper/playwright-docs.spec.ts --project="Desktop Chrome" --ui
npx playwright test tests/scrapper/playwright-docs.spec.ts --project="Desktop Chrome" --debug
npx playwright test tests/scrapper/playwright-docs.spec.ts --project="Desktop Chrome" --trace on
npx playwright test tests/scrapper/playwright-docs.spec.ts --project="Desktop Chrome" --workers=1
npx playwright test tests/scrapper/playwright-docs.spec.ts --project="Desktop Chrome" --repeat-each=2
```

Use `--workers=1` when diagnosing live-site behavior or trying to reduce request pressure.

---

## Reports

The current Playwright config uses the HTML reporter.

```bash
npx playwright show-report
```

Failure artifacts usually live under:

```text
test-results/
playwright-report/
```

These are generated outputs and should not be treated as source changes.

---

## JSON URL List Validation

After editing a docs URL source list:

```bash
node -e "JSON.parse(require('fs').readFileSync('fixtures/playwright-docs-links/sidebar-links.json', 'utf8'))"
```

---

## Current Non-Goals

Do not suggest old npm scripts or commands for removed framework layers. The active suite is the docs snapshot specs under `tests/scrapper/`.
