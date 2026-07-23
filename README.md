# playwright-typescript

[![Playwright Tests](https://github.com/orhunakkan/playwright-typescript/actions/workflows/playwright.yml/badge.svg)](https://github.com/orhunakkan/playwright-typescript/actions/workflows/playwright.yml)
[![Playwright](https://img.shields.io/badge/Playwright-1.61-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node](https://img.shields.io/badge/Node-20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)

An end-to-end test framework written in Playwright + TypeScript against [Stagecraft Labs](https://stagecraftlabs.com), a practice site of 35 self-contained "labs" (Forms & Validation, Network & API, Shadow DOM, Service Workers, and so on). Each lab has its own Page Object Model, its own spec file, a test plan, and a requirements traceability matrix.

**2,658 tests across 35 spec files, running on 4 browser projects.**

What makes this repo unusual is that the tests are not hand-written one at a time. Every lab is produced and verified by an agent-driven STLC pipeline defined in [skills/stlc-pipeline.md](skills/stlc-pipeline.md), which takes a JIRA story from requirements all the way to a CI-verified pull request. See [How the tests are orchestrated](#how-the-tests-are-orchestrated) — that section is the heart of this project.

---

## Table of contents

- [Quick start](#quick-start)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running tests](#running-tests)
- [Reports and artifacts](#reports-and-artifacts)
- [Project structure](#project-structure)
- [Architecture and conventions](#architecture-and-conventions)
- [How the tests are orchestrated](#how-the-tests-are-orchestrated)
- [The lab catalog](#the-lab-catalog)
- [Continuous integration](#continuous-integration)
- [Load and performance testing](#load-and-performance-testing)
- [Code quality](#code-quality)
- [Reference documentation](#reference-documentation)
- [Troubleshooting](#troubleshooting)

---

## Quick start

If you just want to clone and watch tests run:

```bash
git clone https://github.com/orhunakkan/playwright-typescript.git
cd playwright-typescript

npm ci                                # install dependencies
npx playwright install --with-deps    # download the browser binaries
cp .env.example .env                  # create your local environment file

npx playwright test --project="Desktop Chrome"
```

The last command runs all 668 tests for a single browser. To run the full 4-browser matrix, drop the `--project` flag — but expect it to take considerably longer.

To see the results afterwards:

```bash
npx playwright show-report
```

---

## Prerequisites

| Requirement          | Version     | Notes                                                                                                                              |
| -------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Node.js**          | 20 or newer | CI pins Node 20. Node 22+ works fine locally.                                                                                      |
| **npm**              | 10+         | Ships with Node 20.                                                                                                                |
| **Browser binaries** | —           | Installed via `npx playwright install`, not npm.                                                                                   |
| **Network access**   | —           | Tests run against the live `https://stagecraftlabs.com` site. There is no local app server and no `webServer` block in the config. |

On Linux you will also want the OS-level browser dependencies, which is what the `--with-deps` flag installs. On macOS and Windows the flag is harmless and can be included anyway.

---

## Installation

```bash
npm ci
```

Use `npm ci` rather than `npm install` — it installs exactly what `package-lock.json` specifies, which is what CI does and what keeps runs reproducible.

Then install the browsers Playwright drives:

```bash
# all four browsers used by this project
npx playwright install --with-deps

# or, if you only intend to run one project locally
npx playwright install --with-deps chromium
```

The browser matrix maps to three engines: `chromium` (Desktop Chrome and Desktop Edge), `firefox` (Desktop Firefox), and `webkit` (Desktop Safari).

---

## Configuration

### Environment files

The only required setting is `BASE_URL`. `.env` is gitignored, so create yours from the committed example:

```bash
cp .env.example .env
```

```dotenv
# .env
BASE_URL=https://stagecraftlabs.com
```

`playwright.config.ts` loads environment files in two passes:

```typescript
dotenv.config({ path: `.env.${process.env.ENV}`, override: true });
dotenv.config({ path: '.env' });
```

The practical effect is a layered override. If you set an `ENV` variable, the matching `.env.<ENV>` file is loaded first and wins; `.env` is then loaded to fill in anything that file did not define. So:

```bash
# uses .env only
npx playwright test

# uses .env.staging where it defines a value, .env for everything else
ENV=staging npx playwright test        # PowerShell: $env:ENV="staging"; npx playwright test
```

All `.env.*` files are gitignored except `.env.example`. Never commit real credentials.

### What `playwright.config.ts` sets

| Setting                | Value                                     | Why it matters                                                                 |
| ---------------------- | ----------------------------------------- | ------------------------------------------------------------------------------ |
| `testDir`              | `./tests`                                 | One folder per lab.                                                            |
| `snapshotDir`          | `./fixtures/reference-snapshots`          | Visual and ARIA baselines live outside `tests/`.                               |
| `snapshotPathTemplate` | `{snapshotDir}/{testFileName}/{arg}{ext}` | Baselines are grouped by spec file name.                                       |
| `fullyParallel`        | `true`                                    | Every test in every file runs in parallel. Tests must not share mutable state. |
| `forbidOnly`           | `true` in CI                              | A stray `test.only` fails the CI build instead of silently skipping the suite. |
| `retries`              | `1` in CI, `0` locally                    | Locally a failure is a failure — you see flake immediately.                    |
| `outputDir`            | `test-results`                            | Traces, screenshots, and videos from failed tests.                             |
| `reporter`             | `list`, `html`, `json`                    | See [Reports and artifacts](#reports-and-artifacts).                           |
| `use.baseURL`          | `process.env.BASE_URL`                    | Specs navigate with paths like `page.goto('/practice/forms-validation')`.      |
| `use.trace`            | `retain-on-failure`                       | A full trace is kept for every failed test.                                    |
| `use.screenshot`       | `only-on-failure`                         |                                                                                |
| `use.video`            | `retain-on-failure`                       |                                                                                |

### Browser projects

Four projects are defined:

- `Desktop Chrome`
- `Desktop Firefox`
- `Desktop Edge`
- `Desktop Safari`

`Desktop Safari` carries one deliberate exclusion:

```typescript
testIgnore: '**/service-workers/**',
```

This is a scope decision recorded in the config, not an oversight. Playwright's WebKit driver blocks an active service worker from ever responding once `context.setOffline(true)` is set — reproducible with a raw `fetch()` and no app or test code involved, so it is not fixable from this repo. The Service Workers lab is therefore not run on Safari; every other lab keeps full 4-browser coverage. That is why the totals are 2,658 rather than 668 × 4.

---

## Running tests

All commands below assume you are in the repo root.

### The basics

```bash
npm test                      # everything, every browser (2,658 tests)
npx playwright test           # identical — npm test is just an alias
```

### Narrow the run down

Running the entire matrix is rarely what you want while developing. Narrow it:

```bash
# one browser
npx playwright test --project="Desktop Chrome"

# one lab, one browser
npx playwright test tests/forms-validation --project="Desktop Chrome"

# one spec file
npx playwright test tests/forms-validation/forms-validation.spec.ts

# one test by title substring
npx playwright test --grep "inline validation errors on blur"

# everything except the performance budget tests
npx playwright test --grep-invert "@performance"

# a single test by file and line number
npx playwright test tests/forms-validation/forms-validation.spec.ts:36
```

### Interactive and debugging modes

```bash
npx playwright test --ui        # UI mode — watch, time-travel, pick locators. Start here.
npx playwright test --debug     # Playwright Inspector, step through with a live browser
npx playwright test --headed    # watch the real browser without the inspector
npx playwright test --workers=1 # serialize the run when parallelism confuses a diagnosis
```

UI mode is the most useful of these by a wide margin — it gives you a watch loop, the DOM at every step, and the locator picker in one window.

### Listing without running

```bash
npx playwright test --list                            # 2,658 tests in 35 files
npx playwright test --list --project="Desktop Chrome" # 668 tests in 35 files
```

### Visual and ARIA baselines

Two labs compare against committed baselines stored in [fixtures/reference-snapshots/](fixtures/reference-snapshots/): Visual Regression (PNG) and ARIA Snapshots (YAML). If an intentional UI change makes them fail:

```bash
npx playwright test tests/visual-regression --update-snapshots
```

Review the regenerated files before committing them. Baselines are rendering-sensitive, so a baseline generated on your machine may not match the CI runner's — treat unexpected diffs as a signal to investigate rather than to re-record.

### Test tags

Every lab spec appends a performance budget test tagged `@performance` (37 across the suite), so you can run or exclude the performance gate independently:

```bash
npx playwright test --grep "@performance" --project="Desktop Chrome"
```

---

## Reports and artifacts

Three reporters run on every execution:

| Reporter | Output                           | Use                                                                                                     |
| -------- | -------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `list`   | terminal                         | Live pass/fail as tests run.                                                                            |
| `html`   | `playwright-report/`             | Rich browsable report with traces, screenshots, and videos attached.                                    |
| `json`   | `playwright-report/results.json` | Machine-readable. Consumed by the triage and RTM skills, and by the pipeline when it parses CI results. |

```bash
npx playwright show-report              # open the HTML report
npx playwright show-trace test-results/<path-to>/trace.zip
```

The trace viewer is the single best failure-diagnosis tool available: it replays the test with a DOM snapshot at every action, network log, console output, and source. Because `trace: 'retain-on-failure'` is set, every failing test already has one waiting.

`playwright-report/`, `test-results/`, and `artifacts/` are all gitignored — they are regenerated on every run.

---

## Project structure

```
playwright-typescript/
├── .github/workflows/
│   └── playwright.yml            # 4-browser CI matrix, lab-scoped for stlc/* PRs
├── docs/                         # vendored reference docs + generated STLC artifacts
│   ├── agent-cli/                #   Playwright Agent CLI reference
│   ├── api/                      #   Playwright API reference (class-*.md)
│   ├── guides/                   #   Playwright guides (locators, fixtures, CI, ...)
│   ├── mcp/                      #   Playwright MCP reference
│   ├── rtm/                      #   35 requirements traceability matrices  ← generated
│   └── test-plan/                #   35 test plans                          ← generated
├── fixtures/
│   ├── auth/                     # saved storageState JSON for auth labs
│   ├── har/                      # recorded HAR files for network replay
│   ├── reference-snapshots/      # visual (PNG) + ARIA (YAML) baselines
│   └── index.ts                  # the custom `test` object — every POM fixture
├── load-tests/                   # Artillery scenarios — see Load and performance testing
│   ├── configs/
│   │   ├── baseline.yml          #   steady-state load test, gated by `ensure` thresholds
│   │   └── stress.yml            #   capped ramp for stress/breaking-point/scalability reads
│   └── reports/                  #   gitignored — JSON output lands here (HTML `report` is deprecated upstream)
├── matchers/                     # custom expect matchers + composable fixtures
│   ├── order-status.matcher.ts
│   ├── price.matcher.ts
│   ├── pricing.fixture.ts
│   └── rating.fixture.ts
├── pages/                        # 36 Page Object Models — locators only    ← generated
│   ├── forms-validation.page.ts
│   └── ...
├── skills/                       # the agent skills that drive the STLC     ← read this
│   ├── stlc-pipeline.md          #   the orchestrator
│   ├── requirement-extractor.md
│   ├── test-plan-generator.md
│   ├── locator-mapper.md
│   ├── test-case-generator.md
│   ├── test-triage.md
│   ├── rtm-generator.md
│   ├── jira-sync.md
│   ├── coverage-analyzer.md
│   ├── framework-scaffolder.md
│   └── README.md                 #   full explanation of the skill system
├── tests/                        # 35 lab folders, one spec each           ← generated
│   ├── forms-validation/
│   │   └── forms-validation.spec.ts
│   └── ...
├── utilities/
│   └── accessibility.ts          # shared axe-core scan helpers
├── eslint.config.js
├── playwright.config.ts
└── tsconfig.json
```

The folders marked _generated_ are produced by the pipeline described below. They are committed to the repo and reviewed like any other code — "generated" describes their origin, not their status.

---

## Architecture and conventions

### Page Object Models are a locator registry, not behavior

This is the convention most likely to surprise you if you have worked in other Playwright repos. A POM in [pages/](pages/) contains **only** `readonly` locator declarations and a constructor. No action methods, no assertions, no `goto()`.

```typescript
// pages/forms-validation.page.ts
export class FormsValidationPage {
  readonly fullNameInput: Locator;
  readonly subscribeButton: Locator;
  readonly nameErrorMessage: Locator;

  constructor(page: Page) {
    this.fullNameInput = page.getByLabel('Full name');
    // ...
  }
}
```

Behavior lives in the spec. The reasoning: a POM method like `fillFormAndSubmit()` hides the very interactions a test is supposed to be asserting on, and it accumulates parameters until it serves no test well. Keeping the POM to locators means a locator changes in exactly one place, while the test reads as a literal description of what a user did.

Locators follow Playwright's recommended priority — `getByRole` → `getByLabel` → `getByPlaceholder` → `getByText` → `getByTestId`, with CSS or XPath only as an explicitly flagged fallback.

### Fixtures inject the POMs

[fixtures/index.ts](fixtures/index.ts) extends Playwright's base `test` with one fixture per POM, so specs never construct a page object by hand:

```typescript
import { test, expect } from '../../fixtures/index';

test('subscribe is disabled on load', async ({ formsValidationPage }) => {
  await expect(formsValidationPage.subscribeButton).toBeDisabled();
});
```

Always import `test` and `expect` from `fixtures/index`, never from `@playwright/test` directly — importing from the package skips the fixture registration and the POM will not be available.

Naming is mechanical and derived from the lab's kebab-case name:

| Lab name           | POM class             | Fixture key           | Files                                                                               |
| ------------------ | --------------------- | --------------------- | ----------------------------------------------------------------------------------- |
| `forms-validation` | `FormsValidationPage` | `formsValidationPage` | `pages/forms-validation.page.ts`, `tests/forms-validation/forms-validation.spec.ts` |

### Accessibility and performance are always on

Every lab spec appends multi-state axe-core scans — at load, in the error state, and in the success state, not just at load — plus a `@performance` budget test. Scans go through the shared helper in [utilities/accessibility.ts](utilities/accessibility.ts) rather than constructing `AxeBuilder` inline:

```typescript
import { scanWcag, scanA11y, violationsExcluding } from '../../utilities/accessibility';

const results = await scanWcag(page); // wcag2a + wcag2aa + wcag21aa
expect(results.violations).toEqual([]);
```

`scanA11y(page, { include, exclude, tags })` is the general form; `scanWcag(page)` is the standard project gate; `violationsExcluding(results, ['color-contrast'])` filters known and accepted rule violations.

### Custom matchers

[matchers/](matchers/) holds the Custom Assertions lab's matcher modules — `toBeAValidPrice`, `toHaveOrderStatus` — composed with `mergeExpects()`, plus two fixture modules kept deliberately separate so the spec can demonstrate `mergeTests()` composing fixtures across modules.

### Test data

Valid values are generated with `@faker-js/faker`. Invalid and boundary values are fixed, typed tables — a boundary case is only meaningful if it is exactly the boundary, so it must never be random:

```typescript
const validEmail = faker.internet.email();

const invalidEmails = [
  { value: 'not-an-email', label: 'no @ sign' },
  { value: 'a@b', label: 'no TLD' },
  { value: '@example.com', label: 'no local part' },
];
```

### Beyond the happy path

Each acceptance criterion maps to a `test.describe()` containing positive **and** negative **and** boundary **and** data-driven cases. A happy-path-only spec is treated as a generation failure, not an acceptable minimum.

---

## How the tests are orchestrated

**Every lab in this repository is produced and verified by [skills/stlc-pipeline.md](skills/stlc-pipeline.md).** It is the orchestrator for the whole suite, and it is the thing to read if you want to understand how this repo actually works.

The pipeline is a Claude Code _agent skill_: a Markdown playbook with YAML frontmatter that an agent follows step by step. It is not code you execute — it is invoked by describing what you want:

```text
"run stlc-pipeline for TAB1-13"
"full cycle for Forms lab"
"automate TAB1-16 end to end"
```

The skill runs one complete Software Testing Life Cycle for one lab, end to end, with no approval checkpoints, delegating each phase to a focused sub-skill:

| Step       | Phase                                              | Delegates to                   | Output                                                     |
| ---------- | -------------------------------------------------- | ------------------------------ | ---------------------------------------------------------- |
| Pre-flight | Resolve input, check tools, check if already built | —                              | Stops rather than guessing                                 |
| 1          | Requirement analysis                               | `requirement-extractor`        | ACs + derived negative/boundary requirements, tagged P1–P3 |
| 1b         | Test planning                                      | `test-plan-generator`          | `docs/test-plan/<lab>.test-plan.md`                        |
| 2          | State check                                        | filesystem                     | Does the POM/spec already exist?                           |
| 3          | Test design                                        | `locator-mapper`               | `pages/<lab>.page.ts`                                      |
| 3.5        | Fixture registration                               | edits `fixtures/index.ts`      | POM available to specs                                     |
| 4          | Status                                             | `jira-sync`                    | JIRA → _In Progress_                                       |
| 5          | Test case development                              | `test-case-generator`          | `tests/<lab>/<lab>.spec.ts`                                |
| 6          | Test execution                                     | Playwright CLI                 | Pass/fail                                                  |
| 7          | Defect management                                  | `test-triage`                  | Categorized failures, JIRA Bugs filed and linked           |
| 8          | —                                                  | git + `gh pr create`           | RTM refreshed, branch `stlc/<lab>` pushed, PR opened       |
| 9          | Status                                             | `jira-sync`                    | JIRA → _In Review_                                         |
| 10         | —                                                  | `gh run watch`                 | Blocks on the real CI run                                  |
| 11         | —                                                  | `gh run download` + JSON parse | Confirms _this lab_ passed on every browser                |
| 12         | Closure                                            | `jira-sync` / `test-triage`    | JIRA → _Done_, or CI-failure triage                        |
| 13         | —                                                  | —                              | Pipeline report                                            |

### The three ideas worth understanding

**Done requires CI evidence, never self-report.** A green local run is not evidence. Step 8 opens a real PR, step 10 blocks until GitHub Actions finishes, and step 11 downloads each browser's `playwright-report-<project>` artifact and parses `results.json` to confirm that _this lab's spec file specifically_ passed on every browser — not merely that the overall run was green, which an unrelated flaky lab could have decided either way. Only then does the story move to Done.

**Merging always stays human.** The pipeline opens a PR and stops. It never runs `gh pr merge`. Done means "this lab's tests are verified passing in CI," not "this code is merged."

**Re-runs are cheap because every step skips its own output.** Re-running a lab after fixing a local failure skips steps 1b/3/5 (those artifacts exist) and jumps to step 6. Re-running after a CI-only failure reuses the open PR, pushes the fix as a new commit, and jumps to step 10. To force regeneration you must delete the file or explicitly say "regenerate POM" / "regenerate spec".

### The supporting skills

Beyond the linear path, two cross-cutting skills run at any time: **coverage-analyzer** reports which of the 35 labs have a POM, a spec, both, or neither, with live JIRA status, and recommends what to work on next; **framework-scaffolder** implements identified framework gaps on demand, one per invocation.

The pipeline requires the Atlassian MCP, Playwright MCP, and Chrome DevTools MCP servers, plus the Playwright CLI and an authenticated GitHub CLI. It performs a pre-flight check and stops with an explicit list if any is missing — it will not run partially and leave half-written artifacts behind.

> **You do not need any of this to run the tests.** The MCP servers and JIRA access are only needed to _generate and verify_ a lab. Cloning the repo and running `npx playwright test` needs nothing but Node and the browsers.

[skills/README.md](skills/README.md) documents the full skill system, including a diagram of the flow and the design principles behind each guardrail. Read it after this file.

---

## The lab catalog

35 labs, each mapped 1:1 to a JIRA story in project `TAB1` and a URL path under `/practice/`.

| JIRA    | Lab                                     | Path                                    |
| ------- | --------------------------------------- | --------------------------------------- |
| TAB1-12 | Network & API                           | `/practice/network-api`                 |
| TAB1-13 | Forms & Validation                      | `/practice/forms-validation`            |
| TAB1-14 | Async UI                                | `/practice/async-ui`                    |
| TAB1-15 | Accessible Locators                     | `/practice/accessible-locators`         |
| TAB1-16 | Tables & Filtering                      | `/practice/tables-filtering`            |
| TAB1-17 | Browser Events                          | `/practice/browser-events`              |
| TAB1-18 | Emulation & Input                       | `/practice/emulation-input`             |
| TAB1-19 | Debugging & Reporting                   | `/practice/debugging-reporting`         |
| TAB1-20 | Frames & Contexts                       | `/practice/frames-contexts`             |
| TAB1-21 | Fake Auth                               | `/practice/fake-auth`                   |
| TAB1-22 | ARIA Snapshots                          | `/practice/aria-snapshots`              |
| TAB1-23 | Storage State                           | `/practice/storage-state`               |
| TAB1-24 | API Request Context                     | `/practice/api-request-context`         |
| TAB1-25 | Clock & Timers                          | `/practice/clock-timers`                |
| TAB1-26 | WebSocket Interception                  | `/practice/websocket-interception`      |
| TAB1-27 | HAR Recording                           | `/practice/har-recording`               |
| TAB1-28 | Service Workers                         | `/practice/service-workers`             |
| TAB1-29 | Visual Regression                       | `/practice/visual-regression`           |
| TAB1-30 | Drag & Drop                             | `/practice/drag-and-drop`               |
| TAB1-31 | Multi-Tab                               | `/practice/multi-tab`                   |
| TAB1-32 | Geolocation & Permissions               | `/practice/geolocation-permissions`     |
| TAB1-33 | Scroll & Lazy Loading                   | `/practice/scroll-lazy-loading`         |
| TAB1-34 | Media & Locale Emulation                | `/practice/media-locale`                |
| TAB1-35 | Accessibility Scanning                  | `/practice/accessibility-scanning`      |
| TAB1-36 | Locator Handlers                        | `/practice/locator-handlers`            |
| TAB1-37 | Shadow DOM & Web Components             | `/practice/shadow-dom`                  |
| TAB1-38 | Server-Sent Events                      | `/practice/server-sent-events`          |
| TAB1-39 | Soft Assertions & Test Steps            | `/practice/soft-assertions`             |
| TAB1-40 | Init Scripts & Seeding                  | `/practice/init-scripts`                |
| TAB1-41 | Touch & Mobile Gestures                 | `/practice/touch-gestures`              |
| TAB1-60 | Passkey Authentication                  | `/practice/passkey-authentication`      |
| TAB1-61 | Web Storage & Partitioned Cookies       | `/practice/client-storage-partitioning` |
| TAB1-62 | Console & Runtime Diagnostics           | `/practice/console-runtime-diagnostics` |
| TAB1-63 | Memory & DOM Leak Diagnostics           | `/practice/dom-memory-diagnostics`      |
| TAB1-64 | Custom Assertions & Matcher Composition | `/practice/custom-assertions`           |

Each lab has a test plan in [docs/test-plan/](docs/test-plan/) and a traceability matrix in [docs/rtm/](docs/rtm/) mapping every AC to the test cases covering it, their last result, and any linked defect.

---

## Continuous integration

[.github/workflows/playwright.yml](.github/workflows/playwright.yml) runs a 4-job matrix — one job per browser project, `fail-fast: false` so one browser's failure does not cancel the others — on pushes to `main`, on pull requests against `main`, and on manual dispatch.

`BASE_URL` comes from a repository variable (`vars.BASE_URL`), not from a committed `.env`. If you fork this repo, set that variable or the CI runs will have no base URL.

### Test scope is decided per branch

The workflow scopes the run based on the branch that opened the PR:

- **PR from an `stlc/<lab-name>` branch** → runs only `tests/<lab-name>`. This is what makes the pipeline's step 10 fast and immune to unrelated failures elsewhere in the repo.
- **Push to `main`, or a PR from any other branch** → runs the full suite, as a regression net.

A lab-scoped run can legitimately match zero tests for a project when that lab is excluded from that browser — Service Workers on Desktop Safari being the standing example. The workflow detects `Total: 0 tests` via `--list` and exits successfully rather than letting Playwright's "No tests found" error fail the job.

### Artifacts

Each job uploads a `playwright-report-<project>` artifact containing `playwright-report/` and `test-results/`, retained 14 days, with `if-no-files-found: ignore` for the intentionally-empty Safari/Service-Workers case. These artifacts are what the pipeline downloads and parses to verify a lab before moving its story to Done.

---

## Load and performance testing

[Artillery](https://www.artillery.io/) covers concurrent-user load, stress/breaking-point, scalability, and throughput testing against the live site — a different concern from the per-lab `@performance` Playwright tag, which is a single-user page-load budget check (`domContentLoaded`/`load` timing), not a concurrent-load test.

This repo has no access to the Stagecraft Labs app's server source, so Artillery is deliberately **black-box and page-level only**: scenarios request the homepage and a representative sample of `/practice/<lab>` routes, the same public URLs this repo's own Playwright specs navigate to. There is no API replay and no login/session flow — both would require knowing the app's internal request shapes.

```bash
npm run load-test:baseline   # steady load: 1 → 3 arrivals/sec over ~3.5 min, gated by ensure thresholds
npm run load-test:stress     # uncapped ramp: 2 → 300 arrivals/sec over ~8 min, read by hand afterward
```

Both configs target `https://stagecraftlabs.com` directly — there's no `BASE_URL` indirection here, since production is the only target. **Both are manual, local-only commands — there is no CI workflow for either.** Run them deliberately, when you're ready to generate real load against the live site.

- **`baseline.yml`** — a steady-state load test with `ensure` thresholds (`p95 < 3000ms`, error rate `< 1%`).
- **`stress.yml`** — ramps arrival rate all the way to 300 req/s and holds there. This is deliberately **uncapped**: the app runs on a cheap, non-autoscaling Azure App Service plan with a single user (you), so the intent is to actually find the real breaking point rather than just observe a strain signal. **Running this will very likely cause real, temporary errors or downtime on the live site while it runs.** No `ensure` thresholds are set on this config — it's meant to fail loudly, not pass/fail cleanly; read the results by hand.

Reporting is JSON-only: Artillery's own `report` command (which used to generate a standalone HTML file) was deprecated upstream in favor of the paid Artillery Cloud dashboard, so it's a no-op in the installed version. The full metrics — latency percentiles, RPS, status-code histogram, error rate, per-phase breakdown — print to the terminal during and after every run, and the same data is written to `load-tests/reports/<name>.json` for later inspection.

---

## Code quality

```bash
npm run lint      # eslint
npm run format    # prettier --write .
```

### Lint

[eslint.config.js](eslint.config.js) applies `eslint-plugin-playwright` across `tests/`, `fixtures/`, `pages/`, and `matchers/`. Nearly every rule is set to `error` — the ones worth internalizing before you write a test here:

| Rule                          | What it prevents                                                                                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `prefer-web-first-assertions` | `expect(await locator.textContent()).toBe(x)` instead of `await expect(locator).toHaveText(x)`. The first has no auto-retry and is the number one source of flake. |
| `missing-playwright-await`    | A forgotten `await` on an assertion — the test passes regardless of the result.                                                                                    |
| `no-wait-for-timeout`         | `waitForTimeout()` as a synchronization mechanism. Assert on the condition instead.                                                                                |
| `no-networkidle`              | `networkidle` waits, which Playwright discourages as inherently racy.                                                                                              |
| `no-conditional-in-test`      | Branching in tests, which hides which path actually ran.                                                                                                           |
| `no-element-handle`           | `elementHandle()` instead of locators — no auto-waiting, no auto-retry.                                                                                            |
| `no-focused-test`             | A `test.only` reaching the shared branch.                                                                                                                          |
| `no-force-option`             | `{ force: true }`, which suppresses the actionability check that would have caught a real bug.                                                                     |

`no-skipped-test` is the sole `warn` — a deliberately skipped test is sometimes legitimate, but it should be visible.

### Format

Prettier with 150-column lines, single quotes, trailing commas, and LF endings — see [.prettierrc.json](.prettierrc.json). Run `npm run format` before committing.

### Type checking

```bash
npx tsc --noEmit
```

[tsconfig.json](tsconfig.json) runs `strict` with `noEmit` — TypeScript type-checks the suite but never emits; Playwright handles transpilation itself.

---

## Reference documentation

[docs/](docs/) vendors the full Playwright documentation set so it is greppable offline and available to the agent skills without a network call:

| Folder                             | Contents                                                                                |
| ---------------------------------- | --------------------------------------------------------------------------------------- |
| [docs/guides/](docs/guides/)       | Playwright guides — locators, fixtures, assertions, CI, trace viewer, POM, and ~70 more |
| [docs/api/](docs/api/)             | The API reference, one file per class (`class-page.md`, `class-locator.md`, …)          |
| [docs/mcp/](docs/mcp/)             | Playwright MCP — installation, configuration, tool reference                            |
| [docs/agent-cli/](docs/agent-cli/) | Playwright Agent CLI reference                                                          |

The other two folders, [docs/test-plan/](docs/test-plan/) and [docs/rtm/](docs/rtm/), are generated STLC artifacts rather than vendored reference material.

---

## Troubleshooting

**`browserType.launch: Executable doesn't exist`**
The browser binaries are not installed. Run `npx playwright install --with-deps`.

**Every test fails immediately on navigation**
`BASE_URL` is unset — you likely skipped `cp .env.example .env`. Specs navigate with relative paths, so with no `baseURL` there is nothing to resolve them against. In CI, check that the `BASE_URL` repository variable exists.

**A test passes alone but fails in the suite**
`fullyParallel: true` means tests share a browser context pool and run concurrently. Confirm the diagnosis with `--workers=1`; if it passes serialized, the test depends on state another test mutates. Fix the shared state rather than serializing the suite.

**Visual regression tests fail on a clean clone**
PNG baselines are rendering-sensitive — fonts, GPU, and OS all shift the output, so a baseline recorded on one machine may not reproduce on another. Open the HTML report and inspect the diff before assuming it is environmental, then re-record with `--update-snapshots` only if the change is genuinely yours.

**A Service Workers test is missing on Safari**
Working as intended. See the `testIgnore` note in [Browser projects](#browser-projects).

**A test fails and you cannot tell why from the terminal**
Open the trace: `npx playwright show-report`, click the failed test, open the trace attachment. Every failing test has one, because `trace: 'retain-on-failure'` is set. The DOM snapshot at the failing action usually answers the question in seconds.

**The pipeline stops with a tool-check error**
The STLC pipeline needs the Atlassian, Playwright, and Chrome DevTools MCP servers plus an authenticated `gh`. Run `gh auth status` — an installed but unauthenticated CLI counts as missing. None of this is required to simply run the tests.

---

## License

ISC. Author: Orhun Akkan.
