# 📦 Playwright — APIRequest

> **Source:** [playwright.dev/docs/api/class-apirequest](https://playwright.dev/docs/api/class-apirequest)

---

## Overview

**APIRequest** exposes API that can be used for the Web API testing. This class is used for creating `APIRequestContext` instance which in turn can be used for sending web requests. An instance of this class can be obtained via `playwright.request`. For more information see `APIRequestContext`.

---

## Methods

### newContext

**Added in:** v1.16

Creates new instances of `APIRequestContext`.

```ts
await apiRequest.newContext();
await apiRequest.newContext(options);
```

**Arguments:**

- `options` Object (optional)
  - `baseURL` string (optional) — Methods like `apiRequestContext.get()` take the base URL into consideration by using the `URL()` constructor for building the corresponding URL. Examples:
    - `baseURL: http://localhost:3000` and sending request to `/bar.html` results in `http://localhost:3000/bar.html`
    - `baseURL: http://localhost:3000/foo/` and sending request to `./bar.html` results in `http://localhost:3000/foo/bar.html`
    - `baseURL: http://localhost:3000/foo` (without trailing slash) and navigating to `./bar.html` results in `http://localhost:3000/bar.html`
  - `clientCertificates` Array\<Object\> (optional) _(Added in: 1.46)_ — TLS Client Authentication allows the server to request a client certificate and verify it. An array of client certificates to be used. Each certificate object must have either both `certPath` and `keyPath`, a single `pfxPath`, or their corresponding direct value equivalents (`cert` and `key`, or `pfx`). Optionally, `passphrase` property should be provided if the certificate is encrypted. The `origin` property should be provided with an exact match to the request origin that the certificate is valid for.
    - `origin` string — Exact origin that the certificate is valid for. Origin includes https protocol, a hostname and optionally a port.
    - `certPath` string (optional) — Path to the file with the certificate in PEM format.
    - `cert` Buffer (optional) — Direct value of the certificate in PEM format.
    - `keyPath` string (optional) — Path to the file with the private key in PEM format.
    - `key` Buffer (optional) — Direct value of the private key in PEM format.
    - `pfxPath` string (optional) — Path to the PFX or PKCS12 encoded private key and certificate chain.
    - `pfx` Buffer (optional) — Direct value of the PFX or PKCS12 encoded private key and certificate chain.
    - `passphrase` string (optional) — Passphrase for the private key (PEM or PFX).

    > **Note:** When using WebKit on macOS, accessing `localhost` will not pick up client certificates. You can make it work by replacing `localhost` with `local.playwright`.

  - `extraHTTPHeaders` Object\<string, string\> (optional) — An object containing additional HTTP headers to be sent with every request. Defaults to none.
  - `failOnStatusCode` boolean (optional) _(Added in: v1.51)_ — Whether to throw on response codes other than 2xx and 3xx. By default response object is returned for all status codes.
  - `httpCredentials` Object (optional) — Credentials for HTTP authentication. If no origin is specified, the username and password are sent to any servers upon unauthorized responses.
    - `username` string
    - `password` string
    - `origin` string (optional) — Restrain sending http credentials on specific origin (scheme://host:port).
    - `send` `"unauthorized" | "always"` (optional)
  - `ignoreHTTPSErrors` boolean (optional) — Whether to ignore HTTPS errors when sending network requests. Defaults to `false`.
  - `maxRedirects` number (optional) _(Added in: v1.52)_ — Maximum number of request redirects that will be followed automatically. An error will be thrown if the number is exceeded. Defaults to 20. Pass 0 to not follow redirects. This can be overwritten for each request individually.
  - `proxy` Object (optional) — Network proxy settings.
    - `server` string — Proxy to be used for all requests. HTTP and SOCKS proxies are supported, for example `http://myproxy.com:3128` or `socks5://myproxy.com:3128`.
    - `bypass` string (optional) — Optional comma-separated domains to bypass proxy.
    - `username` string (optional) — Optional username to use if HTTP proxy requires authentication.
    - `password` string (optional) — Optional password to use if HTTP proxy requires authentication.
  - `storageState` string | Object (optional) — Populates context with given storage state. Either a path to the file with saved storage, or the value returned by one of `browserContext.storageState()` or `apiRequestContext.storageState()` methods.
    - `cookies` Array\<Object\>
    - `origins` Array\<Object\>
  - `timeout` number (optional) — Maximum time in milliseconds to wait for the response. Defaults to 30000 (30 seconds). Pass 0 to disable timeout.
  - `userAgent` string (optional) — Specific user agent to use in this context.

**Returns:** `Promise<APIRequestContext>`
