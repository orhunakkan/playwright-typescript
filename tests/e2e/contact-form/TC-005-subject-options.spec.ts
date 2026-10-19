import { test, expect } from '../../../fixtures/index.ts';

// The six real subjects, in order, with their option values (slugs of the labels).
const SUBJECTS: [label: string, value: string][] = [
  ['Customer service', 'customer-service'],
  ['Webmaster', 'webmaster'],
  ['Return', 'return'],
  ['Payments', 'payments'],
  ['Warranty', 'warranty'],
  ['Status of my order', 'status-of-order'],
];
const PLACEHOLDER = 'Select a subject *';

test.describe('AC-2: Signed-out form shows all contact fields', { tag: '@REQ-contact-form' }, () => {
  test('positive: Subject offers exactly the six subjects and none is selected', { tag: ['@AC-2', '@TC-005'] }, async ({ page }) => {
    // Step: open the contact page and read the Subject options
    await page.goto('/contact');
    const subject = page.getByTestId('subject');

    // Expect: no subject is pre-selected; the empty placeholder (hidden from the option list) is the current choice
    await expect(subject).toHaveValue('');
    await expect(subject.getByRole('option', { name: PLACEHOLDER, exact: true, includeHidden: true })).toHaveAttribute('value', '');

    // Expect: the options other than the placeholder are exactly the six subjects, in order
    const realOptions = subject.getByRole('option').filter({ hasNotText: PLACEHOLDER });
    await expect(realOptions).toHaveText(SUBJECTS.map(([label]) => label));
    for (const [label, value] of SUBJECTS) await expect(subject.getByRole('option', { name: label, exact: true })).toHaveAttribute('value', value);
  });
});
