# Skill: Find in Local Playwright Docs

## Protocol

1. Identify the topic or class you need (e.g. "how do I intercept a network request?", "what does `locator.filter()` do?")
2. Find the matching file path in the index below
3. Read **only that file** — do not list or read the entire `docs/` folder
4. Use the file content to answer the question or write the code
5. If a topic spans two files (e.g. network mocking touches both a guide and a class), read them one at a time — never all at once

> The local docs are always authoritative. They reflect the exact Playwright version this project uses. Training data may be behind by one or more releases.

---

## API Reference Index → `docs/api/`

One file per Playwright class. Read only the class you need.

| Question / Topic                                                                         | File                                      |
| ---------------------------------------------------------------------------------------- | ----------------------------------------- |
| Locator methods — `click`, `fill`, `hover`, `filter`, `nth`, `waitFor`, etc.             | `docs/api/class-locator.md`               |
| Page methods — `goto`, `reload`, `screenshot`, `evaluate`, `waitForSelector`, etc.       | `docs/api/class-page.md`                  |
| Locator assertions — `toBeVisible`, `toHaveText`, `toHaveValue`, `toBeEnabled`, etc.     | `docs/api/class-locatorassertions.md`     |
| Page assertions — `toHaveURL`, `toHaveTitle`                                             | `docs/api/class-pageassertions.md`        |
| Generic assertions — `expect(value).toBe`, `toEqual`, `toContain`, `toMatchObject`, etc. | `docs/api/class-genericassertions.md`     |
| Snapshot assertions — `toMatchSnapshot`, `toHaveScreenshot`                              | `docs/api/class-snapshotassertions.md`    |
| API response assertions — `toBeOK`                                                       | `docs/api/class-apiresponseassertions.md` |
| API request context — `request.get/post/put/patch/delete`, `fetch`                       | `docs/api/class-apirequestcontext.md`     |
| API response — `response.json()`, `response.status()`, `response.headers()`              | `docs/api/class-apiresponse.md`           |
| API request object — `request.url()`, `request.method()`, `request.postData()`           | `docs/api/class-request.md`               |
| Browser context — cookies, storage state, permissions, new page, route                   | `docs/api/class-browsercontext.md`        |
| Browser — `browser.newContext()`, `browser.newPage()`, `browser.close()`                 | `docs/api/class-browser.md`               |
| Browser type — `chromium`, `firefox`, `webkit`, `launch`, `connect`                      | `docs/api/class-browsertype.md`           |
| Keyboard — `keyboard.press()`, `keyboard.type()`, `keyboard.down()`                      | `docs/api/class-keyboard.md`              |
| Mouse — `mouse.click()`, `mouse.move()`, `mouse.wheel()`                                 | `docs/api/class-mouse.md`                 |
| Touchscreen — `touchscreen.tap()`                                                        | `docs/api/class-touchscreen.md`           |
| Dialog — `dialog.accept()`, `dialog.dismiss()`, `dialog.message()`                       | `docs/api/class-dialog.md`                |
| Download — `download.path()`, `download.saveAs()`, `download.url()`                      | `docs/api/class-download.md`              |
| Frame — `frame.locator()`, `frame.goto()`, interacting with iframes                      | `docs/api/class-frame.md`                 |
| FrameLocator — `frameLocator()`, locating elements inside iframes                        | `docs/api/class-framelocator.md`          |
| Route — `route.fulfill()`, `route.abort()`, `route.continue()`, network interception     | `docs/api/class-route.md`                 |
| WebSocket — `webSocket.on()`, `webSocket.url()`                                          | `docs/api/class-websocket.md`             |
| WebSocketRoute — `webSocketRoute.fulfill()`, mocking WebSocket                           | `docs/api/class-websocketroute.md`        |
| Worker — web worker interaction                                                          | `docs/api/class-worker.md`                |
| Console message — `consoleMessage.text()`, `consoleMessage.type()`                       | `docs/api/class-consolemessage.md`        |
| Response object — `response.body()`, `response.text()`, `response.url()`                 | `docs/api/class-response.md`              |
| Tracing — `tracing.start()`, `tracing.stop()`, `tracing.startChunk()`                    | `docs/api/class-tracing.md`               |
| Clock — `clock.install()`, `clock.tick()`, `clock.setFixedTime()`, time manipulation     | `docs/api/class-clock.md`                 |
| Coverage — `coverage.startJSCoverage()`, `coverage.startCSSCoverage()`                   | `docs/api/class-coverage.md`              |
| CDPSession — Chrome DevTools Protocol session                                            | `docs/api/class-cdpsession.md`            |
| Selectors — custom selector engines                                                      | `docs/api/class-selectors.md`             |
| JSHandle — `jsHandle.evaluate()`, `jsHandle.getProperty()`                               | `docs/api/class-jshandle.md`              |
| ElementHandle — `elementHandle.click()`, `elementHandle.boundingBox()`                   | `docs/api/class-elementhandle.md`         |
| FileChooser — `fileChooser.setFiles()`                                                   | `docs/api/class-filechooser.md`           |
| Built-in test fixtures — `page`, `context`, `browser`, `request`, `baseURL`              | `docs/api/class-fixtures.md`              |
| TestInfo — `testInfo.title`, `testInfo.attachments`, `testInfo.outputPath()`             | `docs/api/class-testinfo.md`              |
| TestConfig — all `playwright.config.ts` root-level options                               | `docs/api/class-testconfig.md`            |
| TestOptions — all `use: {}` options (viewport, locale, baseURL, etc.)                    | `docs/api/class-testoptions.md`           |
| TestProject — per-project config options                                                 | `docs/api/class-testproject.md`           |
| FullConfig — resolved config type (after merging)                                        | `docs/api/class-fullconfig.md`            |
| FullProject — resolved project type (after merging)                                      | `docs/api/class-fullproject.md`           |
| Test object — `test.describe`, `test.beforeEach`, `test.step`, `test.use`                | `docs/api/class-test.md`                  |
| TestStepInfo — step-level info inside `test.step()`                                      | `docs/api/class-teststepinfo.md`          |
| Reporter API — custom reporter implementation                                            | `docs/api/class-reporter.md`              |
| Suite — reporter suite structure                                                         | `docs/api/class-suite.md`                 |
| TestCase — reporter test case object                                                     | `docs/api/class-testcase.md`              |
| TestResult — reporter test result object                                                 | `docs/api/class-testresult.md`            |
| TestStep — reporter step object                                                          | `docs/api/class-teststep.md`              |
| TestError / TestInfoError — error objects                                                | `docs/api/class-testerror.md`             |
| TimeoutError — timeout error type                                                        | `docs/api/class-timeouterror.md`          |
| WebError — uncaught page error type                                                      | `docs/api/class-weberror.md`              |
| Video — `video.path()`, `video.saveAs()`                                                 | `docs/api/class-video.md`                 |
| Playwright (root object) — `playwright.chromium`, `playwright.devices`                   | `docs/api/class-playwright.md`            |
| Logger — custom logger interface                                                         | `docs/api/class-logger.md`                |
| Location — source location type                                                          | `docs/api/class-location.md`              |
| WorkerInfo — worker-level info in fixtures                                               | `docs/api/class-workerinfo.md`            |
| Debugger — `debugger` object in `test.use`                                               | `docs/api/class-debugger.md`              |

