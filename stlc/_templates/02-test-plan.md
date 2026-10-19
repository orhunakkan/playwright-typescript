---
feature: { { feature } }
phase: test-plan
status: draft # draft | approved | complete. Only a human sets approved.
updated: { { date } }
---

# Test plan: {{feature}}

<!--
Phase 2 (stlc-strategist). Choose test types per AC from its risk: not every AC needs every type.
This file is the human gate: test design does not start until a person sets status: approved.
-->

## Scope

- {{what is tested}}

## Out of scope

- {{what is deliberately not tested, and why}}

## Coverage

<!-- One row per AC in 01-requirements.md. Mark "x" for each test type that AC needs. -->

| AC   | e2e | api | a11y | perf | visual |
| ---- | --- | --- | ---- | ---- | ------ |
| AC-1 | x   |     |      |      |        |

## Environments

- Target: {{ENV name, BASE_URL, API_URL}}
- Projects: {{e.g. chromium, firefox, webkit, mobile-chrome, mobile-safari, api}}

## Risks

- {{risk and its mitigation}}

## Exit criteria

<!-- Keys: ac-coverage-min (%), open-critical-max (count), flaky-rate-max (%). Defaults shown. -->

- ac-coverage-min: 100%
- open-critical-max: 0
- flaky-rate-max: 2%
