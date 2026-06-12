---
name: playwright-stlc-pipeline
description: >
  Runs the full STLC cycle for a single Stagecraft lab end-to-end without stopping for
  approval — from JIRA story to passing tests and closed story. Use this skill whenever
  the user wants to fully automate a lab, or says things like "run pipeline for TAB1-XX",
  "full cycle for Forms lab", "run stlc-pipeline", or "automate TAB1-XX end to end".
  Accepts a JIRA story key (TAB1-XX) or lab name. Skips steps already completed.
  Does NOT pause between steps — runs straight through to Done.

compatibility: >
  Requires ALL of the following:
  - Atlassian MCP (JIRA story fetch + transitions + comments)
  - Playwright MCP (browser navigation, screenshots, accessibility snapshot)
  - Chrome DevTools MCP (DOM queries, event listener inspection)
  - Playwright CLI (running the generated spec file)
  Other agent skills invoked internally: requirement-extractor, locator-mapper,
  test-case-generator, jira-sync, test-triage.
---

# Playwright STLC Pipeline

Orchestrates the full STLC cycle for one lab: requirements → POM → tests → run → triage →
JIRA closed. No checkpoints. Skips any step whose output already exists.

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

Execute the JIRA path from `requirement-extractor`:

1. Fetch story `TAB1-XX` via Atlassian MCP
2. Extract description and all Acceptance Criteria bullets verbatim
3. Number them AC-1 … AC-N and print them

**No skip condition** — always fetch ACs; they drive Step 5.

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
5. Generate and write `pages/<lab-name>.page.ts`
6. Print audit summary (element counts + flags)

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

1. Use the ACs fetched in Step 1 (do not re-fetch)
2. Read `pages/<lab-name>.page.ts`
3. Map each AC → one `test()` block with AC comment + derived title
4. Apply framework patterns from the JIRA map table (or TODO-comment missing scaffolds)
5. Append axe-core accessibility test
6. Write `tests/<lab-name>/<lab-name>.spec.ts`
7. Print test count summary

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

**If `RUN_RESULT = fail`**, execute triage from `test-triage`:

1. Parse the JSON report
2. Categorize each failure (Selector / Logic / Environment / Flaky / Accessibility)
3. Print triage table
4. Post a JIRA comment on `TAB1-XX` with the failure summary (triage Phase 4)
5. **Do NOT transition story status** — leave at `In Progress`

Print:

```
⚠️  Pipeline completed with failures.
    Fix the issues above and re-run the pipeline — it will skip Steps 1–5
    (artifacts already exist) and go straight to Step 6.
```

**If `RUN_RESULT = pass`**, print the pass summary and proceed to Step 8.

---

### Step 8 — Transition to Done (jira-sync operations 3 + 4)

**Only reached if `RUN_RESULT = pass`.**

1. Fetch available transitions via Atlassian MCP
2. Transition `TAB1-XX` → `In Review`
3. Post comment:

```
🔍 In Review — All Tests Passing (<timestamp>)

Spec: tests/<lab-name>/<lab-name>.spec.ts
Tests: X / X passing (Chrome, Firefox, Edge, Safari)
All JIRA ACs covered:
  ✅ AC-1: <text>
  ✅ AC-2: <text>
  ...
```

4. Immediately transition `TAB1-XX` → `Done`
5. Post comment:

```
✅ Done — STLC Pipeline Complete (<timestamp>)

STLC closure: JIRA ACs → POM → spec → all tests green.
```

---

### Step 9 — Pipeline Report

Print the final report regardless of pass/fail:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 STLC Pipeline Report — <Lab Name> (<JIRA Key>)
 Finished: <timestamp>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Step 1  Fetch Requirements   ✅  X ACs retrieved
 Step 2  State Check          ✅  POM: <exists/missing>  Spec: <exists/missing>
 Step 3  Generate POM         ✅ generated  /  ⏭ skipped
 Step 4  Mark In Progress     ✅ transitioned  /  ⏭ skipped
 Step 5  Generate Spec        ✅ X tests written  /  ⏭ skipped
 Step 6  Run Tests            ✅ X/X passing  /  ❌ X failures
 Step 7  Triage               ✅ all green  /  ⚠️ X failures (JIRA comment posted)
 Step 8  Transition to Done   ✅ TAB1-XX → Done  /  ⏭ skipped (failures pending)

 Outcome: ✅ COMPLETE  /  ⚠️ FAILURES — re-run after fixes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Re-run Behaviour

When the pipeline is re-run on the same lab after fixing failures:

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
4. Step 2: check POM + spec existence
5. Step 3: locator-mapper (skip if POM exists)
6. Step 4: jira-sync → In Progress (skip if already past To Do)
7. Step 5: test-case-generator from TAB1-13 ACs (skip if spec exists)
8. Step 6: npx playwright test tests/forms-validation/forms-validation.spec.ts
9. Step 7: triage failures + JIRA comment (or celebrate if all pass)
10. Step 8: jira-sync → In Review → Done (only if all pass)
11. Step 9: print pipeline report
```
