# 📦 Playwright — FileChooser

> **Source:** [playwright.dev/docs/api/class-filechooser](https://playwright.dev/docs/api/class-filechooser)

---

**FileChooser** objects are dispatched by the page in the `page.on('filechooser')` event.

```ts
// Start waiting for file chooser before clicking. Note no await.
const fileChooserPromise = page.waitForEvent('filechooser');
await page.getByText('Upload file').click();
const fileChooser = await fileChooserPromise;
await fileChooser.setFiles(path.join(__dirname, 'myfile.pdf'));
```

## Methods

### element

**Added before:** v1.9

Returns input element associated with this file chooser.

```ts
fileChooser.element();
```

**Returns:** `ElementHandle`

### isMultiple

**Added before:** v1.9

Returns whether this file chooser accepts multiple files.

```ts
fileChooser.isMultiple();
```

**Returns:** `boolean`

### page

**Added before:** v1.9

Returns page this file chooser belongs to.

```ts
fileChooser.page();
```

**Returns:** `Page`

### setFiles

**Added before:** v1.9

Sets the value of the file input this chooser is associated with. If some of the `filePaths` are relative paths, then they are resolved relative to the current working directory. For empty array, clears the selected files.

```ts
await fileChooser.setFiles(files);
await fileChooser.setFiles(files, options);
```

**Arguments:**

- `files` string | Array\<string\> | Object | Array\<Object\>
  - `name` string — File name.
  - `mimeType` string — File type.
  - `buffer` Buffer — File content.
- `options` Object (optional)
  - `noWaitAfter` boolean (optional) — _Deprecated._ This option has no effect.
  - `timeout` number (optional) — Maximum time in milliseconds. Defaults to `0` - no timeout. The default value can be changed via `actionTimeout` option in the config, or by using the `browserContext.setDefaultTimeout()` or `page.setDefaultTimeout()` methods.

**Returns:** `Promise<void>`
