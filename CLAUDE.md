# agentic-playwright-framework

Agentic Playwright + TypeScript framework: Claude Code agents drive a feature through the whole
STLC (requirements → plan → design → env → build → run → triage → closure) for E2E, API, visual,
accessibility and performance tests against a live target set in `.env`. Design and build order
are in [SPEC.md](SPEC.md); each module has its own `SPEC-<module>.md`. Run and config detail is in
[README.md](README.md). Pilot target: Practice Software Testing "Toolshop". Local-only for the
MVP: there is no CI.

## Commands

- `npm run env:check`: preflight (target reachable, browsers, Docker). Run this first when
  tests fail on navigation.
- `npm test`: every host project. Per type: `npm run test:e2e`, `test:api`, `test:a11y`,
  `test:perf`.
- `npm run test:visual` / `test:visual:update`: visual tests, **only** in the pinned Docker image.
- `npm run lint && npm run format:check && npm run typecheck`: run all three before every commit.
- `ENV=<name> npm test`: target `.env.<name>` (for example `with-bugs`) instead of `.env`.

## Layout

- `config/env.ts`: typed env (`BASE_URL`, `API_URL`). Import it; never read `process.env`
  directly in tests.
- `tests/<type>/<feature>/<scenario>.spec.ts`: one Playwright project per type (`e2e`, `api`,
  `a11y`, `perf`, `visual`, plus `setup` for `*.setup.ts`).
- `tests/visual/__snapshots__/`: visual baselines, Linux and Docker only.
- `tests/<type>/examples/`: the **reference examples**, one set per type. Copy their style. They
  carry `@example` instead of REQ/AC/TC tags.
- `fixtures/index.ts`: the `test`/`expect` every spec imports (never from `@playwright/test`).
  - `api`: API_URL client.
  - `workerUser`: a fresh user per worker.
  - `expect(response).toMatchContract(method, pathTemplate)`.
- `utilities/`:
  - `users.ts`: per-run users and `AUTH_FILE`.
  - `accessibility.ts`: `scanWcag`, `withoutKnown`.
  - `performance.ts` (`measurePageLoad`, `throttle`, `SLOW_4G`) with `perf-budgets.ts`.
  - `visual.ts`: `dynamicRegions` to mask.
  - `contract.ts`.
- `contracts/openapi.json`: the pinned API contract. Refresh it only with `npm run contract:pull`,
  and show the diff before committing.
- `reports/results.json`: JSON results from the last run (input to traceability).
- `scripts/`: Node-run TypeScript (`node scripts/x.ts`), using native type stripping, so use
  erasable syntax only and `.ts` import extensions (also used in tests).

## Conventions

- One test per file is fine. Traceability comes from tags: every test carries `@AC-n` and
  `@TC-nnn` (plus `@REQ-<feature>`).
- `describe` blocks are per acceptance criterion. Test titles start with `positive:`,
  `negative:` or `boundary:`.
- Use role, label or test-id locators and web-first assertions. No `waitForTimeout`,
  `networkidle` or `force`; ESLint enforces these.
- POMs are optional. Extract one only when three or more specs share the same locators. A POM
  holds `readonly` locators and a constructor only.
- Each AC gets the test types its risk calls for, as set in the feature's test plan. Not every
  test needs a11y or perf.
- Ask first before updating visual baselines, skipping or deleting a test, or adding a
  dependency. Never weaken an assertion to make a product bug pass.
- **Known-defect pattern.** A real product bug never gets `test.fail()` wrapped around checks
  that currently pass.
  - Keep the functional check as a normal test.
  - Put the defect in its own test with `test.fail()` and an
    `annotation: { type: 'issue', description: 'DEF-nnn' }`.
  - For a11y, list the exact (rule, element) pairs in `KNOWN` and filter them with `withoutKnown`.
  - For perf, add a current-state ceiling.
- **Users.** Never use the target's seeded accounts: other traffic locks them.
  - Signed-in UI tests use `test.use({ storageState: AUTH_FILE })`.
  - Tests that change account state or send bad credentials use `workerUser`.
- **Mobile.** Model what a mobile user does (for example, open the collapsed Filters panel when
  `isMobile`). Don't skip mobile projects.

## Jev skill routing

Jev is TypeSafe's "System One" model. It returns typed answers with probabilities (Choice, Score, Noul), not text.

**Following the routing:**

- **Every prompt goes through Jev first.** A `UserPromptSubmit` hook ([.claude/settings.json](.claude/settings.json) → [.claude/hooks/jev-skill-router.mts](.claude/hooks/jev-skill-router.mts)) asks Jev which agent-skills skills fit the prompt. The answer arrives as a `<jev_skill_routing>` block.
- **Jev's picks are binding.** Load exactly the listed skills with the Skill tool before starting, and follow them. Don't load other agent-skills skills unless the user asks. If the block says no skill fits, load none.
- **If routing is skipped or failed, tell the user.** The hook reports this in its status message. Don't quietly pick skills yourself.
- **Slash commands are not routed.** Prompts starting with `/` already name what to run.

**Tuning:**

- **The settings live at the top of the router script:** `THRESHOLD` (0.5), `MAX_PICKS` (3) and `EXCLUDED_SKILLS`. `using-agent-skills` is excluded because Jev replaces it.
- **Base changes on the log.** Every decision, with all probabilities, is logged to `.claude/jev-routing.log`, which is git-ignored. Check it before changing any setting.

**Calling Jev from code:**

- **SDK:** `@typesafe-ai/sdk` 0.7.0 (requires Node 22+). Read the live docs before writing Jev code, starting at https://docs.typesafe.ai/llms.txt.
- **The API key stays in `.env` as `TYPESAFE_API_KEY`.** `.env` is git-ignored, and `.env.example` is its template.
- **Never read, print or commit `.env`.**
- **Keep the key server-side.** Never set the SDK's `dangerouslyAllowBrowser` option.
