# Agent Ground Rules

These rules apply to every task in this repository. Read them before touching files.

---

## TypeScript First

- Source files in `pages/`, `tests/`, `utilities/`, `config/`, and `fixtures/` are TypeScript.
- Do not add new `.js` source files in those folders. Existing generated output under build/dist-style folders is not a pattern to copy.
- The `side-learning/` folder is intentionally plain HTML/CSS/JS and is the exception.
- Never use `any`. Use existing types (`ApiResponse<T>`, `ObjectSchema`, payload interfaces, Playwright types) or define a specific interface.
- Use `as const` for literal arrays and objects when the value should remain narrow.
- Mentally type-check imports before finalising changes.

---

## Test Imports: Know Where to Import From

| Test type                               | Import `test` and `expect` from                          |
| --------------------------------------- | -------------------------------------------------------- |
| E2E (`tests/e2e/`)                      | `'../../fixtures/page-fixtures'`                         |
| Accessibility (`tests/accessibility/`)  | `'../../fixtures/page-fixtures'`                         |
| Visual (`tests/visual-regression/`)     | `'../../fixtures/page-fixtures'`                         |
| API (`tests/api/`)                      | `'@playwright/test'`                                     |
| Docs monitoring (`tests/pw-documents/`) | `'@playwright/test'`                                     |
| Sauce (`tests/sauce/`)                  | `'@playwright/test'` or `'../../fixtures/page-fixtures'` |

Never import `test` from `@playwright/test` in an E2E spec that needs page objects; that bypasses the custom fixture system.

---

## Page Objects: Keep Specs Clean

- Selectors live in `.page.ts` files whenever a page object exists for that surface.
- Do not add `page.locator(...)`, `page.getByRole(...)`, etc. inside E2E specs when the element can be modelled on a page object.
- If a test needs an unmodelled element, add it to the relevant page object first.
- Multi-step interactions belong in page-object `actions`, not inline in specs.

---

## Allure Annotations

Every new `test.describe` block should set `feature`, `story`, and `severity` in `beforeEach`:

```ts
test.beforeEach(async () => {
  await feature('...');
  await story('...');
  await severity('critical'); // critical | normal | minor | trivial
});
```

Do not leave Allure labels as TODOs.

---

## Serial Mode: Required for Stateful Suites

Any spec whose tests depend on shared state (auth token, created resource ID, response data passed between tests) must have:

```ts
test.describe.configure({ mode: 'serial' });
```

This applies to the stateful API flows in `tests/api/`.

---

## Data Generation: Use Faker

- Dynamic data (names, emails, passwords, titles, descriptions) must use `@faker-js/faker` or existing Faker-backed generators.
- Do not hardcode reusable values like `test@example.com` or `Test1234` in tests.
- Stable credentials or public practice-site values must live in `.env` files, not source code.

---

## Environment Variables: Always via `config/env.ts`

Never reference `process.env.SOME_VAR` directly in a test, page, or utility file. Always import the typed config object:

```ts
import { config } from '../../config/env';
// then use: config.apiUrl, config.e2eUrl, config.sauceDemoUrl, config.env
```

The only normal exception is configuration/bootstrap code such as `playwright.config.ts` and `config/env.ts` itself.

---

## New Page Checklist

When creating a new page object, update all related files:

1. `pages/<name>.page.ts` — the class itself.
2. `fixtures/page-fixtures/index.ts` — import, type entry, and `base.extend` callback.
3. The consuming spec file in `tests/e2e/`, `tests/accessibility/`, `tests/visual-regression/`, or `tests/sauce/` as appropriate.

If the page file is created but the fixture is not updated, fixture-backed specs will fail to compile.

---

## Locator Preference Order

1. `getByRole` — first choice (accessible + resilient)
2. `getByLabel` — form inputs
3. `getByPlaceholder` — inputs without a label
4. `getByText` — static text content
5. `getByTestId` — only if a `data-testid` exists
6. CSS / XPath — last resort, inside `.page.ts` only

---

## Playwright Documentation: Use Local Docs First

This project keeps a version-matched copy of Playwright docs in `docs/`.

- Playwright API method question → `docs/api/`
- Playwright feature/how-to question → `docs/guides/`
- MCP or agent CLI question → `docs/mcp/` or `docs/agent-cli/`
- Use `.pi/skills/find-in-docs/SKILL.md` to locate the exact file.
- Read only the relevant file, not the whole `docs/` tree.

---

## Visual Regression: Docker Only

Never run `visual-regression.spec.ts` with raw `npx playwright test` on the host OS.

Use:

```bash
npm run test:visual
npm run test:visual:update
```

Pixel comparisons are OS/font-rendering-sensitive; Docker keeps local and CI rendering aligned.

---

## DB Layer Status

The current repository does not include active DB tests, PostgreSQL utilities, DB payload fixtures, or a `test:db` npm script. Do not use old DB guidance unless the DB layer is intentionally restored first.

---

## After Any Code Change

Before declaring a code task done, verify as appropriate:

- [ ] `npm run typecheck`
- [ ] `npm run lint:check`
- [ ] `npm run format:check` or `npm run format`
- [ ] Affected tests pass with the right project/script

For documentation-only changes, run Prettier on the edited markdown files at minimum.
