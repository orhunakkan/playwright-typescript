import { test } from '../../fixtures/index';
import { mergeExpects, mergeTests } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

import { priceExpect } from '../../matchers/price.matcher';
import { orderStatusExpect } from '../../matchers/order-status.matcher';
import { pricingTest } from '../../matchers/pricing.fixture';
import { ratingTest } from '../../matchers/rating.fixture';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-64 — Custom Assertions & Matcher Composition

const URL = '/practice/custom-assertions';

// AC-4 (TAB1-64): combine matchers defined in two separate files into a single `expect`
const expect = mergeExpects(priceExpect, orderStatusExpect);

const scan = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();

// Data-driven table for AC-1 (Phase 4b) — valid/invalid/boundary price strings, applied by
// mutating the live order-price element's textContent so the matcher is exercised across a
// range of inputs the real app never happens to render on its own.
const priceCases = [
  { value: '$0.01', label: 'valid — smallest positive amount (boundary)', expectValid: true },
  { value: '$1,234.56', label: 'valid — thousands separator', expectValid: true },
  { value: '5', label: 'valid — no currency symbol', expectValid: true },
  { value: '$0.00', label: 'invalid — zero is not positive', expectValid: false },
  { value: '-$5.00', label: 'invalid — negative amount', expectValid: false },
  { value: 'N/A', label: 'invalid — non-numeric text', expectValid: false },
  { value: '', label: 'invalid — empty text', expectValid: false },
];

// Data-driven table for AC-3 (Phase 4b) — case sensitivity and mismatch handling.
const orderStatusCases = [
  { expected: 'pending', shouldPass: true, label: 'exact match on initial load' },
  { expected: 'Pending', shouldPass: false, label: 'case-sensitive mismatch' },
  { expected: 'shipped', shouldPass: false, label: 'mismatched status before advancing' },
  { expected: ' pending', shouldPass: false, label: 'whitespace mismatch' },
];

