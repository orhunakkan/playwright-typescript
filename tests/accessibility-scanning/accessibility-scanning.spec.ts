import { test, expect } from '../../fixtures/index';
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-35 — Accessibility Scanning

const URL = '/practice/accessibility-scanning';

const scan = (page: Page) => new AxeBuilder({ page }).analyze();
const scanFormRegion = (page: Page) => new AxeBuilder({ page }).include('#form-region').analyze();
const scanWcag2Tags = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
const scanChrome = (page: Page) => new AxeBuilder({ page }).exclude('#form-region').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();

// The broken (default) state injects two known, real axe violations, both inside #form-region:
// a decorative <img> with no alt attribute (rule: image-alt), and a Submit button whose text
// fails the WCAG 2 AA contrast ratio (rule: color-contrast). The name input's placeholder-only
// "label" does NOT trigger axe's `label` rule — axe accepts a placeholder as a valid accessible
// name for that check, even though it's still poor UX. Toggling "Show accessible controls" swaps
// in a fully alt-tagged, high-contrast version of the same elements.
const KNOWN_BROKEN_VIOLATION_IDS = ['image-alt', 'color-contrast'];

test.describe('Accessibility Scanning', () => {
  // AC-1: AxeBuilder({ page }).analyze() on the broken form state reports at least one violation.
  test.describe('Broken-state scan reports violations (AC-1)', () => {
    test('positive: results.violations.length is greater than 0 on the default (broken) state', async ({ page }) => {
      await page.goto(URL);
      // axe's color-contrast/image-alt checks are flaky against a pre-hydration DOM snapshot —
      // waiting for network idle before scanning is what makes the violation set deterministic.
      await page.waitForLoadState('networkidle');

      const results = await scan(page);

      expect(results.violations.length).toBeGreaterThan(0);
    });

    test('data-driven: each known broken-state rule id is present among the reported violations', async ({ page }) => {
      await page.goto(URL);
      // axe's color-contrast/image-alt checks are flaky against a pre-hydration DOM snapshot —
      // waiting for network idle before scanning is what makes the violation set deterministic.
      await page.waitForLoadState('networkidle');

      const results = await scan(page);
      const reportedIds = results.violations.map((v) => v.id);

      for (const id of KNOWN_BROKEN_VIOLATION_IDS) {
        expect(reportedIds).toContain(id);
      }
    });
  });

  // AC-2: each violation entry's id/impact/nodes are logged to produce a diagnosable failure message.
  test.describe('Violations are logged with id, impact, and nodes for diagnosis (AC-2)', () => {
    test('positive: every reported violation exposes id, impact, and a non-empty nodes array', async ({ page }) => {
      await page.goto(URL);
      // axe's color-contrast/image-alt checks are flaky against a pre-hydration DOM snapshot —
      // waiting for network idle before scanning is what makes the violation set deterministic.
      await page.waitForLoadState('networkidle');

      const results = await scan(page);
      expect(results.violations.length).toBeGreaterThan(0);

      for (const violation of results.violations) {
        console.log(`[axe] ${violation.id} (impact: ${violation.impact}) — ${violation.nodes.length} node(s)`);
        console.log(`  targets: ${violation.nodes.map((n) => n.target.join(' ')).join(', ')}`);

        expect(violation.id).toBeTruthy();
        expect(violation.impact).toBeTruthy();
        expect(violation.nodes.length).toBeGreaterThan(0);
      }
    });
  });

  // AC-3: toggling to the accessible state and re-scanning reports zero violations.
  test.describe('Accessible-state scan reports zero violations (AC-3)', () => {
    test('positive: results.violations is an empty array after toggling "Show accessible controls"', async ({ page, accessibilityScanningPage }) => {
      await page.goto(URL);
      // axe's color-contrast/image-alt checks are flaky against a pre-hydration DOM snapshot —
      // waiting for network idle before scanning is what makes the violation set deterministic.
      await page.waitForLoadState('networkidle');
      await accessibilityScanningPage.accessibleControlsCheckbox.check();
      await expect(accessibilityScanningPage.violationStatusBadge).toHaveText('Accessible');

      const results = await scan(page);

      expect(results.violations).toEqual([]);
    });

    test('boundary: toggling back to the broken state reproduces violations, proving the state is reversible not a one-way reset', async ({
      page,
      accessibilityScanningPage,
    }) => {
      await page.goto(URL);
      // axe's color-contrast/image-alt checks are flaky against a pre-hydration DOM snapshot —
      // waiting for network idle before scanning is what makes the violation set deterministic.
      await page.waitForLoadState('networkidle');

      await accessibilityScanningPage.accessibleControlsCheckbox.check();
      await expect(accessibilityScanningPage.violationStatusBadge).toHaveText('Accessible');
      expect((await scan(page)).violations).toEqual([]);

      await accessibilityScanningPage.accessibleControlsCheckbox.uncheck();
      await expect(accessibilityScanningPage.violationStatusBadge).toHaveText('Has violations');
      expect((await scan(page)).violations.length).toBeGreaterThan(0);
    });
  });

  // AC-4: .include("#form-region") scopes the scan to only the Settings Form section.
  test.describe('Scan scoped to #form-region via .include() (AC-4)', () => {
    test('positive: scoped scan on the broken state reports exactly the violations that live inside #form-region', async ({ page }) => {
      await page.goto(URL);
      // axe's color-contrast/image-alt checks are flaky against a pre-hydration DOM snapshot —
      // waiting for network idle before scanning is what makes the violation set deterministic.
      await page.waitForLoadState('networkidle');

      const results = await scanFormRegion(page);
      const reportedIds = results.violations.map((v) => v.id).sort();

      expect(reportedIds).toEqual([...KNOWN_BROKEN_VIOLATION_IDS].sort());
    });

    test('negative: scoped scan on the accessible state reports zero violations, matching the full-page scan', async ({
      page,
      accessibilityScanningPage,
    }) => {
      await page.goto(URL);
      // axe's color-contrast/image-alt checks are flaky against a pre-hydration DOM snapshot —
      // waiting for network idle before scanning is what makes the violation set deterministic.
      await page.waitForLoadState('networkidle');
      await accessibilityScanningPage.accessibleControlsCheckbox.check();
      await expect(accessibilityScanningPage.violationStatusBadge).toHaveText('Accessible');

      const results = await scanFormRegion(page);

      expect(results.violations).toEqual([]);
    });
  });

  // AC-5: .withTags(["wcag2a", "wcag2aa"]) filters the scan to WCAG 2.x rules only.
  test.describe('Scan filtered to WCAG 2.x tags via .withTags() (AC-5)', () => {
    test('positive: every reported violation carries at least one of the wcag2a/wcag2aa tags', async ({ page }) => {
      await page.goto(URL);
      // axe's color-contrast/image-alt checks are flaky against a pre-hydration DOM snapshot —
      // waiting for network idle before scanning is what makes the violation set deterministic.
      await page.waitForLoadState('networkidle');

      const results = await scanWcag2Tags(page);

      expect(results.violations.length).toBeGreaterThan(0);
      for (const violation of results.violations) {
        expect(violation.tags.some((tag) => tag === 'wcag2a' || tag === 'wcag2aa')).toBe(true);
      }
    });

    test('boundary: an unmatched tag filter reports zero violations even though the page is broken', async ({ page }) => {
      await page.goto(URL);
      // axe's color-contrast/image-alt checks are flaky against a pre-hydration DOM snapshot —
      // waiting for network idle before scanning is what makes the violation set deterministic.
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page }).withTags(['nonexistent-tag']).analyze();

      expect(results.violations).toEqual([]);
    });
  });

  test.describe('accessibility (WCAG 2.x, axe) — page chrome, excluding the intentionally broken form', () => {
    test('no violations on initial load outside #form-region', async ({ page }) => {
      await page.goto(URL);
      // axe's color-contrast/image-alt checks are flaky against a pre-hydration DOM snapshot —
      // waiting for network idle before scanning is what makes the violation set deterministic.
      await page.waitForLoadState('networkidle');
      expect((await scanChrome(page)).violations).toEqual([]);
    });

    test('no violations with accessible controls toggled on, outside #form-region', async ({ page, accessibilityScanningPage }) => {
      await page.goto(URL);
      // axe's color-contrast/image-alt checks are flaky against a pre-hydration DOM snapshot —
      // waiting for network idle before scanning is what makes the violation set deterministic.
      await page.waitForLoadState('networkidle');
      await accessibilityScanningPage.accessibleControlsCheckbox.check();
      expect((await scanChrome(page)).violations).toEqual([]);
    });
  });
});

// Performance — navigates independently so timing reflects cold initial load, not post-beforeEach warm load
test.describe('performance @performance', () => {
  test('initial accessibility-scanning page load is within budget', async ({ page }) => {
    await page.goto(URL);
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
    });
    expect(timing.domContentLoaded).toBeLessThan(6000);
    expect(timing.load).toBeLessThan(12000);
  });
});
