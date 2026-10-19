import { test, expect } from '../../../fixtures/index.ts';
import { scanWcag, withoutKnown, type KnownViolation } from '../../../utilities/accessibility.ts';

// Already-tracked findings in the shared page header (see tests/a11y/examples/). Anything else fails.
const KNOWN: KnownViolation[] = [
  { id: 'label-content-name-mismatch', target: /^#language$/, issue: 'finding: language selector visible text is not part of its accessible name' },
];

const VALID = {
  firstName: 'QA',
  lastName: 'Tester',
  email: 'qa.tester@example.com',
  subject: 'webmaster',
  message: 'This is an automated test message from a QA test run. Please ignore it.',
};

const THANKS = 'Thanks for your message! We will contact you shortly.';

test.describe('AC-3: Signed-out user sends a valid message', { tag: '@REQ-contact-form' }, () => {
  test('positive: thanks alert after a signed-out send (response faked)', { tag: ['@AC-3', '@TC-010'] }, async ({ page }, testInfo) => {
    // Faked send (02 Risks): the POST still leaves the form, but gets the live API's response shape
    // without writing a real message to the shared target. Any other method goes through.
    await page.route('**/messages', async (route) => {
      if (route.request().method() !== 'POST') return route.continue();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          name: `${VALID.firstName} ${VALID.lastName}`,
          subject: VALID.subject,
          message: VALID.message,
          email: VALID.email,
          status: 'NEW',
          id: '01TESTFAKE',
          created_at: '2026-10-19 10:00:00',
        }),
      });
    });
    await page.goto('/contact');
    await page.getByTestId('first-name').fill(VALID.firstName);
    await page.getByTestId('last-name').fill(VALID.lastName);
    await page.getByTestId('email').fill(VALID.email);
    await page.getByTestId('subject').selectOption(VALID.subject);
    await page.getByTestId('message').fill(VALID.message);

    await page.getByTestId('contact-submit').click();
    await expect(page.getByRole('alert').filter({ hasText: THANKS })).toBeVisible();

    expect(withoutKnown(await scanWcag(page, testInfo), KNOWN)).toEqual([]);
  });
});
