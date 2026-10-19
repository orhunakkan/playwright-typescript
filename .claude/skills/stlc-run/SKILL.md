---
name: stlc-run
description: STLC phase 6, test execution. Runs the feature's tests on every planned project and writes the run summary to stlc/<feature>/04-execution.md.
argument-hint: <feature>
disable-model-invocation: true
---

# Phase 6: test execution for `$0`

No agent. Commands only.

1. Run `npm run stlc:gate -- $0 run`. If it exits 1, stop and report its reasons. Then run
   `npm run stlc:new -- $0 execution`, which creates 04 from its template if it doesn't exist yet.
2. Map the coverage table in `stlc/$0/02-test-plan.md` to projects. Use a type's projects only if
   any AC has `x` under that type:

   | Type   | Projects                                                          |
   | ------ | ----------------------------------------------------------------- |
   | e2e    | `chromium`, `firefox`, `webkit`, `mobile-chrome`, `mobile-safari` |
   | api    | `api`                                                             |
   | a11y   | `a11y`                                                            |
   | perf   | `perf`                                                            |
   | visual | Docker, step 4                                                    |

3. Run the host projects in **one** command, so they land in one report:
   `npx playwright test --grep "@REQ-$0" --project=<p1> --project=<p2> …`. Test failures make it
   exit 1; that's a result, not an error.
4. If visual is planned, run `npm run test:visual -- --grep "@REQ-$0"`. It writes
   `reports/results-visual.json`, and the summary merges both.
5. Run `npm run stlc:run-summary -- $0`, then `npm run stlc:lint -- $0`.
6. Report the per-project table and the "Needs triage" list from the generated block.
