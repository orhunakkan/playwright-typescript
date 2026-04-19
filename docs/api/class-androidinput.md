# 📦 Playwright — AndroidInput

> **Source:** [playwright.dev/docs/api/class-androidinput](https://playwright.dev/docs/api/class-androidinput)

---

## Methods

### drag

**Added in:** v1.9

Performs a drag between from and to points.

```ts
await androidInput.drag(from, to, steps);
```

**Arguments:**

- `from` Object
  - `x` number
  - `y` number — The start point of the drag.
- `to` Object
  - `x` number
  - `y` number — The end point of the drag.
- `steps` number — The number of steps in the drag. Each step takes 5 milliseconds to complete.

**Returns:** `Promise<void>`

### press

**Added in:** v1.9

Presses the key.

```ts
await androidInput.press(key);
```

**Arguments:**

- `key` [AndroidKey] — Key to press.

**Returns:** `Promise<void>`

### swipe

**Added in:** v1.9

Swipes following the path defined by segments.

```ts
await androidInput.swipe(from, segments, steps);
```

**Arguments:**

- `from` Object
  - `x` number
  - `y` number — The point to start swiping from.
- `segments` Array\<Object\>
  - `x` number
  - `y` number — Points following the `from` point in the swipe gesture.
- `steps` number — The number of steps for each segment. Each step takes 5 milliseconds to complete, so 100 steps means half a second per each segment.

**Returns:** `Promise<void>`

### tap

**Added in:** v1.9

Taps at the specified point.

```ts
await androidInput.tap(point);
```

**Arguments:**

- `point` Object
  - `x` number
  - `y` number — The point to tap at.

**Returns:** `Promise<void>`

### type

**Added in:** v1.9

Types text into currently focused widget.

```ts
await androidInput.type(text);
```

**Arguments:**

- `text` string — Text to type.

**Returns:** `Promise<void>`
