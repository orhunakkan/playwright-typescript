# 📦 Playwright — Request

> **Source:** [playwright.dev/docs/api/class-request](https://playwright.dev/docs/api/class-request)

---

Whenever the page sends a request for a network resource the following sequence of events are emitted by `Page`:

- `page.on('request')` — emitted when the request is issued by the page.
- `page.on('response')` — emitted when/if the response status and headers are received for the request.
- `page.on('requestfinished')` — emitted when the response body is downloaded and the request is complete.
- `page.on('requestfailed')` — emitted if the request fails at some point.

> **Note:** HTTP Error responses, such as 404 or 503, are still successful responses from HTTP standpoint, so request will complete with `'requestfinished'` event. If request gets a `'redirect'` response, the request is successfully finished with the `requestfinished` event, and a new request is issued to a redirected url.

## Methods

## Methods

### `request.allHeaders()` — Added in: v1.15

An object with all the request HTTP headers associated with this request. The header names are lower-cased.

```ts
await request.allHeaders();
```

**Returns:** `Promise<Object<string, string>>`

### `request.existingResponse()` — Added in: v1.59

Returns the `Response` object if the response has already been received, `null` otherwise. Unlike `request.response()`, this method does not wait for the response to arrive.

```ts
request.existingResponse();
```

**Returns:** `null | Response`

### `request.failure()` — Added before v1.9

The method returns `null` unless this request has failed, as reported by `requestfailed` event.

```ts
page.on('requestfailed', (request) => {
  console.log(request.url() + ' ' + request.failure().errorText);
});
```

**Returns:** `null | Object`

| Property    | Type     | Description                                             |
| ----------- | -------- | ------------------------------------------------------- |
| `errorText` | `string` | Human-readable error message, e.g. `'net::ERR_FAILED'`. |

### `request.frame()` — Added before v1.9

Returns the `Frame` that initiated this request.

```ts
const frameUrl = request.frame().url();
```

**Returns:** `Frame`

> **Note:** In some cases the frame is not available and this method will throw: when request originates in the Service Worker (use `request.serviceWorker()` to check), or when navigation request is issued before the corresponding frame is created (use `request.isNavigationRequest()` to check).

```ts
if (request.serviceWorker()) console.log(`request ${request.url()} from a service worker`);
else if (request.isNavigationRequest()) console.log(`request ${request.url()} is a navigation request`);
else console.log(`request ${request.url()} from a frame ${request.frame().url()}`);
```

### `request.headerValue(name)` — Added in: v1.15

Returns the value of the header matching the name. The name is case-insensitive.

```ts
await request.headerValue(name);
```

**Arguments:**

| Parameter | Type     | Description         |
| --------- | -------- | ------------------- |
| `name`    | `string` | Name of the header. |

**Returns:** `Promise<null | string>`

### `request.headers()` — Added before v1.9

An object with the request HTTP headers. The header names are lower-cased. Note that this method does not return security-related headers, including cookie-related ones. You can use `request.allHeaders()` for complete list of headers that include cookie information.

```ts
request.headers();
```

**Returns:** `Object<string, string>`

### `request.headersArray()` — Added in: v1.15

An array with all the request HTTP headers associated with this request. Unlike `request.allHeaders()`, header names are NOT lower-cased. Headers with multiple entries, such as `Set-Cookie`, appear in the array multiple times.

```ts
await request.headersArray();
```

**Returns:** `Promise<Array<Object>>`

| Property | Type     | Description          |
| -------- | -------- | -------------------- |
| `name`   | `string` | Name of the header.  |
| `value`  | `string` | Value of the header. |

### `request.isNavigationRequest()` — Added before v1.9

Whether this request is driving frame's navigation. Some navigation requests are issued before the corresponding frame is created, and therefore do not have `request.frame()` available.

```ts
request.isNavigationRequest();
```

**Returns:** `boolean`

### `request.method()` — Added before v1.9

Request's method (GET, POST, etc.)

```ts
request.method();
```

**Returns:** `string`

### `request.postData()` — Added before v1.9

Request's post body, if any.

```ts
request.postData();
```

**Returns:** `null | string`

### `request.postDataBuffer()` — Added before v1.9

Request's post body in a binary form, if any.

```ts
request.postDataBuffer();
```

**Returns:** `null | Buffer`

### `request.postDataJSON()` — Added before v1.9

Returns parsed request's body for `form-urlencoded` and JSON as a fallback if any. When the response is `application/x-www-form-urlencoded` then a key/value object of the values will be returned. Otherwise it will be parsed as JSON.

```ts
request.postDataJSON();
```

**Returns:** `null | Serializable`

### `request.redirectedFrom()` — Added before v1.9

Request that was redirected by the server to this one, if any. When the server responds with a redirect, Playwright creates a new `Request` object. The two requests are connected by `redirectedFrom()` and `redirectedTo()` methods.

```ts
// If the website http://example.com redirects to https://example.com:
const response = await page.goto('http://example.com');
console.log(response.request().redirectedFrom().url()); // 'http://example.com'
```

**Returns:** `null | Request`

### `request.redirectedTo()` — Added before v1.9

New request issued by the browser if the server responded with redirect. This method is the opposite of `request.redirectedFrom()`.

```ts
console.log(request.redirectedFrom().redirectedTo() === request); // true
```

**Returns:** `null | Request`

### `request.resourceType()` — Added before v1.9

Contains the request's resource type as it was perceived by the rendering engine. ResourceType will be one of the following: `document`, `stylesheet`, `image`, `media`, `font`, `script`, `texttrack`, `xhr`, `fetch`, `eventsource`, `websocket`, `manifest`, `other`.

```ts
request.resourceType();
```

**Returns:** `string`

### `request.response()` — Added before v1.9

Returns the matching `Response` object, or `null` if the response was not received due to error.

```ts
await request.response();
```

**Returns:** `Promise<null | Response>`

### `request.serviceWorker()` — Added in: v1.24

The Service Worker that is performing the request.

```ts
request.serviceWorker();
```

**Returns:** `null | Worker`

> **Note:** This method is Chromium only. It's safe to call when using other browsers, but it will always be `null`. Requests originated in a Service Worker do not have a `request.frame()` available.

### `request.sizes()` — Added in: v1.15

Returns resource size information for given request.

```ts
await request.sizes();
```

**Returns:** `Promise<Object>`

| Property              | Type     | Description                                                                                                              |
| --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `requestBodySize`     | `number` | Size of the request body (POST data payload) in bytes. Set to 0 if there was no body.                                    |
| `requestHeadersSize`  | `number` | Total number of bytes from the start of the HTTP request message until (and including) the double CRLF before the body.  |
| `responseBodySize`    | `number` | Size of the received response body (encoded) in bytes.                                                                   |
| `responseHeadersSize` | `number` | Total number of bytes from the start of the HTTP response message until (and including) the double CRLF before the body. |

### `request.timing()` — Added before v1.9

Returns resource timing information for given request. Most of the timing values become available upon the response, `responseEnd` becomes available when request finishes.

```ts
const requestFinishedPromise = page.waitForEvent('requestfinished');
await page.goto('http://example.com');
const request = await requestFinishedPromise;
console.log(request.timing());
```

**Returns:** `Object`

| Property                | Type     | Description                                                                                                                                                                       |
| ----------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `startTime`             | `number` | Request start time in milliseconds elapsed since January 1, 1970 00:00:00 UTC.                                                                                                    |
| `domainLookupStart`     | `number` | Time immediately before the browser starts the domain name lookup. Relative to `startTime`, -1 if not available.                                                                  |
| `domainLookupEnd`       | `number` | Time immediately after the browser starts the domain name lookup. Relative to `startTime`, -1 if not available.                                                                   |
| `connectStart`          | `number` | Time immediately before the user agent starts establishing the connection to the server. Relative to `startTime`, -1 if not available.                                            |
| `secureConnectionStart` | `number` | Time immediately before the browser starts the handshake process to secure the current connection. Relative to `startTime`, -1 if not available.                                  |
| `connectEnd`            | `number` | Time immediately before the user agent starts establishing the connection to the server to retrieve the resource. Relative to `startTime`, -1 if not available.                   |
| `requestStart`          | `number` | Time immediately before the browser starts requesting the resource from the server, cache, or local resource. Relative to `startTime`, -1 if not available.                       |
| `responseStart`         | `number` | Time immediately after the browser receives the first byte of the response. Relative to `startTime`, -1 if not available.                                                         |
| `responseEnd`           | `number` | Time immediately after the browser receives the last byte of the resource or immediately before the transport connection is closed. Relative to `startTime`, -1 if not available. |

### `request.url()` — Added before v1.9

URL of the request.

```ts
request.url();
```

**Returns:** `string`
