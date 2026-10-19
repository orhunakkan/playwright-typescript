import { test, expect } from '../../../fixtures/index.ts';

const MESSAGE_50 = 'Automated QA test message. Please ignore this one.';

test.describe('AC-6: Message must be at least 50 characters', { tag: '@REQ-contact-form' }, () => {
  test('boundary: 50-character message shows no message alert on blur', { tag: ['@AC-6', '@TC-017'] }, async ({ page }) => {
    expect(MESSAGE_50).toHaveLength(50);

    // Step: fill Message with 50 characters and move focus out of the field
    await page.goto('/contact');
    const message = page.getByTestId('message');
    await message.fill(MESSAGE_50);
    await message.press('Tab');

    // Expect: no message alert, neither the minimum-length nor the required one
    await expect(page.getByTestId('message-error')).toBeHidden();
    await expect(page.getByText('Message must be minimal 50 characters')).toBeHidden();
    await expect(page.getByText('Message is required')).toBeHidden();
  });
});
