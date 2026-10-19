# Spec: test-harness

Module id: `test-harness` · Parent: [SPEC.md](SPEC.md) · Depends on: `foundation` · Status: **complete 2026-10-19** (visual baselines awaiting review)

## Objective

Give each test type a small, typed helper and one working example against the live target. The
examples do two jobs:

- They are smoke tests for the harness itself.
- They are the **style reference the agents copy** when they generate tests (`stlc-agents`). So
  they must be exactly what we'd want generated: tagged, prefixed, web-first, with no shortcuts.

## Facts this design rests on (probed 2026-10-19)

| Fact                                                                                                                             | Consequence                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Toolshop marks elements with `data-test` (e.g. `nav-sign-in`, `email`, `password`, `login-submit`)                               | `testIdAttribute` comes from env (`TEST_ID_ATTRIBUTE=data-test`), so `getByTestId` works and stays target-neutral |
| UI auth lives in `localStorage['auth-token']`                                                                                    | `storageState` captures it, so one setup login per run is enough                                                  |
| Seeded `customer@` was **already locked** ("too many failed attempts"); `customer3@` is rejected; `admin@` and `customer2@` work | Shared accounts are unreliable, and negative-login tests against them would lock them for everyone                |
| `POST /users/register` → 201, then login → JWT, and `/users/me` works with a fresh user                                          | Each run can create its own user                                                                                  |
| API is **OpenAPI 3.2.0** at `API_URL/docs?api-docs.json` (57 paths, bearer JWT, `type: [x, "null"]`, no `nullable`)              | Schemas are JSON Schema 2020-12, so use `Ajv2020`, not the default draft-07 `Ajv`                                 |
| Site sits behind Cloudflare (`cf_clearance` cookie)                                                                              | Possible bot challenges. Keep request volume low and treat a challenge page as an _environment_ failure in triage |
| Persistent widgets: `chat-toggle`, `live-activity-toggle`, `notification-bar`                                                    | Masked in visual tests, and considered for a11y scan scope                                                        |

### Change to decision 4 (approved 2026-10-19)

The approved decision was "read flows use the seeded accounts". The evidence above shows those
accounts get locked by other people's traffic. **Proposal:** every authenticated test uses users
this framework creates through `POST /users/register`.

- One user per run for the shared signed-in state.
- One user per worker for tests that change account data or try bad passwords.
- Seeded accounts are never used.

## Components

### Configuration

- `config/env.ts` gains an optional `TEST_ID_ATTRIBUTE` (default `data-testid`). `.env` and
  `.env.example` set `data-test`.
- `playwright.config.ts` reads it into `use.testIdAttribute`. `expect.toHaveScreenshot` defaults:
  `animations: 'disabled'`, `caret: 'hide'`, `maxDiffPixelRatio: 0.01`.

### Fixtures: `fixtures/index.ts`

One merged `test` and `expect` that every spec imports.

