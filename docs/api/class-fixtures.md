# 📦 Playwright — Fixtures

> **Source:** [playwright.dev/docs/api/class-fixtures](https://playwright.dev/docs/api/class-fixtures)

---

Playwright Test is based on the concept of the test fixtures. Test fixtures are used to establish environment for each test, giving the test everything it needs and nothing else. Playwright Test looks at each test declaration, analyses the set of fixtures the test needs and prepares those fixtures specifically for the test. Values prepared by the fixtures are merged into a single object that is available to the test, hooks, annotations and other fixtures as a first parameter.

```ts
import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  // ...
});
```

Given the test above, Playwright Test will set up the `page` fixture before running the test, and tear it down after the test has finished.

## Properties

### browser

**Added in:** v1.10

Browser instance is shared between all tests in the same worker — this makes testing efficient. However, each test runs in an isolated `BrowserContext` and gets a fresh environment.

```ts
test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  // ...
});
```

**Type:** `Browser`

### browserName

**Added in:** v1.10

Name of the browser that runs tests. Defaults to `'chromium'`. Useful to annotate tests based on the browser.

```ts
test('skip this test in Firefox', async ({ page, browserName }) => {
  test.skip(browserName === 'firefox', 'Still working on it');
  // ...
});
```

**Type:** `"chromium" | "firefox" | "webkit"`

### context

**Added in:** v1.10

Isolated `BrowserContext` instance, created for each test. Since contexts are isolated between each other, every test gets a fresh environment, even when multiple tests run in a single Browser for maximum efficiency.

```ts
test('example test', async ({ page, context }) => {
  await context.route('**/*external.com/**', (route) => route.abort());
  // ...
});
```

**Type:** `BrowserContext`

### page

**Added in:** v1.10

Isolated `Page` instance, created for each test. Pages are isolated between tests due to context isolation. This is the most common fixture used in a test.

```ts
import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('/signin');
  await page.getByLabel('User Name').fill('user');
  await page.getByLabel('Password').fill('password');
  await page.getByText('Sign in').click();
  // ...
});
```

**Type:** `Page`

### request

**Added in:** v1.10

Isolated `APIRequestContext` instance for each test.

```ts
import { test, expect } from '@playwright/test';

test('basic test', async ({ request }) => {
  await request.post('/signin', {
    data: { username: 'user', password: 'password' },
  });
  // ...
});
```

**Type:** `APIRequestContext`
