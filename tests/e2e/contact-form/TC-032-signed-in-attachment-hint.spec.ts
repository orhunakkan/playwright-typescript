import { test, expect } from '../../../fixtures/index.ts';
import { AUTH_FILE, TEST_USER_NAME } from '../../../utilities/users.ts';

const GREETING = `Hello ${TEST_USER_NAME.first} ${TEST_USER_NAME.last}, please fill out this form to submit your message.`;

test.describe('AC-12: Attachment rules are stated on the form', { tag: '@REQ-contact-form' }, () => {
  test.use({ storageState: AUTH_FILE });

  test('positive: signed-in form states the attachment rules', { tag: ['@AC-12', '@TC-032'] }, async ({ page }) => {
    // Step: open the contact page signed in
    await page.goto('/contact');
    await expect(page.getByText(GREETING)).toBeVisible();

    // Expect: the Attachment label, its control and the txt / 0kb hint
    await expect(page.getByText('Attachment', { exact: true })).toBeVisible();
    await expect(page.getByTestId('attachment')).toBeVisible();
    await expect(page.getByText('Only files with the txt extension are allowed, and files must be 0kb.')).toBeVisible();
  });
});
