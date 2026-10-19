import type { Page } from '@playwright/test';
import { test, expect } from '../../../fixtures/index.ts';

type Field = { name: string; testId: string; alertId: string; alert: string; value: string };

// Valid signed-out data per field; Subject left empty means it stays on the placeholder.
const FIELDS: Field[] = [
  { name: 'First name', testId: 'first-name', alertId: 'first-name-error', alert: 'First name is required', value: 'QA' },
  { name: 'Last name', testId: 'last-name', alertId: 'last-name-error', alert: 'Last name is required', value: 'Tester' },
  { name: 'Email address', testId: 'email', alertId: 'email-error', alert: 'Email is required', value: 'qa.tester@example.com' },
  { name: 'Subject', testId: 'subject', alertId: 'subject-error', alert: 'Subject is required', value: 'webmaster' },
  {
    name: 'Message',
    testId: 'message',
    alertId: 'message-error',
    alert: 'Message is required',
    value: 'This is an automated test message from a QA test run. Please ignore it.',
  },
];

// Subject is a select; every other field is typed into.
async function enter(page: Page, f: Field) {
  const field = page.getByTestId(f.testId);
  if (f.testId === 'subject') await field.selectOption(f.value);
  else await field.fill(f.value);
}

test.describe('AC-4: Empty signed-out submit shows a required error per field and sends nothing', { tag: '@REQ-contact-form' }, () => {
  for (const empty of FIELDS) {
    test(
      `negative: each single empty field shows only its own required alert and sends nothing (${empty.name})`,
      { tag: ['@AC-4', '@TC-012'] },
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

        // Step: fill the other four fields validly, leave this one empty, click Send once
        const others = FIELDS.filter((f) => f !== empty);
        for (const f of others) await enter(page, f);
        await page.getByTestId('contact-submit').click();

        // Expect: only this field's required alert is shown
        await expect(page.getByTestId(empty.alertId)).toContainText(empty.alert);
        for (const f of others) await expect(page.getByTestId(f.alertId)).toBeHidden();

        // Expect: nothing was sent
        expect(posts).toHaveLength(0);
      },
    );
  }
});
