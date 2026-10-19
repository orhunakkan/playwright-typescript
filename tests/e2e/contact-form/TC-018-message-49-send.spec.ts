import { test, expect } from '../../../fixtures/index.ts';

const MESSAGE_49 = 'Automated QA test message. Please ignore this one';
const OTHER_ALERTS = ['first-name-error', 'last-name-error', 'email-error', 'subject-error'];

test.describe('AC-6: Message must be at least 50 characters', { tag: '@REQ-contact-form' }, () => {
  test(
    'negative: 49-character message and Send shows the minimum-length alert and sends nothing',
    { tag: ['@AC-6', '@TC-018'] },
    async ({ page }) => {
      expect(MESSAGE_49).toHaveLength(49);
      await page.goto('/contact');

      // Step: record every POST /messages and fake it, so a product bug cannot write a real message
      const posts: string[] = [];
      await page.route('**/messages', async (route) => {
        const request = route.request();
        if (request.method() !== 'POST') return route.continue();
        posts.push(request.postData() ?? '');
        await route.fulfill({
          status: 200,
          headers: { 'access-control-allow-origin': request.headers()['origin'] ?? '*', 'access-control-allow-credentials': 'true' },
          json: {},
        });
      });

      // Step: fill every other field validly and Message with 49 characters (no blur), click Send once
      await page.getByTestId('first-name').fill('QA');
      await page.getByTestId('last-name').fill('Tester');
      await page.getByTestId('email').fill('qa.tester@example.com');
      await page.getByTestId('subject').selectOption('webmaster');
      await page.getByTestId('message').fill(MESSAGE_49);
      await page.getByTestId('contact-submit').click();

      // Expect: the minimum-length alert is the only one, and nothing was sent
      await expect(page.getByTestId('message-error')).toContainText('Message must be minimal 50 characters');
      for (const id of OTHER_ALERTS) await expect(page.getByTestId(id)).toBeHidden();
      expect(posts).toHaveLength(0);
    },
  );
});
