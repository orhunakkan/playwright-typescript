# Project: Playwright TypeScript Framework

## Overview

A multi-layer automated test framework built with **Playwright** and **TypeScript**.

| Layer           | Target                          | Location                   |
| --------------- | ------------------------------- | -------------------------- |
| E2E             | Practice web app browser UI     | `tests/e2e/`               |
| API             | Notes REST API                  | `tests/api/`               |
| Accessibility   | Practice web app WCAG scans     | `tests/accessibility/`     |
| Visual          | Practice web app screenshots    | `tests/visual-regression/` |
| Docs monitoring | Playwright documentation site   | `tests/pw-documents/`      |
| Sauce           | SauceDemo UI storage-state auth | `tests/sauce/`             |
| Performance     | Notes REST API load             | `tests/performance/`       |

**Core dependencies:** `@playwright/test`, `typescript`, `@faker-js/faker`, `allure-playwright`, `@axe-core/playwright`, `artillery`, `dotenv`, `eslint`, and `prettier`.

---

## Folder Structure

```text
.
├── docs/                             # Local Playwright docs: api, guides, mcp, agent-cli
├── config/
│   └── env.ts                        # Typed env config for E2E/API/Sauce URLs
├── fixtures/
│   ├── page-fixtures/                # Custom test fixture with all page objects
│   ├── notes-api-payloads/           # API types and Faker payload generators
│   ├── playwright-docs-links/        # Sidebar URL baseline for docs monitoring
│   └── reference-snapshots/          # Visual PNG + docs text baselines
├── pages/                            # Page Object Model classes (31)
├── tests/
│   ├── e2e/                          # Browser UI tests using the custom page fixture
│   ├── api/                          # REST API tests using @playwright/test request fixture
│   ├── accessibility/                # axe-core accessibility sweep
│   ├── performance/                  # Artillery load test script
│   ├── pw-documents/                 # Playwright docs link/content monitoring
│   ├── sauce/                        # SauceDemo setup project + storage-state spec
│   └── visual-regression/            # Screenshot comparison suite
├── utilities/
│   ├── api-schema-validator.ts       # API schema assertion helpers
│   ├── a11y.ts                       # axe-core wrapper: runA11yScan()
│   ├── calculator.ts                 # Calculator helpers used by E2E tests
│   └── error-listeners.ts            # Console/page/network error listener helpers
├── playwright.config.ts              # Projects, reporters, artifacts, snapshots
└── package.json                      # Scripts and dependencies
```

---

## Environment Configuration

**File:** `config/env.ts`

```ts
export const config = {
  e2eUrl: requireEnv('PRACTICE_E2E_URL'),
  apiUrl: requireEnv('PRACTICE_API_URL'),
  sauceDemoUrl: requireEnv('SAUCE_DEMO_URL'),
  env: process.env.TEST_ENV ?? 'dev',
} as const;
```

- Use `config` everywhere in tests, pages, and utilities; do not read `process.env.*` directly outside configuration files.
- `.env` is used by default.
- `.env.${TEST_ENV}` is used when `TEST_ENV` is set, e.g. `TEST_ENV=staging` loads `.env.staging`.
- Required public practice URLs: `PRACTICE_E2E_URL`, `PRACTICE_API_URL`, and `SAUCE_DEMO_URL`.

---

## Playwright Projects

Defined in `playwright.config.ts`:

| Project name          | Test directory            | Key `use` / notes                                                                  |
| --------------------- | ------------------------- | ---------------------------------------------------------------------------------- |
| `API Tests`           | `tests/api`               | Uses Playwright `request` fixture                                                  |
| `Desktop Chrome`      | `tests/e2e`               | `devices['Desktop Chrome']`                                                        |
| `Desktop Firefox`     | `tests/e2e`               | `devices['Desktop Firefox']`                                                       |
| `Desktop Edge`        | `tests/e2e`               | `devices['Desktop Edge']`                                                          |
| `Mobile Safari`       | `tests/e2e`               | `devices['iPhone 15 Pro Max']`                                                     |
| `Mobile Chrome`       | `tests/e2e`               | `devices['Pixel 7']`                                                               |
| `Accessibility Tests` | `tests/accessibility`     | `devices['Desktop Chrome']`                                                        |
| `Desktop Chrome`      | `tests/pw-documents`      | Dedicated docs-monitoring project currently shares the Desktop Chrome project name |
| `Visual Regression`   | `tests/visual-regression` | `devices['Desktop Chrome']`; run via Docker scripts                                |
| `sauce-auth-setup`    | `tests/sauce`             | Matches `*.setup.ts`; creates `.auth/sauce-user.json`                              |
| `Sauce Auth Chrome`   | `tests/sauce`             | Uses `storageState: '.auth/sauce-user.json'`; depends on `sauce-auth-setup`        |

**Global settings:**

- `timeout: 30000`
- `fullyParallel: true`
- `retries: 1` on CI, `0` locally
- `workers: 4` on CI, default locally
- `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`
- `snapshotPathTemplate: 'fixtures/reference-snapshots/{testFileName}/{testName}/{projectName}-{arg}{ext}'`
- Reporters: `list`, `html`, `json`, and `allure-playwright`

---

## Page Object Model Convention

