# 📦 Playwright — Testoptions

> **Source:** [playwright.dev/docs/api/class-testoptions](https://playwright.dev/docs/api/class-testoptions)

---

## TestOptionsPlaywright Test provides many options to configure test environment, Browser, BrowserContext and more. These options are usually provided in the configuration file through testConfig.use and testProject.use. playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { headless: false, viewport: { width: 1280, height: 720 }, ignoreHTTPSErrors: true, video: 'on-first-retry', },}); Alternatively, with test.use() you can override some options for a file. example.spec.tsimport { test, expect } from '@playwright/test';// Run tests in this file with portrait-like viewport.test.use({ viewport: { width: 600, height: 900 } });test('my portrait test', async ({ page }) => { // ...}); Properties

accept

## Downloads

Added in: v1.10 testOptions.acceptDownloads Whether to automatically download all the attachments. Defaults to true where all the downloads are accepted

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { acceptDownloads: false, },});

## Type boolean actionTimeout

Added in: v1.10 testOptions.actionTimeout Default timeout for each Playwright action in milliseconds, defaults to 0 (no timeout). This is a default timeout for all Playwright actions, same as configured via page.setDefaultTimeout()

import { defineConfig, devices } from '@playwright/test';export default defineConfig({ use: { /_ Maximum time each action such as `click()` can take. Defaults to 0 (no limit). _/ actionTimeout: 0, },});

## Learn more about various timeouts. Type number baseURL

Added in: v1.10 testOptions.baseURL When using page.goto(), page.route(), page.waitForURL(), page.waitForRequest(), or page.waitForResponse() it takes the base URL in consideration by using the URL() constructor for building the corresponding URL. Unset by default. Examples: baseURL: http://localhost:3000 and navigating to /bar.html results in http://localhost:3000/bar.html baseURL: http://localhost:3000/foo/ and navigating to ./bar.html results in http://localhost:3000/foo/bar.html baseURL: http://localhost:3000/foo (without trailing slash) and navigating to ./bar.html results in http://localhost:3000/bar.html Usage import { defineConfig, devices } from '@playwright/test';export default defineConfig({ use: { /_ Base URL to use in actions like `await page.goto('/')`. _/ baseURL: 'http://localhost:3000', },});

## Type string browserName

Added in: v1.10 testOptions.browserName Name of the browser that runs tests. Defaults to 'chromium'. Most of the time you should set browserName in your TestConfig: Usage playwright.config.tsimport { defineConfig, devices } from '@playwright/test';export default defineConfig({ use: { browserName: 'firefox', },}); Type "chromium" | "firefox" | "webkit" bypass

## CSP

Added in: v1.10 testOptions.bypassCSP Toggles bypassing page's Content-Security-Policy. Defaults to false

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { bypassCSP: true, }});

## Type boolean channel

Added in: v1.10 testOptions.channel Browser distribution channel. Use "chromium" to opt in to new headless mode. Use "chrome", "chrome-beta", "chrome-dev", "chrome-canary", "msedge", "msedge-beta", "msedge-dev", or "msedge-canary" to use branded Google Chrome and Microsoft Edge

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ projects: [ { name: 'Microsoft Edge', use: { ...devices['Desktop Edge'], channel: 'msedge' }, }, ]});

## Type string clientCertificates

Added in: 1.46 testOptions.clientCertificates TLS Client Authentication allows the server to request a client certificate and verify it

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { clientCertificates: [{ origin: 'https://example.com', certPath: './cert.pem', keyPath: './key.pem', passphrase: 'mysecretpassword', }], },}); Type Array<Object> origin string Exact origin that the certificate is valid for. Origin includes https protocol, a hostname and optionally a port. certPath string (optional) Path to the file with the certificate in PEM format. cert Buffer (optional) Direct value of the certificate in PEM format. keyPath string (optional) Path to the file with the private key in PEM format. key Buffer (optional) Direct value of the private key in PEM format. pfxPath string (optional) Path to the PFX or PKCS12 encoded private key and certificate chain. pfx Buffer (optional) Direct value of the PFX or PKCS12 encoded private key and certificate chain. passphrase string (optional) Passphrase for the private key (PEM or PFX)

