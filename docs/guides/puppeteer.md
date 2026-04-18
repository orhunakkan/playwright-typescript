# 🎪 Playwright — Puppeteer

> **Source:** [playwright.dev/docs/puppeteer](https://playwright.dev/docs/puppeteer)

---

## 📋 Migration Principles

This guide describes migration to Playwright Library and Playwright Test from Puppeteer. The APIs have similarities, but Playwright offers much more possibilities for web testing and cross-browser automation.

- Most Puppeteer APIs can be used as is
- The use of `ElementHandle` is discouraged; use `Locator` objects and web-first assertions instead
- Playwright is cross-browser
- You probably don't need explicit wait

---

## 📊 Cheat Sheet

| Puppeteer                                                                    | Playwright Library                                                       |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `await puppeteer.launch()`                                                   | `await playwright.chromium.launch()`                                     |
| `puppeteer.launch({product: 'firefox'})`                                     | `await playwright.firefox.launch()`                                      |
| WebKit is not supported by Puppeteer                                         | `await playwright.webkit.launch()`                                       |
| `await browser.createIncognitoBrowserContext(...)`                           | `await browser.newContext(...)`                                          |
| `await page.setViewport(...)`                                                | `await page.setViewportSize(...)`                                        |
| `await page.waitForXPath(XPathSelector)`                                     | `await page.waitForSelector(XPathSelector)`                              |
| `await page.waitForNetworkIdle(...)`                                         | `await page.waitForLoadState('networkidle')`                             |
| `await page.$eval(...)`                                                      | Assertions can often be used instead to verify text, attribute, class... |
| `await page.$(...)`                                                          | Discouraged, use Locators instead                                        |
| `await page.$x(xpath_selector)`                                              | Discouraged, use Locators instead                                        |
| No methods dedicated to checkbox or radio input                              | `await page.locator(selector).check()` / `.uncheck()`                    |
| `await page.click(selector)`                                                 | `await page.locator(selector).click()`                                   |
| `await page.focus(selector)`                                                 | `await page.locator(selector).focus()`                                   |
| `await page.hover(selector)`                                                 | `await page.locator(selector).hover()`                                   |
| `await page.select(selector, values)`                                        | `await page.locator(selector).selectOption(values)`                      |
| `await page.tap(selector)`                                                   | `await page.locator(selector).tap()`                                     |
| `await page.type(selector, ...)`                                             | `await page.locator(selector).fill(...)`                                 |
| `await page.waitForFileChooser(...)` / `await elementHandle.uploadFile(...)` | `await page.locator(selector).setInputFiles(...)`                        |
| `await page.cookies([...urls])`                                              | `await browserContext.cookies([urls])`                                   |
| `await page.deleteCookie(...cookies)`                                        | `await browserContext.clearCookies()`                                    |
| `await page.setCookie(...cookies)`                                           | `await browserContext.addCookies(cookies)`                               |
| `page.on(...)`                                                               | `page.on(...)` (to intercept and mutate requests, see `page.route()`)    |

`page.waitForNavigation` and `page.waitForSelector` remain, but in many cases will not be necessary due to auto-waiting. The use of `ElementHandle` is discouraged — use `Locator` objects and web-first assertions instead. Locators are strict: all operations on locators that imply some target DOM element will throw if more than one element matches.

---

## 💡 Examples

### Automation example

Puppeteer:

```ts
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('https://playwright.dev/', {
    waitUntil: 'networkidle2',
  });
  await page.screenshot({ path: 'example.png' });
  await browser.close();
})();
```

Line-by-line migration to Playwright:

```ts
const { chromium } = require('playwright'); // 1

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage(); // 2
  await page.setViewportSize({ width: 1280, height: 800 }); // 3
  await page.goto('https://playwright.dev/', {
    waitUntil: 'networkidle', // 4
  });
  await page.screenshot({ path: 'example.png' });
  await browser.close();
})();
```

Migration highlights (see inline comments in the Playwright code snippet):

1. Each Playwright Library file has explicit import of `chromium`. Other browsers `webkit` or `firefox` can be used.
2. For browser state isolation, consider browser contexts
3. `setViewport` becomes `setViewportSize`
4. `networkidle2` becomes `networkidle`. Please note that in most cases it is not useful, thanks to auto-waiting.

### Test example

Puppeteer with Jest:

```ts
import puppeteer from 'puppeteer';

describe('Playwright homepage', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  it('contains hero title', async () => {
    await page.goto('https://playwright.dev/');
    await page.waitForSelector('.hero__title');
    const text = await page.$eval('.hero__title', (e) => e.textContent);
    expect(text).toContain('Playwright enables reliable end-to-end testing'); // 5
  });

  afterAll(() => browser.close());
});
```

Line-by-line migration to Playwright Test:

```ts
import { test, expect } from '@playwright/test'; // 1

test.describe('Playwright homepage', () => {
  test('contains hero title', async ({ page }) => {
    // 2, 3
    await page.goto('https://playwright.dev/');
    const titleLocator = page.locator('.hero__title'); // 4
    await expect(titleLocator).toContainText(
      // 5
      'Playwright enables reliable end-to-end testing'
    );
  });
});
```

Migration highlights:

1. Each Playwright Test file has explicit import of the `test` and `expect` functions
2. Test function is marked with `async`
3. Playwright Test is given a `page` as one of its parameters — one of the many useful fixtures. Playwright Test creates an isolated `Page` object for each test. However, if you'd like to reuse a single `Page` between multiple tests, create your own in `test.beforeAll()` and close it in `test.afterAll()`.
4. Locator creation with `page.locator()` is one of the few methods that is sync
5. Use assertions to verify the state instead of `page.$eval()`

---

## 🧪 Testing

To improve testing, it is advised to use Locators and web-first Assertions. See Writing Tests.

It is common with Puppeteer to use `page.evaluate()` or `page.$eval()` to inspect an `ElementHandle` and extract the value of text content, attribute, class, etc. Web-first Assertions offer several matchers for this purpose — they are more reliable and readable.

Playwright Test is the first-party recommended test runner for Playwright. It provides several features like Page Object Model, parallelism, fixtures, and reporters.

---

## ✨ Playwright Test Super Powers

Once you're on Playwright Test, you get a lot!

- Full zero-configuration TypeScript support
- Run tests across all web engines (Chrome, Firefox, Safari) on any popular operating system (Windows, macOS, Ubuntu)
- Full support for multiple origins, (i)frames, tabs and contexts
- Run tests in isolation in parallel across multiple browsers
- Built-in test artifact collection

You also get all these awesome tools that come bundled with Playwright Test:

- Playwright Inspector
- Playwright Test Code generation
- Playwright Tracing for post-mortem debugging

---

## 📚 Further Reading

Learn more about Playwright Test runner:

- Getting Started
- Fixtures
- Locators
- Assertions
- Auto-waiting
