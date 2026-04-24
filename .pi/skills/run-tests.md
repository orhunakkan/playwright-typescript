# Skill: Run Tests

All commands are run from the repository root. Ensure the correct `.env` file exists before running.

---

## Run Everything

```bash
# All projects, all tests (respects playwright.config.ts workers setting)
npx playwright test
```

---

## Run by Project

```bash
# --- DB Layer ---
npx playwright test --project="DB Tests"

# --- API Layer ---
npx playwright test --project="API Tests"

# --- E2E: Desktop Browsers ---
npx playwright test --project="Desktop Chrome"
npx playwright test --project="Desktop Firefox"
npx playwright test --project="Desktop Edge"

# --- E2E: Mobile Browsers ---
npx playwright test --project="Mobile Safari"
npx playwright test --project="Mobile Chrome"

# --- Sauce Auth Flow ---
npx playwright test --project="sauce-auth-setup"
npx playwright test --project="Sauce Auth Chrome"

# --- Multiple projects at once ---
npx playwright test --project="Desktop Chrome" --project="Desktop Firefox"
```

---

## Run a Single File

```bash
# API
npx playwright test tests/api/notes-health-check.spec.ts --project="API Tests"
npx playwright test tests/api/notes-users-all-flow.spec.ts --project="API Tests"
npx playwright test tests/api/notes-notes-all-flow.spec.ts --project="API Tests"
npx playwright test tests/api/notes-users-errors.spec.ts --project="API Tests"
npx playwright test tests/api/notes-notes-errors.spec.ts --project="API Tests"

# DB (always use --workers=1)
npx playwright test tests/db/db-audit-trail.spec.ts --project="DB Tests" --workers=1
npx playwright test tests/db/db-cascade.spec.ts --project="DB Tests" --workers=1
npx playwright test tests/db/db-consistency.spec.ts --project="DB Tests" --workers=1
npx playwright test tests/db/db-constraints.spec.ts --project="DB Tests" --workers=1
npx playwright test tests/db/db-isolation.spec.ts --project="DB Tests" --workers=1
npx playwright test tests/db/db-pagination.spec.ts --project="DB Tests" --workers=1
npx playwright test tests/db/db-sanitization.spec.ts --project="DB Tests" --workers=1
npx playwright test tests/db/db-soft-delete.spec.ts --project="DB Tests" --workers=1

# E2E
npx playwright test tests/e2e/accessibility-testing.spec.ts --project="Desktop Chrome"
npx playwright test tests/e2e/browser-apis.spec.ts --project="Desktop Chrome"
npx playwright test tests/e2e/browser-features.spec.ts --project="Desktop Chrome"
npx playwright test tests/e2e/framework-features.spec.ts --project="Desktop Chrome"
npx playwright test tests/e2e/mobile-testing.spec.ts --project="Mobile Chrome"
npx playwright test tests/e2e/page-object-model.spec.ts --project="Desktop Chrome"
npx playwright test tests/e2e/third-party-integrations.spec.ts --project="Desktop Chrome"
npx playwright test tests/e2e/webdriver-fundamentals.spec.ts --project="Desktop Chrome"
npx playwright test tests/e2e/playwright-docs-link-monitoring.spec.ts --project="Desktop Chrome"
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
npx playwright test --project="Desktop Chrome" --grep "@smoke"
```

---

## DB Tests (npm Script)

The npm script enforces `--workers=1` so parallel DB tests don't corrupt each other's seeded data:

```bash
npm run test:db
```

---

## Visual Regression Tests (Docker — Required)

Visual tests must run inside Docker to match the CI rendering environment:

```bash
# Compare against existing baselines
npm run test:visual

# Regenerate baselines (only after confirming a UI change is intentional)
npm run test:visual:update
```

> ⚠️ Never run `npx playwright test tests/e2e/visual-regression.spec.ts` directly — pixel comparisons are OS/font-sensitive and will produce incorrect results outside Docker.

---

## Performance Tests (Artillery)

```bash
npm run test:perf
```

Runs the Artillery load test script at `tests/performance/performance-testing.ts` using the `.env` file for the target URL.

---

## Environment Selection

Switch to a different env file by setting `TEST_ENV`:

```bash
# Uses .env.staging
TEST_ENV=staging npx playwright test

# Uses .env.prod
TEST_ENV=prod npx playwright test --project="API Tests"
```

Default (no `TEST_ENV`) loads `.env`.

---

## Useful Flags

```bash
# Headed mode — watch the browser
npx playwright test --headed

# UI mode — interactive test explorer with time-travel
npx playwright test --ui

# Debug mode — pauses at each step
npx playwright test --debug

# Specific test by title (substring match)
npx playwright test --grep "should display the heading"

# Limit parallelism
npx playwright test --workers=2

# Repeat a test N times (useful for flakiness investigation)
npx playwright test --repeat-each=3

# Show full trace on every test (not just retry)
npx playwright test --trace on

# Update snapshots (for aria / text snapshots — NOT visual regression)
npx playwright test --update-snapshots
```

---

## After a Run

```bash
# Open the HTML report (auto-generated after every run)
npx playwright show-report

# Generate and open Allure report
npm run report:allure:generate
npm run report:allure:open

# Or serve Allure live (no pre-generate needed)
npm run report:allure:serve
```
