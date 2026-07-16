---
name: playwright-jira-sync
description: >
  Manages JIRA story lifecycle across the STLC — transitions story status, posts test
  result comments, and links test files to stories. Use this skill whenever the user wants
  to update JIRA after writing tests, after a test run, or says things like "update JIRA",
  "mark story done", "transition TAB1-XX", "post test results to story", "link tests to JIRA",
  "move story to In Review", or "close story". Run after test-case-generator (story → In Progress)
  or after a clean test run (story → In Review / Done).

compatibility: >
  Requires Atlassian MCP. cloudId: orhunakkan.atlassian.net. Project: TAB1.
  Read access to project filesystem for test file verification. Output: JIRA updated + summary.
  Operation 4 (Done) additionally requires GitHub CLI (`gh`, authenticated, `repo` scope) to
  look up the lab's PR, poll its CI run, and parse per-browser results as real evidence —
  it no longer accepts a self-reported confirmation.
---

# Playwright JIRA Sync

Keeps JIRA story status aligned with actual test development progress across all 35 labs.

---

## ⛔ Guardrail — Atlassian MCP Required

**Run this check first.**

**If Atlassian MCP is not connected → STOP:**

> ⛔ Atlassian MCP is required for JIRA operations.
> Please connect it and retry.

---

## JIRA Story Map

| JIRA Key | Lab Name                                | URL Path                              |
| -------- | --------------------------------------- | ------------------------------------- |
| TAB1-12  | Network & API                           | /practice/network-api                 |
| TAB1-13  | Forms & Validation                      | /practice/forms-validation            |
| TAB1-14  | Async UI                                | /practice/async-ui                    |
| TAB1-15  | Accessible Locators                     | /practice/accessible-locators         |
| TAB1-16  | Tables & Filtering                      | /practice/tables-filtering            |
| TAB1-17  | Browser Events                          | /practice/browser-events              |
| TAB1-18  | Emulation & Input                       | /practice/emulation-input             |
| TAB1-19  | Debugging & Reporting                   | /practice/debugging-reporting         |
| TAB1-20  | Frames & Contexts                       | /practice/frames-contexts             |
| TAB1-21  | Fake Auth                               | /practice/fake-auth                   |
| TAB1-22  | ARIA Snapshots                          | /practice/aria-snapshots              |
| TAB1-23  | Storage State                           | /practice/storage-state               |
| TAB1-24  | API Request Context                     | /practice/api-request-context         |
| TAB1-25  | Clock & Timers                          | /practice/clock-timers                |
| TAB1-26  | WebSocket Interception                  | /practice/websocket-interception      |
| TAB1-27  | HAR Recording                           | /practice/har-recording               |
| TAB1-28  | Service Workers                         | /practice/service-workers             |
| TAB1-29  | Visual Regression                       | /practice/visual-regression           |
| TAB1-30  | Drag & Drop                             | /practice/drag-and-drop               |
| TAB1-31  | Multi-Tab                               | /practice/multi-tab                   |
| TAB1-32  | Geolocation & Permissions               | /practice/geolocation-permissions     |
| TAB1-33  | Scroll & Lazy Loading                   | /practice/scroll-lazy-loading         |
| TAB1-34  | Media & Locale Emulation                | /practice/media-locale                |
| TAB1-35  | Accessibility Scanning                  | /practice/accessibility-scanning      |
| TAB1-36  | Locator Handlers                        | /practice/locator-handlers            |
| TAB1-37  | Shadow DOM & Web Components             | /practice/shadow-dom                  |
| TAB1-38  | Server-Sent Events                      | /practice/server-sent-events          |
| TAB1-39  | Soft Assertions & Test Steps            | /practice/soft-assertions             |
| TAB1-40  | Init Scripts & Seeding                  | /practice/init-scripts                |
| TAB1-41  | Touch & Mobile Gestures                 | /practice/touch-gestures              |
| TAB1-60  | Passkey Authentication                  | /practice/passkey-authentication      |
| TAB1-61  | Web Storage & Partitioned Cookies       | /practice/client-storage-partitioning |
| TAB1-62  | Console & Runtime Diagnostics           | /practice/console-runtime-diagnostics |
| TAB1-63  | Memory & DOM Leak Diagnostics           | /practice/dom-memory-diagnostics      |
| TAB1-64  | Custom Assertions & Matcher Composition | /practice/custom-assertions           |

---

## STLC Status Flow

```
To Do  →  In Progress  →  In Review  →  Done
  ↑           ↑               ↑           ↑
  Lab        POM +         Tests       Tests
created    spec written    passing    passing in CI
                           locally
```

**Never skip a status** — always confirm the current status before transitioning.

---

## Operations

---

### Operation 1 — Mark Story "In Progress" (test writing started)

**Trigger:** After `locator-mapper` generates the POM for a lab, or when the user starts
writing tests for it.

**Steps:**

1. Fetch current story status via Atlassian MCP
2. Confirm it is "To Do" — if not, ask before proceeding
3. Transition to "In Progress"
4. Post a comment:

```
🚧 Test development started (<date>)

POM file: pages/<lab-name>.page.ts
Spec file: tests/<lab-name>/<lab-name>.spec.ts (pending)

Next: test-case-generator will scaffold the spec from JIRA ACs.
```

---

### Operation 2 — Post Test Results Comment

**Trigger:** After running tests for one or more labs, with a results file or pasted output.

**For each affected story:**

If **any failures:**

