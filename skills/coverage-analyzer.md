---
name: playwright-coverage-analyzer
description: >
  Analyzes the project to produce a test coverage map showing which JIRA stories have
  tests, which have only a POM, and which are completely uncovered — with live JIRA story
  status. Use this skill whenever the user wants to understand coverage, prioritize which
  lab to work on next, see a gap analysis, or says things like "what's covered", "which
  labs have tests", "show me coverage", "coverage report", "what's missing", or "where
  should I start". Fetches live JIRA statuses when Atlassian MCP is available.

compatibility: >
  Primary: filesystem reads (always available) + Atlassian MCP (live JIRA status, optional).
  No browser tools needed. Output: coverage table and priority recommendations in the conversation.
---

# Playwright Coverage Analyzer

Maps every Stagecraft lab's JIRA story against existing test files and Page Object Models,
annotates with live JIRA status, and produces a prioritized gap report.

---

## ⛔ Guardrail — Project Root Required

Verify the following are accessible from the current working directory:

- `pages/homepage.page.ts`
- `tests/` directory

**If either is missing → STOP.**

> ⛔ Cannot find project files. Run this skill from the Playwright project root
> (the folder containing `playwright.config.ts`).

---

## Authoritative Lab → JIRA Mapping

This table is embedded in the skill. Do not derive it from the POM — use it directly.

| JIRA Key | Lab Name                                | URL Path                              | Priority Group  |
| -------- | --------------------------------------- | ------------------------------------- | --------------- |
| TAB1-13  | Forms & Validation                      | /practice/forms-validation            | 1 — Core        |
| TAB1-21  | Fake Auth                               | /practice/fake-auth                   | 1 — Core        |
| TAB1-23  | Storage State                           | /practice/storage-state               | 1 — Core        |
| TAB1-15  | Accessible Locators                     | /practice/accessible-locators         | 1 — Core        |
| TAB1-14  | Async UI                                | /practice/async-ui                    | 2 — Advanced    |
| TAB1-12  | Network & API                           | /practice/network-api                 | 2 — Advanced    |
| TAB1-24  | API Request Context                     | /practice/api-request-context         | 2 — Advanced    |
| TAB1-16  | Tables & Filtering                      | /practice/tables-filtering            | 2 — Advanced    |
| TAB1-17  | Browser Events                          | /practice/browser-events              | 2 — Advanced    |
| TAB1-22  | ARIA Snapshots                          | /practice/aria-snapshots              | 2 — Advanced    |
| TAB1-35  | Accessibility Scanning                  | /practice/accessibility-scanning      | 2 — Advanced    |
| TAB1-67  | Book Catalog                            | /practice/book-catalog                | 2 — Advanced    |
| TAB1-18  | Emulation & Input                       | /practice/emulation-input             | 3 — Specialized |
| TAB1-19  | Debugging & Reporting                   | /practice/debugging-reporting         | 3 — Specialized |
| TAB1-20  | Frames & Contexts                       | /practice/frames-contexts             | 3 — Specialized |
| TAB1-25  | Clock & Timers                          | /practice/clock-timers                | 3 — Specialized |
| TAB1-26  | WebSocket Interception                  | /practice/websocket-interception      | 3 — Specialized |
| TAB1-27  | HAR Recording                           | /practice/har-recording               | 3 — Specialized |
| TAB1-28  | Service Workers                         | /practice/service-workers             | 3 — Specialized |
| TAB1-29  | Visual Regression                       | /practice/visual-regression           | 3 — Specialized |
| TAB1-30  | Drag & Drop                             | /practice/drag-and-drop               | 3 — Specialized |
| TAB1-31  | Multi-Tab                               | /practice/multi-tab                   | 3 — Specialized |
| TAB1-32  | Geolocation & Permissions               | /practice/geolocation-permissions     | 3 — Specialized |
| TAB1-33  | Scroll & Lazy Loading                   | /practice/scroll-lazy-loading         | 3 — Specialized |
| TAB1-34  | Media & Locale Emulation                | /practice/media-locale                | 3 — Specialized |
| TAB1-36  | Locator Handlers                        | /practice/locator-handlers            | 3 — Specialized |
| TAB1-37  | Shadow DOM & Web Components             | /practice/shadow-dom                  | 3 — Specialized |
| TAB1-38  | Server-Sent Events                      | /practice/server-sent-events          | 3 — Specialized |
| TAB1-39  | Soft Assertions & Test Steps            | /practice/soft-assertions             | 3 — Specialized |
| TAB1-40  | Init Scripts & Seeding                  | /practice/init-scripts                | 3 — Specialized |
| TAB1-41  | Touch & Mobile Gestures                 | /practice/touch-gestures              | 3 — Specialized |
| TAB1-60  | Passkey Authentication                  | /practice/passkey-authentication      | 3 — Specialized |
| TAB1-61  | Web Storage & Partitioned Cookies       | /practice/client-storage-partitioning | 3 — Specialized |
| TAB1-62  | Console & Runtime Diagnostics           | /practice/console-runtime-diagnostics | 3 — Specialized |
| TAB1-63  | Memory & DOM Leak Diagnostics           | /practice/dom-memory-diagnostics      | 3 — Specialized |
| TAB1-64  | Custom Assertions & Matcher Composition | /practice/custom-assertions           | 3 — Specialized |

