# ⏱️ Playwright — Timeouts

> **Source:** [playwright.dev/docs/test-timeouts](https://playwright.dev/docs/test-timeouts)

---

## ⏱️ Timeouts

Playwright Test has multiple configurable timeouts for various tasks.

| Timeout        | Default   | Description                                                                                                                                        |
| -------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Test timeout   | 30,000 ms | Timeout for each test. Set in config: `{ timeout: 60_000 }`. Override in test: `test.setTimeout(120_000)`                                          |
| Expect timeout | 5,000 ms  | Timeout for each assertion. Set in config: `{ expect: { timeout: 10_000 } }`. Override in test: `expect(locator).toBeVisible({ timeout: 10_000 })` |

---

## ⏰ Test timeout

Playwright Test enforces a timeout for each test, 30 seconds by default. Time spent by the test function, fixture setups, and `beforeEach` hooks is included in the test timeout. Timed out test produces the following error:

```
example.spec.ts:3:1 › basic test ===========================
Timeout of 30000ms exceeded.
```

Additional separate timeout, of the same value, is shared between fixture teardowns and `afterEach` hooks, after the test function has finished. The same timeout value also applies to `beforeAll` and `afterAll` hooks, but they do not share time with any test.

### Set test timeout in the config

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 120_000,
});
```

API reference: `testConfig.timeout`.

### Set timeout for a single test

```ts
import { test, expect } from '@playwright/test';

test('slow test', async ({ page }) => {
  test.slow(); // Easy way to triple the default timeout
  // ...
});

test('very slow test', async ({ page }) => {
  test.setTimeout(120_000);
  // ...
});
```

API reference: `test.setTimeout()` and `test.slow()`.

### Change timeout from a beforeEach hook

```ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }, testInfo) => {
  // Extend timeout for all tests running this hook by 30 seconds.
  testInfo.setTimeout(testInfo.timeout + 30_000);
});
```

API reference: `testInfo.setTimeout()`.

### Change timeout for beforeAll/afterAll hook

`beforeAll` and `afterAll` hooks have a separate timeout, by default equal to test timeout. You can change it separately for each hook by calling `testInfo.setTimeout()` inside the hook.

```ts
import { test, expect } from '@playwright/test';

test.beforeAll(async () => {
  // Set timeout for this hook.
  test.setTimeout(60000);
});
```

API reference: `testInfo.setTimeout()`.

---

## ✅ Expect timeout

Auto-retrying assertions like `expect(locator).toHaveText()` have a separate timeout, 5 seconds by default. Assertion timeout is unrelated to the test timeout. It produces the following error:

```
example.spec.ts:3:1 › basic test ===========================
Error: expect(received).toHaveText(expected)

Expected string: "my text"
Received string: ""

Call log:
  - expect.toHaveText with timeout 5000ms
  - waiting for "locator('button')"
```

### Set expect timeout in the config

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
});
```

API reference: `testConfig.expect`.

### Specify expect timeout for a single assertion

```ts
import { test, expect } from '@playwright/test';

test('example', async ({ page }) => {
  await expect(locator).toHaveText('hello', { timeout: 10_000 });
});
```

---

## 🌍 Global timeout

Playwright Test supports a timeout for the whole test run. This prevents excess resource usage when everything went wrong. There is no default global timeout, but you can set a reasonable one in the config, for example one hour.

```
Running 1000 tests using 10 workers

  514 skipped
  486 passed
  Timed out waiting 3600s for the entire test run
```

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  globalTimeout: 3_600_000,
});
```

API reference: `testConfig.globalTimeout`.

---

## 🔬 Advanced: low level timeouts

These are the low-level timeouts that are pre-configured by the test runner, you should not need to change these.

| Timeout                    | Default    | Description                                                                                                                                          |
| -------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Action timeout             | no timeout | Timeout for each action. Set in config: `{ use: { actionTimeout: 10_000 } }`. Override in test: `locator.click({ timeout: 10_000 })`                 |
| Navigation timeout         | no timeout | Timeout for each navigation action. Set in config: `{ use: { navigationTimeout: 30_000 } }`. Override in test: `page.goto('/', { timeout: 30_000 })` |
| Global timeout             | no timeout | Global timeout for the whole test run. Set in config: `{ globalTimeout: 3_600_000 }`                                                                 |
| beforeAll/afterAll timeout | 30,000 ms  | Timeout for the hook. Set in hook: `test.setTimeout(60_000)`                                                                                         |
| Fixture timeout            | no timeout | Timeout for an individual fixture. Set in fixture: `{ scope: 'test', timeout: 30_000 }`                                                              |

### Set action and navigation timeouts in the config

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    actionTimeout: 10 * 1000,
    navigationTimeout: 30 * 1000,
  },
});
```

API reference: `testOptions.actionTimeout` and `testOptions.navigationTimeout`.

### Set timeout for a single action

```ts
import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('https://playwright.dev', { timeout: 30000 });
  await page.getByText('Get Started').click({ timeout: 10000 });
});
```

---

## 🔧 Fixture timeout

By default, fixture shares timeout with the test. However, for slow fixtures, especially worker-scoped ones, it is convenient to have a separate timeout. This way you can keep the overall test timeout small, and give the slow fixture more time.

```ts
import { test as base, expect } from '@playwright/test';

const test = base.extend<{ slowFixture: string }>({
  slowFixture: [
    async ({}, use) => {
      // ... perform a slow operation ...
      await use('hello');
    },
    { timeout: 60_000 },
  ],
});

test('example test', async ({ slowFixture }) => {
  // ...
});
```

API reference: `test.extend()`.

---

## 🗂️ Quick Reference

| Timeout          | Where to set                                   | Default   |
| ---------------- | ---------------------------------------------- | --------- |
| Test             | `defineConfig({ timeout })`                    | 30,000 ms |
| Single test      | `test.setTimeout(ms)` or `test.slow()`         | —         |
| Expect           | `defineConfig({ expect: { timeout } })`        | 5,000 ms  |
| Single assertion | `expect(x).toBe(y, { timeout: ms })`           | —         |
| Global           | `defineConfig({ globalTimeout })`              | none      |
| Action           | `defineConfig({ use: { actionTimeout } })`     | none      |
| Navigation       | `defineConfig({ use: { navigationTimeout } })` | none      |
| Fixture          | `[fn, { timeout: ms }]` in fixture             | none      |
