# Project: Playwright TypeScript Framework

## Overview

A multi-layer automated test framework built with **Playwright** and **TypeScript**. It covers four testing layers against a shared backend:

| Layer       | Target                            | Location             |
| ----------- | --------------------------------- | -------------------- |
| E2E         | Practice web app (browser UI)     | `tests/e2e/`         |
| API         | Notes REST API (HTTP)             | `tests/api/`         |
| DB          | PostgreSQL database (direct SQL)  | `tests/db/`          |
| Performance | Notes REST API (load)             | `tests/performance/` |
| Sauce       | SauceDemo UI (storage-state auth) | `tests/sauce/`       |

**Core dependencies:** `@playwright/test`, `typescript`, `pg`, `@faker-js/faker`, `allure-playwright`, `allure-js-commons`, `@axe-core/playwright`, `artillery`, `dotenv`.

---

## Folder Structure

```
.
├── docs/
│   ├── api/                          # Playwright class API reference — one file per class (class-locator.md, class-page.md, etc.)
│   ├── guides/                       # Playwright how-to and concept guides (locators.md, auth.md, network.md, etc.)
│   ├── mcp/                          # Playwright MCP server documentation
│   └── agent-cli/                    # Playwright agent CLI documentation
├── config/
│   └── env.ts                        # Typed env config — single source of truth for all env vars
├── fixtures/
│   ├── page-fixtures/
│   │   └── index.ts                  # Custom test fixture — extends base with all page objects
│   ├── notes-api-payloads/
│   │   ├── api-types.ts              # TypeScript types for Notes API responses
│   │   ├── shared-request-payloads.ts# Headers + shared payload generators (register, login)
│   │   ├── notes-request-payloads.ts # Note-specific payload generators
│   │   └── users-request-payloads.ts # User-specific payload generators (update profile, forgot pw)
│   ├── db-payloads/
│   │   ├── db-types.ts               # TypeScript interfaces: UserRow, NoteRow
│   │   └── db-payload-generators.ts  # Shared constants: noteCategories, NoteCategory type
│   ├── playwright-docs-links/
│   │   └── sidebar-links.json        # Reference snapshot for doc link monitoring test
│   └── reference-snapshots/          # Visual regression PNG baselines (committed to git)
├── pages/                            # Page Object Model classes — one file per page
├── tests/
│   ├── e2e/                          # Browser UI tests — use the custom page fixture
│   ├── api/                          # REST API tests — use @playwright/test request fixture
│   ├── db/                           # Direct SQL tests — use db-client utilities
│   ├── performance/                  # Artillery load test script
│   └── sauce/                        # SauceDemo auth setup + storage-state spec
├── utilities/
│   ├── db-client.ts                  # PostgreSQL helpers: queryOne, queryMany, queryRaw, seed*, truncateAll
│   ├── api-schema-validator.ts       # Schema assertion helpers + pre-built schemas
│   ├── a11y.ts                       # Axe-core wrapper: runA11yScan()
│   ├── calculator.ts                 # Math helpers used by calculator page tests
│   └── error-listeners.ts            # Page event listeners: console errors, page errors, failed requests
├── playwright.config.ts              # All project definitions, reporters, global settings
└── package.json                      # Scripts, dependencies
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
  dbHost: process.env.DB_HOST ?? '',
  dbPort: parseInt(process.env.DB_PORT ?? '5432', 10),
  dbName: process.env.DB_NAME ?? '',
  dbUser: process.env.DB_USER ?? '',
  dbPassword: process.env.DB_PASSWORD ?? '',
} as const;
```

- **Always import from `config/env.ts`** — never use `process.env.*` directly in tests or pages.
- Env file is resolved as `.env` by default, or `.env.${TEST_ENV}` if `TEST_ENV` is set (e.g., `TEST_ENV=staging`).
- DB vars have empty-string fallbacks so API/E2E tests can run without a local database configured.

---

## Playwright Projects

Defined in `playwright.config.ts`:

| Project name        | Test directory | Key `use`                                                                                           |
| ------------------- | -------------- | --------------------------------------------------------------------------------------------------- |
| `DB Tests`          | `tests/db`     | none (uses `pg` pool directly)                                                                      |
| `API Tests`         | `tests/api`    | none (uses `request` fixture)                                                                       |
| `Desktop Chrome`    | `tests/e2e`    | `devices['Desktop Chrome']`                                                                         |
| `Desktop Firefox`   | `tests/e2e`    | `devices['Desktop Firefox']`                                                                        |
| `Desktop Edge`      | `tests/e2e`    | `devices['Desktop Edge']`                                                                           |
| `Mobile Safari`     | `tests/e2e`    | `devices['iPhone 15 Pro Max']`                                                                      |
| `Mobile Chrome`     | `tests/e2e`    | `devices['Pixel 7']`                                                                                |
| `sauce-auth-setup`  | `tests/sauce`  | `devices['Desktop Chrome']`, matches `*.setup.ts`                                                   |
| `Sauce Auth Chrome` | `tests/sauce`  | `devices['Desktop Chrome']`, `storageState: '.auth/sauce-user.json'`, depends on `sauce-auth-setup` |

**Global settings:**

- `timeout: 30000` (30 s per test)
- `retries: 1` on CI, `0` locally
- `workers: 4` on CI, unlimited locally
- `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`
- `outputDir: 'test-results'`
- `snapshotPathTemplate: 'fixtures/reference-snapshots/{testFileName}/{testName}/{projectName}-{arg}{ext}'`

---

## Page Object Model (POM) Convention

Every page lives in `pages/<kebab-case-name>.page.ts` and follows this exact structure:

```ts
import { Locator, Page } from '@playwright/test';
import { config } from '../config/env';

export class MyPage {
  readonly locators: {
    // typed Locator properties — pure Playwright locators, no logic
    heading: Locator;
    submitButton: Locator;
  };
  readonly actions: {
    // typed async methods — navigation, interactions, multi-step flows
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

- `locators` — only `Locator` values. No logic, no `await`, no conditionals.
- `actions` — async methods that compose locator interactions and navigation. Actions may call other actions.
- Constructor receives `private readonly page: Page`.
- Prefer semantic locators: `getByRole`, `getByLabel`, `getByPlaceholder`, `getByText`, `getByTestId` over CSS selectors.

---

## Fixture System

**File:** `fixtures/page-fixtures/index.ts`

All E2E tests import `{ test, expect }` from this file, **not** from `@playwright/test`.

Every new page class must be registered in three places inside `index.ts`:

1. **Import** the class at the top.
2. **Add a property** to the `PageFixtures` type (key = camelCase page name).
3. **Add a callback** inside `base.extend<PageFixtures>({...})`.

```ts
// 1. Import
import { MyPage } from '../../pages/my.page';

// 2. Type
type PageFixtures = {
  myPage: MyPage;
  // ...existing entries
};