---

## Guides Index → `docs/guides/`

### Writing & Running Tests

| Topic                                      | File                           |
| ------------------------------------------ | ------------------------------ |
| Getting started — writing your first test  | `docs/guides/writing-tests.md` |
| Running tests — CLI flags and options      | `docs/guides/running-tests.md` |
| Full CLI reference (`npx playwright test`) | `docs/guides/test-cli.md`      |
| Introduction / overview                    | `docs/guides/intro.md`         |

### Selectors & Locators

| Topic                                                                | File                            |
| -------------------------------------------------------------------- | ------------------------------- |
| Locators — recommended locator strategies, chaining, filtering       | `docs/guides/locators.md`       |
| Other / legacy locators — CSS, XPath, text, nth                      | `docs/guides/other-locators.md` |
| Actionability — what "ready to act" means (visible, stable, enabled) | `docs/guides/actionability.md`  |
| Aria snapshots — `expect(locator).toMatchAriaSnapshot()`             | `docs/guides/aria-snapshots.md` |

### Interactions & Input

| Topic                                                          | File                          |
| -------------------------------------------------------------- | ----------------------------- |
| User input — clicks, typing, selects, checkboxes, file uploads | `docs/guides/input.md`        |
| Touch events                                                   | `docs/guides/touch-events.md` |
| Dialogs — alert, confirm, prompt                               | `docs/guides/dialogs.md`      |
| Downloads — handling file downloads                            | `docs/guides/downloads.md`    |
| Evaluating JS — `page.evaluate()`, `page.exposeFunction()`     | `docs/guides/evaluating.md`   |
| JS Handles — ElementHandle, JSHandle (advanced DOM access)     | `docs/guides/handles.md`      |
| Frames & iframes                                               | `docs/guides/frames.md`       |
| Pages — multi-page scenarios, popups                           | `docs/guides/pages.md`        |
| Navigation — `goto`, `waitForURL`, `goBack`, load states       | `docs/guides/navigations.md`  |
| Events — `page.on()`, `page.waitForEvent()`                    | `docs/guides/events.md`       |

