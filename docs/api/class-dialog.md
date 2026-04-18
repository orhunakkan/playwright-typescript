# 📦 Playwright — Dialog

> **Source:** [playwright.dev/docs/api/class-dialog](https://playwright.dev/docs/api/class-dialog)

---

**Dialog** objects are dispatched by page via the `page.on('dialog')` event.

```ts
const { chromium } = require('playwright'); // Or 'firefox' or 'webkit'.
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('dialog', async (dialog) => {
    console.log(dialog.message());
    await dialog.dismiss();
  });
  await page.evaluate(() => alert('1'));
  await browser.close();
})();
```

> **Note:** Dialogs are dismissed automatically, unless there is a `page.on('dialog')` listener. When listener is present, it must either `dialog.accept()` or `dialog.dismiss()` the dialog — otherwise the page will freeze waiting for the dialog, and actions like `click` will never finish.

---

## Methods

### accept

**Added before:** v1.9

Returns when the dialog has been accepted.

```ts
await dialog.accept();
await dialog.accept(promptText);
```

**Arguments:**

- `promptText` string (optional) — A text to enter in prompt. Does not cause any effects if the dialog's type is not `prompt`.

**Returns:** `Promise<void>`

---

### defaultValue

**Added before:** v1.9

If dialog is prompt, returns default prompt value. Otherwise, returns empty string.

```ts
dialog.defaultValue();
```

**Returns:** `string`

---

### dismiss

**Added before:** v1.9

Returns when the dialog has been dismissed.

```ts
await dialog.dismiss();
```

**Returns:** `Promise<void>`

---

### message

**Added before:** v1.9

A message displayed in the dialog.

```ts
dialog.message();
```

**Returns:** `string`

---

### page

**Added in:** v1.34

The page that initiated this dialog, if available.

```ts
dialog.page();
```

**Returns:** `null | Page`

---

### type

**Added before:** v1.9

Returns dialog's type, can be one of `alert`, `beforeunload`, `confirm` or `prompt`.

```ts
dialog.type();
```

**Returns:** `string`