// 3. Extend
const test = base.extend<PageFixtures>({
  myPage: async ({ page }, use) => {
    await use(new MyPage(page));
  },
  // ...existing entries
});
```

---

## Allure Annotation Convention

Every `test.describe` block's `beforeEach` must set three allure labels:

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

Individual tests use Playwright's built-in tag syntax for `@smoke` / `@critical`:

```ts
test('should do something important', { tag: ['@smoke', '@critical'] }, async ({ myPage }) => {
  // ...
});
```

---

## Serial Mode for API and DB Tests

API tests share state across tests (auth token, created resource IDs). DB tests share seeded rows.  
Both must declare serial mode at the top of the `test.describe` block:

```ts
test.describe.configure({ mode: 'serial' });
```

---

## API Testing Pattern

```ts
import { test, expect } from '@playwright/test'; // NOT from fixtures
import { config } from '../../config/env';
import { contentTypeHeaders, getAuthHeaders, generateRegisterPayload } from '../../fixtures/notes-api-payloads/shared-request-payloads';
import type { ApiResponse, UserData } from '../../fixtures/notes-api-payloads/api-types';
import { expectMatchesSchema, UserDataSchema } from '../../utilities/api-schema-validator';
```

- Use the `request` fixture (injected by Playwright — no import needed).
- Build URLs from `config.apiUrl`.
- Use `getAuthHeaders(token)` for protected endpoints (`x-auth-token` header).
- Always validate response body structure with `expectMatchesSchema` before asserting individual fields.
- Available pre-built schemas: `UserDataSchema`, `LoginDataSchema`, `UserProfileDataSchema`, `NoteDataSchema`, `ErrorResponseSchema`, `HealthCheckSchema`.

---

## DB Testing Pattern

```ts
import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { truncateAll, seedUser, seedNote, queryOne, queryMany, queryRaw, closePool } from '../../utilities/db-client.js';
import type { NoteRow, UserRow } from '../../fixtures/db-payloads/db-types.js';
```

**Key utilities:**

| Function                       | Returns                   | Use case                                                    |
| ------------------------------ | ------------------------- | ----------------------------------------------------------- |
| `truncateAll()`                | `Promise<void>`           | Reset all tables + sequences. Always call in `beforeEach`.  |
| `seedUser(overrides?)`         | `Promise<UserRow>`        | Insert a user row with faker defaults.                      |
| `seedNote(userId, overrides?)` | `Promise<NoteRow>`        | Insert a note row with faker defaults.                      |
| `queryOne<T>(sql, params?)`    | `Promise<T \| null>`      | Read a single row.                                          |
| `queryMany<T>(sql, params?)`   | `Promise<T[]>`            | Read multiple rows.                                         |
| `queryRaw(sql, params?)`       | `Promise<pg.QueryResult>` | Raw query (COUNT, pg_sleep, DDL, etc.).                     |
| `closePool()`                  | `Promise<void>`           | Close the pg connection pool. Call in `afterAll` if needed. |

**Note:** Use `.js` extension in imports for DB test files because the project uses `"type": "module"`.

---

## Accessibility Testing Pattern

```ts
import { runA11yScan } from '../../utilities/a11y';

const results = await runA11yScan(page, {
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'], // default
  include: '#main-content', // optional CSS selector
  exclude: '.third-party-widget', // optional CSS selector
});
expect(results.violations).toEqual([]);
```

---

## Visual Regression Testing

- Tests live in `tests/e2e/visual-regression.spec.ts`.
- **Must run inside Docker** — never run locally with `npx playwright test visual-regression.spec.ts`.
- Baselines are stored in `fixtures/reference-snapshots/visual-regression.spec.ts/`.
- Use `npm run test:visual` to compare and `npm run test:visual:update` to regenerate baselines.

---

## Naming Conventions

| Thing                | Convention                   | Example                          |
| -------------------- | ---------------------------- | -------------------------------- |
| Page class files     | `kebab-case.page.ts`         | `login-form.page.ts`             |
| Spec files           | `kebab-case.spec.ts`         | `notes-users-errors.spec.ts`     |
| Page class names     | `PascalCase` + `Page` suffix | `LoginFormPage`                  |
| Fixture keys         | `camelCase` + `Page` suffix  | `loginFormPage`                  |
| DB spec imports      | `.js` extension              | `'../../utilities/db-client.js'` |
| API/E2E spec imports | no extension                 | `'../../utilities/a11y'`         |

---

## npm Scripts Quick Reference

| Script                   | Command                                                                    | What it does                   |
| ------------------------ | -------------------------------------------------------------------------- | ------------------------------ |
| `test:db`                | `npx playwright test --project="DB Tests" --workers=1`                     | DB tests, single worker        |
| `test:visual`            | Docker run with `visual-regression.spec.ts`                                | Visual comparison in Docker    |
| `test:visual:update`     | Docker run with `--update-snapshots`                                       | Regenerate baselines in Docker |
| `test:perf`              | `npx artillery run --dotenv .env tests/performance/performance-testing.ts` | Load test                      |
| `report:allure:serve`    | `allure serve allure-results`                                              | Live Allure report in browser  |
| `report:allure:generate` | `allure generate allure-results --clean -o allure-report`                  | Build static Allure report     |
| `report:allure:open`     | `allure open allure-report`                                                | Open pre-built static report   |
| `format`                 | `prettier --write .`                                                       | Auto-format all files          |
| `format:check`           | `prettier --check .`                                                       | Check formatting               |
| `typecheck`              | `tsc --noEmit`                                                             | Type-check without emitting    |
| `lint:check`             | `eslint .`                                                                 | Lint check                     |
| `lint:fix`               | `eslint . --fix`                                                           | Auto-fix lint issues           |
