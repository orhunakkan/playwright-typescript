import { randomUUID } from 'node:crypto';
import { test, expect } from '../../../fixtures/index.ts';
import { signInAs } from '../../../utilities/users.ts';

type Message = { id: string; message: string };

test.describe("AC-10: Signed-in user's message appears in their account messages", { tag: '@REQ-contact-form' }, () => {
  test(
    "positive: message sent through the API appears in the sender's account messages",
    { tag: ['@AC-10', '@TC-027'] },
    async ({ page, api, workerUser }) => {
      // Unique marker inside the first 50 characters, so the row is findable and survives truncation
      const marker = `apf-${randomUUID().slice(0, 8)}`;
      const text = `QA ${marker} automated test message for the account list. Please ignore.`;
      const auth = { Authorization: `Bearer ${workerUser.token}` };

      // Step: send the message through the API as the worker user (real send: one per e2e project)
      const sent = await api.post('/messages', { headers: auth, data: { subject: 'customer-service', message: text } });
      expect(sent.status()).toBe(200);

      // Step: find the new message's id as the same user
      const listed = await api.get('/messages', { headers: auth });
      expect(listed.status()).toBe(200);
      const { data } = (await listed.json()) as { data: Message[] };
      const id = data.find((m) => m.message === text)?.id;
      expect(id, 'GET /messages lists the new message').toBeTruthy();

      // Step: open the account messages page signed in as that user
      await signInAs(page.context(), workerUser);
      await page.goto('/account/messages');
      await expect(page.getByTestId('page-title')).toHaveText('Messages');
      await expect(page.getByRole('columnheader')).toHaveText(['Subject', 'Message', 'Status', 'Date', '']);

      // Expect: one row for the message with subject, truncated text, status, date-time format and a Details link
      const row = page.getByRole('row').filter({ hasText: marker });
      await expect(row).toHaveCount(1);
      await expect(row.getByRole('cell')).toHaveText([
        'customer-service',
        `${text.slice(0, 50)}...`,
        'NEW',
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
        'Details',
      ]);
      await expect(row.getByRole('link', { name: 'Details' })).toHaveAttribute('href', new RegExp(`/account/messages/${id}$`));
    },
  );
});
