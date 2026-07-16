// price.matcher.ts
// Custom matcher module for TAB1-64 (Custom Assertions & Matcher Composition).
// Defines `toBeAValidPrice`, combined with order-status.matcher.ts via mergeExpects()
// in tests/custom-assertions/custom-assertions.spec.ts.

import { expect as baseExpect, type Locator } from '@playwright/test';

declare global {
  namespace PlaywrightTest {
    interface Matchers<R, T> {
      toBeAValidPrice(): R;
    }
  }
}

// Accepts an optional leading "$", optional thousands separators, and an optional
// 1-2 digit decimal — e.g. "$42.50", "1,234.56", "$5". Rejects negative signs outright,
// so a mismatched leading "-" fails the format check before the positivity check even runs.
const VALID_PRICE_PATTERN = /^\$?\d{1,3}(,\d{3})*(\.\d{1,2})?$|^\$?\d+(\.\d{1,2})?$/;

export const priceExpect = baseExpect.extend({
  async toBeAValidPrice(locator: Locator) {
    const assertionName = 'toBeAValidPrice';
    const text = ((await locator.textContent()) ?? '').trim();
    const numeric = Number.parseFloat(text.replace(/[$,]/g, ''));
    const pass = VALID_PRICE_PATTERN.test(text) && !Number.isNaN(numeric) && numeric > 0;

    return {
      pass,
      name: assertionName,
      message: () =>
        pass
          ? `expected "${text}" not to be a valid positive currency amount`
          : `expected "${text}" to be a valid positive currency amount (e.g. "$42.50"), but it was not a positive, correctly formatted price`,
    };
  },
});
