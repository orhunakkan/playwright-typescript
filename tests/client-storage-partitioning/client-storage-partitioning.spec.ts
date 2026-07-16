import { test, expect } from '../../fixtures/index';
import AxeBuilder from '@axe-core/playwright';
import { faker } from '@faker-js/faker';
import type { Page } from '@playwright/test';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-61 — Web Storage & Partitioned Cookies

const LAB_URL = '/practice/client-storage-partitioning';
const COOKIE_NAME = 'widget_partitioned';

const scan = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();

test.describe('Web Storage & Partitioned Cookies', () => {
  // AC-1 (TAB1-61): toggle the theme preference, reload with page.reload(), assert the value
  // persists via localStorage, which is scoped per browser context
  test.describe('AC-1 — theme preference persists in localStorage across a reload', () => {
    test('positive: toggling the theme survives page.reload() with the same value', async ({ page, clientStoragePartitioningPage }) => {
      await page.goto(LAB_URL);
      await clientStoragePartitioningPage.toggleThemePreferenceButton.click();
      const toggledValue = await clientStoragePartitioningPage.themePreferenceValue.textContent();

      await page.reload();

      await expect(clientStoragePartitioningPage.themePreferenceValue).toHaveText(toggledValue!);
    });

    test('boundary/AC-1a: a second browser context does not see a theme toggled in the first', async ({
      page,
      browser,
      clientStoragePartitioningPage,
    }) => {
      await page.goto(LAB_URL);
      await clientStoragePartitioningPage.toggleThemePreferenceButton.click();
      const toggledValue = await page.evaluate(() => localStorage.getItem('labTheme'));
      expect(toggledValue).not.toBeNull();

      const secondContext = await browser.newContext();
      const secondPage = await secondContext.newPage();
      await secondPage.goto(LAB_URL);
      const secondContextValue = await secondPage.evaluate(() => localStorage.getItem('labTheme'));
      expect(secondContextValue).toBeNull();

      await secondContext.close();
    });
  });

  // AC-2 (TAB1-61): write a draft note, open a second page with context.newPage(), assert the
  // draft does not appear there — sessionStorage is scoped per top-level browsing context
  test.describe('AC-2 — draft note in sessionStorage is not shared across tabs', () => {
    test('positive: a draft note written on one page is absent on a second page opened via context.newPage()', async ({
      page,
      context,
      clientStoragePartitioningPage,
    }) => {
      await page.goto(LAB_URL);
      const draftText = faker.lorem.sentence();
      await clientStoragePartitioningPage.draftNoteTextbox.fill(draftText);
      await expect(clientStoragePartitioningPage.draftNoteTextbox).toHaveValue(draftText);

      const secondPage = await context.newPage();
      await secondPage.goto(LAB_URL);

      await expect(secondPage.getByRole('textbox', { name: 'Draft note' })).toHaveValue('');
      await secondPage.close();
    });

    test('boundary/AC-2a: the draft note survives a reload of the same tab', async ({ page, clientStoragePartitioningPage }) => {
      await page.goto(LAB_URL);
      const draftText = faker.lorem.sentence();
      await clientStoragePartitioningPage.draftNoteTextbox.fill(draftText);

      await page.reload();

      await expect(clientStoragePartitioningPage.draftNoteTextbox).toHaveValue(draftText);
    });
  });

  // AC-3 (TAB1-61): context.addCookies([{ name: "widget_partitioned", ..., partitionKey }])
  // before navigation unlocks the partitioned-cookie widget
  test.describe('AC-3 — pre-navigation addCookies with partitionKey and the CHIPS partition boundary', () => {
    // Verified empirically via raw CDP (Storage.setCookies + Storage.getCookies): Chromium
    // genuinely stores the partitioned cookie — it shows up in Storage.getCookies with the exact
    // partitionKey — but a truly `Partitioned` cookie's storage key is scoped to cross-site
    // embedded contexts under that top-level site. It is never surfaced to that same site's own
    // top-level document.cookie (confirmed true even with hasCrossSiteAncestor explicitly set to
    // false), so a widget that reads `document.cookie` directly on the top-level page stays
    // locked. This is exactly the "why might a third-party embedded widget need its cookie
    // partitioned by top-level site" question the lab's own guidance poses — a partitioned cookie
    // is for third-party iframes, not the top-level page that set it.
    test('positive/Chromium: a truly partitioned cookie is never visible to its own top-level page, so the widget stays locked', async ({
      page,
      context,
      baseURL,
      clientStoragePartitioningPage,
      browserName,
    }) => {
      test.skip(browserName !== 'chromium', 'CHIPS partitioning is only enforced by Playwright on Chromium-engine browsers.');
      await context.addCookies([{ name: COOKIE_NAME, value: '1', url: `${baseURL}${LAB_URL}`, partitionKey: baseURL! }]);

      await page.goto(LAB_URL);

      await expect(clientStoragePartitioningPage.widgetStatus).toContainText('Widget locked');
    });

    // Firefox/WebKit have no CDP-backed CHIPS enforcement in Playwright, so `partitionKey` is a
    // no-op there and the cookie behaves like an ordinary first-party cookie — visible immediately.
    test('positive/non-Chromium: without CHIPS enforcement, the same cookie is visible at the top level and unlocks the widget', async ({
      page,
      context,
      baseURL,
      clientStoragePartitioningPage,
      browserName,
    }) => {
      test.skip(browserName === 'chromium', 'This contrasts with Chromium, which is covered by the previous test.');
      await context.addCookies([{ name: COOKIE_NAME, value: '1', url: `${baseURL}${LAB_URL}`, partitionKey: baseURL! }]);

      await page.goto(LAB_URL);

      await expect(clientStoragePartitioningPage.widgetStatus).toHaveText('Widget content unlocked.');
    });

    test('negative/AC-3a: pre-setting an unrelated cookie name leaves the widget locked', async ({
      page,
      context,
      baseURL,
      clientStoragePartitioningPage,
    }) => {
      await context.addCookies([{ name: 'not_the_widget_cookie', value: '1', url: `${baseURL}${LAB_URL}` }]);

      await page.goto(LAB_URL);

      await expect(clientStoragePartitioningPage.widgetStatus).toContainText('Widget locked');
    });
  });

  // AC-4 (TAB1-61): navigating without pre-setting the cookie shows the locked state; calling
  // context.addCookies() mid-test and clicking "Re-check cookie" unlocks it without a page reload
  test.describe('AC-4 — mid-test addCookies + Re-check cookie unlocks without reload', () => {
    test('positive: the widget starts locked, then unlocks after addCookies + Re-check cookie with no navigation', async ({
      page,
      context,
      baseURL,
      clientStoragePartitioningPage,
    }) => {
      await page.goto(LAB_URL);
      await expect(clientStoragePartitioningPage.widgetStatus).toContainText('Widget locked');

      await context.addCookies([{ name: COOKIE_NAME, value: '1', url: `${baseURL}${LAB_URL}` }]);
      const urlBeforeRecheck = page.url();
      await clientStoragePartitioningPage.recheckCookieButton.click();

      await expect(clientStoragePartitioningPage.widgetStatus).toHaveText('Widget content unlocked.');
      expect(page.url()).toBe(urlBeforeRecheck);
    });

    test('boundary/AC-4a: repeated Re-check clicks stay locked until the cookie actually exists', async ({
      page,
      clientStoragePartitioningPage,
    }) => {
      await page.goto(LAB_URL);
      await clientStoragePartitioningPage.recheckCookieButton.click();
      await clientStoragePartitioningPage.recheckCookieButton.click();

      await expect(clientStoragePartitioningPage.widgetStatus).toContainText('Widget locked');
    });
  });

  // AC-5 (TAB1-61): context.cookies() reads back cookies in the current context; assert
  // widget_partitioned is present with the expected value
  test.describe('AC-5 — context.cookies() read-back includes the partitioned cookie', () => {
    test('positive: context.cookies() returns widget_partitioned with the value that was set', async ({ context, baseURL }) => {
      await context.addCookies([{ name: COOKIE_NAME, value: 'unlock-token', url: `${baseURL}${LAB_URL}` }]);

      const cookies = await context.cookies();

      expect(cookies.find((c) => c.name === COOKIE_NAME)?.value).toBe('unlock-token');
    });

    test("negative/AC-5a: a fresh context's cookies() call does not include the widget cookie before it is set", async ({ context }) => {
      const cookies = await context.cookies();

      expect(cookies.find((c) => c.name === COOKIE_NAME)).toBeUndefined();
    });
  });

  // AC-6 (TAB1-61): context.clearCookies() removes the partitioned cookie without clearing
  // localStorage/sessionStorage; the correct API for clearing storage instead is
  // page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); })
  test.describe('AC-6 — clearCookies removes the cookie but leaves Web Storage untouched', () => {
    test('positive: clearCookies removes widget_partitioned while localStorage/sessionStorage values survive', async ({
      page,
      context,
      baseURL,
      clientStoragePartitioningPage,
    }) => {
      await page.goto(LAB_URL);
      await clientStoragePartitioningPage.toggleThemePreferenceButton.click();
      const draftText = faker.lorem.sentence();
      await clientStoragePartitioningPage.draftNoteTextbox.fill(draftText);
      await context.addCookies([{ name: COOKIE_NAME, value: '1', url: `${baseURL}${LAB_URL}` }]);

      await context.clearCookies();

      const cookies = await context.cookies();
      expect(cookies.find((c) => c.name === COOKIE_NAME)).toBeUndefined();

      const theme = await page.evaluate(() => localStorage.getItem('labTheme'));
      const draft = await page.evaluate(() => sessionStorage.getItem('labDraftNote'));
      expect(theme).not.toBeNull();
      expect(draft).toBe(draftText);
    });

    test('negative/AC-6a: after clearCookies, the widget re-locks on the next re-check', async ({
      page,
      context,
      baseURL,
      clientStoragePartitioningPage,
    }) => {
      await page.goto(LAB_URL);
      await context.addCookies([{ name: COOKIE_NAME, value: '1', url: `${baseURL}${LAB_URL}` }]);
      await clientStoragePartitioningPage.recheckCookieButton.click();
      await expect(clientStoragePartitioningPage.widgetStatus).toHaveText('Widget content unlocked.');

      await context.clearCookies();
      await clientStoragePartitioningPage.recheckCookieButton.click();

      await expect(clientStoragePartitioningPage.widgetStatus).toContainText('Widget locked');
    });

    // Documents the correct API for clearing storage — context.clearCookies() only ever touches
    // cookies; page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); }) is what
    // actually clears Web Storage (there is no context-level "clearStorage" API).
    test('documentation: localStorage.clear()/sessionStorage.clear() via page.evaluate is the correct storage-clearing API', async ({
      page,
      clientStoragePartitioningPage,
    }) => {
      await page.goto(LAB_URL);
      await clientStoragePartitioningPage.toggleThemePreferenceButton.click();
      await clientStoragePartitioningPage.draftNoteTextbox.fill(faker.lorem.sentence());

      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      const theme = await page.evaluate(() => localStorage.getItem('labTheme'));
      const draft = await page.evaluate(() => sessionStorage.getItem('labDraftNote'));
      expect(theme).toBeNull();
      expect(draft).toBeNull();
    });
  });

  // Accessibility — scan initial load, locked-widget, and unlocked-widget states (Phase 5)
  test.describe('accessibility (WCAG 2.x, axe)', () => {
    test('no violations on initial load (widget locked)', async ({ page }) => {
      await page.goto(LAB_URL);
      expect((await scan(page)).violations).toEqual([]);
    });

    test('no violations with the widget unlocked', async ({ page, context, baseURL, clientStoragePartitioningPage }) => {
      await context.addCookies([{ name: COOKIE_NAME, value: '1', url: `${baseURL}${LAB_URL}` }]);
      await page.goto(LAB_URL);
      await expect(clientStoragePartitioningPage.widgetStatus).toHaveText('Widget content unlocked.');

      expect((await scan(page)).violations).toEqual([]);
    });
  });
});

// Performance — navigates independently so timing reflects cold initial load, not post-setup warm load
test.describe('performance @performance', () => {
  test('initial page load is within budget', async ({ page }) => {
    await page.goto(LAB_URL);
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
    });
    expect(timing.domContentLoaded).toBeLessThan(6000);
    expect(timing.load).toBeLessThan(12000);
  });
});
