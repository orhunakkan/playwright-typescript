// pricing.fixture.ts
// Fixture module for TAB1-64's mergeTests() exploration (AC-5) — deliberately kept separate
// from rating.fixture.ts so the spec can prove mergeTests() composes fixtures across modules
// the same way mergeExpects() composes matchers across matcher modules.

import { test as base, type Locator } from '@playwright/test';

type PricingFixtures = {
  priceLocator: Locator;
};

export const pricingTest = base.extend<PricingFixtures>({
  priceLocator: async ({ page }, use) => {
    await use(page.getByTestId('order-price'));
  },
});
