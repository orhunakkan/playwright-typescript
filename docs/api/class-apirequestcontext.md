# 📦 Playwright — APIRequestContext

> **Source:** [playwright.dev/docs/api/class-apirequestcontext](https://playwright.dev/docs/api/class-apirequestcontext)

---

## Overview

**APIRequestContext** is used for Web API testing. You can use it to trigger API endpoints, configure micro-services, prepare environment or the service to your e2e test.

Each Playwright browser context has associated with it `APIRequestContext` instance which shares cookie storage with the browser context and can be accessed via `browserContext.request` or `page.request`. It is also possible to create a new `APIRequestContext` instance manually by calling `apiRequest.newContext()`.

**Cookie management:** `APIRequestContext` returned by `browserContext.request` and `page.request` shares cookie storage with the corresponding `BrowserContext`. Each API request will have `Cookie` header populated with the values from the browser context. If the API response contains `Set-Cookie` header it will automatically update `BrowserContext` cookies and requests made from the page will pick them up. If you want API requests to not interfere with the browser cookies you should create a new `APIRequestContext` by calling `apiRequest.newContext()`.

---

## Methods

### delete

**Added in:** v1.16

Sends HTTP(S) DELETE request and returns its response. The method will populate request cookies from the context and update context cookies from the response. The method will automatically follow redirects.

```ts
await apiRequestContext.delete(url);
await apiRequestContext.delete(url, options);
```

**Arguments:**

- `url` string — Target URL.
- `options` Object (optional)
  - `data` string | Buffer | Serializable (optional) _(Added in: v1.17)_ — Allows to set post data of the request.
  - `failOnStatusCode` boolean (optional) — Whether to throw on response codes other than 2xx and 3xx.
  - `form` Object\<string, string | number | boolean\> | FormData (optional) _(Added in: v1.17)_ — Provides an object serialized as html form using `application/x-www-form-urlencoded` encoding.
  - `headers` Object\<string, string\> (optional) — Allows to set HTTP headers.
  - `ignoreHTTPSErrors` boolean (optional) — Whether to ignore HTTPS errors. Defaults to `false`.
  - `maxRedirects` number (optional) _(Added in: v1.26)_ — Maximum number of request redirects. Defaults to 20. Pass 0 to not follow redirects.
  - `maxRetries` number (optional) _(Added in: v1.46)_ — Maximum number of times network errors should be retried. Defaults to 0 - no retries.
  - `multipart` FormData | Object (optional) _(Added in: v1.17)_ — Provides an object serialized as html form using `multipart/form-data` encoding.
  - `params` Object\<string, string | number | boolean\> | URLSearchParams | string (optional) — Query parameters to be sent with the URL.
  - `timeout` number (optional) — Request timeout in milliseconds. Defaults to 30000 (30 seconds). Pass 0 to disable timeout.

**Returns:** `Promise<APIResponse>`

---

### dispose

**Added in:** v1.16

All responses returned by `apiRequestContext.get()` and similar methods are stored in the memory, so that you can later call `apiResponse.body()`. This method discards all its resources, calling any method on disposed `APIRequestContext` will throw an exception.

```ts
await apiRequestContext.dispose();
await apiRequestContext.dispose(options);
```

**Arguments:**

- `options` Object (optional)
  - `reason` string (optional) _(Added in: v1.45)_ — The reason to be reported to the operations interrupted by the context disposal.

**Returns:** `Promise<void>`

---

### fetch

**Added in:** v1.16

Sends HTTP(S) request and returns its response. The method will populate request cookies from the context and update context cookies from the response. The method will automatically follow redirects.

```ts
await request.fetch('https://example.com/api/createBook', {
  method: 'post',
  data: {
    title: 'Book Title',
    author: 'John Doe',
  },
});
```

```ts
const form = new FormData();
form.set('name', 'John');
form.append('name', 'Doe');
// Send two file fields with the same name.
form.append('file', new File(['console.log(2024);'], 'f1.js', { type: 'text/javascript' }));
form.append('file', new File(['hello'], 'f2.txt', { type: 'text/plain' }));
await request.fetch('https://example.com/api/uploadForm', { multipart: form });
```

**Arguments:**

- `urlOrRequest` string | Request — Target URL or Request to get all parameters from.
- `options` Object (optional)
  - `data` string | Buffer | Serializable (optional) — Allows to set post data of the request.
  - `failOnStatusCode` boolean (optional) — Whether to throw on response codes other than 2xx and 3xx.
  - `form` Object\<string, string | number | boolean\> | FormData (optional) — Serialized as html form using `application/x-www-form-urlencoded` encoding.
  - `headers` Object\<string, string\> (optional) — Allows to set HTTP headers.
  - `ignoreHTTPSErrors` boolean (optional) — Whether to ignore HTTPS errors. Defaults to `false`.
  - `maxRedirects` number (optional) _(Added in: v1.26)_ — Maximum number of redirects. Defaults to 20.
  - `maxRetries` number (optional) _(Added in: v1.46)_ — Maximum network error retries. Defaults to 0.
  - `method` string (optional) — If set changes the fetch method (e.g. PUT or POST). If not specified, GET method is used.
  - `multipart` FormData | Object (optional) — Serialized as html form using `multipart/form-data` encoding.
  - `params` Object | URLSearchParams | string (optional) — Query parameters to be sent with the URL.
  - `timeout` number (optional) — Request timeout in milliseconds. Defaults to 30000. Pass 0 to disable.

**Returns:** `Promise<APIResponse>`

---

### get

**Added in:** v1.16

Sends HTTP(S) GET request and returns its response. The method will populate request cookies from the context and update context cookies from the response. The method will automatically follow redirects.

```ts
// Passing params as object
await request.get('https://example.com/api/getText', {
  params: {
    isbn: '1234',
    page: 23,
  },
});
// Passing params as URLSearchParams
const searchParams = new URLSearchParams();
searchParams.set('isbn', '1234');
searchParams.append('page', 23);
searchParams.append('page', 24);
await request.get('https://example.com/api/getText', { params: searchParams });
// Passing params as string
const queryString = 'isbn=1234&page=23&page=24';
await request.get('https://example.com/api/getText', { params: queryString });
```

**Arguments:**

- `url` string — Target URL.
- `options` Object (optional) — Same options as `fetch` method except `method`.

**Returns:** `Promise<APIResponse>`

---

### head

**Added in:** v1.16

Sends HTTP(S) HEAD request and returns its response. The method will populate request cookies from the context and update context cookies from the response. The method will automatically follow redirects.

```ts
await apiRequestContext.head(url);
await apiRequestContext.head(url, options);
```

**Arguments:**

- `url` string — Target URL.
- `options` Object (optional) — Same options as `fetch` method except `method`.

**Returns:** `Promise<APIResponse>`

---

### patch

**Added in:** v1.16

Sends HTTP(S) PATCH request and returns its response. The method will populate request cookies from the context and update context cookies from the response. The method will automatically follow redirects.

```ts
await apiRequestContext.patch(url);
await apiRequestContext.patch(url, options);
```

**Arguments:**

- `url` string — Target URL.
- `options` Object (optional) — Same options as `fetch` method except `method`.

**Returns:** `Promise<APIResponse>`

---

### post

**Added in:** v1.16

Sends HTTP(S) POST request and returns its response. The method will populate request cookies from the context and update context cookies from the response. The method will automatically follow redirects.

```ts
await request.post('https://example.com/api/createBook', {
  data: {
    title: 'Book Title',
    author: 'John Doe',
  },
});
```

```ts
await request.post('https://example.com/api/findBook', {
  form: {
    title: 'Book Title',
    author: 'John Doe',
  },
});
```

```ts
const form = new FormData();
form.set('name', 'John');
form.append('name', 'Doe');
// Send two file fields with the same name.
form.append('file', new File(['console.log(2024);'], 'f1.js', { type: 'text/javascript' }));
form.append('file', new File(['hello'], 'f2.txt', { type: 'text/plain' }));
await request.post('https://example.com/api/uploadForm', { multipart: form });
```

**Arguments:**

- `url` string — Target URL.
- `options` Object (optional) — Same options as `fetch` method except `method`.

**Returns:** `Promise<APIResponse>`

---

### put

**Added in:** v1.16

Sends HTTP(S) PUT request and returns its response. The method will populate request cookies from the context and update context cookies from the response. The method will automatically follow redirects.

```ts
await apiRequestContext.put(url);
await apiRequestContext.put(url, options);
```

**Arguments:**

- `url` string — Target URL.
- `options` Object (optional) — Same options as `fetch` method except `method`.

**Returns:** `Promise<APIResponse>`

---

### storageState

**Added in:** v1.16

Returns storage state for this request context, contains current cookies and local storage snapshot if it was passed to the constructor.

```ts
await apiRequestContext.storageState();
await apiRequestContext.storageState(options);
```

**Arguments:**

- `options` Object (optional)
  - `indexedDB` boolean (optional) _(Added in: v1.51)_ — Set to true to include IndexedDB in the storage state snapshot.
  - `path` string (optional) — The file path to save the storage state to. If path is a relative path, then it is resolved relative to current working directory.

**Returns:** `Promise<Object>`

- `cookies` Array\<Object\>
  - `name` string
  - `value` string
  - `domain` string
  - `path` string
  - `expires` number — Unix time in seconds.
  - `httpOnly` boolean
  - `secure` boolean
  - `sameSite` `"Strict" | "Lax" | "None"`
- `origins` Array\<Object\>
  - `origin` string
  - `localStorage` Array\<Object\>
    - `name` string
    - `value` string
