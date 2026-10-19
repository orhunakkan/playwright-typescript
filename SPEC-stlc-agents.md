# Spec: stlc-agents

Module id: `stlc-agents` · Parent: [SPEC.md](SPEC.md) · Depends on: `test-harness`, `stlc-artifacts` · Status: **approved 2026-10-19, in progress**

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

Ticked only where the task-5 smoke run (contact-form, 2026-10-18/19) showed it.

- [x] `/stlc <feature>` runs phases 1–2 unattended and stops at the plan gate with a clear
      message.
- [ ] No agent or skill can set `status: approved` on a test plan (hook-enforced and unit-tested).
      Unit-tested in task 2. Not shown live: asked to approve, Claude declined before any tool
      call. The hook fired once in the run, as a false positive (see "Task 5 smoke run").
- [x] After approval, `/stlc` resumes and finishes phases 3–8 for the smoke feature.
      `stlc:check-tests` passes, and `05-closure.md` has a generated matrix. Done with the
      user's speed-ups listed under "Task 5 smoke run".
- [x] Generated tests follow CLAUDE.md: fixtures import (lint-enforced), tags (check-tests),
      title prefixes, no CSS/XPath, no `waitForTimeout`. Checked on all 32 contact-form specs,
      which `stlc-author` wrote; the Playwright generator wasn't used.
- [ ] The healer is only ever invoked on `test` verdicts. Product defects get a DEF and the
      known-defect pattern, never a weakened assertion. Only the second half was shown: 7
      failures became DEF-001 to DEF-004 with the pattern. Triage gave no `test` verdicts, so the
      healer path never ran.
- [x] Generated Playwright agent files are unmodified (`git diff` against a fresh `init-agents`
      run is empty). Checked byte for byte against a fresh run in a scratch dir.

## As built (tasks 1–4, 2026-10-19)

Where the build differs from the plan above, this section is what's true.

- **One restart instead of two.** Tasks 2–4 don't need the MCP server, so they were built before
  the restart. You restart once, before the task-5 smoke run.
- **`specs/` removed.** `init-agents` also created `specs/README.md`. It was dropped, because plans
  live in `stlc/<feature>/`. The generated agent files and `.mcp.json` are excluded from Prettier
  so they stay byte-identical.
- **Who sets statuses:** analyst → 01 `approved`; designer → 03 `approved`; triager → 04
  `complete`; reporter → 05 `complete`. Only the user sets 02 `approved`.
- **The guard hook** also blocks any agent edit that keeps an already approved plan approved. An
  agent may set it back to `draft`, which needs re-approval. Shell commands are matched
  heuristically: the file name plus "approved".
- **Gaps found and fixed while designing the skills:**
  - Docker visual runs now write `reports/results-visual.json`. Before, they overwrote the host
    run's `results.json`. `run-summary`, `trace` and `defect` merge both, and the headers name
    each source with its start time.
  - `stlc:lint` rejects a `complete` 04 that leaves any "Needs triage" test without a Triage row.
- **The orchestrator runs phases by reading the phase skill files**, because the phase skills are
  `disable-model-invocation: true` and Claude can't invoke them itself.
- **`definitions.test.ts`** statically checks agents and skills:
  - names;
  - user-only invocation;
  - tools (MCP tools must exist in the generated Playwright agents);
  - npm scripts, agents, gate phases and skill references.
- **`npm run typecheck` and `npm run test:scripts`** now also cover `.claude/hooks/`.

## Task 5 smoke run: status and findings (2026-10-18/19)

- **Status: phases 1–8 done (2026-10-19). Exit criteria MET:** 12/12 ACs covered, 0 open
  critical, 0% flaky. Four defects are open: DEF-001 and DEF-002 major, DEF-003 and DEF-004 minor.
  `stlc/contact-form/`, `stlc/defects/` and the 32 contact-form specs stay uncommitted until the
  user approves that commit.
