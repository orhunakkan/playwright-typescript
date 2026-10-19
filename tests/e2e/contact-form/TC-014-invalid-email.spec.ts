import { test, expect } from '../../../fixtures/index.ts';

const OTHER_ALERTS = ['first-name-error', 'last-name-error', 'subject-error', 'message-error'];

test.describe('AC-5: Invalid email format is rejected', { tag: '@REQ-contact-form' }, () => {
  test(
    'negative: invalid email shows the format alert, sends nothing, and the alert clears when fixed',
    { tag: ['@AC-5', '@TC-014'] },
    async ({ page }) => {
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

      // Step: fill valid data except an invalid email, click Send once
      await page.getByTestId('first-name').fill('QA');
      await page.getByTestId('last-name').fill('Tester');
      await page.getByTestId('subject').selectOption('webmaster');
      await page.getByTestId('message').fill('This is an automated test message from a QA test run. Please ignore it.');
      await page.getByTestId('email').fill('not-an-email');
      await page.getByTestId('contact-submit').click();

      // Expect: the format alert is the only blocker, nothing was sent, and no thanks alert
      const emailAlert = page.getByTestId('email-error');
      await expect(emailAlert).toContainText('Email format is invalid');
      for (const id of OTHER_ALERTS) await expect(page.getByTestId(id)).toBeHidden();
      expect(posts).toHaveLength(0);
      await expect(page.getByText('Thanks for your message!')).toBeHidden();

      // Step: fix the email (no second Send, so nothing is sent)
      await page.getByTestId('email').fill('qa.tester@example.com');

      // Expect: the email alert clears
      await expect(emailAlert).toBeHidden();
    },
  );
});