An array of client certificates to be used. Each certificate object must have either both certPath and keyPath, a single pfxPath, or their corresponding direct value equivalents (cert and key, or pfx). Optionally, passphrase property should be provided if the certificate is encrypted. The origin property should be provided with an exact match to the request origin that the certificate is valid for. Client certificate authentication is only active when at least one client certificate is provided. If you want to reject all client certificates sent by the server, you need to provide a client certificate with an origin that does not match any of the domains you plan to visit. noteWhen using WebKit on macOS, accessing localhost will not pick up client certificates.

## You can make it work by replacing localhost with local.playwright. colorScheme

Added in: v1.10 testOptions.colorScheme Emulates prefers-colors-scheme media feature, supported values are 'light' and 'dark'. See page.emulateMedia() for more details. Passing null resets emulation to system defaults. Defaults to 'light'

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { colorScheme: 'dark', },}); Type null | "light" | "dark" | "no-preference" connect

## Options

Added in: v1.10 testOptions.connectOptions Usage playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { connectOptions: { wsEndpoint: 'ws://localhost:5678', }, },}); When connect options are specified, default fixtures.browser, fixtures.context and fixtures.page use the remote browser instead of launching a browser locally, and any launch options like testOptions.headless or testOptions.channel are ignored. Type void | Object wsEndpoint string A browser websocket endpoint to connect to. headers void | Object<string, string> (optional) Additional HTTP headers to be sent with web socket connect request. Optional. timeout number (optional) Timeout in milliseconds for the connection to be established. Optional, defaults to no timeout. exposeNetwork string (optional) Option to expose network available on the connecting client to the browser being connected to.

## See browserType.connect() for more details. contextOptions

Added in: v1.10 testOptions.contextOptions Options used to create the context, as passed to browser.newContext(). Specific options like testOptions.viewport take priority over this

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { contextOptions: { reducedMotion: 'reduce', }, },});

## Type Object deviceScaleFactor

Added in: v1.10 testOptions.deviceScaleFactor Specify device scale factor (can be thought of as dpr). Defaults to 1. Learn more about emulating devices with device scale factor

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { viewport: { width: 2560, height: 1440 }, deviceScaleFactor: 2, },});

## Type number extraHTTPHeaders

Added in: v1.10 testOptions.extraHTTPHeaders An object containing additional HTTP headers to be sent with every request. Defaults to none

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { extraHTTPHeaders: { 'X-My-Header': 'value', }, },}); Type Object<string, string> geolocation​ Added in: v1.10 testOptions.geolocation Usage playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { geolocation: { longitude: 12.492507, latitude: 41.889938 }, },}); Learn more about geolocation. Type Object latitude number Latitude between -90 and 90. longitude number Longitude between -180 and 180. accuracy number (optional)

## Non-negative accuracy value. Defaults to 0. hasTouch

Added in: v1.10 testOptions.hasTouch Specifies if viewport supports touch events. Defaults to false. Learn more about mobile emulation

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { hasTouch: true },});

## Type boolean headless

Added in: v1.10 testOptions.headless Whether to run browser in headless mode. More details for Chromium and Firefox. Defaults to true

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { headless: false },});

## Type boolean httpCredentials

Added in: v1.10 testOptions.httpCredentials Credentials for HTTP authentication. If no origin is specified, the username and password are sent to any servers upon unauthorized responses

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { httpCredentials: { username: 'user', password: 'pass', }, },}); Type Object username string password string origin string (optional) Restrain sending http credentials on specific origin (scheme://host:port). send "unauthorized" | "always" (optional) This option only applies to the requests sent from corresponding APIRequestContext and does not affect requests sent from the browser. 'always' - Authorization header with basic authentication credentials will be sent with the each API request. 'unauthorized - the credentials are only sent when 401 (Unauthorized) response with W

## WW-Authenticate header is received. Defaults to 'unauthorized'. ignoreHTTPSErrors

Added in: v1.10 testOptions.ignoreHTTPSErrors Whether to ignore HTTPS errors when sending network requests. Defaults to false

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { ignoreHTTPSErrors: true, },});

## Type boolean isMobile

Added in: v1.10 testOptions.isMobile Whether the meta viewport tag is taken into account and touch events are enabled. isMobile is a part of device, so you don't actually need to set it manually. Defaults to false and is not supported in Firefox. Learn more about mobile emulation

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { isMobile: false, },});

## Type boolean javaScriptEnabled

