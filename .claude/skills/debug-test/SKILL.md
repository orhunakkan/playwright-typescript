---
name: debug-test
description: Run a Playwright test in debug mode with Playwright Inspector
argument-hint: 'test file or grep pattern (e.g. tests/e2e/chapter3.spec.ts or "should login")'
---

Run the following test in debug mode: $ARGUMENTS

Execute:
`npx playwright test $ARGUMENTS --debug --workers=1`

This opens Playwright Inspector for step-through debugging.
If $ARGUMENTS is empty, prompt the user for a test file or grep pattern before running.
