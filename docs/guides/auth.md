# 🔐 Playwright — Authentication

> **Source:** [playwright.dev/docs/auth](https://playwright.dev/docs/auth)

---

## Introduction

Playwright executes tests in isolated environments called **browser contexts**. This isolation model improves reproducibility and prevents cascading test failures. Tests can load existing authenticated state. This eliminates the need to authenticate in every test and speeds up test execution.

## Core Concepts

Regardless of the authentication strategy you choose, you are likely to store authenticated browser state on the file system.

We recommend to create `playwright/.auth` directory and add it to your `.gitignore`:

```bash
# Bash
mkdir -p playwright/.auth
echo $'\nplaywright/.auth' >> .gitignore
```

```powershell
# PowerShell
New-Item -ItemType Directory -Force -Path playwright\.auth
Add-Content -path .gitignore "`r`nplaywright/.auth"
```

```batch
# Batch
md playwright\.auth
echo. >> .gitignore
echo "playwright/.auth" >> .gitignore
```

Your authentication routine will produce authenticated browser state and save it to a file in this `playwright/.auth` directory. Later on, tests will reuse this state and start already authenticated.

> **⚠️ Security Warning**
>
> The browser state file may contain sensitive cookies and headers that could be used to impersonate you or your test account. We strongly discourage checking them into private or public repositories.

## Basic: Shared Account in All Tests

This is the **recommended approach for tests without server-side state**. Authenticate once in the setup project, save the authentication state, and then reuse it to bootstrap each test already authenticated.

### When to Use

- When you can imagine all your tests running at the same time with the same account, without affecting each other

### When NOT to Use

- Your tests modify server-side state. For example, one test checks the rendering of the settings page, while the other test is changing the setting, and you run tests in parallel. In this case, tests must use different accounts
- Your authentication is browser-specific

### Implementation

#### Step 1: Create `tests/auth.setup.ts`

This file will prepare authenticated browser state for all other tests:

```ts
// tests/auth.setup.ts
import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto('https://github.com/login');
  await page.getByLabel('Username or email address').fill('username');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Wait until the page receives the cookies.
  //
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL('https://github.com/');

  // Alternatively, you can wait until the page reaches a state where all cookies are set.
  await expect(page.getByRole('button', { name: 'View profile and more' })).toBeVisible();

  // End of authentication steps.
  await page.context().storageState({ path: authFile });
});
```

#### Step 2: Configure the Setup Project

Create a new setup project in the config and declare it as a dependency for all your testing projects:

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    // Setup project
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use prepared auth state.
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        // Use prepared auth state.
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
```

This project will always run and authenticate before all the tests. All testing projects should use the authenticated state as `storageState`.

#### Step 3: Write Your Tests

Tests start already authenticated because we specified `storageState` in the config:

```ts
// tests/example.spec.ts
import { test } from '@playwright/test';

test('test', async ({ page }) => {
  // page is authenticated
});
```

> **Note**: You need to delete the stored state when it expires. If you don't need to keep the state between test runs, write the browser state under `testProject.outputDir`, which is automatically cleaned up before every test run.

### Authenticating in UI Mode

UI mode will not run the setup project by default to improve testing speed. We recommend to authenticate by manually running the `auth.setup.ts` from time to time, whenever existing authentication expires.

First enable the setup project in the filters, then click the triangle button next to `auth.setup.ts` file, and then disable the setup project in the filters again.

## Moderate: One Account Per Parallel Worker

This is the **recommended approach for tests that modify server-side state**. In Playwright, worker processes run in parallel. In this approach, each parallel worker is authenticated once. All tests ran by worker are reusing the same authentication state. We will need multiple testing accounts, one per each parallel worker.

### When to Use

- Your tests modify shared server-side state. For example, one test checks the rendering of the settings page, while the other test is changing the setting

### When NOT to Use

- Your tests do not modify any shared server-side state. In this case, all tests can use a single shared account

### Implementation

We will authenticate once per worker process, each with a unique account.

#### Create `playwright/fixtures.ts`

This file will override `storageState` fixture to authenticate once per worker. Use `testInfo.parallelIndex` to differentiate between workers:

```ts
// playwright/fixtures.ts
import { test as baseTest, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export * from '@playwright/test';

export const test = baseTest.extend<{}, { workerStorageState: string }>({
  // Use the same storage state for all tests in this worker.
  storageState: ({ workerStorageState }, use) => use(workerStorageState),

  // Authenticate once per worker with a worker-scoped fixture.
  workerStorageState: [
    async ({ browser }, use) => {
      // Use parallelIndex as a unique identifier for each worker.
      const id = test.info().parallelIndex;
      const fileName = path.resolve(test.info().project.outputDir, `.auth/${id}.json`);

      if (fs.existsSync(fileName)) {
        // Reuse existing authentication state if any.
        await use(fileName);
        return;
      }

      // Important: make sure we authenticate in a clean environment by unsetting storage state.
      const page = await browser.newPage({ storageState: undefined });

      // Acquire a unique account, for example create a new one.
      // Alternatively, you can have a list of precreated accounts for testing.
      // Make sure that accounts are unique, so that multiple team members
      // can run tests at the same time without interference.
      const account = await acquireAccount(id);

      // Perform authentication steps. Replace these actions with your own.
      await page.goto('https://github.com/login');
      await page.getByLabel('Username or email address').fill(account.username);
      await page.getByLabel('Password').fill(account.password);
      await page.getByRole('button', { name: 'Sign in' }).click();

      // Wait until the page receives the cookies.
      //
      // Sometimes login flow sets cookies in the process of several redirects.
      // Wait for the final URL to ensure that the cookies are actually set.
      await page.waitForURL('https://github.com/');

      // Alternatively, you can wait until the page reaches a state where all cookies are set.
      await expect(page.getByRole('button', { name: 'View profile and more' })).toBeVisible();

      // End of authentication steps.
      await page.context().storageState({ path: fileName });
      await page.close();
      await use(fileName);
    },
    { scope: 'worker' },
  ],
});
```

#### Use Custom Fixtures in Tests

Each test file should import `test` from our fixtures file instead of `@playwright/test`. No changes are needed in the config:

```ts
// tests/example.spec.ts
// Important: import our fixtures.
import { test, expect } from '../playwright/fixtures';

test('test', async ({ page }) => {
  // page is authenticated
});
```

## Advanced Scenarios

### Authenticate with API Request

#### When to Use

- Your web application supports authenticating via API that is easier/faster than interacting with the app UI

#### Implementation

We will send the API request with `APIRequestContext` and then save authenticated state as usual.

**In the setup project:**

```ts
// tests/auth.setup.ts
import { test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ request }) => {
  // Send authentication request. Replace with your own.
  await request.post('https://github.com/login', {
    form: {
      user: 'user',
      password: 'password',
    },
  });
  await request.storageState({ path: authFile });
});
```

**Alternatively, in a worker fixture:**

```ts
// playwright/fixtures.ts
import { test as baseTest, request } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export * from '@playwright/test';

