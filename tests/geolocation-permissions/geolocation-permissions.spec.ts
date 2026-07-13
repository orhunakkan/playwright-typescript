import { test, expect } from '../../fixtures/index';
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-32 — Geolocation & Permissions

const GEO_URL = '/practice/geolocation-permissions';

const NYC_COORDS = { latitude: 40.7128, longitude: -74.006 };
const NORTH_POLE_ANTIMERIDIAN = { latitude: 90, longitude: 180 };
const EQUATOR_PRIME_MERIDIAN = { latitude: 0, longitude: 0 };

const scan = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();

test.describe('Geolocation & Permissions', () => {
  // AC-1 (TAB1-32): Tests call context.grantPermissions(["geolocation"]) and
  // context.setGeolocation({ latitude, longitude }) before clicking "Find Cafés Near Me" and
  // assert café list items appear asynchronously
  test.describe('AC-1 — grantPermissions + setGeolocation before navigation renders the café list asynchronously', () => {
    test.afterEach(async ({ context }) => {
      await context.clearPermissions();
    });

    test('positive: granted geolocation with valid coordinates renders the café list and matching coords', async ({
      page,
      context,
      geolocationPermissionsPage,
    }) => {
      await context.grantPermissions(['geolocation']);
      await context.setGeolocation(NYC_COORDS);
      await page.goto(GEO_URL);
      await geolocationPermissionsPage.findCafesButton.click();

      await expect(geolocationPermissionsPage.cafeListItems).toHaveCount(4);
      for (const item of await geolocationPermissionsPage.cafeListItems.all()) {
        await expect(item).toBeVisible();
      }
      await expect(geolocationPermissionsPage.coordsText).toContainText('40.7128');
      await expect(geolocationPermissionsPage.coordsText).toContainText('-74.0060');
    });

    test('negative: permission granted but geolocation explicitly nulled surfaces an error, not a café list', async ({
      page,
      context,
      geolocationPermissionsPage,
      browserName,
    }) => {
      // WebKit does not surface a position-unavailable error when geolocation is nulled after
      // granting permission (verified via manual diagnostic) — Chromium and Firefox both do.
      test.skip(browserName === 'webkit', 'WebKit resolves a nulled geolocation instead of erroring');

      await context.grantPermissions(['geolocation']);
      await context.setGeolocation(null);
      await page.goto(GEO_URL);
      await geolocationPermissionsPage.findCafesButton.click();

      await expect(geolocationPermissionsPage.geoErrorAlert).toBeVisible();
      await expect(geolocationPermissionsPage.cafeListItems).toHaveCount(0);
    });

    test('boundary: extreme coordinates (north pole / antimeridian) still resolve without crashing the page', async ({
      page,
      context,
      geolocationPermissionsPage,
    }) => {
      await context.grantPermissions(['geolocation']);
      await context.setGeolocation(NORTH_POLE_ANTIMERIDIAN);
      await page.goto(GEO_URL);
      await geolocationPermissionsPage.findCafesButton.click();

      await expect(geolocationPermissionsPage.coordsText).toContainText('90.0000');
      await expect(geolocationPermissionsPage.coordsText).toContainText('180.0000');
      await expect(geolocationPermissionsPage.cafeListItems.first()).toBeVisible();
    });

    test('boundary: origin coordinates (0,0 — equator/prime meridian) still resolve without crashing the page', async ({
      page,
      context,
      geolocationPermissionsPage,
    }) => {
      await context.grantPermissions(['geolocation']);
      await context.setGeolocation(EQUATOR_PRIME_MERIDIAN);
      await page.goto(GEO_URL);
      await geolocationPermissionsPage.findCafesButton.click();

      await expect(geolocationPermissionsPage.coordsText).toContainText('0.0000');
      await expect(geolocationPermissionsPage.cafeListItems.first()).toBeVisible();
    });
  });

  // AC-2 (TAB1-32): Tests run without granting geolocation permission (default blocked in
  // Playwright) and assert the role="alert" error message appears
  test.describe('AC-2 — default-blocked geolocation surfaces a role="alert" error', () => {
    // Firefox does not auto-deny an ungranted geolocation permission in Playwright — the
    // getCurrentPosition() call hangs indefinitely instead of erroring immediately, unlike
    // Chromium and WebKit (verified via manual diagnostic). Scoped to those two engines.
    test.beforeEach(({ browserName }) => {
      test.skip(browserName === 'firefox', 'Firefox does not auto-deny geolocation in Playwright — it hangs instead of erroring');
    });
    test.afterEach(async ({ context }) => {
      await context.clearPermissions();
    });

    test('positive: clicking Find Cafés Near Me without a grant shows a visible, non-empty alert', async ({
      page,
      geolocationPermissionsPage,
    }) => {
      await page.goto(GEO_URL);
      await geolocationPermissionsPage.findCafesButton.click();

      await expect(geolocationPermissionsPage.geoErrorAlert).toBeVisible();
      await expect(geolocationPermissionsPage.geoErrorAlert).not.toBeEmpty();
    });

    test('negative: the café list never renders when geolocation is blocked', async ({ page, geolocationPermissionsPage }) => {
      await page.goto(GEO_URL);
      await geolocationPermissionsPage.findCafesButton.click();

      await expect(geolocationPermissionsPage.geoErrorAlert).toBeVisible();
      await expect(geolocationPermissionsPage.cafeList).not.toBeVisible();
    });

    test('boundary: Find Cafés Near Me stays visible and enabled after the error, allowing a retry', async ({
      page,
      geolocationPermissionsPage,
    }) => {
      await page.goto(GEO_URL);
      await geolocationPermissionsPage.findCafesButton.click();

      await expect(geolocationPermissionsPage.geoErrorAlert).toBeVisible();
      await expect(geolocationPermissionsPage.findCafesButton).toBeVisible();
      await expect(geolocationPermissionsPage.findCafesButton).toBeEnabled();
    });
  });

  // AC-3 (TAB1-32): Tests grant both "clipboard-read" and "clipboard-write" permissions in a
  // single context.grantPermissions() call before the clipboard panel interaction
  test.describe('AC-3 — combined clipboard-read + clipboard-write grant enables the full clipboard flow', () => {
    test.afterEach(async ({ context }) => {
      await context.clearPermissions();
    });

    test('positive: granting both scopes in one call lets Copy then Paste complete end to end', async ({
      page,
      context,
      geolocationPermissionsPage,
      browserName,
    }) => {
      // clipboard-read/clipboard-write are Chromium-only grantable permissions in Playwright —
      // Firefox and WebKit reject them with "Unknown permission" (verified via local run).
      test.skip(browserName !== 'chromium', 'clipboard-read/clipboard-write grants are Chromium-only in Playwright');

      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await page.goto(GEO_URL);

      await geolocationPermissionsPage.copyShareLinkButton.click();
      await expect(geolocationPermissionsPage.copySuccessStatus).toBeVisible();

      await geolocationPermissionsPage.pasteButton.click();
      await expect(geolocationPermissionsPage.pastedUrlInput).toBeVisible();
    });

    test('negative: without granting clipboard-read, Paste shows the read-blocked alert instead of the URL', async ({
      page,
      context,
      geolocationPermissionsPage,
      browserName,
    }) => {
      test.skip(browserName !== 'chromium', 'clipboard-read/clipboard-write grants are Chromium-only in Playwright');

      await context.grantPermissions(['clipboard-write']);
      await page.goto(GEO_URL);

      await geolocationPermissionsPage.copyShareLinkButton.click();
      await expect(geolocationPermissionsPage.copySuccessStatus).toBeVisible();

      await geolocationPermissionsPage.pasteButton.click();
      await expect(geolocationPermissionsPage.clipboardErrorAlert).toBeVisible();
      await expect(geolocationPermissionsPage.pastedUrlInput).not.toBeVisible();
    });

    test('boundary: clipboard-write without any grant differs by engine — Chromium blocks it, Firefox/WebKit allow the user gesture', async ({
      page,
      geolocationPermissionsPage,
      browserName,
    }) => {
      await page.goto(GEO_URL);
      await geolocationPermissionsPage.copyShareLinkButton.click();

      if (browserName === 'chromium') {
        await expect(geolocationPermissionsPage.clipboardErrorAlert).toBeVisible();
        await expect(geolocationPermissionsPage.copySuccessStatus).not.toBeVisible();
      } else {
        // Firefox and WebKit allow clipboard-write via a genuine user gesture even without an
        // explicit permission grant (verified via manual diagnostic) — only Chromium requires it.
        await expect(geolocationPermissionsPage.copySuccessStatus).toBeVisible();
      }
    });
  });

  // AC-4 (TAB1-32): Tests click "Copy Share Link", assert the success status message appears,
  // click "Paste", and assert the pasted URL is visible in the read-only input
  test.describe('AC-4 — Copy Share Link success status, then Paste reveals the URL in a read-only input', () => {
    // clipboard-read/clipboard-write are Chromium-only grantable permissions in Playwright —
    // Firefox and WebKit reject them with "Unknown permission" (verified via local run).
    test.beforeEach(({ browserName }) => {
      test.skip(browserName !== 'chromium', 'clipboard-read/clipboard-write grants are Chromium-only in Playwright');
    });
    test.afterEach(async ({ context }) => {
      await context.clearPermissions();
    });

    test('positive: full copy-then-paste flow shows both success statuses and the correct pasted URL', async ({
      page,
      context,
      geolocationPermissionsPage,
    }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await page.goto(GEO_URL);

      await geolocationPermissionsPage.copyShareLinkButton.click();
      await expect(geolocationPermissionsPage.copySuccessStatus).toBeVisible();

      await geolocationPermissionsPage.pasteButton.click();
      await expect(geolocationPermissionsPage.pasteSuccessStatus).toBeVisible();
      await expect(geolocationPermissionsPage.pastedUrlInput).toHaveValue(page.url());
    });

    test('negative: the pasted URL input is not present before Paste is clicked', async ({
      page,
      context,
      geolocationPermissionsPage,
    }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await page.goto(GEO_URL);

      await expect(geolocationPermissionsPage.pastedUrlInput).not.toBeVisible();
      await geolocationPermissionsPage.copyShareLinkButton.click();
      await expect(geolocationPermissionsPage.pastedUrlInput).not.toBeVisible();
    });

    test('boundary: the pasted URL input is read-only and cannot be edited by the user', async ({
      page,
      context,
      geolocationPermissionsPage,
    }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await page.goto(GEO_URL);

      await geolocationPermissionsPage.copyShareLinkButton.click();
      await geolocationPermissionsPage.pasteButton.click();

      await expect(geolocationPermissionsPage.pastedUrlInput).toHaveAttribute('readonly', '');
    });
  });

  // AC-5 (TAB1-32): Tests call context.clearPermissions() after each permission-sensitive test
  // to prevent grants leaking into subsequent tests
  test.describe.serial('AC-5 — clearPermissions() prevents a grant from leaking into the next test', () => {
    test('positive: a granted+resolved geolocation call clears cleanly and does not leak into the next test', async ({
      page,
      context,
      geolocationPermissionsPage,
    }) => {
      await context.grantPermissions(['geolocation']);
      await context.setGeolocation(NYC_COORDS);
      await page.goto(GEO_URL);
      await geolocationPermissionsPage.findCafesButton.click();
      await expect(geolocationPermissionsPage.cafeListItems).toHaveCount(4);

      await context.clearPermissions();
    });

    test('negative: the same context, reused without re-granting, is blocked again after clearPermissions()', async ({
      page,
      context,
      geolocationPermissionsPage,
      browserName,
    }) => {
      test.skip(browserName === 'firefox', 'Firefox does not auto-deny geolocation in Playwright — it hangs instead of erroring');

      await page.goto(GEO_URL);
      await geolocationPermissionsPage.findCafesButton.click();

      await expect(geolocationPermissionsPage.geoErrorAlert).toBeVisible();
      await expect(geolocationPermissionsPage.cafeListItems).toHaveCount(0);

      await context.clearPermissions();
    });
  });

  // Accessibility — load state, geolocation-blocked error state, geolocation-success state,
  // and clipboard-success state (Gap #3: axe multi-state)
  test.describe('accessibility (WCAG 2.x, axe)', () => {
    test.afterEach(async ({ context }) => {
      await context.clearPermissions();
    });

    test('no violations on initial page load', async ({ page }) => {
      await page.goto(GEO_URL);
      expect((await scan(page)).violations).toEqual([]);
    });

    test('no violations on the geolocation-blocked error state', async ({ page, geolocationPermissionsPage, browserName }) => {
      test.skip(browserName === 'firefox', 'Firefox does not auto-deny geolocation in Playwright — it hangs instead of erroring');

      await page.goto(GEO_URL);
      await geolocationPermissionsPage.findCafesButton.click();
      await expect(geolocationPermissionsPage.geoErrorAlert).toBeVisible();
      expect((await scan(page)).violations).toEqual([]);
    });

    test('no violations on the geolocation-success café list state', async ({ page, context, geolocationPermissionsPage }) => {
      await context.grantPermissions(['geolocation']);
      await context.setGeolocation(NYC_COORDS);
      await page.goto(GEO_URL);
      await geolocationPermissionsPage.findCafesButton.click();
      await expect(geolocationPermissionsPage.cafeListItems).toHaveCount(4);
      expect((await scan(page)).violations).toEqual([]);
    });

    test('no violations on the clipboard copy+paste success state', async ({
      page,
      context,
      geolocationPermissionsPage,
      browserName,
    }) => {
      test.skip(browserName !== 'chromium', 'clipboard-read/clipboard-write grants are Chromium-only in Playwright');

      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await page.goto(GEO_URL);
      await geolocationPermissionsPage.copyShareLinkButton.click();
      await expect(geolocationPermissionsPage.copySuccessStatus).toBeVisible();
      await geolocationPermissionsPage.pasteButton.click();
      await expect(geolocationPermissionsPage.pastedUrlInput).toBeVisible();
      expect((await scan(page)).violations).toEqual([]);
    });
  });
});

// Performance — navigates independently so timing reflects cold initial load, not post-beforeEach warm load
test.describe('performance @performance', () => {
  test('initial geolocation-permissions page load is within budget', async ({ page }) => {
    await page.goto(GEO_URL);
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
    });
    expect(timing.domContentLoaded).toBeLessThan(6000);
    expect(timing.load).toBeLessThan(12000);
  });
});
