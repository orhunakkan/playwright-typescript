# 📦 Playwright — AndroidWebView

> **Source:** [playwright.dev/docs/api/class-androidwebview](https://playwright.dev/docs/api/class-androidwebview)

---

**AndroidWebView** represents a WebView open on the `AndroidDevice`. WebView is usually obtained using `androidDevice.webView()`.

---

## Methods

### page

**Added in:** v1.9

Connects to the WebView and returns a regular Playwright `Page` to interact with.

```ts
await androidWebView.page();
```

**Returns:** `Promise<Page>`

---

### pid

**Added in:** v1.9

WebView process PID.

```ts
androidWebView.pid();
```

**Returns:** `number`

---

### pkg

**Added in:** v1.9

WebView package identifier.

```ts
androidWebView.pkg();
```

**Returns:** `string`

---

## Events

### on('close')

**Added in:** v1.9

Emitted when the WebView is closed.

```ts
androidWebView.on('close', (data) => {});
```