export const test = baseTest.extend<{}, { workerStorageState: string }>({
  // Use the same storage state for all tests in this worker.
  storageState: ({ workerStorageState }, use) => use(workerStorageState),

  // Authenticate once per worker with a worker-scoped fixture.
  workerStorageState: [
    async ({}, use) => {
      // Use parallelIndex as a unique identifier for each worker.
      const id = test.info().parallelIndex;
      const fileName = path.resolve(test.info().project.outputDir, `.auth/${id}.json`);

      if (fs.existsSync(fileName)) {
        // Reuse existing authentication state if any.
        await use(fileName);
        return;
      }

      // Important: make sure we authenticate in a clean environment by unsetting storage state.
      const context = await request.newContext({ storageState: undefined });

      // Acquire a unique account, for example create a new one.
      // Alternatively, you can have a list of precreated accounts for testing.
      // Make sure that accounts are unique, so that multiple team members
      // can run tests at the same time without interference.
      const account = await acquireAccount(id);

      // Send authentication request. Replace with your own.
      await context.post('https://github.com/login', {
        form: {
          user: 'user',
          password: 'password',
        },
      });

      await context.storageState({ path: fileName });
      await context.dispose();
      await use(fileName);
    },
    { scope: 'worker' },
  ],
});
```

### Multiple Signed-in Roles

#### When to Use

- You have more than one role in your end to end tests, but you can reuse accounts across all tests

#### Implementation

We will authenticate multiple times in the setup project:

```ts
// tests/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

const adminFile = 'playwright/.auth/admin.json';

setup('authenticate as admin', async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto('https://github.com/login');
  await page.getByLabel('Username or email address').fill('admin');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Wait until the page receives the cookies.
  //
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL('https://github.com/');

  // Alternatively, you can wait until the page reaches a state where all cookies are set.
  await expect(page.getByRole('button', { name: 'View profile and more' })).toBeVisible();

  // End of authentication steps.
  await page.context().storageState({ path: adminFile });
});

const userFile = 'playwright/.auth/user.json';

setup('authenticate as user', async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto('https://github.com/login');
  await page.getByLabel('Username or email address').fill('user');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Wait until the page receives the cookies.
  //
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL('https://github.com/');

  // Alternatively, you can wait until the page reaches a state where all cookies are set.
  await expect(page.getByRole('button', { name: 'View profile and more' })).toBeVisible();

  // End of authentication steps.
  await page.context().storageState({ path: userFile });
});
```

After that, specify `storageState` for each test file or test group, instead of setting it in the config:

```ts
// tests/example.spec.ts
import { test } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/admin.json' });

