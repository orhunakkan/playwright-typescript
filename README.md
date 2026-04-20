# Playwright TypeScript Test Automation Framework

> A comprehensive, production-quality test automation framework built with Playwright and TypeScript — covering end-to-end browser testing, REST API testing, visual regression, and cross-browser validation.

[![CI - Code Quality](https://github.com/orhunakkan/playwright-typescript/actions/workflows/code-quality.yml/badge.svg)](https://github.com/orhunakkan/playwright-typescript/actions/workflows/code-quality.yml)
[![CI - Playwright Tests](https://github.com/orhunakkan/playwright-typescript/actions/workflows/playwright-reusable.yml/badge.svg)](https://github.com/orhunakkan/playwright-typescript/actions/workflows/playwright-reusable.yml)
![Playwright](https://img.shields.io/badge/Playwright-1.59.1-2EAD33?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-3.8-F7B93E?logo=prettier&logoColor=black)
![License](https://img.shields.io/badge/License-ISC-blue)

---

## Overview

This framework is a TypeScript reimplementation of the test scenarios from [_Hands-On Selenium WebDriver with Java_](https://www.oreilly.com/library/view/hands-on-selenium-webdriver/9781098109998/) by Boni García, rebuilt from scratch using modern Playwright APIs. It serves as both a portfolio project and a practical reference for test automation engineering best practices.

**What this demonstrates:**

- Designing a scalable test automation architecture with the Page Object Model
- Writing type-safe, maintainable tests in TypeScript
- Testing complex browser behaviors: Shadow DOM, iframes, dialogs, geolocation, and more
- REST API testing with stateful, serial flows using authentication token chaining
- Visual regression testing with cross-browser screenshot baselines
- Building a professional CI/CD pipeline with parallel jobs, artifact management, and email reporting

---

## Tech Stack

| Tool                                                                                                          | Version | Purpose                                                  |
| ------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------- |
| [Playwright](https://playwright.dev/)                                                                         | 1.59.1  | Browser automation, API testing, assertions              |
| [TypeScript](https://www.typescriptlang.org/)                                                                 | 6.0     | Strongly-typed test code                                 |
| [Faker.js](https://fakerjs.dev/)                                                                              | 10.4.0  | Dynamic, randomized test data generation                 |
| [axe-core / @axe-core/playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright) | 4.11.1  | Automated WCAG 2.1 AA accessibility scanning             |
| [Allure](https://allurereport.org/)                                                                           | 3.6.0   | Structured test reporting with features/stories/severity |
| [GitHub Actions](https://github.com/features/actions)                                                         | —       | CI/CD pipeline orchestration                             |
| [Docker](https://www.docker.com/)                                                                             | —       | Visual regression consistency + PostgreSQL for DB tests  |
| [ESLint](https://eslint.org/)                                                                                 | 9       | Static analysis with Playwright-specific rules           |
| [Prettier](https://prettier.io/)                                                                              | 3.8     | Opinionated code formatting                              |

---

## Key Features

- **Cross-browser E2E testing** across Chromium, Firefox, Microsoft Edge, Mobile Safari, and Mobile Chrome
- **REST API test suites** with serial execution, shared auth tokens, and full CRUD coverage
- **Database integration testing** — direct PostgreSQL queries via `db-client` to verify API ↔ DB consistency, covering constraints, cascades, soft deletes, isolation, pagination, and audit trails
- **Page Object Model** with cleanly separated `locators` and `actions` objects per page
- **Visual regression testing** using per-browser screenshot baselines stored in version control
- **Accessibility testing** with automated WCAG 2.1 AA scanning across all 29 pages via axe-core
- **API schema validation** asserting exact response shape — no extra/missing keys, correct primitive types
- **Browser API mocking** for geolocation, desktop notifications, and `getUserMedia`
- **Shadow DOM testing** using Playwright's automatic shadow-piercing locator engine
- **Cookie & session management** via pre-recorded fixture files loaded before test sessions
- **Faker.js integration** for unique, randomized payloads on every test run
- **Allure reporting** with feature/story/severity tagging for structured, navigable test results
- **Flaky test simulation** to validate retry and stability mechanisms
- **CI/CD with parallel jobs**, HTML report artifacts, and automated email notifications on completion

---

## Project Structure

```
playwright-typescript/
├── tests/
│   ├── api/                          # REST API test suites (serial mode)
│   │   ├── notes-health-check.spec.ts
│   │   ├── notes-notes-all-flow.spec.ts          # Full notes CRUD flow
│   │   ├── notes-notes-errors.spec.ts            # Error/validation scenarios
│   │   ├── notes-users-all-flow.spec.ts          # Full user lifecycle flow
│   │   └── notes-users-errors.spec.ts            # Auth & registration errors
│   ├── db/                           # DB integration tests (serial mode)
│   │   ├── chapter-db-01-consistency.spec.ts     # API response ↔ DB row parity
│   │   ├── chapter-db-02-constraints.spec.ts     # Unique/NOT NULL constraint enforcement
│   │   ├── chapter-db-03-cascade.spec.ts         # Foreign key cascade deletes
│   │   ├── chapter-db-04-soft-delete.spec.ts     # Soft delete / tombstone flag
│   │   ├── chapter-db-05-isolation.spec.ts       # Cross-user data isolation
│   │   ├── chapter-db-06-pagination.spec.ts      # Pagination row count validation
│   │   ├── chapter-db-07-sanitization.spec.ts    # Input sanitization verification
│   │   └── chapter-db-08-audit-trail.spec.ts     # created_at / updated_at accuracy
│   └── e2e/                          # Browser-based E2E tests (parallel)
│       ├── chapter0-visual-regression-tests.spec.ts
│       ├── chapter3-webdriver-fundamentals.spec.ts
│       ├── chapter4-browser-agnostic-features.spec.ts
│       ├── chapter5-browser-specific-manipulation.spec.ts
│       ├── chapter7-page-object-model.spec.ts
│       ├── chapter8-testing-framework-specifics.spec.ts
│       ├── chapter9-third-party-integrations.spec.ts
│       ├── chapter10-accessibility-testing.spec.ts
│       ├── chapter11-mobile-testing.spec.ts      # Touch interactions, mobile viewport
│       └── playwright-docs-link-monitoring.spec.ts # Docs link health + content diffing
├── pages/                            # Page Object Model classes (29 pages)
│   ├── login-form.page.ts
│   ├── web-form.page.ts
│   ├── shadow-dom.page.ts
│   └── ... (26 more)
├── utilities/                        # Shared test helpers
│   ├── error-listeners.ts            # Console/network/page error capture
│   ├── calculator.ts                 # Helpers for calculator page interactions
│   ├── a11y.ts                       # AxeBuilder wrapper (WCAG 2.1 AA defaults)
│   ├── api-schema-validator.ts       # Schema assertions for API response shapes
│   └── db-client.ts                  # PostgreSQL client (queryOne/queryMany/seed/truncate)
├── fixtures/
│   ├── auth/                         # Saved authentication states
│   ├── cookies/                      # Saved accept/reject cookie states
│   ├── db-payloads/                  # TypeScript types + Faker generators for DB layer
│   ├── notes-api-payloads/           # TypeScript interfaces + Faker generators for API layer
│   ├── page-fixtures/                # Custom Playwright fixture wiring for POM classes
│   ├── playwright-docs-links/        # Sidebar link JSON for docs link monitoring
│   └── reference-snapshots/          # Visual regression PNG baselines (80+)
├── config/
│   └── env.ts                        # Typed environment variable access
├── .github/
│   └── workflows/
│       ├── code-quality.yml          # Typecheck + lint + format on every push
│       └── playwright-reusable.yml   # Parallel E2E, API, and visual jobs
├── playwright.config.ts              # Test projects, browsers, reporters
├── tsconfig.json
├── eslint.config.js
└── .prettierrc.json
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (included with Node.js)
- [Docker](https://www.docker.com/) (required for visual regression tests and DB integration tests)

### Installation

```bash
# Clone the repository
git clone https://github.com/orhunakkan/playwright-typescript.git
cd playwright-typescript

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Environment Setup

Create a `.env` file in the project root (or use the existing one):

```env
PRACTICE_E2E_URL=https://bonigarcia.dev/selenium-webdriver-java
PRACTICE_API_URL=https://practice.expandtesting.com/notes/api
```

---

## Running Tests

### All Tests

```bash
npx playwright test
```

### By Browser

```bash
npx playwright test --project="Desktop Chrome"
npx playwright test --project="Desktop Firefox"
npx playwright test --project="Desktop Edge"
npx playwright test --project="Mobile Safari"
npx playwright test --project="Mobile Chrome"
```

### By File or Test Name

```bash
# Run a specific test file
npx playwright test tests/e2e/chapter3-webdriver-fundamentals.spec.ts

# Run tests matching a title pattern
npx playwright test -g "shadow DOM"

# Run all API tests
npx playwright test tests/api/
```

### Database Integration Tests

```bash
# Start PostgreSQL container
npm run docker:up

# Run DB integration tests (serial, workers=1)
npm run test:db

# Stop and remove containers when done
npm run docker:down
```

### Allure Reports

```bash
npm run report:allure:serve     # generate + open live Allure server
npm run report:allure:generate  # generate static report
npm run report:allure:open      # open previously generated report
```

### Visual Regression Tests (Docker)

```bash
# Run visual regression tests in Docker (recommended for baseline consistency)
npm run test:visual

# Regenerate all visual regression baselines
npm run test:visual:update
```

### Debug & Inspection

```bash
# Step-through debugger (Playwright Inspector)
npx playwright test --debug

# Interactive UI mode with time travel and trace viewer
npx playwright test --ui

# Capture traces for every test
npx playwright test --trace on

# Open the HTML report from the last run
npx playwright show-report
```

### Useful Flags

```bash
--headed              # Run tests with visible browser window
--workers=1           # Run sequentially (useful for debugging)
--retries=2           # Retry failed tests N times
--repeat-each=3       # Repeat every test N times (flake detection)
--last-failed         # Re-run only previously failed tests
--update-snapshots    # Regenerate visual regression baselines
```

### Code Quality

```bash
npm run typecheck       # TypeScript type checking
npm run lint:check      # ESLint static analysis
npm run lint:fix        # Auto-fix lint issues
npm run format          # Format all files with Prettier
npm run format:check    # Check formatting without writing
```

---

## Test Coverage

### E2E Tests

| File                                     | Area               | Techniques Demonstrated                                                                                                                                                                                                                               |
| ---------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chapter3-webdriver-fundamentals`        | Core WebDriver     | Text inputs, passwords, textareas, disabled/readonly fields, select dropdowns, datalists, checkboxes, radio buttons, color pickers, date pickers, range sliders, file upload, form submission, pagination, hover menus, drag-and-drop, canvas drawing |
| `chapter4-browser-agnostic-features`     | Browser Features   | Cookies (add/modify/delete), session & local storage, frames (frameset), iframes, alert/confirm/prompt dialogs, Bootstrap modals, shadow DOM (open), infinite scroll, long page scrolling, keyboard navigation                                        |
| `chapter5-browser-specific-manipulation` | Browser APIs       | Geolocation mocking with permission grants, desktop notification permission, `getUserMedia` fake streams, browser locale switching (en-US / es-ES), console log/error capture                                                                         |
| `chapter7-page-object-model`             | POM Pattern        | Login form, slow async login with spinner states, full POM encapsulation of locators and actions                                                                                                                                                      |
| `chapter8-testing-framework-specifics`   | Framework Features | Flaky test simulation (configurable failure rate), retry validation, calculator operations, test stability tooling                                                                                                                                    |
| `chapter9-third-party-integrations`      | Integrations       | File download validation (PDF, PNG), A/B test variation detection, content type verification                                                                                                                                                          |
| `chapter10-accessibility-testing`        | Accessibility      | WCAG 2.1 AA automated scans across all 29 pages via axe-core; violations attached as JSON artifacts                                                                                                                                                   |
| `chapter11-mobile-testing`               | Mobile Testing     | Touch interactions, touchscreen API, mobile-only test skipping via `isMobile`, mobile viewport assertions across Mobile Safari and Mobile Chrome                                                                                                      |
| `chapter0-visual-regression`             | Visual Testing     | Full-page screenshot comparisons across 25+ pages and 3 browsers; per-browser PNG baselines in version control                                                                                                                                        |
| `playwright-docs-link-monitoring`        | Link Health        | Automated link validation against the Playwright docs sidebar; sentence-level content diffing with snapshot comparison                                                                                                                                |

### API Tests

| File                   | Scope                | Techniques Demonstrated                                                                           |
| ---------------------- | -------------------- | ------------------------------------------------------------------------------------------------- |
| `notes-health-check`   | Service availability | Basic health check endpoint, status and message assertions                                        |
| `notes-users-all-flow` | User lifecycle       | Register → login → profile operations; module-scoped auth token sharing                           |
| `notes-users-errors`   | User error handling  | Duplicate email, missing fields, invalid credentials; HTTP 400/401/422 validation                 |
| `notes-notes-all-flow` | Notes CRUD           | Login → create → read → update → delete; serial state across test steps                           |
| `notes-notes-errors`   | Notes error handling | Unauthorized access, invalid payloads, missing resource; full error response structure validation |

All API test suites use `test.describe.configure({ mode: 'serial' })` to chain dependent steps and share state (auth tokens, resource IDs) across tests within a file.

### DB Tests

| File                         | Scope               | Techniques Demonstrated                                                   |
| ---------------------------- | ------------------- | ------------------------------------------------------------------------- |
| `chapter-db-01-consistency`  | API ↔ DB parity     | Assert API response exactly matches the DB row via direct SQL query       |
| `chapter-db-02-constraints`  | Unique/NOT NULL     | Verify DB-level constraint violations surface correctly through the API   |
| `chapter-db-03-cascade`      | Foreign key cascade | Confirm cascading deletes propagate from users → notes at the DB level    |
| `chapter-db-04-soft-delete`  | Soft delete         | Assert deleted records remain in DB with a tombstone flag                 |
| `chapter-db-05-isolation`    | Data isolation      | Verify one user cannot access another user's data at the DB level         |
| `chapter-db-06-pagination`   | Pagination          | Confirm API pagination matches DB row counts and ordering                 |
| `chapter-db-07-sanitization` | Input sanitization  | Ensure stored values in DB are properly sanitized                         |
| `chapter-db-08-audit-trail`  | Audit fields        | Verify `created_at`/`updated_at` timestamps are set and updated correctly |

All DB tests reset state via `truncateAll()` in `beforeEach`, seed data through direct SQL using `seedUser()`/`seedNote()`, trigger behaviour via HTTP, then assert the result against a fresh SQL query.

---

## Architecture & Design Decisions

### Page Object Model

Every page is represented by a dedicated class with two explicit sections:

```typescript
export class ExamplePage {
  readonly locators = {
    submitButton: this.page.getByRole('button', { name: 'Submit' }),
    emailInput: this.page.getByLabel('Email'),
  };

  readonly actions = {
    submit: async () => {
      await this.locators.submitButton.click();
    },
    fillEmail: async (email: string) => {
      await this.locators.emailInput.fill(email);
    },
  };

  constructor(private readonly page: Page) {}
}
```

This pattern keeps locators and business logic in separate namespaces, making both refactoring and test readability significantly easier.

### Serial API Tests with Shared State

API tests model realistic user workflows where each step depends on the result of the previous one:

```typescript
test.describe.configure({ mode: 'serial' });

let authToken: string;
let noteId: string;

test('login', async ({ request }) => {
  /* captures authToken */
});
test('create note', async ({ request }) => {
  /* uses authToken, captures noteId */
});
test('delete note', async ({ request }) => {
  /* uses authToken + noteId */
});
```

### Visual Regression with Docker

Visual regression tests run inside the official `mcr.microsoft.com/playwright` Docker image to guarantee pixel-identical rendering across developer machines and CI runners. Per-browser baselines are committed to version control under `fixtures/reference-snapshots/` so regressions are caught at PR time.

### Cookie Pre-loading

Rather than clicking through cookie consent banners in every test, pre-recorded cookie states are loaded via the Playwright browser context API before the page is opened:

```typescript
await acceptCookiesBeforeSession(context); // loads fixtures/cookies/accept-cookies.json
```

### Faker.js Test Data

All API payloads use Faker.js to generate unique data on every run, preventing state pollution between test executions and making tests resilient against uniqueness constraints.

### DB Integration Test Layer

DB tests apply a three-layer verification pattern: seed state directly via SQL, trigger behaviour through the HTTP API, then assert the outcome via a fresh SQL query. This catches gaps that pure API tests miss — constraint violations, cascade behaviour, and timestamp accuracy that the API may not expose directly.

```typescript
test.describe.configure({ mode: 'serial' });

test.beforeEach(async () => {
  await truncateAll(); // wipe all tables between tests
});

test('API response matches DB row', async ({ request }) => {
  const user = await seedUser();
  const note = await seedNote(user.id);

  const res = await request.get(`/notes/${note.id}`, { headers: getAuthHeaders(user.token) });
  const body = await res.json();

  const row = await queryOne<NoteRow>('SELECT * FROM notes WHERE id = $1', [note.id]);
  expect(body.data.title).toBe(row.title);
});
```

---

## CI/CD Pipeline

### `code-quality.yml`

Runs on every push and pull request to `main`.

| Step          | Command                |
| ------------- | ---------------------- |
| Type checking | `npm run typecheck`    |
| Linting       | `npm run lint:check`   |
| Formatting    | `npm run format:check` |

### `playwright-reusable.yml`

Runs on push/PR to `main`, weekdays at 6 AM UTC, and on manual dispatch (with configurable environment URLs).

**Job 1 — E2E & API Tests:**

- Caches Playwright browser binaries for faster runs
- Runs all non-visual tests with 4 parallel workers
- Uploads the HTML report and JSON results as 30-day artifacts
- Sends an email summary (passed / failed / skipped / flaky counts) on completion

**Job 2 — Visual Regression Tests:**

- Runs inside the official Playwright Docker image for rendering consistency
- Uploads visual diff artifacts on failure
- Sends a separate email report for visual results

---

## Project Stats

| Metric                      | Value                     |
| --------------------------- | ------------------------- |
| Total test files            | 13 (8 E2E + 5 API)        |
| Page Object classes         | 29                        |
| Visual regression baselines | 80+ PNG files             |
| Browsers covered            | 3 (Chrome, Firefox, Edge) |
| Lines of test code          | ~4,500+                   |

---

## Author

**Orhun Akkan**
[GitHub](https://github.com/orhunakkan) · [LinkedIn](https://www.linkedin.com/in/orhunakkan)
