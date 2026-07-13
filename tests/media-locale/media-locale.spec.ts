import { test, expect } from '../../fixtures/index';
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-34 — Media & Locale Emulation

const URL = '/practice/media-locale';

const scan = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();

test.describe('Media & Locale Emulation', () => {
  // AC-1 / AC-2: page.emulateMedia({ colorScheme }) drives the Colour Scheme label via
  // window.matchMedia, not a React state variable — only real media emulation changes it.
  test.describe('Colour scheme emulation (AC-1, AC-2)', () => {
    const colorSchemes = [
      { scheme: 'dark' as const, expectedLabel: 'Dark' },
      { scheme: 'light' as const, expectedLabel: 'Light' },
    ];

    for (const { scheme, expectedLabel } of colorSchemes) {
      test(`positive: emulateMedia({ colorScheme: "${scheme}" }) updates the label to "${expectedLabel}"`, async ({ page, mediaLocalePage }) => {
        await page.goto(URL);
        await page.emulateMedia({ colorScheme: scheme });

        await expect(mediaLocalePage.colorSchemeLabel).toHaveText(expectedLabel);
      });
    }

    test('boundary: switching from dark back to light flips the label both ways within the same page', async ({ page, mediaLocalePage }) => {
      await page.goto(URL);

      await page.emulateMedia({ colorScheme: 'dark' });
      await expect(mediaLocalePage.colorSchemeLabel).toHaveText('Dark');

      await page.emulateMedia({ colorScheme: 'light' });
      await expect(mediaLocalePage.colorSchemeLabel).toHaveText('Light');
    });
  });

  // AC-3: page.emulateMedia({ reducedMotion }) drives the Reduced Motion label.
  test.describe('Reduced motion emulation (AC-3)', () => {
    test('positive: emulateMedia({ reducedMotion: "reduce" }) shows "Reduced" on the motion panel', async ({ page, mediaLocalePage }) => {
      await page.goto(URL);
      await page.emulateMedia({ reducedMotion: 'reduce' });

      await expect(mediaLocalePage.motionLabel).toHaveText('Reduced');
    });

    test('negative: switching to "no-preference" returns the label to "Motion on"', async ({ page, mediaLocalePage }) => {
      await page.goto(URL);

      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(mediaLocalePage.motionLabel).toHaveText('Reduced');

      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await expect(mediaLocalePage.motionLabel).toHaveText('Motion on');
    });
  });

  // AC-4: page.emulateMedia({ media: 'print' }) exercises the real @media print rules — the
  // banner does not exist in the DOM at all until matchMedia('print').matches flips true, so its
  // absence beforehand is asserted as the negative case, not just a visibility check.
  test.describe('Print media emulation (AC-4)', () => {
    test('negative: the print banner is absent under the default "screen" media', async ({ page, mediaLocalePage }) => {
      await page.goto(URL);
      await expect(mediaLocalePage.printBanner).toHaveCount(0);
    });

    test('positive: emulateMedia({ media: "print" }) reveals the print banner', async ({ page, mediaLocalePage }) => {
      await page.goto(URL);
      await page.emulateMedia({ media: 'print' });

      await expect(mediaLocalePage.printBanner).toBeVisible();
      await expect(mediaLocalePage.printBanner).toHaveText('Print layout active');
    });

    test('boundary: reverting to "screen" media removes the print banner again', async ({ page, mediaLocalePage }) => {
      await page.goto(URL);

      await page.emulateMedia({ media: 'print' });
      await expect(mediaLocalePage.printBanner).toBeVisible();

      await page.emulateMedia({ media: 'screen' });
      await expect(mediaLocalePage.printBanner).toHaveCount(0);
    });
  });

  // AC-5: a browser context created with { locale, timezoneId } drives locale-sensitive
  // date/currency formatting — asserted against both the AC-required de-DE/Europe/Berlin pairing
  // and a contrast en-US/America/New_York pairing (data-driven), so the same test also proves the
  // formatting reacts to context locale rather than being fixed to one pairing by coincidence.
  test.describe('Locale & timezone formatting (AC-5)', () => {
    const localePairings = [
      { locale: 'de-DE', timezoneId: 'Europe/Berlin', expectedDate: '21. Mai 2026', currencyContains: '€' },
      { locale: 'en-US', timezoneId: 'America/New_York', expectedDate: 'May 21, 2026', currencyContains: '€' },
    ];

    for (const { locale, timezoneId, expectedDate, currencyContains } of localePairings) {
      test.describe(`${locale} / ${timezoneId}`, () => {
        test.use({ locale, timezoneId });

        test(`positive: date renders in ${locale} format and currency shows the euro symbol`, async ({ page, mediaLocalePage }) => {
          await page.goto(URL);

          await expect(mediaLocalePage.localeDate).toHaveText(expectedDate);
          await expect(mediaLocalePage.localeCurrency).toContainText(currencyContains);
        });
      });
    }
  });

  // AC-6: locale formatting must be driven by Intl.DateTimeFormat/Intl.NumberFormat against the
  // context locale, not a hardcoded string — proven by computing the expected string in the test
  // via the same Intl APIs (dateStyle: 'long' / currency style with a fixed EUR code) and
  // confirming it matches the rendered value for two different locales, plus confirming the two
  // locales render differently from each other.
  test.describe('Locale formatting is Intl-driven, not hardcoded (AC-6)', () => {
    const CURRENCY_AMOUNT = 1234.56;

    test.describe('de-DE / Europe/Berlin', () => {
      test.use({ locale: 'de-DE', timezoneId: 'Europe/Berlin' });

      test('positive: rendered date/currency match Intl.DateTimeFormat/Intl.NumberFormat computed for de-DE', async ({ page, mediaLocalePage }) => {
        await page.goto(URL);

        const expectedDate = new Intl.DateTimeFormat('de-DE', { dateStyle: 'long' }).format(new Date(2026, 4, 21));
        const expectedCurrency = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(CURRENCY_AMOUNT);

        await expect(mediaLocalePage.localeDate).toHaveText(expectedDate);
        await expect(mediaLocalePage.localeCurrency).toHaveText(expectedCurrency);
      });
    });

    test.describe('en-US / America/New_York', () => {
      test.use({ locale: 'en-US', timezoneId: 'America/New_York' });

      test('positive: rendered date/currency match Intl.DateTimeFormat/Intl.NumberFormat computed for en-US', async ({ page, mediaLocalePage }) => {
        await page.goto(URL);

        const expectedDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(2026, 4, 21));
        const expectedCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(CURRENCY_AMOUNT);

        await expect(mediaLocalePage.localeDate).toHaveText(expectedDate);
        await expect(mediaLocalePage.localeCurrency).toHaveText(expectedCurrency);
      });
    });

    test('boundary: the two locales render the date and currency differently from each other, ruling out a hardcoded string', async ({ browser }) => {
      const deContext = await browser.newContext({ locale: 'de-DE', timezoneId: 'Europe/Berlin' });
      const dePage = await deContext.newPage();
      await dePage.goto(URL);
      const deDate = await dePage.getByTestId('locale-date').textContent();
      const deCurrency = await dePage.getByTestId('locale-currency').textContent();
      await deContext.close();

      const usContext = await browser.newContext({ locale: 'en-US', timezoneId: 'America/New_York' });
      const usPage = await usContext.newPage();
      await usPage.goto(URL);
      const usDate = await usPage.getByTestId('locale-date').textContent();
      const usCurrency = await usPage.getByTestId('locale-currency').textContent();
      await usContext.close();

      expect(deDate).not.toBe(usDate);
      expect(deCurrency).not.toBe(usCurrency);
    });
  });

  test.describe('accessibility (WCAG 2.x, axe)', () => {
    test('no violations on initial page load', async ({ page }) => {
      await page.goto(URL);
      expect((await scan(page)).violations).toEqual([]);
    });

    test('no violations under dark colour-scheme emulation', async ({ page }) => {
      await page.goto(URL);
      await page.emulateMedia({ colorScheme: 'dark' });
      expect((await scan(page)).violations).toEqual([]);
    });

    test('no violations under print media emulation', async ({ page }) => {
      await page.goto(URL);
      await page.emulateMedia({ media: 'print' });
      expect((await scan(page)).violations).toEqual([]);
    });
  });
});

// Performance — navigates independently so timing reflects cold initial load, not post-beforeEach warm load
test.describe('performance @performance', () => {
  test('initial media-locale page load is within budget', async ({ page }) => {
    await page.goto(URL);
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
    });
    expect(timing.domContentLoaded).toBeLessThan(6000);
    expect(timing.load).toBeLessThan(12000);
  });
});
