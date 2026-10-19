import type { Page } from '@playwright/test';
import { test, expect } from '../../../fixtures/index.ts';

// Branches on the layout the user sees (toggler visible = collapsed menu), never on the project name.
// Collapsed: Contact is hidden until the toggler opens the menu. Desktop: no toggling at all.
async function revealContactLink(page: Page) {
  const contact = page.getByTestId('nav-contact');
  const toggler = page.getByRole('button', { name: 'Toggle navigation' });
  await expect(contact).toBeAttached();
  if (await toggler.isVisible()) {
    await expect(contact).toBeHidden();
    await toggler.click();
  }
}

test.describe('AC-1: Contact page is reachable from the main navigation', { tag: '@REQ-contact-form' }, () => {
  test('boundary: collapsed mobile menu is opened before Contact is reachable', { tag: ['@AC-1', '@TC-003'] }, async ({ page }) => {
    // Step: on the home page, open the menu only if it is collapsed
    await page.goto('/');
    await revealContactLink(page);

    // Expect (both layouts): Contact is reachable
    const contact = page.getByTestId('nav-contact');
    await expect(contact).toBeVisible();

    // Step: click Contact
    await contact.click();

    // Expect: the contact page is shown
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.getByRole('heading', { level: 3, name: 'Contact' })).toBeVisible();
  });
});
