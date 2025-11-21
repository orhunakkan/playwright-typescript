# AI agent guide for this repo (playwright-typescript)

This repository is a Playwright + TypeScript test suite that exercises a demo site’s UI and a small API. It’s optimized for fast, parallel runs with HTML reporting and trace collection on retries.

## Big picture

- Tests live under `tests/`:
  - `tests/e2e/` contains numbered, self-contained UI specs for end-to-end testing
  - `tests/api/` has API specs for testing REST APIs
  - `tests/seed.spec.ts` is a simple seed page visit used in planning/test notes
- Central config is `playwright.config.ts`:
  - `testDir: ./tests`, `fullyParallel: true`, `retries: CI? 1 : 0`, `workers: CI? 4 : default`
  - `use.baseURL = process.env.ENV` (set `ENV` to use relative URLs)
  - Tracing/screenshots/videos: `trace: on-first-retry`, `screenshot: only-on-failure`, `video: retain-on-failure`
  - Only one project: `Desktop Chrome` (extend if you need others)
  - Visual snapshot location is customized: `./snapshots/{testFileName}-snapshots/{arg}{ext}`

## How we run and debug

- Package scripts (see `package.json`):
  - `npm test` → `playwright test` (headless run)
  - `npm run test:ui` → Playwright UI mode (debug, pick/inspect tests)
  - `npm run test:report` → open the last HTML report
- Useful flags when running tests:
  - Run a single file: `playwright test tests/e2e/1-1-verify-web-form-page-load.spec.ts`
  - Filter by text: `playwright test -g "Submit Form"`
  - Show HTML report automatically on failure: `--reporter=list,html`

## Conventions and patterns in this repo

- File naming: UI specs are numbered (`1-1-...`, `2-1-...`) for human ordering; don't rely on order at runtime—each test/spec must be independent.
- At top of many UI specs you'll see comments linking to test plan documents and seed files for traceability. Keep these when adding new specs.
- Selectors: Prefer role-based locators (`page.getByRole(...)`) and semantic queries (`getByText`, `getByLabelText`) as seen throughout `tests/e2e`.
- Assertions: Common checks are `toHaveURL(/.../)`, `toHaveTitle(...)`, element visibility, and minimal waits (avoid `waitForTimeout`).
- Visual testing: Use `expect(page).toHaveScreenshot(...)`. Snapshots are stored under `snapshots/<spec>-snapshots/` due to the custom `snapshotPathTemplate`.
- API tests: Use the built-in `request` fixture. Keep base URL local to the file unless you need global config.

## Base URL and navigation

- `playwright.config.ts` reads the base URL from `process.env.ENV`.
  - If you set `ENV`, you can navigate with relative paths: `await page.goto('/')`.
  - Existing tests mostly use full URLs; that’s fine. Prefer relative URLs for new tests when `ENV` is defined.

## Project structure references

- Config: `playwright.config.ts`
- Scripts: `package.json`
- E2E tests: `tests/e2e/` (numbered specs for UI testing)
- API tests: `tests/api/` (REST API flow testing)
- Visual snapshots: `snapshots/` (auto-organized per spec by Playwright)

## Do’s for contributors and agents

- Keep specs independent; don’t share state across tests—use `beforeEach` for navigation/setup.
- Use role/text selectors, not brittle CSS/XPath.
- Add clear assertions for navigation, titles, and key UI states.
- When adding visual checks, stabilize the page (e.g., wait for key locators) instead of sleeping.
- Respect the configured reporters and snapshot path; avoid hardcoding snapshot directories.

Notes

- `utilities/environments.ts` and `utilities/error-logger.ts` exist but are currently empty—don’t depend on them.
- Lint/formatting: Prettier is present; default style applies (no custom ESLint/TS config in this repo).
