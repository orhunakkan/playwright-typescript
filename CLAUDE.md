# Playwright-TypeScript Test Automation Framework

## Commands

### Test Execution
- `npx playwright test` — run all tests
- `npx playwright test --project="Desktop Chrome"` — single browser
- `npx playwright test tests/e2e/chapter3*.spec.ts` — single file
- `npx playwright test -g "should login"` — run tests matching title (grep)
- `npx playwright test --headed` — headed mode (see the browser)
- `npx playwright test --workers=1` — run sequentially (useful for debugging)
- `npx playwright test --repeat-each=3` — repeat each test N times (flake detection)
- `npx playwright test --retries=2` — retry failed tests
- `npx playwright test --reporter=line` — minimal output reporter
- `npx playwright test --last-failed` — re-run only previously failed tests
- `npx playwright test --update-snapshots` — update visual regression baselines

### Debugging & Inspection
- `npx playwright test --debug` — step-through debugger (Playwright Inspector)
- `npx playwright test --ui` — interactive UI mode with watch, trace viewer, time travel
- `npx playwright test --trace on` — capture trace for every test (view in trace viewer)
- `npx playwright show-trace trace.zip` — open a trace file in the trace viewer
- `npx playwright show-report` — view HTML report from last run
- `PWDEBUG=1 npx playwright test` — env var alternative for debug mode

### Code Generation & Tooling
- `npx playwright codegen [URL]` — record actions and generate test code interactively
- `npx playwright codegen --target=javascript [URL]` — generate in specific language
- `npx playwright codegen --save-storage=auth.json [URL]` — record and save auth state
- `npx playwright codegen --load-storage=auth.json [URL]` — codegen with pre-loaded auth
- `npx playwright open [URL]` — open URL in Playwright browser

### Browser Management
- `npx playwright install` — install all configured browsers
- `npx playwright install chromium` — install specific browser
- `npx playwright install --with-deps` — install browsers + OS dependencies (CI)

### Screenshots & PDF
- `npx playwright screenshot [URL] screenshot.png` — take a screenshot
- `npx playwright screenshot --full-page [URL] full.png` — full page screenshot
- `npx playwright pdf [URL] page.pdf` — generate PDF (Chromium only)

### Playwright MCP CLI (`playwright-cli`)

Control a live browser session from terminal. Use `-s=<session>` for named sessions.

**Core:**
- `playwright-cli open [url]` — open browser
- `playwright-cli close` — close browser
- `playwright-cli goto <url>` — navigate to URL
- `playwright-cli snapshot` — capture page snapshot (get element refs)
- `playwright-cli click <ref>` — click element by ref
- `playwright-cli fill <ref> <text>` — fill input field
- `playwright-cli type <text>` — type into focused element
- `playwright-cli select <ref> <val>` — select dropdown option
- `playwright-cli hover <ref>` — hover over element
- `playwright-cli drag <startRef> <endRef>` — drag and drop
- `playwright-cli check/uncheck <ref>` — toggle checkbox/radio
- `playwright-cli upload <file>` — upload file
- `playwright-cli eval <func> [ref]` — run JS on page or element
- `playwright-cli dialog-accept/dialog-dismiss` — handle dialogs
- `playwright-cli resize <w> <h>` — resize browser window

**Navigation:**
- `playwright-cli go-back/go-forward/reload` — browser navigation

**Keyboard & Mouse:**
- `playwright-cli press <key>` — press key (`Enter`, `ArrowLeft`, etc.)
- `playwright-cli mousemove <x> <y>` / `mousedown` / `mouseup` / `mousewheel <dx> <dy>`

**Tabs:**
- `playwright-cli tab-list` — list all tabs
- `playwright-cli tab-new [url]` — open new tab
- `playwright-cli tab-select <index>` — switch tab
- `playwright-cli tab-close [index]` — close tab

**Storage & Cookies:**
- `playwright-cli state-save [file]` / `state-load <file>` — save/load auth state
- `playwright-cli cookie-list/cookie-get/cookie-set/cookie-delete/cookie-clear`
- `playwright-cli localstorage-list/localstorage-get/localstorage-set/localstorage-delete/localstorage-clear`
- `playwright-cli sessionstorage-list/sessionstorage-get/sessionstorage-set/sessionstorage-delete/sessionstorage-clear`

**Network:**
- `playwright-cli route <pattern>` — mock network requests
- `playwright-cli route-list` — list active mocks
- `playwright-cli unroute [pattern]` — remove mocks
- `playwright-cli network` — list all network requests since page load

