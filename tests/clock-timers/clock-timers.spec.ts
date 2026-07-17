import { test, expect } from '../../fixtures/index';
import { scanWcag } from '../../utilities/accessibility';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-25 — Clock & Timers

const URL = '/practice/clock-timers';

// Mid-day UTC avoids the fixed instant landing on a different calendar date than intended
// on runners whose local timezone differs from the CI runner's.
const FIXED_DATE = new Date(Date.UTC(2026, 2, 15, 12, 0, 0));
// Day-boundary instant (23:59:59 local-equivalent for this fixed date) — verifies the app
// doesn't roll over to the next calendar date due to a UTC/local Date mismatch.
const BOUNDARY_DATE = new Date(Date.UTC(2026, 10, 3, 23, 59, 59));

test.describe('Clock & Timers', () => {
  // AC-1 (TAB1-25): Tests install the fake clock with page.clock.install() before navigation
  // and advance it programmatically with clock.tick()
  test.describe('AC-1 — page.clock.install() before navigation; clock.tick() advances time', () => {
    test('positive: clock installed before navigation allows deterministic tick() advancement', async ({ page, clockTimersPage }) => {
      await clockTimersPage.installAndGoto();
      await clockTimersPage.countdownStartButton.click();
      await page.clock.runFor(10_000);
      await expect(clockTimersPage.countdownDisplay).toHaveText('00:50');
    });

    test('boundary: tick(0) leaves the countdown display unchanged', async ({ page, clockTimersPage }) => {
      await clockTimersPage.installAndGoto();
      await clockTimersPage.countdownStartButton.click();
      await page.clock.runFor(0);
      await expect(clockTimersPage.countdownDisplay).toHaveText('01:00');
    });
  });

  // AC-2 (TAB1-25): Tests start the 60 s countdown timer, advance the clock with
  // clock.tick(60_000), and assert the "Time's up!" message appears without any real waiting
  test.describe('AC-2 — 60s countdown expiry via clock.tick(60_000)', () => {
    test('positive: tick(60_000) shows "Time\'s up!" with no real waiting', async ({ page, clockTimersPage }) => {
      await clockTimersPage.installAndGoto();
      await clockTimersPage.countdownStartButton.click();
      await page.clock.runFor(60_000);
      await expect(clockTimersPage.timesUpMessage).toBeVisible();
    });

    test('negative: "Time\'s up!" is absent before the countdown completes', async ({ page, clockTimersPage }) => {
      await clockTimersPage.installAndGoto();
      await clockTimersPage.countdownStartButton.click();
      await expect(clockTimersPage.timesUpMessage).not.toBeVisible();
    });

    test('boundary: at 59_900ms elapsed (still 1s remaining), "Time\'s up!" has not appeared yet', async ({ page, clockTimersPage }) => {
      await clockTimersPage.installAndGoto();
      await clockTimersPage.countdownStartButton.click();
      await page.clock.runFor(59_900);
      await expect(clockTimersPage.countdownDisplay).toHaveText('00:01');
      await expect(clockTimersPage.timesUpMessage).not.toBeVisible();
    });
  });

  // AC-3 (TAB1-25): Tests start a session and advance the clock by 5 s using clock.tick(5000)
  // to trigger the session expiry toast, asserting it appears with the correct countdown
  test.describe('AC-3 — session expiry toast via clock.tick(5000)', () => {
    test('positive: tick(5000) shows the expiry toast with the correct countdown', async ({ page, clockTimersPage }) => {
      await clockTimersPage.installAndGoto();
      await clockTimersPage.startSessionButton.click();
      await page.clock.runFor(5000);
      await expect(clockTimersPage.expiryToast).toBeVisible();
      // Toast's displayed countdown starts at 4s, not 5s, at the moment the 5s threshold is crossed
      await expect(clockTimersPage.expiryCountdown).toHaveText('4s');
    });

    test('negative: expiry toast is absent before the 5s threshold', async ({ page, clockTimersPage }) => {
      await clockTimersPage.installAndGoto();
      await clockTimersPage.startSessionButton.click();
      await expect(clockTimersPage.expiryToast).not.toBeVisible();
    });

    test('boundary: at 4_999ms elapsed, the toast has not yet appeared', async ({ page, clockTimersPage }) => {
      await clockTimersPage.installAndGoto();
      await clockTimersPage.startSessionButton.click();
      await page.clock.runFor(4_999);
      await expect(clockTimersPage.expiryToast).not.toBeVisible();
    });
  });

  // AC-4 (TAB1-25): Tests use clock.fastForward(30_000) to trigger one auto-refresh polling
  // cycle and assert the "Refresh #" counter increments
  test.describe('AC-4 — auto-refresh polling via clock.fastForward(30_000)', () => {
    test('positive: fastForward(30_000) triggers exactly one refresh cycle', async ({ page, clockTimersPage }) => {
      await clockTimersPage.installAndGoto();
      await expect(clockTimersPage.refreshCount).toHaveText('Refresh #0');
      await page.clock.fastForward(30_000);
      await expect(clockTimersPage.refreshCount).toHaveText('Refresh #1');
    });

    test('boundary: fast-forwarding less than the poll interval does not increment the counter', async ({ page, clockTimersPage }) => {
      await clockTimersPage.installAndGoto();
      await page.clock.fastForward(29_999);
      await expect(clockTimersPage.refreshCount).toHaveText('Refresh #0');
    });

    test('boundary: fast-forwarding exactly one interval increments by exactly 1', async ({ page, clockTimersPage }) => {
      await clockTimersPage.installAndGoto();
      // Let the polling interval register before advancing the clock
      await expect(clockTimersPage.refreshCount).toHaveText('Refresh #0');
      await page.clock.fastForward(30_000);
      await expect(clockTimersPage.refreshCount).toHaveText('Refresh #1');
    });
  });

  // AC-5 (TAB1-25): Tests advance the clock in small increments and assert intermediate
  // countdown values at each step to verify the UI updates correctly at every tick
  test.describe('AC-5 — intermediate countdown values update at every tick', () => {
    const steps = [
      { tickMs: 10_000, expected: '00:50' },
      { tickMs: 10_000, expected: '00:40' },
      { tickMs: 10_000, expected: '00:30' },
      { tickMs: 10_000, expected: '00:20' },
      { tickMs: 10_000, expected: '00:10' },
      { tickMs: 10_000, expected: '00:00' },
    ];

    test('positive: countdown reflects the correct remaining time at each intermediate tick', async ({ page, clockTimersPage }) => {
      await clockTimersPage.installAndGoto();
      await clockTimersPage.countdownStartButton.click();
      for (const { tickMs, expected } of steps) {
        await page.clock.runFor(tickMs);
        await expect(clockTimersPage.countdownDisplay).toHaveText(expected);
      }
    });
  });

  // AC-6 (TAB1-25): Tests use clock.setFixedTime(date) before navigation to pin "today" to a
  // known date and assert the date display component shows exactly that date
  test.describe('AC-6 — clock.setFixedTime(date) pins "today" before navigation', () => {
    test('positive: setFixedTime(date) before navigation pins the date display to that date', async ({ page, clockTimersPage }) => {
      await page.clock.setFixedTime(FIXED_DATE);
      await page.goto(URL);
      await expect(clockTimersPage.currentDate).toHaveText(clockTimersPage.expectedDateText(FIXED_DATE));
    });

    test('boundary: a day-boundary fixed time (23:59:59) still renders the correct calendar date', async ({ page, clockTimersPage }) => {
      await page.clock.setFixedTime(BOUNDARY_DATE);
      await page.goto(URL);
      await expect(clockTimersPage.currentDate).toHaveText(clockTimersPage.expectedDateText(BOUNDARY_DATE));
    });
  });

  // Accessibility — scan initial, countdown-active, expired, and refreshed states
  test.describe('accessibility (WCAG 2.x, axe)', () => {
    test('no violations on initial page load', async ({ page }) => {
      await page.goto(URL);
      expect((await scanWcag(page)).violations).toEqual([]);
    });

    test('no violations while the countdown is active', async ({ page, clockTimersPage }) => {
      await clockTimersPage.installAndGoto();
      await clockTimersPage.countdownStartButton.click();
      await page.clock.runFor(10_000);
      expect((await scanWcag(page)).violations).toEqual([]);
    });

    test('no violations on the expired ("Time\'s up!") state', async ({ page, clockTimersPage }) => {
      await clockTimersPage.installAndGoto();
      await clockTimersPage.countdownStartButton.click();
      await page.clock.runFor(60_000);
      await expect(clockTimersPage.timesUpMessage).toBeVisible();
      expect((await scanWcag(page)).violations).toEqual([]);
    });

    test('no violations after an auto-refresh cycle', async ({ page, clockTimersPage }) => {
      await clockTimersPage.installAndGoto();
      await expect(clockTimersPage.refreshCount).toHaveText('Refresh #0');
      await page.clock.fastForward(30_000);
      await expect(clockTimersPage.refreshCount).toHaveText('Refresh #1');
      expect((await scanWcag(page)).violations).toEqual([]);
    });
  });
});

// Performance — navigates independently so timing reflects cold initial load, not post-beforeEach warm load
test.describe('performance @performance', () => {
  test('initial clock-timers page load is within budget', async ({ page }) => {
    await page.goto(URL);
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
    });
    expect(timing.domContentLoaded).toBeLessThan(6000);
    expect(timing.load).toBeLessThan(12000);
  });
});
