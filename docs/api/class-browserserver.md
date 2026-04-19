# 📦 Playwright — BrowserServer

> **Source:** [playwright.dev/docs/api/class-browserserver](https://playwright.dev/docs/api/class-browserserver)

---

## Methods

### close

**Added before:** v1.9

Closes the browser gracefully and makes sure the process is terminated.

```ts
await browserServer.close();
```

**Returns:** `Promise<void>`

### kill

**Added before:** v1.9

Kills the browser process and waits for the process to exit.

```ts
await browserServer.kill();
```

**Returns:** `Promise<void>`

### process

**Added before:** v1.9

Spawned browser application process.

```ts
browserServer.process();
```

**Returns:** `ChildProcess`

### wsEndpoint

**Added before:** v1.9

Browser websocket endpoint which can be used as an argument to `browserType.connect()` to establish connection to the browser.

> **Note:** If the listen host option in `launchServer` options is not specified, localhost will be output anyway, even if the actual listening address is an unspecified address.

```ts
browserServer.wsEndpoint();
```

**Returns:** `string`

## Events

### on('close')

**Added before:** v1.9

Emitted when the browser server closes.

```ts
browserServer.on('close', (data) => {});
```
