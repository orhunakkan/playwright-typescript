# Quality Report v2 — Portfolio Codebase Assessment

**Reviewer role:** Experienced test automation architect / potential employer  
**Date:** 2026-04-24  
**Repository:** `playwright-typescript` by Orhun Akkan  
**Playwright version:** 1.49.1 · **TypeScript:** 6.0 · **Node:** 18+

---

## Executive Summary

This is one of the more complete Playwright portfolios I have reviewed. The candidate has built a genuine multi-layer testing system — browser E2E, REST API, and direct-to-database integration — rather than the usual single-layer demo. The architecture is coherent, the TypeScript is almost always strict and type-safe, and the test design shows clear understanding of stateful flows, parallel isolation, and real-world cross-browser concerns. There are also some genuinely creative additions (a live Playwright docs link health monitor, visual regression locked to Docker, WCAG scanning across 29 pages) that go well beyond what a bootcamp project would produce.

That said, no portfolio is perfect. Several issues range from minor inconsistencies to real architectural concerns that would create maintenance problems on a professional project. These are documented in detail below with enough specificity to serve as an actionable fix list.

**Overall signal: Strong hire. The gaps are fixable; the foundations are solid.**

---

## 1. What Is Done Well

### 1.1 Architecture and Project Layout

The directory layout is logical and immediately navigable to anyone familiar with the ecosystem: `tests/` → `pages/` → `utilities/` → `fixtures/` → `config/`. The three test tiers (E2E, API, DB) live in separate subdirectories with their own project definitions in `playwright.config.ts`, which means they can be targeted individually without grep-based workarounds. This is the right approach and it is executed cleanly.

The `config/env.ts` module deserves specific praise. The `requireEnv()` guard throws a descriptive error on startup rather than propagating `undefined` into tests as a silent failure. The optional fallback for DB vars (empty string rather than throw) is the correct ergonomic choice because it allows API/E2E suites to run locally without a database configured. Nothing in the file references `process.env` directly — all callers go through the typed `config` object. This pattern scales correctly to a real team.

### 1.2 TypeScript Quality

`tsconfig.json` enables `strict: true` with no exceptions carved out. Running `tsc --noEmit` against the entire repository produces zero errors. Interfaces and generics are used purposefully: `ApiResponse<T>` wraps response bodies, `QueryResultRow` constrains DB generics, `ObjectSchema` types the schema validator. The `UserRow` / `NoteRow` / `NoteData` / `LoginData` types give test assertions a compile-time contract. This is the correct way to approach typed test automation.

### 1.3 Page Object Model Implementation

The `.locators` / `.actions` split pattern is applied consistently across all 31 page objects. Every locator is defined inside the class constructor and exposed through a typed object, which means IDE autocompletion works fully and refactoring a locator propagates everywhere without a search-and-replace. Locator choice largely follows the project's own preference order: `getByRole` → `getByLabel` → `getByPlaceholder` → `getByText`. The `home.page.ts` `chapterLink` factory method (a function that returns a `Locator`) is a good pattern for parameterised access.

All 31 page objects are registered in `fixtures/page-fixtures/index.ts` with the correct `base.extend<PageFixtures>` pattern. E2E spec files import `test` from the fixture index, never from `@playwright/test`, which means the POM injection chain is always intact.

### 1.4 API Test Design

The API specs demonstrate real understanding of stateful serial workflows. Module-scoped variables capture `authToken` and `createdNoteId`, and `test.describe.configure({ mode: 'serial' })` appears at the top of every API file. The lifecycle flows — register → login → profile operations → logout → post-logout rejection — reflect genuine API usage patterns rather than isolated endpoint pokes. The decision to create a second note and then verify the full list in `notes-notes-all-flow.spec.ts` catches ordering and count bugs that a single-note test would miss.

The `api-schema-validator.ts` utility is a standout contribution. `expectMatchesSchema` enforces that no extra keys appear and no required keys disappear, which makes these tests function as lightweight contract tests. Most frameworks skip this entirely and test only specific fields, leaving undocumented API changes invisible. The `context` parameter on every assertion produces messages like `[register data] Unexpected key "token"` rather than cryptic diff output, which is genuinely useful when a test fails in CI.

### 1.5 DB Integration Testing Layer

