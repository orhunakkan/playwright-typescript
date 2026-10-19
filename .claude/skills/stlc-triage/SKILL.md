---
name: stlc-triage
description: STLC phase 7, defect triage and test repair. Classifies each failure, files defects, sends only test-caused failures to the Playwright healer, and re-runs.
argument-hint: <feature>
disable-model-invocation: true
---

# Phase 7: triage for `$0`

1. Run `npm run stlc:gate -- $0 triage`. If it exits 1, stop and report its reasons.
2. Check the generated block in `stlc/$0/04-execution.md`. If it says
   `### Needs triage: none`:
   1. Set `status: complete` in 04.
   2. Run `npm run stlc:lint -- $0`.
   3. Report "nothing to triage" and finish.
3. Otherwise, delegate to the **stlc-triager** agent with the prompt `Feature: $0.`
4. For each row the triager gave the verdict `test`, delegate to the **playwright-test-healer**
   agent. Fill in the row's `test` and `note`:

   ```
   <heal>Fix the failing test <test file:line>. Triage found the test itself is wrong: <note>.
   The application behaviour is correct for this test. Do not weaken or remove assertions and do
   not skip the test; if you conclude the app is at fault, stop and say so.</heal>
   ```

5. If any test was healed:
   1. Rerun phase 6 by reading and following `.claude/skills/stlc-run/SKILL.md`. That regenerates
      the run block.
   2. If new tests need triage, repeat steps 3–4 **once**. If anything is still untriaged after
      that, stop and report it.
6. Verify it yourself: `npm run stlc:lint -- $0` exits 0, and `04-execution.md` has
   `status: complete`. Lint rejects a complete 04 with untriaged tests.
7. Report verdict counts, new DEFs with severity, healed tests, and environment issues.
