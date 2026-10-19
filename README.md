# agentic-playwright-framework

[![Playwright](https://img.shields.io/badge/Playwright-1.64-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node](https://img.shields.io/badge/Node-22%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)

A Playwright + TypeScript framework in which Claude Code agents carry a feature through the whole
**Software Testing Life Cycle**: requirement analysis, test planning, test design, environment
setup, implementation, execution, defect triage and closure. It covers E2E (cross-browser and
mobile), API, visual, accessibility and performance tests against a live target.

> **Status: `foundation`, `test-harness` and `stlc-artifacts` complete; `stlc-agents` built,
> smoke run pending.** Tooling, env switching, per-type projects, helpers and reference examples
> for every test type, deterministic STLC tooling, and the Claude Code agents and skills are in
> place. See [SPEC.md](SPEC.md) for the design and build order. The MVP runs locally only, with no
> CI.

## Running the STLC with Claude Code

```text
/stlc <feature> [requirements-file]
```

`/stlc` runs the eight phases, writing artifacts to `stlc/<feature>/`:

1. analyze: requirements and acceptance criteria
2. plan: risk-based coverage
3. design: test cases
4. env: preflight and contract drift
5. build: tests
6. run
7. triage: defects and healing
8. report: traceability and exit criteria

It **stops for you twice**:

- **After phase 2.** Review `stlc/<feature>/02-test-plan.md` and set `status: approved` in your
  editor. Claude can't, because a hook blocks it. Then run `/stlc <feature>` again.
- **In phase 5, if the plan has visual tests.** You decide whether baselines are created, then
  review them.

Each phase can also run on its own: `/stlc-analyze`, `/stlc-plan`, `/stlc-design`, `/stlc-env`,
`/stlc-build`, `/stlc-run`, `/stlc-triage`, `/stlc-report`. The first time you open the repo,
Claude Code asks you to trust the project MCP server `playwright-test` (from `.mcp.json`). Approve
it, because the Playwright planner, generator and healer need it.

The pilot target is [Practice Software Testing "Toolshop"](https://practicesoftwaretesting.com), a
public storefront built for test practice. It has a REST API and a
[deliberately buggy twin](https://with-bugs.practicesoftwaretesting.com).

---

## Quick start

```bash
npm ci
npx playwright install chromium firefox webkit
cp .env.example .env        # set BASE_URL, API_URL (and TYPESAFE_API_KEY for the Jev hook)
npm run env:check           # every line should say PASS
npm test
```

## Prerequisites

| Requirement | Notes                                                                                         |
| ----------- | --------------------------------------------------------------------------------------------- |
| Node.js 22+ | Scripts run as TypeScript through Node's native type stripping. Tested on Node 24.            |
| Browsers    | `npx playwright install chromium firefox webkit`                                              |
| Docker      | Linux engine. Only needed for visual tests (`npm run test:visual`).                           |
| Network     | Tests run against the live site in `BASE_URL`. There is no local server or `webServer` block. |

## Configuration

[config/env.ts](config/env.ts) loads environment files in layers. The first source to define a
value wins:

```
shell environment  >  .env.<ENV>  (only when ENV is set)  >  .env
```

| Variable            | Required | Purpose                                                                                                        |
| ------------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| `BASE_URL`          | yes      | UI under test. Becomes Playwright's `baseURL`.                                                                 |
| `API_URL`           | yes      | API under test. `baseURL` of the `api` project.                                                                |
| `API_HEALTH_PATH`   | no       | Path `env:check` probes on the API (default `/`).                                                              |
| `API_SPEC_PATH`     | no       | Where `contract:pull` fetches the OpenAPI document (default `/openapi.json`; Toolshop: `/docs?api-docs.json`). |
| `TEST_ID_ATTRIBUTE` | no       | Attribute behind `getByTestId` (default `data-testid`; Toolshop: `data-test`).                                 |
| `TYPESAFE_API_KEY`  | no       | Used by the Jev skill-routing hook in `.claude/`, not by tests.                                                |

A missing `BASE_URL` or `API_URL` stops the run immediately with a clear error. All `.env*` files
except `.env.example` are git-ignored.

**Switching targets** needs no code change. Create `.env.<name>` and set `ENV`:

```bash
# .env.with-bugs
BASE_URL=https://with-bugs.practicesoftwaretesting.com
API_URL=https://api-with-bugs.practicesoftwaretesting.com
```

```bash
ENV=with-bugs npm run env:check
ENV=with-bugs npm test
```

## Playwright projects

Projects are split by **test type**. Each type has its own folder under `tests/`.

| Project                                                           | Folder         | Runs on                                                 |
| ----------------------------------------------------------------- | -------------- | ------------------------------------------------------- |
| `setup`                                                           | `tests/setup`  | `*.setup.ts` (auth etc.); browser projects depend on it |
| `chromium`, `firefox`, `webkit`, `mobile-chrome`, `mobile-safari` | `tests/e2e`    | Desktop Chrome / Firefox / Safari, Pixel 8, iPhone 16   |
| `api`                                                             | `tests/api`    | No browser; `request` fixture with `API_URL`            |
| `a11y`                                                            | `tests/a11y`   | Desktop Chrome                                          |
| `perf`                                                            | `tests/perf`   | Desktop Chrome, one worker                              |
| `visual`                                                          | `tests/visual` | Desktop Chrome, **in Docker only**                      |

Shared settings: fully parallel, 1 retry, and trace, screenshot and video kept on failure.

## Commands

```bash
npm test                     # all host projects (everything except visual)
npm run test:e2e             # e2e on all five browsers/devices
npm run test:api
npm run test:a11y
npm run test:perf            # run alone for clean timings
npm run test:visual          # visual, inside the Playwright Docker image
npm run test:visual:update   # regenerate visual baselines (review the diff before committing)
npm run env:check            # preflight: target reachable, browsers installed, Docker
npm run contract:pull        # refresh contracts/openapi.json from the target (review the diff)

npm run stlc:new -- <feature> [phase]   # start a feature (01), or add one phase artifact when that phase starts
npm run stlc:lint -- <feature>          # structural check of the artifacts and defects
npm run stlc:gate -- <feature> <phase>  # may phase 1-8 (or analyze|plan|design|env|build|run|triage|report) start?
npm run stlc:run-summary -- <feature>   # write the run block of 04-execution.md from reports/results.json
npm run stlc:defect -- <feature> <AC-n> <file:line>   # create the next DEF-nnn
npm run stlc:trace -- <feature>         # traceability matrix + exit criteria into 05-closure.md
npm run test:scripts                    # unit tests for scripts/ (node --test)

npm run lint                 # eslint (typescript-eslint + eslint-plugin-playwright)
npm run format               # prettier --write .
npm run format:check
npm run typecheck            # tsc --noEmit
```

Useful Playwright flags (append after `--`, for example `npm run test:e2e -- --headed`):

```bash
npx playwright test --project=chromium tests/e2e/<feature>   # one feature, one browser
npx playwright test --grep @AC-2                              # by tag
npx playwright test --ui                                      # UI mode
npx playwright test --list                                    # list without running
```

### Why visual tests run in Docker

Screenshots render differently on each OS. Visual baselines are created and compared only inside
`mcr.microsoft.com/playwright:v<installed version>-noble`.
[scripts/docker-playwright.ts](scripts/docker-playwright.ts) reads the version from the installed
`@playwright/test`, so the image and the library always match. The `visual` project is registered
only when that script sets `PW_VISUAL=1`, so a host run can never create or compare a baseline.

## Reports

| Output                | Where                  | Use                                     |
| --------------------- | ---------------------- | --------------------------------------- |
| list                  | terminal               | live progress                           |
| HTML                  | `playwright-report/`   | `npx playwright show-report`            |
| JSON                  | `reports/results.json` | machine-readable; input to traceability |
| traces, videos, shots | `test-results/`        | `npx playwright show-trace <trace.zip>` |

All four are git-ignored.

## Project structure

```
config/env.ts                 typed, layered env loading
fixtures/index.ts             the test/expect every spec imports (api, workerUser, toMatchContract)
utilities/                    users, contract, accessibility, performance (+ budgets), visual
contracts/openapi.json        pinned API contract
scripts/env-check.ts          preflight (STLC phase 4)
scripts/contract-pull.ts      refresh the pinned contract
scripts/docker-playwright.ts  run Playwright in the pinned Linux image
scripts/stlc/                 deterministic STLC tooling (parser, lint, gate, run summary, defects, trace) + tests
stlc/_templates/              artifact templates (01-05, DEF); stlc/<feature>/ and stlc/defects/ hold the real ones
tests/setup/auth.setup.ts     registers this run's user, signs in, saves .auth/user.json
tests/<type>/examples/        reference examples per test type (@example)
playwright.config.ts          per-type projects, reporters, snapshot paths
eslint.config.js  .prettierrc.json  tsconfig.json
SPEC.md  SPEC-<module>.md     design and per-module specs
CLAUDE.md                     agent instructions and conventions
.claude/                      Claude Code hooks (Jev skill routing); agents come later
```

## Conventions

Test conventions live in [CLAUDE.md](CLAUDE.md) and are enforced by ESLint where possible:

- AC/TC tags on every test
- `positive:` / `negative:` / `boundary:` titles
- role, label or test-id locators
- web-first assertions
- no `waitForTimeout`, `networkidle` or `force`

## Troubleshooting

**`BASE_URL is not set`**: copy `.env.example` to `.env`, or check the `ENV` value and its
`.env.<ENV>` file.

**`browserType.launch: Executable doesn't exist`**: run
`npx playwright install chromium firefox webkit`. `npm run env:check` reports this too.

**Every test fails on navigation**: run `npm run env:check`. The target may be down, or `.env`
may point somewhere else.

**`Project(s) "visual" not found`**: you ran visual tests on the host. Use `npm run test:visual`.

**A test passes alone but fails in the suite**: tests run fully parallel. Confirm with
`--workers=1`, then fix the shared state rather than serializing.

## License

ISC. Author: Orhun Akkan.
