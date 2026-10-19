---
feature: {{feature}}
phase: test-cases
status: draft # draft | approved | complete
updated: {{date}}
---

# Test cases: {{feature}}

<!--
Phase 3 (Playwright planner for UI, stlc-designer for the other types). Every AC × type marked in
02-test-plan.md needs at least one row. Titles start with positive:, negative: or boundary:.
Generated tests carry the tags @REQ-{{feature}} @AC-<n> @TC-<nnn> of their row.
-->

| TC     | AC   | type | title               | priority |
| ------ | ---- | ---- | ------------------- | -------- |
| TC-001 | AC-1 | e2e  | positive: {{title}} | high     |

## TC-001

{{steps and expected results; for UI scenarios link the Playwright planner output in specs/}}
