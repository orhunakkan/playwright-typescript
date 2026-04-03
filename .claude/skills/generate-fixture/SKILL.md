---
name: generate-fixture
description: Scaffold a new Faker.js API payload generator in fixtures/notes-api-payloads/
argument-hint: 'resource-name (e.g. comments, tags)'
---

Generate a new API payload fixture file for: $ARGUMENTS

Follow these conventions (read fixtures/notes-api-payloads/users-request-payloads.ts first):

- File: fixtures/notes-api-payloads/<name>-request-payloads.ts (kebab-case)
- Import `{ faker }` from `@faker-js/faker`
- Re-export shared helpers from ./shared-request-payloads if needed
- Export named generator functions like `generate<Action><Resource>Payload()`
- Return plain objects with Faker-generated values (no classes)
- Add matching TypeScript types to fixtures/notes-api-payloads/api-types.ts
