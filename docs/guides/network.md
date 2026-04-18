# 🌐 Playwright — Network

> **Source:** [playwright.dev/docs/network](https://playwright.dev/docs/network)

---

## 📖 Introduction

Playwright provides APIs to monitor and modify browser network traffic, both HTTP and HTTPS. Any requests that a page does, including XHRs and fetch requests, can be tracked, modified and handled.

---

## 🎭 Mock APIs

Check out our API mocking guide to learn more on how to:

- Mock API requests and never hit the API
- Perform the API request and modify the response
- Use HAR files to mock network requests

---

## 🚫 Network mocking

You don't have to configure anything to mock network requests. Just define a custom Route that mocks network for a browser context.

```ts
// example.spec.ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  // Block any css requests for each test in this file.
  await context.route(/.css$/, (route) => route.abort());
});

test('loads page without css', async ({ page }) => {
  await page.goto('https://playwright.dev');
  // ... test goes here
});
```

Alternatively, you can use `page.route()` to mock network in a single page.

```ts
// example.spec.ts
import { test, expect } from '@playwright/test';

test('loads page without images', async ({ page }) => {
  // Block png and jpeg images.
  await page.route(/(png|jpeg)$/, (route) => route.abort());
  await page.goto('https://playwright.dev');
  // ... test goes here
});
```

---

## 🔐 HTTP Authentication

Perform HTTP Authentication with `httpCredentials` in config or context options.

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    httpCredentials: {
      username: 'bill',
      password: 'pa55w0rd',
    },
  },
});
```

Or using the library directly:

```ts
const context = await browser.newContext({
  httpCredentials: {
    username: 'bill',
    password: 'pa55w0rd',
  },
});
const page = await context.newPage();
await page.goto('https://example.com');
```

---

## 🌍 HTTP Proxy

You can configure pages to load over the HTTP(S) proxy or SOCKSv5. Proxy can be either set globally for the entire browser, or for each browser context individually. You can optionally specify username and password for HTTP(S) proxy, you can also specify hosts to bypass the proxy for.

Here is an example of a global proxy:

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    proxy: {
      server: 'http://myproxy.com:3128',
      username: 'usr',
      password: 'pwd',
    },
  },
});
```

Or using the library directly:

```ts
const browser = await chromium.launch({
  proxy: {
    server: 'http://myproxy.com:3128',
    username: 'usr',
    password: 'pwd',
  },
});
```

It is also possible to specify it per context:

```ts
// example.spec.ts
import { test, expect } from '@playwright/test';

test('should use custom proxy on a new context', async ({ browser }) => {
  const context = await browser.newContext({
    proxy: {
      server: 'http://myproxy.com:3128',
    },
  });
  const page = await context.newPage();
  await context.close();
});
```

Or using the library directly:

```ts
const browser = await chromium.launch();
const context = await browser.newContext({
  proxy: { server: 'http://myproxy.com:3128' },
});
```

---

## 📡 Network events

You can monitor all the Requests and Responses:

```ts
// Subscribe to 'request' and 'response' events.
page.on('request', (request) => console.log('>>', request.method(), request.url()));
page.on('response', (response) => console.log('<<', response.status(), response.url()));
await page.goto('https://example.com');
```

Or wait for a network response after the button click with `page.waitForResponse()`:

```ts
// Use a glob URL pattern. Note no await.
const responsePromise = page.waitForResponse('**/api/fetch_data');
await page.getByText('Update').click();
const response = await responsePromise;
```

### Variations

```ts
// Use a RegExp. Note no await.
const responsePromise = page.waitForResponse(/\.jpeg$/);
await page.getByText('Update').click();
const response = await responsePromise;

// Use a predicate taking a Response object. Note no await.
const responsePromise = page.waitForResponse((response) => response.url().includes(token));
await page.getByText('Update').click();
const response = await responsePromise;
```

---

## 🛠️ Handle requests

You can mock API endpoints via handling the network requests in your Playwright script.

```ts
await page.route('**/api/fetch_data', (route) =>
  route.fulfill({
    status: 200,
    body: testData,
  })
);
await page.goto('https://example.com');
```

### Variations

Set up route on the entire browser context with `browserContext.route()` or page with `page.route()`. It will apply to popup windows and opened links.

```ts
await browserContext.route('**/api/login', (route) =>
  route.fulfill({
    status: 200,
    body: 'accept',
  })
);
await page.goto('https://example.com');
```

---

## ✏️ Modify requests

You can continue requests with modifications. The example below removes an HTTP header from the outgoing requests.

```ts
// Delete header
await page.route('**/*', async (route) => {
  const headers = route.request().headers();
  delete headers['X-Secret'];
  await route.continue({ headers });
});

// Continue requests as POST.
await page.route('**/*', (route) => route.continue({ method: 'POST' }));
```

---

## ❌ Abort requests

You can abort requests using `page.route()` and `route.abort()`.

