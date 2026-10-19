import type { Page } from '@playwright/test';
import { test, expect } from '../../../fixtures/index.ts';

// On narrow viewports the main menu is collapsed, so a user opens it first. Branch on what the user
// sees (the toggler), never on the project name.
async function openMainMenuIfCollapsed(page: Page) {
  await expect(page.getByTestId('nav-contact')).toBeAttached();
  const toggler = page.getByRole('button', { name: 'Toggle navigation' });
  if (await toggler.isVisible()) await toggler.click();
}

test.describe('AC-1: Contact page is reachable from the main navigation', { tag: '@REQ-contact-form' }, () => {
  test('positive: Contact in the main menu opens the contact page from another page', { tag: ['@AC-1', '@TC-002'] }, async ({ page }) => {
    // Step: from a page other than home, open the menu if collapsed and click Contact
    await page.goto('/auth/login');
    await openMainMenuIfCollapsed(page);
    await page.getByTestId('nav-contact').click();

    // Expect: the contact page is shown
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page).toHaveTitle(/Contact Us/);
    await expect(page.getByRole('heading', { level: 3, name: 'Contact' })).toBeVisible();
  });
});
