# Spec: Agentic STLC Framework

Status: **approved 2026-10-18.** Capability map approved. Decisions are recorded under "Resolved
decisions". The MVP is local-only, and CI is deferred.

## Objective

Turn this repository into a framework where Claude Code agents carry a feature through the whole
Software Testing Life Cycle (STLC), from requirement analysis to closure report. They do this for
every test type Playwright supports except component testing. Humans approve at two points: the
test plan, and the PR with generated or healed tests.

Users:

- **QA engineer (interactive):** runs `/stlc <feature>` in Claude Code, reviews the plan, merges
  the PR.
- **CI (headless):** _deferred past the MVP._ Later it will run the deterministic suite on every
  push, and the agent loop on dispatch or on a schedule.

Target: the app under test is undecided. **Practice Software Testing "Toolshop" v5** is the
stand-in. It is a public storefront built for test practice, with an Angular UI and a REST API
with Swagger docs. It also has a deliberately buggy twin, which lets us show that the defect phase
finds real bugs. Changing targets must only mean editing `.env`, not code.

| Variable      | Value (pilot)                                                                            |
| ------------- | ---------------------------------------------------------------------------------------- |
| `BASE_URL`    | `https://practicesoftwaretesting.com`                                                    |
| `API_URL`     | `https://api.practicesoftwaretesting.com`                                                |
| Buggy variant | `https://with-bugs.practicesoftwaretesting.com` / `api-with-bugs.…`                      |
| API docs      | `https://api.practicesoftwaretesting.com/api/documentation` (all four checked: HTTP 200) |

## STLC → agent mapping

The agents, apart from Playwright's own three, are Claude Code subagents in `.claude/agents/` and
skills in `.claude/skills/`. Deterministic work lives in scripts, not in agents. That covers
running tests, building the traceability matrix and checking gates. The agents handle the steps
that need judgement.

| #   | STLC phase           | Driven by                                                                          | Output artifact                       | Gate           |
| --- | -------------------- | ---------------------------------------------------------------------------------- | ------------------------------------- | -------------- |
| 1   | Requirement analysis | `stlc-analyst` subagent                                                            | `stlc/<feature>/01-requirements.md`   | —              |
| 2   | Test planning        | `stlc-strategist` subagent                                                         | `stlc/<feature>/02-test-plan.md`      | **Human**      |
| 3   | Test design          | Playwright `playwright-test-planner` (UI) + `stlc-designer` (API/visual/a11y/perf) | `stlc/<feature>/03-test-cases.md`     | —              |
| 4   | Environment setup    | `/stlc-env` skill + `scripts/env-check.ts`                                         | console report; auth `storageState`   | must pass      |
| 5   | Test implementation  | Playwright `playwright-test-generator` (UI) + `stlc-author` (other types)          | `tests/**`                            | **Human (PR)** |
| 6   | Execution            | `npx playwright test` (plain, deterministic)                                       | `reports/results.json`, HTML report   | —              |
| 7   | Triage and defects   | `stlc-triager` subagent → Playwright `playwright-test-healer` for test defects     | `stlc/defects/DEF-###.md`             | —              |
| 8   | Closure              | `stlc-reporter` subagent + `scripts/traceability.ts`                               | `stlc/<feature>/05-closure-report.md` | —              |

The `/stlc <feature>` orchestrator skill runs phases 1→8 in order. It stops at each gate and
resumes from the first incomplete phase, which it detects from each artifact's front-matter
`status`. Each phase also has its own skill (`/stlc-analyze`, `/stlc-plan`, …) for re-running one
step.

How phase 7 classifies a failure:

- **Product defect:** writes `DEF-###.md` with repro steps, expected vs actual, trace link and
  severity. The test stays red, annotated `{ type: 'issue', description: 'DEF-###' }`.
- **Test defect:** hands off to the healer.
- **Environment:** reports it and does not touch the test.
- **Flaky:** quarantines it with a `@flaky` tag and a defect note.

If there is no requirements doc, phase 1 explores the app and drafts requirements marked
`source: inferred`. Those go into the plan gate for confirmation, which is the pilot's path,
because Toolshop has no requirements.

## Capability map

