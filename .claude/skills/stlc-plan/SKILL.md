---
name: stlc-plan
description: STLC phase 2, test planning. Writes the risk-based coverage plan to stlc/<feature>/02-test-plan.md and stops for human approval.
argument-hint: <feature>
disable-model-invocation: true
---

# Phase 2: test planning for `$0`

1. Run `npm run stlc:gate -- $0 plan`. If it exits 1, stop and report its reasons. Then run
   `npm run stlc:new -- $0 test-plan`, which creates 02 from its template if it doesn't exist yet.
2. Delegate to the **stlc-strategist** agent with the prompt `Feature: $0.`
3. Verify it yourself:
   - `npm run stlc:lint -- $0` exits 0;
   - `stlc/$0/02-test-plan.md` still has `status: draft` and no `{{` placeholder.

   If not, send the agent the problem once. If it still fails, stop and report.

4. **Stop here.** Show the coverage table and the strategist's review points, then say:

   > Review `stlc/$0/02-test-plan.md` and set `status: approved` in your editor, then run
   > `/stlc $0` (or `/stlc-design $0`).

   Never set it to approved yourself. A hook blocks it, and approval is the user's decision.
