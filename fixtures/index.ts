import { test as base } from '@playwright/test';

// Register each page object as a fixture here, e.g.
//   type Fixtures = { loginPage: LoginPage };
//   loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
type Fixtures = {};

export const test = base.extend<Fixtures>({});

export { expect } from '@playwright/test';
