# 📂 Playwright — Projects

> **Source:** [playwright.dev/docs/test-projects](https://playwright.dev/docs/test-projects)

---

## 📖 Introduction

A **project** is a logical group of tests running with the same configuration. We use projects so we can run tests on different browsers and devices. Projects are configured in the `playwright.config.ts` file and once configured you can then run your tests on all projects or only on a specific project. You can also use projects to run the same tests in different configurations. For example, you can run the same tests in a logged-in and logged-out state. By setting up projects you can also run a group of tests with different timeouts or retries or a group of tests against different environments such as staging and production, splitting tests per package/functionality and more.

---

## 🌐 Configure projects for multiple browsers

By using projects you can run your tests in multiple browsers such as chromium, webkit and firefox as well as branded browsers such as Google Chrome and Microsoft Edge. Playwright can also run on emulated tablet and mobile devices. See the registry of device parameters for a complete list of selected desktop, tablet and mobile devices.

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    /* Test against branded browsers. */
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
});
```

---

## ▶️ Run projects

Playwright will run all projects by default.

```bash
npx playwright test
Running 7 tests using 5 workers

  ✓ [chromium] › example.spec.ts:3:1 › basic test (2s)
  ✓ [firefox] › example.spec.ts:3:1 › basic test (2s)
  ✓ [webkit] › example.spec.ts:3:1 › basic test (2s)
  ✓ [Mobile Chrome] › example.spec.ts:3:1 › basic test (2s)
  ✓ [Mobile Safari] › example.spec.ts:3:1 › basic test (2s)
  ✓ [Microsoft Edge] › example.spec.ts:3:1 › basic test (2s)
  ✓ [Google Chrome] › example.spec.ts:3:1 › basic test (2s)
```

Use the `--project` command line option to run a single project.

```bash
npx playwright test --project=firefox
Running 1 test using 1 worker

  ✓ [firefox] › example.spec.ts:3:1 › basic test (2s)
```

The VS Code test runner runs your tests on the default browser of Chrome. To run on other/multiple browsers click the play button's dropdown from the testing sidebar and choose another profile or modify the default profile by clicking **Select Default Profile** and select the browsers you wish to run your tests on.

---

## 🌍 Configure projects for multiple environments

By setting up projects we can also run a group of tests with different timeouts or retries or run a group of tests against different environments. For example we can run our tests against a staging environment with 2 retries as well as against a production environment with 0 retries.

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 60000, // Timeout is shared between all tests.
  projects: [
    {
      name: 'staging',
      use: {
        baseURL: 'staging.example.com',
      },
      retries: 2,
    },
    {
      name: 'production',
      use: {
        baseURL: 'production.example.com',
      },
      retries: 0,
    },
  ],
});
```

---

## ✂️ Splitting tests into projects

We can split tests into projects and use filters to run a subset of tests. For example, we can create a project that runs tests using a filter matching all tests with a specific file name. We can then have another group of tests that ignore specific test files.

Here is an example that defines a common timeout and two projects. The "Smoke" project runs a small subset of tests without retries, and "Default" project runs all other tests with retries.

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 60000, // Timeout is shared between all tests.
  projects: [
    {
      name: 'Smoke',
      testMatch: /.*smoke.spec.ts/,
      retries: 0,
    },
    {
      name: 'Default',
      testIgnore: /.*smoke.spec.ts/,
      retries: 2,
    },
  ],
});
```

---

## 🔗 Dependencies

Dependencies are a list of projects that need to run before the tests in another project run. They can be useful for configuring the global setup actions so that one project depends on this running first. When using project dependencies, test reporters will show the setup tests and the trace viewer will record traces of the setup. You can use the inspector to inspect the DOM snapshot of the trace of your setup tests and you can also use fixtures inside your setup.

In this example the chromium, firefox and webkit projects depend on the setup project.

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'setup',
      testMatch: '**/*.setup.ts',
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },
  ],
});
```

### Running Sequence

When working with tests that have a dependency, the dependency will always run first and once all tests from this project have passed, then the other projects will run in parallel.

```
Running order:
1. Tests in the 'setup' project run.
2. Once all tests from this project have passed, then the tests
   from the dependent projects will start running.
3. Tests in the 'chromium', 'webkit' and 'firefox' projects run together.
```

By default, these projects will run in parallel, subject to the maximum workers limit. If there are more than one dependency then these project dependencies will be run first and in parallel. If the tests from a dependency fails then the tests that rely on this project will not be run.

---

## 🧹 Teardown

You can also teardown your setup by adding a `testProject.teardown` property to your setup project. Teardown will run after all dependent projects have run. See the teardown guide for more information.

---

## 🔽 Test filtering

All test filtering options, such as `--grep`/`--grep-invert`, `--shard`, filtering directly by location in the command line, or using `test.only()`, directly select the primary tests to be run. If those tests belong to a project with dependencies, all tests from those dependencies will also run.

You can pass `--no-deps` command line option to ignore all dependencies and teardowns. Only your directly selected projects will run.

---

## 🔧 Custom project parameters

Projects can be also used to parametrize tests with your custom configuration — take a look at the separate parameterize guide.

---

## 🗂️ Quick Reference

| What                     | How                                      |
| ------------------------ | ---------------------------------------- |
| Run all projects         | `npx playwright test`                    |
| Run one project          | `npx playwright test --project=chromium` |
| Run without dependencies | `npx playwright test --no-deps`          |
| Setup project            | `testMatch: /global\.setup\.ts/`         |
| Link dependency          | `dependencies: ['setup']`                |
| Teardown                 | `teardown: 'cleanup'` in setup project   |