Added in: v1.10 testOptions.javaScriptEnabled Whether or not to enable JavaScript in the context. Defaults to true. Learn more about disabling JavaScript

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { javaScriptEnabled: false, },});

## Type boolean launchOptions

Added in: v1.10 testOptions.launchOptions Options used to launch the browser, as passed to browserType.launch(). Specific options testOptions.headless and testOptions.channel take priority over this. warningUse custom browser args at your own risk, as some of them may break Playwright functionality

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ projects: [ { name: 'chromium', use: { ...devices['Desktop Chrome'], launchOptions: { args: ['--start-maximized'] } } } ]});

## Type Object locale

Added in: v1.10 testOptions.locale Specify user locale, for example en-GB, de-DE, etc. Locale will affect navigator.language value, Accept-Language request header value as well as number and date formatting rules. Defaults to en-US. Learn more about emulation in our emulation guide

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { locale: 'it-IT', },});

## Type string navigationTimeout

Added in: v1.10 testOptions.navigationTimeout Timeout for each navigation action in milliseconds. Defaults to 0 (no timeout). This is a default navigation timeout, same as configured via page.setDefaultNavigationTimeout()

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { navigationTimeout: 3000, },});

## Learn more about various timeouts. Type number offline

Added in: v1.10 testOptions.offline Whether to emulate network being offline. Defaults to false. Learn more about network emulation

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { offline: true },});

## Type boolean permissions

Added in: v1.10 testOptions.permissions A list of permissions to grant to all pages in this context. See browserContext.grantPermissions() for more details. Defaults to none

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { permissions: ['notifications'], },}); Type Array<string> proxy​ Added in: v1.10 testOptions.proxy Network proxy settings

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { proxy: { server: 'http://myproxy.com:3128', bypass: 'localhost', }, },}); Type Object server string Proxy to be used for all requests. HTTP and SOCKS proxies are supported, for example http://myproxy.com:3128 or socks5://myproxy.com:3128. Short form myproxy.com:3128 is considered an HTTP proxy. bypass string (optional) Optional comma-separated domains to bypass proxy, for example ".com, chromium.org, .domain.com". username string (optional) Optional username to use if HTTP proxy requires authentication. password string (optional)

## Optional password to use if HTTP proxy requires authentication. screenshot

Added in: v1.10 testOptions.screenshot Whether to automatically capture a screenshot after each test. Defaults to 'off'. 'off': Do not capture screenshots. 'on': Capture screenshot after each test. 'only-on-failure': Capture screenshot after each test failure. 'on-first-failure': Capture screenshot after each test's first failure

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { screenshot: 'only-on-failure', },}); Learn more about automatic screenshots. Type Object | "off" | "on" | "only-on-failure" | "on-first-failure" mode "off" | "on" | "only-on-failure" | "on-first-failure" Automatic screenshot mode. fullPage boolean (optional) When true, takes a screenshot of the full scrollable page, instead of the currently visible viewport. Defaults to false. omitBackground boolean (optional) Hides default white background and allows capturing screenshots with transparency.

## Not applicable to jpeg images. Defaults to false. serviceWorkers

Added in: v1.10 testOptions.serviceWorkers Whether to allow sites to register Service workers. Defaults to 'allow'. 'allow': Service Workers can be registered. 'block': Playwright will block all registration of Service Workers

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { serviceWorkers: 'allow' },}); Type "allow" | "block" storage

## State

Added in: v1.10 testOptions.storageState Learn more about storage state and auth. Populates context with given storage state. This option can be used to initialize context with logged-in information obtained via browserContext.storageState()

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { storageState: 'storage-state.json', },}); Type string | Object cookies Array<Object> name string value string domain string Domain and path are required. For the cookie to apply to all subdomains as well, prefix domain with a dot, like this: ".example.com" path string Domain and path are required expires number Unix time in seconds. httpOnly boolean secure boolean sameSite "Strict" | "Lax" | "None" sameSite flag Cookies to set for context origins Array<Object> origin string localStorage Array<Object> name string value string localStorage to set for context Details When storage state is set up in the config, it is possible to reset storage state for a file: not-signed-in.spec.tsimport { test } from '@playwright/test';// Reset storage state for this file to avoid being authenticatedtest.use({ storageState: { cookies: [], origins: [] } });test('not signed in test', async ({ page }) => { // ...}); test