```ts
await page.route('**/*.{png,jpg,jpeg}', (route) => route.abort());

// Abort based on the request type
await page.route('**/*', (route) => {
  return route.request().resourceType() === 'image' ? route.abort() : route.continue();
});
```

---

## 🔄 Modify responses

To modify a response use `APIRequestContext` to get the original response and then pass the response to `route.fulfill()`. You can override individual fields on the response via options:

```ts
await page.route('**/title.html', async (route) => {
  // Fetch original response.
  const response = await route.fetch();
  // Add a prefix to the title.
  let body = await response.text();
  body = body.replace('<title>', '<title>My prefix:');
  await route.fulfill({
    // Pass all fields from the response.
    response,
    // Override response body.
    body,
    // Force content type to be html.
    headers: {
      ...response.headers(),
      'content-type': 'text/html',
    },
  });
});
```

---

## 🔣 Glob URL patterns

Playwright uses simplified glob patterns for URL matching in network interception methods like `page.route()` or `page.waitForResponse()`. These patterns support basic wildcards:

- **Asterisks:** A single `*` matches any characters except `/`; a double `**` matches any characters including `/`
- **Question mark** `?` matches only the question mark `?` character — use `*` to match any character
- **Curly braces** `{}` can be used to match a list of options separated by commas `,`
- **Backslash** `\` can be used to escape any special character (escape backslash itself as `\\`)

Examples:

- `https://example.com/*.js` matches `https://example.com/file.js` but not `https://example.com/path/file.js`
- `https://example.com/?page=1` matches `https://example.com/?page=1` but not `https://example.com`
- `**/*.js` matches both `https://example.com/file.js` and `https://example.com/path/file.js`
- `**/*.{png,jpg,jpeg}` matches all image requests

> **Note:** The glob pattern must match the entire URL, not just a part of it. For more complex matching requirements, consider using RegExp instead of glob patterns.

---

## 🔌 WebSockets

Playwright supports WebSockets inspection, mocking and modifying out of the box. See our API mocking guide to learn how to mock WebSockets. Every time a WebSocket is created, the `page.on('websocket')` event is fired. This event contains the WebSocket instance for further web socket frames inspection:

```ts
page.on('websocket', (ws) => {
  console.log(`WebSocket opened: ${ws.url()}>`);
  ws.on('framesent', (event) => console.log(event.payload));
  ws.on('framereceived', (event) => console.log(event.payload));
  ws.on('close', () => console.log('WebSocket closed'));
});
```

---

## ⚠️ Missing Network Events and Service Workers

Playwright's built-in `browserContext.route()` and `page.route()` allow your tests to natively route requests and perform mocking and interception.

If you're using Playwright's native routing and it appears network events are missing, disable Service Workers by setting `serviceWorkers` to `'block'`. It might be that you are using a mock tool such as Mock Service Worker (MSW). While this tool works out of the box for mocking responses, it adds its own Service Worker that takes over the network requests, hence making them invisible to `browserContext.route()` and `page.route()`.

If you are interested in both network testing and mocking, consider using built-in `browserContext.route()` and `page.route()` for response mocking. If you're interested in routing and listening for requests made by Service Workers themselves, please see the dedicated
export default defineConfig({
use: {
httpCredentials: {
username: 'bill',
password: 'pa55w0rd',
}
}
});

````

Or using the library directly:

```ts
const context = await browser.newContext({
  httpCredentials: {
    username: 'bill',
    password: 'pa55w0rd',
  },
});
const page = await context.newPage();
await page.goto('https://example.com');
````

---

## 🌍 HTTP Proxy

You can configure pages to load over the HTTP(S) proxy or SOCKSv5. Proxy can be either set globally for the entire browser, or for each browser context individually. You can optionally specify username and password for HTTP(S) proxy, you can also specify hosts to bypass the proxy for.

Here is an example of a global proxy:

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    proxy: {
      server: 'http://myproxy.com:3128',
      username: 'usr',
      password: 'pwd',
    },
  },
});
```

Or using the library directly:

```ts
const browser = await chromium.launch({
  proxy: {
    server: 'http://myproxy.com:3128',
    username: 'usr',
    password: 'pwd',
  },
});
```

It is also possible to specify it per context:

```ts
// example.spec.ts
import { test, expect } from '@playwright/test';

test('should use custom proxy on a new context', async ({ browser }) => {
  const context = await browser.newContext({
    proxy: {
      server: 'http://myproxy.com:3128',
    },
  });
  const page = await context.newPage();
  await context.close();
});
```

Or using the library directly:

```ts
const browser = await chromium.launch();
const context = await browser.newContext({
  proxy: { server: 'http://myproxy.com:3128' },
});
```

---

## 📡 Network events

You can monitor all the Requests and Responses:

```ts
// Subscribe to 'request' and 'response' events.
page.on('request', (request) => console.log('>>', request.method(), request.url()));
page.on('response', (response) => console.log('<<', response.status(), response.url()));
await page.goto('https://example.com');
```

