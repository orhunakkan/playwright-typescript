# 🖱️ Playwright — Mouse

> **Source:** [playwright.dev/docs/api/class-mouse](https://playwright.dev/docs/api/class-mouse)

---

The **Mouse** class operates in main-frame CSS pixels relative to the top-left corner of the viewport.

> **Tip:** If you want to debug where the mouse moved, you can use the Trace viewer or Playwright Inspector. A red dot showing the location of the mouse will be shown for every mouse action.

Every page object has its own Mouse, accessible with `page.mouse`.

```ts
// Using 'page.mouse' to trace a 100x100 square.
await page.mouse.move(0, 0);
await page.mouse.down();
await page.mouse.move(0, 100);
await page.mouse.move(100, 100);
await page.mouse.move(100, 0);
await page.mouse.move(0, 0);
await page.mouse.up();
```

## Methods

### `mouse.click(x, y, options?)` — Added before: v1.9

Shortcut for `mouse.move()`, `mouse.down()`, `mouse.up()`.

```ts
await mouse.click(x, y);
await mouse.click(x, y, options);
```

**Arguments:**

| Parameter            | Type                                       | Description                                                                      |
| -------------------- | ------------------------------------------ | -------------------------------------------------------------------------------- |
| `x`                  | `number`                                   | X coordinate relative to the main frame's viewport in CSS pixels.                |
| `y`                  | `number`                                   | Y coordinate relative to the main frame's viewport in CSS pixels.                |
| `options.button`     | `"left" \| "right" \| "middle"` (optional) | Defaults to `left`.                                                              |
| `options.clickCount` | `number` (optional)                        | Defaults to `1`. See `UIEvent.detail`.                                           |
| `options.delay`      | `number` (optional)                        | Time to wait between `mousedown` and `mouseup` in milliseconds. Defaults to `0`. |

**Returns:** `Promise<void>`

### `mouse.dblclick(x, y, options?)` — Added before: v1.9

Shortcut for `mouse.move()`, `mouse.down()`, `mouse.up()`, `mouse.down()` and `mouse.up()`.

```ts
await mouse.dblclick(x, y);
await mouse.dblclick(x, y, options);
```

**Arguments:**

| Parameter        | Type                                       | Description                                                                      |
| ---------------- | ------------------------------------------ | -------------------------------------------------------------------------------- |
| `x`              | `number`                                   | X coordinate relative to the main frame's viewport in CSS pixels.                |
| `y`              | `number`                                   | Y coordinate relative to the main frame's viewport in CSS pixels.                |
| `options.button` | `"left" \| "right" \| "middle"` (optional) | Defaults to `left`.                                                              |
| `options.delay`  | `number` (optional)                        | Time to wait between `mousedown` and `mouseup` in milliseconds. Defaults to `0`. |

**Returns:** `Promise<void>`

### `mouse.down(options?)` — Added before: v1.9

Dispatches a `mousedown` event.

```ts
await mouse.down();
await mouse.down(options);
```

**Arguments:**

| Parameter            | Type                                       | Description                            |
| -------------------- | ------------------------------------------ | -------------------------------------- |
| `options.button`     | `"left" \| "right" \| "middle"` (optional) | Defaults to `left`.                    |
| `options.clickCount` | `number` (optional)                        | Defaults to `1`. See `UIEvent.detail`. |

**Returns:** `Promise<void>`

### `mouse.move(x, y, options?)` — Added before: v1.9

Dispatches a `mousemove` event.

```ts
await mouse.move(x, y);
await mouse.move(x, y, options);
```

**Arguments:**

| Parameter       | Type                | Description                                                                                                                                                                                                                            |
| --------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `x`             | `number`            | X coordinate relative to the main frame's viewport in CSS pixels.                                                                                                                                                                      |
| `y`             | `number`            | Y coordinate relative to the main frame's viewport in CSS pixels.                                                                                                                                                                      |
| `options.steps` | `number` (optional) | Defaults to `1`. Sends n interpolated `mousemove` events to represent travel between Playwright's current cursor position and the provided destination. When set to `1`, emits a single `mousemove` event at the destination location. |

**Returns:** `Promise<void>`

### `mouse.up(options?)` — Added before: v1.9

Dispatches a `mouseup` event.

```ts
await mouse.up();
await mouse.up(options);
```

**Arguments:**

| Parameter            | Type                                       | Description                            |
| -------------------- | ------------------------------------------ | -------------------------------------- |
| `options.button`     | `"left" \| "right" \| "middle"` (optional) | Defaults to `left`.                    |
| `options.clickCount` | `number` (optional)                        | Defaults to `1`. See `UIEvent.detail`. |

**Returns:** `Promise<void>`

### `mouse.wheel(deltaX, deltaY)` — Added in: v1.15

Dispatches a `wheel` event. This method is usually used to manually scroll the page. See scrolling for alternative ways to scroll.

> **Note:** Wheel events may cause scrolling if they are not handled, and this method does not wait for the scrolling to finish before returning.

```ts
await mouse.wheel(deltaX, deltaY);
```

**Arguments:**

| Parameter | Type     | Description                    |
| --------- | -------- | ------------------------------ |
| `deltaX`  | `number` | Pixels to scroll horizontally. |
| `deltaY`  | `number` | Pixels to scroll vertically.   |

**Returns:** `Promise<void>`
