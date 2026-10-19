import { test, expect } from '../../../fixtures/index.ts';
import { scanWcag, withoutKnown, type KnownViolation } from '../../../utilities/accessibility.ts';
import { AUTH_FILE, TEST_USER_NAME } from '../../../utilities/users.ts';

// Already-tracked findings in the shared page header (see tests/a11y/examples/). Anything else fails.
const KNOWN: KnownViolation[] = [
  { id: 'label-content-name-mismatch', target: /^#language$/, issue: 'finding: language selector visible text is not part of its accessible name' },
];

const GREETING = `Hello ${TEST_USER_NAME.first} ${TEST_USER_NAME.last}, please fill out this form to submit your message.`;

test.describe('AC-8: Empty signed-in submit only requires subject and message', { tag: '@REQ-contact-form' }, () => {
  test.use({ storageState: AUTH_FILE });

  test('negative: signed-in form showing the two required alerts', { tag: ['@AC-8', '@TC-023'] }, async ({ page }, testInfo) => {
    // "No POST" guard (03): a product bug that sends anyway must not write to the shared target.
    await page.route('**/messages', (route) =>
      route.request().method() === 'POST' ? route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }) : route.continue(),
    );
    await page.goto('/contact');
    await expect(page.getByText(GREETING)).toBeVisible();

    await page.getByTestId('contact-submit').click();
    await expect(page.getByTestId('subject-error')).toContainText('Subject is required');
    await expect(page.getByTestId('message-error')).toContainText('Message is required');

    expect(withoutKnown(await scanWcag(page, testInfo), KNOWN)).toEqual([]);
  });
});