Or wait for a network response after the button click with `page.waitForResponse()`:

```ts
// Use a glob URL pattern. Note no await.
const responsePromise = page.waitForResponse('**/api/fetch_data');
await page.getByText('Update').click();
const response = await responsePromise;
```

### Variations

```ts
// Use a RegExp. Note no await.
const responsePromise = page.waitForResponse(/\.jpeg$/);
await page.getByText('Update').click();
const response = await responsePromise;

// Use a predicate taking a Response object. Note no await.
const responsePromise = page.waitForResponse((response) => response.url().includes(token));
await page.getByText('Update').click();
const response = await responsePromise;
```

---

## 🛠️ Handle requests

You can mock API endpoints via handling the network requests in your Playwright script.

```ts
await page.route('**/api/fetch_data', (route) =>
  route.fulfill({
    status: 200,
    body: testData,
  })
);
await page.goto('https://example.com');
```

### Variations

Set up route on the entire browser context with `browserContext.route()` or page with `page.route()`. It will apply to popup windows and opened links.

```ts
await browserContext.route('**/api/login', (route) =>
  route.fulfill({
    status: 200,
    body: 'accept',
  })
);
await page.goto('https://example.com');
```

---

## ✏️ Modify requests

You can continue requests with modifications. The example below removes an HTTP header from the outgoing requests.

```ts
// Delete header
await page.route('**/*', async (route) => {
  const headers = route.request().headers();
  delete headers['X-Secret'];
  await route.continue({ headers });
});

// Continue requests as POST.
await page.route('**/*', (route) => route.continue({ method: 'POST' }));
```

---

## ❌ Abort requests

You can abort requests using `page.route()` and `route.abort()`.

```ts
await page.route('**/*.{png,jpg,jpeg}', (route) => route.abort());

// Abort based on the request type
await page.route('**/*', (route) => {
  return route.request().resourceType() === 'image' ? route.abort() : route.continue();
});
```

---

## 🔄 Modify responses

To modify a response use `APIRequestContext` to get the original response and then pass the response to `route.fulfill()`. You can override individual fields on the response via options:

```ts
await page.route('**/title.html', async (route) => {
  // Fetch original response.
  const response = await route.fetch();
  // Add a prefix to the title.
  let body = await response.text();
  body = body.replace('<title>', '<title>My prefix:');
  await route.fulfill({
    // Pass all fields from the response.
    response,
    // Override response body.
    body,
    // Force content type to be html.
    headers: {
      ...response.headers(),
      'content-type': 'text/html',
    },
  });
});
```

---

## 🔣 Glob URL patterns

Playwright uses simplified glob patterns for URL matching in network interception methods like `page.route()` or `page.waitForResponse()`. These patterns support basic wildcards:

- **Asterisks:** A single `*` matches any characters except `/`; a double `**` matches any characters including `/`
- **Question mark** `?` matches only the question mark `?` character — use `*` to match any character
- **Curly braces** `{}` can be used to match a list of options separated by commas `,`
- **Backslash** `\` can be used to escape any special character (escape backslash itself as `\\`)

Examples:

- `https://example.com/*.js` matches `https://example.com/file.js` but not `https://example.com/path/file.js`
- `https://example.com/?page=1` matches `https://example.com/?page=1` but not `https://example.com`
- `**/*.js` matches both `https://example.com/file.js` and `https://example.com/path/file.js`
- `**/*.{png,jpg,jpeg}` matches all image requests

> **Note:** The glob pattern must match the entire URL, not just a part of it. For more complex matching requirements, consider using RegExp instead of glob patterns.

---

## 🔌 WebSockets

Playwright supports WebSockets inspection, mocking and modifying out of the box. See our API mocking guide to learn how to mock WebSockets. Every time a WebSocket is created, the `page.on('websocket')` event is fired. This event contains the WebSocket instance for further web socket frames inspection:

```ts
page.on('websocket', (ws) => {
  console.log(`WebSocket opened: ${ws.url()}>`);
  ws.on('framesent', (event) => console.log(event.payload));
  ws.on('framereceived', (event) => console.log(event.payload));
  ws.on('close', () => console.log('WebSocket closed'));
});
```

---

## ⚠️ Missing Network Events and Service Workers

Playwright's built-in `browserContext.route()` and `page.route()` allow your tests to natively route requests and perform mocking and interception.

If you're using Playwright's native routing and it appears network events are missing, disable Service Workers by setting `serviceWorkers` to `'block'`. It might be that you are using a mock tool such as Mock Service Worker (MSW). While this tool works out of the box for mocking responses, it adds its own Service Worker that takes over the network requests, hence making them invisible to `browserContext.route()` and `page.route()`.

If you are interested in both network testing and mocking, consider using built-in `browserContext.route()` and `page.route()` for response mocking. If you're interested in routing and listening for requests made by Service Workers themselves, please see the dedicated guide.
