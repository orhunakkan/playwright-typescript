# 📦 Playwright — Download

> **Source:** [playwright.dev/docs/api/class-download](https://playwright.dev/docs/api/class-download)

---

## Overview

**Download** objects are dispatched by page via the `page.on('download')` event. All the downloaded files belonging to the browser context are deleted when the browser context is closed. Download event is emitted once the download starts. Download path becomes available once download completes.

```ts
// Start waiting for download before clicking. Note no await.
const downloadPromise = page.waitForEvent('download');
await page.getByText('Download file').click();
const download = await downloadPromise;
// Wait for the download process to complete and save the downloaded file somewhere.
await download.saveAs('/path/to/save/at/' + download.suggestedFilename());
```

---

## Methods

### cancel

**Added in:** v1.13

Cancels a download. Will not fail if the download is already finished or canceled. Upon successful cancellations, `download.failure()` would resolve to `'canceled'`.

```ts
await download.cancel();
```

**Returns:** `Promise<void>`

---

### createReadStream

**Added before:** v1.9

Returns a readable stream for a successful download, or throws for a failed/canceled download.

> **Note:** If you don't need a readable stream, it's usually simpler to read the file from disk after the download completed. See `download.path()`.

```ts
await download.createReadStream();
```

**Returns:** `Promise<Readable>`

---

### delete

**Added before:** v1.9

Deletes the downloaded file. Will wait for the download to finish if necessary.

```ts
await download.delete();
```

**Returns:** `Promise<void>`

---

### failure

**Added before:** v1.9

Returns download error if any. Will wait for the download to finish if necessary.

```ts
await download.failure();
```

**Returns:** `Promise<null | string>`

---

### page

**Added in:** v1.12

Get the page that the download belongs to.

```ts
download.page();
```

**Returns:** `Page`

---

### path

**Added before:** v1.9

Returns path to the downloaded file for a successful download, or throws for a failed/canceled download. The method will wait for the download to finish if necessary. The method throws when connected remotely. Note that the download's file name is a random GUID, use `download.suggestedFilename()` to get suggested file name.

```ts
await download.path();
```

**Returns:** `Promise<string>`

---

### saveAs

**Added before:** v1.9

Copy the download to a user-specified path. It is safe to call this method while the download is still in progress. Will wait for the download to finish if necessary.

```ts
await download.saveAs('/path/to/save/at/' + download.suggestedFilename());
```

**Arguments:**

- `path` string — Path where the download should be copied.

**Returns:** `Promise<void>`

---

### suggestedFilename

**Added before:** v1.9

Returns suggested filename for this download. It is typically computed by the browser from the `Content-Disposition` response header or the `download` attribute. Different browsers can use different logic for computing it.

```ts
download.suggestedFilename();
```

**Returns:** `string`

---

### url

**Added before:** v1.9

Returns downloaded url.

```ts
download.url();
```

**Returns:** `string`
