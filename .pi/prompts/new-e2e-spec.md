# Prompt: Create a New E2E Spec

Use this template when asked to write a new browser UI test. E2E specs live in `tests/e2e/` and always import from the custom fixture, not from `@playwright/test` directly.

---

## Full Template

Replace every `<!-- REPLACE: ... -->` placeholder with real values.

```ts
import { test, expect } from '../../fixtures/page-fixtures';
import { feature, story, severity } from 'allure-js-commons';

test.describe('<!-- REPLACE: Chapter X - Section Title -->', () => {
  // ─────────────────────────────────────────────────
  //  <!-- REPLACE: Sub-feature name -->
  // ─────────────────────────────────────────────────
  test.describe('<!-- REPLACE: Sub-feature name -->', () => {
    test.beforeEach(async ({ <!-- REPLACE: camelCasePageFixture --> }) => {
      await feature('<!-- REPLACE: Feature label for Allure report -->');
      await story('<!-- REPLACE: Story label for Allure report -->');
      await severity('<!-- REPLACE: critical | normal | minor | trivial -->');
      await <!-- REPLACE: camelCasePageFixture -->.actions.goto();
    });

    // ── Smoke: page loads and key elements are visible ──────────────────────
    test(
      'should display the page heading',
      { tag: ['@smoke'] },
      async ({ <!-- REPLACE: camelCasePageFixture --> }) => {
        await expect(<!-- REPLACE: camelCasePageFixture -->.locators.heading).toBeVisible();
      },
    );

    // ── Interaction: core user flow ──────────────────────────────────────────
    test(
      'should <!-- REPLACE: describe what the critical interaction does -->',
      { tag: ['@critical'] },
      async ({ <!-- REPLACE: camelCasePageFixture --> }) => {
        // Arrange
        <!-- REPLACE: any setup steps using actions -->

        // Act
        await <!-- REPLACE: camelCasePageFixture -->.actions.<!-- REPLACE: actionMethod -->();

        // Assert
        await expect(<!-- REPLACE: camelCasePageFixture -->.locators.<!-- REPLACE: resultLocator -->).<!-- REPLACE: assertion -->;
      },
    );

    // ── Edge case / negative path ────────────────────────────────────────────
    test(
      'should <!-- REPLACE: describe the edge case -->',
      async ({ <!-- REPLACE: camelCasePageFixture --> }) => {
        <!-- REPLACE: edge case steps and assertions -->
      },
    );
  });
});
```

---

## Rules to Follow

### Import

- `test` and `expect` come from `'../../fixtures/page-fixtures'` — never from `'@playwright/test'`.
- `feature`, `story`, `severity` come from `'allure-js-commons'`.
- Import `config` from `'../../config/env'` only if the test needs a URL or env value directly (rare — prefer `actions.goto()`).

### `beforeEach`

- Always set all three Allure labels: `feature`, `story`, `severity`.
- Always call `goto()` in `beforeEach` so every test starts from the correct URL.
- Do **not** perform assertions in `beforeEach`.

### Locators and Actions

- Never call `page.getByRole(...)` or any Playwright selector directly in the spec. Use `fixture.locators.*` and `fixture.actions.*` only.
- If an element is not yet modelled, add it to the `.page.ts` file first.

### Tags

- `@smoke` — fast, basic visibility/load check. Should always pass and run quickly.
- `@critical` — the most important user-facing interaction for the feature.
- Tests without tags are standard regression tests.

### Test Naming

- Use plain English, third-person: `'should display the heading'`, `'should submit the form successfully'`.
- Negative paths: `'should show an error when the field is empty'`.

### Multiple Sub-Describe Blocks

When a spec file covers multiple related sub-features (like the `framework-features.spec.ts` pattern), wrap each group in its own `test.describe` with its own `beforeEach`:

```ts
test.describe('Chapter X', () => {
  test.describe('Feature A', () => {
    test.beforeEach(async ({ pageFixtureA }) => {
      /* ... */
    });
    // tests for Feature A
  });

  test.describe('Feature B', () => {
    test.beforeEach(async ({ pageFixtureB }) => {
      /* ... */
    });
    // tests for Feature B
  });
});
```

---

## Verification

Run the new spec in headed mode to watch it execute:

```bash
npx playwright test tests/e2e/<your-spec>.spec.ts --project="Desktop Chrome" --headed
```

Then run across all browser projects:

```bash
npx playwright test tests/e2e/<your-spec>.spec.ts
```