test('admin test', async ({ page }) => {
  // page is authenticated as admin
});

test.describe(() => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('user test', async ({ page }) => {
    // page is authenticated as a user
  });
});
```

See also about authenticating in the UI mode.

### Testing Multiple Roles Together

#### When to Use

- You need to test how multiple authenticated roles interact together, in a single test

#### Implementation

Use multiple `BrowserContext`s and `Page`s with different storage states in the same test:

```ts
// tests/example.spec.ts
import { test } from '@playwright/test';

test('admin and user', async ({ browser }) => {
  // adminContext and all pages inside, including adminPage, are signed in as "admin".
  const adminContext = await browser.newContext({
    storageState: 'playwright/.auth/admin.json',
  });
  const adminPage = await adminContext.newPage();

  // userContext and all pages inside, including userPage, are signed in as "user".
  const userContext = await browser.newContext({
    storageState: 'playwright/.auth/user.json',
  });
  const userPage = await userContext.newPage();

  // ... interact with both adminPage and userPage ...

  await adminContext.close();
  await userContext.close();
});
```

### Testing Multiple Roles with POM Fixtures

#### When to Use

- You need to test how multiple authenticated roles interact together, in a single test

#### Implementation

You can introduce fixtures that will provide a page authenticated as each role. Below is an example that creates fixtures for two Page Object Models - admin POM and user POM. It assumes `adminStorageState.json` and `userStorageState.json` files were created in the global setup.

```ts
// playwright/fixtures.ts
import { test as base, type Page, type Locator } from '@playwright/test';

// Page Object Model for the "admin" page.
// Here you can add locators and helper methods specific to the admin page.
class AdminPage {
  // Page signed in as "admin".
  page: Page;

  // Example locator pointing to "Welcome, Admin" greeting.
  greeting: Locator;

  constructor(page: Page) {
    this.page = page;
    this.greeting = page.locator('#greeting');
  }
}

// Page Object Model for the "user" page.
// Here you can add locators and helper methods specific to the user page.
class UserPage {
  // Page signed in as "user".
  page: Page;

  // Example locator pointing to "Welcome, User" greeting.
  greeting: Locator;

  constructor(page: Page) {
    this.page = page;
    this.greeting = page.locator('#greeting');
  }
}

// Declare the types of your fixtures.
type MyFixtures = {
  adminPage: AdminPage;
  userPage: UserPage;
};

export * from '@playwright/test';
export const test = base.extend<MyFixtures>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: 'playwright/.auth/admin.json' });
    const adminPage = new AdminPage(await context.newPage());
    await use(adminPage);
    await context.close();
  },

  userPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: 'playwright/.auth/user.json' });
    const userPage = new UserPage(await context.newPage());
    await use(userPage);
    await context.close();
  },
});
```

Use the fixtures in your tests:

```ts
// tests/example.spec.ts
// Import test with our new fixtures.
import { test, expect } from '../playwright/fixtures';

// Use adminPage and userPage fixtures in the test.
test('admin and user', async ({ adminPage, userPage }) => {
  // ... interact with both adminPage and userPage ...
  await expect(adminPage.greeting).toHaveText('Welcome, Admin');
  await expect(userPage.greeting).toHaveText('Welcome, User');
});
```

### Session Storage

Reusing authenticated state covers cookies, local storage and IndexedDB based authentication. Rarely, session storage is used for storing information associated with the signed-in state. Session storage is specific to a particular domain and is not persisted across page loads. Playwright does not provide API to persist session storage, but the following snippet can be used to save/load session storage.

```ts
// Get session storage and store as env variable
const sessionStorage = await page.evaluate(() => JSON.stringify(sessionStorage));
fs.writeFileSync('playwright/.auth/session.json', sessionStorage, 'utf-8');

// Set session storage in a new context
const sessionStorage = JSON.parse(fs.readFileSync('playwright/.auth/session.json', 'utf-8'));
await context.addInitScript((storage) => {
  if (window.location.hostname === 'example.com') {
    for (const [key, value] of Object.entries(storage)) window.sessionStorage.setItem(key, value);
  }
}, sessionStorage);
```

### Avoid Authentication in Some Tests

You can reset storage state in a test file to avoid authentication that was set up for the whole project:

```ts
// not-signed-in.spec.ts
import { test } from '@playwright/test';

// Reset storage state for this file to avoid being authenticated
test.use({ storageState: { cookies: [], origins: [] } });

test('not signed in test', async ({ page }) => {
  // ...
});
```
