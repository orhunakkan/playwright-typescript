# Spec: stlc-agents

Module id: `stlc-agents` · Parent: [SPEC.md](SPEC.md) · Depends on: `test-harness`, `stlc-artifacts` · Status: **draft — awaiting approval**

## Objective

Add the agents that carry a feature through STLC phases 1–8 in Claude Code, using the harness
(how to test) and the artifact tooling (what was decided, and whether a gate is open).

The split of work stays as in [SPEC.md](SPEC.md):

- **Agents** do the judgement work: reading requirements, choosing coverage, designing cases,
  writing and repairing tests, and classifying failures.
- **Scripts** make every yes/no decision: lint, gate, check-tests, run-summary and trace.
- **A human** approves the test plan and reviews the PR.

This module builds and smoke-tests the agents. The full end-to-end run on a real feature (and on
the buggy twin) is the `pilot` module.

## Facts this design rests on (checked 2026-10-19)

| Fact                                                                                                                                                                                                                                                      | Source                                                                           | Consequence                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `init-agents --loop=claude [--project <p>] [--prompts]` writes the three agent files to `.claude/agents/playwright-test-{planner,generator,healer}.md` and `.mcp.json` (`playwright-test` server, `cmd /c npx playwright run-test-mcp-server` on Windows) | `npx playwright init-agents --help`; `lib/agents/generateAgents.js`; scratch run | We generate them and **never hand-edit** them, because they get regenerated on every Playwright upgrade. Our conventions reach them through the prompts we send. |
| `planner_save_plan.fileName` is any path relative to the workspace root                                                                                                                                                                                   | `lib/mcp/test/plannerTools.js`                                                   | Resolves SPEC.md's open question: UI plans go to `stlc/<feature>/ui-scenarios.md`, and `specs/` isn't used                                                       |
| `planner_setup_page` / `generator_setup_page` take `project` and `seedFile`. Without a `seedFile` they pick the first file in the project whose name contains `seed`, or create one                                                                       | `lib/mcp/test/seed.js`                                                           | Seeds live in `tests/e2e/` (the `chromium` testDir) and are always passed explicitly                                                                             |
| The generator writes **one test per file** to the path given in its prompt; the healer uses `test_run`, `test_debug`, `test_list`                                                                                                                         | `generatorTools.js`, `testTools.js`                                              | File layout and tags are set in the generator prompt, then checked by script                                                                                     |
| Subagents can spawn subagents (3 levels by default)                                                                                                                                                                                                       | https://code.claude.com/docs/en/sub-agents                                       | Orchestration stays in the skill (the main conversation), so nesting stays shallow                                                                               |
| Project skills live in `.claude/skills/<name>/SKILL.md`. Useful fields: `argument-hint`, `disable-model-invocation`, `allowed-tools`, `$0`/`$1`                                                                                                           | https://code.claude.com/docs/en/skills                                           | One orchestrator skill plus one skill per phase                                                                                                                  |
| `PreToolUse` hooks also fire for subagent tool calls. Exit code 2 blocks, and stderr is shown to Claude. `Write` gets `file_path` + `content`; `Edit` gets `file_path`, `old_string`, `new_string`; paths are absolute (backslashes on Windows)           | https://code.claude.com/docs/en/hooks                                            | The human gate on the test plan is enforced by a hook, not just by instructions                                                                                  |
| `playwright test --list --reporter=json` emits the normal JSON report (tags included) without running anything                                                                                                                                            | probed                                                                           | `stlc:check-tests` can check tagging and file layout deterministically                                                                                           |

## Components

### 1. Playwright Test Agents (generated)

- Run `npx playwright init-agents --loop=claude --project chromium` once, and again after each
  Playwright upgrade (ask-first, per SPEC.md).
- The generated `.claude/agents/playwright-test-*.md` files and `.mcp.json` are committed but
  never edited.
- The generated default seed is replaced by ours (below).

### 2. Seeds: `tests/e2e/`

| File                     | Purpose                                                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `seed.spec.ts`           | Signed out: opens `/` and waits for the catalogue. Imports `test` from `fixtures/index.ts`, so generated tests inherit our fixtures |
| `seed-signed-in.spec.ts` | Same, but with `test.use({ storageState: AUTH_FILE })`, for scenarios that need a user                                              |

Both are tagged `@seed` and run as ordinary smoke tests. They add 10 runs per suite: 2 seeds × 5
browser projects.

### 3. Custom subagents: `.claude/agents/stlc-*.md`

Each one has a single job, the smallest tool set that job needs, and ends by running
`npm run stlc:lint -- <feature>`. None of them may change the status of `02-test-plan.md`.