Every page lives in `pages/<kebab-case-name>.page.ts` and exposes separate `locators` and `actions` objects:

```ts
import { Locator, Page } from '@playwright/test';
import { config } from '../config/env';

export class MyPage {
  readonly locators: {
    heading: Locator;
    submitButton: Locator;
  };

  readonly actions: {
    goto: () => Promise<void>;
    submit: () => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'My Page' }),
      submitButton: page.getByRole('button', { name: 'Submit' }),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${config.e2eUrl}/my-page.html`);
      },
      submit: async () => {
        await this.locators.submitButton.click();
      },
    };
  }
}
```

**Rules:**

- `locators` contain Playwright `Locator` values or typed locator factory methods only.
- `actions` contain async interaction/navigation methods.
- Specs should use fixtures and page-object methods rather than raw selectors.
- Prefer `getByRole`, `getByLabel`, `getByPlaceholder`, `getByText`, then `getByTestId`; use CSS/XPath only as a last resort inside page objects.

---

## Fixture System

**File:** `fixtures/page-fixtures/index.ts`

E2E, accessibility, visual-regression, and fixture-backed Sauce specs import `{ test, expect }` from this file. API and docs-monitoring specs import from `@playwright/test`.

Every new page class must be registered in three places inside `fixtures/page-fixtures/index.ts`:

1. Import the class.
2. Add a property to `PageFixtures`.
3. Add a `base.extend<PageFixtures>()` callback.

Then add or update the consuming spec.

---

## Allure Annotation Convention

Every new `test.describe` block should set Allure labels in `beforeEach`:

```ts
import { feature, story, severity } from 'allure-js-commons';

test.describe('My Feature', () => {
  test.beforeEach(async () => {
    await feature('My Feature');
    await story('My Story');
    await severity('critical'); // critical | normal | minor | trivial
  });
});
```

Use Playwright tag syntax for cross-cutting groups:

```ts
test('should do something important', { tag: ['@smoke', '@critical'] }, async ({ myPage }) => {
  // ...
});
```

---

## API Testing Pattern

```ts
import { test, expect } from '@playwright/test';
import { feature, story, severity } from 'allure-js-commons';
import { config } from '../../config/env';
import { contentTypeHeaders, getAuthHeaders, generateRegisterPayload } from '../../fixtures/notes-api-payloads/shared-request-payloads';
import type { ApiResponse, UserData } from '../../fixtures/notes-api-payloads/api-types';
import { expectMatchesSchema, UserDataSchema } from '../../utilities/api-schema-validator';
```

- Use Playwright's `request` fixture.
- Build URLs from `config.apiUrl`.
- Use Faker payload generators from `fixtures/notes-api-payloads/`.
- Use `getAuthHeaders(token)` for protected endpoints.
- Validate response structure with `expectMatchesSchema` before detailed assertions.
- Stateful API suites must use `test.describe.configure({ mode: 'serial' })`.

---

## Accessibility Testing Pattern

```ts
import { runA11yScan } from '../../utilities/a11y';

const results = await runA11yScan(page);
expect(results.violations).toEqual([]);
```

The helper defaults to WCAG 2.1 AA-relevant tags. Attach `results.violations` as JSON when failures occur.

---

## Visual Regression Testing

- Tests live in `tests/visual-regression/visual-regression.spec.ts`.
- Baselines are stored in `fixtures/reference-snapshots/visual-regression.spec.ts/`.
- Run only through Docker-backed npm scripts:

```bash
npm run test:visual
npm run test:visual:update
```

---

## npm Scripts Quick Reference

| Script                    | What it does                                 |
| ------------------------- | -------------------------------------------- |
| `test:e2e`                | E2E tests across desktop and mobile projects |
| `test:api`                | Notes API tests                              |
| `test:accessibility`      | Accessibility project                        |
| `test:pw-documents`       | Playwright docs monitoring                   |
| `test:sauce`              | SauceDemo auth setup + storage-state tests   |
| `test:perf`               | Artillery load test                          |
| `test:visual`             | Visual comparison in Docker                  |
| `test:visual:update`      | Regenerate visual baselines in Docker        |
| `report:allure:serve`     | Serve raw Allure results                     |
| `report:allure:generate`  | Build static Allure report                   |
| `report:allure:open`      | Open generated Allure report                 |
| `format` / `format:check` | Write/check Prettier formatting              |
| `typecheck`               | `tsc --noEmit`                               |
| `lint:check` / `lint:fix` | Check/fix ESLint issues                      |

---

## Naming Conventions

| Thing            | Convention                   | Example                      |
| ---------------- | ---------------------------- | ---------------------------- |
| Page class files | `kebab-case.page.ts`         | `login-form.page.ts`         |
| Spec files       | `kebab-case.spec.ts`         | `notes-users-errors.spec.ts` |
| Page class names | `PascalCase` + `Page` suffix | `LoginFormPage`              |
| Fixture keys     | `camelCase` + `Page` suffix  | `loginFormPage`              |
| API/E2E imports  | no `.js` extension           | `'../../utilities/a11y'`     |

---

## Currently Not Present

There is no active `tests/db/` directory, `utilities/db-client.ts`, PostgreSQL dependency, or `test:db` script in the current repository state. Do not create DB specs from old templates unless the DB infrastructure is restored first.
