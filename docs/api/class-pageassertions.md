# 📄 Playwright — PageAssertions

> **Source:** [playwright.dev/docs/api/class-pageassertions](https://playwright.dev/docs/api/class-pageassertions)

---

## Overview

The **PageAssertions** class provides assertion methods for the **Page** state in tests.

```ts
import { test, expect } from '@playwright/test';

test('navigates to login', async ({ page }) => {
  await page.getByText('Sign in').click();
  await expect(page).toHaveURL(/.*\/login/);
});
```

---

## Methods

### `pageAssertions.toHaveScreenshot(name, options?)` — Added in: v1.23

Waits until two consecutive page screenshots yield the same result, then compares the last screenshot with the expectation.

```ts
await expect(page).toHaveScreenshot('image.png');
```

> **Note:** Screenshot assertions only work with the Playwright test runner.

**Arguments:**

| Parameter                   | Type                                                 | Description                                                                                      |
| --------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `name`                      | `string \| Array<string>`                            | Snapshot name.                                                                                   |
| `options`                   | `Object` (optional)                                  | Screenshot comparison options.                                                                   |
| `options.animations`        | `"disabled" \| "allow"` (optional)                   | Stops CSS animations and Web Animations when set to `"disabled"`. Defaults to `"disabled"`.      |
| `options.caret`             | `"hide" \| "initial"` (optional)                     | Hides text caret when set to `"hide"`. Defaults to `"hide"`.                                     |
| `options.clip`              | `Object` (optional)                                  | Clipping area `{ x, y, width, height }` for the resulting image.                                 |
| `options.fullPage`          | `boolean` (optional)                                 | When `true`, takes a screenshot of the full scrollable page. Defaults to `false`.                |
| `options.mask`              | `Array<Locator>` (optional)                          | Locators to mask with a pink `#FF00FF` overlay box.                                              |
| `options.maskColor`         | `string` (optional, Added in v1.35)                  | CSS color for the mask overlay. Default is `#FF00FF`.                                            |
| `options.maxDiffPixelRatio` | `number` (optional)                                  | Acceptable ratio of different pixels (0–1). Configurable via `TestConfig.expect`.                |
| `options.maxDiffPixels`     | `number` (optional)                                  | Acceptable number of different pixels. Configurable via `TestConfig.expect`.                     |
| `options.omitBackground`    | `boolean` (optional)                                 | Hides default white background for transparency. Not applicable to JPEG. Defaults to `false`.    |
| `options.scale`             | `"css" \| "device"` (optional)                       | `"css"` = one pixel per CSS pixel; `"device"` = one pixel per device pixel. Defaults to `"css"`. |
| `options.stylePath`         | `string \| Array<string>` (optional, Added in v1.41) | Path to stylesheet to apply during screenshot capture.                                           |
| `options.threshold`         | `number` (optional)                                  | Acceptable perceived color difference in YIQ color space (0–1). Defaults to `0.2`.               |
| `options.timeout`           | `number` (optional)                                  | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout.                      |

**Returns:** `Promise<void>`

---

### `pageAssertions.toHaveScreenshot(options?)` — Added in: v1.23

Waits until two consecutive page screenshots yield the same result, then compares the last screenshot with the expectation.

```ts
await expect(page).toHaveScreenshot();
```

> **Note:** Screenshot assertions only work with the Playwright test runner.

**Arguments:**

| Parameter | Type                | Description                                                   |
| --------- | ------------------- | ------------------------------------------------------------- |
| `options` | `Object` (optional) | Same option properties as `toHaveScreenshot(name, options?)`. |

**Returns:** `Promise<void>`

---

### `pageAssertions.toHaveTitle(titleOrRegExp, options?)` — Added in: v1.20

Ensures the page has the given title.

```ts
await expect(page).toHaveTitle(/.*checkout/);
```

**Arguments:**

| Parameter         | Type                | Description                                                                 |
| ----------------- | ------------------- | --------------------------------------------------------------------------- |
| `titleOrRegExp`   | `string \| RegExp`  | Expected title or regular expression.                                       |
| `options.timeout` | `number` (optional) | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout. |

**Returns:** `Promise<void>`

---

### `pageAssertions.toHaveURL(url, options?)` — Added in: v1.20

Ensures the page is navigated to the given URL.

```ts
await expect(page).toHaveURL('https://playwright.dev/docs/intro');
await expect(page).toHaveURL(/docs?\//);
await expect(page).toHaveURL(new URLPattern({ pathname: '/docs/*' }));
await expect(page).toHaveURL((url) => url.searchParams.has('search'));
```

**Arguments:**

| Parameter            | Type                                                      | Description                                                                                                                                                      |
| -------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`                | `string \| RegExp \| URLPattern \| function(URL):boolean` | Expected URL string, RegExp, URLPattern, or predicate function. When `baseURL` is set in context options and `url` is a string, they are merged via `new URL()`. |
| `options.ignoreCase` | `boolean` (optional, Added in v1.44)                      | Perform case-insensitive match. Takes precedence over regex flags. Predicates ignore this flag.                                                                  |
| `options.timeout`    | `number` (optional)                                       | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout.                                                                                      |

**Returns:** `Promise<void>`

---

## Properties

### `pageAssertions.not` — Added in: v1.20

Makes the assertion check for the opposite condition.

```ts
await expect(page).not.toHaveURL('error');
```

**Type:** `PageAssertions`

---
