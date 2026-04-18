# 📦 Playwright — Test

> **Source:** [playwright.dev/docs/api/class-test](https://playwright.dev/docs/api/class-test)

---

**Playwright Test** provides a `test` function to declare tests and `expect` function to write assertions.

```ts
import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  const name = await page.innerText('.navbar__title');
  expect(name).toBe('Playwright');
});
```

---

## Methods

## Methods

### `test(title, body)` — Added in: v1.10

Declares a test.

```ts
import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  // ...
});
```

**Tags and annotations:**

```ts
import { test, expect } from '@playwright/test';

test(
  'basic test',
  {
    tag: '@smoke',
    annotation: { type: 'issue', description: 'https://github.com/microsoft/playwright/issues/23180' },
  },
  async ({ page }) => {
    await page.goto('https://playwright.dev/');
    // ...
  }
);
```

**Arguments:**

| Parameter            | Type                                 | Description                                                                                     |
| -------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `title`              | `string`                             | Test title.                                                                                     |
| `details`            | `Object` (optional)                  | Additional test details.                                                                        |
| `details.tag`        | `string \| Array<string>` (optional) | Tag or tags to filter tests by. Tags must start with `@`.                                       |
| `details.annotation` | `Object \| Array<Object>` (optional) | Annotations to add to the test.                                                                 |
| `body`               | `function(fixtures): Promise<void>`  | Test function that takes one or two arguments: an object with fixtures and optional `TestInfo`. |

---

### `test.afterAll(hookFunction)` — Added in: v1.10

Declares an `afterAll` hook that is executed once per worker after all tests. When called in the scope of a test file, runs after all tests in the file. When called inside a `test.describe()` group, runs after all tests in the group.

```ts
test.afterAll(async () => {
  console.log('Done with tests');
  // cleanup logic here
});
```

**With title:**

```ts
test.afterAll('cleanup db', async () => {
  // cleanup logic here
});
```

**Arguments:**

| Parameter      | Type                                | Description                                                                            |
| -------------- | ----------------------------------- | -------------------------------------------------------------------------------------- |
| `title`        | `string` (optional)                 | Hook title for debugging.                                                              |
| `hookFunction` | `function(fixtures): Promise<void>` | Hook function that takes an object with worker-level fixtures and optional `TestInfo`. |

---

### `test.afterEach(hookFunction)` — Added in: v1.10

Declares an `afterEach` hook that is executed after each test. When called in the scope of a test file, runs after each test in the file. When called inside a `test.describe()` group, runs after each test in the group.

```ts
test.afterEach(async ({ page }, testInfo) => {
  console.log(`Finished ${testInfo.title} with status ${testInfo.status}`);
  if (testInfo.status !== testInfo.expectedStatus) console.log(`Did not run as expected, ended up at ${page.url()}`);
});
```

**Arguments:**

| Parameter      | Type                                | Description                                                               |
| -------------- | ----------------------------------- | ------------------------------------------------------------------------- |
| `title`        | `string` (optional)                 | Hook title for debugging.                                                 |
| `hookFunction` | `function(fixtures): Promise<void>` | Hook function that takes an object with fixtures and optional `TestInfo`. |

---

### `test.beforeAll(hookFunction)` — Added in: v1.10

Declares a `beforeAll` hook that is executed once per worker before all tests. When called in the scope of a test file, runs before all tests in the file. When called inside a `test.describe()` group, runs before all tests in the group.

```ts
test.beforeAll(async () => {
  // Start services.
});
```

**With title:**

```ts
test.beforeAll('start server', async () => {
  // Start services.
});
```

**Arguments:**

| Parameter      | Type                                | Description                                                                            |
| -------------- | ----------------------------------- | -------------------------------------------------------------------------------------- |
| `title`        | `string` (optional)                 | Hook title for debugging.                                                              |
| `hookFunction` | `function(fixtures): Promise<void>` | Hook function that takes an object with worker-level fixtures and optional `TestInfo`. |

> **Note:** `test.beforeAll()` is executed in the worker process. You can share data between `beforeAll` hooks and tests via worker-level fixtures (`scope: 'worker'`). Only test-level fixtures (default scope) are available in regular `test()` calls.

---

### `test.beforeEach(hookFunction)` — Added in: v1.10

Declares a `beforeEach` hook that is executed before each test. When called in the scope of a test file, runs before each test in the file. When called inside a `test.describe()` group, runs before each test in the group.

```ts
test.beforeEach(async ({ page }, testInfo) => {
  console.log(`Running ${testInfo.title}`);
  await page.goto('https://my.start.url/');
});
```

**Arguments:**

| Parameter      | Type                                | Description                                                               |
| -------------- | ----------------------------------- | ------------------------------------------------------------------------- |
| `title`        | `string` (optional)                 | Hook title for debugging.                                                 |
| `hookFunction` | `function(fixtures): Promise<void>` | Hook function that takes an object with fixtures and optional `TestInfo`. |

---

### `test.describe(title, callback)` — Added in: v1.10

Declares a group of tests.

```ts
test.describe('two tests', () => {
  test('one', async ({ page }) => {
    // ...
  });
  test('two', async ({ page }) => {
    // ...
  });
});
```

**With tags and annotations:**

```ts
test.describe(
  'two tests',
  {
    tag: '@smoke',
  },
  () => {
    test('one', async ({ page }) => {
      /* ... */
    });
    test('two', async ({ page }) => {
      /* ... */
    });
  }
);
```

**Anonymous describe:**

```ts
test.describe(() => {
  let sharedVariable: string;
  test.beforeAll(async () => {
    sharedVariable = 'shared';
  });
  test('one', async ({ page }) => {
    /* use sharedVariable */
  });
});
```

**Arguments:**

| Parameter            | Type                                 | Description                              |
| -------------------- | ------------------------------------ | ---------------------------------------- |
| `title`              | `string`                             | Group title.                             |
| `details`            | `Object` (optional)                  | Additional group details.                |
| `details.tag`        | `string \| Array<string>` (optional) | Tags for all tests in this group.        |
| `details.annotation` | `Object \| Array<Object>` (optional) | Annotations for all tests in this group. |
| `callback`           | `function`                           | Group body.                              |

---

### `test.describe.configure(options?)` — Added in: v1.10

Configures the enclosing scope. Can be executed either in the global scope or inside `test.describe()`.

```ts
// Set parallel mode for all tests in the file.
test.describe.configure({ mode: 'parallel' });

// Set retries for a group.
test.describe('group', () => {
  test.describe.configure({ retries: 2, timeout: 20_000 });
  test('runs with retries and timeout', async ({ page }) => {
    /* ... */
  });
});
```

**Arguments:**

| Parameter               | Type                                             | Description                                 |
| ----------------------- | ------------------------------------------------ | ------------------------------------------- |
| `options.fullyParallel` | `boolean` (optional)                             | Whether tests in the group run in parallel. |
| `options.mode`          | `"default" \| "parallel" \| "serial"` (optional) | Execution mode for this group.              |
| `options.retries`       | `number` (optional, v1.28)                       | Number of retries for each test.            |
| `options.timeout`       | `number` (optional, v1.28)                       | Timeout in milliseconds for each test.      |

---

### `test.describe.fixme(title, callback)` — Added in: v1.25

Declares a group of tests to be fixed (marked as fixme). Tests inside are not run, but shown in reports as fixme. Behaves similarly to `test.describe()` but marks all tests as fixme.

```ts
test.describe.fixme('broken tests', () => {
  test('one', async ({ page }) => {
    /* won't run */
  });
  test('two', async ({ page }) => {
    /* won't run */
  });
});
```

**Arguments:**

| Parameter  | Type                | Description               |
| ---------- | ------------------- | ------------------------- |
| `title`    | `string`            | Group title.              |
| `details`  | `Object` (optional) | Additional group details. |
| `callback` | `function`          | Group body.               |

---

### `test.describe.only(title, callback)` — Added in: v1.10

Declares a focused group of tests. If there are some focused tests or suites, all of them will be run but nothing else.

```ts
test.describe.only('focused group', () => {
  test('one', async ({ page }) => {
    /* runs */
  });
  test('two', async ({ page }) => {
    /* runs */
  });
});
test('not in the focused group', async ({ page }) => {
  /* won't run */
});
```

**Arguments:**

| Parameter  | Type                | Description               |
| ---------- | ------------------- | ------------------------- |
| `title`    | `string`            | Group title.              |
| `details`  | `Object` (optional) | Additional group details. |
| `callback` | `function`          | Group body.               |

---

### `test.describe.skip(title, callback)` — Added in: v1.10

Declares a skipped group of tests. Tests inside are not run, and shown in the report as skipped.

```ts
test.describe.skip('skipped group', () => {
  test('one', async ({ page }) => {
    /* won't run */
  });
  test('two', async ({ page }) => {
    /* won't run */
  });
});
```

**Arguments:**

| Parameter  | Type                | Description               |
| ---------- | ------------------- | ------------------------- |
| `title`    | `string`            | Group title.              |
| `details`  | `Object` (optional) | Additional group details. |
| `callback` | `function`          | Group body.               |

---

### `test.extend(fixtures)` — Added in: v1.10

Extends the `test` object by defining fixtures and/or options that can be used in the tests.

```ts
import { test as base } from '@playwright/test';

export const test = base.extend<{ admin: AdminPage; userPage: UserPage }>({
  adminPage: async ({ page }, use) => {
    await use(new AdminPage(page));
  },
  userPage: async ({ page }, use) => {
    await use(new UserPage(page));
  },
});
```

**Arguments:**

| Parameter  | Type     | Description                                                                     |
| ---------- | -------- | ------------------------------------------------------------------------------- |
| `fixtures` | `Object` | An object containing fixtures and/or options. Learn more about fixtures format. |

**Returns:** `Test`

---

### `test.fail(title, body)` — Added in: v1.10

Marks a test as failing. Playwright Test runs this test and ensures that it is actually failing. This is useful for documentation purposes to acknowledge that some functionality is broken until it is fixed.

```ts
import { test, expect } from '@playwright/test';

test.fail('not yet ready', async ({ page }) => {
  // ...
});
```

**Runtime variant:**

```ts
test('sometimes fails', async ({ page }, testInfo) => {
  const condition = // some condition
    test.fail(condition, 'This feature is broken on this condition');
  // ...
});
```

**Arguments (declaration form):**

| Parameter | Type                                | Description              |
| --------- | ----------------------------------- | ------------------------ |
| `title`   | `string`                            | Test title.              |
| `details` | `Object` (optional)                 | Additional test details. |
| `body`    | `function(fixtures): Promise<void>` | Test function.           |

**Arguments (runtime form):**

| Parameter     | Type                  | Description                                              |
| ------------- | --------------------- | -------------------------------------------------------- |
| `condition`   | `boolean` (optional)  | Test is marked as failing when condition is `true`.      |
| `callback`    | `function` (optional) | Optional condition function called with test info.       |
| `description` | `string` (optional)   | Optional description explaining why the test is failing. |

---

### `test.fail.only(title, body)` — Added in: v1.49

Marks a test as failing and focuses it. Same as combining `test.fail()` and `test.only()`.

```ts
test.fail.only('focused failing test', async ({ page }) => {
  // expected to fail
});
```

**Arguments:**

| Parameter | Type                                | Description              |
| --------- | ----------------------------------- | ------------------------ |
| `title`   | `string`                            | Test title.              |
| `details` | `Object` (optional)                 | Additional test details. |
| `body`    | `function(fixtures): Promise<void>` | Test function.           |

---

### `test.fixme(title, body)` — Added in: v1.10

Marks a test as fixme, with the intention to fix it. Test is immediately aborted when you call `test.fixme()`. Mark a test as fixme without running it:

```ts
import { test, expect } from '@playwright/test';

test.fixme('test to be fixed', async ({ page }) => {
  // ...
});
```

**Runtime variant — call inside the test to abort immediately:**

```ts
test('sometimes broken', async ({ page }) => {
  const condition = // some condition
    test.fixme(condition, 'This test is broken in this condition');
  // ...
});
```

**Arguments (declaration form):**

| Parameter | Type                                | Description              |
| --------- | ----------------------------------- | ------------------------ |
| `title`   | `string`                            | Test title.              |
| `details` | `Object` (optional)                 | Additional test details. |
| `body`    | `function(fixtures): Promise<void>` | Test function.           |

**Arguments (runtime form):**

| Parameter     | Type                  | Description                                        |
| ------------- | --------------------- | -------------------------------------------------- |
| `condition`   | `boolean` (optional)  | Test is marked as fixme when condition is `true`.  |
| `callback`    | `function` (optional) | Optional condition function called with test info. |
| `description` | `string` (optional)   | Optional description.                              |

---

### `test.info()` — Added in: v1.10

Returns information about the currently running test. This method can only be called during the test execution, otherwise it throws.

```ts
test('example test', async ({ page }) => {
  const info = test.info();
  console.log(info.title);
  console.log(info.status);
});
```

**Returns:** `TestInfo`

---

### `test.only(title, body)` — Added in: v1.10

Declares a focused test. If there are some focused tests or suites, all of them will be run but nothing else.

```ts
test.only('focus this test', async ({ page }) => {
  // Run only focused tests in the entire project.
});
```

**Arguments:**

| Parameter | Type                                | Description              |
| --------- | ----------------------------------- | ------------------------ |
| `title`   | `string`                            | Test title.              |
| `details` | `Object` (optional)                 | Additional test details. |
| `body`    | `function(fixtures): Promise<void>` | Test function.           |

---

### `test.setTimeout(timeout)` — Added in: v1.10

Changes the timeout for the currently running test. Zero means no timeout. Learn more about various timeouts.

```ts
test('very slow test', async ({ page }) => {
  test.setTimeout(120000);
  // ...
});
```

**Changing timeout from a slow `beforeEach` hook:**

```ts
test.beforeEach(async ({ page }, testInfo) => {
  // Extend timeout for all tests running this hook
  testInfo.setTimeout(testInfo.timeout + 30000);
});
```

**Arguments:**

| Parameter | Type     | Description              |
| --------- | -------- | ------------------------ |
| `timeout` | `number` | Timeout in milliseconds. |

---

### `test.skip(title, body)` — Added in: v1.10

Skips a test. Playwright Test will not run the test, but still reports it in the results.

```ts
import { test, expect } from '@playwright/test';

test.skip('skip this test', async ({ page }) => {
  // ...
});
```

**Runtime variant — conditionally skip inside a test:**

```ts
test('conditionally skip', async ({ page }) => {
  const condition = // some condition
    test.skip(condition, 'This feature is not implemented yet');
  // ...
});
```

**Arguments (declaration form):**

| Parameter | Type                                | Description              |
| --------- | ----------------------------------- | ------------------------ |
| `title`   | `string`                            | Test title.              |
| `details` | `Object` (optional)                 | Additional test details. |
| `body`    | `function(fixtures): Promise<void>` | Test function.           |

**Arguments (runtime form):**

| Parameter     | Type                  | Description                                        |
| ------------- | --------------------- | -------------------------------------------------- |
| `condition`   | `boolean` (optional)  | Test is skipped when condition is `true`.          |
| `callback`    | `function` (optional) | Optional condition function called with test info. |
| `description` | `string` (optional)   | Optional description.                              |

---

### `test.slow()` — Added in: v1.10

Marks a test as slow. Slow test will be given triple the default timeout.

```ts
test('slow test', async ({ page }) => {
  test.slow();
  // ...
});
```

**Conditional variant:**

```ts
test('conditionally slow', async ({ page }) => {
  const condition = // some condition
    test.slow(condition, 'This test is slow on this condition');
  // ...
});
```

**Arguments:**

| Parameter     | Type                  | Description                                        |
| ------------- | --------------------- | -------------------------------------------------- |
| `condition`   | `boolean` (optional)  | Test is marked as slow when condition is `true`.   |
| `callback`    | `function` (optional) | Optional condition function called with test info. |
| `description` | `string` (optional)   | Optional description.                              |

---

### `test.step(title, body, options?)` — Added in: v1.10

Declares a test step that is shown in the report.

```ts
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await test.step('Log in', async () => {
    // ...
  });
  await test.step('Purchase item', async () => {
    // ...
  });
});
```

**Returning a value from a step:**

```ts
const user = await test.step('Log in', async () => {
  // ...
  return { username: 'John' };
});
```

**Arguments:**

| Parameter          | Type                         | Description                                                                                                                                           |
| ------------------ | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`            | `string`                     | Step name.                                                                                                                                            |
| `body`             | `function(): Promise<T>`     | Step body.                                                                                                                                            |
| `options.box`      | `boolean` (optional, v1.39)  | Whether to box the step. Errors thrown in a boxed step are not reported inside the step and instead point to the step call site. Defaults to `false`. |
| `options.location` | `Location` (optional, v1.48) | Specifies a custom location for the step to be shown in test reports and error messages.                                                              |
| `options.timeout`  | `number` (optional, v1.50)   | Maximum time in milliseconds for this step. Defaults to 0 (no timeout).                                                                               |

**Returns:** `Promise<T>`

---

### `test.step.skip(title, body, options?)` — Added in: v1.50

Declares a skipped test step. Similar to `test.step()` but the step is always skipped.

```ts
await test.step.skip('not ready yet', async () => {
  // this step won't run
});
```

**Arguments:**

| Parameter          | Type                     | Description                   |
| ------------------ | ------------------------ | ----------------------------- |
| `title`            | `string`                 | Step name.                    |
| `body`             | `function(): Promise<T>` | Step body.                    |
| `options.box`      | `boolean` (optional)     | Whether to box the step.      |
| `options.location` | `Location` (optional)    | Custom location for the step. |
| `options.timeout`  | `number` (optional)      | Maximum time in milliseconds. |

**Returns:** `Promise<T>`

---

### `test.use(options)` — Added in: v1.10

Specifies options or fixtures to use in a single test file or a `test.describe()` group. Most useful to set an option like `locale` for a set of tests.

```ts
import { test, expect } from '@playwright/test';

test.use({ locale: 'en-US' });

test('test with locale', async ({ page }) => {
  // ...
});
```

**Arguments:**

| Parameter | Type     | Description                   |
| --------- | -------- | ----------------------------- |
| `options` | `Object` | An object with local options. |

> **Note:** `test.use()` can only be called in a test file or in a `test.describe()` block. It cannot be called from a fixture or a hook. Use `test.extend()` to configure fixtures.

---

## Properties

### `test.expect` — Added in: v1.10

`expect` function can be used to create test assertions. Read expect guide for more details.

```ts
test('example', async ({ page }) => {
  const locator = page.locator('.some-element');
  await expect(locator).toBeVisible();
});
```

**Type:** `Object`

---

## Deprecated

### `test.describe.parallel(title, callback)` — Added in: v1.10

> **Note:** Please use `test.describe.configure({ mode: 'parallel' })` instead.

Declares a group of tests that could be run in parallel. By default, tests in a single test file run one after another, but using `test.describe.parallel()` allows them to run in parallel.

```ts
test.describe.parallel('group', () => {
  test('runs in parallel 1', async ({ page }) => {
    /* ... */
  });
  test('runs in parallel 2', async ({ page }) => {
    /* ... */
  });
});
```

---

### `test.describe.parallel.only(title, callback)` — Added in: v1.10

> **Note:** Please use `test.describe.configure({ mode: 'parallel' })` instead.

Declares a focused group of tests that could be run in parallel. Same behavior as `test.describe.parallel()` combined with `test.describe.only()`.

```ts
test.describe.parallel.only('focused parallel group', () => {
  test('runs in parallel 1', async ({ page }) => {
    /* ... */
  });
  test('runs in parallel 2', async ({ page }) => {
    /* ... */
  });
});
```

---

### `test.describe.serial(title, callback)` — Added in: v1.10

> **Note:** Please use `test.describe.configure({ mode: 'serial' })` instead.

Declares a group of tests that should always be run serially. If one of the tests fails, all subsequent tests are skipped. All tests in a group are retried together. Useful for tests that cannot be run independently of each other.

```ts
test.describe.serial('group', () => {
  test('runs first', async ({ page }) => {
    /* ... */
  });
  test('runs second', async ({ page }) => {
    /* ... */
  });
});
```

---

### `test.describe.serial.only(title, callback)` — Added in: v1.10

> **Note:** Please use `test.describe.configure({ mode: 'serial' })` instead.

Declares a focused group of tests that should always be run serially. Same behavior as `test.describe.serial()` combined with `test.describe.only()`.

```ts
test.describe.serial.only('focused serial group', () => {
  test('runs first', async ({ page }) => {
    /* ... */
  });
  test('runs second', async ({ page }) => {
    /* ... */
  });
});
```
