import { test, expect } from '../../../fixtures/index.ts';
import { AUTH_FILE, TEST_USER_NAME } from '../../../utilities/users.ts';

const GREETING = `Hello ${TEST_USER_NAME.first} ${TEST_USER_NAME.last}, please fill out this form to submit your message.`;

test.describe('AC-7: Signed-in form greets the user and hides name and email', { tag: '@REQ-contact-form' }, () => {
  test.use({ storageState: AUTH_FILE });

  test('positive: signed-in form greets the user by name and hides the name and email fields', { tag: ['@AC-7', '@TC-020'] }, async ({ page }) => {
    // Step: open the contact page signed in
    await page.goto('/contact');

    // Expect: the greeting built from the user's name
    await expect(page.getByText(GREETING)).toBeVisible();

    // Expect: no name or email fields
    await expect(page.getByTestId('first-name')).toBeHidden();
    await expect(page.getByTestId('last-name')).toBeHidden();
    await expect(page.getByTestId('email')).toBeHidden();

    // Expect: Subject, Message, Attachment and Send are shown
    await expect(page.getByTestId('subject')).toBeVisible();
    await expect(page.getByTestId('message')).toBeVisible();
    await expect(page.getByTestId('attachment')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send' })).toBeVisible();
  });
});
