import { test, expect } from '../../fixtures/index';
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-39 — Soft Assertions & Test Steps

const LAB_URL = '/practice/soft-assertions';

const scan = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();

test.describe('Soft Assertions & Test Steps', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LAB_URL);
  });

  // AC-1 (TAB1-39): Tests use expect.soft for each of the four widget assertions so a failure
  // in one does not abort the remaining checks. AC-4/AC-4-B: each check is wrapped in a named
  // test.step and step names are unique per widget.
  test.describe('AC-1 & AC-4 — expect.soft across all widgets, wrapped in named test.step blocks', () => {
    test('positive: all four widgets pass with zero soft-assertion failures', async ({ softAssertionsPage }) => {
      // Wait for the Activity Score timer and Account Status animation to settle before
      // asserting — settling itself is covered by the dedicated AC-2/AC-3 tests below.
      await expect.poll(async () => softAssertionsPage.activityScoreValue.textContent(), { timeout: 5000 }).toBe('87');
      await expect(async () => {
        const text = await softAssertionsPage.accountStatusBadge.textContent();
        expect(text).toBe('active');
      }).toPass({ timeout: 3000 });

      const stepNames: string[] = [];

      await test.step('Check Activity Score', async () => {
        stepNames.push('Check Activity Score');
        expect.soft(await softAssertionsPage.activityScoreValue.textContent()).toBe('87');
      });

      await test.step('Check Account Status', async () => {
        stepNames.push('Check Account Status');
        expect.soft(await softAssertionsPage.accountStatusBadge.textContent()).toBe('active');
      });

      await test.step('Check Profile', async () => {
        stepNames.push('Check Profile');
        expect.soft(await softAssertionsPage.profileNameField.textContent()).toContain('Jane Doe');
      });

      await test.step('Check Notifications', async () => {
        stepNames.push('Check Notifications');
        expect.soft(await softAssertionsPage.notificationCount.textContent()).toBe('3');
      });

      // AC-4-B: step names are unique per widget — no generic/duplicate titles
      expect(new Set(stepNames).size).toBe(stepNames.length);
      expect(stepNames).toEqual(['Check Activity Score', 'Check Account Status', 'Check Profile', 'Check Notifications']);
    });

    test('negative/AC-6: an intentional soft failure on one widget does not abort the remaining checks', async ({ softAssertionsPage }) => {
      // Expected to fail: the Activity Score check below is intentionally wrong so the test ends
      // in a failed state — proving soft failures are collected, not thrown, and are only
      // reported together at test completion (not individually mid-test).
      test.fail();

      const checked: string[] = [];

      await test.step('Check Activity Score', async () => {
        // Intentional wrong expectation
        expect.soft(await softAssertionsPage.activityScoreValue.textContent()).toBe('unreachable-value');
        checked.push('Activity Score');
      });

      await test.step('Check Account Status', async () => {
        expect.soft(await softAssertionsPage.accountStatusBadge.textContent()).toBe('active');
        checked.push('Account Status');
      });

      await test.step('Check Profile', async () => {
        expect.soft(await softAssertionsPage.profileNameField.textContent()).toContain('Jane Doe');
        checked.push('Profile');
      });

      await test.step('Check Notifications', async () => {
        expect.soft(await softAssertionsPage.notificationCount.textContent()).toBe('3');
        checked.push('Notifications');
      });

      // All four widgets were still checked despite the first widget's soft failure
      expect(checked).toEqual(['Activity Score', 'Account Status', 'Profile', 'Notifications']);
    });
  });

  // AC-2 (TAB1-39): expect.poll keeps re-reading the Activity Score widget until it reaches the
  // expected value after its short timer.
  test.describe('AC-2 — expect.poll re-reads Activity Score until it settles', () => {
    test('positive: expect.poll reaches the expected Activity Score value within a bounded timeout', async ({ softAssertionsPage }) => {
      await expect
        .poll(async () => softAssertionsPage.activityScoreValue.textContent(), {
          message: 'Activity Score should reach 87 after its short timer',
          timeout: 5000,
        })
        .toBe('87');
    });

    test('negative: expect.poll fails fast (bounded timeout) when the expected value never appears', async ({ softAssertionsPage }) => {
      let rejected = false;
      try {
        await expect
          .poll(async () => softAssertionsPage.activityScoreValue.textContent(), { timeout: 1000 })
          .toBe('unreachable-value');
      } catch {
        rejected = true;
      }
      expect(rejected).toBe(true);
    });
  });

  // AC-3 (TAB1-39): expect(locator).toPass({ timeout: 3000 }) retries the assertion block until
  // the animated Account Status badge settles on its final value.
  test.describe('AC-3 — toPass retries the animated Account Status badge until it settles', () => {
    test('positive/boundary: toPass({ timeout: 3000 }) retries until the badge settles on "active"', async ({ softAssertionsPage }) => {
      await expect(async () => {
        const text = await softAssertionsPage.accountStatusBadge.textContent();
        expect(text).toBe('active');
      }).toPass({ timeout: 3000 });
    });
  });

  // AC-5 (TAB1-39): test.info().annotations.push({ type: "issue", description: "..." }) inside a
  // step is present on the test result's annotations.
  test.describe('AC-5 — annotation pushed inside a step is recorded on the test result', () => {
    test('positive: issue annotation pushed inside a step appears in testInfo.annotations', async ({ softAssertionsPage }, testInfo) => {
      await test.step('Check Account Status', async () => {
        testInfo.annotations.push({ type: 'issue', description: 'DASH-42' });
        await expect(async () => {
          const text = await softAssertionsPage.accountStatusBadge.textContent();
          expect(text).toBe('active');
        }).toPass({ timeout: 3000 });
      });

      expect(testInfo.annotations).toContainEqual({ type: 'issue', description: 'DASH-42' });
    });
  });

  // Accessibility — scan load state (widgets mid-settle) and settled state (Gap #3: axe multi-state)
  test.describe('accessibility (WCAG 2.x, axe)', () => {
    test('no violations at initial load (widgets mid-settle)', async ({ page }) => {
      expect((await scan(page)).violations).toEqual([]);
    });

    test('no violations once all widgets have settled', async ({ softAssertionsPage, page }) => {
      await expect.poll(async () => softAssertionsPage.activityScoreValue.textContent(), { timeout: 5000 }).toBe('87');
      await expect(async () => {
        const text = await softAssertionsPage.accountStatusBadge.textContent();
        expect(text).toBe('active');
      }).toPass({ timeout: 3000 });
      expect((await scan(page)).violations).toEqual([]);
    });
  });
});

// Performance — the full widget-check flow (poll + toPass waits) must complete within budget
test.describe('performance @performance', () => {
  test('full widget-check flow (poll + toPass) completes within budget', async ({ softAssertionsPage, page }) => {
    await page.goto(LAB_URL);
    const start = Date.now();

    await expect.poll(async () => softAssertionsPage.activityScoreValue.textContent(), { timeout: 5000 }).toBe('87');
    await expect(async () => {
      const text = await softAssertionsPage.accountStatusBadge.textContent();
      expect(text).toBe('active');
    }).toPass({ timeout: 3000 });

    expect(Date.now() - start).toBeLessThan(8000);
  });
});
