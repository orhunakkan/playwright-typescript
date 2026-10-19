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
- STLC artifacts, all deterministic with no LLM involved:
  - `npm run stlc:new -- <feature> [phase]`: 01 only; each later artifact is created when its phase starts
  - `stlc:lint -- <feature>`
  - `stlc:gate -- <feature> <1-8|name>`: exit 1 means closed. Never start a phase while it's
    closed.
  - `stlc:run-summary -- <feature>`
  - `stlc:defect -- <feature> <AC-n> <file:line>`
  - `stlc:trace -- <feature>`: exit 1 means the exit criteria aren't met.
- `npm run test:scripts`: unit tests for `scripts/` (`node --test`). Run them after changing
  anything there.
- Never set `status: approved` in `stlc/<feature>/02-test-plan.md`: that's the human gate. Never
  hand-edit anything between `<!-- generated:start/end -->`.

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

## STLC workflow (agents)

- **`/stlc <feature> [requirements-file]`** runs phases 1–8 and resumes from artifact statuses.
  The phases are also separate skills: `/stlc-analyze`, `-plan`, `-design`, `-env`, `-build`,
  `-run`, `-triage`, `-report`. Every phase skill checks `stlc:gate` first and verifies with
  scripts afterwards.
- **Agents:**
  - `stlc-analyst`, `stlc-strategist`, `stlc-designer`, `stlc-author`, `stlc-triager` and
    `stlc-reporter` (`.claude/agents/`).
  - Playwright's `playwright-test-planner`, `-generator` and `-healer`: generated by
    `npx playwright init-agents --loop=claude --project chromium`. Never edit them; regenerate
    them (ask first) after a Playwright upgrade.
  - The `playwright-test` MCP server lives in `.mcp.json`.
- **Seeds:** `tests/e2e/seed.spec.ts` (signed out) and `tests/e2e/seed-signed-in.spec.ts`. Always
  pass one explicitly to the planner and generator.
- **Who sets statuses:**
  - Analyst and designer set 01 and 03 to `approved` once lint is clean.
  - **Only the user approves 02.** The `guard-plan-approval` hook blocks any tool call that would
    do it.
  - Triager sets 04 `complete`, and lint rejects it if a failure is left untriaged.
  - Reporter sets 05 `complete`.
- **Healer:** runs only on failures the triager marked `test`. Product defects get a DEF and the
  known-defect pattern.

## Jev skill routing

Jev is TypeSafe's "System One" model. It returns typed answers with probabilities (Choice, Score, Noul), not text.

**Following the routing:**

- **Every prompt goes through Jev first.** A `UserPromptSubmit` hook ([.claude/settings.json](.claude/settings.json) → [.claude/hooks/jev-skill-router.mts](.claude/hooks/jev-skill-router.mts)) asks Jev which agent-skills skills fit the prompt. The answer arrives as a `<jev_skill_routing>` block.
- **Jev's picks are binding.** Load exactly the listed skills with the Skill tool before starting, and follow them. Don't load other agent-skills skills unless the user asks. If the block says no skill fits, load none.
- **If routing is skipped or failed, tell the user.** The hook reports this in its status message. Don't quietly pick skills yourself.
- **Slash commands are not routed.** Prompts starting with `/` already name what to run.

**Tuning:**

- **The settings live at the top of the router script:** `THRESHOLD` (0.5), `MAX_PICKS` (3) and `EXCLUDED_SKILLS`. `using-agent-skills` is excluded because Jev replaces it.
- **Jev sees the user's words and the repository description.**
  - Editor, browser and harness wrapper blocks (`<ide_opened_file>`, `<ide_selection>`,
    `<browser_instruction>`, `<system-reminder>`) are stripped first, by `WRAPPER_TAGS` in the
    router.
  - Subagent hand-backs (`<agent-message from="…">`) are agent output, not requests, so they are
    never routed.
  - The repository context is `package.json`'s `description`. Keep it current when the project's
    purpose changes.
- **Base changes on the log.** Every decision, with all probabilities, is logged to `.claude/jev-routing.log`, which is git-ignored. Check it before changing any setting.

**Calling Jev from code:**

- **SDK:** `@typesafe-ai/sdk` 0.7.0 (requires Node 22+). Read the live docs before writing Jev code, starting at https://docs.typesafe.ai/llms.txt.
- **The API key stays in `.env` as `TYPESAFE_API_KEY`.** `.env` is git-ignored, and `.env.example` is its template.
- **Never read, print or commit `.env`.**
- **Keep the key server-side.** Never set the SDK's `dangerouslyAllowBrowser` option.
