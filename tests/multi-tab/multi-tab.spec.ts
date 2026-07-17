import { test, expect } from '../../fixtures/index';
import { scanWcag } from '../../utilities/accessibility';
import type { Page } from '@playwright/test';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-31 — Multi-Tab

const LAB_URL = '/practice/multi-tab';

test.describe('Multi-Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LAB_URL);
  });

  // AC-5: every test closes its extra pages here so no state leaks into the next test in the
  // same context. Individual tests may already close pages they opened — this filter is a no-op
  // for pages already closed — but this hook is the enforcement point, asserted for every test.
  test.afterEach(async ({ page, context }) => {
    const extraPages = context.pages().filter((p) => p !== page && !p.isClosed());
    await Promise.all(extraPages.map((p) => p.close()));
    expect(context.pages()).toHaveLength(1);
  });

  // AC-1 (TAB1-31): context.waitForEvent("page") is registered together with the triggering
  // click via Promise.all — registering it before the click (not after) is what guarantees the
  // event is never missed, since the new tab can open before an awaited-then-registered listener
  // would attach.
  test.describe('AC-1 & AC-2 — capture, interact with, and close the new tab', () => {
    test('positive: waitForEvent("page") set up before the click captures the new tab; heading is asserted', async ({ multiTabPage, context }) => {
      const [newTab] = await Promise.all([context.waitForEvent('page'), multiTabPage.openNewTabButton.click()]);
      await newTab.waitForLoadState();

      // AC-1-B: exact heading text, not just visibility
      await expect(multiTabPage.newTabHeading(newTab)).toHaveText('Dashboard (New Tab)');

      await newTab.close();
    });

    test('positive: interacting with the new tab updates its own counter independently', async ({ multiTabPage, context }) => {
      const [newTab] = await Promise.all([context.waitForEvent('page'), multiTabPage.openNewTabButton.click()]);
      await newTab.waitForLoadState();

      await expect(multiTabPage.newTabCounter(newTab)).toHaveText('0');
      await multiTabPage.newTabIncrementButton(newTab).click();
      await expect(multiTabPage.newTabCounter(newTab)).toHaveText('1');

      await newTab.close();
    });

    test('boundary/AC-2: after closing the new tab, context.pages() returns exactly the original page', async ({ multiTabPage, page, context }) => {
      const [newTab] = await Promise.all([context.waitForEvent('page'), multiTabPage.openNewTabButton.click()]);
      await newTab.waitForLoadState();
      await expect(multiTabPage.newTabHeading(newTab)).toBeVisible();

      await newTab.close();

      const pages = context.pages();
      expect(pages).toHaveLength(1);
      expect(pages[0]).toBe(page);
    });
  });

  // AC-3 (TAB1-31): page.waitForEvent("popup") is a distinct event from context's "page" event —
  // fired on the opener page, not the context, and specifically for window.open()-style popups.
  test.describe('AC-3 — popup window captured via page.waitForEvent("popup")', () => {
    test('positive: popup event captures the popup; content inside the popup is asserted', async ({ multiTabPage, page }) => {
      const [popup] = await Promise.all([page.waitForEvent('popup'), multiTabPage.openPopupButton.click()]);
      await popup.waitForLoadState();

      await expect(multiTabPage.popupHeading(popup)).toHaveText('Popup Window');
      await expect(multiTabPage.popupValueInput(popup)).toHaveValue('Hello from popup');

      await popup.close();
    });

    test('boundary: the popup page object is distinct from a new tab opened via the context "page" event', async ({
      multiTabPage,
      page,
      context,
    }) => {
      const [newTab] = await Promise.all([context.waitForEvent('page'), multiTabPage.openNewTabButton.click()]);
      await newTab.waitForLoadState();

      const [popup] = await Promise.all([page.waitForEvent('popup'), multiTabPage.openPopupButton.click()]);
      await popup.waitForLoadState();

      expect(popup).not.toBe(newTab);
      expect(context.pages()).toHaveLength(3);

      // Deliberately left open for the AC-5 afterEach hook to close, proving it handles
      // multiple simultaneous extra pages.
    });
  });

  // AC-4 (TAB1-31): localStorage under key "multi-tab:shared" is written in a new tab and read
  // back from the main page after switching focus (via a reload of the main page).
  test.describe('AC-4 — cross-tab localStorage (multi-tab:shared)', () => {
    test('negative: the shared value is absent on the main page before any tab writes it', async ({ multiTabPage }) => {
      await expect(multiTabPage.sharedStorageValue).toHaveText('(none)');
    });

    test('positive/boundary: a write in the new tab is readable on the main page after switching back', async ({ multiTabPage, context }) => {
      const [newTab] = await Promise.all([context.waitForEvent('page'), multiTabPage.openNewTabButton.click()]);
      await newTab.waitForLoadState();

      await multiTabPage.newTabWriteStorageButton(newTab).click();
      const writtenValue = await newTab.evaluate(() => localStorage.getItem('multi-tab:shared'));
      expect(writtenValue).toMatch(/^written-from-tab-\d+$/);

      await newTab.close();

      // Exact key/value round-trip, not a stale or partial value
      await multiTabPage.reloadStorageButton.click();
      await expect(multiTabPage.sharedStorageValue).toHaveText(writtenValue!);
    });
  });

  test.describe('accessibility (WCAG 2.x, axe)', () => {
    test('no violations at initial load', async ({ page }) => {
      expect((await scanWcag(page)).violations).toEqual([]);
    });
  });
});

// Performance — the new-tab-open-and-read flow must complete within budget
test.describe('performance @performance', () => {
  test('opening a new tab, capturing it, and reading its heading completes within budget', async ({ multiTabPage, page, context }) => {
    await page.goto(LAB_URL);
    const start = Date.now();

    const [newTab] = await Promise.all([context.waitForEvent('page'), multiTabPage.openNewTabButton.click()]);
    await newTab.waitForLoadState();
    await expect(multiTabPage.newTabHeading(newTab)).toBeVisible();

    expect(Date.now() - start).toBeLessThan(5000);
    await newTab.close();
  });
});