- **Speed-ups the user chose for phases 3–8** (also recorded in 05):
  - no signed-in planner run; the signed-in TCs were designed from 01 and 02;
  - `stlc-author` wrote the e2e tests instead of the Playwright generator, three authors in
    parallel;
  - phase 6 ran only `chromium`, `api` and `a11y`;
  - the triager's known-defect splits weren't re-run, so the matrix shows those tests as FAIL from
    the pre-triage run.
- **Phase 1 (`stlc-analyst`):** explored the live contact page signed out and signed in. Wrote 12
  ACs (`source: inferred`) and seven open questions, including a possibly ignored first "Send"
  click.
- **Phase 2 (`stlc-strategist`)**, then a fresh-context adversarial review (doubt-driven, one
  cycle, 19 findings), then a strategist revision.
  - Removed: AC-11 negative cases that 01 didn't state.
  - Fewer real sends: AC-10 is set up through the API, and the success-alert a11y scan uses a mocked
    response.
  - Added: four a11y scans, and design notes for deterministic "no request sent" checks.
  - Cross-model review was offered to the user; no answer yet.
- **Bugs found and fixed by the run:**
  - `stlc:new` created all templates up front, and the untouched `02` deadlocked the plan gate.
    Artifacts are now created per phase (commit 3d688cf).
  - `today()` was UTC (commit c377812).
  - Jev routed subagent hand-backs (commit f448129).
  - `/stlc-design` gave the planner one seed, but contact-form's e2e ACs are partly signed out
    and partly signed in. The planner now runs once per seed: `ui-scenarios.md` (signed out) and
    `ui-scenarios-signed-in.md`, and the designer reads both (commit 0daaf6d).
  - Host runs hung with no output. The `playwright-test` MCP server runs a seed with
    `pauseAtEnd` and no timeout, so every analyst or planner session left a browser open,
    recording video into `test-results/` (about 300 MB). On Windows the next host run blocked
    while clearing that dir, and closing the page didn't release it; only stopping the worker did.
    MCP sessions now write to `test-results-mcp/` with video off, and host runs no longer
    collide with them (commit 80ae363).
  - `/stlc-report` checked that rerunning `stlc:trace` left 05 unchanged with `git diff`, which
    ignores untracked files, so the check always passed while `stlc/<feature>/` was uncommitted.
    It now compares `git hash-object` before and after (commit 029237e).
  - 04's triage table showed raw ANSI colour codes, because Playwright's `expect` messages are
    coloured in the JSON report. The error line is now plain text (commit 9e5221d).
  - **Noticed, not fixed:** 04's header names a stale `reports/results-visual.json` from an
    earlier run even when the plan has no visual tests. It adds no rows (contact-form has no
    visual tests), but a stale visual failure of the same feature would be merged in.
  - **Noticed, not fixed:** the plan-approval hook blocked a shell command that only edited this
    spec, because the command mentioned the plan's file name and "approved". That's the documented
    heuristic for shell commands (see "As built"), and it errs on the safe side.
- **Harness helper for AC-10:** `signInAs(context, user)` in `utilities/users.ts` (commit cc95879),
  checked by the session reference example on all five e2e projects.
- **Not yet shown, needed before the spec is complete:**
  - The plan-approval hook blocking a real attempt at approval in a live session (unit tests
    only so far).
  - The healer path: a `test` verdict sent to the healer, then a re-run.
  - The Playwright generator writing phase 5's e2e tests.
  - e2e on `firefox`, `webkit`, `mobile-chrome` and `mobile-safari` for the smoke feature.
  - A run of the known-defect splits, confirming that `test.fail()` and `KNOWN` show as known
    defects in the matrix.
- **Open for the user:**
  - The known-defect splits add one real send per api TC (TC-009, TC-026, TC-028 and TC-030),
    which goes over 02's budget.
  - AC-2's wording leaves out the "Select a subject \*" placeholder option.
  - 01's open questions are unanswered, and DEF-001 depends on one of them (the blur trigger).

## Amendment 1: playwright-cli for exploring and writing tests (draft, for approval)

