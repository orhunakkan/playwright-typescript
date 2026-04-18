# 📦 Playwright — AndroidSocket

> **Source:** [playwright.dev/docs/api/class-androidsocket](https://playwright.dev/docs/api/class-androidsocket)

---

## Overview

**AndroidSocket** is a way to communicate with a process launched on the `AndroidDevice`. Use `androidDevice.open()` to open a socket.

---

## Methods

### close

**Added in:** v1.9

Closes the socket.

```ts
await androidSocket.close();
```

**Returns:** `Promise<void>`

---

### write

**Added in:** v1.9

Writes some data to the socket.

```ts
await androidSocket.write(data);
```

**Arguments:**

- `data` Buffer — Data to write.

**Returns:** `Promise<void>`

---

## Events

### on('close')

**Added in:** v1.9

Emitted when the socket is closed.

```ts
androidSocket.on('close', (data) => {});
```

---

### on('data')

**Added in:** v1.9

Emitted when data is available to read from the socket.

```ts
androidSocket.on('data', (data) => {});
```

**Event data:** `Buffer`
