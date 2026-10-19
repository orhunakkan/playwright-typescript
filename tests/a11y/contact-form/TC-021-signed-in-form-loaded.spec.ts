import { test, expect } from '../../../fixtures/index.ts';
import { scanWcag, withoutKnown, type KnownViolation } from '../../../utilities/accessibility.ts';
import { AUTH_FILE, TEST_USER_NAME } from '../../../utilities/users.ts';

// Already-tracked findings in the shared page header (see tests/a11y/examples/). Anything else fails.
const KNOWN: KnownViolation[] = [
  { id: 'label-content-name-mismatch', target: /^#language$/, issue: 'finding: language selector visible text is not part of its accessible name' },
];

const GREETING = `Hello ${TEST_USER_NAME.first} ${TEST_USER_NAME.last}, please fill out this form to submit your message.`;

test.describe('AC-7: Signed-in form greets the user and hides name and email', { tag: '@REQ-contact-form' }, () => {
  test.use({ storageState: AUTH_FILE });

  test('positive: signed-in contact form as loaded', { tag: ['@AC-7', '@TC-021'] }, async ({ page }, testInfo) => {
    await page.goto('/contact');
    await expect(page.getByText(GREETING)).toBeVisible();
    await expect(page.getByTestId('contact-submit')).toBeVisible();

    expect(withoutKnown(await scanWcag(page, testInfo), KNOWN)).toEqual([]);
  });
});
