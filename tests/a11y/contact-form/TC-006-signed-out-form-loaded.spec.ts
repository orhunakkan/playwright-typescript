import { test, expect } from '../../../fixtures/index.ts';
import { scanWcag, withoutKnown, type KnownViolation } from '../../../utilities/accessibility.ts';

// Already-tracked findings in the shared page header (see tests/a11y/examples/). Anything else fails.
const KNOWN: KnownViolation[] = [
  { id: 'label-content-name-mismatch', target: /^#language$/, issue: 'finding: language selector visible text is not part of its accessible name' },
];

test.describe('AC-2: Signed-out form shows all contact fields', { tag: '@REQ-contact-form' }, () => {
  test('positive: signed-out contact form as loaded', { tag: ['@AC-2', '@TC-006'] }, async ({ page }, testInfo) => {
    await page.goto('/contact');
    await expect(page.getByTestId('contact-submit')).toBeVisible();

    expect(withoutKnown(await scanWcag(page, testInfo), KNOWN)).toEqual([]);
  });
});
