import { test, expect } from '../../../fixtures/index.ts';

const REQUIRED_ALERTS: [testId: string, text: string][] = [
  ['first-name-error', 'First name is required'],
  ['last-name-error', 'Last name is required'],
  ['email-error', 'Email is required'],
  ['subject-error', 'Subject is required'],
  ['message-error', 'Message is required'],
];

test.describe('AC-4: Empty signed-out submit shows a required error per field and sends nothing', { tag: '@REQ-contact-form' }, () => {
  test('negative: empty form shows a required alert under every field and sends nothing', { tag: ['@AC-4', '@TC-011'] }, async ({ page }) => {
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

    // Step: click Send once with the form empty
    await page.getByTestId('contact-submit').click();

    // Expect: a required alert under every field
    for (const [testId, text] of REQUIRED_ALERTS) await expect(page.getByTestId(testId)).toContainText(text);

    // Expect: nothing was sent; the form is still shown and there is no thanks alert
    expect(posts).toHaveLength(0);
    await expect(page.getByTestId('contact-submit')).toBeVisible();
    await expect(page.getByText('Thanks for your message!')).toBeHidden();
  });
});