The DB test suite is the most technically sophisticated part of the portfolio. The approach — seed state directly via SQL, observe behaviour through the HTTP API or direct SQL, then assert using a fresh query — is the correct three-layer pattern and catches entire categories of bugs (constraint enforcement, cascade propagation, timestamp accuracy) that pure API tests will never surface.

Specific implementations worth highlighting:

- `db-audit-trail.spec.ts` uses `SELECT pg_sleep(1)` to introduce a DB-clock gap, making the `updated_at > created_at` assertion deterministic even under system load. This is a real-world technique, not a naive `setTimeout` workaround.
- `db-sanitization.spec.ts` inserts `'; DROP TABLE notes; --` and `<script>alert("xss")</script>` as parameterised query values and then verifies the literal strings are stored verbatim. This demonstrates both that the queries are parameterised (preventing injection) and that the stored value round-trips correctly.
- `db-soft-delete.spec.ts` tests against the `active_notes` view, which means it is testing view logic, not just table state. This level of schema awareness is unusual in a portfolio project.
- `truncateAll()` is called in every `beforeEach` across all eight DB files. No exceptions. This is the correct discipline.

### 1.6 Advanced Browser Coverage

The E2E suite covers territory that most automation portfolios never reach:

- **Shadow DOM** — using Playwright's automatic shadow-piercing locator engine, with a separate `page.evaluate` assertion confirming the root mode is `open`.
- **Geolocation mocking** — both the permission-granted path (with specific lat/long values) and a custom `addInitScript` mock for the permission-denied path.
- **getUserMedia** — a fake stream injected via `addInitScript` with a follow-up assertion that the button becomes disabled, demonstrating state verification after async media access.
- **Browser locale switching** — separate `browser.newContext({ locale: ... })` instances verify that the multilanguage page renders English and Spanish content independently.
- **Web Notifications API** — the notification constructor is intercepted inside `page.evaluate` to capture title, body, and icon without a real OS notification firing.
- **Mobile-only gates** — `test.skip(!isMobile, 'Mobile-only')` properly limits touch and viewport tests to the `Mobile Safari` and `Mobile Chrome` projects.

### 1.7 Visual Regression Infrastructure

The visual regression approach is production-quality. Tests run exclusively inside `mcr.microsoft.com/playwright:v1.59.1-noble` via `npm run test:visual`, which pins the rendering engine to a specific Docker image tag. The `snapshotPathTemplate` in `playwright.config.ts` organises baselines by test file, test name, and project name, which avoids collisions across the 5 browser projects. Baselines are committed to version control so regressions are caught at PR time.

The `ab-testing` visual tests show an additional level of care: because A/B content loads randomly, the tests inject deterministic `Math.random` overrides via `page.evaluate` to force a specific variation before taking the snapshot.

### 1.8 Playwright Docs Link Monitor

`playwright-docs-link-monitoring.spec.ts` is a genuinely creative addition. It:

1. Navigates to 4 Playwright docs source pages and extracts every live sidebar link.
2. Compares the live set against a versioned JSON baseline, soft-asserting on any additions or removals.
3. Visits every URL in the baseline and snapshots the `<article>` text content.
4. On failure, attaches a sentence-level diff (`computeTextDiff`) as a test artifact.

The `urlToSlug` helper, the test-level timeout override (`test.setTimeout(60_000)`), and the `Desktop Chrome`-only guard all show careful implementation thinking. This spec would be useful in a real team to detect when Playwright docs are reorganised or content is deprecated.

### 1.9 Tooling and Code Quality Gates

- `tsc --noEmit`, `eslint .`, and `prettier --check .` all pass cleanly.
- `eslint-plugin-playwright` is loaded with `flat/recommended`, providing Playwright-specific rules.
- Allure annotations (`feature`, `story`, `severity`) are present in every `beforeEach` across API specs, DB specs, and E2E specs — with two exceptions noted in the concerns section.
- The multi-environment setup (`.env`, `.env.dev`, `.env.staging`, `.env.prod`) with `TEST_ENV` selection in `playwright.config.ts` is a professional pattern that correctly decouples environment targeting from the test runner invocation.
- The Artillery performance test includes a proper three-phase load profile (warm-up → ramp-up → sustained) using the Playwright engine, which is significantly more realistic than pure HTTP load generation.

