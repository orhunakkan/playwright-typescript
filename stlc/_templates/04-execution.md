---
feature: {{feature}}
phase: execution
status: draft # draft | approved | complete. complete = every failure is triaged.
updated: {{date}}
---

# Execution: {{feature}}

## Run

<!-- generated:start -->

_Not run yet. `npm run stlc:run-summary -- {{feature}}` fills this block from reports/results.json._

<!-- generated:end -->

## Triage

<!--
Phases 6-7 (stlc-triager). One row per failed or flaky test listed in the run block.
verdict: product | test | environment | flaky. product and flaky need a DEF id (npm run stlc:defect).
test = the "file:line" from the run block.
-->

| test | verdict | DEF | note |
| ---- | ------- | --- | ---- |
