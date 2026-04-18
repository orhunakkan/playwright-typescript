# 📦 Playwright — CDPSession

> **Source:** [playwright.dev/docs/api/class-cdpsession](https://playwright.dev/docs/api/class-cdpsession)

---

**CDPSession** instances are used to talk raw Chrome DevTools Protocol:

- Protocol methods can be called with `session.send` method.
- Protocol events can be subscribed to with `session.on` method.

```ts
const client = await page.context().newCDPSession(page);
await client.send('Animation.enable');
client.on('Animation.animationCreated', () => console.log('Animation created!'));
const response = await client.send('Animation.getPlaybackRate');
console.log('playback rate is ' + response.playbackRate);
await client.send('Animation.setPlaybackRate', {
  playbackRate: response.playbackRate / 2,
});
```

---

## Methods

### detach

**Added before:** v1.9

Detaches the CDPSession from the target. Once detached, the CDPSession object won't emit any events and can't be used to send messages.

```ts
await cdpSession.detach();
```

**Returns:** `Promise<void>`

---

### send

**Added before:** v1.9

```ts
await cdpSession.send(method);
await cdpSession.send(method, params);
```

**Arguments:**

- `method` string — Protocol method name.
- `params` Object (optional) — Optional method parameters.

**Returns:** `Promise<Object>`

---

## Events

### on('close')

**Added in:** v1.59

Emitted when the session is closed, either because the target was closed or `session.detach()` was called.

```ts
cdpSession.on('close', (data) => {});
```

**Event data:** `CDPSession`

---

### on('event')

**Added in:** v1.59

Emitted for every CDP event received from the session. Allows subscribing to all CDP events at once without knowing their names ahead of time.

```ts
session.on('event', ({ name, params }) => {
  console.log(`CDP event: ${name}`, params);
});
```

**Event data:** Object

- `method` string — CDP event name.
- `params` Object (optional) — CDP event parameters.
