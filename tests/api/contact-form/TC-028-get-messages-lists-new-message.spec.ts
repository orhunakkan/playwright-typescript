import { randomUUID } from 'node:crypto';
import type { APIRequestContext } from '@playwright/test';
import { test, expect } from '../../../fixtures/index.ts';

type ContactMessage = { message: string; subject: string; status: string; created_at: string };

// Sends one message with a unique marker as the user, then lists the user's messages.
async function sendAndList(request: APIRequestContext, token: string) {
  const headers = { Authorization: `Bearer ${token}` };
  const message = `QA apf-${randomUUID().slice(0, 8)} automated test message for the account list. Please ignore.`;
  const sent = await request.post('/messages', { headers, data: { subject: 'customer-service', message } });
  expect(sent.status()).toBe(200);
  return { message, response: await request.get('/messages', { headers }) };
}

// Real authenticated sends on the shared target: one per test. The unique marker identifies the
// message in the list, so the case does not rely on the list holding only this user's rows
// (unverified, see 03).
test.describe("AC-10: Signed-in user's message appears in their account messages", { tag: '@REQ-contact-form' }, () => {
  test('positive: GET /messages as the sender lists the new message', { tag: ['@AC-10', '@TC-028'] }, async ({ request, workerUser }) => {
    const { message, response } = await sendAndList(request, workerUser.token);

    expect(response.status()).toBe(200);
    const { data } = (await response.json()) as { data: ContactMessage[] };
    const matches = data.filter((m) => m.message === message);
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      subject: 'customer-service',
      status: 'NEW',
      created_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/),
    });
  });

  test(
    'positive: GET /messages as the sender matches the contract',
    { tag: ['@AC-10', '@TC-028'], annotation: { type: 'issue', description: 'DEF-003' } },
    async ({ request, workerUser }) => {
      // Known defect DEF-003: messages sent without name or email are listed with `name: null, email: null`.
      test.fail();
      const { response } = await sendAndList(request, workerUser.token);

      expect(response.status()).toBe(200);
      await expect(response).toMatchContract('GET', '/messages');
    },
  );
});
