---
name: playwright-test-triage
description: >
  Analyzes Playwright test failures, categorizes root causes, suggests specific fixes, posts
  results to JIRA, and produces an STLC Phase 6 closure summary. Use this skill whenever
  tests have failed and the user wants to understand why, wants failures categorized, wants
  a fix plan, wants to update JIRA with results, or says things like "tests failed",
  "triage failures", "what broke", "analyze test output", "post results to JIRA", "why is
  this failing", or "test closure report". Accepts a JSON report path or pasted terminal
  output. Optionally posts triage results as JIRA comments and transitions stories.

compatibility: >
  Read-only analysis: accepts playwright-report/results.json path OR pasted terminal output.
  Atlassian MCP (optional): posts comments to JIRA stories and transitions issue status.
  Output: triage table + closure summary in the conversation; JIRA updated if MCP available.
---

# Playwright Test Triage

Parses test failure output, categorizes each failure by root cause, suggests targeted fixes,
optionally writes results back to JIRA, and prints a test closure summary.

---

## JIRA Story Map (for write-back)

| Lab Name (from spec file) | JIRA Key |
| ------------------------- | -------- |
| network-api               | TAB1-12  |
| forms-validation          | TAB1-13  |
| async-ui                  | TAB1-14  |
| accessible-locators       | TAB1-15  |
| tables-filtering          | TAB1-16  |
| browser-events            | TAB1-17  |
| emulation-input           | TAB1-18  |
| debugging-reporting       | TAB1-19  |
| frames-contexts           | TAB1-20  |
| fake-auth                 | TAB1-21  |
| aria-snapshots            | TAB1-22  |
| storage-state             | TAB1-23  |
| api-request-context       | TAB1-24  |
| clock-timers              | TAB1-25  |
| websocket-interception    | TAB1-26  |
| har-recording             | TAB1-27  |
| service-workers           | TAB1-28  |
| visual-regression         | TAB1-29  |
| drag-and-drop             | TAB1-30  |
| multi-tab                 | TAB1-31  |
| geolocation-permissions   | TAB1-32  |
| scroll-lazy-loading       | TAB1-33  |
| media-locale              | TAB1-34  |
| accessibility-scanning    | TAB1-35  |
| locator-handlers          | TAB1-36  |
| shadow-dom                | TAB1-37  |
| server-sent-events        | TAB1-38  |
| soft-assertions           | TAB1-39  |
| init-scripts              | TAB1-40  |
| touch-gestures            | TAB1-41  |

---

## ⛔ Guardrail — Test Output Required

Scan the user's message for one of:

- A file path ending in `.json` (Playwright JSON report)
- Pasted terminal output containing `FAILED`, `Error:`, or `✕`

**If neither → STOP:**

> ⛔ Test output is required. Provide one of:
>
> - Path to Playwright JSON report: `playwright-report/results.json`
> - Pasted terminal output from a failed run
>
> To enable the JSON reporter, add to `playwright.config.ts`:
> `['json', { outputFile: 'playwright-report/results.json' }]`

---

## Phase 1 — Parse Failures

**From JSON report:** For each test with `status: 'failed'` or `status: 'timedOut'`, extract:

- Test title, full suite path, file, line number, browser/project
- Error message (first error), stack trace (first 5 lines)
- Retry count (`result.retry`), duration

**From pasted terminal:** Parse lines with `✕`/`FAILED` for test names; `Error:` for messages;
`retry #N` for flake signals; file paths with line numbers for location.

---

## Phase 2 — Categorize Each Failure

Assign exactly **one** category in this priority order:

### 🔴 Selector Failure

**Signal:** `strict mode violation` | `element not found` | `locator resolved to N elements` |
`TimeoutError` on `locator.waitFor()` | `getBy*` + `not found`

**Root cause:** DOM changed — element renamed, removed, or restructured.

**Fix:** Re-run `locator-mapper` on the affected page. POM needs regeneration.

---

### 🟡 Logic Failure

**Signal:** `expect(received).toBe(expected)` with mismatch | `toHaveText` wrong value |
`toHaveURL` wrong URL | `toBeVisible`/`toBeHidden` mismatch

**Root cause:** App behavior changed or test expectation is wrong.

