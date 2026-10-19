# Spec: test-harness

Module id: `test-harness` · Parent: [SPEC.md](SPEC.md) · Depends on: `foundation` · Status: **draft — awaiting approval**

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

### ⚠ Change to approved decision 4: needs your OK

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
  `expectMatchesContract(response, { method, path })`. It picks the response schema for the
  actual status code, resolves `$ref`s, and fails with a readable list of schema errors. Unknown
  OpenAPI keywords (`example`, `xml`, `discriminator`) are registered as allowed vocabulary instead
  of turning strict mode off.
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
- `npm run contract:pull` refreshes it from `API_URL/docs?api-docs.json`. You review the diff
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

- [ ] `npm test` is green on every host project, and `npm run test:visual` is green in Docker.
- [ ] No test uses a seeded account, CSS or XPath selectors, `waitForTimeout`, or `networkidle`.
- [ ] Contract failures name the path, status, and failing JSON pointer.
- [ ] Every example follows the CLAUDE.md conventions closely enough to be copied by an agent
      unchanged.
- [ ] Re-running the whole suite 3 times shows no flaky tests (`flaky: 0` in `reports/results.json`).

## Out of scope

- AC/TC tagging rules and the traceability logic (`stlc-artifacts`).
- Playwright's `seed.spec.ts` and agents (`stlc-agents`).
- Load testing.
