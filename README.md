# agentic-playwright-framework

[![Playwright Tests](https://github.com/orhunakkan/agentic-playwright-framework/actions/workflows/playwright.yml/badge.svg)](https://github.com/orhunakkan/agentic-playwright-framework/actions/workflows/playwright.yml)
[![Playwright](https://img.shields.io/badge/Playwright-1.61-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node](https://img.shields.io/badge/Node-20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)

An end-to-end test framework written in Playwright + TypeScript. It runs against a live web application whose address is set by `BASE_URL`.

> **Status: no target app yet.** The previous target site has been retired, and its specs, page objects and fixtures were removed with it. The framework (config, fixture wiring, accessibility helpers, lint rules, CI matrix) is in place. Specs will be added once the new base URL is available.

---

## Table of contents

- [Quick start](#quick-start)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
  - [Environments (dev / uat / prod)](#environments-dev--uat--prod)
- [Running tests](#running-tests)
- [Reports and artifacts](#reports-and-artifacts)
- [Project structure](#project-structure)
- [Architecture and conventions](#architecture-and-conventions)
- [Continuous integration](#continuous-integration)
- [Code quality](#code-quality)
- [Troubleshooting](#troubleshooting)

---

## Quick start

```bash
git clone https://github.com/orhunakkan/agentic-playwright-framework.git
cd agentic-playwright-framework

npm ci                                # install dependencies
npx playwright install --with-deps    # download the browser binaries
cp .env.example .env                  # create your local environment file, then set BASE_URL

npx playwright test --project="Desktop Chrome"
```

To see the results afterwards:

```bash
npx playwright show-report
```

---

## Prerequisites

| Requirement          | Version     | Notes                                                                                       |
| -------------------- | ----------- | ------------------------------------------------------------------------------------------- |
| **Node.js**          | 22 or newer | CI pins Node 24. The TypeSafe SDK needs Node 22+.                                           |
| **npm**              | 11+         | Ships with Node 24.                                                                         |
| **Browser binaries** | —           | Installed via `npx playwright install`, not npm.                                            |
| **Network access**   | —           | Tests run against the live site at `BASE_URL`. There is no `webServer` block in the config. |

Use `npm ci` rather than `npm install`. It installs exactly what `package-lock.json` specifies, which is what CI does. The browser matrix maps to three engines: `chromium` (Desktop Chrome and Desktop Edge), `firefox` (Desktop Firefox), and `webkit` (Desktop Safari).

---

## Configuration

### Environment files

The only required setting is `BASE_URL`. `.env` is gitignored, so create yours from the committed example:

```bash
cp .env.example .env
```

```dotenv
# .env
BASE_URL=https://<your-app-host>    # TBD: set once the new target app is available
```

`playwright.config.ts` loads environment files in two passes:

```typescript
dotenv.config({ path: `.env.${process.env.ENV}`, override: true });
dotenv.config({ path: '.env' });
```

If you set an `ENV` variable, the matching `.env.<ENV>` file is loaded first and wins. `.env` then fills in anything that file did not define. All `.env.*` files are gitignored except `.env.example`. Never commit real credentials.

### Environments (dev / uat / prod)

The `ENV` variable is a promotion-pipeline hook: it is how this suite would target `dev` → `uat` → `prod`. Only **`prod`** is wired up. `dev` and `uat` are reserved placeholders.

| Environment | `ENV` value       | Live?         | `BASE_URL`                 |
| ----------- | ----------------- | ------------- | -------------------------- |
| Production  | `prod` (or unset) | Yes           | TBD (from `.env` / CI var) |
| UAT         | `uat`             | No — reserved | none                       |
| Development | `dev`             | No — reserved | none                       |

Selecting a reserved environment fails fast on purpose. `playwright.config.ts` throws a clear error for `dev`/`uat` before anything runs, rather than letting Playwright time out on an unset `BASE_URL`.

### What `playwright.config.ts` sets

| Setting                | Value                                     | Why it matters                                                                 |
| ---------------------- | ----------------------------------------- | ------------------------------------------------------------------------------ |
| `testDir`              | `./tests`                                 | One folder per feature area.                                                   |
| `snapshotDir`          | `./fixtures/reference-snapshots`          | Visual and ARIA baselines live outside `tests/`.                               |
| `snapshotPathTemplate` | `{snapshotDir}/{testFileName}/{arg}{ext}` | Baselines are grouped by spec file name.                                       |
| `fullyParallel`        | `true`                                    | Every test in every file runs in parallel. Tests must not share mutable state. |
| `forbidOnly`           | `true` in CI                              | A stray `test.only` fails the CI build instead of silently skipping the suite. |
| `retries`              | `1`                                       | One retry so that flaky tests show up in the report.                           |
| `outputDir`            | `test-results`                            | Traces, screenshots, and videos from failed tests.                             |
| `reporter`             | `list`, `html`, `json`                    | See [Reports and artifacts](#reports-and-artifacts).                           |
| `use.baseURL`          | `process.env.BASE_URL`                    | Specs navigate with relative paths, e.g. `page.goto('/login')`.                |
| `use.trace`            | `retain-on-failure`                       | A full trace is kept for every failed test.                                    |
| `use.screenshot`       | `only-on-failure`                         |                                                                                |
| `use.video`            | `retain-on-failure`                       |                                                                                |

Four browser projects are defined: `Desktop Chrome`, `Desktop Firefox`, `Desktop Edge`, `Desktop Safari`.

---

## Running tests

```bash
npm test                                                   # everything, every browser
npx playwright test --project="Desktop Chrome"             # one browser
npx playwright test tests/<area> --project="Desktop Chrome" # one folder, one browser
npx playwright test --grep "<title substring>"             # one test by title
npx playwright test --grep-invert "@performance"           # skip performance budget tests
npx playwright test --list                                 # list without running
```

Interactive and debugging modes:

```bash
npx playwright test --ui        # UI mode: watch, time-travel, pick locators. Start here.
npx playwright test --debug     # Playwright Inspector, step through with a live browser
npx playwright test --headed    # watch the real browser without the inspector
npx playwright test --workers=1 # serialize the run when parallelism confuses a diagnosis
```

To regenerate visual/ARIA baselines after an intentional UI change, run `npx playwright test <path> --update-snapshots` and review the regenerated files before committing them.

---

## Reports and artifacts

| Reporter | Output                           | Use                                                                  |
| -------- | -------------------------------- | -------------------------------------------------------------------- |
| `list`   | terminal                         | Live pass/fail as tests run.                                         |
| `html`   | `playwright-report/`             | Rich browsable report with traces, screenshots, and videos attached. |
| `json`   | `playwright-report/results.json` | Machine-readable results.                                            |

```bash
npx playwright show-report              # open the HTML report
npx playwright show-trace test-results/<path-to>/trace.zip
```

`playwright-report/`, `test-results/`, and `artifacts/` are all gitignored.

---

## Project structure

```
agentic-playwright-framework/
├── .github/workflows/
│   └── playwright.yml            # placeholder CI (manual dispatch only)
├── fixtures/
│   └── index.ts                  # the custom `test` object; register POM fixtures here
├── pages/                        # Page Object Models (locators only)
├── tests/                        # one folder per feature area, one spec each
├── utilities/
│   └── accessibility.ts          # shared axe-core scan helpers
├── eslint.config.js
├── playwright.config.ts
└── tsconfig.json
```

`pages/` and `tests/` are currently empty and will be populated for the new target app.

---

## Architecture and conventions

### Page Object Models are a locator registry, not behavior

A POM in `pages/` contains **only** `readonly` locator declarations and a constructor. No action methods, no assertions, no `goto()`.

```typescript
// pages/login.page.ts
export class LoginPage {
  readonly emailInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.emailInput = page.getByLabel('Email');
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
  }
}
```

Behavior lives in the spec. A POM method like `fillFormAndSubmit()` hides the very interactions a test is supposed to be asserting on. Keeping the POM to locators means a locator changes in exactly one place, and the test reads as a literal description of what a user did.

Locators follow Playwright's recommended priority: `getByRole` → `getByLabel` → `getByPlaceholder` → `getByText` → `getByTestId`. CSS or XPath is only an explicitly flagged fallback.

### Fixtures inject the POMs

[fixtures/index.ts](fixtures/index.ts) extends Playwright's base `test` with one fixture per POM, so specs never construct a page object by hand:

```typescript
import { test, expect } from '../../fixtures/index';

test('positive: submit is disabled on load', async ({ loginPage }) => {
  await expect(loginPage.submitButton).toBeDisabled();
});
```

Always import `test` and `expect` from `fixtures/index`, never from `@playwright/test` directly.

Naming is mechanical: kebab-case area name → PascalCase POM class → camelCase `...Page` fixture key → matching file paths (`login` → `LoginPage` → `loginPage` → `pages/login.page.ts`, `tests/login/login.spec.ts`).

### Accessibility and performance are always on

Every spec includes multi-state axe-core scans (at load, in the error state and in the success state) plus a `@performance` budget test. Scans go through [utilities/accessibility.ts](utilities/accessibility.ts):

```typescript
import { scanWcag, scanA11y, violationsExcluding } from '../../utilities/accessibility';

const results = await scanWcag(page); // wcag2a + wcag2aa + wcag21aa
expect(results.violations).toEqual([]);
```

`scanA11y(page, { include, exclude, tags })` is the general form, and `violationsExcluding(results, ['color-contrast'])` filters known, accepted violations.

### Test data

Valid values are generated with `@faker-js/faker`. Invalid and boundary values are fixed, typed tables, because a boundary case only means something if it is exactly the boundary.

### Beyond the happy path

`describe` blocks are grouped per acceptance criterion (`AC-1`, `AC-2`, …), and test titles are prefixed `positive:` / `negative:` / `boundary:`. A spec that only covers the happy path is incomplete.

---

## Continuous integration

[.github/workflows/playwright.yml](.github/workflows/playwright.yml) is a placeholder while `tests/` is empty. It has no push or pull request triggers, so it only runs when dispatched manually, and then it installs Chromium and runs `playwright test --pass-with-no-tests`.

Once the new target app and its specs exist, restore the push/PR triggers and the per-browser matrix, pass `BASE_URL` from a repository variable (`vars.BASE_URL`), upload the report as an artifact, and drop `--pass-with-no-tests` so that an accidentally empty run fails again.

---

## Code quality

```bash
npm run lint      # eslint
npm run format    # prettier --write .
npx tsc --noEmit  # type check
```

[eslint.config.js](eslint.config.js) applies `eslint-plugin-playwright` across `tests/`, `fixtures/`, `pages/`, and `matchers/`. Nearly every rule is `error`. These are the ones to know before writing a test:

| Rule                          | What it prevents                                                                                |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| `prefer-web-first-assertions` | `expect(await locator.textContent()).toBe(x)` instead of `await expect(locator).toHaveText(x)`. |
| `missing-playwright-await`    | A forgotten `await` on an assertion, which lets the test pass regardless of the result.         |
| `no-wait-for-timeout`         | `waitForTimeout()` as a synchronization mechanism. Assert on the condition instead.             |
| `no-networkidle`              | `networkidle` waits, which Playwright discourages as inherently racy.                           |
| `no-conditional-in-test`      | Branching in tests, which hides which path actually ran.                                        |
| `no-element-handle`           | `elementHandle()` instead of locators: no auto-waiting, no auto-retry.                          |
| `no-focused-test`             | A `test.only` reaching the shared branch.                                                       |
| `no-force-option`             | `{ force: true }`, which suppresses the actionability check that would have caught a real bug.  |

`no-skipped-test` is the only `warn`. Prettier uses 150-column lines, single quotes, trailing commas, and LF endings (see [.prettierrc.json](.prettierrc.json)).

---

## Troubleshooting

**`browserType.launch: Executable doesn't exist`**
The browser binaries are not installed. Run `npx playwright install --with-deps`.

**Every test fails immediately on navigation**
`BASE_URL` is unset. Specs navigate with relative paths, so with no `baseURL` there is nothing to resolve them against. In CI, check the `BASE_URL` repository variable.

**A test passes alone but fails in the suite**
`fullyParallel: true` runs tests concurrently. Confirm with `--workers=1`. If the test passes serialized, it depends on state another test mutates, so fix the shared state rather than serializing the suite.

**A test fails and you cannot tell why from the terminal**
Run `npx playwright show-report`, click the failed test and open its trace. Every failing test has one, because `trace: 'retain-on-failure'` is set.

---

## License

ISC. Author: Orhun Akkan.
