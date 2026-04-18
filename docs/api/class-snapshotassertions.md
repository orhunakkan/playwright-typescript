# 📦 Playwright — SnapshotAssertions

> **Source:** [playwright.dev/docs/api/class-snapshotassertions](https://playwright.dev/docs/api/class-snapshotassertions)

---

## Overview

Playwright provides methods for comparing page and element screenshots with expected values stored in files.

```ts
expect(screenshot).toMatchSnapshot('landing-page.png');
```

⚠️ **Note:** To compare screenshots, use `expect(page).toHaveScreenshot()` instead.

---

## Methods

### toMatchSnapshot(name)

**Added in:** v1.22

Ensures that passed value, either a string or a Buffer, matches the expected snapshot stored in the test snapshots directory.

```ts
// Basic usage
expect(await page.screenshot()).toMatchSnapshot('landing-page.png');

// Pass options to customize snapshot comparison
expect(await page.screenshot()).toMatchSnapshot('landing-page.png', {
  maxDiffPixels: 27, // allow no more than 27 different pixels
});

// Configure image matching threshold
expect(await page.screenshot()).toMatchSnapshot('landing-page.png', {
  threshold: 0.3,
});

// Structure snapshot files with path segments
expect(await page.screenshot()).toMatchSnapshot(['landing', 'step2.png']);
expect(await page.screenshot()).toMatchSnapshot(['landing', 'step3.png']);
```

**Arguments:**

- `name` string | Array<string> — Snapshot name
- `options` Object (optional)
  - `maxDiffPixelRatio` number (optional) — An acceptable ratio of pixels that are different to the total amount of pixels, between 0 and 1. Default is configurable with **TestConfig.expect**. Unset by default
  - `maxDiffPixels` number (optional) — An acceptable amount of pixels that could be different. Default is configurable with **TestConfig.expect**. Unset by default
  - `threshold` number (optional) — An acceptable perceived color difference in the YIQ color space between the same pixel in compared images, between zero (strict) and one (lax). Default is configurable with **TestConfig.expect**. Defaults to **0.2**

---

### toMatchSnapshot(options)

**Added in:** v1.22

Ensures that passed value, either a string or a Buffer, matches the expected snapshot stored in the test snapshots directory.

```ts
// Basic usage with auto-generated name from test
expect(await page.screenshot()).toMatchSnapshot();

// Pass options to customize snapshot comparison
expect(await page.screenshot()).toMatchSnapshot({
  maxDiffPixels: 27, // allow no more than 27 different pixels
});

// Configure image matching threshold and snapshot name
expect(await page.screenshot()).toMatchSnapshot({
  name: 'landing-page.png',
  threshold: 0.3,
});
```

**Arguments:**

- `options` Object (optional)
  - `maxDiffPixelRatio` number (optional) — An acceptable ratio of pixels that are different to the total amount of pixels, between 0 and 1. Default is configurable with **TestConfig.expect**. Unset by default
  - `maxDiffPixels` number (optional) — An acceptable amount of pixels that could be different. Default is configurable with **TestConfig.expect**. Unset by default
  - `name` string | Array<string> (optional) — Snapshot name. If not passed, the test name and ordinals are used when called multiple times
  - `threshold` number (optional) — An acceptable perceived color difference in the YIQ color space between the same pixel in compared images, between zero (strict) and one (lax). Default is configurable with **TestConfig.expect**. Defaults to **0.2**
