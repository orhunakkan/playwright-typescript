---
name: playwright-stlc-pipeline
description: >
  Runs the full STLC cycle for a single Stagecraft lab end-to-end without stopping for
  approval — from JIRA story to passing tests, an RTM, and the story moved to In Review.
  (Done is CI-gated and not performed by the local run.) Use this skill whenever
  the user wants to fully automate a lab, or says things like "run pipeline for TAB1-XX",
  "full cycle for Forms lab", "run stlc-pipeline", or "automate TAB1-XX end to end".
  Accepts a JIRA story key (TAB1-XX) or lab name. Skips steps already completed.
  Does NOT pause between steps — runs straight through to In Review.

compatibility: >
  Requires ALL of the following:
  - Atlassian MCP (JIRA story fetch + transitions + comments)
  - Playwright MCP (browser navigation, screenshots, accessibility snapshot)
  - Chrome DevTools MCP (DOM queries, event listener inspection)
  - Playwright CLI (running the generated spec file)
  Other agent skills invoked internally: requirement-extractor, test-plan-generator,
  locator-mapper, test-case-generator, jira-sync, test-triage, rtm-generator.
---

# Playwright STLC Pipeline

Orchestrates the full STLC cycle for one lab: requirements → POM → tests → run → triage →
RTM → JIRA In Review (Done is CI-gated). No checkpoints. Skips any step whose output already exists.

---

## JIRA Story Map

| JIRA Key | Lab Name                     | URL Path                          |
| -------- | ---------------------------- | --------------------------------- |
| TAB1-12  | Network & API                | /practice/network-api             |
| TAB1-13  | Forms & Validation           | /practice/forms-validation        |
| TAB1-14  | Async UI                     | /practice/async-ui                |
| TAB1-15  | Accessible Locators          | /practice/accessible-locators     |
| TAB1-16  | Tables & Filtering           | /practice/tables-filtering        |
| TAB1-17  | Browser Events               | /practice/browser-events          |
| TAB1-18  | Emulation & Input            | /practice/emulation-input         |
| TAB1-19  | Debugging & Reporting        | /practice/debugging-reporting     |
| TAB1-20  | Frames & Contexts            | /practice/frames-contexts         |
| TAB1-21  | Fake Auth                    | /practice/fake-auth               |
| TAB1-22  | ARIA Snapshots               | /practice/aria-snapshots          |
| TAB1-23  | Storage State                | /practice/storage-state           |
| TAB1-24  | API Request Context          | /practice/api-request-context     |
| TAB1-25  | Clock & Timers               | /practice/clock-timers            |
| TAB1-26  | WebSocket Interception       | /practice/websocket-interception  |
| TAB1-27  | HAR Recording                | /practice/har-recording           |
| TAB1-28  | Service Workers              | /practice/service-workers         |
| TAB1-29  | Visual Regression            | /practice/visual-regression       |
| TAB1-30  | Drag & Drop                  | /practice/drag-and-drop           |
| TAB1-31  | Multi-Tab                    | /practice/multi-tab               |
| TAB1-32  | Geolocation & Permissions    | /practice/geolocation-permissions |
| TAB1-33  | Scroll & Lazy Loading        | /practice/scroll-lazy-loading     |
| TAB1-34  | Media & Locale Emulation     | /practice/media-locale            |
| TAB1-35  | Accessibility Scanning       | /practice/accessibility-scanning  |
| TAB1-36  | Locator Handlers             | /practice/locator-handlers        |
| TAB1-37  | Shadow DOM & Web Components  | /practice/shadow-dom              |
| TAB1-38  | Server-Sent Events           | /practice/server-sent-events      |
| TAB1-39  | Soft Assertions & Test Steps | /practice/soft-assertions         |
| TAB1-40  | Init Scripts & Seeding       | /practice/init-scripts            |
| TAB1-41  | Touch & Mobile Gestures      | /practice/touch-gestures          |

---

## ⛔ Pre-flight — Resolve Input

Scan the prompt for a JIRA key (`TAB1-\d+`) or a lab name matching the map above.
Resolve to: JIRA key + lab name + URL path + POM path + spec path.

**If nothing resolves → STOP:**

> ⛔ Provide a JIRA story key (e.g. `TAB1-13`) or a lab name (e.g. `Forms & Validation`).

---

## ⛔ Pre-flight — Tool Check

Verify ALL four tools are available before executing any step:

| Tool                | Required For                      |
| ------------------- | --------------------------------- |
| Atlassian MCP       | JIRA reads, comments, transitions |
| Playwright MCP      | Browser navigation, screenshots   |
| Chrome DevTools MCP | DOM and event listener inspection |
| Playwright CLI      | Running the spec file             |

**If any tool is missing → STOP and list exactly which tools are absent.**
Do not attempt to proceed with missing tools — partial execution will produce incomplete artifacts.

---

## Pipeline Execution

Print a pipeline header at the start:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 STLC Pipeline — <Lab Name> (<JIRA Key>)
 Started: <timestamp>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Then execute each step in order. Print a one-line status at the start and end of each step:
