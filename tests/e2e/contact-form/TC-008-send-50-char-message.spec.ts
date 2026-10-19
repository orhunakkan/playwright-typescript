import { test, expect } from '../../../fixtures/index.ts';

const VALID = {
  firstName: 'QA',
  lastName: 'Tester',
  email: 'qa.tester@example.com',
  subject: 'webmaster',
};
const MESSAGE_50 = 'Automated QA test message. Please ignore this one.';

test.describe('AC-3: Signed-out user sends a valid message', { tag: '@REQ-contact-form' }, () => {
  test(
    'boundary: signed-out message of exactly 50 characters is accepted and sent (response faked)',
    { tag: ['@AC-3', '@TC-008'] },
    async ({ page }) => {
      expect(MESSAGE_50).toHaveLength(50);
      await page.goto('/contact');

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

      // Step: fill valid data with a 50-character message and click Send once
      await page.getByTestId('first-name').fill(VALID.firstName);
      await page.getByTestId('last-name').fill(VALID.lastName);
      await page.getByTestId('email').fill(VALID.email);
      await page.getByTestId('subject').selectOption(VALID.subject);
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