**Fix:** Show received vs expected diff. Ask: "Is this a regression or intentional change?"
If regression: suggest `git log --oneline` to find the breaking commit.

---

### 🟠 Environment Failure

**Signal:** `net::ERR_CONNECTION_REFUSED` | `page.goto` network error | `TimeoutError` on
navigation | `Missing required env var` | `401 Unauthorized` | `403 Forbidden`

**Root cause:** `BASE_URL` unreachable, env var missing, or auth session expired.

**Fix steps:**

1. Verify `BASE_URL` in `.env` and confirm the server is running
2. If auth-related: regenerate `fixtures/auth.json` by re-running global setup (Gap #1)
3. If missing env var: add to `.env` and `.env.example`

---

### 🟣 Flaky Failure

**Signal:** Passed on retry (`result.retry > 0` + final `passed`) | `detached` |
`element is not stable` | `TimeoutError` on animation/transition assertion

**Root cause:** Non-deterministic timing.

**Fix steps:**

1. Replace `waitForTimeout` with `expect(locator).toBeVisible()` or `waitForSelector`
2. Use `expect(locator).toPass({ timeout })` for polling assertions
3. Wrap with `quarantine()` from `utilities/quarantine.ts` (Gap #8) while fixing
4. Add `test.slow()` if the operation genuinely needs more time

---

### 🔵 Accessibility Failure

**Signal:** `expect(results.violations).toEqual([])` fails with axe violation objects

**Root cause:** WCAG violations — missing labels, low contrast, missing landmarks.

**Fix:** Log `violations` array (`id`, `impact`, `nodes`, `helpUrl`).
Address `critical` > `serious` > `moderate` > `minor`.

---

## Phase 3 — Triage Table

```
## Test Triage Report
Run date: <date>  |  Source: <file or "pasted output">

| # | Test | Suite | Browser | Category | JIRA | Suggested Action |
|---|------|-------|---------|----------|------|-----------------|
| 1 | locates elements... | Accessible Locators | Chrome | 🔴 Selector | TAB1-15 | Re-run locator-mapper on /practice/accessible-locators |
| 2 | form submits... | Forms & Validation | Firefox | 🟡 Logic | TAB1-13 | Diff: expected "Success" got "Error 400" |
| 3 | page loads | Fake Auth | Chrome | 🟠 Env | TAB1-21 | Check BASE_URL; regenerate auth.json |
| 4 | stock ticker | Async UI | Chrome | 🟣 Flaky | TAB1-14 | Replace waitForTimeout → toPass(); quarantine |
| 5 | no a11y violations | Forms | Chrome | 🔵 A11y | TAB1-13 | Fix missing <label> on email input (critical) |

Summary:
  🔴 Selector:      X  |  🟡 Logic:    X
  🟠 Environment:   X  |  🟣 Flaky:    X  |  🔵 Accessibility: X
```

---

## Phase 4 — JIRA Write-Back (if Atlassian MCP available)

For each **unique JIRA story** affected by failures:

**Post a comment** on the JIRA story with:

```
🔴 Test Run — Failures Detected (<date>)

Affected ACs:
- <test title> → Category: Selector / Logic / Environment / Flaky / Accessibility
- <test title> → ...

Suggested action: <top fix recommendation>

Run command: npx playwright test tests/<lab-name> --reporter=html
```

Use: `cloudId: orhunakkan.atlassian.net`, `issueIdOrKey: TAB1-XX`

For stories where **all tests passed** in this run:

**Post a passing comment:**

```
✅ All tests passing (<date>) — N tests, 0 failures.
Suggest transitioning to "In Review" or "Done".
```

**Ask the user** before transitioning any story status — do not auto-transition.

If Atlassian MCP is not available, skip Phase 4 and note "JIRA write-back skipped — Atlassian MCP not connected".

---

## Phase 4b — Defect Lifecycle (create, link & close Bugs)

A comment on the story is not a defect. STLC requires real defects to be logged, linked, and
closed. After categorizing (Phase 2), act per category:

| Category         | Defect action                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| 🟡 Logic         | **Create a Bug** — a genuine product/regression failure                                          |
| 🔵 Accessibility | **Create a Bug** — WCAG violation is a product defect (severity from axe `impact`)               |
| 🔴 Selector      | Create a Bug **only if** it persists after a POM refresh; otherwise it's a test-maintenance task |
| 🟠 Environment   | **No product Bug** — raise an infra/config task instead                                          |
| 🟣 Flaky         | **No Bug** — quarantine (Gap #8) and track the flake, don't pollute the defect log               |

### Creating a Bug (Atlassian MCP)

For each defect-worthy failure that does **not** already have an open Bug:

1. `createJiraIssue` — project `TAB1`, issuetype `Bug`:
   - **Summary:** `[<Lab>] <test title> — <category>`
   - **Description:** failing test path + line, expected vs received (or axe rule id + impact +
     `helpUrl` + node target), browser/project, and the run date.
   - **Priority/Severity:** map axe `critical/serious` → High, `moderate/minor` → Medium; for
     Logic failures, ask or default to Medium.
2. `createIssueLink` — link the new Bug to the story: Bug **blocks** `TAB1-XX` (or `relates to`
   if the AC is otherwise covered).
3. `addCommentToJiraIssue` on the **story** noting the Bug key was filed.
4. Record the Bug in the lab RTM (`docs/rtm/<lab>.rtm.md` Defects table) — id, severity,
   found-by, status `Open`. If a known-defect filter exists in the spec (e.g. an axe
   `v.id !== '…'` exclusion), reuse that defect's id instead of filing a duplicate.

### De-duplication

Before filing, search existing Bugs: `searchJiraIssuesUsingJql` with
`project = TAB1 AND issuetype = Bug AND statusCategory != Done AND text ~ "<test title>"`.
If an open Bug already matches, comment on it ("still failing on <date>") instead of creating a duplicate.

### Closing on re-pass

When a test that previously had an open linked Bug now **passes**:

1. `getTransitionsForJiraIssue` on the Bug → transition it to `Done`.
2. `addCommentToJiraIssue`: `✅ Verified fixed — <test title> passing on <date> (<browser>).`
3. Update the RTM Defects row status → `Closed`.

If Atlassian MCP is unavailable, list the defects that _would_ be filed/closed and write them to
the RTM only.

---

## Phase 5 — Test Closure Summary (STLC Phase 6)

```
## Test Closure Summary

Total tests run:     X
  ✅ Passed:         X  (X%)
  ❌ Failed:         X  (X%)
  ⏭ Skipped:        X

Failure breakdown:
  🔴 Selector:      X — POM refresh needed
  🟡 Logic:         X — investigate regressions
  🟠 Environment:   X — infra/config issue
  🟣 Flaky:         X — quarantine + fix timing
  🔵 Accessibility: X — WCAG violations

Browsers affected:
  Desktop Chrome:   X failures
  Desktop Firefox:  X failures
  Desktop Edge:     X failures
  Desktop Safari:   X failures

JIRA stories affected: TAB1-XX, TAB1-YY, ...
JIRA comments posted:  X stories updated / skipped (MCP unavailable)
Defects:               X Bugs filed, Y closed (re-passed)  |  RTM: docs/rtm/<lab>.rtm.md updated

Top priority actions:
  1. <most impactful fix>
  2. <second>
  3. <third>

Exit criteria met: <YES / NO — NO if any non-flaky, non-accessibility failures remain>

Next step:
  - Fix failures → re-run → use jira-sync to transition passing stories
```

---

## Edge Cases

| Situation                    | Handling                                                                    |
| ---------------------------- | --------------------------------------------------------------------------- |
| JSON report not found        | Ask user to re-run with JSON reporter; provide the config snippet           |
| All failures same root cause | Flag: "All X failures share a single root cause — fix one thing"            |
| `global-setup.ts` failure    | Categorize as Environment; all downstream tests are affected                |
| 50+ failures                 | Triage first 10 in table; summarize rest by category count                  |
| No failures                  | Print: "All tests passed." then jump to closure summary and JIRA write-back |

---

## Quick-Start Prompt Template

```
1. Parse failures from JSON report or pasted terminal output
2. Categorize: Selector / Logic / Environment / Flaky / Accessibility
3. Print triage table with JIRA key + category + suggested action
4. Post JIRA comments on affected stories (Atlassian MCP)
5. Ask before transitioning any story status
6. Print closure summary: counts, JIRA update status, exit criteria
```