### Assertions

| Topic                                                     | File                             |
| --------------------------------------------------------- | -------------------------------- |
| All built-in assertion methods                            | `docs/guides/test-assertions.md` |
| Visual / screenshot comparisons                           | `docs/guides/test-snapshots.md`  |
| Screenshots — `page.screenshot()`, `locator.screenshot()` | `docs/guides/screenshots.md`     |

### Network & API

| Topic                                                                | File                               |
| -------------------------------------------------------------------- | ---------------------------------- |
| API testing — `request` fixture, `APIRequestContext`                 | `docs/guides/api-testing.md`       |
| Network — interception, routing, monitoring requests                 | `docs/guides/network.md`           |
| Mocking — `page.route()`, `route.fulfill()`, HAR files               | `docs/guides/mock.md`              |
| Mock browser APIs — `geolocation`, `clipboard`, `notifications` etc. | `docs/guides/mock-browser-apis.md` |
| Service workers — controlling and intercepting service workers       | `docs/guides/service-workers.md`   |

### Authentication & Storage

| Topic                                                       | File                              |
| ----------------------------------------------------------- | --------------------------------- |
| Authentication — login flows, storage state, `storageState` | `docs/guides/auth.md`             |
| Browser contexts — isolated sessions, cookies, permissions  | `docs/guides/browser-contexts.md` |

### Test Organisation

| Topic                                                      | File                                        |
| ---------------------------------------------------------- | ------------------------------------------- |
| Annotations — `test.skip`, `test.fixme`, `test.fail`, tags | `docs/guides/test-annotations.md`           |
| Parameterised tests — `test.each`, data-driven             | `docs/guides/test-parameterize.md`          |
| Fixtures — custom fixtures, `base.extend`, scope           | `docs/guides/test-fixtures.md`              |
| Page Object Model — POM pattern                            | `docs/guides/pom.md`                        |
| Global setup / teardown                                    | `docs/guides/test-global-setup-teardown.md` |

### Configuration

| Topic                                                             | File                                |
| ----------------------------------------------------------------- | ----------------------------------- |
| Test configuration — all `playwright.config.ts` options explained | `docs/guides/test-configuration.md` |
| Projects — multiple browser/device targets                        | `docs/guides/test-projects.md`      |
| Use options — `use: {}` block (viewport, locale, baseURL, etc.)   | `docs/guides/test-use-options.md`   |
| TypeScript — TS setup, tsconfig tips                              | `docs/guides/test-typescript.md`    |
| Web server — `webServer` config option                            | `docs/guides/test-webserver.md`     |
| Browsers — Chromium, Firefox, WebKit, channels                    | `docs/guides/browsers.md`           |
| Extensibility — custom matchers, custom fixtures                  | `docs/guides/extensibility.md`      |

### Execution & Performance

