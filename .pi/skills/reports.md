# Skill: Generate and View Reports

This framework has four active reporters configured in `playwright.config.ts`. Each serves a different purpose.

---

## Reporter Overview

| Reporter            | Output                                | When generated        |
| ------------------- | ------------------------------------- | --------------------- |
| `list`              | Terminal stdout                       | Live during every run |
| `html`              | `playwright-report/index.html`        | After every run       |
| `json`              | `playwright-report/test-results.json` | After every run       |
| `allure-playwright` | `allure-results/` (raw)               | After every run       |

---

## 1. HTML Report (Built-in Playwright)

Auto-generated after every test run. No extra command needed.

```bash
# Open the report in the default browser
npx playwright show-report

# Open a specific report folder (if you moved it)
npx playwright show-report playwright-report
```

**What it shows:**

- Pass / fail / flaky / skipped counts
- Per-test timeline with step breakdown
- Screenshots (on failure), video (on failure), traces (on first retry)
- Filtering by status, project, tag

---

## 2. JSON Report

Written automatically to `playwright-report/test-results.json` after every run.

**When to use:** Pipe into a CI dashboard, post to Slack, or parse programmatically. No manual command needed — the file is always up to date after a run.

---

## 3. Allure Report

Allure has three steps: **run → generate → view**.

### 3a. Run Tests (generates raw results)

```bash
# Any test run writes raw Allure data to allure-results/
npx playwright test

# Or use an npm script
npm run test:db
```

Raw results in `allure-results/` are JSON + attachment files. They are not human-readable directly.

### 3b. Generate the Static Report

```bash
npm run report:allure:generate
# Equivalent to:
allure generate allure-results --clean -o allure-report
```

This produces a self-contained static site in `allure-report/`. The `--clean` flag wipes the previous report before regenerating.

### 3c. Open the Static Report

```bash
npm run report:allure:open
# Equivalent to:
allure open allure-report
```

### 3d. Serve Live (skip generate)

If you just want to view results immediately after a run without a separate generate step:

```bash
npm run report:allure:serve
# Equivalent to:
allure serve allure-results
```

This spins up a local server, generates the report in a temp folder, and opens it automatically. The static `allure-report/` folder is not affected.

---

## Allure Report Structure

Allure categorises results using the annotations set in `beforeEach`:

| Allure concept | Set by                                        | Example                      |
| -------------- | --------------------------------------------- | ---------------------------- |
| **Feature**    | `await feature('Notes API')`                  | Groups tests by product area |
| **Story**      | `await story('User Management – Happy Path')` | Sub-groups within a feature  |
| **Severity**   | `await severity('critical')`                  | Prioritisation filter        |
| **Tag**        | `{ tag: ['@smoke'] }`                         | Cross-cutting filter         |

The **Behaviours** tab in Allure maps directly to Feature → Story → Test.

---

## Environment Info in Allure

The environment panel (shown on the Allure overview page) is populated from `playwright.config.ts`:

```ts
[
  'allure-playwright',
  {
    outputFolder: 'allure-results',
    environmentInfo: {
      appUrl: process.env.PRACTICE_E2E_URL,
      apiUrl: process.env.PRACTICE_API_URL,
      environment: process.env.TEST_ENV ?? 'dev',
      node: process.versions.node,
    },
  },
];
```

This means the environment panel automatically reflects whichever `.env` file was loaded during the run. No manual editing of `environment.properties` is needed.

---

## Test Artifacts in `test-results/`

Playwright writes per-test artifact folders to `test-results/` **only for failed tests** (controlled by `screenshot: 'only-on-failure'` and `video: 'retain-on-failure'`):

| Artifact            | Condition                                       |
| ------------------- | ----------------------------------------------- |
| `test-failed-1.png` | Screenshot on failure                           |
| `video.webm`        | Video retained on failure                       |
| `video-1.webm`      | Video from retry (if retried)                   |
| `error-context.md`  | Playwright-generated error summary              |
| Trace `.zip`        | On first retry only (`trace: 'on-first-retry'`) |

Traces can be opened with:

```bash
npx playwright show-trace test-results/<folder>/trace.zip
```

---

## Cleanup

```bash
# Remove raw Allure results (before a fresh run)
rm -rf allure-results

# Remove the generated static report
rm -rf allure-report

# Remove all test artifacts
rm -rf test-results

# Remove the HTML/JSON report
rm -rf playwright-report
```

All of these are regenerated automatically on the next test run.
