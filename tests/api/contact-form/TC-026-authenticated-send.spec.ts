import { test, expect } from '../../../fixtures/index.ts';
import { TEST_USER_NAME } from '../../../utilities/users.ts';

// The body the signed-in form sends (captured in build from TC-024's form): the user's full name,
// the subject slug and the message, with no email. No fields are added from the schema.
const SIGNED_IN_BODY = {
  name: `${TEST_USER_NAME.first} ${TEST_USER_NAME.last}`,
  subject: 'customer-service',
  message: 'This is an automated test message from a QA test run. Please ignore it.',
};

// Real authenticated sends on the shared target, as this run's own user: one per test.
test.describe('AC-9: Signed-in user sends a valid message', { tag: '@REQ-contact-form' }, () => {
  test(
    'positive: authenticated POST /messages returns 200 and matches the contract',
    { tag: ['@AC-9', '@TC-026'] },
    async ({ request, workerUser }) => {
      const response = await request.post('/messages', {
        headers: { Authorization: `Bearer ${workerUser.token}` },
        data: SIGNED_IN_BODY,
      });

      expect(response.status()).toBe(200);
      await expect(response).toMatchContract('POST', '/messages');
    },
  );

  test(
    'positive: authenticated POST /messages returns success: true',
    { tag: ['@AC-9', '@TC-026'], annotation: { type: 'issue', description: 'DEF-002' } },
    async ({ request, workerUser }) => {
      // Known defect DEF-002: the 200 body is the stored message, with no `success` field.
      test.fail();
      const response = await request.post('/messages', {
        headers: { Authorization: `Bearer ${workerUser.token}` },
        data: SIGNED_IN_BODY,
      });

      expect(response.status()).toBe(200);
      // 02 states `success: true`. The contract does not mark it required, so this check is what proves it.
      expect(await response.json()).toHaveProperty('success', true);
    },
  );
});
