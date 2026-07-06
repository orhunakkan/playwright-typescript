---
name: playwright-framework-scaffolder
description: >
  Implements one of the 10 identified Playwright framework gaps on demand, writing scaffolded
  code to the correct project locations. Use this skill whenever the user wants to add a missing
  framework pattern, implement a specific gap by number, or says things like "scaffold gap #1",
  "add storageState", "set up custom fixtures", "add global setup", "implement network mocking
  pattern", "set up Allure", "add retry strategy", or "scaffold mobile tests". Run one gap at a
  time. Always identify which gap the user wants before proceeding.

compatibility: 'Requires write access to the project. No browser tools needed. Reads and modifies playwright.config.ts, tsconfig.json, package.json as needed per gap. Output: one or more files written plus a checklist.'
---

# Playwright Framework Scaffolder

Implements missing Playwright framework patterns one gap at a time. Each gap produces
ready-to-use scaffolded code with TODO comments marking what the user must fill in.

---

## ⛔ Guardrail — Gap Number or Name Required

**Run this check first.**

Scan the user's prompt for a gap number (1–10) or a recognizable gap name (e.g. "storageState",
"fixtures", "global setup", "Allure", "flake", "mobile").

**If no gap is identified → STOP.**

Respond with the full gap list and ask the user to pick one:

> ⛔ Please specify which framework gap to scaffold. Available gaps:
>
> 1. Auth state reuse — `storageState` + `globalSetup`
> 2. Network interception — `page.route()` mocking
> 3. Custom fixtures — `test.extend()`
> 4. Global setup / teardown — `globalSetup.ts`, `globalTeardown.ts`
> 5. Multi-environment config — typed env wrapper + validation
> 6. Custom reporter — Allure or custom HTML reporter
> 7. External state seeding — data seed/cleanup hooks
> 8. Flake detection — quarantine pattern + retry strategy
> 9. Parallel worker isolation — `test.describe.parallel/serial` + worker-scoped fixtures
> 10. Mobile-specific tests — touch, viewport, responsive breakpoints
>
> Reply with a number (e.g. "gap 3") or a keyword (e.g. "storageState").

---

## ⛔ Guardrail — One Gap Per Invocation

If the user requests multiple gaps at once, implement only the **first** one mentioned
and inform the user:

> Implementing gap #<N> now. Run this skill again after reviewing the output to implement
> the next gap.

---

## When You're Invoked

Both guardrails have passed. Confirm the gap with the user ("Scaffolding gap #N: <name> — proceed?")
then execute the corresponding phase set below.

---

## Gap Implementations

---

### Gap 1 — Auth State Reuse (`storageState` + `globalSetup`)

**Purpose:** Log in once per test run; share the session across all tests that need auth.

**Files to create/modify:**

| Action | File                                                                          |
| ------ | ----------------------------------------------------------------------------- |
| Create | `global-setup.ts`                                                             |
| Create | `utilities/auth.ts`                                                           |
| Modify | `playwright.config.ts` — add `globalSetup` and `storageState` to auth project |

**Scaffolded output:**

`global-setup.ts`:

```typescript
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  // TODO: replace with your login URL and credentials
  await page.goto(`${process.env.BASE_URL}/login`);
  await page.getByLabel('Email').fill(process.env.AUTH_EMAIL ?? '');
  await page.getByLabel('Password').fill(process.env.AUTH_PASSWORD ?? '');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard');
  await page.context().storageState({ path: 'fixtures/auth.json' });
  await browser.close();
}

export default globalSetup;
```

`utilities/auth.ts`:

```typescript
export const AUTH_STATE_PATH = 'fixtures/auth.json';
```

`playwright.config.ts` additions:

```typescript
globalSetup: './global-setup.ts',
// In the auth project:
{ name: 'Authenticated', use: { storageState: 'fixtures/auth.json' } },
```

`.gitignore` addition: `fixtures/auth.json`

**Checklist:**

- [ ] Fill in the login URL in `global-setup.ts`
- [ ] Add `AUTH_EMAIL` and `AUTH_PASSWORD` to `.env` (and `.env.example` as placeholders)
- [ ] Add `fixtures/auth.json` to `.gitignore`
- [ ] Apply `test.use({ storageState: AUTH_STATE_PATH })` in auth-dependent spec files

