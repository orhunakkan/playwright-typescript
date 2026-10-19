import { test, expect } from '../../../fixtures/index.ts';
import { scanWcag, withoutKnown, type KnownViolation } from '../../../utilities/accessibility.ts';

// Real findings on the target (2026-10-19). Page scans ignore exactly these (rule, element) pairs and
// still fail on anything else; the expected-failure test at the bottom tracks them until fixed.
const KNOWN: KnownViolation[] = [
  { id: 'label-content-name-mismatch', target: /^#language$/, issue: 'finding: language selector visible text is not part of its accessible name' },
  { id: 'button-name', target: /^\.btn-outline-secondary$/, issue: 'finding: login page icon button has no accessible name' },
  { id: 'list', target: /^\.checkbox:nth-child\(\d+\) > ul$/, issue: 'finding: category filter <ul> contains non-<li> children' },
];

// Scan each page in the states a user actually meets: loaded, and after an error is shown.
test.describe('WCAG 2.2 AA', () => {
  test('positive: home page with the catalogue loaded', { tag: '@example' }, async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(page.getByTestId('product-name').first()).toBeVisible();

    expect(withoutKnown(await scanWcag(page, testInfo), KNOWN)).toEqual([]);
  });

  test('positive: login page', { tag: '@example' }, async ({ page }, testInfo) => {
    await page.goto('/auth/login');
    await expect(page.getByTestId('login-form')).toBeVisible();

    expect(withoutKnown(await scanWcag(page, testInfo), KNOWN)).toEqual([]);
  });

  test('negative: login page showing a validation error', { tag: '@example' }, async ({ page }, testInfo) => {
    await page.goto('/auth/login');
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('email-error')).toBeVisible();

    expect(withoutKnown(await scanWcag(page, testInfo), KNOWN)).toEqual([]);
  });

  test(
    'positive: known findings are fixed',
    { tag: '@example', annotation: KNOWN.map((k) => ({ type: 'issue', description: k.issue })) },
    async ({ page }, testInfo) => {
      test.fail();
      await page.goto('/');
      await expect(page.getByTestId('product-name').first()).toBeVisible();
      const home = await scanWcag(page, testInfo);
      await page.goto('/auth/login');
      await expect(page.getByTestId('login-form')).toBeVisible();
      const login = await scanWcag(page, testInfo);

      const stillPresent = [...home, ...login].filter((v) => KNOWN.some((k) => k.id === v.id));
      expect(stillPresent).toEqual([]);
    },
  );
});
