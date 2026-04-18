# 🔧 Playwright — Fixtures

> **Source:** [playwright.dev/docs/test-fixtures](https://playwright.dev/docs/test-fixtures)

---

## Introduction

Playwright Test is based on the concept of **test fixtures**. Test fixtures are used to establish the environment for each test, giving the test everything it needs and nothing else. Test fixtures are isolated between tests. With fixtures, you can group tests based on their meaning, instead of their common setup.

---

## Built-in fixtures

You have already used test fixtures in your first test.

```ts
import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/Playwright/);
});
```

The `{ page }` argument tells Playwright Test to set up the `page` fixture and provide it to your test function. Here is a list of the pre-defined fixtures that you are likely to use most of the time:

| Fixture       | Type                | Description                                                                                   |
| ------------- | ------------------- | --------------------------------------------------------------------------------------------- |
| `page`        | `Page`              | Isolated page for this test run.                                                              |
| `context`     | `BrowserContext`    | Isolated context for this test run. The `page` fixture belongs to this context as well.       |
| `browser`     | `Browser`           | Browsers are shared across tests to optimize resources.                                       |
| `browserName` | `string`            | The name of the browser currently running the test. Either `chromium`, `firefox` or `webkit`. |
| `request`     | `APIRequestContext` | Isolated `APIRequestContext` instance for this test run.                                      |

---

## Without fixtures

Here is how a typical test environment setup differs between the traditional test style and the fixture-based one. `TodoPage` is a class that helps us interact with a "todo list" page of the web app, following the Page Object Model pattern.

```ts
// todo-page.ts
import type { Page, Locator } from '@playwright/test';

export class TodoPage {
  private readonly inputBox: Locator;
  private readonly todoItems: Locator;

  constructor(public readonly page: Page) {
    this.inputBox = this.page.locator('input.new-todo');
    this.todoItems = this.page.getByTestId('todo-item');
  }

  async goto() {
    await this.page.goto('https://demo.playwright.dev/todomvc/');
  }

  async addToDo(text: string) {
    await this.inputBox.fill(text);
    await this.inputBox.press('Enter');
  }

  async remove(text: string) {
    const todo = this.todoItems.filter({ hasText: text });
    await todo.hover();
    await todo.getByLabel('Delete').click();
  }

  async removeAll() {
    while ((await this.todoItems.count()) > 0) {
      await this.todoItems.first().hover();
      await this.todoItems.getByLabel('Delete').first().click();
    }
  }
}
```

```ts
// todo.spec.ts
const { test } = require('@playwright/test');
const { TodoPage } = require('./todo-page');

test.describe('todo tests', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.addToDo('item1');
    await todoPage.addToDo('item2');
  });

  test.afterEach(async () => {
    await todoPage.removeAll();
  });

  test('should add an item', async () => {
    await todoPage.addToDo('my item');
    // ...
  });

  test('should remove an item', async () => {
    await todoPage.remove('item1');
    // ...
  });
});
```

---

## With fixtures

Fixtures have a number of advantages over before/after hooks:

- Fixtures encapsulate setup and teardown in the same place so it is easier to write.
- Fixtures are reusable between test files — you can define them once and use them in all your tests.
- Fixtures are on-demand — you can define as many fixtures as you'd like, and Playwright Test will setup only the ones needed by your test and nothing else.
- Fixtures are composable — they can depend on each other to provide complex behaviors.
- Fixtures are flexible. Tests can use any combination of fixtures to precisely tailor the environment to their needs, without affecting other tests.
- Fixtures simplify grouping. You no longer need to wrap tests in describes that set up their environment, and are free to group your tests by their meaning instead.

```ts
// example.spec.ts
import { test as base } from '@playwright/test';
import { TodoPage } from './todo-page';

// Extend basic test by providing a "todoPage" fixture.
const test = base.extend<{ todoPage: TodoPage }>({
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.addToDo('item1');
    await todoPage.addToDo('item2');
    await use(todoPage);
    await todoPage.removeAll();
  },
});

test('should add an item', async ({ todoPage }) => {
  await todoPage.addToDo('my item');
  // ...
});

test('should remove an item', async ({ todoPage }) => {
  await todoPage.remove('item1');
  // ...
});
```

---

## Creating a fixture

To create your own fixture, use `test.extend()` to create a new test object that will include it. Below we create two fixtures `todoPage` and `settingsPage` that follow the Page Object Model pattern.

```ts
// my-test.ts
import { test as base } from '@playwright/test';
import { TodoPage } from './todo-page';
import { SettingsPage } from './settings-page';

// Declare the types of your fixtures.
type MyFixtures = {
  todoPage: TodoPage;
  settingsPage: SettingsPage;
};

// Extend base test by providing "todoPage" and "settingsPage".
// This new "test" can be used in multiple test files, and each of them will get the fixtures.
export const test = base.extend<MyFixtures>({
  todoPage: async ({ page }, use) => {
    // Set up the fixture.
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.addToDo('item1');
    await todoPage.addToDo('item2');
    // Use the fixture value in the test.
    await use(todoPage);
    // Clean up the fixture.
    await todoPage.removeAll();
  },
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },
});

export { expect } from '@playwright/test';
```

> Custom fixture names should start with a letter or underscore, and can contain only letters, numbers, and underscores.

---

## Using a fixture

Just mention a fixture in your test function argument, and the test runner will take care of it. Fixtures are also available in hooks and other fixtures. If you use TypeScript, fixtures will be type safe.

```ts
import { test, expect } from './my-test';

test.beforeEach(async ({ settingsPage }) => {
  await settingsPage.switchToDarkMode();
});

test('basic test', async ({ todoPage, page }) => {
  await todoPage.addToDo('something nice');
  await expect(page.getByTestId('todo-title')).toContainText(['something nice']);
});
```

---

## Overriding fixtures

In addition to creating your own fixtures, you can also override existing fixtures to fit your needs. Consider the following example which overrides the `page` fixture by automatically navigating to the `baseURL`:

```ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ baseURL, page }, use) => {
    await page.goto(baseURL);
    await use(page);
  },
});
```

Notice that in this example, the `page` fixture is able to depend on other built-in fixtures such as `testOptions.baseURL`. We can now configure `baseURL` in the configuration file, or locally in the test file with `test.use()`.

```ts
// example.spec.ts
test.use({ baseURL: 'https://playwright.dev' });
```

Fixtures can also be overridden, causing the base fixture to be completely replaced with something different. For example, we could override the `testOptions.storageState` fixture to provide our own data.

```ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  storageState: async ({}, use) => {
    const cookie = await getAuthCookie();
    await use({ cookies: [cookie] });
  },
});
```

---

## Worker-scoped fixtures

Playwright Test uses worker processes to run test files. Similar to how test fixtures are set up for individual test runs, worker fixtures are set up for each worker process. That's where you can set up services, run servers, etc.

Below we'll create an `account` fixture that will be shared by all tests in the same worker, and override the `page` fixture to log in to this account for each test. Note the tuple-like syntax for the worker fixture — we have to pass `{scope: 'worker'}` so that test runner sets this fixture up once per worker.

```ts
// my-test.ts
import { test as base } from '@playwright/test';

type Account = {
  username: string;
  password: string;
};

// Note that we pass worker fixture types as a second template parameter.
export const test = base.extend<{}, { account: Account }>({
  account: [
    async ({ browser }, use, workerInfo) => {
      // Unique username.
      const username = 'user' + workerInfo.workerIndex;
      const password = 'verysecure';
      // Create the account with Playwright.
      const page = await browser.newPage();
      await page.goto('/signup');
      await page.getByLabel('User Name').fill(username);
      await page.getByLabel('Password').fill(password);
      await page.getByText('Sign up').click();
      // Make sure everything is ok.
      await expect(page.getByTestId('result')).toHaveText('Success');
      // Do not forget to cleanup.
      await page.close();
      // Use the account value.
      await use({ username, password });
    },
    { scope: 'worker' },
  ],

  page: async ({ page, account }, use) => {
    // Sign in with our account.
    const { username, password } = account;
    await page.goto('/signin');
    await page.getByLabel('User Name').fill(username);
    await page.getByLabel('Password').fill(password);
    await page.getByText('Sign in').click();
    await expect(page.getByTestId('userinfo')).toHaveText(username);
    // Use signed-in page in the test.
    await use(page);
  },
});

export { expect } from '@playwright/test';
```

---

## Automatic fixtures

Automatic fixtures are set up for each test/worker, even when the test does not list them directly. To create an automatic fixture, use the tuple syntax and pass `{ auto: true }`.

Here is an example fixture that automatically attaches debug logs when the test fails:

```ts
// my-test.ts
import debug from 'debug';
import fs from 'fs';
import { test as base } from '@playwright/test';

export const test = base.extend<{ saveLogs: void }>({
  saveLogs: [
    async ({}, use, testInfo) => {
      // Collecting logs during the test.
      const logs = [];
      debug.log = (...args) => logs.push(args.map(String).join(''));
      debug.enable('myserver');

      await use();

      // After the test we can check whether the test passed or failed.
      if (testInfo.status !== testInfo.expectedStatus) {
        // outputPath() API guarantees a unique file name.
        const logFile = testInfo.outputPath('logs.txt');
        await fs.promises.writeFile(logFile, logs.join('\n'), 'utf8');
        testInfo.attachments.push({ name: 'logs', contentType: 'text/plain', path: logFile });
      }
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
```

---

## Fixture timeout

Fixture is considered to be a part of a test, and so its setup and teardown running time counts towards the test timeout. You can set a separate larger timeout for such a fixture, and keep the overall test timeout small.

```ts
import { test as base, expect } from '@playwright/test';

const test = base.extend<{ slowFixture: string }>({
  slowFixture: [
    async ({}, use) => {
      // ... perform a slow operation ...
      await use('hello');
    },
    { timeout: 60000 },
  ],
});

test('example test', async ({ slowFixture }) => {
  // ...
});
```

---

## Fixtures-options

Playwright Test supports running multiple test projects that can be configured separately. You can use "option" fixtures to make your configuration options declarative and type safe. Learn more about parameterizing tests.

```ts
// my-test.ts
import { test as base } from '@playwright/test';
import { TodoPage } from './todo-page';

// Declare your options to type-check your configuration.
export type MyOptions = {
  defaultItem: string;
};

type MyFixtures = {
  todoPage: TodoPage;
};

// Specify both option and fixture types.
export const test = base.extend<MyOptions & MyFixtures>({
  // Define an option and provide a default value.
  // We can later override it in the config.
  defaultItem: ['Something nice', { option: true }],

  // Our "todoPage" fixture depends on the option.
  todoPage: async ({ page, defaultItem }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.addToDo(defaultItem);
    await use(todoPage);
    await todoPage.removeAll();
  },
});

export { expect } from '@playwright/test';
```

We can now use the `todoPage` fixture as usual, and set the `defaultItem` option in the configuration file.

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';
import type { MyOptions } from './my-test';

export default defineConfig<MyOptions>({
  projects: [
    {
      name: 'shopping',
      use: { defaultItem: 'Buy milk' },
    },
    {
      name: 'wellbeing',
      use: { defaultItem: 'Exercise!' },
    },
  ],
});
```

---

## Box fixtures

Usually, custom fixtures are reported as separate steps in the UI mode, Trace Viewer and various test reports. They also appear in error messages from the test runner. For frequently used fixtures, this can mean lots of noise. You can stop the fixtures steps from being shown in the UI by "boxing" it.

```ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  helperFixture: [
    async ({}, use, testInfo) => {
      // ...
    },
    { box: true },
  ],
});
```

You can also mark the fixture as `box: 'self'` to only hide that particular fixture, but include all the steps inside the fixture in the test report.

---

## Custom fixture title

Instead of the usual fixture name, you can give fixtures a custom title that will be shown in test reports and error messages.

```ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  innerFixture: [
    async ({}, use, testInfo) => {
      // ...
    },
    { title: 'my fixture' },
  ],
});
```

---

## Adding global beforeEach/afterEach hooks

`test.beforeEach()` and `test.afterEach()` hooks run before/after each test declared in the same file and same `test.describe()` block. If you want to declare hooks that run before/after each test globally, you can declare them as auto fixtures:

```ts
// fixtures.ts
import { test as base } from '@playwright/test';