```
🔴 Test Run — Failures Detected (<date>)

Result: X passed / Y failed
Affected ACs:
  ❌ <test title 1> — Category: <Selector/Logic/Environment/Flaky/A11y>
  ❌ <test title 2> — ...
  ✅ <test title 3> — passing

Suggested action: <top fix from triage>
Re-run: npx playwright test tests/<lab-name>
```

If **all passing:**

```
✅ All Tests Passing (<date>)

Result: X / X tests passed (Desktop Chrome, Firefox, Edge, Safari)
All JIRA ACs covered:
  ✅ AC-1: <AC text>
  ✅ AC-2: <AC text>
  ...

Story ready for "In Review". Run jira-sync operation 3 to transition.
```

---

### Operation 3 — Transition to "In Review" (all local tests green)

**Trigger:** User confirms all tests pass locally for a lab.

**Pre-condition check:**

1. Read `tests/<lab-name>/<lab-name>.spec.ts` — verify it exists
2. Confirm test count ≥ number of ACs from JIRA (fetch story to count ACs)
3. Ask the user: "Confirm all tests for <lab-name> are passing locally?"

**If confirmed:**

1. Fetch available transitions via Atlassian MCP (`getTransitionsForJiraIssue`)
2. Transition to "In Review"
3. If a PR exists for this lab (`gh pr list --head stlc/<lab-name> --state open --json
number,url`), include its URL in the comment.
4. Post comment:

```
🔍 In Review — Local Tests Passing (<date>)

Spec: tests/<lab-name>/<lab-name>.spec.ts
Tests: X passing (covers all JIRA ACs)
Browsers: Desktop Chrome, Firefox, Edge, Safari
PR: <PR URL, if one exists>

Pending: CI run to confirm cross-environment stability.
```

---

### Operation 4 — Transition to "Done" (CI passing, verified — not self-reported)

**Trigger:** User asks to transition a story to Done (or the `stlc-pipeline` skill reaches
this point automatically). This operation never accepts a plain "yes" as evidence — it looks
up and verifies the actual CI result itself.

**Pre-condition check:**

1. Current status must be "In Review"
2. Resolve the lab's PR: `gh pr list --head stlc/<lab-name> --state all --json
number,url,state --limit 1`
   - **If no PR is found**, do not guess or ask "did CI pass? (yes/no)" — instead ask the
     user for the PR URL or run ID directly (see Edge Cases below).
3. Resolve the PR's latest workflow run:
   `gh run list --branch stlc/<lab-name> --workflow=playwright.yml --limit 1 --json
databaseId,status,conclusion`
   - If the run is still in progress, poll (`gh run watch <databaseId> --exit-status`) until
     it finishes rather than assuming.
4. For each of the 4 browser projects, download the `playwright-report-<project>` artifact and
   parse `playwright-report/results.json`, filtering to `tests/<lab-name>/<lab-name>.spec.ts`.
   Confirm every test in that file passed on every project — an unrelated lab's failure
   elsewhere in the same run must not block this one.
5. Confirm no non-flaky defect linked to the story is still open.

**Only if all of the above hold:**

1. Transition to "Done"
2. Post comment:

```
✅ Done — CI Verified (<date>)

PR: <PR URL> (open — merging is a separate, manual step)
CI run: <run URL> — all 4 browsers passing for this lab's spec
STLC closure: requirements traced → POM → spec → CI green (verified per-browser, not self-reported).
Open blocking defects: 0
```

**If verification fails** (a browser shows this lab's spec failing, or the run hasn't
completed): do not transition. Report exactly which project/test failed, or that the run is
still pending, and leave the story at "In Review".

---

### Operation 5 — Bulk Status Sync

**Trigger:** User says "sync all JIRA stories" or "update JIRA to match repo".

**Steps:**

1. Run the same checks as `coverage-analyzer` — collect spec/POM existence per lab
2. Fetch all 30 story statuses via JQL: `project = TAB1 AND issuetype = Story`
3. For each story, compare JIRA status to local artifact state:

| Local state                         | JIRA status          | Action                                     |
| ----------------------------------- | -------------------- | ------------------------------------------ |
| No POM, no spec                     | To Do                | No change                                  |
| POM exists, no spec                 | To Do                | Transition to In Progress (ask)            |
| Spec exists                         | To Do or In Progress | Ask if tests pass → transition accordingly |
| Spec exists + user confirms passing | In Progress          | Transition to In Review (ask)              |

4. Print a sync plan: list of proposed transitions with confirmation required per story
5. Execute only after user approves the plan

---

## Edge Cases

| Situation                                 | Handling                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| Story already "Done"                      | Note it; ask before adding comment or retransitioning                    |
| Transition not available in JIRA workflow | List available transitions; ask which to use                             |
| Multiple spec files for one story         | Mention all files in the comment                                         |
| User wants to reopen a story              | Transition to "To Do" or "In Progress" with a reason comment             |
| Operation 4: no PR found for the lab      | Ask the user for a PR URL or run ID — do not ask "did CI pass? (yes/no)" |
| Operation 4: `gh` missing/unauthenticated | Stop; report `gh auth status`; cannot verify CI without it               |
| Operation 4: CI run still in progress     | Poll/wait for it to finish; do not transition on a pending run           |

---

## Quick-Start Prompt Template

```
1. Identify which operation (1–5) and which story/stories (TAB1-XX)
2. Verify story exists and fetch current status
3. Execute the operation with Atlassian MCP (Operation 4 also uses `gh` to verify CI evidence)
4. Post the appropriate comment
5. Print confirmation: "TAB1-XX transitioned <from> → <to> and comment posted"
```
