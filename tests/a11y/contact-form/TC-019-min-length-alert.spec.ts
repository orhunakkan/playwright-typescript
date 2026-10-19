import { test, expect } from '../../../fixtures/index.ts';
import { scanWcag, withoutKnown, type KnownViolation } from '../../../utilities/accessibility.ts';

// Already-tracked findings in the shared page header (see tests/a11y/examples/). Anything else fails.
const KNOWN: KnownViolation[] = [
  { id: 'label-content-name-mismatch', target: /^#language$/, issue: 'finding: language selector visible text is not part of its accessible name' },
];

// 49 characters: one short of the minimum.
const MESSAGE_49 = 'Automated QA test message. Please ignore this one';

test.describe('AC-6: Message must be at least 50 characters', { tag: '@REQ-contact-form' }, () => {
  test(
    'negative: signed-out form showing the minimum-length alert',
    { tag: ['@AC-6', '@TC-019'], annotation: { type: 'issue', description: 'DEF-001' } },
    async ({ page }, testInfo) => {
      // Known defect DEF-001: blur does not show the alert before the first Send, so the state to scan is never reached.
      test.fail();
      await page.goto('/contact');
      const message = page.getByTestId('message');
      await message.fill(MESSAGE_49);
      // Move focus out of the field as a user would (Tab), which fires blur.
      await message.press('Tab');
      await expect(page.getByTestId('message-error')).toContainText('Message must be minimal 50 characters');

      expect(withoutKnown(await scanWcag(page, testInfo), KNOWN)).toEqual([]);
    },
  );
});