---

### Gap 2 — Network Interception (`page.route()` mocking)

**Purpose:** Intercept and mock API responses in E2E tests; simulate errors and offline states.

**Files to create:**

| Action | File                                                   |
| ------ | ------------------------------------------------------ |
| Create | `utilities/route-helpers.ts`                           |
| Create | `tests/network/network-mocking.spec.ts` (example spec) |

**Scaffolded output:**

`utilities/route-helpers.ts`:

```typescript
import { Page } from '@playwright/test';

export async function mockApiResponse(page: Page, urlPattern: string | RegExp, body: unknown, status = 200) {
  await page.route(urlPattern, (route) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) }));
}

export async function simulateNetworkError(page: Page, urlPattern: string | RegExp) {
  await page.route(urlPattern, (route) => route.abort('failed'));
}

export async function simulateSlowResponse(page: Page, urlPattern: string | RegExp, delayMs: number) {
  await page.route(urlPattern, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    await route.continue();
  });
}
```

**Checklist:**

- [ ] Replace `urlPattern` examples with actual API endpoints from the lab
- [ ] Use `mockApiResponse` in network-dependent spec `beforeEach` hooks
- [ ] Use `simulateNetworkError` to test error states and fallback UI

---

### Gap 3 — Custom Fixtures (`test.extend()`)

**Purpose:** Inject Page Object Models and shared setup as Playwright fixtures instead of
instantiating them manually in every test.

**Files to create:**

| Action | File                |
| ------ | ------------------- |
| Create | `fixtures/index.ts` |

**Scaffolded output:**

`fixtures/index.ts`:

```typescript
import { test as base } from '@playwright/test';
import { AccessibleLocatorsPage } from '../pages/accessible-locators.page';
import { HomePage } from '../pages/homepage.page';
// TODO: import additional page objects here as labs are added

type Fixtures = {
  accessibleLocatorsPage: AccessibleLocatorsPage;
  homePage: HomePage;
  // TODO: add more fixture types here
};

export const test = base.extend<Fixtures>({
  accessibleLocatorsPage: async ({ page }, use) => {
    await use(new AccessibleLocatorsPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  // TODO: add more fixtures here
});

export { expect } from '@playwright/test';
```

**Usage in spec files:**

```typescript
// Replace: import { test, expect } from '@playwright/test';
// With:
import { test, expect } from '../../fixtures/index';

test('example', async ({ accessibleLocatorsPage }) => {
  // POM injected automatically — no `new AccessibleLocatorsPage(page)` needed
});
```

**Checklist:**

- [ ] Add a fixture entry for each new POM as labs are added
- [ ] Update existing spec files to import `test` from `fixtures/index` instead of `@playwright/test`
- [ ] For auth fixtures, combine with Gap #1 by passing `storageState` in the fixture setup

---

### Gap 4 — Global Setup / Teardown

**Purpose:** Run one-time setup (health checks, data seeding) before the suite and cleanup after.

**Files to create/modify:**

