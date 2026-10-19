import { test, expect } from '../../../fixtures/index.ts';
import { GOOD, HOME_SLOW_4G_CEILING } from '../../../utilities/perf-budgets.ts';
import { measurePageLoad, SLOW_4G, throttle } from '../../../utilities/performance.ts';

test.describe('home page load', () => {
  test('positive: cold load meets the good Web Vitals thresholds', { tag: '@example' }, async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(page.getByTestId('product-name').first()).toBeVisible();

    const metrics = await measurePageLoad(page, testInfo);

    // Soft, so one run reports every metric that is over budget, not just the first.
    expect.soft(metrics.lcp, 'LCP (ms)').toBeLessThanOrEqual(GOOD.lcp);
    expect.soft(metrics.cls, 'CLS').toBeLessThanOrEqual(GOOD.cls);
    expect.soft(metrics.ttfb, 'TTFB (ms)').toBeLessThanOrEqual(GOOD.ttfb);
  });

  test('positive: cold load on slow 4G does not regress', { tag: '@example' }, async ({ page }, testInfo) => {
    await throttle(page, SLOW_4G);
    await page.goto('/');
    await expect(page.getByTestId('product-name').first()).toBeVisible({ timeout: 30_000 });

    const metrics = await measurePageLoad(page, testInfo);

    expect.soft(metrics.lcp, 'LCP (ms), current-state ceiling').toBeLessThanOrEqual(HOME_SLOW_4G_CEILING.lcp);
    expect.soft(metrics.cls, 'CLS, current-state ceiling').toBeLessThanOrEqual(HOME_SLOW_4G_CEILING.cls);
    expect.soft(metrics.ttfb, 'TTFB (ms)').toBeLessThanOrEqual(GOOD.ttfb);
  });

  test(
    'positive: cold load on slow 4G meets the good Web Vitals thresholds',
    {
      tag: '@example',
      annotation: [
        { type: 'issue', description: 'finding: home LCP 2.8–2.9 s on slow 4G (good ≤ 2.5 s)' },
        { type: 'issue', description: 'finding: home CLS 0.258 on slow 4G (good ≤ 0.1, poor > 0.25)' },
      ],
    },
    async ({ page }, testInfo) => {
      test.fail();
      await throttle(page, SLOW_4G);
      await page.goto('/');
      await expect(page.getByTestId('product-name').first()).toBeVisible({ timeout: 30_000 });

      const metrics = await measurePageLoad(page, testInfo);

      expect.soft(metrics.lcp, 'LCP (ms)').toBeLessThanOrEqual(GOOD.lcp);
      expect.soft(metrics.cls, 'CLS').toBeLessThanOrEqual(GOOD.cls);
    },
  );
});
