import { test, expect } from '../../../fixtures/index.ts';
import { AUTH_FILE, TEST_USER_NAME } from '../../../utilities/users.ts';

const GREETING = `Hello ${TEST_USER_NAME.first} ${TEST_USER_NAME.last}, please fill out this form to submit your message.`;
const MESSAGE_50 = 'Automated QA test message. Please ignore this one.';

test.describe('AC-9: Signed-in user sends a valid message', { tag: '@REQ-contact-form' }, () => {
  test.use({ storageState: AUTH_FILE });

  test(
    'boundary: signed-in message of exactly 50 characters is accepted and sent (response faked)',
    { tag: ['@AC-9', '@TC-025'] },
    async ({ page }) => {
      expect(MESSAGE_50).toHaveLength(50);
      await page.goto('/contact');
      await expect(page.getByText(GREETING)).toBeVisible();

      // Step: fake the send (no real message on the shared target), recording each POST body
      const posts: unknown[] = [];
      await page.route('**/messages', async (route) => {
        const request = route.request();
        if (request.method() !== 'POST') return route.continue();
        const body = request.postDataJSON() as Record<string, unknown>;
        posts.push(body);
        await route.fulfill({
          status: 200,
          headers: {
            'access-control-allow-origin': request.headers()['origin'] ?? '*',
            'access-control-allow-credentials': 'true',
          },
          json: { ...body, status: 'NEW', id: '01TESTFAKE', created_at: '2026-10-19 10:00:00' },
        });
      });

      // Step: choose a subject, enter a 50-character message and click Send once
      await page.getByTestId('subject').selectOption({ label: 'Customer service' });
      await page.getByTestId('message').fill(MESSAGE_50);
      await page.getByTestId('contact-submit').click();

      // Expect: the thanks alert, no message alert, and exactly one POST carrying the 50-character text
      await expect(page.getByRole('alert')).toContainText('Thanks for your message! We will contact you shortly.');
      await expect(page.getByTestId('message-error')).toBeHidden();
      expect(posts).toHaveLength(1);
      expect(posts[0]).toMatchObject({ message: MESSAGE_50 });
    },
  );
});
