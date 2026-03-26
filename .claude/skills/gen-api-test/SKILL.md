---
name: gen-api-test
description: Generate a new Playwright API test file following the serial flow pattern
argument-hint: 'api-endpoint-or-feature'
---

Generate a new Playwright API test file for: $ARGUMENTS

Follow these project conventions:

- Place in tests/api/ directory
- Use `test.describe.configure({ mode: 'serial' })` — API tests are always serial
- Share state across tests via module-scoped variables (authToken, userId, etc.)
- Use `request` fixture from @playwright/test (not `page`)
- Generate payloads with @faker-js/faker, place generators in fixtures/notes-api-payloads/
- Follow the flow pattern: setup → create → read → update → list → delete → cleanup
- Assert status codes and response body properties
- Use `process.env.PRACTICE_API_URL` for base URL
- File name: kebab-case ending in .spec.ts

Read existing API test files in tests/api/ first to match the exact style and patterns.
