import { test, expect } from '../../fixtures/index';
import { scanWcag } from '../../utilities/accessibility';
import type { Page } from '@playwright/test';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-40 — Init Scripts & Seeding

const URL = '/practice/init-scripts';

declare global {
  interface Window {
    __FLAGS__?: { betaFeature: boolean };
  }
}

test.describe('Init Scripts & Seeding', () => {
  // AC-1 (TAB1-40): Tests use page.addInitScript to inject window.__FLAGS__ = { betaFeature: true }
  // before navigation and assert the feature flag banner is visible on the page
  test.describe('AC-1 — page.addInitScript injects window.__FLAGS__ before navigation', () => {
    test('positive: betaFeature true renders the beta feature banner', async ({ page, initScriptsPage }) => {
      await page.addInitScript(() => {
        window.__FLAGS__ = { betaFeature: true };
      });
      await page.goto(URL);
      await expect(initScriptsPage.betaFeatureBanner).toBeVisible();
      await expect(initScriptsPage.betaFeatureBanner).toContainText('Beta Feature is enabled');
      await expect(initScriptsPage.betaFeatureEmptyState).not.toBeVisible();
    });

    test('negative: no init script means no flags — banner absent, empty state shown', async ({ page, initScriptsPage }) => {
      await page.goto(URL);
      await expect(initScriptsPage.betaFeatureBanner).not.toBeVisible();
      await expect(initScriptsPage.betaFeatureEmptyState).toBeVisible();
    });

    test('boundary: betaFeature false does not render the banner — flag-driven, not always-on', async ({ page, initScriptsPage }) => {
      await page.addInitScript(() => {
        window.__FLAGS__ = { betaFeature: false };
      });
      await page.goto(URL);
      await expect(initScriptsPage.betaFeatureBanner).not.toBeVisible();
      await expect(initScriptsPage.betaFeatureEmptyState).toBeVisible();
    });
  });

  // AC-2 (TAB1-40): Tests stub Math.random via addInitScript to always return 0.42 and assert
  // the Lucky Number widget displays 42
  test.describe('AC-2 — Math.random stub via addInitScript drives the Lucky Number widget', () => {
    test('positive: stubbing Math.random to 0.42 before navigation renders 42', async ({ page, initScriptsPage }) => {
      await page.addInitScript(() => {
        Math.random = () => 0.42;
      });
      await page.goto(URL);
      await expect(initScriptsPage.luckyNumber).toHaveText('42');
    });

    test('negative: stubbing Math.random after goto does not change the already-rendered value', async ({ page, initScriptsPage }) => {
      await page.goto(URL);
      const before = await initScriptsPage.luckyNumber.innerText();
      await page.evaluate(() => {
        Math.random = () => 0.42;
      });
      await expect(initScriptsPage.luckyNumber).toHaveText(before);
    });

    test('boundary: the addInitScript stub survives a reload of the same page', async ({ page, initScriptsPage }) => {
      await page.addInitScript(() => {
        Math.random = () => 0.42;
      });
      await page.goto(URL);
      await page.reload();
      await expect(initScriptsPage.luckyNumber).toHaveText('42');
    });
  });

  // AC-3 (TAB1-40): Tests seed localStorage.setItem("onboarded", "true") via addInitScript
  // before navigation and assert the onboarding modal is not present after load
  test.describe('AC-3 — page.addInitScript seeds localStorage to suppress the onboarding modal', () => {
    test('positive: seeding onboarded=true before navigation suppresses the modal', async ({ page, initScriptsPage }) => {
      await page.addInitScript(() => {
        localStorage.setItem('onboarded', 'true');
      });
      await page.goto(URL);
      await expect(initScriptsPage.onboardingModal).not.toBeVisible();
      await expect(initScriptsPage.onboardingStatus).toContainText('Complete');
    });

    test('negative: without a seed, the onboarding modal is present on load', async ({ page, initScriptsPage }) => {
      await page.goto(URL);
      await expect(initScriptsPage.onboardingModal).toBeVisible();
      await expect(initScriptsPage.onboardingStatus).toContainText('Pending');
    });

    test('boundary: onboarded="false" does not suppress the modal — exact "true" match required', async ({ page, initScriptsPage }) => {
      await page.addInitScript(() => {
        localStorage.setItem('onboarded', 'false');
      });
      await page.goto(URL);
      await expect(initScriptsPage.onboardingModal).toBeVisible();
    });
  });

  // AC-4 (TAB1-40): Tests use context.addInitScript for the localStorage seed and confirm the
  // seed persists to a fresh page opened from the same context
  test.describe('AC-4 — context.addInitScript seed persists across pages in the same context', () => {
    test('positive: a second fresh page from the same seeded context has the modal suppressed', async ({ context }) => {
      await context.addInitScript(() => {
        localStorage.setItem('onboarded', 'true');
      });
      const firstPage = await context.newPage();
      await firstPage.goto(URL);
      const firstModal = firstPage.getByRole('dialog', { name: 'Welcome to Init Scripts!' });
      await expect(firstModal).not.toBeVisible();

      const secondPage = await context.newPage();
      await secondPage.goto(URL);
      const secondModal = secondPage.getByRole('dialog', { name: 'Welcome to Init Scripts!' });
      await expect(secondModal).not.toBeVisible();
      await expect(secondPage.getByLabel('Onboarding state')).toContainText('Complete');
    });

    test('negative: a fresh page from a different, unseeded context still shows the modal', async ({ browser }) => {
      const seededContext = await browser.newContext();
      await seededContext.addInitScript(() => {
        localStorage.setItem('onboarded', 'true');
      });
      await seededContext.close();

      const otherContext = await browser.newContext();
      const otherPage = await otherContext.newPage();
      await otherPage.goto(URL);
      await expect(otherPage.getByRole('dialog', { name: 'Welcome to Init Scripts!' })).toBeVisible();
      await otherContext.close();
    });
  });

  // AC-5 (TAB1-40): Tests verify that setting localStorage after page.goto does not suppress
  // the onboarding modal, confirming init scripts must execute before navigation
  test.describe('AC-5 — localStorage set after page.goto does not suppress the modal', () => {
    test('positive: a late (post-goto) localStorage write does not hide an already-rendered modal', async ({ page, initScriptsPage }) => {
      await page.goto(URL);
      await expect(initScriptsPage.onboardingModal).toBeVisible();
      await page.evaluate(() => localStorage.setItem('onboarded', 'true'));
      await expect(initScriptsPage.onboardingModal).toBeVisible();
    });

    test('boundary: the status widget still reads Pending despite the late write', async ({ page, initScriptsPage }) => {
      await page.goto(URL);
      // Wait for the app's own one-time mount-time read of localStorage to settle before writing
      // late — otherwise this write can race ahead of hydration and land in time to be picked up,
      // which would defeat the point of the test (proving a late write has no effect).
      await expect(initScriptsPage.onboardingStatus).toContainText('Pending');
      await page.evaluate(() => localStorage.setItem('onboarded', 'true'));
      await expect(initScriptsPage.onboardingStatus).toContainText('Pending');
    });
  });

  // Accessibility — scan initial load (modal open), seeded success (flags + stub + suppressed
  // modal all combined via addInitScript), and dismissed-via-interaction states
  test.describe('accessibility (WCAG 2.x, axe)', () => {
    test('no violations on initial load with the onboarding modal open', async ({ page }) => {
      await page.goto(URL);
      expect((await scanWcag(page)).violations).toEqual([]);
    });

    test('no violations on the fully seeded success state (flags + stub + suppressed modal)', async ({ page, initScriptsPage }) => {
      await page.addInitScript(() => {
        window.__FLAGS__ = { betaFeature: true };
        Math.random = () => 0.42;
        localStorage.setItem('onboarded', 'true');
      });
      await page.goto(URL);
      await expect(initScriptsPage.betaFeatureBanner).toBeVisible();
      await expect(initScriptsPage.onboardingModal).not.toBeVisible();
      expect((await scanWcag(page)).violations).toEqual([]);
    });

    test('no violations after dismissing the modal via user interaction', async ({ page, initScriptsPage }) => {
      await page.goto(URL);
      await initScriptsPage.onboardingDismissButton.click();
      await expect(initScriptsPage.onboardingModal).not.toBeVisible();
      expect((await scanWcag(page)).violations).toEqual([]);
    });
  });
});

// Performance — navigates independently so timing reflects cold initial load, not post-beforeEach warm load
test.describe('performance @performance', () => {
  test('initial init-scripts page load is within budget', async ({ page }) => {
    await page.goto(URL);
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
    });
    expect(timing.domContentLoaded).toBeLessThan(6000);
    expect(timing.load).toBeLessThan(12000);
  });
});
