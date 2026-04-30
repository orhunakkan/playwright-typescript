# Prompt: Create a New DB Spec

## Current Repository Status

The current repository **does not include an active database test layer**.

There is no current:

- `tests/db/` directory
- `utilities/db-client.ts`
- `fixtures/db-payloads/` directory
- PostgreSQL dependency in `package.json`
- `DB Tests` Playwright project
- `test:db` npm script

Do not scaffold DB tests from older guidance unless the DB infrastructure is intentionally restored first.

---

## If the DB Layer Is Restored Later

Before creating DB specs, add and document the missing infrastructure in the same change:

1. PostgreSQL dependency and typed DB utility module.
2. `fixtures/db-payloads/` types and Faker-backed generators.
3. `tests/db/` specs.
4. `DB Tests` project in `playwright.config.ts`.
5. `test:db` script in `package.json`.
6. Environment variables in `config/env.ts` and `.env*` files.
7. Updates to `README.md`, `.pi/AGENTS.md`, `.pi/SYSTEM.md`, and `.pi/skills/run-tests/SKILL.md`.

When restored, DB specs should follow the same general rules as the rest of the framework:

- Import `test` and `expect` from `@playwright/test`.
- Use strict TypeScript types; do not use `any`.
- Use Faker-backed data generation.
- Use `test.describe.configure({ mode: 'serial' })` for stateful suites.
- Truncate/reset database state before every test.
- Run DB tests with a single worker unless the DB isolation strategy explicitly supports parallelism.
