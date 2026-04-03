---
name: show-trace
description: Open the Playwright trace viewer for a captured trace file
argument-hint: 'path to trace.zip or test name to find its trace'
---

Open the Playwright trace viewer for: $ARGUMENTS

If $ARGUMENTS is a .zip path, run:
`npx playwright show-trace $ARGUMENTS`

If $ARGUMENTS looks like a test name or file, search for the most recent matching trace under test-results/ and open it.

If no argument given, list available traces in test-results/ and ask which to open.
