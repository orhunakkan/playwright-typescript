---
name: playwright-test-plan-generator
description: >
  Produces the STLC Test Plan for a Stagecraft lab — scope, entry/exit criteria, test types,
  environments, risk-based priority, and deliverables — the planning-phase artifact that sits
  between requirements and test design. Use this skill whenever the user wants a test plan,
  test strategy, entry/exit criteria, scope definition, or risk assessment for a lab, or says
  things like "write the test plan for TAB1-XX", "what's the strategy for Forms lab", "define
  scope and exit criteria", or "plan the testing". Run after requirement-extractor and before
  (or alongside) test-case-generator.

compatibility: >
  Reads: requirement-extractor output (or the JIRA story via Atlassian MCP) for ACs + priority
  tags; playwright.config.ts for the browser/project matrix; the lab POM if present. Optional:
  Atlassian MCP for live JIRA status. Output: docs/test-plan/<lab-name>.test-plan.md.
  Distinct from rtm-generator (which traces ACs → tests after design); this defines the plan first.
---

# Playwright Test Plan Generator

Writes a concise, real Test Plan for one lab — the STLC "Test Planning" deliverable. It answers
_what we will and won't test, when we're allowed to start, and when we're allowed to stop_ —
before a line of test code is written.

---

## ⛔ Guardrail — Lab or JIRA Key Required

Scan the prompt for a JIRA key (`TAB1-\d+`) or a lab name. Resolve to lab name + URL + the
spec path `tests/<lab-name>/<lab-name>.spec.ts`.

**If nothing resolves → STOP:** ask for a JIRA story key (e.g. `TAB1-13`) or a lab name.

---

## Phase 1 — Gather Inputs

1. **Requirements** — use the `requirement-extractor` output if available (it carries `[P1/P2/P3]`
   priority tags and derived negative/boundary requirements). Otherwise fetch the story via
   Atlassian MCP and tag priorities here.
2. **Browser matrix** — read `playwright.config.ts` `projects[]` (do not hardcode the list).
3. **Environments** — read the `.env*` files present (e.g. `.env`, `.env.qa`, `.env.uat`) to list
   the targetable environments and the `BASE_URL` source.
4. **Existing coverage** — note whether a POM and spec already exist.

---

## Phase 2 — Risk Assessment

For each requirement (or feature area), assign **likelihood × impact → risk** and a test
priority. Drive ordering from the `[P1/P2/P3]` tags: P1 first, then P2, then P3.

| Area / Requirement | Likelihood | Impact | Risk  | Priority |
| ------------------ | ---------- | ------ | ----- | -------- |
| <area>             | H/M/L      | H/M/L  | H/M/L | P1/P2/P3 |

P1 = data integrity, security, core submit/validation paths. P2 = negative/boundary behavior.
P3 = optional fields, cosmetic states.

---

## Phase 3 — Write the Test Plan

Write `docs/test-plan/<lab-name>.test-plan.md` with these sections:

```
# Test Plan — <Lab Name> (<JIRA Key>)

## 1. Scope
In scope:    <feature areas / ACs covered>
Out of scope: <explicitly excluded — e.g. backend load, payment, i18n>

## 2. Test types
Functional (positive / negative / boundary / data-driven) · Accessibility (axe, all states) ·
Non-functional (performance budget) · Cross-browser. Mark which apply.

## 3. Environments & data
Target env(s) + BASE_URL source · test data strategy (faker for valid, fixed tables for
invalid/boundary) · any auth/seed needs.

## 4. Browser / device matrix
<from playwright.config.ts projects[]>

## 5. Risk assessment & priority
<the Phase 2 table>

## 6. Entry criteria
- Requirements extracted and prioritized (requirement-extractor done)
- POM exists for the lab (locator-mapper done)
- App URL reachable; BASE_URL configured

## 7. Exit criteria
- 100% of P1 + P2 requirements have passing automated cases
- 0 open non-flaky defects of severity ≥ High linked to the story
- Accessibility: 0 critical/serious violations (or tracked + accepted with a defect id)
- Green across the full browser matrix in CI
- RTM generated and up to date

## 8. Deliverables
spec file · POM · RTM (docs/rtm/<lab>.rtm.md) · this plan · CI run

## 9. Schedule / effort (lightweight)
<rough ordering: requirements → plan → POM → spec → run → triage → RTM → review>
```

---

## Phase 4 — Summary

```
✅ Test Plan written: docs/test-plan/<lab-name>.test-plan.md
   ├─ In scope: <n areas>   Out of scope: <n items>
   ├─ Risk: <H:x M:y L:z>   Priority mix: P1:a P2:b P3:c
   ├─ Browser matrix: <n projects>
   └─ Exit criteria defined: yes
Next: run test-case-generator with <TAB1-XX>, then rtm-generator after the first run.
```

---

## Quick-Start Prompt Template

```
1. Resolve lab / TAB1-XX → name + URL + spec path
2. Gather requirements (+priority tags), browser matrix (config), environments (.env*)
3. Build the risk table; order by P1 → P2 → P3
4. Write docs/test-plan/<lab-name>.test-plan.md (scope, types, env, matrix, risk, entry/exit, deliverables)
5. Print summary + next steps
```
