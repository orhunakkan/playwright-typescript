---
name: run-tests
description: Run Playwright tests with optional arguments
argument-hint: "test-pattern --headed --debug --project='Desktop Chrome'"
---

Run Playwright tests with the provided arguments.

If no arguments given, run all tests:
`npx playwright test`

If arguments provided:
`npx playwright test $ARGUMENTS`

After tests complete, show a summary of passed/failed/skipped counts.
If any tests failed, show the failure details and suggest fixes.
