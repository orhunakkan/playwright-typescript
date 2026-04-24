---
description: Step-by-step guide for creating a new page object, registering it in the fixture index, and scaffolding the matching E2E spec file.
---

# Skill: Add a New Page and Fixture

Follow these steps in order. Do not skip Step 5 — it catches problems before any test runs.

---

## Step 1 — Create the Page Object File

Create `pages/<kebab-case-name>.page.ts` using the `new-page-object.md` prompt template.

Checklist:

- [ ] File is named `<kebab-case-name>.page.ts`
- [ ] Class is named `<PascalCaseName>Page`
- [ ] Class exposes a `readonly locators` object with typed `Locator` properties
- [ ] Class exposes a `readonly actions` object with typed async methods
- [ ] Constructor signature is `constructor(private readonly page: Page)`
- [ ] `goto()` action uses `config.e2eUrl` — not a hardcoded URL
- [ ] Locators use `getByRole` / `getByLabel` / `getByText` where possible
- [ ] No `expect(...)` calls inside the page class

---

## Step 2 — Import the Page Class in the Fixture Index

Open `fixtures/page-fixtures/index.ts` and add the import at the top, grouped with existing page imports (alphabetical order is preferred):

```ts
import { <PascalCaseName>Page } from '../../pages/<kebab-case-name>.page';
```

---

## Step 3 — Add the Fixture Type

Inside the `PageFixtures` type block in `fixtures/page-fixtures/index.ts`, add a new property:

```ts
type PageFixtures = {
  // ... existing entries (keep alphabetical order) ...
  <camelCaseName>Page: <PascalCaseName>Page;
};
```

---

## Step 4 — Add the Extend Callback

Inside the `base.extend<PageFixtures>({...})` block, add the fixture factory:

```ts
const test = base.extend<PageFixtures>({
  // ... existing entries ...
  <camelCaseName>Page: async ({ page }, use) => {
    await use(new <PascalCaseName>Page(page));
  },
});
```

---

## Step 5 — Type-Check (Do Not Skip)

Run the TypeScript compiler in no-emit mode:

```bash
npx tsc --noEmit
```

**Expected result:** zero errors, zero output.

Common errors and their fixes:

| Error                                                         | Fix                                                      |
| ------------------------------------------------------------- | -------------------------------------------------------- |
| `Cannot find module '../../pages/<name>.page'`                | Check the import path and file name match exactly        |
| `Property '<name>Page' does not exist on type 'PageFixtures'` | The type entry in Step 3 is missing or misspelled        |
| `Argument of type '<PascalName>Page' is not assignable`       | The class name in `base.extend` doesn't match the import |
| `Property 'locators' is missing in type`                      | The page class doesn't match the expected structure      |

---

## Step 6 — Create the Spec File

Create `tests/e2e/<kebab-case-name>.spec.ts` using the `new-e2e-spec.md` prompt template.

Checklist:

- [ ] Imports `{ test, expect }` from `'../../fixtures/page-fixtures'`
- [ ] Imports `{ feature, story, severity }` from `'allure-js-commons'`
- [ ] `test.beforeEach` sets all three Allure labels and calls `goto()`
- [ ] Tests use `fixture.locators.*` and `fixture.actions.*` — no raw `page.*` calls in the spec
- [ ] At least one `@smoke` test covering basic page load visibility
- [ ] At least one `@critical` test covering the main interaction

---

## Step 7 — Run the New Spec

Verify the tests pass in headed mode to watch the browser:

```bash
npx playwright test tests/e2e/<kebab-case-name>.spec.ts --project="Desktop Chrome" --headed
```

Then run silently across all E2E projects to check for cross-browser regressions:

```bash
npx playwright test tests/e2e/<kebab-case-name>.spec.ts
```

---

## Step 8 — Lint and Format

```bash
npx eslint . --fix
prettier --write .
```

---

## Complete Naming Reference

| Artefact                    | Convention            | Derived from `my new feature` |
| --------------------------- | --------------------- | ----------------------------- |
| Page file                   | `kebab-case.page.ts`  | `my-new-feature.page.ts`      |
| Page class                  | `PascalCase` + `Page` | `MyNewFeaturePage`            |
| Fixture key (type + extend) | `camelCase` + `Page`  | `myNewFeaturePage`            |
| Spec file                   | `kebab-case.spec.ts`  | `my-new-feature.spec.ts`      |

---

## Files Changed Summary

| File                                  | Change type                          |
| ------------------------------------- | ------------------------------------ |
| `pages/<kebab-case-name>.page.ts`     | ➕ Created                           |
| `fixtures/page-fixtures/index.ts`     | ✏️ 3 additions: import, type, extend |
| `tests/e2e/<kebab-case-name>.spec.ts` | ➕ Created                           |
