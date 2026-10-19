---
name: stlc-report
description: STLC phase 8, test closure. Generates the traceability matrix and exit-criteria verdict and writes the closure report in stlc/<feature>/05-closure.md.
argument-hint: <feature>
disable-model-invocation: true
---

# Phase 8: closure for `$0`

1. Run `npm run stlc:gate -- $0 report`. If it exits 1, stop and report its reasons.
2. Delegate to the **stlc-reporter** agent with the prompt `Feature: $0.`
3. Verify it yourself:
   - `npm run stlc:lint -- $0` exits 0;
   - `stlc/$0/05-closure.md` has `status: complete`;
   - rerunning `npm run stlc:trace -- $0` leaves `git diff --stat -- stlc/$0/05-closure.md`
     unchanged. That confirms the generated block wasn't hand-edited.
4. Report the exit-criteria table and verdict exactly as generated. "NOT MET" is a legitimate
   outcome: report it, never work around it.
