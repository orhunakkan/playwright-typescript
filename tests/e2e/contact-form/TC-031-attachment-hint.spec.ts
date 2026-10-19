import { test, expect } from '../../../fixtures/index.ts';

test.describe('AC-12: Attachment rules are stated on the form', { tag: '@REQ-contact-form' }, () => {
  test('positive: signed-out form states the attachment rules', { tag: ['@AC-12', '@TC-031'] }, async ({ page }) => {
    // Step: open the contact page signed out
    await page.goto('/contact');

    // Expect: the Attachment label, its control, and the hint stating the txt and 0kb rules
    await expect(page.getByText('Attachment', { exact: true })).toBeVisible();
    await expect(page.getByTestId('attachment')).toBeAttached();
    await expect(page.getByText(/Only files with the txt extension are allowed, and files must be 0kb\./)).toBeVisible();
  });
});
