# Agent Skills — STLC Automation for Playwright

This folder holds a set of **Claude Code agent skills** that together automate a full
**Software Testing Life Cycle (STLC)** for the [Stagecraft Labs](https://stagecraftlabs.com)
practice site. Each skill owns one phase of the cycle; one orchestrator skill chains them all
together so a single JIRA story can go from _requirements_ to _passing tests_ to an open PR
verified green by real GitHub Actions CI to _Done_, without manual hand-offs — except merging
the PR, which always stays a human decision.

If you are reading this to understand "how the STLC flow works," start with
[The STLC flow in one picture](#the-stlc-flow-in-one-picture), then read
[The pipeline, step by step](#the-pipeline-step-by-step).

---

## What an "agent skill" is here

Each `*.md` file in this folder is a **skill**: a Markdown document with YAML frontmatter
(`name`, `description`, `compatibility`) followed by step-by-step instructions Claude follows
when the skill is invoked. The `description` field is what Claude matches against a user's
request to decide _which_ skill to run, so it lists trigger phrases like "extract requirements"
or "generate a POM".

Skills are **deterministic playbooks**, not code. They tell the agent exactly which tools to
call, in what order, what guardrails to enforce, and what artifact to produce. A skill stops
early ("⛔ guardrail") rather than guessing when it lacks a required input or tool.

---

## The domain: Stagecraft Labs + JIRA

The whole flow is built around a fixed catalog of **36 practice "labs"** (Forms & Validation,
Async UI, Network & API, etc.), each mapped 1:1 to a **JIRA story** in project `TAB1`
(keys `TAB1-12` … `TAB1-41`, `TAB1-60` … `TAB1-64`, `TAB1-67`) and a **URL path** under `/practice/...`. This mapping table is
embedded in every skill that needs it, so any skill can resolve a lab name → JIRA key → URL →
file paths without external lookups.

| Input you give         | Resolves to                                       |
| ---------------------- | ------------------------------------------------- |
| `TAB1-13`              | Forms & Validation · `/practice/forms-validation` |
| `Forms & Validation`   | `TAB1-13` · `/practice/forms-validation`          |
| a full `https://…` URL | the matching lab (web fallback path)              |

Naming convention used throughout: a lab kebab-name `forms-validation` →
POM class `FormsValidationPage`, fixture key `formsValidationPage`, files
`pages/forms-validation.page.ts` and `tests/forms-validation/forms-validation.spec.ts`.

---

## The tools each skill depends on

Skills call out to five external capabilities. A skill checks for the ones it needs up front
and **stops** if any are missing rather than producing a partial artifact.

| Tool                    | Used for                                                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Atlassian MCP**       | Fetch JIRA stories/ACs, post comments, transition status, file & link Bugs (`cloudId: orhunakkan.atlassian.net`) |
| **Playwright MCP**      | Browser navigation, screenshots, accessibility-tree snapshots                                                    |
| **Chrome DevTools MCP** | DOM interrogation, validation constraints, event-listener detection, Lighthouse                                  |
| **Playwright CLI**      | Actually running the generated spec files                                                                        |
| **GitHub CLI (`gh`)**   | Branch push, PR creation, polling the real CI run, downloading per-browser report artifacts to verify Done       |

---

## The STLC flow in one picture

```
   ┌─────────────────────────────────────────────────────────────────────┐
   │                    playwright-stlc-pipeline                          │
   │                  (orchestrator — runs end to end)                    │
   └─────────────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌───────────────┐   STLC: Requirement Analysis
  │ requirement-  │   Pull ACs from JIRA, derive negative/boundary
  │ extractor     │   sub-requirements, tag P1/P2/P3
  └───────┬───────┘
          ▼
  ┌───────────────┐   STLC: Test Planning
  │ test-plan-    │   Scope, browser matrix, risk table, entry/exit
  │ generator     │   → docs/test-plan/<lab>.test-plan.md
  └───────┬───────┘
          ▼
  ┌───────────────┐   STLC: Test Design (page model)
  │ locator-      │   Crawl the live page, build a typed Page Object Model
  │ mapper        │   → pages/<lab>.page.ts   (+ register in fixtures/index.ts)
  └───────┬───────┘
          ▼
  ┌───────────────┐   STLC: Test Case Development
  │ test-case-    │   One describe per AC; positive + negative + boundary +
  │ generator     │   data-driven + a11y + perf  → tests/<lab>/<lab>.spec.ts
  └───────┬───────┘
          ▼
       [ run: npx playwright test ]   STLC: Test Execution
          │
     ┌────┴─────┐
     ▼          ▼
  (pass)     (fail)
     │          ▼
     │   ┌───────────────┐   STLC: Defect Mgmt / Closure
     │   │ test-triage   │   Categorize failures, file & link Bugs,
     │   │               │   comment on JIRA
     │   └───────────────┘
     ▼
  ┌───────────────┐   STLC: Traceability
  │ rtm-generator │   AC → test case → result → defect
  │               │   → docs/rtm/<lab>.rtm.md
  └───────┬───────┘
          ▼
  ┌───────────────┐   STLC: Status lifecycle
  │ jira-sync     │   To Do → In Progress → In Review → Done
  └───────┬───────┘   (Done verified per-lab from a real GitHub Actions run — never self-reported)
          ▼
       [ branch → PR (gh) → CI run → per-browser report parse ]
          │
     PR stays open — merge is a manual, human step

  Cross-cutting (run any time, not in the linear path):
   • coverage-analyzer    — which of the 36 labs have POM/spec/tests; what to do next
   • framework-scaffolder — implement one of 10 framework gaps (fixtures, auth, mocking…)
```

---

## The skills

### Orchestrator

| Skill                        | File                                 | What it does                                                                                                                                                                                                                                    |
| ---------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **playwright-stlc-pipeline** | [stlc-pipeline.md](stlc-pipeline.md) | Runs the entire cycle for one lab end-to-end, **no checkpoints**, skipping any step whose output already exists. Opens a PR, waits for real CI, and reaches **Done** once this lab's tests are verified green per browser. Never merges the PR. |

### Phase skills (the linear path)

| Skill                     | File                                                 | STLC phase                  | Output                                              |
| ------------------------- | ---------------------------------------------------- | --------------------------- | --------------------------------------------------- |
| **requirement-extractor** | [requirement-extractor.md](requirement-extractor.md) | Requirement analysis        | Structured, prioritized requirements list (in chat) |
| **test-plan-generator**   | [test-plan-generator.md](test-plan-generator.md)     | Test planning               | `docs/test-plan/<lab>.test-plan.md`                 |
| **locator-mapper**        | [locator-mapper.md](locator-mapper.md)               | Test design (page model)    | `pages/<lab>.page.ts` (locator-only POM)            |
| **test-case-generator**   | [test-case-generator.md](test-case-generator.md)     | Test case development       | `tests/<lab>/<lab>.spec.ts`                         |
| **test-triage**           | [test-triage.md](test-triage.md)                     | Defect management / closure | Triage table + JIRA Bugs/comments                   |
| **rtm-generator**         | [rtm-generator.md](rtm-generator.md)                 | Traceability                | `docs/rtm/<lab>.rtm.md`                             |
| **jira-sync**             | [jira-sync.md](jira-sync.md)                         | Status lifecycle            | JIRA transitions + comments                         |

### Cross-cutting skills

| Skill                    | File                                               | What it does                                                                                                                                                                                                                         |
| ------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **coverage-analyzer**    | [coverage-analyzer.md](coverage-analyzer.md)       | Reports which of the 36 labs have a POM, a spec, both, or neither — with live JIRA status — and recommends the next lab to work on.                                                                                                  |
| **framework-scaffolder** | [framework-scaffolder.md](framework-scaffolder.md) | Implements one of 10 identified framework gaps on demand (auth `storageState`, `page.route` mocking, custom fixtures, global setup, typed env, Allure, seeding, flake/quarantine, worker isolation, mobile). One gap per invocation. |

---

## The pipeline, step by step

This is what `playwright-stlc-pipeline` does when you say _"run stlc-pipeline for TAB1-13"_.
It is a straight run-through — it never pauses for approval — and it **skips any step whose
artifact already exists**, which is what makes re-runs cheap.

| Step       | Name                                       | Delegates to                   | Skip condition                                         |
| ---------- | ------------------------------------------ | ------------------------------ | ------------------------------------------------------ |
| Pre-flight | Resolve input + tool check                 | —                              | Stops if no lab resolves or a required tool is missing |
| **1**      | Fetch requirements                         | requirement-extractor          | Never skipped — drives steps 1b & 5                    |
| **1b**     | Generate test plan                         | test-plan-generator            | Test plan file already exists                          |
| **2**      | State check (POM? spec?)                   | — (filesystem)                 | —                                                      |
| **3**      | Generate POM                               | locator-mapper                 | POM file already exists                                |
| **3.5**    | Register POM as a fixture                  | edits `fixtures/index.ts`      | Fixture already registered                             |
| **4**      | Mark JIRA _In Progress_                    | jira-sync (op 1)               | Story already past _To Do_                             |
| **5**      | Generate spec                              | test-case-generator            | Spec file already exists                               |
| **6**      | Run tests                                  | Playwright CLI                 | —                                                      |
| **7**      | Triage **or** celebrate                    | test-triage (on failure)       | Skipped when all pass                                  |
| **8**      | Refresh RTM, push branch, open PR          | git + `gh pr create`           | Reuses the open PR if one already exists for this lab  |
| **9**      | Transition _In Review_                     | jira-sync (op 3)               | Skipped if tests failed                                |
| **10**     | Wait for CI                                | `gh run watch`                 | —                                                      |
| **11**     | Parse this lab's CI result                 | `gh run download` + JSON parse | —                                                      |
| **12**     | Transition _Done_ **or** CI-failure triage | jira-sync (op 4) / test-triage | Done only if this lab passed on every browser          |
| **13**     | Pipeline report                            | —                              | —                                                      |

### How Done is verified

A local green run is **not** CI evidence. Step 8 pushes a branch and opens a real PR against
`main`, which fires the existing `.github/workflows/playwright.yml` matrix. The pipeline blocks
(Step 10) until that run finishes, then (Step 11) downloads each browser's
`playwright-report-<project>` artifact and parses `results.json` to confirm **specifically
this lab's spec file** passed on every browser — not just that the whole run was green, which
could be blocked by an unrelated flaky lab. Only then does `jira-sync` operation 4 transition
the story to Done; it never accepts a plain "yes" as evidence.

### Why merging stays manual

The pipeline opens a PR instead of pushing straight to `main` so there's a real review
checkpoint. It never runs `gh pr merge` — Done reflects "this lab's tests are verified passing
in CI," not "this code is merged." Merging the PR is left as an explicit next step for a human.

### Re-run behavior

Re-running the pipeline on the same lab after fixing a **local** failure skips steps 1b, 3, and
5 (those artifacts exist) and jumps straight to **Step 6 → 7 → 8**. Re-running after fixing a
**CI-only** failure (Step 12 triage) reuses the existing open PR — pushing the fix as a new
commit — and jumps straight to **Step 10 → 11 → 12**. To force regeneration of the POM or spec,
delete the file or explicitly say "regenerate POM" / "regenerate spec".

---

## Design principles baked into every skill

These conventions are what make the suite a _real_ STLC rather than "some Playwright tests".

- **Guardrails over guessing.** Every skill validates its inputs and required tools first and
  emits a `⛔` stop message rather than fabricating a URL, an AC, or a partial artifact.
- **Beyond the happy path.** `requirement-extractor` derives _implied_ negative and boundary
  sub-requirements from AC trigger words ("required", "valid email", "at least N"), and
  `test-case-generator` turns each AC into a `describe` containing positive **+** negative **+**
  boundary **+** data-driven cases. A happy-path-only spec is treated as a generation failure.
- **Risk-based prioritization.** Requirements are tagged `P1/P2/P3`; the test plan orders work
  P1 → P2 → P3 and defines exit criteria against those tags.
- **Locators are a registry, not behavior.** A POM file contains only `readonly` locator
  declarations and a constructor — no methods, no `goto()`. Locator priority follows
  Playwright's recommended order (`getByRole` → `getByLabel` → … → CSS as flagged fallback).
- **Accessibility & performance are always-on.** Every spec appends multi-state axe-core scans
  (load + error + success states, not just load) and a `@performance` budget test.
- **Traceability is explicit.** The RTM maps every AC to the concrete test cases covering it,
  their last result, and any linked defect — and flags ACs that are under-covered.
- **Defects have a lifecycle.** Triage doesn't just comment; it files JIRA Bugs for
  defect-worthy failures (Logic, Accessibility, persistent Selector), links them to the story,
  records them in the RTM, and closes them on re-pass. Flaky → quarantine; Environment → infra
  task. Neither files a product Bug.
- **CI evidence over self-report.** Done is never taken on a human's word. `jira-sync`
  operation 4 looks up the lab's PR, waits for its GitHub Actions run, and parses the actual
  `results.json` per browser before transitioning — a "yes" alone was never enough.

---

## How to run it

You don't run these files directly — you invoke the skill by describing what you want, and
Claude matches your request to a skill's `description`. Examples:

```text
"run stlc-pipeline for TAB1-13"          → full end-to-end pipeline
"what should I test in TAB1-16"          → requirement-extractor
"write the test plan for Forms lab"      → test-plan-generator
"generate a POM for <full URL>"          → locator-mapper
"generate tests for TAB1-13"             → test-case-generator
"tests failed, triage this output"       → test-triage
"build the RTM for TAB1-13"              → rtm-generator
"move TAB1-13 to In Review"              → jira-sync
"what's covered / where should I start"  → coverage-analyzer
"scaffold gap #3" / "set up fixtures"    → framework-scaffolder
```

Each skill's `## Quick-Start Prompt Template` section (at the bottom of every file) shows the
exact internal sequence that skill follows once invoked.

---

## Where the artifacts land

| Artifact                           | Location                                                         | Produced by                                                      |
| ---------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| Page Object Models                 | `pages/<lab>.page.ts`                                            | locator-mapper                                                   |
| Fixture registration               | `fixtures/index.ts`                                              | stlc-pipeline (Step 3.5)                                         |
| Spec files                         | `tests/<lab>/<lab>.spec.ts`                                      | test-case-generator                                              |
| Test plans                         | `docs/test-plan/<lab>.test-plan.md`                              | test-plan-generator                                              |
| Traceability matrices              | `docs/rtm/<lab>.rtm.md`                                          | rtm-generator                                                    |
| JIRA Bugs, comments, transitions   | JIRA project `TAB1`                                              | test-triage, jira-sync                                           |
| JSON test report (local)           | `playwright-report/results.json`                                 | Playwright CLI (consumed by triage & RTM)                        |
| Feature branch + PR                | `stlc/<lab>` on GitHub, PR against `main`                        | stlc-pipeline (Step 8), left open for manual merge               |
| JSON test report (CI, per browser) | `playwright-report-<project>` artifact on the GitHub Actions run | CI workflow (consumed by stlc-pipeline Step 11 / jira-sync op 4) |
