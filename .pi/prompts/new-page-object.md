# Prompt: Create a New Page Object

Use this template when asked to add a new page to the framework. The page class, fixture index, and at least one consuming spec must be updated together.

---

## Step 1 — Create `pages/<kebab-case-name>.page.ts`

Replace every `<!-- REPLACE: ... -->` placeholder with real values.

```ts
import { Locator, Page } from '@playwright/test';
import { config } from '../config/env';

export class <!-- REPLACE: PascalCaseName -->Page {
  readonly locators: {
    // ── Add a typed Locator property for every element the tests will touch ──
    heading: Locator;
    <!-- REPLACE: add more locators here -->;
  };
  readonly actions: {
    // ── Add a typed async method for every interaction or navigation ──
    goto: () => Promise<void>;
    <!-- REPLACE: add more actions here -->;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      // ── Prefer getByRole > getByLabel > getByPlaceholder > getByText > CSS ──
      heading: page.getByRole('heading', { name: '<!-- REPLACE: page heading text -->' }),
      <!-- REPLACE: implement additional locators here -->,
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${config.e2eUrl}/<!-- REPLACE: url-slug.html -->`);
      },
      <!-- REPLACE: implement additional actions here -->,
    };
  }
}
```

**Locator rules:**

- Only `Locator` values. No `await`, no conditionals, no logic.
- Dynamic locators (e.g., "find the nth item" or "find by variable text") are fine as methods that return `Locator`:
  ```ts
  itemByText: (text: string) => page.getByRole('listitem').filter({ hasText: text }),
  ```

**Action rules:**

- All action methods are `async`.
- Actions may call `this.locators.*` and `this.actions.*` (other actions).
- Never use `expect(...)` inside an action — assertions belong in spec files.

---

## Step 2 — Register in `fixtures/page-fixtures/index.ts`

Three additions are required. Find the relevant sections and insert:

### 2a. Import (at the top, with other imports)

```ts
import { <!-- REPLACE: PascalCaseName -->Page } from '../../pages/<!-- REPLACE: kebab-case-name -->.page';
```

### 2b. Type property (inside the `PageFixtures` type block)

```ts
type PageFixtures = {
  // ... existing entries ...
  <!-- REPLACE: camelCaseName -->Page: <!-- REPLACE: PascalCaseName -->Page;
};
```

### 2c. Extend callback (inside the `base.extend<PageFixtures>({...})` block)

```ts
const test = base.extend<PageFixtures>({
  // ... existing entries ...
  <!-- REPLACE: camelCaseName -->Page: async ({ page }, use) => {
    await use(new <!-- REPLACE: PascalCaseName -->Page(page));
  },
});
```

---

## Naming Convention Summary

| Thing       | Pattern               | Example                   |
| ----------- | --------------------- | ------------------------- |
| File name   | `kebab-case.page.ts`  | `slow-login-form.page.ts` |
| Class name  | `PascalCase` + `Page` | `SlowLoginFormPage`       |
| Fixture key | `camelCase` + `Page`  | `slowLoginFormPage`       |

---

## Completed Example (for reference)

**`pages/dialog-boxes.page.ts`** pattern:

- Locators expose individual dialog trigger buttons and result text.
- Actions expose `goto()` and `triggerAlert()`, `triggerConfirm()`, etc.
- Fixture key is `dialogBoxesPage`.

---

## Step 3 — Add or Update the Consuming Spec

Create or update the relevant spec in `tests/e2e/`, `tests/accessibility/`, `tests/visual-regression/`, or `tests/sauce/` so the new page object is exercised.

For browser E2E specs, import from the custom fixture:

```ts
import { test, expect } from '../../fixtures/page-fixtures';
```

## Verification

After all related files are updated, run:

```bash
npm run typecheck
```

There must be zero errors. If an import path is wrong or the type is missing, the compiler will catch it before any test runs.
