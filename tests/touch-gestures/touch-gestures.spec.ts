import { test, expect } from '../../fixtures/index';
import AxeBuilder from '@axe-core/playwright';
import { devices } from '@playwright/test';
import type { Page, BrowserContext } from '@playwright/test';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-41 — Touch & Mobile Gestures

const URL = '/practice/touch-gestures';

const scan = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();

// Playwright's public API exposes only `touchscreen.tap()` (single point) — there is no
// swipe/drag primitive. A real swipe needs a raw CDP `Input.dispatchTouchEvent` sequence, and
// `newCDPSession` is Chromium-only (throws on Firefox/WebKit). Every test that calls this helper
// is scoped to Chromium-engine projects via a `test.skip(({ browserName }) => ...)` guard.
async function swipeCarousel(page: Page, context: BrowserContext, distancePx: number) {
  const region = page.getByRole('region', { name: 'Carousel', exact: true });
  await region.scrollIntoViewIfNeeded();
  const box = (await region.boundingBox())!;
  const y = box.y + box.height / 2;
  const startX = box.x + box.width - 20;
  const endX = startX - distancePx;

  const client = await context.newCDPSession(page);
  const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', x: number, tY: number) =>
    client.send('Input.dispatchTouchEvent', {
      type,
      touchPoints: type === 'touchEnd' ? [] : [{ x, y: tY, radiusX: 5, radiusY: 5, id: 1 }],
    });

  const steps = 5;
  await touch('touchStart', startX, y);
  for (let i = 1; i <= steps; i++) {
    await touch('touchMove', startX + (endX - startX) * (i / steps), y);
    await page.waitForTimeout(30);
  }
  await touch('touchEnd', endX, y);
  await page.waitForTimeout(250);
}

test.describe('AC-1 — locator.tap() increments the tap counter', () => {
  test.use({ hasTouch: true });

  test('boundary: counter starts at 0 before any tap', async ({ page, touchGesturesPage }) => {
    await page.goto(URL);
    await expect(touchGesturesPage.tapCount).toHaveText('0');
  });

  test('positive: a single tap increments the counter to 1', async ({ page, touchGesturesPage }) => {
    await page.goto(URL);
    await touchGesturesPage.tapTargetButton.tap();
    await expect(touchGesturesPage.tapCount).toHaveText('1');
  });

  test('positive: three sequential taps accumulate to 3', async ({ page, touchGesturesPage }) => {
    await page.goto(URL);
    await touchGesturesPage.tapTargetButton.tap();
    await touchGesturesPage.tapTargetButton.tap();
    await touchGesturesPage.tapTargetButton.tap();
    await expect(touchGesturesPage.tapCount).toHaveText('3');
  });
});

test.describe('AC-2 — locator.click() does not increment the tap counter', () => {
  test.use({ hasTouch: true });

  test('negative: a mouse click leaves the counter at 0', async ({ page, touchGesturesPage }) => {
    await page.goto(URL);
    await touchGesturesPage.tapTargetButton.click();
    await expect(touchGesturesPage.tapCount).toHaveText('0');
  });

  test('negative: repeated clicks still leave the counter unchanged', async ({ page, touchGesturesPage }) => {
    await page.goto(URL);
    await touchGesturesPage.tapTargetButton.click();
    await touchGesturesPage.tapTargetButton.click();
    await touchGesturesPage.tapTargetButton.click();
    await expect(touchGesturesPage.tapCount).toHaveText('0');
  });

  test('positive contrast: a tap after clicks still increments by exactly 1', async ({ page, touchGesturesPage }) => {
    await page.goto(URL);
    await touchGesturesPage.tapTargetButton.click();
    await touchGesturesPage.tapTargetButton.tap();
    await expect(touchGesturesPage.tapCount).toHaveText('1');
  });
});

