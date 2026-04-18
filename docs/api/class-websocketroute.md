# 📦 Playwright — WebSocketRoute

> **Source:** [playwright.dev/docs/api/class-websocketroute](https://playwright.dev/docs/api/class-websocketroute)

---

Whenever a WebSocket route is set up with `page.routeWebSocket()` or `browserContext.routeWebSocket()`, the **WebSocketRoute** object allows handling the WebSocket, like an actual server would do.

## Mocking

By default, the routed WebSocket will not connect to the server. This way, you can mock entire communication over the WebSocket. Here is an example that responds to a `"request"` with a `"response"`:

```ts
await page.routeWebSocket('wss://example.com/ws', (ws) => {
  ws.onMessage((message) => {
    if (message === 'request') ws.send('response');
  });
});
```

Since we do not call `webSocketRoute.connectToServer()` inside the WebSocket route handler, Playwright assumes that WebSocket will be mocked, and opens the WebSocket inside the page automatically.

Here is another example that handles JSON messages:

```ts
await page.routeWebSocket('wss://example.com/ws', (ws) => {
  ws.onMessage((message) => {
    const json = JSON.parse(message);
    if (json.request === 'question') ws.send(JSON.stringify({ response: 'answer' }));
  });
});
```

## Intercepting

Alternatively, you may want to connect to the actual server, but intercept messages in-between and modify or block them. Calling `webSocketRoute.connectToServer()` returns a server-side `WebSocketRoute` instance that you can send messages to, or handle incoming messages.

Below is an example that modifies some messages sent by the page to the server. Messages sent from the server to the page are left intact, relying on the default forwarding:

```ts
await page.routeWebSocket('/ws', (ws) => {
  const server = ws.connectToServer();
  ws.onMessage((message) => {
    if (message === 'request') server.send('request2');
    else server.send(message);
  });
});
```

After connecting to the server, all messages are forwarded between the page and the server by default. However, if you call `webSocketRoute.onMessage()` on the original route, messages from the page to the server will not be forwarded anymore, but should instead be handled by the handler. Similarly, calling `webSocketRoute.onMessage()` on the server-side WebSocket will stop forwarding messages from the server to the page.

The following example blocks some messages in both directions. Since it calls `webSocketRoute.onMessage()` in both directions, there is no automatic forwarding at all:

```ts
await page.routeWebSocket('/ws', (ws) => {
  const server = ws.connectToServer();
  ws.onMessage((message) => {
    if (message !== 'blocked-from-the-page') server.send(message);
  });
  server.onMessage((message) => {
    if (message !== 'blocked-from-the-server') ws.send(message);
  });
});
```

## Methods

### `close()` — Added in: v1.48

Closes one side of the WebSocket connection.

```ts
await webSocketRoute.close();
await webSocketRoute.close(options);
```

**Arguments:**

- `options` `Object` _(optional)_
  - `code` `number` _(optional)_ — Optional close code.
  - `reason` `string` _(optional)_ — Optional close reason.

**Returns:** `Promise<void>`

---

### `connectToServer()` — Added in: v1.48

By default, routed WebSocket does not connect to the server, so you can mock entire WebSocket communication. This method connects to the actual WebSocket server, and returns the server-side `WebSocketRoute` instance, giving the ability to send and receive messages from the server.

Once connected to the server:

- Messages received from the server will be automatically forwarded to the WebSocket in the page, unless `webSocketRoute.onMessage()` is called on the server-side `WebSocketRoute`.
- Messages sent by the `WebSocket.send()` call in the page will be automatically forwarded to the server, unless `webSocketRoute.onMessage()` is called on the original `WebSocketRoute`.

```ts
webSocketRoute.connectToServer();
```

**Returns:** `WebSocketRoute`

---

### `onClose()` — Added in: v1.48

Allows handling `WebSocket.close`. By default, closing one side of the connection, either in the page or on the server, will close the other side. However, when `webSocketRoute.onClose()` handler is set up, the default forwarding of closure is disabled, and handler should take care of it.

```ts
webSocketRoute.onClose(handler);
```

**Arguments:**

- `handler` `function(number | undefined): Promise<Object> | Object` — Function that will handle WebSocket closure. Receives an optional close code and an optional close reason.

---

### `onMessage()` — Added in: v1.48

This method allows handling messages that are sent by the WebSocket, either from the page or from the server. When called on the original WebSocket route, this method handles messages sent from the page. You can handle these messages by responding to them with `webSocketRoute.send()`, forwarding them to the server-side connection returned by `webSocketRoute.connectToServer()`, or doing something else.

Once this method is called, messages are not automatically forwarded to the server or to the page — you should do that manually by calling `webSocketRoute.send()`. Calling this method again will override the handler with a new one.

```ts
webSocketRoute.onMessage(handler);
```

**Arguments:**

- `handler` `function(string): Promise<Object> | Object` — Function that will handle messages.

---

### `send()` — Added in: v1.48

Sends a message to the WebSocket. When called on the original WebSocket, sends the message to the page. When called on the result of `webSocketRoute.connectToServer()`, sends the message to the server.

```ts
webSocketRoute.send(message);
```

**Arguments:**

- `message` `string | Buffer` — Message to send.

---

### `url()` — Added in: v1.48

URL of the WebSocket created in the page.

```ts
webSocketRoute.url();
```

**Returns:** `string`
