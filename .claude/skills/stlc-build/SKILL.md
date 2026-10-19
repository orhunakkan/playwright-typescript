---
name: stlc-build
description: STLC phase 5, test implementation. Generates UI tests with the Playwright generator, writes api/a11y/perf/visual tests with stlc-author, and verifies them against the test cases.
argument-hint: <feature>
disable-model-invocation: true
---

# Phase 5: test implementation for `$0`

1. Run `npm run stlc:gate -- $0 build`. If it exits 1, stop and report its reasons.
2. Read the TC table in `stlc/$0/03-test-cases.md`, and each TC's `## TC-nnn` section.
3. **UI cases (type `e2e`).** One at a time, never in parallel, delegate each one to the
   **playwright-test-generator** agent with its documented prompt format:

   ```
   <generate>
     <test-suite>AC-<n>: <AC title from 01></test-suite>
     <test-name><TC title, e.g. "positive: …"></test-name>
     <test-file>tests/e2e/$0/<TC-nnn>-<short-slug>.spec.ts</test-file>
     <seed-file>the seed named in the TC's preconditions (tests/e2e/seed.spec.ts or tests/e2e/seed-signed-in.spec.ts)</seed-file>
     <body>The TC's steps and expected results, verbatim, plus: "Tag the describe
     { tag: '@REQ-$0' } and the test { tag: ['@AC-<n>', '@TC-<nnn>'] }. Import test and expect
     from '../../../fixtures/index.ts'."</body>
   </generate>
   ```

   Skip a TC whose file already exists.

4. **Everything else.** Delegate to the **stlc-author** agent with this prompt: `Feature: $0.
Write tests for these TCs: <non-e2e TC ids>. Normalize these generated files: <the files from
step 3>.`
5. **Verify** with these commands. Agents' claims don't count.
   - `npm run lint`
   - `npm run typecheck`
   - `npm run stlc:check-tests -- $0`

   If any fail, send the output to **stlc-author** once. If they still fail, stop and report.

6. **Visual baselines.** If there are `visual` TCs, list the new visual tests and ask the user:
   "Create visual baselines for $0 now?"
   - On yes: run `npm run test:visual:update -- --grep "@REQ-$0"`. Read each new PNG under
     `tests/visual/__snapshots__/` and show it to the user. Remind them to review the images
     before committing.
   - On no: stop.
7. Report the tests added per type and the verification results. Failing tests aren't fixed here:
   phases 6–7 run and triage them. The healer is never called before triage.
