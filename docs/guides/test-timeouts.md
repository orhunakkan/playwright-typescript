# ⏱️ Playwright — Test Timeouts

> **Source:** [playwright.dev/docs/test-timeouts](https://playwright.dev/docs/test-timeouts)

---

## TimeoutsPlaywright Test has multiple configurable timeouts for various tasks. TimeoutDefaultDescriptionTest timeout30_000 msTimeout for each testSet in config{ timeout: 60_000 }Override in testtest.setTimeout(120_000)Expect timeout5_000 msTimeout for each assertionSet in config{ expect: { timeout: 10_000 } }Override in testexpect(locator).toBeVisible({ timeout: 10_000 }) Test timeout

Playwright Test enforces a timeout for each test, 30 seconds by default. Time spent by the test function, fixture setups, and beforeEach hooks is included in the test timeout. Timed out test produces the following error: example.spec.ts:3:1 › basic test ===========================Timeout of 30000ms exceeded. Additional separate timeout, of the same value, is shared between fixture teardowns and afterEach hooks, after the test function has finished. The same timeout value also applies to beforeAll and afterAll hooks, but they do not share time with any test.

## Set test timeout in the config

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ timeout: 120_000,});

## API reference: testConfig.timeout. Set timeout for a single test

example.spec.tsimport { test, expect } from '@playwright/test';test('slow test', async ({ page }) => { test.slow(); // Easy way to triple the default timeout // ...});test('very slow test', async ({ page }) => { test.setTimeout(120_000); // ...}); API reference: test.set

## Timeout() and test.slow(). Change timeout from a beforeEach hook

example.spec.tsimport { test, expect } from '@playwright/test';test.beforeEach(async ({ page }, testInfo) => { // Extend timeout for all tests running this hook by 30 seconds. testInfo.setTimeout(testInfo.timeout + 30_000);});

## API reference: testInfo.setTimeout(). Change timeout for beforeAll/afterAll hook

beforeAll and afterAll hooks have a separate timeout, by default equal to test timeout. You can change it separately for each hook by calling testInfo.setTimeout() inside the hook. example.spec.tsimport { test, expect } from '@playwright/test';test.beforeAll(async () => { // Set timeout for this hook. test.setTimeout(60000);});

## API reference: testInfo.setTimeout(). Expect timeout

Auto-retrying assertions like expect(locator).toHaveText() have a separate timeout, 5 seconds by default. Assertion timeout is unrelated to the test timeout. It produces the following error: example.spec.ts:3:1 › basic test ===========================Error: expect(received).toHaveText(expected)Expected string: "my text"Received string: ""Call log: - expect.toHaveText with timeout 5000ms - waiting for "locator('button')"

## Set expect timeout in the config

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ expect: { timeout: 10_000, },});

## API reference: testConfig.expect. Specify expect timeout for a single assertion

example.spec.tsimport { test, expect } from '@playwright/test';test('example', async ({ page }) => { await expect(locator).toHaveText('hello', { timeout: 10_000 });});

## Global timeout

Playwright Test supports a timeout for the whole test run. This prevents excess resource usage when everything went wrong. There is no default global timeout, but you can set a reasonable one in the config, for example one hour. Global timeout produces the following error: Running 1000 tests using 10 workers 514 skipped 486 passed Timed out waiting 3600s for the entire test run You can set global timeout in the config. playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ globalTimeout: 3_600_000,});

## API reference: testConfig.globalTimeout. Advanced: low level timeouts

These are the low-level timeouts that are pre-configured by the test runner, you should not need to change these. If you happen to be in this section because your test are flaky, it is very likely that you should be looking for the solution elsewhere. TimeoutDefaultDescriptionAction timeoutno timeoutTimeout for each actionSet in config{ use: { actionTimeout: 10_000 } }Override in testlocator.click({ timeout: 10_000 })Navigation timeoutno timeoutTimeout for each navigation actionSet in config{ use: { navigationTimeout: 30_000 } }Override in testpage.goto('/', { timeout: 30_000 })Global timeoutno timeoutGlobal timeout for the whole test runSet in config{ globalTimeout: 3_600_000 }beforeAll/afterAll timeout30_000 msTimeout for the hookSet in hooktest.setTimeout(60_000)Fixture timeoutno timeoutTimeout for an individual fixtureSet in fixture{ scope: 'test', timeout: 30_000 }

## Set action and navigation timeouts in the config

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { actionTimeout: 10 _ 1000, navigationTimeout: 30 _ 1000, },}); API reference: testOptions.action

## Timeout and testOptions.navigationTimeout. Set timeout for a single action

example.spec.tsimport { test, expect } from '@playwright/test';test('basic test', async ({ page }) => { await page.goto('https://playwright.dev', { timeout: 30000 }); await page.getByText('Get Started').click({ timeout: 10000 });});

## Fixture timeout

By default, fixture shares timeout with the test. However, for slow fixtures, especially worker-scoped ones, it is convenient to have a separate timeout. This way you can keep the overall test timeout small, and give the slow fixture more time. example.spec.tsimport { test as base, expect } from '@playwright/test';const test = base.extend<{ slowFixture: string }>({ slowFixture: [async ({}, use) => { // ... perform a slow operation ... await use('hello'); }, { timeout: 60_000 }]});test('example test', async ({ slowFixture }) => { // ...}); API reference: test.extend().
