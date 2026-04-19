# ⚙️ Playwright — Service Workers

> **Source:** [playwright.dev/docs/service-workers](https://playwright.dev/docs/service-workers)

---

## Introduction

> **Warning:** Service workers are only supported on Chromium-based browsers.

> **Note:** If you're looking to do general network mocking, routing, and interception, please see the Network Guide first. Playwright provides built-in APIs for this use case that don't require the information below. However, if you're interested in requests made by Service Workers themselves, please read below.

Service Workers provide a browser-native method of handling requests made by a page with the native Fetch API (`fetch`) along with other network-requested assets (like scripts, css, and images). They can act as a network proxy between the page and the external network to perform caching logic or can provide users with an offline experience if the Service Worker adds a `FetchEvent` listener. Many sites that use Service Workers simply use them as a transparent optimization technique. While users might notice a faster experience, the app's implementation is unaware of their existence. Running the app with or without Service Workers enabled appears functionally equivalent.

## How to Disable Service Workers

Playwright allows to disable Service Workers during testing. This makes tests more predictable and performant. However, if your actual page uses a Service Worker, the behavior might be different. To disable service workers, set `testOptions.serviceWorkers` to `'block'`.

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  use: { serviceWorkers: 'allow' },
});
```

## Accessing Service Workers and Waiting for Activation

You can use `browserContext.serviceWorkers()` to list the Service Workers, or specifically watch for the Service Worker if you anticipate a page will trigger its registration:

```ts
const serviceWorkerPromise = context.waitForEvent('serviceworker');
await page.goto('/example-with-a-service-worker.html');
const serviceworker = await serviceWorkerPromise;
```

`browserContext.on('serviceworker')` event is fired before the Service Worker has taken control over the page, so before evaluating in the worker with `worker.evaluate()` you should wait on its activation. There are more idiomatic methods of waiting for a Service Worker to be activated, but the following is an implementation agnostic method:

```ts
await page.evaluate(async () => {
  const registration = await window.navigator.serviceWorker.getRegistration();
  if (registration.active?.state === 'activated') return;
  await new Promise((resolve) => {
    window.navigator.serviceWorker.addEventListener('controllerchange', resolve);
  });
});
```

## Network Events and Routing

Any network request made by the Service Worker is reported through the `BrowserContext` object:

- `browserContext.on('request')`, `browserContext.on('requestfinished')`, `browserContext.on('response')` and `browserContext.on('requestfailed')` are fired
- `browserContext.route()` sees the request
- `request.serviceWorker()` will be set to the Service Worker instance, and `request.frame()` will throw

Additionally, for any network request made by the Page, method `response.fromServiceWorker()` returns `true` when the request was handled by a Service Worker's fetch handler.

Consider a simple service worker that fetches every request made by the page:

```js
// transparent-service-worker.js
self.addEventListener('fetch', (event) => {
  // actually make the request
  const responsePromise = fetch(event.request);
  // send it back to the page
  event.respondWith(responsePromise);
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
```

If `index.html` registers this service worker, and then fetches `data.json`, the following Request/Response events would be emitted (along with the corresponding network lifecycle events):

| Event                          | Owner          | URL                             | Routed | `response.fromServiceWorker()` |
| ------------------------------ | -------------- | ------------------------------- | ------ | ------------------------------ |
| `browserContext.on('request')` | Frame          | `index.html`                    | Yes    | No                             |
| `page.on('request')`           | Frame          | `index.html`                    | Yes    | No                             |
| `browserContext.on('request')` | Service Worker | `transparent-service-worker.js` | Yes    | N/A                            |
| `browserContext.on('request')` | Service Worker | `data.json`                     | Yes    | N/A                            |
| `browserContext.on('request')` | Frame          | `data.json`                     | Yes    | Yes                            |
| `page.on('request')`           | Frame          | `data.json`                     | Yes    | Yes                            |

Since the example Service Worker just acts a basic transparent "proxy":

- There's 2 `browserContext.on('request')` events for `data.json`; one Frame-owned, the other Service Worker-owned.
- Only the Service Worker-owned request for the resource was routable via `browserContext.route()`; the Frame-owned events for `data.json` are not routeable, as they would not have even had the possibility to hit the external network since the Service Worker has a fetch handler registered.

> **Caution:** It's important to note: calling `request.frame()` or `response.frame()` will throw an exception, if called on a Request/Response that has a non-null `request.serviceWorker()`.

## Routing Service Worker Requests Only

```ts
await context.route('**', async (route) => {
  if (route.request().serviceWorker()) {
    // NB: calling route.request().frame() here would THROW
    await route.fulfill({
      contentType: 'text/plain',
      status: 200,
      body: 'from sw',
    });
  } else {
    await route.continue();
  }
});
```

## Known Limitations

Requests for updated Service Worker main script code currently cannot be routed (https://github.com/microsoft/playwright/issues/14711).