| Action | File                                                 |
| ------ | ---------------------------------------------------- |
| Create | `global-setup.ts` (if not already created by Gap #1) |
| Create | `global-teardown.ts`                                 |
| Modify | `playwright.config.ts`                               |

**Scaffolded output:**

`global-teardown.ts`:

```typescript
import { FullConfig } from '@playwright/test';

async function globalTeardown(_config: FullConfig) {
  // TODO: add cleanup — delete test data, close connections, reset state
  console.log('Global teardown complete');
}

export default globalTeardown;
```

`playwright.config.ts` additions:

```typescript
globalSetup: './global-setup.ts',
globalTeardown: './global-teardown.ts',
```

**Checklist:**

- [ ] Add a base URL health check in `global-setup.ts` (ping `process.env.BASE_URL` before tests)
- [ ] Add test data cleanup in `global-teardown.ts` if any tests seed a database
- [ ] Ensure `globalSetup` and `globalTeardown` paths are relative to `playwright.config.ts`

---

### Gap 5 — Multi-Environment Config (typed env wrapper)

**Purpose:** Validate required env vars at startup; expose them as a typed object instead of
accessing `process.env` directly in tests.

**Files to create:**

| Action | File               |
| ------ | ------------------ |
| Create | `utilities/env.ts` |
| Update | `.env.example`     |

**Scaffolded output:**

`utilities/env.ts`:

```typescript
function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  baseUrl: required('BASE_URL'),
  // TODO: add AUTH_EMAIL, AUTH_PASSWORD, API_KEY, etc. as needed
} as const;
```

**Checklist:**

- [ ] Add all required env var names to `utilities/env.ts`
- [ ] Add corresponding placeholder lines to `.env.example`
- [ ] Import `env` instead of `process.env.X` in global setup and utility files
- [ ] Add validation call in `global-setup.ts`: `import './utilities/env';` at the top

---

### Gap 6 — Custom Reporter (Allure)

**Purpose:** Generate rich HTML test reports with steps, screenshots, and history.

**Installation required:**

```bash
npm install --save-dev allure-playwright allure-commandline
```

**Files to modify:**

| Action     | File                   |
| ---------- | ---------------------- |
| Modify     | `playwright.config.ts` |
| Add script | `package.json`         |

**`playwright.config.ts` reporter section:**

```typescript
reporter: [
  ['list'],
  ['allure-playwright', { outputFolder: 'allure-results' }],
  ['html', { outputFolder: 'playwright-report' }],
  ['json', { outputFile: 'playwright-report/results.json' }],
],
```

**`package.json` scripts to add:**

```json
"report:allure": "allure generate allure-results --clean -o allure-report && allure open allure-report"
```

**`.gitignore` additions:** `allure-results/`, `allure-report/`

**Checklist:**

- [ ] Run `npm install` after adding the dependency
- [ ] Add `allure-results/` and `allure-report/` to `.gitignore`
- [ ] Run `npm run report:allure` after a test run to view the report

---

### Gap 7 — External State Seeding

**Purpose:** Seed test data before tests and clean up after, using API calls or direct DB access.

**Files to create:**

| Action | File                |
| ------ | ------------------- |
| Create | `utilities/seed.ts` |

**Scaffolded output:**

`utilities/seed.ts`:

```typescript
// TODO: replace with actual API base URL and auth headers
const API_BASE = process.env.BASE_URL ?? '';

export async function seedTestData(data: Record<string, unknown>): Promise<void> {
  // TODO: implement POST to your seed endpoint or direct DB call
  const response = await fetch(`${API_BASE}/api/test/seed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Seed failed: ${response.status}`);
}

export async function cleanupTestData(identifier: string): Promise<void> {
  // TODO: implement DELETE to your cleanup endpoint
  await fetch(`${API_BASE}/api/test/cleanup/${identifier}`, { method: 'DELETE' });
}
```

**Checklist:**

- [ ] Implement the actual seed and cleanup calls for your backend
- [ ] Call `seedTestData` in `beforeEach` or `globalSetup` as appropriate
- [ ] Call `cleanupTestData` in `afterEach` or `globalTeardown`
- [ ] Ensure seed/cleanup are idempotent (safe to run multiple times)

---

### Gap 8 — Flake Detection & Quarantine

**Purpose:** Identify flaky tests, quarantine them without removing coverage, and report flake rate.

**Files to create/modify:**

| Action | File                             |
| ------ | -------------------------------- |
| Create | `utilities/quarantine.ts`        |
| Modify | `playwright.config.ts` (retries) |

**Scaffolded output:**

`utilities/quarantine.ts`:

```typescript
import { test } from '@playwright/test';

// Wrap a flaky test with this to quarantine it.
// It still runs but failures are soft — they won't block CI.
export function quarantine(title: string, fn: Parameters<typeof test>[1]) {
  test(title, async (args) => {
    try {
      await fn(args);
    } catch (error) {
      console.warn(`[QUARANTINE] ${title} failed — tracked but not blocking`);
      args.testInfo.annotations.push({ type: 'quarantine', description: String(error) });
    }
  });
}
```

`playwright.config.ts` — increase retries to surface flakes:

```typescript
retries: process.env.CI ? 2 : 1,
```

**Usage:**

```typescript
import { quarantine } from '../../utilities/quarantine';

quarantine('flaky animation test', async ({ page }) => {
  // test body
});
```

**Checklist:**

- [ ] Apply `quarantine()` wrapper to known flaky tests immediately
- [ ] Track quarantined tests in a comment or dedicated describe block: `test.describe('Quarantined', ...)`
- [ ] Review quarantine list each sprint; fix root cause and remove wrapper when stable

---

### Gap 9 — Parallel Worker Isolation

**Purpose:** Control parallelism at the describe level; use worker-scoped fixtures for resources
that are expensive to create per test.

**Files to create/modify:**

| Action  | File                                      |
| ------- | ----------------------------------------- |
| Create  | `fixtures/worker-fixtures.ts`             |
| Example | `tests/parallel-example/parallel.spec.ts` |

**Scaffolded output:**

`fixtures/worker-fixtures.ts`:

```typescript
import { test as base } from '@playwright/test';

type WorkerFixtures = {
  workerStorageState: string;
  // TODO: add other worker-scoped resources (DB connections, auth tokens)
};

export const test = base.extend<Record<string, never>, WorkerFixtures>({
  workerStorageState: [
    async ({}, use) => {
      // TODO: set up one auth session per worker
      await use('fixtures/auth.json');
    },
    { scope: 'worker' },
  ],
});
```

**Example usage in spec:**

```typescript
test.describe.parallel('Parallel suite', () => {
  test('test A', async ({ page }) => {
    /* ... */
  });
  test('test B', async ({ page }) => {
    /* ... */
  });
});

test.describe.serial('Serial suite — order matters', () => {
  test('step 1', async ({ page }) => {
    /* ... */
  });
  test('step 2', async ({ page }) => {
    /* ... */
  });
});
```

**Checklist:**

- [ ] Use `test.describe.parallel()` only when tests are truly independent
- [ ] Use `test.describe.serial()` for tests that share state or depend on order
- [ ] Move expensive setup (auth, DB seed) to worker-scoped fixtures to avoid per-test cost

---

### Gap 10 — Mobile-Specific Tests

**Purpose:** Cover touch gestures, responsive breakpoints, and viewport-dependent behavior.

**Files to create:**

| Action | File                          |
| ------ | ----------------------------- |
| Create | `tests/mobile/mobile.spec.ts` |

**Scaffolded output:**

`tests/mobile/mobile.spec.ts`:

```typescript
import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['iPhone 14'] });

test.describe('Mobile — iPhone 14', () => {
  test('page renders correctly at mobile viewport', async ({ page }) => {
    await page.goto('/');
    // TODO: assert mobile-specific layout (hamburger menu, stacked cards, etc.)
    await expect(page).toHaveTitle(/.+/);
  });

  test('touch tap on primary action', async ({ page }) => {
    await page.goto('/accessible-locators');
    // TODO: replace with actual mobile-specific interaction
    await page.tap('button[aria-label="Dark mode"]');
  });

  test('swipe gesture (if applicable)', async ({ page }) => {
    // TODO: implement swipe using page.touchscreen if needed
    // page.touchscreen.tap(x, y) or page.mouse.move with touch events
  });
});
```

**`playwright.config.ts` additions** (projects already have iPhone/Pixel — enable test file):

```typescript
{ name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
{ name: 'Mobile Safari', use: { ...devices['iPhone 14'] } },
```

**Checklist:**

- [ ] Replace placeholder assertions with real mobile-specific UI checks
- [ ] Add viewport-dependent visibility tests (desktop-only elements hidden on mobile)
- [ ] Test any touch-specific interactions (swipe, pinch-zoom if applicable)

---

## Quick-Start Prompt Template

```
1. Identify which gap (1–10) the user wants to implement
2. Confirm: "Scaffolding gap #N: <name> — proceed?"
3. Create/modify the files listed in that gap's "Files to create/modify" table
4. Print the checklist of TODOs the user must complete
5. Suggest which lab or spec to apply the pattern to first
```
