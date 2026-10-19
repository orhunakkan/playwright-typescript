import { test, expect } from '../../../fixtures/index.ts';

// Real send: once per e2e project (02 Risks). Neutral content and an @example.com address.
const VALID = {
  firstName: 'QA',
  lastName: 'Tester',
  email: 'qa.tester@example.com',
  subject: 'webmaster',
  message: 'This is an automated test message from a QA test run. Please ignore it.',
};

test.describe('AC-3: Signed-out user sends a valid message', { tag: '@REQ-contact-form' }, () => {
  test(
    'positive: valid signed-out message is sent with one Send click and the thanks alert replaces form',
    { tag: ['@AC-3', '@TC-007'] },
    async ({ page }) => {
      // Step: fill the form with valid signed-out data
      await page.goto('/contact');
      await page.getByTestId('first-name').fill(VALID.firstName);
      await page.getByTestId('last-name').fill(VALID.lastName);
      await page.getByTestId('email').fill(VALID.email);
      await page.getByTestId('subject').selectOption(VALID.subject);
      await page.getByTestId('message').fill(VALID.message);

      // Step: wait for the POST /messages response, then click Send exactly once
      const sent = page.waitForResponse((r) => r.request().method() === 'POST' && new URL(r.url()).pathname.endsWith('/messages'));
      await page.getByTestId('contact-submit').click();
      const response = await sent;

      // Expect: the send succeeded with the form's data merged into the API body
      expect(response.status()).toBe(200);
      expect(response.request().postDataJSON()).toEqual({
        name: `${VALID.firstName} ${VALID.lastName}`,
        subject: VALID.subject,
        message: VALID.message,
        email: VALID.email,
      });

      // Expect: the thanks alert replaces the form; the heading remains
      await expect(page.getByRole('alert')).toContainText('Thanks for your message! We will contact you shortly.');
      for (const id of ['contact-submit', 'first-name', 'last-name', 'email', 'subject', 'message']) await expect(page.getByTestId(id)).toBeHidden();
      await expect(page.getByRole('heading', { level: 3, name: 'Contact' })).toBeVisible();
    },
  );
});
