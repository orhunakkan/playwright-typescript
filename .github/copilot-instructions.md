# Copilot instructions for this repository

## Build, test, and lint commands

- Install dependencies: `npm install`
- Install Playwright browsers: `npx playwright install`
- Type-check (there is no separate build script): `npm run typecheck`
- Lint: `npm run lint:check`
- Auto-fix lint issues: `npm run lint:fix`
- Check formatting: `npm run format:check`
- Format: `npm run format`

### Running tests

- Run all Playwright projects: `npx playwright test`
- Run one spec file: `npx playwright test tests\e2e\chapter7-page-object-model.spec.ts`
- Run one test by title: `npx playwright test -g "should login successfully"`
- Run one spec in one browser project: `npx playwright test tests\e2e\chapter7-page-object-model.spec.ts --project="Desktop Chrome"`
- Run all API tests: `npx playwright test --project="API Tests"`
- Run one API spec: `npx playwright test tests\api\notes-notes-all-flow.spec.ts --project="API Tests"`
- Run DB tests: `npm run test:db`
- Run one DB spec: `npx playwright test tests\db\chapter-db-01-consistency.spec.ts --project="DB Tests" --workers=1`
- Run visual regression suite in Docker: `npm run test:visual`
- Update visual baselines in Docker: `npm run test:visual:update`
- Open HTML report: `npx playwright show-report`
- Open Allure report: `npm run report:allure:open`

### Local services

- Start required Docker services for DB work: `npm run docker:up`
- Stop and remove local DB services: `npm run docker:down`

## High-level architecture

- `playwright.config.ts` is the central orchestrator. It loads `.env` or `.env.<TEST_ENV>`, enables HTML/JSON/Allure reporters, writes artifacts to `playwright-report`, `allure-results`, and `test-results`, and defines separate projects for `DB Tests`, `API Tests`, desktop browsers, and mobile browsers.
- `config/env.ts` is the runtime config entrypoint used by tests and page objects. Tests read `config.e2eUrl`, `config.apiUrl`, and `config.postgreStUrl`; there is no Playwright `baseURL`.
- E2E coverage lives in `tests/e2e/`. These specs usually import `test` and `expect` from `fixtures/page-fixtures`, which wires the shared `page` fixture to page object classes in `pages/`.
- The page object layer uses one class per page under `pages/`. Each class exposes `readonly locators` and `readonly actions`, and navigation methods usually build URLs from `config.e2eUrl`.
- API coverage lives in `tests/api/`. These suites use Playwright's `request` fixture, Faker-based payload generators in `fixtures/notes-api-payloads/`, and strict schema assertions from `utilities/api-schema-validator.ts`.
- DB coverage lives in `tests/db/`. These specs hit PostgREST over HTTP and validate persisted state directly through `utilities/db-client.ts`, which manages a lazily created PostgreSQL pool and seeding helpers.
- Visual regression is implemented as a normal Playwright spec (`tests/e2e/chapter0-visual-regression-tests.spec.ts`) but snapshot paths are centralized by `snapshotPathTemplate` in `playwright.config.ts`, so baselines land under `fixtures/reference-snapshots\{testFileName}\{testName}\`.

## Key conventions

- For browser/POM tests, prefer `import { test, expect } from '../../fixtures/page-fixtures';` instead of importing directly from `@playwright/test`. For API and DB tests, import from `@playwright/test`.
- Do not hardcode environment URLs. Use `config` from `config/env.ts`. If a test needs DB access, it also depends on `DB_*` and `POSTGREST_URL` env vars plus `npm run docker:up`.
- New page objects should follow the existing `<name>.page.ts` convention and the same class shape: constructor receives `Page`, `locators` are declared once, and reusable interactions live under `actions`.
- API and DB workflow specs commonly use `test.describe.configure({ mode: 'serial' })` plus module-scoped variables to share auth tokens, created IDs, or seeded records across dependent steps.
- Reuse helpers instead of rewriting equivalents:
  - `utilities/a11y.ts` for axe scans
  - `utilities/error-listeners.ts` for browser console/page/request failure capture
  - `utilities/api-schema-validator.ts` for exact API shape checks
  - `utilities/db-client.ts` for seeding and direct SQL assertions
- Tests commonly attach Allure metadata (`feature`, `story`, `severity`) in `beforeEach` blocks or at test start. Keep that pattern when adding new suites.
- Locator style is Playwright-first: prefer `getByRole`, `getByLabel`, and `getByText`; use CSS selectors only when the accessible locator is not practical.
- Tagged tests are already in use (`@smoke`, `@critical`, `@visual`), so preserve that style when extending suites.

## MCP servers

- A Playwright MCP server is useful in this repo for live browser investigation, reproducing flaky UI behavior, inspecting console/network failures, and generating precise locators before updating tests.
- Prefer Playwright MCP for interactive E2E debugging tasks such as page snapshots, clicking through flows, reading console output, checking network requests, and saving storage state. It is much less relevant for API-only and DB-only specs.
- When using a Playwright MCP session here, navigate with `config.e2eUrl`-backed pages and translate any validated interaction back into the repo's normal patterns: page objects in `pages/`, shared fixtures in `fixtures/page-fixtures`, and assertions in Playwright tests rather than leaving logic only in the MCP session.
