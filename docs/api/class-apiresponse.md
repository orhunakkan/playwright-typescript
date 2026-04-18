# 📦 Playwright — APIResponse

> **Source:** [playwright.dev/docs/api/class-apiresponse](https://playwright.dev/docs/api/class-apiresponse)

---

**APIResponse** class represents responses returned by `apiRequestContext.get()` and similar methods.

---

## Methods

### body

**Added in:** v1.16

Returns the buffer with response body.

```ts
await apiResponse.body();
```

**Returns:** `Promise<Buffer>`

---

### dispose

**Added in:** v1.16

Disposes the body of this response. If not called then the body will stay in memory until the context closes.

```ts
await apiResponse.dispose();
```

**Returns:** `Promise<void>`

---

### headers

**Added in:** v1.16

An object with all the response HTTP headers associated with this response.

```ts
apiResponse.headers();
```

**Returns:** `Object<string, string>`

---

### headersArray

**Added in:** v1.16

An array with all the response HTTP headers associated with this response. Header names are not lower-cased. Headers with multiple entries, such as `Set-Cookie`, appear in the array multiple times.

```ts
apiResponse.headersArray();
```

**Returns:** `Array<Object>`

- `name` string — Name of the header.
- `value` string — Value of the header.

---

### json

**Added in:** v1.16

Returns the JSON representation of response body. This method will throw if the response body is not parsable via `JSON.parse`.

```ts
await apiResponse.json();
```

**Returns:** `Promise<Serializable>`

---

### ok

**Added in:** v1.16

Contains a boolean stating whether the response was successful (status in the range 200-299) or not.

```ts
apiResponse.ok();
```

**Returns:** `boolean`

---

### status

**Added in:** v1.16

Contains the status code of the response (e.g., 200 for a success).

```ts
apiResponse.status();
```

**Returns:** `number`

---

### statusText

**Added in:** v1.16

Contains the status text of the response (e.g. usually an `"OK"` for a success).

```ts
apiResponse.statusText();
```

**Returns:** `string`

---

### text

**Added in:** v1.16

Returns the text representation of response body.

```ts
await apiResponse.text();
```

**Returns:** `Promise<string>`

---

### url

**Added in:** v1.16

Contains the URL of the response.

```ts
apiResponse.url();
```

**Returns:** `string`