| Module id        | Responsibility                                                                                                                                                                                                                                           | Depends on                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `foundation`     | npm scripts, lint/format, tsconfig, env loading (`BASE_URL`, `API_URL`), Playwright projects per test type, Docker image for visual baselines, rewrite stale README/CLAUDE.md                                                                            | —                                |
| `test-harness`   | Per-type fixtures and helpers (API client + OpenAPI schema validation, axe scan, perf budgets, visual config, auth setup project) and one exemplar spec per type against Toolshop. The exemplars also act as the seed and style reference for the agents | `foundation`                     |
| `stlc-artifacts` | Artifact templates (01–05, DEF), ID scheme (`REQ-`, `AC-`, `TC-`, `DEF-`), tag conventions, `scripts/traceability.ts` (JSON report → AC/TC coverage matrix), gate check                                                                                  | `foundation`                     |
| `stlc-agents`    | Install and adapt Playwright Test Agents; custom subagents (analyst, strategist, designer, author, triager, reporter); per-phase skills and `/stlc` orchestrator                                                                                         | `test-harness`, `stlc-artifacts` |
| `pilot`          | Run the full loop on one Toolshop feature (product search → cart), then again on the with-bugs variant; fix the gaps it exposes                                                                                                                          | `stlc-agents`                    |
| `ci-pipelines`   | **Deferred (post-MVP).** Deterministic Playwright workflow and headless agent workflow (`anthropics/claude-code-action@v1`)                                                                                                                              | `pilot`                          |

MVP build order: `foundation` → `test-harness` ∥ `stlc-artifacts` → `stlc-agents` → `pilot`

Each module gets its own `SPEC-<module-id>.md` and its own approval, in that order.

## Tech stack

- Node 22+ (CI pins 24), TypeScript 6, `@playwright/test` 1.64.1 (installed)
- Playwright Test Agents via `npx playwright init-agents --loop=claude` (since 1.56). This
  generates `.claude/agents/playwright-test-{planner,generator,healer}.md`, `.mcp.json`
  (`playwright-test` MCP server), `specs/` and `tests/seed.spec.ts`. Verified by running it in a
  scratch dir.
  Source: https://playwright.dev/docs/test-agents
- Claude Code subagents (`.claude/agents/*.md`) and skills (`.claude/skills/<name>/SKILL.md`).
  Source: https://code.claude.com/docs/en/sub-agents
- Headless CI: `anthropics/claude-code-action@v1` in automation mode (a `prompt` input that can be
  a `/skill`), with auth from `ANTHROPIC_API_KEY` or `CLAUDE_CODE_OAUTH_TOKEN`.
  Source: https://code.claude.com/docs/en/github-actions
- **New dependencies (ask-first, proposed):** `@axe-core/playwright` (a11y), `ajv` + `ajv-formats`
  (OpenAPI response validation), `eslint` + `typescript-eslint` + `prettier` (the README already
  claims them, but they are not installed).
- Kept as is: the Jev skill-routing hook and `@typesafe-ai/sdk`.

## Commands

```bash
npm test                                   # playwright test (all projects)
npm run test:e2e | test:api | test:visual | test:a11y | test:perf   # one test type
npm run test:visual:update                 # regenerate baselines inside the Playwright Docker image
npm run env:check                          # phase 4: reachability, browsers, auth
npm run trace:matrix -- <feature>          # phase 8: AC/TC coverage from results.json
npm run lint && npm run typecheck && npm run format:check
npx playwright show-report
```

In Claude Code: `/stlc <feature>` (full loop), or `/stlc-analyze`, `/stlc-plan`, `/stlc-design`,
`/stlc-env`, `/stlc-build`, `/stlc-run`, `/stlc-triage`, `/stlc-report`.

## Project structure

```
requirements/<feature>.md        input: user stories / ACs (optional; inferred if absent)
stlc/<feature>/01-05-*.md        per-feature STLC artifacts (front-matter: status, ids, dates)
stlc/defects/DEF-###.md          defect reports
specs/                           Playwright planner output (UI scenarios), linked from 03-test-cases.md
tests/
  setup/                         auth.setup.ts, seed.spec.ts
  e2e/<feature>/                 UI journeys          → projects: chromium, firefox, webkit, mobile-*
  api/<feature>/                 request fixture      → project: api (no browser)
  visual/<feature>/              toHaveScreenshot + toMatchAriaSnapshot → project: visual (chromium, Docker)
  a11y/<feature>/                axe WCAG 2.2 AA      → project: a11y (chromium)
  perf/<feature>/                budgets via Navigation Timing / CDP → project: perf (chromium)
pages/                           POMs (optional, see open question 2)
fixtures/index.ts                merged fixtures (apiClient, scanWcag, perfBudget, …)
utilities/                       helpers per test type
contracts/openapi.json           pinned API spec used for schema validation
scripts/                         env-check.ts, traceability.ts, gate-check.ts
.claude/agents/ .claude/skills/  agent definitions
.github/workflows/               playwright.yml, stlc-agent.yml
```

## Code style