| Fixture          | Scope  | Provides                                                                                                                                                           |
| ---------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `api`            | test   | `APIRequestContext` on `API_URL`, usable from any project (e.g. to arrange data before a UI test)                                                                  |
| `workerUser`     | worker | a fresh registered user `{ email, password, token }` for tests that change account state                                                                           |
| `makeAxeBuilder` | test   | `AxeBuilder` preset to WCAG 2.2 A/AA tags (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`). Pattern from https://playwright.dev/docs/accessibility-testing |

### Utilities: `utilities/`

- **`users.ts`:** `registerUser(api)` with unique emails (`apf+<run>-<worker>-<n>@example.com`)
  and a password that meets the documented policy.
- **`accessibility.ts`:** `scanWcag(page, testInfo, { include?, exclude?, disableRules? })` runs
  the scan, attaches the full JSON to the report (as the Playwright docs recommend) and returns
  `violations`.
- **`contract.ts`:** loads `contracts/openapi.json` into `Ajv2020` plus `ajv-formats` and exposes
  `contractViolations(method, path, status, body)`. The fixtures wrap it as a custom matcher,
  `await expect(response).toMatchContract('GET', '/products')`, following the documented
  `expect.extend` pattern. That replaced the planned `expectMatchesContract` helper.
  - It picks the response schema for the actual status code, and treats an undocumented status as
    a violation.
  - It resolves schema and response `$ref`s, and fails with a readable list naming the JSON
    pointer and the schema rule.
  - Strict mode stays on. The pinned spec's only non-standard keyword (`example`) is registered as
    allowed vocabulary, and its four extra formats (`binary`, `float`, `number`, `password`) are
    registered explicitly.
- **`performance.ts`:** `measurePageLoad(page)` returns `{ ttfb, fcp, lcp, cls, domContentLoaded,
transferSize }` from Navigation Timing plus a buffered `PerformanceObserver`.
  `throttle(page, profile)` applies CDP `Network.emulateNetworkConditions` (Chromium only). Budgets
  live in `utilities/perf-budgets.ts`, starting from Google's "good" Web Vitals thresholds: LCP ≤
  2.5 s, CLS ≤ 0.1, TTFB ≤ 0.8 s. They get calibrated against 5 measured runs before being
  committed.
- **`visual.ts`:** `dynamicRegions(page)` returns the locators to mask (chat, live activity,
  notification bar). These are target-specific, so they come from one list.

### Auth setup: `tests/setup/auth.setup.ts`

Registers the run's user through the API, logs in **through the UI** (as a check that login
works), and saves `.auth/user.json` (git-ignored). Tests opt in with
`test.use({ storageState: '.auth/user.json' })`. Browser projects default to signed-out.

### Pinned contract

- `contracts/openapi.json` is a committed snapshot of the API spec.
- `npm run contract:pull` refreshes it from `API_URL + API_SPEC_PATH` (Toolshop:
  `/docs?api-docs.json`; default `/openapi.json`). You review the diff
  before committing (ask-first, like baselines). Contract tests never fetch the live spec, so an
  upstream change shows up as a reviewed diff, not a silent pass.

## Example specs (feature tag `@example`)

Each lives in `tests/<type>/examples/` and is a real test of real Toolshop behaviour:

| Type   | Example                                                                                                                                                                           |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| e2e    | `positive:` search by name lists only matching products · `negative:` nonsense term shows the empty state · `positive:` signed-in user sees their name (uses `storageState`)      |
| api    | `positive:` `GET /products` matches contract · `boundary:` `page` beyond `last_page` returns empty `data` · `negative:` wrong password → 401 for a `workerUser`, one attempt only |
| a11y   | scans of home, login, and login after a failed submit (error state)                                                                                                               |
| perf   | home page cold load within budget (Chromium, no throttling, plus one throttled "Fast 4G" variant)                                                                                 |
| visual | login page screenshot with dynamic regions masked, plus a `toMatchAriaSnapshot` of the main nav                                                                                   |

- Examples use the same `positive:` / `negative:` / `boundary:` titles as generated tests. They
  are tagged `@example` instead of `@REQ-…/@AC-…/@TC-…`, and traceability ignores them.
- **If an example finds a real product issue** (most likely an a11y violation), it is not
  weakened. It gets an `issue` annotation and `test.fail()`, and the finding is listed in the
  handoff for you to decide on. That's the same defect pattern the triage agent will use.

## Dependencies (approved)

`@axe-core/playwright` ^4.14, `ajv` ^8.20, `ajv-formats` ^3.0.

## Tasks

1. **Config, fixtures and auth setup:** `TEST_ID_ATTRIBUTE`, `fixtures/index.ts` (`api`,
   `workerUser`), `utilities/users.ts`, `auth.setup.ts`. _Verify:_ the setup project passes, and
   the signed-in e2e example passes on chromium.
2. **E2E examples on all 5 browser projects.** _Verify:_ `npm run test:e2e -- tests/e2e/examples`
   is green, twice in a row.
3. **Contract and API:** `contracts/openapi.json`, `contract:pull`, `utilities/contract.ts`, API
   examples. _Verify:_ green, and changing the pinned schema locally makes the contract test fail
   with a readable error (then reverted).
4. **A11y:** dependency, `makeAxeBuilder`, `scanWcag`, examples. _Verify:_ green, or real
   violations surfaced through the defect pattern.
5. **Perf:** `performance.ts`, budgets calibrated from 5 runs, example. _Verify:_
   `npm run test:perf` is green 3 times in a row.
6. **Visual:** `visual.ts`, baselines created in Docker, example. _Verify:_ `test:visual:update`
   then `test:visual` is green, and the baseline PNG is committed after your review.

Each task: lint, format and typecheck green, then one commit.

## Success criteria

- [x] `npm test` is green on every host project, and `npm run test:visual` is green in Docker.
- [x] No test uses a seeded account, CSS or XPath selectors, `waitForTimeout`, or `networkidle`.
- [x] Contract failures name the path, status, and failing JSON pointer.
- [x] Every example follows the CLAUDE.md conventions closely enough to be copied by an agent
      unchanged.
- [x] Re-running the whole suite 3 times shows no flaky tests (`flaky: 0` in `reports/results.json`).

## As built (2026-10-19)

Where the build differs from the plan above, this section is what's true.

- **A11y API:** no `makeAxeBuilder` fixture. Instead, `utilities/accessibility.ts` exports:
  - `wcagBuilder(page)` for custom scans
  - `scanWcag(page, testInfo, opts)`
  - `withoutKnown(violations, KNOWN)`, which drops only exact tracked (rule, element) pairs.
    That's narrower than `disableRules` or `exclude`.
- **Contract:** `await expect(response).toMatchContract(method, pathTemplate)`, a custom matcher
  in `fixtures/index.ts`. `API_SPEC_PATH` sets where `contract:pull` fetches from.
- **Perf throttling:** `SLOW_4G` uses Lighthouse's mobile network values via CDP
  `Network.emulateNetworkConditionsByRule`. `emulateNetworkConditions` is deprecated in the CDP
  version Playwright 1.64 ships.
  - Budgets: `GOOD` is web.dev's thresholds.
  - `HOME_SLOW_4G_CEILING` is a current-state ceiling for metrics that already miss `GOOD`.
- **Known-defect pattern, refined.** `test.fail()` never wraps checks that currently pass. A
  functional check stays a normal test. The known defect gets its own expected-failure test with
  `issue` annotations, so a new regression can't hide behind a known failure.
- **Docker runner:** forwards `ENV_KEYS` exported by `config/env.ts`, so new variables can't be
  missed again.
- **Mobile:** search lives in a collapsed Filters panel below the `md` breakpoint. Tests open it
  when `isMobile` is true.

### Findings on the target (not yet DEFs; converted once `stlc-artifacts` exists)

| #   | Type       | Finding                                                                                                                     | Tracked by                                                   |
| --- | ---------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| F1  | functional | Search fired before the initial catalogue loads is overwritten by the slower initial listing response (stale-response race) | comment in `tests/e2e/examples/search.spec.ts` (no test yet) |
| F2  | contract   | `GET /products` past the last page returns `from`/`to` = `null`; contract says `integer`                                    | expected-failure test, `tests/api/examples`                  |
| F3  | contract   | `POST /users/login` returns 401; contract documents only 200                                                                | expected-failure test, `tests/api/examples`                  |
| F4  | a11y       | Language selector: visible text not in accessible name (`label-content-name-mismatch`), all pages                           | `KNOWN` + expected-failure test, `tests/a11y/examples`       |
| F5  | a11y       | Login password-visibility toggle has no accessible name (`button-name`, critical)                                           | same                                                         |
| F6  | a11y       | Category filter lists contain non-`<li>` children (`list`)                                                                  | same                                                         |
| F7  | perf       | Home on slow 4G: LCP 2.8–2.9 s (good ≤ 2.5 s)                                                                               | expected-failure test + ceiling, `tests/perf/examples`       |
| F8  | perf       | Home on slow 4G: CLS 0.258 (poor > 0.25)                                                                                    | same                                                         |

**Unexplained:** the setup project failed in 2 consecutive `test:a11y` runs (about 60 s each:
timeout plus retry) during a burst of registrations, then passed in every later run (3 full
`npm test` runs, 28/28). The failure output was overwritten, so the cause is unconfirmed. The
most likely cause is target rate-limiting. Watch for it.

## Out of scope

- AC/TC tagging rules and the traceability logic (`stlc-artifacts`).
- Playwright's `seed.spec.ts` and agents (`stlc-agents`).
- Load testing.
