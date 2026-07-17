import { test, expect } from '../../fixtures/index';
import { scanWcag } from '../../utilities/accessibility';
import type { Page } from '@playwright/test';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-20 — Frames & Contexts

const LAB_URL = '/practice/frames-contexts';

test.describe('Frames & Contexts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LAB_URL);
  });

  // AC-1 (TAB1-20): page.frameLocator('iframe[title="Counter frame"]') scopes every subsequent
  // locator call inside the counter iframe; a page-level locator cannot reach the same element.
  //
  // ⚠️ Known defect: the counter iframe's src is a data: URI. The site's CSP (default-src 'self',
  // no frame-src override) blocks framing of data: content in every browser — confirmed via a live
  // CSP console violation and the frame rendering "This content is blocked." Tests below are
  // written correctly per the AC; they are expected to fail against this defect until it is fixed.
  test.describe('AC-1 — frameLocator scopes into the counter iframe', () => {
    test('positive: frameLocator resolves the counter value inside the frame', async ({ framesContextsPage }) => {
      await expect(framesContextsPage.counterValue).toHaveText('0');
    });

    test('negative/AC-1a: a page-level locator does not find the counter value element', async ({ page }) => {
      await expect(page.getByRole('status', { name: 'Counter value' })).toHaveCount(0);
    });
  });

  // AC-2 (TAB1-20): clicking the increment button inside the frame multiple times, including with
  // a custom step size, updates the displayed count to the expected value.
  test.describe('AC-2 — incrementing the counter inside the frame', () => {
    test('positive: clicking increment 3 times raises the count from 0 to 3', async ({ framesContextsPage }) => {
      await framesContextsPage.incrementButton.click();
      await framesContextsPage.incrementButton.click();
      await framesContextsPage.incrementButton.click();

      await expect(framesContextsPage.counterValue).toHaveText('3');
    });

    test('boundary/AC-2a: changing the step size to 5 then incrementing once raises the count by exactly 5', async ({ framesContextsPage }) => {
      await framesContextsPage.stepInput.fill('5');
      await framesContextsPage.incrementButton.click();

      await expect(framesContextsPage.counterValue).toHaveText('5');
    });

    test('negative/AC-2b: clicking decrement below 0 produces a negative count (no floor clamp)', async ({ framesContextsPage }) => {
      await framesContextsPage.decrementButton.click();

      await expect(framesContextsPage.counterValue).toHaveText('-1');
    });
  });

  // AC-3 (TAB1-20): the Challenge 2 login form is filled and submitted using frame-scoped
  // locators; getByLabel alone (without frameLocator scoping) would not reach these fields.
  test.describe('AC-3 — filling and submitting the login form inside the iframe', () => {
    test.beforeEach(async ({ framesContextsPage }) => {
      await framesContextsPage.challenge2Tab.click();
    });

    test('positive: valid credentials show the signed-in message', async ({ framesContextsPage }) => {
      await framesContextsPage.usernameInput.fill('jane.doe');
      await framesContextsPage.passwordInput.fill('correct-horse-battery-staple');
      await framesContextsPage.signInButton.click();

      await expect(framesContextsPage.loginMessage).toHaveText('Signed in as jane.doe');
    });

    test('negative/AC-3a: an empty username shows the "Username required" message', async ({ framesContextsPage }) => {
      await framesContextsPage.passwordInput.fill('correct-horse-battery-staple');
      await framesContextsPage.signInButton.click();

      await expect(framesContextsPage.loginMessage).toHaveText('Username required');
    });
  });

  // AC-4 (TAB1-20): a second BrowserContext does not share cookies or localStorage with the first.
  test.describe('AC-4 — a second browser context does not share cookies or localStorage', () => {
    test('positive: a second context does not see a localStorage value written in the first', async ({ page, browser }) => {
      await page.evaluate(() => localStorage.setItem('frames-contexts:marker', 'context-A-value'));
      const writtenInFirst = await page.evaluate(() => localStorage.getItem('frames-contexts:marker'));
      expect(writtenInFirst).toBe('context-A-value');

      const secondContext = await browser.newContext();
      const secondPage = await secondContext.newPage();
      await secondPage.goto(LAB_URL);
      const readInSecond = await secondPage.evaluate(() => localStorage.getItem('frames-contexts:marker'));
      expect(readInSecond).toBeNull();

      await secondContext.close();
    });

    test('boundary/AC-4a: a cookie set in the first context is confirmed present there and absent in the second', async ({
      page,
      browser,
      context,
    }) => {
      const url = page.url();
      await context.addCookies([{ name: 'frames-contexts-marker', value: 'context-A-cookie', url }]);

      const cookiesInFirst = await context.cookies();
      expect(cookiesInFirst.some((c) => c.name === 'frames-contexts-marker' && c.value === 'context-A-cookie')).toBe(true);

      const secondContext = await browser.newContext();
      const cookiesInSecond = await secondContext.cookies(url);
      expect(cookiesInSecond.find((c) => c.name === 'frames-contexts-marker')).toBeUndefined();

      await secondContext.close();
    });
  });

  // AC-5 (TAB1-20): the suite structurally separates iframe-scoping (AC-1/AC-2/AC-3 above) from
  // context isolation (AC-4 above); this describe block makes the conceptual distinction explicit —
  // an iframe is a child frame within the same page/context, while a BrowserContext is a fully
  // separate object with its own pages, storage, and cookies.
  test.describe('AC-5 — an iframe is a child frame in the same context; a second BrowserContext is not', () => {
    test('positive: the counter iframe is a child frame within the same page and context, not an isolated context', async ({
      page,
      framesContextsPage,
      context,
    }) => {
      await expect(framesContextsPage.counterFrameElement).toBeAttached();

      const frames = page.frames();
      expect(frames.length).toBeGreaterThan(1);
      expect(page.context()).toBe(context);
    });

    test('negative/AC-5a: a second BrowserContext is a distinct object whose pages are not frames of the first page', async ({ page, browser }) => {
      const secondContext = await browser.newContext();
      const secondPage = await secondContext.newPage();

      expect(secondContext).not.toBe(page.context());
      expect(page.frames()).not.toContain(secondPage.mainFrame());

      await secondContext.close();
    });
  });

  test.describe('accessibility (WCAG 2.x, axe)', () => {
    test('no violations at initial load', async ({ page }) => {
      expect((await scanWcag(page)).violations).toEqual([]);
    });

    test('no violations with Challenge 2 selected', async ({ page, framesContextsPage }) => {
      await framesContextsPage.challenge2Tab.click();

      expect((await scanWcag(page)).violations).toEqual([]);
    });
  });
});

// Performance — initial load must complete within budget
test.describe('performance @performance', () => {
  test('initial page load completes within budget', async ({ page, framesContextsPage }) => {
    const start = Date.now();

    await page.goto(LAB_URL);
    await expect(framesContextsPage.pageHeading).toBeVisible();

    expect(Date.now() - start).toBeLessThan(5000);
  });
});