**Why.** The smoke run's live-browser steps were the slow part. The MCP planner took 15 minutes
for seven signed-out ACs, and the user stopped the second run. Every MCP seed session also stayed
open (`pauseAtEnd`, no timeout) until the host-run hang fixed in 80ae363. `@playwright/cli`
drives the browser from Bash and keeps snapshots in files, not in the model's context. Its README
says it is token-efficient for coding agents, and it recommends MCP for "self-healing tests"
(https://github.com/microsoft/playwright-cli). It makes no claim about speed, so we measure it
(below).

**Changes (recommended defaults):**

1. **Dependency:** `@playwright/cli@0.1.22`, pinned in `devDependencies` and run as `npx
playwright-cli`. It was released 2026-09-28. It ships its own Playwright `1.64.0-alpha`, next to
   our `@playwright/test` 1.64.1.
2. **Config:** `.playwright/cli.config.json` is generated from `config/env.ts` by `npm run
cli:config`, so `testIdAttribute` (Toolshop uses `data-test`; the CLI defaults to
   `data-testid`) can't drift from the tests. Browser `chromium`, headless. `.playwright-cli/`
   (snapshots) is git-ignored. A unit test checks the generated values.
3. **Skills:** run `playwright-cli install --skills` once, review what it writes, and commit it.
   It's treated like the generated agent files: never edited, regenerated (ask first) after an
   upgrade. Where it writes isn't documented; the build checks that.
4. **Phase 1:** `stlc-analyst` explores with the CLI through Bash, not MCP tools. For signed in, it
   first runs `npx playwright test --project=setup`, then `state-load .auth/user.json`.
5. **Phase 3:** the `playwright-test-planner` delegation is removed. `stlc-designer` explores
   with the CLI, using one named session per auth state (`-s=signed-out`, `-s=signed-in`), and
   still writes `ui-scenarios.md` / `ui-scenarios-signed-in.md`.
6. **Phase 5:** the `playwright-test-generator` delegation is removed. `stlc-author` writes the
   e2e tests, as it did in the smoke run, and checks locators with `snapshot` /
   `generate-locator` before running them.
7. **Phase 7 is unchanged:** the healer stays on MCP for `test` verdicts, as the CLI README
   recommends for self-healing.
8. **Cleanup:** each skill that opens CLI sessions ends with `playwright-cli close-all`, and
   `env:check` warns when `playwright-cli list` shows leftover sessions.
9. **Least privilege:** `stlc-analyst` loses its `mcp__playwright-test__*` tools.
   `definitions.test.ts` checks that no skill delegates to the planner or generator, and that the
   analyst, designer and author have no MCP tools.
10. **Generated agent files:** all three stay installed and byte-identical, because `init-agents`
    writes them together. The planner and generator are unused. CLAUDE.md and README say so.

**Success criteria changes:** "Generated tests follow CLAUDE.md" now covers author-written e2e
tests. The generator item leaves "Not yet shown". The others are unchanged.

**Measure it.** Baseline from the smoke run:

| Step                    | Smoke-run time      |
| ----------------------- | ------------------- |
| Planner (signed out)    | 15.0 min            |
| Designer                | 4.7 min             |
| Three authors, parallel | 3.8 / 5.4 / 7.2 min |
| Triager                 | 9.2 min             |

Record the same steps, and subagent tokens, in the pilot's first feature. Target: each
exploration step under 5 minutes.

**Tasks:** A1 dependency, config script and ignores, with a unit test. A2 skills install and
review. A3 agent and skill rewrites, `definitions.test.ts`, docs. A4 measured on the pilot's first
feature. Each task: lint, format, typecheck and `test:scripts` green, then one commit.

**Open decisions (recommendation first):**

- Keep the healer on MCP (recommended), or move it to the CLI too.
- Measure in the pilot (recommended, no extra live run), or re-run phases 1 and 3 for
  contact-form under a scratch feature name first.

## Out of scope

- The pilot feature `product-search` and the with-bugs run (`pilot`).
- CI and headless runs (deferred).
- Jira/ADO sync.
