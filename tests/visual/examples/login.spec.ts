import { test, expect } from '../../../fixtures/index.ts';
import { dynamicRegions } from '../../../utilities/visual.ts';

test.describe('login page appearance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByTestId('login-form')).toBeVisible();
  });

  test('positive: login page matches the baseline', { tag: '@example' }, async ({ page }) => {
    await expect(page).toHaveScreenshot('login-page.png', { fullPage: true, mask: dynamicRegions(page) });
  });

  // Structural regression: catches renamed, removed or re-ordered navigation even when pixels barely move.
  test('positive: main navigation structure matches the baseline', { tag: '@example' }, async ({ page }) => {
    await expect(page.getByRole('navigation').first()).toMatchAriaSnapshot({ name: 'main-nav.aria.yml' });
  });
});
