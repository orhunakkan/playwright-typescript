import { test, expect } from '../../../fixtures/index.ts';

const FIELD_ALERTS = ['first-name-error', 'last-name-error', 'email-error', 'subject-error', 'message-error'];

test.describe('AC-2: Signed-out form shows all contact fields', { tag: '@REQ-contact-form' }, () => {
  test('positive: signed-out form shows every contact field and the Send button', { tag: ['@AC-2', '@TC-004'] }, async ({ page }) => {
    // Step: open the contact page signed out
    await page.goto('/contact');

    // Expect: name and email inputs are visible, editable and empty
    for (const id of ['first-name', 'last-name', 'email']) {
      const field = page.getByTestId(id);
      await expect(field).toBeVisible();
      await expect(field).toBeEditable();
      await expect(field).toHaveValue('');
    }

    // Expect: Subject, an empty Message, the Attachment control and an enabled Send
    await expect(page.getByTestId('subject')).toBeVisible();
    await expect(page.getByTestId('message')).toBeVisible();
    await expect(page.getByTestId('message')).toHaveValue('');
    await expect(page.getByTestId('attachment')).toBeAttached();
    await expect(page.getByTestId('contact-submit')).toBeVisible();
    await expect(page.getByTestId('contact-submit')).toBeEnabled();

    // Expect: no field alert on load
    for (const id of FIELD_ALERTS) await expect(page.getByTestId(id)).toBeHidden();
  });
});
