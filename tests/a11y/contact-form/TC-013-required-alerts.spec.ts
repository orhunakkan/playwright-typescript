import { test, expect } from '../../../fixtures/index.ts';
import { scanWcag, withoutKnown, type KnownViolation } from '../../../utilities/accessibility.ts';

// Already-tracked findings in the shared page header (see tests/a11y/examples/). Anything else fails.
const KNOWN: KnownViolation[] = [
  { id: 'label-content-name-mismatch', target: /^#language$/, issue: 'finding: language selector visible text is not part of its accessible name' },
];

const REQUIRED_ALERTS = [
  ['first-name-error', 'First name is required'],
  ['last-name-error', 'Last name is required'],
  ['email-error', 'Email is required'],
  ['subject-error', 'Subject is required'],
  ['message-error', 'Message is required'],
] as const;

test.describe('AC-4: Empty signed-out submit shows a required error per field and sends nothing', { tag: '@REQ-contact-form' }, () => {
  test('negative: signed-out form showing all five required alerts', { tag: ['@AC-4', '@TC-013'] }, async ({ page }, testInfo) => {
    // "No POST" guard (03): a product bug that sends anyway must not write to the shared target.
    await page.route('**/messages', (route) =>
      route.request().method() === 'POST' ? route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }) : route.continue(),
    );
    await page.goto('/contact');

    await page.getByTestId('contact-submit').click();
    for (const [testId, text] of REQUIRED_ALERTS) {
      await expect(page.getByTestId(testId)).toContainText(text);
    }

    expect(withoutKnown(await scanWcag(page, testInfo), KNOWN)).toEqual([]);
  });
});