```ts
import { test, expect } from '../../../fixtures';

test.describe('AC-2: search filters products by name', () => {
  test('positive: matching term lists only matching products', { tag: ['@REQ-search', '@AC-2', '@TC-004'] }, async ({ page }) => {
    // Step: search for "pliers"
    await page.goto('/');
    await page.getByTestId('search-query').fill('pliers');
    await page.getByTestId('search-submit').click();
    // Expect: every card title contains the term
    await expect(page.getByTestId('product-name').first()).toContainText(/pliers/i);
  });
});
```

- Every test has `@AC-n` and `@TC-nnn` tags, so the traceability script can map it back to a
  requirement.
- Test titles keep the `positive:` / `negative:` / `boundary:` prefixes, and `describe` blocks
  group tests per AC.
- Locators use role, test id or label. Never use CSS/XPath unless no alternative exists, and say
  why in a comment.
- Assertions are web-first (`expect(locator)…`). No `waitForTimeout`.

## Testing strategy

- **Risk-based selection:** the strategist assigns test types per AC in `02-test-plan.md` from a
  risk × type matrix. Not every AC gets every type.
- **Cross-browser:** E2E runs on chromium, firefox, webkit, Pixel 7 and iPhone 15 emulation.
  Visual, a11y and perf run on chromium only, to keep the numbers comparable.
- **API:** contract checks validate status, headers and body against the pinned OpenAPI schema.
  Functional checks cover CRUD and auth, including negative auth and invalid payloads.
- **Visual:** baselines are generated only in `mcr.microsoft.com/playwright:v1.64.1-noble`, so
  they don't depend on the OS. Dynamic regions are masked. ARIA snapshots act as the structural
  regression layer.
- **Accessibility:** `scanWcag()` with WCAG 2.2 AA tags, covering several states per page (initial,
  after interaction, error state).
- **Performance:** single-user budgets (LCP, TTFB, transfer size) with chromium CDP throttling.
  This is **not** load testing.
- **Exit criteria (default, overridable per plan):** 100% of ACs covered by at least one passing
  test or one open defect, no open Critical defects, flaky rate under 2%.
- **Agent quality check:** the pilot runs against the with-bugs variant, and phase 7 must classify
  at least one failure there as a product defect with correct repro steps.

## Boundaries

- **Always:** tag tests with AC/TC IDs; run `lint`, `typecheck` and the affected project before
  any commit; keep the deterministic run free of LLM calls; write each artifact before advancing a
  phase.
- **Ask first:** new dependencies; changing CI triggers or secrets; updating visual baselines;
  deleting a test or marking it skipped; changing exit criteria; regenerating Playwright agent
  definitions after an upgrade.
- **Never:** load or stress testing against the public demo; read, print or commit `.env`; let the
  healer "fix" a product defect by weakening an assertion; auto-merge agent PRs; hardcode
  credentials in tests (use env + `storageState`).

## Success criteria

1. `/stlc product-search` on a clean checkout produces `01`–`03`, stops at the plan gate, and
   continues to `05` after the plan is marked approved, with no manual edits in between.
2. Generated tests cover all five in-scope types where the plan asks for them, and every test
   carries AC/TC tags. `npm run lint && npm run typecheck` pass.
3. `npm test` passes against `practicesoftwaretesting.com` on all configured projects; flaky rate
   under 2% over 5 consecutive runs.
4. Pointing `.env` at the with-bugs variant and running `/stlc-run` and `/stlc-triage` produces at
   least one correctly classified `DEF-###.md` and **zero** healer edits that weaken assertions.
5. `05-closure-report.md` contains a traceability matrix generated by `scripts/traceability.ts`,
   not written by hand.

## Resolved decisions (2026-10-18)

1. **One test per file.** Accept Playwright's generator layout (`tests/e2e/<feature>/<scenario>.spec.ts`).
   Traceability comes from `@AC-n` / `@TC-nnn` tags, not from file layout.
2. **POMs are optional.** Extract a POM only when the same locators appear in three or more specs.
   The "locators only, no methods" rule still applies to any POM that exists.
3. **New dependencies approved:** `@axe-core/playwright`, `ajv` + `ajv-formats`, `eslint` +
   `typescript-eslint` + `eslint-plugin-playwright` + `prettier`.
4. **Test data:** read flows use Toolshop's seeded accounts. Write flows create a unique user per
   run through the API.
5. **CI is out of MVP scope.** Everything runs locally. `ci-pipelines` and the CI-auth question
   are deferred.

## Open questions

1. **Where the planner saves.** Playwright's planner writes to `specs/`. It's unverified whether
   `planner_save_plan` accepts a path under `stlc/<feature>/`. If it doesn't, `specs/` stays and
   `03-test-cases.md` links to it. This gets resolved in `SPEC-stlc-agents.md`.