| Agent             | Phase | Reads                                                                                                                                     | Writes                                                                                                                                                                  | Tools (beyond Read/Glob/Grep)                                       |
| ----------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `stlc-analyst`    | 1     | `requirements/<feature>.md` if present. Otherwise explores the app (`planner_setup_page` plus browser tools) and `contracts/openapi.json` | `01-requirements.md`: testable ACs with risk; `source: inferred` when explored                                                                                          | Write, Edit, Bash (`npm run stlc:*`), playwright-test browser tools |
| `stlc-strategist` | 2     | 01, CLAUDE.md conventions, the harness capabilities                                                                                       | `02-test-plan.md`: coverage matrix (risk × type), environments, risks, exit criteria. Leaves `status: draft`                                                            | Write, Edit, Bash (`npm run stlc:*`)                                |
| `stlc-designer`   | 3     | 01, 02 (approved), `ui-scenarios.md` from the Playwright planner, `contracts/openapi.json`                                                | `03-test-cases.md`: one TC per planned AC × type, linked to UI scenarios                                                                                                | Write, Edit, Bash (`npm run stlc:*`)                                |
| `stlc-author`     | 5     | 03, `tests/<type>/examples/`, fixtures and utilities                                                                                      | Non-UI tests (`api`, `a11y`, `perf`, `visual`) under `tests/<type>/<feature>/`. Also normalizes generator output: imports from fixtures, REQ/AC/TC tags, title prefixes | Write, Edit, Bash (`npm run *`, `npx playwright test *`)            |
| `stlc-triager`    | 7     | The run block in 04, `test-results/**/error-context.md`, traces (`npx playwright trace …`)                                                | Triage table in 04 and `DEF-nnn.md` files (via `stlc:defect`). Applies the known-defect pattern to product defects. Lists test defects for the healer                   | Write, Edit, Bash (`npm run stlc:*`, `npx playwright trace *`)      |
| `stlc-reporter`   | 8     | Everything for the feature                                                                                                                | Runs `stlc:trace`. Writes Summary and Lessons in 05. Never edits the generated block                                                                                    | Write, Edit, Bash (`npm run stlc:*`)                                |

Model: `inherit` for all of them, adjustable in frontmatter later. The Playwright agents keep
their generated `model: sonnet`.

### 4. Skills: `.claude/skills/stlc*/SKILL.md`

All have `disable-model-invocation: true`, so they only run when you type them, never by
inference.

