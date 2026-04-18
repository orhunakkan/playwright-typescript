# 🔁 Playwright — Test Retries

> **Source:** [playwright.dev/docs/test-retries](https://playwright.dev/docs/test-retries)

---

## What Are Test Retries?

Test retries let Playwright automatically re-run a failing test — useful for **flaky tests** that fail intermittently due to timing, network, or environment issues.

By default, **retries are disabled.** You opt in.

---

## How Failures Work Under the Hood

Playwright runs tests in **worker processes** — isolated OS processes, each with its own browser. When a test fails, the **entire worker is discarded** and a fresh one starts.

### Without retries

```text
Worker #1 starts
  ✅ beforeAll runs
  ✅ first good → passes
  ❌ second flaky → FAILS
  ✅ afterAll runs

Worker #2 starts
  ✅ beforeAll runs again
  ✅ third good → passes
  ✅ afterAll runs
```

### With retries enabled

```text
Worker #1 starts
  ✅ beforeAll runs
  ✅ first good → passes
  ❌ second flaky → fails

Worker #2 starts
  ✅ beforeAll runs again
  🔁 second flaky → retried → PASSES
  ✅ third good → passes
```

> **Key insight:** Each retry starts a brand-new worker. Failing tests cannot "infect" healthy ones.

---

## Configuring Retries

### CLI (one-off)

```bash
npx playwright test --retries=3
```

### Config file (persistent)

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  retries: 3, // give every failing test 3 attempts
});
```

### Per describe group (scoped)

```ts
test.describe(() => {
  test.describe.configure({ retries: 2 });

  test('test 1', async ({ page }) => {
    /* ... */
  });
  test('test 2', async ({ page }) => {
    /* ... */
  });
});
```

---

## How Playwright Categorizes Results

| Status        | Meaning                             |
| ------------- | ----------------------------------- |
| ✅ **passed** | Passed on the first run             |
| ⚠️ **flaky**  | Failed first, but passed on a retry |
| ❌ **failed** | Failed on first run AND all retries |

### Example output

```text
Running 3 tests using 1 worker

  ✓  example.spec.ts › first passes       (438ms)
  ×  example.spec.ts › second flaky       (691ms)   ← first attempt
  ✓  example.spec.ts › second flaky       (522ms)   ← retry passed
  ✓  example.spec.ts › third passes       (932ms)

  1 flaky   example.spec.ts › second flaky
  2 passed  (4s)
```

---

## Detecting Retries at Runtime

Use `testInfo.retry` inside any test, hook, or fixture:

```ts
import { test, expect } from '@playwright/test';

test('my test', async ({ page }, testInfo) => {
  if (testInfo.retry) {
    await cleanSomeCachesOnTheServer(); // only runs on retry attempts
  }
  // ...
});
```

> `testInfo.retry` is `0` on the first run, `1` on the first retry, `2` on the second, etc.

---

## Serial Mode

Use `mode: 'serial'` when tests are **dependent on each other** — they must run in order and together.

```ts
test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  /* ... */
});
test('first good', async ({ page }) => {
  /* ... */
});
test('second flaky', async ({ page }) => {
  /* ... */
});
test('third good', async ({ page }) => {
  /* ... */
});
```

### Without retries — skips on failure

```text
Worker #1:
  ✅ first good
  ❌ second flaky → FAILS
  ⏭️ third good → SKIPPED
```

### With retries — all tests retry together

```text
Worker #1:
  ✅ first good
  ❌ second flaky → fails

Worker #2:
  ✅ first good (again)
  ✅ second flaky (retried)
  ✅ third good
```

> **Tip:** Prefer isolated, independent tests when possible. Serial mode is the exception, not the rule.

---

## Reusing a Single Page Across Tests

If you need to share a `Page` object across multiple tests (e.g. to preserve state), create it in `beforeAll` and close it in `afterAll`. Requires `mode: 'serial'`.

```ts
import { test, type Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

let page: Page;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
});

test.afterAll(async () => {
  await page.close();
});

test('runs first', async () => {
  await page.goto('https://playwright.dev/');
});

test('runs second', async () => {
  await page.getByText('Get Started').click();
});
```

---

## 🗂️ Quick Reference

| What                      | How                                           |
| ------------------------- | --------------------------------------------- |
| Enable retries globally   | `retries: 3` in `playwright.config.ts`        |
| Enable retries via CLI    | `--retries=3`                                 |
| Scope retries to a group  | `test.describe.configure({ retries: 2 })`     |
| Detect if this is a retry | `testInfo.retry`                              |
| Group dependent tests     | `test.describe.configure({ mode: 'serial' })` |
| Share page across tests   | Create in `beforeAll`, close in `afterAll`    |