export const test = base.extend<{ forEachTest: void }>({
  forEachTest: [
    async ({ page }, use) => {
      // This code runs before every test.
      await page.goto('http://localhost:8000');
      await use();
      // This code runs after every test.
      console.log('Last URL:', page.url());
    },
    { auto: true },
  ], // automatically starts for every test.
});
```

```ts
// mytest.spec.ts
import { test } from './fixtures';
import { expect } from '@playwright/test';

test('basic', async ({ page }) => {
  expect(page).toHaveURL('http://localhost:8000');
  await page.goto('https://playwright.dev');
});
```

---

## Adding global beforeAll/afterAll hooks

`test.beforeAll()` and `test.afterAll()` hooks run before/after all tests declared in the same file and same `test.describe()` block, once per worker process. If you want to declare hooks that run before/after all tests in every file, declare them as auto fixtures with `scope: 'worker'`:

```ts
// fixtures.ts
import { test as base } from '@playwright/test';

export const test = base.extend<{}, { forEachWorker: void }>({
  forEachWorker: [
    async ({}, use) => {
      // This code runs before all the tests in the worker process.
      console.log(`Starting test worker ${test.info().workerIndex}`);
      await use();
      // This code runs after all the tests in the worker process.
      console.log(`Stopping test worker ${test.info().workerIndex}`);
    },
    { scope: 'worker', auto: true },
  ], // automatically starts for every worker.
});
```

```ts
// mytest.spec.ts
import { test } from './fixtures';
import { expect } from '@playwright/test';