| Skill                        | Does                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/stlc <feature> [req-file]` | The orchestrator. Runs `stlc:new` if needed, then for each phase: `stlc:gate` → the phase skill → `stlc:lint`. **It stops** when a gate is closed (the plan approval is the expected stop), when visual baselines need approval, and at the end with a summary for the PR. Rerunning it resumes from the first phase whose gate is open and whose artifact isn't complete |
| `/stlc-analyze <feature>`    | Phase 1 → `stlc-analyst`                                                                                                                                                                                                                                                                                                                                                  |
| `/stlc-plan <feature>`       | Phase 2 → `stlc-strategist`, then tells you to review the plan and set `status: approved` yourself                                                                                                                                                                                                                                                                        |
| `/stlc-design <feature>`     | Phase 3 → `playwright-test-planner` (UI ACs only, `fileName: stlc/<feature>/ui-scenarios.md`, explicit seed) → `stlc-designer`                                                                                                                                                                                                                                            |
| `/stlc-env <feature>`        | Phase 4 → `npm run env:check`, `contract:pull` (shown as a diff only), and setup project. No agent                                                                                                                                                                                                                                                                        |
| `/stlc-build <feature>`      | Phase 5 → for each UI TC, one at a time, `playwright-test-generator` (file `tests/e2e/<feature>/<tc>-<slug>.spec.ts`, tags in the prompt); `stlc-author` for the other types and normalization. Then `stlc:check-tests`, lint, typecheck, and a chromium plus api run of the new tests. A failing test is sent to the healer **only** after triage says `test`            |
| `/stlc-run <feature>`        | Phase 6 → the planned projects for the feature's tests, then `stlc:run-summary`                                                                                                                                                                                                                                                                                           |
| `/stlc-triage <feature>`     | Phase 7 → `stlc-triager`, then `playwright-test-healer` for each `test` verdict, then reruns the healed tests and updates 04                                                                                                                                                                                                                                              |
| `/stlc-report <feature>`     | Phase 8 → `stlc-reporter`. A closed gate on unmet exit criteria is reported, never worked around                                                                                                                                                                                                                                                                          |

### 5. Deterministic additions

- **`npm run stlc:check-tests -- <feature>`**, built on `playwright test --list --reporter=json`
  (no run). It checks that every test tagged `@REQ-<feature>`:
  - lives under `tests/<type>/<feature>/`;
  - has exactly one AC tag and one TC tag, both present in 03;
  - has the type its TC says (its folder matches the TC type) and a correct title prefix.

  It also checks that every TC in 03 has at least one test. Exit 1 on any gap. It gets unit tests
  like the other `stlc:*` scripts.

- **ESLint `no-restricted-imports`:** `@playwright/test` is banned in `tests/**` (type-only
  imports allowed), so specs must import from `fixtures/index.ts`.
- **Plan-approval guard:** `.claude/hooks/guard-plan-approval.mts`, a `PreToolUse` hook on
  `Edit|Write|Bash|PowerShell`.
  - It blocks with exit 2 any agent tool call that would set `status: approved` in
    `stlc/*/02-test-plan.md`:
    - an Edit whose `new_string` adds it;
    - a Write whose `content` has it while the file on disk doesn't;
    - a shell command that names the file together with `approved`.
  - It runs for subagents too. You approve by editing the file yourself in the editor, which
    isn't a tool call.
  - Unit-tested with `node --test`. Registered next to the Jev hook in `.claude/settings.json`;
    the Jev entry is unchanged.
- **Permissions:** `.claude/settings.json` gains `permissions.allow` for `Bash(npm run *)`,
  `Bash(npx playwright test *)` and `Bash(npx playwright trace *)`, so long phases don't stop on
  every command. Nothing destructive is allowed.

## Constraints and risks

- **Session restart needed.** Claude Code loads `.mcp.json` and new agents at session start, and
  asks you once to trust the project MCP server. After task 1 you restart Claude Code and approve
  `playwright-test`. I can't exercise the Playwright agents in the session that creates them.
- **Windows-only MCP command.** The generated `.mcp.json` is Windows-specific (`cmd /c`). That's
  fine for the local-only MVP; CI (deferred) would regenerate it on Linux.
- **Agent output varies.** That's why every phase ends with deterministic checks (lint,
  check-tests, typecheck, gate), and why the skills report those results instead of the agent's
  own claims.
- **Shared public target.** Exploration and generation stay single-browser and sequential, and no
  load is generated (SPEC.md "Never").

## Tasks

1. **Install Playwright agents and seeds.** Run `init-agents --loop=claude --project chromium`,
   replace the default seed with our two seeds, and commit. _Verify:_ the seeds pass on all
   browser projects. **Then you restart Claude Code and approve the MCP server.**
2. **Deterministic guards.** `stlc:check-tests` with unit tests, the ESLint import restriction,
   the plan-approval hook with unit tests, and the permissions. _Verify:_ `test:scripts` green;
   the hook blocks a simulated agent edit to `status: approved` and allows other edits; lint
   fails a spec that imports `@playwright/test`.
3. **Custom subagents:** the six `stlc-*.md` files. _Verify:_ each loads (it's listed by
   `/agents`) and has only its listed tools.
4. **Skills:** `/stlc` and the eight phase skills. _Verify:_ every command a skill names exists
   in `package.json` (checked by script).
5. **Smoke run** in the new session. Run `/stlc contact-form` on Toolshop's contact page (a small
   feature, separate from the pilot's).
   - _Verify:_ 01 and 02 are produced and lint-clean; `/stlc` stops at the plan gate; trying to
     approve through Claude is blocked by the hook.
   - After you approve, phases 3–8 run. `stlc:check-tests` and `stlc:trace` produce a closure
     report.
   - Exit criteria may be NOT MET; the point is that the loop runs.

Each task: lint, format, typecheck and `test:scripts` green, then one commit.

## Success criteria

- [ ] `/stlc <feature>` runs phases 1–2 unattended and stops at the plan gate with a clear
      message.
- [ ] No agent or skill can set `status: approved` on a test plan (hook-enforced and unit-tested).
- [ ] After approval, `/stlc` resumes and finishes phases 3–8 for the smoke feature.
      `stlc:check-tests` passes, and `05-closure.md` has a generated matrix.
- [ ] Generated tests follow CLAUDE.md: fixtures import (lint-enforced), tags (check-tests),
      title prefixes, no CSS/XPath, no `waitForTimeout`.
- [ ] The healer is only ever invoked on `test` verdicts. Product defects get a DEF and the
      known-defect pattern, never a weakened assertion.
- [ ] Generated Playwright agent files are unmodified (`git diff` against a fresh `init-agents`
      run is empty).

## Out of scope

- The pilot feature `product-search` and the with-bugs run (`pilot`).
- CI and headless runs (deferred).
- Jira/ADO sync.
