# 📦 Playwright — Video

> **Source:** [playwright.dev/docs/api/class-video](https://playwright.dev/docs/api/class-video)

---

## Overview

When browser context is created with the `recordVideo` option, each page has a **video** object associated with it.

```ts
console.log(await page.video().path());
```

## Methods

### `delete()` — Added in: v1.11

Deletes the video file. Will wait for the video to finish if necessary.

```ts
await video.delete();
```

**Returns:** `Promise<void>`

---

### `path()` — Added before v1.9

Returns the file system path this video will be recorded to. The video is guaranteed to be written to the filesystem upon closing the browser context.

> **Note:** This method throws when connected remotely.

```ts
await video.path();
```

**Returns:** `Promise<string>`

---

### `saveAs()` — Added in: v1.11

Saves the video to a user-specified path. It is safe to call this method while the video is still in progress, or after the page has closed. This method waits until the page is closed and the video is fully saved.

```ts
await video.saveAs(path);
```

**Arguments:**

- `path` `string` — Path where the video should be saved.

**Returns:** `Promise<void>`