test('basic', async ({}) => {
  // ...
});
```

Note that the fixtures will still run once per worker process, but you don't need to redeclare them in every file.

---

## Combine custom fixtures from multiple modules

You can merge test fixtures from multiple files or modules:

```ts
// fixtures.ts
import { mergeTests } from '@playwright/test';
import { test as dbTest } from 'database-test-utils';
import { test as a11yTest } from 'a11y-test-utils';

export const test = mergeTests(dbTest, a11yTest);
```

```ts
// test.spec.ts
import { test } from './fixtures';

test('passes', async ({ database, page, a11y }) => {
  // use database and a11y fixtures.
});
```

---

## 🗂️ Quick Reference

| What                     | How                                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| Create fixture           | `base.extend<{ myFixture: Type }>({ myFixture: async ({ page }, use) => { ... await use(value); } })` |
| Worker-scoped fixture    | `[async ({}, use) => { ... }, { scope: 'worker' }]`                                                   |
| Auto fixture             | `[async ({}, use) => { ... }, { auto: true }]`                                                        |
| Option fixture           | `[defaultValue, { option: true }]`                                                                    |
| Fixture timeout          | `[async ({}, use) => { ... }, { timeout: 60000 }]`                                                    |
| Box fixture (hide in UI) | `[async ({}, use) => { ... }, { box: true }]`                                                         |
| Merge fixtures           | `mergeTests(testA, testB)`                                                                            |
