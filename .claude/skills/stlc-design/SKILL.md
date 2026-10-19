---
name: stlc-design
description: STLC phase 3, test design. Explores UI scenarios with the Playwright planner, then writes numbered test cases to stlc/<feature>/03-test-cases.md.
argument-hint: <feature>
disable-model-invocation: true
---

# Phase 3: test design for `$0`

1. Run `npm run stlc:gate -- $0 design`. If it exits 1, stop and report its reasons. A plan that
   isn't approved yet is the usual reason. Then run `npm run stlc:new -- $0 test-cases`, which
   creates 03 from its template if it doesn't exist yet.
2. Read the coverage table in `stlc/$0/02-test-plan.md`. If any AC has `x` under `e2e`, sort
   those ACs by the state their Given/When/Then in `stlc/$0/01-requirements.md` starts from:
   signed out, signed in, or both (an AC that holds in both states goes in both groups). The
   planner sets up one page from one seed, so delegate to the **playwright-test-planner** agent
   once per non-empty group, one run at a time, with this prompt (its documented format). Fill in
   the group's ACs with their titles and Given/When/Then:

   Signed out:

   ```
   <plan>
     <task-text>Plan UI test scenarios for feature "$0", signed out, covering only these
     acceptance criteria: <the group's ACs>.
     For each AC include the main path, validation/error states and boundaries. Save test files as
     tests/e2e/$0/<short-scenario-slug>.spec.ts. Use project "chromium".</task-text>
     <seed-file>tests/e2e/seed.spec.ts</seed-file>
     <plan-file>stlc/$0/ui-scenarios.md</plan-file>
   </plan>
   ```

   Signed in: the same prompt with "signed in" for "signed out", and
   `<seed-file>tests/e2e/seed-signed-in.spec.ts</seed-file>` and
   `<plan-file>stlc/$0/ui-scenarios-signed-in.md</plan-file>`.

   Then check that each plan file you asked for exists.

3. Delegate to the **stlc-designer** agent with this prompt: `Feature: $0. UI scenarios: <the
plan files from step 2>`. Leave out the second sentence if step 2 didn't run.
4. Verify it yourself:
   - `npm run stlc:lint -- $0` exits 0;
   - `stlc/$0/03-test-cases.md` has `status: approved`.

   If either fails, send the agent the lint output once. If it still fails, stop and report.

5. Report the TC table and the designer's notes on gaps.