`▶ Step N — <name>` and `✅ Step N done` (or `⏭ Step N skipped — <reason>`).

---

### Step 1 — Fetch Requirements (requirement-extractor)

Execute all phases from `requirement-extractor`:

1. Fetch story `TAB1-XX` via Atlassian MCP
2. Extract all Acceptance Criteria bullets verbatim; number them AC-1 … AC-N
3. Derive the implied negative & boundary sub-requirements per AC (requirement-extractor Phase A2)
4. Tag each requirement `[P1/P2/P3]`; always append the performance + all-states a11y requirements
5. Print the requirements list

**No skip condition** — always extract. The requirements drive Step 1b (test plan) and Step 5 (spec).

---

### Step 1b — Generate Test Plan (test-plan-generator)

**Skip if:** `docs/test-plan/<lab-name>.test-plan.md` already exists
→ print `⏭ Step 1b skipped — test plan already exists`.

**Otherwise**, execute `test-plan-generator`: derive scope, the browser matrix (from
`playwright.config.ts`), environments (`.env*`), a risk table (P1→P3), and entry/exit criteria.
Write `docs/test-plan/<lab-name>.test-plan.md`. The exit criteria defined here govern Step 8
(In Review) and Step 8b (Done).

---

### Step 2 — State Check

Check local filesystem (no tools needed):

- Does `pages/<lab-name>.page.ts` exist? → set `HAS_POM = true/false`
- Does `tests/<lab-name>/<lab-name>.spec.ts` exist? → set `HAS_SPEC = true/false`

Print:

```
  POM:  ✅ exists  /  ❌ missing
  Spec: ✅ exists  /  ❌ missing
```

---

### Step 3 — Generate POM (locator-mapper)

**Skip if:** `HAS_POM = true` → print `⏭ Step 3 skipped — POM already exists`

**If skipped:** proceed to Step 4.

**Otherwise**, execute all phases from `locator-mapper`:

1. Navigate to `https://stagecraftlabs.com<url-path>` via Playwright MCP
2. Screenshot + accessibility snapshot
3. Chrome DevTools MCP: query all interactive selectors + validation constraints + event listeners
4. Build locator priority ranking for each element
5. Generate and write `pages/<lab-name>.page.ts` (include file inputs + dynamically-injected
   error/success regions; treat aria-describedby-anchor ids as semantic, not fragile)
6. Print audit summary incl. the coverage-completeness check — every discovered element is mapped

---

### Step 4 — Mark In Progress (jira-sync operation 1)

**Skip if:** JIRA story status is already `In Progress`, `In Review`, or `Done`
→ print `⏭ Step 4 skipped — story already at <status>`

**Otherwise:**

1. Fetch current story status via Atlassian MCP
2. Transition to `In Progress`
3. Post comment:

```
🚧 STLC Pipeline started (<timestamp>)

POM: pages/<lab-name>.page.ts — ✅ generated / ⏭ already existed
Spec: tests/<lab-name>/<lab-name>.spec.ts — pending generation
Pipeline running end-to-end (no manual checkpoints).
```

---

### Step 5 — Generate Spec (test-case-generator)

**Skip if:** `HAS_SPEC = true` → print `⏭ Step 5 skipped — spec already exists`

**If skipped:** proceed to Step 6.

**Otherwise**, execute all phases from `test-case-generator`:

1. Use the ACs + derived negative/boundary requirements from Step 1 (do not re-fetch)
2. Read `pages/<lab-name>.page.ts`
3. Map each AC → one `test.describe()` containing positive + negative + boundary + data-driven
   cases (Phase 4) — **NOT** a single happy-path `test()` per AC
