# 📦 Playwright — ConsoleMessage

> **Source:** [playwright.dev/docs/api/class-consolemessage](https://playwright.dev/docs/api/class-consolemessage)

---

## Overview

**ConsoleMessage** objects are dispatched by page via the `page.on('console')` event. For each console message logged in the page there will be a corresponding event in the Playwright context.

```ts
// Listen for all console logs
page.on('console', (msg) => console.log(msg.text()));

// Listen for all console events and handle errors
page.on('console', (msg) => {
  if (msg.type() === 'error') console.log(`Error text: "${msg.text()}"`);
});

// Get the next console log
const msgPromise = page.waitForEvent('console');
await page.evaluate(() => {
  console.log('hello', 42, { foo: 'bar' }); // Issue console.log inside the page
});
const msg = await msgPromise;
// Deconstruct console log arguments
await msg.args()[0].jsonValue(); // hello
await msg.args()[1].jsonValue(); // 42
```

---

## Methods

### args

**Added before:** v1.9

List of arguments passed to a console function call. See also `page.on('console')`.

```ts
consoleMessage.args();
```

**Returns:** `Array<JSHandle>`

---

### location

**Added before:** v1.9

```ts
consoleMessage.location();
```

**Returns:** Object

- `url` string — URL of the resource.
- `lineNumber` number — 0-based line number in the resource.
- `columnNumber` number — 0-based column number in the resource.

---

### page

**Added in:** v1.34

The page that produced this console message, if any.

```ts
consoleMessage.page();
```

**Returns:** `null | Page`

---

### text

**Added before:** v1.9

The text of the console message.

```ts
consoleMessage.text();
```

**Returns:** `string`

---

### timestamp

**Added in:** v1.59

The timestamp of the console message in milliseconds since the Unix epoch.

```ts
consoleMessage.timestamp();
```

**Returns:** `number`

---

### type

**Added before:** v1.9

```ts
consoleMessage.type();
```

**Returns:** `"log" | "debug" | "info" | "error" | "warning" | "dir" | "dirxml" | "table" | "trace" | "clear" | "startGroup" | "startGroupCollapsed" | "endGroup" | "assert" | "profile" | "profileEnd" | "count" | "time" | "timeEnd"`

---

### worker

**Added in:** v1.57

The web worker or service worker that produced this console message, if any. Note that console messages from web workers also have non-null `consoleMessage.page()`.

```ts
consoleMessage.worker();
```

**Returns:** `null | Worker`
