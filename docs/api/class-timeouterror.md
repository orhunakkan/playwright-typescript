# 📦 Playwright — TimeoutError

> **Source:** [playwright.dev/docs/api/class-timeouterror](https://playwright.dev/docs/api/class-timeouterror)

---

**TimeoutError** extends **Error**.

TimeoutError is emitted whenever certain operations are terminated due to timeout, for example `locator.waitFor()` or `browserType.launch()`.

```js
const playwright = require('playwright');

(async () => {
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.locator('text=Foo').click({
      timeout: 100,
    });
  } catch (error) {
    if (error instanceof playwright.errors.TimeoutError) console.log('Timeout!');
  }
  await browser.close();
})();
```