test.describe('AC-3/AC-4 — horizontal touch swipe advances the carousel', () => {
  test.use({ hasTouch: true });
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'Swipe simulation needs a raw CDP touch-event sequence — CDP sessions are Chromium-only in Playwright (verified: newCDPSession throws on Firefox/WebKit).',
  );

  test('positive: a swipe advances from Slide 1 to Slide 2 and updates the indicator', async ({ page, context, touchGesturesPage }) => {
    await page.goto(URL);
    await expect(touchGesturesPage.activeSlide).toHaveAttribute('aria-label', 'Slide 1 — Tap');
    await swipeCarousel(page, context, 350);
    await expect(touchGesturesPage.activeSlide).toHaveAttribute('aria-label', 'Slide 2 — Swipe');
    await expect(touchGesturesPage.slideIndicatorSwipe).toHaveAttribute('aria-current', 'true');
  });

  test('positive: the correct slide content is visible after the swipe (semantic locator)', async ({ page, context, touchGesturesPage }) => {
    await page.goto(URL);
    await swipeCarousel(page, context, 350);
    await expect(touchGesturesPage.carouselRegion.getByText('Slide 2 — Swipe')).toBeVisible();
  });

  test('negative: an insufficient/short swipe does not advance the slide', async ({ page, context, touchGesturesPage }) => {
    await page.goto(URL);
    await swipeCarousel(page, context, 10);
    await expect(touchGesturesPage.activeSlide).toHaveAttribute('aria-label', 'Slide 1 — Tap');
  });

  test('boundary: swiping forward from the last slide is clamped, not wrapped', async ({ page, context, touchGesturesPage }) => {
    await page.goto(URL);
    await swipeCarousel(page, context, 350); // -> Slide 2
    await swipeCarousel(page, context, 350); // -> Slide 3 (last)
    await expect(touchGesturesPage.activeSlide).toHaveAttribute('aria-label', 'Slide 3 — Pinch');
    await expect(touchGesturesPage.nextSlideButton).toBeDisabled();

    await swipeCarousel(page, context, 350); // attempt to overswipe past the last slide
    await expect(touchGesturesPage.activeSlide).toHaveAttribute('aria-label', 'Slide 3 — Pinch');
  });
});

test.describe('AC-5 — devices["iPhone 15"] context reflects touch capability', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'navigator.maxTouchPoints only reflects hasTouch emulation on Chromium — Firefox/WebKit report 0 regardless, even with hasTouch: true (verified Playwright/browser-engine limitation).',
  );

  test('positive: an iPhone 15 context reports a touch-capable maxTouchPoints', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPhone 15'] });
    const page = await context.newPage();
    await page.goto(URL);
    const maxTouchPoints = await page.evaluate(() => navigator.maxTouchPoints);
    expect(maxTouchPoints).toBeGreaterThan(0);
    await context.close();
  });
});

test.describe('AC-5a — default context contrasts as non-touch-capable', () => {
  test('negative: the default context reports maxTouchPoints of 0', async ({ page }) => {
    await page.goto(URL);
    const maxTouchPoints = await page.evaluate(() => navigator.maxTouchPoints);
    expect(maxTouchPoints).toBe(0);
  });

  test("negative: the page's own Inspect Touch Points widget reflects 0 on a default context", async ({ page, touchGesturesPage }) => {
    await page.goto(URL);
    await touchGesturesPage.inspectTouchPointsButton.click();
    await expect(touchGesturesPage.touchInfoResult).toHaveText('maxTouchPoints: 0');
  });
});

test.describe('accessibility (WCAG 2.x, axe)', () => {
  test('no violations on initial load', async ({ page }) => {
    await page.goto(URL);
    expect((await scan(page)).violations).toEqual([]);
  });

  test.describe('post-tap state', () => {
    test.use({ hasTouch: true });

    test('no violations after a tap updates the counter', async ({ page, touchGesturesPage }) => {
      await page.goto(URL);
      await touchGesturesPage.tapTargetButton.tap();
      await expect(touchGesturesPage.tapCount).toHaveText('1');
      expect((await scan(page)).violations).toEqual([]);
    });
  });

  test.describe('post-swipe state', () => {
    test.use({ hasTouch: true });
    test.skip(({ browserName }) => browserName !== 'chromium', 'Swipe simulation needs a raw CDP touch-event sequence — Chromium-only.');

    test('no violations after a swipe advances the carousel', async ({ page, context }) => {
      await page.goto(URL);
      await swipeCarousel(page, context, 350);
      expect((await scan(page)).violations).toEqual([]);
    });
  });
});

// Performance — navigates independently so timing reflects cold initial load
test.describe('performance @performance', () => {
  test('initial touch-gestures page load is within budget', async ({ page }) => {
    await page.goto(URL);
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
    });
    expect(timing.domContentLoaded).toBeLessThan(6000);
    expect(timing.load).toBeLessThan(12000);
  });

  test.describe('tap-triggered update', () => {
    test.use({ hasTouch: true });

    test('a tap-triggered counter update completes within budget', async ({ page, touchGesturesPage }) => {
      await page.goto(URL);
      const start = Date.now();
      await touchGesturesPage.tapTargetButton.tap();
      await expect(touchGesturesPage.tapCount).toHaveText('1');
      expect(Date.now() - start).toBeLessThan(1000);
    });
  });
});