4. Build test data: faker for valid values, typed tables for invalid/boundary (Phase 4b)
5. Import `test`/`expect` from `fixtures/index` and consume the POM fixture (Gap #3)
6. Append multi-state accessibility scans (load + error + success, Phase 5) and a
   `@performance` budget test (Phase 5b)
7. Write `tests/<lab-name>/<lab-name>.spec.ts`; print case-type counts (P/N/B/D/A11y/Perf)

---

### Step 6 — Run Tests (Playwright CLI)

Execute:

```
npx playwright test tests/<lab-name>/<lab-name>.spec.ts --reporter=json,list
```

Capture the exit code and output.

- **Exit 0** (all pass): set `RUN_RESULT = pass`
- **Exit non-zero** (failures exist): set `RUN_RESULT = fail`

---

### Step 7 — Triage or Celebrate

**If `RUN_RESULT = fail`**, execute all phases from `test-triage`:

1. Parse the JSON report
2. Categorize each failure (Selector / Logic / Environment / Flaky / Accessibility)
3. Print triage table
4. Post a JIRA comment on `TAB1-XX` with the failure summary (triage Phase 4)
5. File & link defects for defect-worthy failures — Logic / Accessibility / persistent Selector →
   `createJiraIssue` (Bug) + `createIssueLink` to the story; record in the RTM (triage Phase 4b).
   Flaky → quarantine, Environment → infra task — neither files a product Bug.
6. **Do NOT transition story status** — leave at `In Progress`

Print:

```
⚠️  Pipeline completed with failures.
    Fix the issues above and re-run the pipeline — it will skip Steps 1–5
    (artifacts already exist) and go straight to Step 6.
```

**If `RUN_RESULT = pass`**, print the pass summary and proceed to Step 8.

---

### Step 8 — Transition to In Review (jira-sync operation 3)

**Only reached if `RUN_RESULT = pass` locally.** A local pass is **not** CI evidence, so the
pipeline stops here — it does **not** move the story to Done. This reconciles with `jira-sync`,
where Done means "passing in CI". (Done is handled by Step 8b, off the local path.)

1. Fetch available transitions via Atlassian MCP
2. Transition `TAB1-XX` → `In Review`
3. Refresh the RTM: run `rtm-generator` for `TAB1-XX` → writes `docs/rtm/<lab-name>.rtm.md`
4. Post comment:

```
🔍 In Review — Local Tests Passing (<timestamp>)

Spec: tests/<lab-name>/<lab-name>.spec.ts
Tests: X / X passing locally (<project run>)
RTM: docs/rtm/<lab-name>.rtm.md
Open defects: <N>  (from triage Phase 4b — must be 0 non-flaky to reach Done)
All JIRA ACs covered:
  ✅ AC-1: <text>
  ...
Pending: CI run across all configured browsers to confirm → then Done.
```

---

### Step 8b — Transition to Done (CI-gated — NOT performed by the local pipeline)

The local run **stops at In Review**. Done happens only when CI reports green, via
`jira-sync` operation 4. When CI passes **and** no non-flaky defect from Phase 4b is open:

1. Transition `TAB1-XX` → `Done`
2. Post comment:

```
✅ Done — CI Verified (<timestamp>)

STLC closure: JIRA ACs → POM → spec → RTM → CI green across all browsers.
Open blocking defects: 0
```

Never transition to Done while a non-flaky defect linked to the story is still open.

---

### Step 9 — Pipeline Report

Print the final report regardless of pass/fail:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 STLC Pipeline Report — <Lab Name> (<JIRA Key>)
 Finished: <timestamp>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Step 1  Fetch Requirements   ✅  X ACs retrieved
 Step 1b Generate Test Plan   ✅ written  /  ⏭ skipped (exists)
 Step 2  State Check          ✅  POM: <exists/missing>  Spec: <exists/missing>
 Step 3  Generate POM         ✅ generated  /  ⏭ skipped
 Step 4  Mark In Progress     ✅ transitioned  /  ⏭ skipped
 Step 5  Generate Spec        ✅ X tests written  /  ⏭ skipped
 Step 6  Run Tests            ✅ X/X passing  /  ❌ X failures
 Step 7  Triage               ✅ all green  /  ⚠️ X failures (Bugs filed, JIRA comment posted)
 Step 8  Transition to Review  ✅ TAB1-XX → In Review (+ RTM)  /  ⏭ skipped (failures pending)

 Outcome: ✅ IN REVIEW — CI pending for Done  /  ⚠️ FAILURES — re-run after fixes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Re-run Behaviour

When the pipeline is re-run on the same lab after fixing failures:

- Step 1b is skipped (test plan exists)
- Step 3 is skipped (POM exists)
- Step 5 is skipped (spec exists)
- Execution jumps straight to Step 6 → 7 → 8

To force regeneration of the POM or spec, the user must explicitly delete the file
or say "regenerate POM" / "regenerate spec" before re-running.

---

## Abort Conditions

Stop the pipeline immediately (do not proceed to the next step) if:

| Condition                               | Message                               |
| --------------------------------------- | ------------------------------------- |
| Pre-flight tool check fails             | List missing tools; full stop         |
| JIRA story not found                    | Confirm the key is correct; full stop |
| Lab URL returns 404 or auth wall        | Report URL issue; full stop           |
| `npx playwright test` command not found | Check Node/npm setup; full stop       |
| `pages/` or `tests/` directory missing  | Confirm project root; full stop       |

For all other errors (a single test failure, a POM audit flag, a flaky failure): log and
continue — do not abort the pipeline.

---

## Quick-Start Prompt Template

```
User says: "run stlc-pipeline for TAB1-13"

1. Resolve: TAB1-13 → Forms & Validation → /practice/forms-validation
2. Pre-flight: verify Atlassian MCP + Playwright MCP + Chrome DevTools MCP + Playwright CLI
3. Step 1: fetch ACs from JIRA TAB1-13
4. Step 1b: generate Test Plan (skip if it exists)
5. Step 2: check POM + spec existence
6. Step 3: locator-mapper (skip if POM exists)
7. Step 4: jira-sync → In Progress (skip if already past To Do)
8. Step 5: test-case-generator from TAB1-13 ACs (skip if spec exists)
9. Step 6: npx playwright test tests/forms-validation/forms-validation.spec.ts
10. Step 7: triage failures + file/link Bugs + JIRA comment (or celebrate if all pass)
11. Step 8: refresh RTM + jira-sync → In Review (Done is CI-gated, not run locally)
12. Step 9: print pipeline report
```
