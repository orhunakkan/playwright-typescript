import { test, expect } from '../../../fixtures/index.ts';

// The exact body the signed-out UI sends (captured in design, TC-007). No fields are added from the schema.
const UI_BODY = {
  name: 'QA Tester',
  subject: 'webmaster',
  message: 'This is an automated test message from a QA test run. Please ignore it.',
  email: 'qa.tester@example.com',
};

// Real anonymous sends on the shared target: one per test.
test.describe('AC-3: Signed-out user sends a valid message', { tag: '@REQ-contact-form' }, () => {
  test(
    "positive: anonymous POST /messages with the UI's body returns 200 and matches the contract",
    { tag: ['@AC-3', '@TC-009'] },
    async ({ request }) => {
      const response = await request.post('/messages', { data: UI_BODY });

      expect(response.status()).toBe(200);
      await expect(response).toMatchContract('POST', '/messages');
    },
  );

  test(
    "positive: anonymous POST /messages with the UI's body returns success: true",
    { tag: ['@AC-3', '@TC-009'], annotation: { type: 'issue', description: 'DEF-002' } },
    async ({ request }) => {
      // Known defect DEF-002: the 200 body is the stored message, with no `success` field.
      test.fail();
      const response = await request.post('/messages', { data: UI_BODY });

      expect(response.status()).toBe(200);
      // 02 states `success: true`. The contract does not mark it required, so this check is what proves it.
      expect(await response.json()).toHaveProperty('success', true);
    },
  );
});
