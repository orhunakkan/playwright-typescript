---
name: run-tests
description: All commands for running tests by project, file, tag, or npm script, including useful CLI flags and post-run reporting steps.
---

# Skill: Run Tests

All commands are run from the repository root. Ensure `.env` or `.env.${TEST_ENV}` contains `PRACTICE_E2E_URL`, `PRACTICE_API_URL`, and `SAUCE_DEMO_URL`.

---

## Run Everything

```bash
npx playwright test
```

---

## npm Scripts

```bash
npm run test:e2e
npm run test:api
npm run test:accessibility
npm run test:pw-documents
npm run test:sauce
npm run test:perf
npm run test:visual
npm run test:visual:update
```

---

## Run by Project

```bash
# API
npx playwright test --project="API Tests"

# E2E: Desktop browsers
npx playwright test --project="Desktop Chrome"
npx playwright test --project="Desktop Firefox"
npx playwright test --project="Desktop Edge"

# E2E: Mobile devices
npx playwright test --project="Mobile Safari"
npx playwright test --project="Mobile Chrome"

# Accessibility
npx playwright test --project="Accessibility Tests"

# Visual regression project (prefer Docker npm script for real runs)
npx playwright test tests/visual-regression/ --project="Visual Regression"

# Sauce auth flow
npx playwright test --project="sauce-auth-setup"
npx playwright test --project="Sauce Auth Chrome"

# Multiple projects at once
npx playwright test --project="Desktop Chrome" --project="Desktop Firefox"
```

> Note: `playwright.config.ts` currently has an E2E project and a docs-monitoring project both named `Desktop Chrome`. When targeting one of those areas, include the test path as well as the project flag.

---

## Run a Single File

```bash
# API
npx playwright test tests/api/notes-health-check.spec.ts --project="API Tests"
npx playwright test tests/api/notes-users-all-flow.spec.ts --project="API Tests"
npx playwright test tests/api/notes-notes-all-flow.spec.ts --project="API Tests"
npx playwright test tests/api/notes-users-errors.spec.ts --project="API Tests"
npx playwright test tests/api/notes-notes-errors.spec.ts --project="API Tests"

# E2E
npx playwright test tests/e2e/webdriver-fundamentals.spec.ts --project="Desktop Chrome"
npx playwright test tests/e2e/browser-features.spec.ts --project="Desktop Chrome"
npx playwright test tests/e2e/browser-apis.spec.ts --project="Desktop Chrome"
npx playwright test tests/e2e/page-object-model.spec.ts --project="Desktop Chrome"
npx playwright test tests/e2e/framework-features.spec.ts --project="Desktop Chrome"
npx playwright test tests/e2e/third-party-integrations.spec.ts --project="Desktop Chrome"
npx playwright test tests/e2e/mobile-testing.spec.ts --project="Mobile Chrome"

# Accessibility
npx playwright test tests/accessibility/accessibility-testing.spec.ts --project="Accessibility Tests"

# Playwright docs monitoring
npx playwright test tests/pw-documents/playwright-docs-link-monitoring.spec.ts --project="Desktop Chrome"

# SauceDemo storage-state flow
npx playwright test tests/sauce/storage-state.spec.ts --project="Sauce Auth Chrome"

# Visual regression (use Docker npm script for real comparisons)
npx playwright test tests/visual-regression/visual-regression.spec.ts --project="Visual Regression"
```

---

## Run by Tag

```bash
# Smoke tests only
npx playwright test --grep "@smoke"

# Critical tests only
npx playwright test --grep "@critical"

# Multiple tags (OR logic)
npx playwright test --grep "@smoke|@critical"

# Exclude a tag
npx playwright test --grep-invert "@smoke"

# Smoke tests on a specific project
npx playwright test tests/e2e/ --project="Desktop Chrome" --grep "@smoke"
```

Common tags in this repo include `@smoke`, `@critical`, `@regression`, `@a11y`, and `@visual`.

---

## Visual Regression Tests (Docker Required)

Visual tests must run inside Docker to match CI rendering:

```bash
npm run test:visual
npm run test:visual:update
```

> Never run host-OS visual comparisons for baseline decisions. Raw `npx playwright test tests/visual-regression/visual-regression.spec.ts` is only acceptable for non-baseline debugging.

---

## Performance Tests (Artillery)

```bash
npm run test:perf
```

Runs `tests/performance/performance-testing.ts` with Artillery using `.env` for the target API URL.

---

## Environment Selection

```bash
# Uses .env.staging
TEST_ENV=staging npx playwright test

# Uses .env.prod
TEST_ENV=prod npm run test:api
```

Default (no `TEST_ENV`) loads `.env`.

---

## Useful Flags

```bash
npx playwright test --headed
npx playwright test --ui
npx playwright test --debug
npx playwright test --grep "should display the heading"
npx playwright test --workers=2
npx playwright test --repeat-each=3
npx playwright test --trace on
npx playwright test --update-snapshots
```

---

## After a Run

```bash
# Open the Playwright HTML report
npx playwright show-report

# Generate and open Allure report
npm run report:allure:generate
npm run report:allure:open

# Or serve Allure live
npm run report:allure:serve
```

---

## Not Currently Present

There is no active `DB Tests` project or `test:db` script in the current repository state.