| Topic                                                | File                           |
| ---------------------------------------------------- | ------------------------------ |
| Parallel execution — workers, parallelism            | `docs/guides/test-parallel.md` |
| Retries — `retries`, retry logic                     | `docs/guides/test-retries.md`  |
| Timeouts — global, test, action, navigation timeouts | `docs/guides/test-timeouts.md` |
| Sharding — splitting tests across machines           | `docs/guides/test-sharding.md` |

### Reporting & Debugging

| Topic                                               | File                                |
| --------------------------------------------------- | ----------------------------------- |
| Reporters — built-in reporters, custom reporters    | `docs/guides/test-reporters.md`     |
| Debugging — `--debug`, `page.pause()`, breakpoints  | `docs/guides/debug.md`              |
| Trace viewer — reading and opening traces           | `docs/guides/trace-viewer.md`       |
| Trace viewer intro                                  | `docs/guides/trace-viewer-intro.md` |
| UI mode — interactive test runner                   | `docs/guides/test-ui-mode.md`       |
| Code generation — `codegen`, recording interactions | `docs/guides/codegen.md`            |
| Codegen intro                                       | `docs/guides/codegen-intro.md`      |

### Browser & Advanced Features

| Topic                                                     | File                                   |
| --------------------------------------------------------- | -------------------------------------- |
| Accessibility testing — axe-core integration              | `docs/guides/accessibility-testing.md` |
| Emulation — mobile devices, geolocation, timezone, locale | `docs/guides/emulation.md`             |
| Clock / time — `page.clock`, freezing time                | `docs/guides/clock.md`                 |
| Videos — recording test videos                            | `docs/guides/videos.md`                |
| Chrome extensions                                         | `docs/guides/chrome-extensions.md`     |
| WebView2                                                  | `docs/guides/webview2.md`              |
| Selenium Grid                                             | `docs/guides/selenium-grid.md`         |
| Library mode — using Playwright without the test runner   | `docs/guides/library.md`               |

### CI & Infrastructure

| Topic                                           | File                      |
| ----------------------------------------------- | ------------------------- |
| CI setup — GitHub Actions, Jenkins, Azure, etc. | `docs/guides/ci.md`       |
| CI intro                                        | `docs/guides/ci-intro.md` |
| Docker — running Playwright in Docker           | `docs/guides/docker.md`   |

### Migration & Compatibility

| Topic                          | File                             |
| ------------------------------ | -------------------------------- |
| Migrating from Protractor      | `docs/guides/protractor.md`      |
| Migrating from Puppeteer       | `docs/guides/puppeteer.md`       |
| Migrating from Testing Library | `docs/guides/testing-library.md` |

### What's New

| Topic                                                  | File                             |
| ------------------------------------------------------ | -------------------------------- |
| Release notes — latest changes, new APIs, deprecations | `docs/guides/release-notes.md`   |
| Canary releases                                        | `docs/guides/canary-releases.md` |

---

## MCP Docs → `docs/mcp/`

Documentation for the Playwright MCP (Model Context Protocol) server. Read these only if the task involves MCP configuration, tools, or client setup.

| Topic                    | File                                |
| ------------------------ | ----------------------------------- |
| Introduction             | `docs/mcp/introduction.md`          |
| Installation             | `docs/mcp/installation.md`          |
| Available tools overview | `docs/mcp/capabilities.md`          |
| Configuration options    | `docs/mcp/configuration-options.md` |
| Vision mode              | `docs/mcp/vision-mode.md`           |
| Snapshots                | `docs/mcp/snapshots.md`             |

---

## Agent CLI Docs → `docs/agent-cli/`

Documentation for the Playwright agent CLI. Read these only if the task involves the agent CLI.

| Topic                  | File                              |
| ---------------------- | --------------------------------- |
| Introduction           | `docs/agent-cli/introduction.md`  |
| Installation           | `docs/agent-cli/installation.md`  |
| Quick start            | `docs/agent-cli/quick-start.md`   |
| Configuration          | `docs/agent-cli/configuration.md` |
| Available capabilities | `docs/agent-cli/capabilities.md`  |
