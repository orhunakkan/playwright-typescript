---
name: stlc-analyze
description: STLC phase 1, requirement analysis. Writes testable acceptance criteria with risk to stlc/<feature>/01-requirements.md, from a requirements file or by exploring the app.
argument-hint: <feature> [requirements-file]
disable-model-invocation: true
---

# Phase 1: requirement analysis for `$0`

1. If `stlc/$0/` doesn't exist, run `npm run stlc:new -- $0`.
2. Run `npm run stlc:gate -- $0 analyze`. If it exits 1, stop and report its reasons.
3. Delegate to the **stlc-analyst** agent with this prompt:
   - With a requirements file: `Feature: $0. Requirements file: $1.`
   - Without one: `Feature: $0. No requirements file: infer the requirements by exploring the live app.`
4. Verify it yourself:
   - `npm run stlc:lint -- $0` exits 0;
   - `stlc/$0/01-requirements.md` has `status: approved`.

   If either fails, send the agent the lint output once to fix. If it still fails, stop and
   report.

5. Report the AC list, the source (provided or inferred), and the open questions.
