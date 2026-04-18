# 📦 Playwright — WebError

> **Source:** [playwright.dev/docs/api/class-weberror](https://playwright.dev/docs/api/class-weberror)

---

**WebError** class represents an unhandled exception thrown in the page. It is dispatched via the `browserContext.on('weberror')` event.

```ts
// Log all uncaught errors to the terminal
context.on('weberror', (webError) => {
  console.log(`Uncaught exception: "${webError.error()}"`);
});
// Navigate to a page with an exception.
await page.goto('data:text/html,<script>throw new Error("Test")</script>');
```

## Methods

### `error()` — Added in: v1.38

Unhandled error that was thrown.

```ts
webError.error();
```

**Returns:** `Error`

---

### `page()` — Added in: v1.38

The page that produced this unhandled exception, if any.

```ts
webError.page();
```

**Returns:** `null | Page`
