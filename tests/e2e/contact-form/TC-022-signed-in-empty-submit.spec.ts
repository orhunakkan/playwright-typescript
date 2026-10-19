import { test, expect } from '../../../fixtures/index.ts';
import { AUTH_FILE, TEST_USER_NAME } from '../../../utilities/users.ts';

const GREETING = `Hello ${TEST_USER_NAME.first} ${TEST_USER_NAME.last}, please fill out this form to submit your message.`;

test.describe('AC-8: Empty signed-in submit only requires subject and message', { tag: '@REQ-contact-form' }, () => {
  test.use({ storageState: AUTH_FILE });

  test(
    'negative: empty signed-in submit shows only the Subject and Message alerts and sends nothing',
    { tag: ['@AC-8', '@TC-022'] },
    async ({ page }) => {
      // Step: open the signed-in form and record (and fake) every POST /messages, so nothing reaches the shared target
      await page.goto('/contact');
      await expect(page.getByText(GREETING)).toBeVisible();
      const posts: string[] = [];
      await page.route('**/messages', async (route) => {
        if (route.request().method() !== 'POST') return route.continue();
        posts.push(route.request().url());
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      });

      // Step: click Send once with the form empty
      await page.getByTestId('contact-submit').click();

      // Expect: exactly the Subject and Message required alerts, and no name or email alert
      await expect(page.getByTestId('subject-error')).toHaveText('Subject is required');
      await expect(page.getByTestId('message-error')).toHaveText('Message is required');
      await expect(page.getByRole('alert')).toHaveCount(2);
      await expect(page.getByTestId('first-name-error')).toHaveCount(0);
      await expect(page.getByTestId('last-name-error')).toHaveCount(0);
      await expect(page.getByTestId('email-error')).toHaveCount(0);

      // Expect: once the alerts are shown, nothing was sent
      expect(posts).toEqual([]);
    },
  );
});
