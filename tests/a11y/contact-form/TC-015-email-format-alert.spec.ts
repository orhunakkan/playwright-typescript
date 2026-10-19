import { test, expect } from '../../../fixtures/index.ts';
import { scanWcag, withoutKnown, type KnownViolation } from '../../../utilities/accessibility.ts';

// Already-tracked findings in the shared page header (see tests/a11y/examples/). Anything else fails.
const KNOWN: KnownViolation[] = [
  { id: 'label-content-name-mismatch', target: /^#language$/, issue: 'finding: language selector visible text is not part of its accessible name' },
];

test.describe('AC-5: Invalid email format is rejected', { tag: '@REQ-contact-form' }, () => {
  test('negative: signed-out form showing the email-format alert', { tag: ['@AC-5', '@TC-015'] }, async ({ page }, testInfo) => {
    // "No POST" guard (03): a product bug that sends anyway must not write to the shared target.
    await page.route('**/messages', (route) =>
      route.request().method() === 'POST' ? route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }) : route.continue(),
    );
    await page.goto('/contact');
    await page.getByTestId('first-name').fill('QA');
    await page.getByTestId('last-name').fill('Tester');
    await page.getByTestId('email').fill('not-an-email');
    await page.getByTestId('subject').selectOption('webmaster');
    await page.getByTestId('message').fill('This is an automated test message from a QA test run. Please ignore it.');

    await page.getByTestId('contact-submit').click();
    await expect(page.getByTestId('email-error')).toContainText('Email format is invalid');

    expect(withoutKnown(await scanWcag(page, testInfo), KNOWN)).toEqual([]);
  });
});
