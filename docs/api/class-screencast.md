# 📦 Playwright — Screencast

> **Source:** [playwright.dev/docs/api/class-screencast](https://playwright.dev/docs/api/class-screencast)

---

**Screencast** allows recording and annotating the browser in a screencast format. You can add overlays, chapters, and action decorations to the video.

---

## Methods

## Methods

### `screencast.hideActions()` — Added in: v1.59

Removes action decorations from the screencast.

```ts
await screencast.hideActions();
```

**Returns:** `Promise<void>`

---

### `screencast.hideOverlays()` — Added in: v1.59

Hides all overlays from the screencast.

```ts
await screencast.hideOverlays();
```

**Returns:** `Promise<void>`

---

### `screencast.showActions(options?)` — Added in: v1.59

Shows action decorations on the screencast.

```ts
const disposable = await screencast.showActions();
// later...
await disposable.dispose();
```

**Arguments:**

| Parameter          | Type                | Description                                                                                                                                              |
| ------------------ | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options.duration` | `number` (optional) | Duration in milliseconds to show each action. Defaults to 500.                                                                                           |
| `options.fontSize` | `number` (optional) | Font size for action labels in pixels. Defaults to 24.                                                                                                   |
| `options.position` | `string` (optional) | Position for action decorations. Defaults to `"top-right"`. One of: `"top-left"`, `"top"`, `"top-right"`, `"bottom-left"`, `"bottom"`, `"bottom-right"`. |

**Returns:** `Promise<Disposable>`

---

### `screencast.showChapter(title, options?)` — Added in: v1.59

Shows a chapter marker in the screencast.

```ts
await screencast.showChapter('Login flow');
await screencast.showChapter('Checkout', { description: 'User completes purchase', duration: 3000 });
```

**Arguments:**

| Parameter             | Type                | Description                                                               |
| --------------------- | ------------------- | ------------------------------------------------------------------------- |
| `title`               | `string`            | Chapter title.                                                            |
| `options.description` | `string` (optional) | Optional description for the chapter.                                     |
| `options.duration`    | `number` (optional) | Duration in milliseconds to display the chapter marker. Defaults to 2000. |

**Returns:** `Promise<void>`

---

### `screencast.showOverlay(html, options?)` — Added in: v1.59

Shows a custom HTML overlay on the screencast.

```ts
const overlay = await screencast.showOverlay('<b>Recording...</b>');
// later...
await overlay.dispose();
```

**Arguments:**

| Parameter          | Type                | Description                                                                                    |
| ------------------ | ------------------- | ---------------------------------------------------------------------------------------------- |
| `html`             | `string`            | HTML content of the overlay.                                                                   |
| `options.duration` | `number` (optional) | Duration in milliseconds to show the overlay. If omitted, the overlay persists until disposed. |

**Returns:** `Promise<Disposable>`

---

### `screencast.showOverlays()` — Added in: v1.59

Shows all previously hidden overlays.

```ts
await screencast.showOverlays();
```

**Returns:** `Promise<void>`

---

### `screencast.start(options?)` — Added in: v1.59

Starts the screencast recording.

```ts
const disposable = await screencast.start({ path: 'recording.webm' });
// ... do actions ...
await screencast.stop();
```

**Arguments:**

| Parameter             | Type                  | Description                      |
| --------------------- | --------------------- | -------------------------------- |
| `options.onFrame`     | `function` (optional) | Callback invoked for each frame. |
| `options.path`        | `string` (optional)   | Path to save the video file.     |
| `options.quality`     | `number` (optional)   | Video quality from 0 to 100.     |
| `options.size`        | `Object` (optional)   | Video dimensions.                |
| `options.size.width`  | `number`              | Video width in pixels.           |
| `options.size.height` | `number`              | Video height in pixels.          |

**Returns:** `Promise<Disposable>`

---

### `screencast.stop()` — Added in: v1.59

Stops the screencast recording. If a path was specified in `screencast.start()`, the video is saved to that path.

```ts
await screencast.stop();
```

**Returns:** `Promise<void>`
