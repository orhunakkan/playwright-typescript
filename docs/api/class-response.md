# 📦 Playwright — Response

> **Source:** [playwright.dev/docs/api/class-response](https://playwright.dev/docs/api/class-response)

---

## Overview

**Response** class represents responses which are received by page.

---

### `response.allHeaders()` — Added in: v1.15

An object with all the response HTTP headers associated with this response.

```ts
await response.allHeaders();
```

**Returns:** `Promise<Object<string, string>>`

---

### `response.body()` — Added before v1.9

Returns the buffer with response body.

```ts
await response.body();
```

**Returns:** `Promise<Buffer>`

---

### `response.finished()` — Added before v1.9

Waits for this response to finish, returns always `null`.

```ts
await response.finished();
```

**Returns:** `Promise<null | Error>`

---

### `response.frame()` — Added before v1.9

Returns the `Frame` that initiated this response.

```ts
response.frame();
```

**Returns:** `Frame`

---

### `response.fromServiceWorker()` — Added in: v1.23

Indicates whether this Response was fulfilled by a Service Worker's Fetch Handler (i.e. via `FetchEvent.respondWith`).

```ts
response.fromServiceWorker();
```

**Returns:** `boolean`

---

### `response.headerValue(name)` — Added in: v1.15

Returns the value of the header matching the name. The name is case-insensitive. If multiple headers have the same name (except `set-cookie`), they are returned as a list separated by `, `. For `set-cookie`, the `\n` separator is used. If no headers are found, `null` is returned.

```ts
await response.headerValue(name);
```

**Arguments:**

| Parameter | Type     | Description         |
| --------- | -------- | ------------------- |
| `name`    | `string` | Name of the header. |

**Returns:** `Promise<null | string>`

---

### `response.headerValues(name)` — Added in: v1.15

Returns all values of the headers matching the name, for example `set-cookie`. The name is case-insensitive.

```ts
await response.headerValues(name);
```

**Arguments:**

| Parameter | Type     | Description         |
| --------- | -------- | ------------------- |
| `name`    | `string` | Name of the header. |

**Returns:** `Promise<Array<string>>`

---

### `response.headers()` — Added before v1.9

An object with the response HTTP headers. The header names are lower-cased. Note that this method does not return security-related headers, including cookie-related ones. You can use `response.allHeaders()` for complete list of headers that include cookie information.

```ts
response.headers();
```

**Returns:** `Object<string, string>`

---

### `response.headersArray()` — Added in: v1.15

An array with all the request HTTP headers associated with this response. Unlike `response.allHeaders()`, header names are NOT lower-cased. Headers with multiple entries, such as `Set-Cookie`, appear in the array multiple times.

```ts
await response.headersArray();
```

**Returns:** `Promise<Array<Object>>`

| Property | Type     | Description          |
| -------- | -------- | -------------------- |
| `name`   | `string` | Name of the header.  |
| `value`  | `string` | Value of the header. |

---

### `response.httpVersion()` — Added in: v1.59

Returns the http version used by the response.

```ts
await response.httpVersion();
```

**Returns:** `Promise<string>`

---

### `response.json()` — Added before v1.9

Returns the JSON representation of response body. This method will throw if the response body is not parsable via `JSON.parse`.

```ts
await response.json();
```

**Returns:** `Promise<Serializable>`

---

### `response.ok()` — Added before v1.9

Contains a boolean stating whether the response was successful (status in the range 200-299) or not.

```ts
response.ok();
```

**Returns:** `boolean`

---

### `response.request()` — Added before v1.9

Returns the matching `Request` object.

```ts
response.request();
```

**Returns:** `Request`

---

### `response.securityDetails()` — Added in: v1.13

Returns SSL and other security information.

```ts
await response.securityDetails();
```

**Returns:** `Promise<null | Object>`

| Property      | Type                | Description                                                            |
| ------------- | ------------------- | ---------------------------------------------------------------------- |
| `issuer`      | `string` (optional) | Common Name component of the Issuer field from the certificate.        |
| `protocol`    | `string` (optional) | The specific TLS protocol used (e.g. `TLS 1.3`).                       |
| `subjectName` | `string` (optional) | Common Name component of the Subject field from the certificate.       |
| `validFrom`   | `number` (optional) | Unix timestamp (in seconds) specifying when this cert becomes valid.   |
| `validTo`     | `number` (optional) | Unix timestamp (in seconds) specifying when this cert becomes invalid. |

---

### `response.serverAddr()` — Added in: v1.13

Returns the IP address and port of the server.

```ts
await response.serverAddr();
```

**Returns:** `Promise<null | Object>`

| Property    | Type     | Description                         |
| ----------- | -------- | ----------------------------------- |
| `ipAddress` | `string` | IPv4 or IPv6 address of the server. |
| `port`      | `number` | Port number.                        |

---

### `response.status()` — Added before v1.9

Contains the status code of the response (e.g., 200 for a success).

```ts
response.status();
```

**Returns:** `number`

---

### `response.statusText()` — Added before v1.9

Contains the status text of the response (e.g. usually an `"OK"` for a success).

```ts
response.statusText();
```

**Returns:** `string`

---

### `response.text()` — Added before v1.9

Returns the text representation of response body.

```ts
await response.text();
```

**Returns:** `Promise<string>`

---

### `response.url()` — Added before v1.9

Contains the URL of the response.

```ts
response.url();
```

**Returns:** `string`