test.describe('Custom Assertions & Matcher Composition', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    // Several cases below mutate this React-rendered DOM directly (page.evaluate) to force
    // values the live app never renders on its own. Mutating too early races React's hydration,
    // which silently reverts the raw DOM change once it reconciles — waiting for the order
    // heading first guarantees hydration has already committed before any mutation runs.
    await page.getByRole('heading', { name: 'Order #A1042' }).waitFor();
    await page.waitForTimeout(300);
  });

  // AC-1 (TAB1-64): Tests define a custom matcher (e.g. toBeAValidPrice) via expect.extend()
  // that awaits locator.textContent() and fails when the parsed value is not a valid, positive
  // currency amount
  test.describe('AC-1 — toBeAValidPrice validates a positive currency amount', () => {
    test('positive: the real order price ($42.50) passes toBeAValidPrice', async ({ customAssertionsPage }) => {
      await expect(customAssertionsPage.orderPrice).toBeAValidPrice();
    });

    for (const { value, label, expectValid } of priceCases) {
      test(`data-driven: ${label}`, async ({ page, customAssertionsPage }) => {
        await page.evaluate((text) => {
          const el = document.querySelector('[data-testid="order-price"]');
          if (el) el.textContent = text;
        }, value);

        if (expectValid) {
          await expect(customAssertionsPage.orderPrice).toBeAValidPrice();
        } else {
          await expect(customAssertionsPage.orderPrice).not.toBeAValidPrice();
        }
      });
    }
  });

  // AC-2 (TAB1-64): Tests deliberately fail the custom matcher once and assert the returned
  // { pass, message } failure message differs from the default toHaveText output
  test.describe('AC-2 — custom matcher failure message differs from the default toHaveText output', () => {
    test('negative: toBeAValidPrice failure message is matcher-specific, not the generic toHaveText diff', async ({ page, customAssertionsPage }) => {
      await page.evaluate(() => {
        const el = document.querySelector('[data-testid="order-price"]');
        if (el) el.textContent = 'not-a-price';
      });

      let customMessage = '';
      try {
        await expect(customAssertionsPage.orderPrice).toBeAValidPrice();
      } catch (error) {
        customMessage = (error as Error).message;
      }

      let defaultMessage = '';
      try {
        await expect(customAssertionsPage.orderPrice).toHaveText('$99.99', { timeout: 1000 });
      } catch (error) {
        defaultMessage = (error as Error).message;
      }

      expect(customMessage).not.toBe('');
      expect(defaultMessage).not.toBe('');
      expect(customMessage).not.toBe(defaultMessage);
      expect(customMessage).toContain('valid positive currency amount');
      expect(defaultMessage).not.toContain('valid positive currency amount');
    });
  });

  // AC-3 (TAB1-64): Tests define a second matcher, toHaveOrderStatus(expected), that asserts
  // on the data-status attribute rather than the visible badge text
  test.describe('AC-3 — toHaveOrderStatus asserts the data-status attribute, not the badge text', () => {
    for (const { expected, shouldPass, label } of orderStatusCases) {
      test(`data-driven: ${label}`, async ({ customAssertionsPage }) => {
        if (shouldPass) {
          await expect(customAssertionsPage.orderStatus).toHaveOrderStatus(expected);
        } else {
          await expect(customAssertionsPage.orderStatus).not.toHaveOrderStatus(expected);
        }
      });
    }

    test('boundary: advancing the status updates data-status through pending → shipped → delivered', async ({ customAssertionsPage }) => {
      await expect(customAssertionsPage.orderStatus).toHaveOrderStatus('pending');
      await customAssertionsPage.advanceStatusButton.click();
      await expect(customAssertionsPage.orderStatus).toHaveOrderStatus('shipped');
      await customAssertionsPage.advanceStatusButton.click();
      await expect(customAssertionsPage.orderStatus).toHaveOrderStatus('delivered');
      await expect(customAssertionsPage.advanceStatusButton).toBeDisabled();
    });

    test('negative: the matcher reads data-status even when the visible text is changed independently', async ({ page, customAssertionsPage }) => {
      // Proves the matcher is attribute-driven: mutate only the visible text node, leave
      // data-status untouched, and confirm the matcher still passes against the attribute.
      await page.evaluate(() => {
        const el = document.querySelector('[data-testid="order-status"]');
        if (el) el.textContent = 'totally different label';
      });
      await expect(customAssertionsPage.orderStatus).toHaveOrderStatus('pending');
      const visibleText = await customAssertionsPage.orderStatus.textContent();
      expect(visibleText).not.toBe('pending');
    });
  });

  // AC-4 (TAB1-64): Tests combine matchers defined in two separate files into a single expect
  // via mergeExpects() and use both in one test file
  test.describe('AC-4 — mergeExpects() combines matchers from two files into a single expect', () => {
    test('positive: the merged expect exposes both toBeAValidPrice and toHaveOrderStatus, used together in one test', async ({
      customAssertionsPage,
    }) => {
      await expect(customAssertionsPage.orderPrice).toBeAValidPrice();
      await expect(customAssertionsPage.orderStatus).toHaveOrderStatus('pending');
    });

    test(`negative: the merge preserves each matcher's independent fail path — one failing does not mask the other`, async ({
      page,
      customAssertionsPage,
    }) => {
      await page.evaluate(() => {
        const el = document.querySelector('[data-testid="order-price"]');
        if (el) el.textContent = 'invalid';
      });

      await expect(customAssertionsPage.orderPrice).not.toBeAValidPrice();
      // the status matcher still works correctly even though the price matcher just failed
      await expect(customAssertionsPage.orderStatus).toHaveOrderStatus('pending');
    });
  });

  // AC-5 (TAB1-64): Tests explore mergeTests() to combine fixtures from two modules and
  // confirm it composes the same way mergeExpects() composes matchers
  test.describe('AC-5 — mergeTests() combines fixtures from two modules', () => {
    const mergedTest = mergeTests(pricingTest, ratingTest);

    mergedTest(
      'positive: the merged test exposes both priceLocator and ratingValueLocator fixtures in one test',
      async ({ page, priceLocator, ratingValueLocator }) => {
        await page.goto(URL);
        await expect(priceLocator).toBeVisible();
        await expect(priceLocator).toHaveText('$42.50');
        await expect(ratingValueLocator).toBeVisible();
        await expect(ratingValueLocator).toHaveText('Rating: 0 / 5');
      },
    );

    // boundary: mergeTests() composes the same regardless of argument order — merging
    // (ratingTest, pricingTest) instead of (pricingTest, ratingTest) still exposes both
    // fixtures, mirroring how mergeExpects() doesn't care which matcher file comes first.
    const reverseMergedTest = mergeTests(ratingTest, pricingTest);

    reverseMergedTest(
      'boundary: merging the same two fixture modules in reverse order still exposes both fixtures',
      async ({ page, priceLocator, ratingValueLocator }) => {
        await page.goto(URL);
        await expect(priceLocator).toHaveText('$42.50');
        await expect(ratingValueLocator).toHaveText('Rating: 0 / 5');
      },
    );

    // negative: documents why the merge above was necessary in the first place — a test built
    // from only pricing.fixture.ts's own test object has no ratingValueLocator fixture at all;
    // TypeScript rejects destructuring it here at compile time, which is exactly the gap
    // mergeTests() exists to close (the same way mergeExpects() closes it for matchers).
    pricingTest('negative: a test built from only pricing.fixture.ts has access to priceLocator only', async ({ page, priceLocator }) => {
      await page.goto(URL);
      await expect(priceLocator).toHaveText('$42.50');
    });
  });

  // Accessibility — scan load + mid-interaction (status advanced) + rated states (Phase 5)
  test.describe('accessibility (WCAG 2.x, axe)', () => {
    test('no violations on initial page load', async ({ page }) => {
      expect((await scan(page)).violations).toEqual([]);
    });

    test('no violations after advancing the order status', async ({ page, customAssertionsPage }) => {
      await customAssertionsPage.advanceStatusButton.click();
      expect((await scan(page)).violations).toEqual([]);
    });

    test('no violations after selecting a star rating', async ({ page, customAssertionsPage }) => {
      await customAssertionsPage.star4.click();
      await expect(customAssertionsPage.ratingValue).toHaveText('Rating: 4 / 5');
      expect((await scan(page)).violations).toEqual([]);
    });
  });
});

// Performance — navigates independently so timing reflects cold initial load, not post-beforeEach
// warm load.
test.describe('performance @performance', () => {
  test('initial load is within budget', async ({ page }) => {
    await page.goto(URL);
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
    });
    // Budgets are intentionally generous so they don't flake against a live site.
    expect(timing.domContentLoaded).toBeLessThan(6000);
    expect(timing.load).toBeLessThan(12000);
  });
});
