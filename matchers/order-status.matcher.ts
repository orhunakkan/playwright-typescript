// order-status.matcher.ts
// Custom matcher module for TAB1-64 (Custom Assertions & Matcher Composition).
// Defines `toHaveOrderStatus`, combined with price.matcher.ts via mergeExpects()
// in tests/custom-assertions/custom-assertions.spec.ts.

import { expect as baseExpect, type Locator } from '@playwright/test';

declare global {
  namespace PlaywrightTest {
    interface Matchers<R, T> {
      toHaveOrderStatus(expected: string): R;
    }
  }
}

export const orderStatusExpect = baseExpect.extend({
  async toHaveOrderStatus(locator: Locator, expected: string) {
    const assertionName = 'toHaveOrderStatus';
    // Reads the `data-status` attribute rather than the visible badge text, so a copy
    // change to the label (or CSS text-transform) can never mask a status mismatch.
    const actual = await locator.getAttribute('data-status');
    const pass = actual === expected;

    return {
      pass,
      name: assertionName,
      message: () =>
        pass
          ? `expected data-status not to be "${expected}"`
          : `expected data-status to be "${expected}" but received "${actual ?? '(no data-status attribute)'}"`,
    };
  },
});
