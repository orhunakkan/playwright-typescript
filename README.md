# Playwright TypeScript — STLC Automation Portfolio

## The STLC Pipeline — Agent Skills Breakdown

This project includes a set of Claude Code agent skills that automate a full **Software Testing Life Cycle (STLC)**. Each skill owns one phase; one orchestrator chains them all together so a single JIRA story can go from requirements to passing tests to In Review without manual hand-offs.

---

### Orchestrator: `stlc-pipeline`

The entry point for end-to-end automation. Running `"run stlc-pipeline for TAB1-13"` chains every phase below without stopping for approval. It checks whether each artifact already exists and skips steps accordingly — so if a run fails at test execution, the next run jumps straight back to that point rather than regenerating everything. It stops at **In Review** locally; **Done** is CI-gated by design.

---

### Phase 1 — Requirement Analysis: `requirement-extractor`

Fetches the JIRA story via Atlassian MCP and structures the Acceptance Criteria into numbered, prioritized testable requirements using Given/When/Then format. Beyond copying the ACs verbatim, it derives _implied negative and boundary sub-requirements_ — if an AC says "email must be valid," it generates requirements for malformed inputs, missing fields, and edge values. Everything gets a P1/P2/P3 risk tag, and a performance budget and full-state accessibility requirement are always appended.

---

### Phase 2 — Test Planning: `test-plan-generator`

Takes the structured requirements from the previous phase and produces a formal test plan document at `docs/test-plan/<lab>.test-plan.md`. It reads `playwright.config.ts` directly to pull the real browser matrix — nothing is hardcoded. The output covers scope, test types, environment setup, a risk assessment table, and entry/exit criteria. Those exit criteria are what the pipeline checks against before moving a story to In Review.

---

### Phase 3 — Test Design: `locator-mapper`

Crawls the live page using Playwright MCP for an accessibility tree snapshot and Chrome DevTools MCP for full DOM interrogation — querying every interactive element, validation constraint, and event listener. It then builds a typed **Page Object Model** following Playwright's recommended locator priority: `getByRole` first, CSS selector last and flagged as fragile. The POM is a pure locator registry — no methods, no `goto()`, no helpers. An audit report flags coverage gaps, duplicate selectors, and elements missing semantic roles.

---

### Phase 4 — Test Case Development: `test-case-generator`

Reads the JIRA ACs and the POM, then generates a complete `.spec.ts` file where **each AC becomes a `describe` block** containing positive, negative, boundary, and data-driven cases — never just a single happy-path test per AC. Valid test data is generated with Faker; invalid and boundary inputs use typed case tables iterated with `for...of`. Accessibility scans are appended across every meaningful UI state (load, error, and success — not just load), plus a `@performance` budget test. Framework patterns like custom fixtures or `storageState` are applied or flagged as TODOs if the scaffolding is not yet in place.

---

### Phase 5 — Test Execution

`npx playwright test` — no agent skill here by design. The pipeline runs the spec file directly, captures the exit code, and branches: pass proceeds to In Review, fail goes to triage.

---

### Phase 6 — Defect Management: `test-triage`

Parses the JSON report and categorizes every failure into one of five types: **Selector** (DOM changed), **Logic** (app regression), **Environment** (infra or config), **Flaky** (timing), or **Accessibility** (WCAG violation). Logic and Accessibility failures file real JIRA Bugs linked back to the story. Flaky tests are quarantined, not filed as product bugs. It also closes the loop on re-passes — when a previously failing test passes again, the linked Bug is transitioned to Done. Each defect includes a self-contained Fix Prompt so the issue is actionable without any context from this repo.

---

### Phase 7 — Traceability: `rtm-generator`

Produces the Requirements Traceability Matrix at `docs/rtm/<lab>.rtm.md`, mapping every AC to the test cases covering it, their last pass/fail result, and any linked defects. It enforces a coverage rule: every error locator declared in the POM must be asserted by at least one negative test case. Any unreferenced locator flags the AC as under-covered in the summary.

---

### Phase 8 — Status Lifecycle: `jira-sync`

Manages JIRA story transitions across the full lifecycle: `To Do → In Progress → In Review → Done`. Each transition posts a structured comment with spec file path, test counts, AC coverage, and what remains pending. Done is never transitioned locally — it only moves when CI evidence is provided. A bulk sync operation can compare the entire local repo against all 30 JIRA story statuses and propose transitions in one pass.

---

### Cross-cutting: `coverage-analyzer`

Sits outside the linear flow. Globs `pages/` and `tests/`, cross-references them against the full 30-lab map, fetches live JIRA statuses, and outputs a prioritized coverage table showing which labs are fully covered, POM-only, spec-only, or not started. Its main purpose is answering _"where should I work next?"_ with a concrete recommendation.

---

### Cross-cutting: `framework-scaffolder`

Also outside the linear flow. Implements one of 10 identified framework gaps on demand — auth `storageState`, `page.route` network mocking, custom fixtures, Allure reporting, the flake quarantine pattern, and more. One gap per invocation. Each gap produces ready-to-use scaffolded files with TODO comments marking what needs to be filled in. These patterns are what `test-case-generator` references when applying fixture or retry handling patterns to a generated spec.
