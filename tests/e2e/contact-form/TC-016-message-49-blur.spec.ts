import { test, expect } from '../../../fixtures/index.ts';

const MESSAGE_49 = 'Automated QA test message. Please ignore this one';

test.describe('AC-6: Message must be at least 50 characters', { tag: '@REQ-contact-form' }, () => {
  test(
    'boundary: 49-character message shows the minimum-length alert on blur',
    { tag: ['@AC-6', '@TC-016'], annotation: { type: 'issue', description: 'DEF-001' } },
    async ({ page }) => {
      // Known defect DEF-001: the alert appears only after the first Send, not on blur.
      test.fail();
      expect(MESSAGE_49).toHaveLength(49);

      // Step: fill Message with 49 characters and move focus out of the field
      await page.goto('/contact');
      const message = page.getByTestId('message');
      await message.fill(MESSAGE_49);
      await message.press('Tab');

      // Expect: the minimum-length alert
      await expect(page.getByTestId('message-error')).toContainText('Message must be minimal 50 characters');
    },
  );
});
