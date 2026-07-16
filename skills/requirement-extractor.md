---
name: playwright-requirement-extractor
description: >
  Extracts testable requirements from a Stagecraft Labs JIRA story or any web page before
  tests are written. Use this skill whenever the user wants to know what to test, needs
  acceptance criteria, wants a requirements inventory before test planning, or says things
  like "what should I test", "extract requirements", "get ACs for TAB1-XX", "what does
  this story say", or "give me testable criteria". Accepts a JIRA story key (TAB1-XX) as
  primary source — falling back to live web page scraping when no story key is given.
  Always run this skill before coverage-analyzer or test-case-generator for a new lab.

compatibility: >
  Primary: Atlassian MCP (JIRA story fetch — cloudId: orhunakkan.atlassian.net).
  Fallback: Playwright MCP (browser navigation, screenshot, accessibility snapshot) when
  no JIRA key is provided. Output: structured requirements list in the conversation.
---

# Playwright Requirement Extractor

Produces a structured list of testable requirements with acceptance criteria from either
a JIRA story or a live web page — the input to test planning and test case design.

---

## JIRA Story Map (TAB1 Project)

This table is the authoritative mapping of Stagecraft labs to JIRA story keys:

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

## Input Detection (run before any guardrail)

Scan the user's prompt for:

- A JIRA story key matching `TAB1-\d+` → use **JIRA path**
- A lab name matching a row in the table above → resolve to JIRA key, use **JIRA path**
- A full URL (`https://...`) → use **Web path**
- None of the above → STOP and ask

---

## Path A — JIRA Story (Preferred)

### Guardrail — Atlassian MCP Required

Before fetching, verify Atlassian MCP is available.

**If missing → STOP:**

> ⛔ Atlassian MCP is required to fetch JIRA story details.
> Provide the lab URL instead, or connect Atlassian MCP and retry.

### Phase A1 — Fetch Story

Use Atlassian MCP to fetch the story:

- `cloudId`: `orhunakkan.atlassian.net`
- `issueIdOrKey`: the resolved TAB1-XX key
- `fields`: `["summary", "description", "status", "customfield_10016"]`
- `responseContentFormat`: `"markdown"`

Extract:

- **Summary** (story title)
- **Description** (user story + context)
- **Status** (current JIRA status)
- **Acceptance Criteria** (look for a field named "Acceptance Criteria", or a section in the
  description labeled "Acceptance Criteria" — it is always a bullet list)

### Phase A2 — Structure Requirements

Format each AC bullet as a numbered testable requirement in **Given/When/Then** form where
the original AC maps cleanly, or keep it verbatim when it's already a complete scenario:

```
REQ-01 [P1]: <verbatim AC text>
  → Given: <precondition inferred from context>
  → When:  <action described in AC>
  → Then:  <assertion described in AC>
```

Group by theme (Navigation, Forms, Async, etc.) if natural groupings exist in the ACs.

#### Derive negative & boundary requirements (do not stop at the happy path)

An AC usually states the positive outcome only. Extract the **implied** negative and boundary
requirements too, as sub-requirements, so the test designer receives them rather than inferring
them. Mirror the trigger words:

| Phrase in the AC                         | Sub-requirements to add                                         |
| ---------------------------------------- | --------------------------------------------------------------- |
| "required" / "must be provided"          | REQ-Na (neg): empty → error                                     |
| "valid <format>" (email, URL, phone)     | REQ-Na (neg): malformed → error (list ≥3 representative inputs) |
| "at least N" / "max N" / "between N & M" | REQ-Na (boundary): N-1 fails, N passes, M passes, M+1 fails     |
| "enabled / disabled when…"               | REQ-Na (neg): each single missing field keeps it disabled       |
| "shows <success/result>"                 | REQ-Na (neg): result absent before the triggering action        |

```
REQ-02  [P1]: Email must be a valid address.
REQ-02a [P1, neg]: Malformed email (no @, no TLD, trailing space) shows the email error.
```

#### Priority / risk tag

Tag every requirement `[P1]` (core happy path / data integrity / security), `[P2]` (important
negative & boundary behavior), or `[P3]` (cosmetic, optional fields, edge polish). This drives
risk-based ordering in the Test Plan. Default to P2 for derived negative/boundary requirements
unless the failure is user-blocking (then P1).

### Phase A3 — Output

```
## Requirements: <Lab Name> (<JIRA Key>)
Story: <summary>
JIRA Status: <status>
Source: https://orhunakkan.atlassian.net/browse/<TAB1-XX>

### Acceptance Criteria (as testable requirements)

REQ-01  [P1]:      <AC text>
REQ-01a [P2, neg]: <derived negative/boundary requirement>
REQ-02  [P1]:      <AC text>
...
REQ-NF1 [P2]:      The page must meet its performance budget (load + key interaction). (always append)
REQ-A11Y [P1]:     The page must have no critical axe-core violations, in every rendered state. (always append)

---
Total: N requirements (X positive, Y negative/boundary, 2 non-functional)
Priority mix: P1 a · P2 b · P3 c
Suggested spec file: tests/<lab-path>/<lab-path>.spec.ts
Next steps:
  - run test-plan-generator with <TAB1-XX> to produce the Test Plan (scope, entry/exit, risk)
  - run test-case-generator with <TAB1-XX> to generate the spec
```

---

## Path B — Web Page (Fallback)

Used when no JIRA key is provided.

### Guardrail — Full URL Required

**If no valid URL found → STOP:**

> ⛔ Provide a full URL (`https://...`) or a JIRA story key (`TAB1-XX`).

### Guardrail — Playwright MCP Required

Verify Playwright MCP is available before proceeding.

### Phase B1 — Navigate & Capture

Use Playwright MCP:

1. Open the URL; wait for `domcontentloaded`
2. Screenshot + accessibility tree snapshot

### Phase B2 — Element & State Inventory

From snapshot, enumerate:

- **Interactive elements** — inputs, buttons, links, dropdowns, checkboxes
- **Dynamic states** — empty, loading, error, success, disabled
- **Validation constraints** — required fields, type, min/max, pattern

### Phase B3 — Requirement Inference

Write each inferred behavior as Given/When/Then. Always append an axe-core requirement.

### Phase B4 — Output

Same format as Phase A3, but with `Source: <URL>` and no JIRA status line.

---

## Edge Cases

| Situation                            | Handling                                                            |
| ------------------------------------ | ------------------------------------------------------------------- |
| Lab name provided but not in the map | Ask user to confirm the JIRA key                                    |
| JIRA story has no AC field           | Parse the description for a bullet list under "Acceptance Criteria" |
| Story is in "Done" status            | Note it; requirements still valid for test validation               |
| URL not in the map                   | Run web path; suggest creating a JIRA story after                   |

---

## Quick-Start Prompt Template

```
JIRA path:
1. Resolve lab name / TAB1-XX key
2. Fetch story via Atlassian MCP
3. Extract description + acceptance criteria
4. Format as numbered requirements in Given/When/Then, each with a [P1/P2/P3] tag
5. Derive negative + boundary sub-requirements from AC trigger words
6. Append non-functional (performance budget) + axe-core (all-states) requirements
7. Print with JIRA link, priority mix, and next steps (test-plan-generator, then test-case-generator)

Web path:
1. Navigate to URL via Playwright MCP
2. Screenshot + accessibility snapshot
3. Enumerate interactive elements and states
4. Infer Given/When/Then requirements
5. Print with source URL and next-step suggestion
```
