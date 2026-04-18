# 📦 Playwright — Keyboard

> **Source:** [playwright.dev/docs/api/class-keyboard](https://playwright.dev/docs/api/class-keyboard)

---

**Keyboard** provides an api for managing a virtual keyboard. The high level api is `keyboard.type()`, which takes raw characters and generates proper `keydown`, `keypress/input`, and `keyup` events on your page. For finer control, you can use `keyboard.down()`, `keyboard.up()`, and `keyboard.insertText()` to manually fire events as if they were generated from a real keyboard.

An example of holding down Shift in order to select and delete some text:

```ts
await page.keyboard.type('Hello World!');
await page.keyboard.press('ArrowLeft');
await page.keyboard.down('Shift');
for (let i = 0; i < ' World'.length; i++) await page.keyboard.press('ArrowLeft');
await page.keyboard.up('Shift');
await page.keyboard.press('Backspace');
// Result text will end up saying 'Hello!'
```

An example of pressing uppercase A:

```ts
await page.keyboard.press('Shift+KeyA');
// or
await page.keyboard.press('Shift+A');
```

An example to trigger select-all with the keyboard:

```ts
await page.keyboard.press('ControlOrMeta+A');
```

---

## Methods

### `keyboard.down(key)` — Added before: v1.9

Dispatches a `keydown` event. `key` can specify the intended `keyboardEvent.key` value or a single character to generate the text for. Examples of the keys are: `F1`–`F12`, `Digit0`–`Digit9`, `KeyA`–`KeyZ`, `Backquote`, `Minus`, `Equal`, `Backslash`, `Backspace`, `Tab`, `Delete`, `Escape`, `ArrowDown`, `End`, `Enter`, `Home`, `Insert`, `PageDown`, `PageUp`, `ArrowRight`, `ArrowUp`, etc.

Following modification shortcuts are also supported: `Shift`, `Control`, `Alt`, `Meta`, `ShiftLeft`, `ControlOrMeta`.

> **Note:** Modifier keys DO influence `keyboard.down`. Holding down `Shift` will type the text in upper case.

```ts
await keyboard.down(key);
```

**Arguments:**

| Parameter | Type     | Description                                                                      |
| --------- | -------- | -------------------------------------------------------------------------------- |
| `key`     | `string` | Name of the key to press or a character to generate, such as `ArrowLeft` or `a`. |

**Returns:** `Promise<void>`

---

### `keyboard.insertText(text)` — Added before: v1.9

Dispatches only `input` event, does not emit the `keydown`, `keyup` or `keypress` events.

> **Note:** Modifier keys DO NOT affect `keyboard.insertText`. Holding down `Shift` will not type the text in upper case.

```ts
page.keyboard.insertText('咆');
```

**Arguments:**

| Parameter | Type     | Description                             |
| --------- | -------- | --------------------------------------- |
| `text`    | `string` | Sets input to the specified text value. |

**Returns:** `Promise<void>`

---

### `keyboard.press(key, options?)` — Added before: v1.9

> **Tip:** In most cases, you should use `locator.press()` instead.

`key` can specify the intended `keyboardEvent.key` value or a single character to generate the text for. Shortcuts such as `"Control+o"`, `"Control++"`, or `"Control+Shift+T"` are supported as well. When specified with the modifier, modifier is pressed and being held while the subsequent key is being pressed.

Shortcut for `keyboard.down()` and `keyboard.up()`.

```ts
const page = await browser.newPage();
await page.goto('https://keycode.info');
await page.keyboard.press('A');
await page.screenshot({ path: 'A.png' });
await page.keyboard.press('ArrowLeft');
await page.screenshot({ path: 'ArrowLeft.png' });
await page.keyboard.press('Shift+O');
await page.screenshot({ path: 'O.png' });
await browser.close();
```

**Arguments:**

| Parameter       | Type                | Description                                                                      |
| --------------- | ------------------- | -------------------------------------------------------------------------------- |
| `key`           | `string`            | Name of the key to press or a character to generate, such as `ArrowLeft` or `a`. |
| `options.delay` | `number` (optional) | Time to wait between `keydown` and `keyup` in milliseconds. Defaults to `0`.     |

**Returns:** `Promise<void>`

---

### `keyboard.type(text, options?)` — Added before: v1.9

> **Caution:** In most cases, you should use `locator.fill()` instead. You only need to press keys one by one if there is special keyboard handling on the page — in this case use `locator.pressSequentially()`.

Sends a `keydown`, `keypress/input`, and `keyup` event for each character in the text. To press a special key, like `Control` or `ArrowDown`, use `keyboard.press()`.

> **Note:** Modifier keys DO NOT affect `keyboard.type`. Holding down `Shift` will not type the text in upper case.

> **Note:** For characters that are not on a US keyboard, only an `input` event will be sent.

```ts
await page.keyboard.type('Hello'); // Types instantly
await page.keyboard.type('World', { delay: 100 }); // Types slower, like a user
```

**Arguments:**

| Parameter       | Type                | Description                                                        |
| --------------- | ------------------- | ------------------------------------------------------------------ |
| `text`          | `string`            | A text to type into a focused element.                             |
| `options.delay` | `number` (optional) | Time to wait between key presses in milliseconds. Defaults to `0`. |

**Returns:** `Promise<void>`

---

### `keyboard.up(key)` — Added before: v1.9

Dispatches a `keyup` event.

```ts
await keyboard.up(key);
```

**Arguments:**

| Parameter | Type     | Description                                                                      |
| --------- | -------- | -------------------------------------------------------------------------------- |
| `key`     | `string` | Name of the key to press or a character to generate, such as `ArrowLeft` or `a`. |

**Returns:** `Promise<void>`
