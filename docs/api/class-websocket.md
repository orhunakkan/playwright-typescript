# 📦 Playwright — WebSocket

> **Source:** [playwright.dev/docs/api/class-websocket](https://playwright.dev/docs/api/class-websocket)

---

## Overview

The **WebSocket** class represents WebSocket connections within a page. It provides the ability to inspect and manipulate the data being transmitted and received.

> **Note:** If you want to intercept or modify WebSocket frames, consider using `WebSocketRoute`.

## Methods

### `isClosed()` — Added before v1.9

Indicates that the web socket has been closed.

```ts
webSocket.isClosed();
```

**Returns:** `boolean`

---

### `url()` — Added before v1.9

Contains the URL of the WebSocket.

```ts
webSocket.url();
```

**Returns:** `string`

---

### `waitForEvent()` — Added before v1.9

Waits for event to fire and passes its value into the predicate function. Returns when the predicate returns truthy value. Will throw an error if the webSocket is closed before the event is fired. Returns the event data value.

```ts
await webSocket.waitForEvent(event);
await webSocket.waitForEvent(event, optionsOrPredicate, options);
```

**Arguments:**

- `event` `string` — Event name, same one would pass into `webSocket.on(event)`.
- `optionsOrPredicate` `function | Object` _(optional)_ — Either a predicate that receives an event or an options object.
  - `predicate` `function` — Receives the event data and resolves to truthy value when the waiting should resolve.
  - `timeout` `number` _(optional)_ — Maximum time to wait for in milliseconds. Defaults to `0` (no timeout). The default value can be changed via `actionTimeout` option in the config, or by using `browserContext.setDefaultTimeout()` or `page.setDefaultTimeout()`.
- `options` `Object` _(optional)_
  - `predicate` `function` _(optional)_ — Receives the event data and resolves to truthy value when the waiting should resolve.

**Returns:** `Promise<Object>`

## Events

### `on('close')` — Added before v1.9

Fired when the websocket closes.

```ts
webSocket.on('close', (data) => {});
```

**Event data:** `WebSocket`

---

### `on('framereceived')` — Added in: v1.9

Fired when the websocket receives a frame.

```ts
webSocket.on('framereceived', (data) => {});
```

**Event data:** `Object`

- `payload` `string | Buffer` — Frame payload.

---

### `on('framesent')` — Added in: v1.9

Fired when the websocket sends a frame.

```ts
webSocket.on('framesent', (data) => {});
```

**Event data:** `Object`

- `payload` `string | Buffer` — Frame payload.

---

### `on('socketerror')` — Added in: v1.9

Fired when the websocket has an error.

```ts
webSocket.on('socketerror', (data) => {});
```

**Event data:** `string`
