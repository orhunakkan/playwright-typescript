# 📦 Playwright — Touchscreen

> **Source:** [playwright.dev/docs/api/class-touchscreen](https://playwright.dev/docs/api/class-touchscreen)

---

## Overview

The **Touchscreen** class operates in main-frame CSS pixels relative to the top-left corner of the viewport. Methods on the touchscreen can only be used in browser contexts that have been initialized with `hasTouch` set to `true`. This class is limited to emulating tap gestures.

For examples of other gestures simulated by manually dispatching touch events, see the emulating legacy touch events page.

## Methods

### `tap()` — Added before v1.9

Dispatches a `touchstart` and `touchend` event with a single touch at the position `(x, y)`.

> **Note:** `page.tap()` will throw if the `hasTouch` option of the browser context is `false`.

```ts
await touchscreen.tap(x, y);
```

**Arguments:**

- `x` `number` — X coordinate relative to the main frame's viewport in CSS pixels.
- `y` `number` — Y coordinate relative to the main frame's viewport in CSS pixels.

**Returns:** `Promise<void>`
