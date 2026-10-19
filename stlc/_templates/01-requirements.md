---
feature: {{feature}}
phase: requirements
status: draft # draft | approved | complete
updated: {{date}}
source: provided # provided | inferred (inferred = drafted by exploring the app; needs human confirmation)
---

# Requirements: {{feature}}

<!--
Phase 1 (stlc-analyst). One "### AC-<n>: <title>" heading per testable acceptance criterion, each
followed by a "risk: high | medium | low" line. IDs are stable once the plan is approved: never
renumber, only append. Replace every {{placeholder}} before setting status to approved.
-->

## User stories

- As a {{role}}, I want {{capability}} so that {{benefit}}.

## Acceptance criteria

### AC-1: {{title}}

risk: medium

{{Given / When / Then, or one precise statement of the expected behaviour}}

## Ambiguities and questions

- {{question for the product owner, or "none"}}

## Assumptions

- {{assumption, or "none"}}