---

## Phase 1 — Collect Local Artifacts

1. Glob `tests/**/*.spec.ts` — collect all spec paths
2. Glob `pages/**/*.page.ts` — collect all POM paths
3. For each path, normalize the file stem to kebab-case lab name:
   - `accessible-locators.page.ts` → `accessible-locators`
   - `forms-validation.spec.ts` → `forms-validation`

Build two sets: `specNames` and `pomNames`.

---

## Phase 2 — Fetch Live JIRA Statuses (if Atlassian MCP available)

If Atlassian MCP is connected, run a single JQL query:

```
project = TAB1 AND issuetype = Story ORDER BY key ASC
```

Fields: `["key", "summary", "status"]`
CloudId: `orhunakkan.atlassian.net`

Build a map: `{ "TAB1-15": "To Do", "TAB1-13": "In Progress", ... }`

If Atlassian MCP is not available, skip this phase and note "JIRA status unavailable" in output.

---

## Phase 3 — Cross-Reference & Categorize

For each row in the lab map, derive the URL path stem (e.g. `accessible-locators` from
`/practice/accessible-locators`) and check:

| Status           | Condition               |
| ---------------- | ----------------------- |
| ✅ Fully covered | spec AND POM both exist |
| ⚠️ POM only      | POM exists, no spec     |
| ⚠️ Spec only     | spec exists, no POM     |
| ❌ Not started   | neither exists          |

Combine with JIRA status (if fetched).

---

## Phase 4 — Output

```
## Test Coverage Report
Project: playwright-typescript  |  Analyzed: <date>

### Priority Group 1 — Core

| JIRA | Lab | POM | Spec | JIRA Status | Coverage |
|------|-----|-----|------|-------------|----------|
| TAB1-13 | Forms & Validation | ❌ | ❌ | To Do | ❌ Not started |
| TAB1-21 | Fake Auth | ❌ | ❌ | To Do | ❌ Not started |
| TAB1-23 | Storage State | ❌ | ❌ | To Do | ❌ Not started |
| TAB1-15 | Accessible Locators | ✅ | ❌ | To Do | ⚠️ POM only |

### Priority Group 2 — Advanced
... (same format)

### Priority Group 3 — Specialized
... (same format)

---
Summary:
  ✅ Fully covered:  X / 36 labs
  ⚠️ Partial:        X / 36 labs
  ❌ Not started:    X / 36 labs

Top 3 recommended next labs (Priority Group 1 first, then ❌ before ⚠️):
  1. TAB1-13 Forms & Validation — ❌ missing POM + spec
  2. TAB1-21 Fake Auth — ❌ missing POM + spec
  3. TAB1-15 Accessible Locators — ⚠️ POM exists, spec missing

Next step for each:
  - Missing POM: run locator-mapper on https://stagecraftlabs.com/practice/<lab-path>
  - Has POM, missing spec: run test-case-generator with JIRA key TAB1-XX
  - Both exist: run tests and use test-triage if failures appear
```

---

## Edge Cases

| Situation                                 | Handling                                                                         |
| ----------------------------------------- | -------------------------------------------------------------------------------- |
| Spec file name doesn't match URL path     | Fuzzy-match (normalize, strip `-test`, `-spec` suffixes); flag uncertain matches |
| JIRA story in "Done" but no spec          | Flag as anomaly: "Story marked Done but no test file found"                      |
| tests/ has subdirectories                 | Recurse all subdirectories                                                       |
| New lab added to JIRA not yet in this map | It won't appear — user should update the map table in this skill                 |

---

## Quick-Start Prompt Template

```
1. Glob tests/**/*.spec.ts and pages/**/*.page.ts from project root
2. Fetch JIRA story statuses via JQL (project = TAB1 AND issuetype = Story)
3. Cross-reference each lab from the embedded map against local artifacts
4. Categorize: ✅ / ⚠️ POM only / ⚠️ Spec only / ❌ Not started
5. Print coverage table grouped by priority, with JIRA status column
6. Print top-3 recommendations with next-step instructions
```
