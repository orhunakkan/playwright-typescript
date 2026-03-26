import { expect, test } from '@playwright/test';

test('visual regression test', async ({ page }) => {
  await page.goto(`${process.env.PRACTICE_E2E_URL}/index.html`);
  await expect(page).toHaveScreenshot({ fullPage: true });
});