**DevTools & Recording:**
- `playwright-cli console [min-level]` — list console messages
- `playwright-cli run-code <code>` — run Playwright code snippet
- `playwright-cli screenshot [ref]` — screenshot page or element
- `playwright-cli pdf` — save page as PDF
- `playwright-cli tracing-start/tracing-stop` — record trace
- `playwright-cli video-start/video-stop` — record video
- `playwright-cli devtools-start` — open browser devtools

**Session Management:**
- `playwright-cli list` — list browser sessions
- `playwright-cli close-all` — close all sessions
- `playwright-cli kill-all` — force kill stale/zombie sessions

### Code Quality
- `npm run lint:check` — check ESLint
- `npm run lint:fix` — auto-fix lint issues
- `npm run format` — format with Prettier
- `npm run format:check` — check formatting

## Project Structure

- `tests/api/` — API tests (run in **serial** mode, test dependencies between steps)
- `tests/e2e/` — E2E browser tests (run in **parallel**, independent scenarios)
- `utilities/` — Shared helpers (cookies, login, error listeners, page load, etc.)
- `fixtures/` — Test data: cookies JSON, API payloads (Faker.js), reference snapshots
- `pages/` — Page Object Model classes

## Test Projects (playwright.config.ts)

1. API Tests — `tests/api/`, no browser
2. Desktop Chrome — `tests/e2e/`
3. Desktop Firefox — `tests/e2e/`
4. Desktop Edge — `tests/e2e/`

## Utilities (reuse these — don't write inline equivalents)

- `utilities/cookies.ts` — `acceptCookiesBeforeSession(context)` / `rejectCookiesBeforeSession(context)` — load pre-saved cookies from JSON fixtures
- `utilities/login.ts` — `programmaticLogin(page, context)` — multi-step Keycloak login (form extraction, CSRF, session validation)
- `utilities/error-listeners.ts` — `attachAllErrorListeners(page)` — returns array tracking console errors, page errors, failed requests
- `utilities/page-load-time.ts` — `waitForDomStability(page)` / `expectedPageLoadTime(page, url)` — DOM stability via MutationObserver, perf timing
- `utilities/dedicated-page.ts` — `validateLinkNewTab(page, locator)` / `validateLinkCurrentTab(page, locator)` — new tab/window validation
- `utilities/skip-test.ts` — `skipIfNotSilentProduction(test)` — conditional test skip by environment
- `utilities/img-src-path.ts` — `validateImageSrcPath(env, path)` — environment-aware image URL construction
- `utilities/linkedin-auth.ts` — manual LinkedIn login, saves auth state to `fixtures/linkedin-auth.json`

## API Test Pattern

API tests in `tests/api/` follow a specific pattern:
- Configure serial mode: `test.describe.configure({ mode: 'serial' })`
- Share state across tests via module-scoped variables (e.g., `let authToken: string`)
- Use `request` fixture from Playwright (not `page`)
- Generate payloads with Faker.js from `fixtures/notes-api-payloads/`
- Flow: register → login → create → read → update → list → delete

## Fixtures Organization

- `fixtures/cookies/` — pre-recorded accept/reject cookie JSON files
- `fixtures/notes-api-payloads/` — Faker-based payload generators (`notes-request-payloads.ts`, `users-request-payloads.ts`)
- `fixtures/reference-snapshots/` — visual regression PNG baselines, named per browser (`Desktop-Chrome-`, `Desktop-Firefox-`, `Desktop-Edge-`)

## Visual Regression

- Use `await expect(page).toHaveScreenshot({ fullPage: true })`
- Snapshots stored in `fixtures/reference-snapshots/{testFileName}/{projectName}-{arg}.png`
- Update baselines: `npx playwright test --update-snapshots`

## Page Object Model

- `pages/homepage.ts` — template class (not fully implemented yet)
- When creating new POM classes, place in `pages/` directory

## Conventions

- **Language:** TypeScript with ES modules (`import`/`export`)
- **Locators:** Prefer `getByRole()`, `getByText()`, `getByLabel()` over CSS selectors
- **Test data:** Use `@faker-js/faker` for random data generation
- **Assertions:** Use `expect()` from `@playwright/test` with auto-retrying matchers
- **Style:** 2-space indent, single quotes, print width 200, trailing comma es5
- **Async:** Always use `async/await`
- **Test structure:** `test.describe()` blocks with descriptive titles

## Environment

- `.env` contains `ENV` (base URL) and `API_URL`
- Base URL: `https://practice.expandtesting.com/`
- E2E test site: `https://bonigarcia.dev/selenium-webdriver-java`
