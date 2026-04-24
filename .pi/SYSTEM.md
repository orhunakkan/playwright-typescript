# Agent Ground Rules

These rules apply to **every task** in this repository without exception. Read them before touching any file.

---

## TypeScript First

- All files are TypeScript. No `.js` files in `pages/`, `tests/`, `utilities/`, `config/`, or `fixtures/`.
- The `side-learning/` folder is an exception — it may contain `.html`, `.css`, and `.js` files and that is intentional. Do not flag these as violations.
- Never use `any`. Use the existing types (`UserRow`, `NoteRow`, `ApiResponse<T>`, `ObjectSchema`, etc.) or define new interfaces.
- Use `as const` for literal arrays and objects (e.g., `noteCategories`).
- Run a mental `tsc --noEmit` check before finalising any code change — all imports must resolve, all types must satisfy.

---

## Test Imports: Know Where to Import From

| Test type              | Import `test` and `expect` from                          |
| ---------------------- | -------------------------------------------------------- |
| E2E (`tests/e2e/`)     | `'../../fixtures/page-fixtures'`                         |
| API (`tests/api/`)     | `'@playwright/test'`                                     |
| DB (`tests/db/`)       | `'@playwright/test'`                                     |
| Sauce (`tests/sauce/`) | `'@playwright/test'` or `'../../fixtures/page-fixtures'` |

**Never** import `test` from `@playwright/test` in an E2E spec — it bypasses the entire fixture system and the test will not receive any page object.

---

## Page Objects: Keep Specs Clean

- Selectors live **only** in `.page.ts` files. Never write `page.locator(...)`, `page.getByRole(...)`, etc. inside a spec file.
- If a test needs to interact with an element that is not yet modelled, add it to the relevant `.page.ts` file first.
- Actions live **only** in `.page.ts` files. Multi-step interactions belong in `actions`, not inlined in tests.

---

## Allure Annotations: Always Present

Every `test.describe` block must have a `beforeEach` that sets `feature`, `story`, and `severity`:

```ts
test.beforeEach(async () => {
  await feature('...');
  await story('...');
  await severity('critical'); // critical | normal | minor | trivial
});
```

If a new spec is added without these, add them. Do not leave them as `// TODO`.

---

## Serial Mode: Required for Stateful Test Suites

Any spec whose tests depend on shared state (auth token, seeded row ID, response data passed between tests) must have:

```ts
test.describe.configure({ mode: 'serial' });
```

This applies to **all** API specs and **all** DB specs by default.

---

## DB Tests: Always Truncate First

Every DB `test.describe` must call `await truncateAll()` in `beforeEach` to guarantee a clean slate before each test. No exceptions — even if a test "doesn't need it", the next one might.

---

## Data Generation: Use Faker, Not Hardcoded Strings

- Dynamic data (names, emails, passwords, titles, descriptions) must use `@faker-js/faker`.
- Never hardcode `"test@example.com"` or `"Test1234"` in tests. These create flaky serial-state leaks and false confidence.
- Credentials or tokens that must be stable (e.g., SauceDemo login) are the only exception, and they live in `.env` files — not in source code.

---

## Environment Variables: Always via `config/env.ts`

Never reference `process.env.SOME_VAR` directly in a test, page, or utility file. Always import the typed `config` object:

```ts
import { config } from '../../config/env';
// then use: config.apiUrl, config.e2eUrl, config.dbHost, etc.
```

---

## New Page Checklist

When creating a new page object, three files must be touched — not one:

1. `pages/<name>.page.ts` — the class itself.
2. `fixtures/page-fixtures/index.ts` — import, type entry, and `base.extend` callback.
3. The consuming spec file in `tests/e2e/`.

If only the page file is created but the fixture is not updated, the test will fail to compile.

---

## Locator Preference Order

1. `getByRole` — always first choice (accessible + resilient)
2. `getByLabel` — for form inputs
3. `getByPlaceholder` — for inputs without a label
4. `getByText` — for static text content
5. `getByTestId` — only if a `data-testid` attribute exists
6. CSS / XPath — last resort, and only inside `.page.ts`, never in specs

---

## Playwright Documentation: Always Use Local Docs First

This project keeps a complete, version-matched copy of the Playwright documentation in `docs/`. It is always more accurate than training data for the specific Playwright version this project uses.

- For any Playwright API method question → the answer is in `docs/api/`
- For any Playwright feature or how-to question → the answer is in `docs/guides/`
- **Never answer a Playwright API or behaviour question from training data alone** — training data may be stale
- Use `.pi/skills/find-in-docs.md` as the navigation index to locate the exact file — do not read the entire `docs/` folder
- Read only the single file that is relevant — one file answers one question

---

## Visual Regression: Docker Only

Never run `visual-regression.spec.ts` with `npx playwright test` directly.  
Always use `npm run test:visual` or `npm run test:visual:update`.  
Pixel comparisons are OS/font-rendering-sensitive — running outside Docker will generate wrong baselines or false failures on CI.

---

## After Any Code Change

Before declaring a task done, verify:

- [ ] `npx tsc --noEmit` — no type errors
- [ ] `npx eslint .` — no lint violations
- [ ] `prettier --check .` — no formatting issues (or run `prettier --write .`)
- [ ] The affected test(s) pass when run locally with the appropriate project flag