---

## 2. What Is Problematic or Concerning

### 2.1 Legacy `>>` Selector Syntax in `webdriver-fundamentals.spec.ts`

**Severity: High**

Lines 883–895 of `tests/e2e/webdriver-fundamentals.spec.ts` contain eight locator expressions using the deprecated Playwright v1.x chained selector syntax:

```ts
// Lines 883–895 — deprecated, should not appear in new code
await expect(page.locator(`#calculator .keys >> text="${digit}"`)).toBeVisible();
await expect(page.locator('#calculator .keys >> text="+"')).toBeVisible();
await expect(page.locator('#calculator >> text="C"')).toBeVisible();
```

The `>>` chain notation was deprecated in Playwright v1.27 and the `text=` engine was superseded by `filter({ hasText: ... })` and `getByText`. These selectors will continue to work in v1.59.1 (the project's current version) but they are a maintenance liability: any Playwright major version update may remove support, and the existing `SlowCalculatorPage` and `RandomCalculatorPage` objects already model these elements correctly via `filter({ hasText: ... })`. The selectors in this spec leak implementation details into the test layer, which the rest of the codebase avoids.

The same spec also uses inline `page.locator(...)` in several other places that already have equivalent `page.getByRole(...)` coverage in the corresponding page object. This is the one file that does not match the quality bar set by the rest of the suite.

### 2.2 `any` Escapes in `db-constraints.spec.ts`

**Severity: Medium**

All three constraint violation tests use the pattern:

```ts
} catch (err: any) {
  pgCode = err.code;
}
```

The `pg` package exports a `DatabaseError` class via `pg-protocol` that exposes a typed `code: string` property. Using `err: unknown` with an `instanceof` check or casting to `pg.DatabaseError` after an `instanceof` guard would eliminate all three `any` annotations. In a strict TypeScript codebase, `catch (err: any)` is an unchecked escape hatch and the fix is straightforward.

### 2.3 Hardcoded Credentials in `sauce-auth.setup.ts`

**Severity: Medium**

```ts
await page.getByPlaceholder('Username').fill('standard_user');
await page.getByPlaceholder('Password').fill('secret_sauce');
```

The README acknowledges that SauceDemo credentials are stable and intentionally left in source. However, the project's own `config/env.ts` module exists precisely to remove these literals from code. Even stable credentials should route through config: if SauceDemo rotates credentials (it has done so in the past), a developer must search the codebase rather than updating `.env`. A `config.sauceDemoUser` / `config.sauceDemoPassword` pair in `env.ts` would take two minutes to add and would make the setup consistent with every other credential in the project.

### 2.4 `process.env` Used Directly in `performance-testing.ts`

**Severity: Medium**

```ts
const E2E_URL = process.env.PRACTICE_E2E_URL!;
```

This violates the project's own rule that all environment variable access must go through `config/env.ts`. The non-null assertion (`!`) also means a missing variable produces a runtime `undefined` passed to Artillery rather than the descriptive startup error that `requireEnv()` would generate. Artillery's `playwright` engine runs in a separate process from the Playwright test runner, which makes the config module import pattern the right solution here.

### 2.5 `noteCategories` Defined in Three Separate Places

**Severity: Medium**

The same array literal appears independently in:

1. `fixtures/notes-api-payloads/notes-request-payloads.ts` — plain `string[]`, no `as const`
2. `utilities/db-client.ts` (inside `seedNote`) — inline `as const` tuple
3. `fixtures/db-payloads/db-payload-generators.ts` — `as const` tuple with a `NoteCategory` type, but **this file is never imported anywhere**

This is a classic DRY violation with a compounding problem: the API payload file omits `as const`, which means `faker.helpers.arrayElement` receives `string[]` instead of a readonly tuple. If the valid categories ever change (e.g., a fourth category is added in the API), only one of these three definitions will be updated, and the other two will silently generate invalid payloads that may pass tests while hiding the schema change. A single exported `noteCategories` constant should live in one authoritative location.

### 2.6 `fixtures/db-payloads/db-payload-generators.ts` Is Dead Code

**Severity: Low**

The file exports `noteCategories as const` and `NoteCategory` type, which are the correct, typed versions that the rest of the codebase should be using. But no other file imports from it. It is invisible to the compiler, to linters, and to the runtime. The `NoteCategory` type in particular is genuinely useful for constraining `seedNote`'s `overrides` parameter, but it is currently inert.

### 2.7 Missing Allure Annotations in Two Specs

**Severity: Low**

`tests/e2e/playwright-docs-link-monitoring.spec.ts` has no Allure annotations at all — no `feature`, `story`, or `severity` in any `beforeEach`. `tests/sauce/storage-state.spec.ts` has the same omission. These two specs will appear in Allure reports without any classification context, making them harder to filter and categorise in a team dashboard. Every `test.describe` block in the project should have these three annotations; this is the stated project rule and two specs do not follow it.

### 2.8 `storage-state.spec.ts` Missing `test.describe.configure({ mode: 'serial' })`

**Severity: Low-Medium**

The four Sauce tests share implicit state: one test adds a product to the cart and a subsequent test asserts the cart contains one item. If these tests run in parallel (which is the default for E2E projects), the cart-badge test and cart-contents test can race against each other or against a fresh session. The `mode: 'serial'` declaration that protects every other stateful suite in the project is absent here. Currently this works only because the parallel runner happens to schedule them together, which is coincidental, not guaranteed.

### 2.9 Hardcoded MongoDB ObjectId in API Error Tests

**Severity: Low-Medium**

Three tests in `notes-notes-errors.spec.ts` use the literal string `6489a0cee4b0000000000000`:

```ts
const response = await request.get(`${notesUrl}/6489a0cee4b0000000000000`, ...);
```

This ID is formatted as a MongoDB ObjectId. If the Notes API ever migrates to UUID-based IDs (or any other format), this literal will cause the API to return a `400 Bad Request` (invalid ID format) rather than the `404 Not Found` the test expects. The test name says "non-existent note" but the actual assertion would then be testing the wrong error condition. This should at minimum carry an explanatory comment and ideally be replaced with a helper that generates a syntactically valid but non-existent ID in whatever format the API expects.

### 2.10 Compiled Output Committed to Version Control

**Severity: Low**

`tests/performance/dist/performance-testing.ts.js` is a compiled JavaScript artefact checked into the repository. Build output should be in `.gitignore`. If `artillery` requires a compiled file to run, the compilation step should be part of `npm run test:perf` rather than a pre-committed artefact. Committing build output creates a stale-code risk: the `.ts` source and the `.js` build can diverge silently.

### 2.11 ESLint Configuration Provides No TypeScript-Aware Rules

**Severity: Low**

`eslint.config.js` loads `@typescript-eslint/parser` but does not activate any `@typescript-eslint` rules. The parser is present only to allow ESLint to tokenise TypeScript syntax. Without rules like `@typescript-eslint/no-explicit-any`, `@typescript-eslint/no-unsafe-assignment`, or `@typescript-eslint/prefer-nullish-coalescing`, the linter provides no enforcement for the TypeScript-specific quality standards the project aims for. The `any` usages documented in § 2.2 would be caught automatically by `@typescript-eslint/no-explicit-any` if that rule were enabled. The `rules: {}` block in the Playwright plugin section also means all recommended playwright rules are inherited with no project-level tuning.

---

## 3. What Shows Promise but Needs Further Development

### 3.1 `api-schema-validator.ts` — Good Concept, Incomplete Implementation

The structural approach is correct and the `expectMatchesSchema` / `expectArrayMatchesSchema` pair is useful. However:

- **Nested objects are not supported.** `NoteDataSchema` lists `created_at` as `{ type: 'string' }`, but if the API ever changes `created_at` to a nested timestamp object, the validator will report a type mismatch rather than recursing into the structure.
- **`FieldType` is limited to primitives.** `'string' | 'number' | 'boolean'` cannot express arrays, null, or object types.
- **No enum validation.** The `category` field could be validated as one of `'Home' | 'Work' | 'Personal'` rather than just `'string'`, which would catch a misspelled category in API responses.

This utility would become significantly more powerful with either a recursive implementation or by adopting `zod` as the schema definition layer. The investment is proportional: the pattern is already established and replacing the internals would not require changing any test files.

### 3.2 `utilities/error-listeners.ts` — Infrastructure Built, Never Activated

`attachAllErrorListeners`, `attachConsoleErrorListener`, `attachPageErrorListener`, and `attachRequestFailedListener` are all well-implemented. But a search of the entire test suite reveals that none of these functions are called in any spec file. The infrastructure exists but produces no signal. Integrating `attachAllErrorListeners` into the fixture setup (as a `beforeEach` in `page-fixtures/index.ts`) would give every E2E test automatic error capture without any per-spec boilerplate.

### 3.3 `calculator.ts` Utility Leaks Selectors Outside Page Objects

`utilities/calculator.ts` contains raw CSS selectors:

```ts
await page.locator('#calculator .clear').click();
await page.locator('#calculator .keys .operator').filter({ hasText: key }).click();
```

The project rule is that selectors live only in `.page.ts` files. This utility is called from `RandomCalculatorPage.actions.pressKeys`, which means the selectors are effectively inside the page object layer, but they bypass the established `.locators` namespace and cannot be updated from the page class. A cleaner implementation would have `SlowCalculatorPage` and `RandomCalculatorPage` both expose the individual button locators through `.locators`, and the shared interaction logic would take `Locator` arguments rather than raw CSS strings.

### 3.4 Performance Testing — Scenarios Are Rudimentary

The Artillery configuration demonstrates correct integration (proper engine setup, three load phases) but stops short of production-useful measurement:

- No latency thresholds or SLA assertions. Artillery supports `ensure` blocks that fail a run if `p95 > 2000ms`. Without these, the performance test always passes and provides no regression protection.
- Only two scenarios (home page + web form) with a single assertion each.
- No CI artifact generation for the Artillery JSON/HTML report.
- The performance test package has its own `package.json` in `tests/performance/`, which means its dependency tree is separate and can drift from the root. This is probably intentional for the Artillery package version, but it is undocumented.

### 3.5 Mobile Testing — Correctly Structured but Thin

The mobile spec uses `isMobile` guards cleanly and covers touch tap, viewport assertions, `matchMedia` checks, and geolocation via tap. However, only 10 test cases exist across 6 describe groups. The touch interaction group covers a single tap and a single canvas touch. Gesture simulation (swipe, multi-finger tap, pinch-to-zoom with the `touchscreen` API), orientation change emulation, and mobile-specific network conditions (throttled 3G via `cdpSession`) would all be natural extensions.

### 3.6 DB Test Suite Missing Pool Lifecycle Management

`db-client.ts` exports a `closePool()` function that drains the PostgreSQL connection pool gracefully. It is never called. In a Playwright worker process, the pool remains open until the process is terminated by the OS. This is benign in the current setup (each worker processes tests from one project serially) but would matter if DB tests were ever run in parallel workers or if the framework were integrated into a test orchestration system with worker reuse. A `test.afterAll` in a global setup or a `globalTeardown` that calls `closePool()` would be the correct placement.

### 3.7 Tag Strategy Is Defined but Not Exploited in CI

The codebase consistently applies `@smoke`, `@critical`, `@regression`, `@a11y`, and `@visual` tags. The `playwright-reusable.yml` CI workflow (referenced in the README) could run only `@smoke` tests on every commit for a fast feedback loop and reserve the full `@regression` suite for scheduled or pre-merge runs. As currently described, all tests run in one job rather than splitting by tag, which means faster smoke feedback requires manual invocation.

### 3.8 `accessibility-testing.spec.ts` — Pattern Is Right, Output Could Be Richer

The parameterised loop over 29 pages with axe-core is a clean, maintainable pattern. The decision to attach violation JSON as a test artifact is the right call for debugging. Two incremental improvements worth considering:

- **Violation count as a soft threshold**: attach the JSON and also `expect.soft(results.violations.length).toBeLessThanOrEqual(N)` to allow a known baseline of existing violations while still surfacing new ones.
- **Separate describe groups by page category**: the current single `test.describe` means all 29 accessibility tests share one Allure story entry. Grouping by chapter (as the other E2E specs do) would make the Allure report navigable.

---

## 4. Summary Scorecard

| Dimension                          | Rating    | Key Evidence                                                                        |
| ---------------------------------- | --------- | ----------------------------------------------------------------------------------- |
| Project Architecture               | ★★★★★    | Clean 3-tier separation; fixture system; multi-env config                           |
| TypeScript / Type Safety           | ★★★★☆    | `strict: true`, zero tsc errors; `any` leaks in 2 files                             |
| Page Object Model                  | ★★★★☆    | Consistent `.locators`/`.actions` pattern; legacy `>>` selectors in one spec        |
| API Test Design                    | ★★★★★    | Serial token chaining; schema validation utility; error coverage                    |
| DB Integration Tests               | ★★★★★    | `pg_sleep`, sanitization, views, cascades — rarely seen in portfolios               |
| E2E Browser Coverage               | ★★★★☆    | Shadow DOM, getUserMedia, locale, notifications — strong; one legacy selector file  |
| Visual Regression                  | ★★★★★    | Docker-pinned; per-browser baselines in VC; A/B determinism via Math.random mock   |
| Accessibility Coverage             | ★★★★☆    | 29-page axe scan with artifact attach; no violation baseline thresholds             |
| Mobile Testing                     | ★★★☆☆    | Correct structure, correct guards; scenario count is thin                           |
| Performance Testing                | ★★★☆☆    | Correct tool choice and phases; no SLA assertions; dist file committed              |
| Tooling & CI                       | ★★★★☆    | tsc + eslint + prettier all green; TypeScript-aware lint rules not activated        |
| Reporting (Allure)                 | ★★★★☆    | Consistent feature/story/severity; 2 specs missing annotations                     |
| Data Management (Faker)            | ★★★★★    | All dynamic data uses Faker; no hardcoded test strings in test payloads             |
| Code Consistency                   | ★★★★☆    | One rule-break file (webdriver-fundamentals); 3 noteCategories definitions          |
| Documentation                      | ★★★★★    | README is thorough; `.env` pattern documented; arch decisions explained             |

---

## 5. Priority Fix List

The following items are ordered by severity. All are concrete, bounded, and achievable.

| # | File(s)                                             | Issue                                                      | Effort   |
| - | --------------------------------------------------- | ---------------------------------------------------------- | -------- |
| 1 | `tests/e2e/webdriver-fundamentals.spec.ts`          | Replace `>> text=` selectors with modern `filter`/`getByText` | Low    |
| 2 | `tests/db/db-constraints.spec.ts`                   | Replace `catch (err: any)` with `pg.DatabaseError` cast    | Low      |
| 3 | `tests/sauce/sauce-auth.setup.ts`                   | Move `standard_user` / `secret_sauce` to `.env` + `config`| Low      |
| 4 | `tests/performance/performance-testing.ts`          | Replace direct `process.env` with `config.e2eUrl`          | Low      |
| 5 | `fixtures/notes-api-payloads/notes-request-payloads.ts` + `utilities/db-client.ts` | Consolidate `noteCategories` to single source; add `as const` | Low |
| 6 | `tests/sauce/storage-state.spec.ts`                 | Add `test.describe.configure({ mode: 'serial' })` + Allure | Low      |
| 7 | `tests/e2e/playwright-docs-link-monitoring.spec.ts` | Add Allure `feature`, `story`, `severity` annotations      | Low      |
| 8 | `tests/api/notes-notes-errors.spec.ts`              | Replace hardcoded `6489a0cee4b0000000000000` with comment  | Low      |
| 9 | `tests/performance/dist/`                           | Add `tests/performance/dist/` to `.gitignore`              | Low      |
| 10 | `eslint.config.js`                                  | Enable `@typescript-eslint/no-explicit-any` and peer rules | Medium   |
| 11 | `fixtures/db-payloads/db-payload-generators.ts`     | Import `NoteCategory` into `db-client.ts` or delete file   | Low      |
| 12 | `utilities/error-listeners.ts`                      | Wire `attachAllErrorListeners` into fixture `beforeEach`   | Medium   |
| 13 | `utilities/calculator.ts`                           | Move raw selectors into page object `.locators` namespace  | Medium   |
| 14 | `utilities/db-client.ts`                            | Call `closePool()` in a `globalTeardown` or `afterAll`     | Low      |
| 15 | `tests/performance/performance-testing.ts`          | Add Artillery `ensure` blocks for latency SLA thresholds   | Medium   |

---

*Report generated by architectural review of all 5,286 lines of test, page, utility, fixture, and configuration code in the repository.*
