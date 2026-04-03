---
name: generate-page
description: Scaffold a new Page Object Model class following project conventions
argument-hint: 'page-name (e.g. checkout, user-profile)'
---

Generate a new Page Object Model class for: $ARGUMENTS

Follow these conventions (read an existing page first, e.g. pages/login-form.page.ts):

- File: pages/<name>.page.ts (kebab-case)
- Import `Locator` and `Page` from `@playwright/test`
- Export class named `<PascalCase>Page`
- Constructor: `constructor(private readonly page: Page)`
- `readonly locators` object with named Locator fields using getByRole(), getByLabel(), getByText(), or page.locator()
- `readonly actions` object with async methods including a `goto()` that uses `process.env.PRACTICE_E2E_URL`
- No default exports — named export only
