# 📦 Playwright — Route

> **Source:** [playwright.dev/docs/api/class-route](https://playwright.dev/docs/api/class-route)

---

## Overview

Whenever a network route is set up with `page.route()` or `browserContext.route()`, the **Route** object allows to handle the route. Learn more about networking.

---

### `route.abort(errorCode?)` — Added before v1.9

Aborts the route's request.

```ts
await route.abort();
await route.abort(errorCode);
```

**Arguments:**

| Parameter   | Type                | Description                                                                                                                                                                                                                                                                                                                            |
| ----------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `errorCode` | `string` (optional) | Error code. Defaults to `'failed'`. One of: `'aborted'`, `'accessdenied'`, `'addressunreachable'`, `'blockedbyclient'`, `'blockedbyresponse'`, `'connectionaborted'`, `'connectionclosed'`, `'connectionfailed'`, `'connectionrefused'`, `'connectionreset'`, `'internetdisconnected'`, `'namenotresolved'`, `'timedout'`, `'failed'`. |

**Returns:** `Promise<void>`

---

### `route.continue(options?)` — Added before v1.9

Sends route's request to the network with optional overrides.

```ts
await page.route('**/*', async (route, request) => {
  // Override headers
  const headers = {
    ...request.headers(),
    foo: 'foo-value', // set "foo" header
    bar: undefined, // remove "bar" header
  };
  await route.continue({ headers });
});
```

**Arguments:**

| Parameter          | Type                                          | Description                                                                            |
| ------------------ | --------------------------------------------- | -------------------------------------------------------------------------------------- |
| `options.headers`  | `Object<string, string>` (optional)           | If set, changes the request HTTP headers. Header values will be converted to a string. |
| `options.method`   | `string` (optional)                           | If set, changes the request method (e.g. GET or POST).                                 |
| `options.postData` | `string \| Buffer \| Serializable` (optional) | If set, changes the post data of request.                                              |
| `options.url`      | `string` (optional)                           | If set, changes the request URL. New URL must have same protocol as original one.      |

**Returns:** `Promise<void>`

> **Note:** The `headers` option applies to both the routed request and any redirects it initiates. However, `url`, `method`, and `postData` only apply to the original request and are not carried over to redirected requests. `route.continue()` will immediately send the request to the network, other matching handlers won't be invoked. Use `route.fallback()` if you want the next matching handler in the chain to be invoked.

> **Warning:** Some request headers are forbidden and cannot be overridden (for example, `Cookie`, `Host`, `Content-Length` and others). If an override is provided for a forbidden header, it will be ignored and the original request header will be used. To set custom cookies, use `browserContext.addCookies()`.

---

### `route.fallback(options?)` — Added in: v1.23

Continues route's request with optional overrides. The method is similar to `route.continue()` with the difference that other matching handlers will be invoked before sending the request.

```ts
await page.route('**/*', async (route) => {
  // Runs last.
  await route.abort();
});
await page.route('**/*', async (route) => {
  // Runs second.
  await route.fallback();
});
await page.route('**/*', async (route) => {
  // Runs first.
  await route.fallback();
});
```

```ts
// Modify request while falling back to the subsequent handler
await page.route('**/*', async (route, request) => {
  const headers = {
    ...request.headers(),
    foo: 'foo-value',
    bar: undefined,
  };
  await route.fallback({ headers });
});
```

**Arguments:**

| Parameter          | Type                                          | Description                                                                        |
| ------------------ | --------------------------------------------- | ---------------------------------------------------------------------------------- |
| `options.headers`  | `Object<string, string>` (optional)           | If set, changes the request HTTP headers.                                          |
| `options.method`   | `string` (optional)                           | If set, changes the request method.                                                |
| `options.postData` | `string \| Buffer \| Serializable` (optional) | If set, changes the post data of request.                                          |
| `options.url`      | `string` (optional)                           | If set, changes the request URL. Changing the URL won't affect the route matching. |

**Returns:** `Promise<void>`

---

### `route.fetch(options?)` — Added in: v1.29

Performs the request and fetches result without fulfilling it, so that the response could be modified and then fulfilled.

```ts
await page.route('https://dog.ceo/api/breeds/list/all', async (route) => {
  const response = await route.fetch();
  const json = await response.json();
  json.message['big_red_dog'] = [];
  await route.fulfill({ response, json });
});
```

**Arguments:**

| Parameter              | Type                                          | Description                                                                                                                         |
| ---------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `options.headers`      | `Object<string, string>` (optional)           | If set, changes the request HTTP headers.                                                                                           |
| `options.maxRedirects` | `number` (optional, v1.31)                    | Maximum number of request redirects that will be followed automatically. Defaults to 20. Pass 0 to not follow redirects.            |
| `options.maxRetries`   | `number` (optional, v1.46)                    | Maximum number of times network errors should be retried. Currently only `ECONNRESET` error is retried. Defaults to 0 (no retries). |
| `options.method`       | `string` (optional)                           | If set, changes the request method.                                                                                                 |
| `options.postData`     | `string \| Buffer \| Serializable` (optional) | Allows to set post data of the request.                                                                                             |
| `options.timeout`      | `number` (optional, v1.33)                    | Request timeout in milliseconds. Defaults to 30000. Pass 0 to disable timeout.                                                      |
| `options.url`          | `string` (optional)                           | If set, changes the request URL. New URL must have same protocol as original one.                                                   |

**Returns:** `Promise<APIResponse>`

> **Note:** The `headers` option will apply to the fetched request as well as any redirects initiated by it. If you want to only apply headers to the original request but not to redirects, look into `route.continue()` instead.

---

### `route.fulfill(options?)` — Added before v1.9

Fulfills route's request with given response.

```ts
// Fulfill all requests with 404 responses:
await page.route('**/*', async (route) => {
  await route.fulfill({
    status: 404,
    contentType: 'text/plain',
    body: 'Not Found!',
  });
});

// Serve a static file:
await page.route('**/xhr_endpoint', (route) => route.fulfill({ path: 'mock_data.json' }));
```

**Arguments:**

| Parameter             | Type                                | Description                                                                                               |
| --------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `options.body`        | `string \| Buffer` (optional)       | Response body.                                                                                            |
| `options.contentType` | `string` (optional)                 | If set, equals to setting `Content-Type` response header.                                                 |
| `options.headers`     | `Object<string, string>` (optional) | Response headers. Header values will be converted to a string.                                            |
| `options.json`        | `Serializable` (optional, v1.29)    | JSON response. Sets `content-type` to `application/json` if not set.                                      |
| `options.path`        | `string` (optional)                 | File path to respond with. The content type will be inferred from file extension.                         |
| `options.response`    | `APIResponse` (optional, v1.15)     | `APIResponse` to fulfill route's request with. Individual fields can be overridden using fulfill options. |
| `options.status`      | `number` (optional)                 | Response status code, defaults to 200.                                                                    |

**Returns:** `Promise<void>`

---

### `route.request()` — Added before v1.9

A request to be routed.

```ts
route.request();
```

**Returns:** `Request`
