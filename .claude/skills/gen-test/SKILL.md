---
name: gen-test
description: Generate a new Playwright test file following project conventions
argument-hint: "feature-name-or-description"
---

Generate a new Playwright E2E test file for: $ARGUMENTS

Follow these project conventions:
- Place in tests/e2e/ directory
- Use test.describe() blocks for organization
- Use getByRole(), getByText(), getByLabel() locators (prefer accessible locators)
- Use @faker-js/faker for test data generation
- Use async/await
- Use expect() assertions from @playwright/test
- Follow existing test patterns in tests/e2e/
- File name: kebab-case ending in .spec.ts

Reuse existing utilities instead of writing inline code:
- Cookies needed? Use `acceptCookiesBeforeSession()` from utilities/cookies.ts
- Login needed? Use `programmaticLogin()` from utilities/login.ts
- Error tracking? Use `attachAllErrorListeners()` from utilities/error-listeners.ts
- New tab validation? Use `validateLinkNewTab()` from utilities/dedicated-page.ts
- DOM stability? Use `waitForDomStability()` from utilities/page-load-time.ts

Read existing test files first to match the style and patterns used in this project.