## IdAttribute

Added in: v1.27 testOptions.testIdAttribute Custom attribute to be used in page.getByTestId(). data-testid is used by default

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { testIdAttribute: 'pw-test-id', },}); timezoneId​ Added in: v1.10 testOptions.timezoneId Changes the timezone of the context. See ICU's metaZones.txt for a list of supported timezone IDs. Defaults to the system timezone

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { timezoneId: 'Europe/Rome', },});

## Type string trace

Added in: v1.10 testOptions.trace Whether to record trace for each test. Defaults to 'off'. 'off': Do not record trace. 'on': Record trace for each test. 'on-first-retry': Record trace only when retrying a test for the first time. 'on-all-retries': Record trace only when retrying a test. 'retain-on-failure': Record trace for each test. When test run passes, remove the recorded trace. 'retain-on-first-failure': Record trace for the first run of each test, but not for retries. When test run passes, remove the recorded trace. 'retain-on-failure-and-retries': Record trace for each test run. Retains all traces when an attempt fails. For more control, pass an object that specifies mode and trace features to enable

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { trace: 'on-first-retry' },}); Learn more about recording trace. Type Object | "off" | "on" | "retain-on-failure" | "on-first-retry" | "retain-on-first-failure" | "retain-on-failure-and-retries" mode "off" | "on" | "retain-on-failure" | "on-first-retry" | "on-all-retries" | "retain-on-first-failure" | "retain-on-failure-and-retries" Trace recording mode. attachments boolean (optional) Whether to include test attachments. Defaults to true. Optional. screenshots boolean (optional) Whether to capture screenshots during tracing. Screenshots are used to build a timeline preview. Defaults to true. Optional. snapshots boolean (optional) Whether to capture DOM snapshot on every action. Defaults to true. Optional. sources boolean (optional) Whether to include source files for trace actions.

## Defaults to true. Optional. userAgent

Added in: v1.10 testOptions.userAgent Specific user agent to use in this context

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { userAgent: 'some custom ua', },});

## Type string video

Added in: v1.10 testOptions.video Whether to record video for each test. Defaults to 'off'. 'off': Do not record video. 'on': Record video for each test. 'retain-on-failure': Record video for each test, but remove all videos from successful test runs. 'on-first-retry': Record video only when retrying a test for the first time. To control video size, pass an object with mode and size properties. If video size is not specified, it will be equal to testOptions.viewport scaled down to fit into 800x800. If viewport is not configured explicitly the video size defaults to 800x450. Actual picture of each page will be scaled down if necessary to fit the specified size. To annotate actions in the video, pass show with action and/or test sub-options. The action option controls visual highlights on interacted elements with an optional delay in milliseconds (defaults to 500). The test option controls which test information is displayed as a status overlay

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { video: 'on-first-retry', },}); Learn more about recording video. Type Object | "off" | "on" | "retain-on-failure" | "on-first-retry" mode "off" | "on" | "retain-on-failure" | "on-first-retry" Video recording mode. size Object (optional) width number height number Size of the recorded video. Optional. show Object (optional) actions Object (optional) duration number (optional) How long each annotation is displayed in milliseconds. Defaults to 500. position "top-left" | "top" | "top-right" | "bottom-left" | "bottom" | "bottom-right" (optional) Position of the action title overlay. Defaults to "top-right". fontSize number (optional) Font size of the action title in pixels. Defaults to 24. Controls visual annotations on interacted elements. test Object (optional) level "file" | "test" | "step" (optional) Level of the detail to include about the current test. position "top-left" | "top" | "top-right" | "bottom-left" | "bottom" | "bottom-right" (optional) Position of the test information overlay. Defaults to "top-left". fontSize number (optional) Font size of the test information in pixels. Defaults to 14. Controls test information displayed as a status overlay in the video. If specified, visually annotates the video with test information and action highlights. viewport​ Added in: v1.10 testOptions.viewport Emulates consistent viewport for each page. Defaults to an 1280x720 viewport. Use null to disable the consistent viewport emulation. Learn more about viewport emulation. noteThe null value opts out from the default presets, makes viewport depend on the host window size defined by the operating system. It makes the execution of the tests non-deterministic

playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { viewport: { width: 100, height: 100 }, },}); Type null | Object width number page width in pixels. height number page height in pixels.
