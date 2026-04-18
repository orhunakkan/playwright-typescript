# 📸 Playwright — Test Snapshots

> **Source:** [playwright.dev/docs/test-snapshots](https://playwright.dev/docs/test-snapshots)

---

## Introduction

Playwright Test includes the ability to produce and visually compare screenshots using await expect(page).toHaveScreenshot(). On first execution, Playwright test will generate reference screenshots. Subsequent runs will compare against the reference. example.spec.tsimport { test, expect } from '@playwright/test';test('example test', async ({ page }) => { await page.goto('https://playwright.dev'); await expect(page).toHaveScreenshot();}); warningBrowser rendering can vary based on the host OS, version, settings, hardware, power source (battery vs. power adapter), headless mode, and other factors. For consistent screenshots, run tests in the same environment where the baseline screenshots were generated.

## Generating screenshots

When you run above for the first time, test runner will say: Error: A snapshot doesn't exist at example.spec.ts-snapshots/example-test-1-chromium-darwin.png, writing actual. That's because there was no golden file yet. This method took a bunch of screenshots until two consecutive screenshots matched, and saved the last screenshot to file system. It is now ready to be added to the repository. The name of the folder with the golden expectations starts with the name of your test file: drwxr-xr-x 5 user group 160 Jun 4 11:46 .drwxr-xr-x 6 user group 192 Jun 4 11:45 ..-rw-r--r-- 1 user group 231 Jun 4 11:16 example.spec.tsdrwxr-xr-x 3 user group 96 Jun 4 11:46 example.spec.ts-snapshots The snapshot name example-test-1-chromium-darwin.png consists of a few parts: example-test-1.png - an auto-generated name of the snapshot. Alternatively you can specify snapshot name as the first argument of the toHaveScreenshot() method: await expect(page).toHaveScreenshot('landing.png'); chromium-darwin - the browser name and the platform. Screenshots differ between browsers and platforms due to different rendering, fonts and more, so you will need different snapshots for them. If you use multiple projects in your configuration file, project name will be used instead of chromium. The snapshot name and path can be configured with testConfig.snapshotPathTemplate in the playwright config. Note that toHaveScreenshot() also accepts an array of path segments to the snapshot file such as expect().toHaveScreenshot(['relative', 'path', 'to', 'snapshot.png']). However, this path must stay within the snapshots directory for each test file (i.e. a.spec.js-snapshots), otherwise it will throw.

## Updating screenshots

Sometimes you need to update the reference screenshot, for example when the page has changed. Do this with the --update-snapshots flag. npx playwright test --update-snapshots

## Options

max

## DiffPixels

Playwright Test uses the pixelmatch library. You can pass various options to modify its behavior: example.spec.tsimport { test, expect } from '@playwright/test';test('example test', async ({ page }) => { await page.goto('https://playwright.dev'); await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });}); If you'd like to share the default value among all the tests in the project, you can specify it in the playwright config, either globally or per project: playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ expect: { toHaveScreenshot: { maxDiffPixels: 100 }, },}); style

## Path

You can apply a custom stylesheet to your page while taking screenshot. This allows filtering out dynamic or volatile elements, hence improving the screenshot determinism. screenshot.cssiframe { visibility: hidden;} example.spec.tsimport { test, expect } from '@playwright/test';test('example test', async ({ page }) => { await page.goto('https://playwright.dev'); await expect(page).toHaveScreenshot({ stylePath: path.join(\_\_dirname, 'screenshot.css') });}); If you'd like to share the default value among all the tests in the project, you can specify it in the playwright config, either globally or per project: playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ expect: { toHaveScreenshot: { stylePath: './screenshot.css' }, },});

## Non-image snapshots

Apart from screenshots, you can use expect(value).toMatchSnapshot(snapshotName) to compare text or arbitrary binary data. Playwright Test auto-detects the content type and uses the appropriate comparison algorithm. Here we compare text content against the reference. example.spec.tsimport { test, expect } from '@playwright/test';test('example test', async ({ page }) => { await page.goto('https://playwright.dev'); expect(await page.textContent('.hero\_\_title')).toMatchSnapshot('hero.txt');}); Snapshots are stored next to the test file, in a separate directory. For example, my.spec.ts file will produce and store snapshots in the my.spec.ts-snapshots directory. You should commit this directory to your version control (e.g. git), and review any changes to it.
