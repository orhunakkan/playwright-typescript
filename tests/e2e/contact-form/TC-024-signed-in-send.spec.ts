import { test, expect } from '../../../fixtures/index.ts';
import { AUTH_FILE, TEST_USER_NAME } from '../../../utilities/users.ts';

const GREETING = `Hello ${TEST_USER_NAME.first} ${TEST_USER_NAME.last}, please fill out this form to submit your message.`;
const MESSAGE = 'This is an automated test message from a QA test run. Please ignore it.';

test.describe('AC-9: Signed-in user sends a valid message', { tag: '@REQ-contact-form' }, () => {
  // 02 allows the shared run user here: nothing is read back.
  test.use({ storageState: AUTH_FILE });

  test(
    'positive: valid signed-in message is sent with one Send click and the thanks alert replaces form',
    { tag: ['@AC-9', '@TC-024'] },
    async ({ page }, testInfo) => {
      // Step: fill the signed-in form (real send: one per e2e project)
      await page.goto('/contact');
      await expect(page.getByText(GREETING)).toBeVisible();
      await page.getByTestId('subject').selectOption({ label: 'Customer service' });
      await page.getByTestId('message').fill(MESSAGE);

      // Step: click Send exactly once (no blur, no second click: 01 saw a first click ignored signed in)
      const sent = page.waitForResponse(
        (response) => response.request().method() === 'POST' && new URL(response.url()).pathname.endsWith('/messages'),
      );
      await page.getByTestId('contact-submit').click();
      const response = await sent;

      // The signed-in body is what TC-026 must copy, so it goes into the report
      const body = response.request().postDataJSON() as Record<string, unknown>;
      await testInfo.attach('post-messages-request-body', { body: JSON.stringify(body, null, 2), contentType: 'application/json' });

      // Expect: 200, the chosen subject's value and the entered message, then the thanks alert replaces the form
      expect(response.status()).toBe(200);
      expect(body).toMatchObject({ subject: 'customer-service', message: MESSAGE });
      await expect(page.getByRole('alert')).toContainText('Thanks for your message! We will contact you shortly.');
      await expect(page.getByTestId('contact-submit')).toBeHidden();
    },
  );
});
