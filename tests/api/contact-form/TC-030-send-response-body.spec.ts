import { test, expect } from '../../../fixtures/index.ts';

// A valid ContactRequest in the UI's signed-out shape: anonymous, so all four fields are sent.
const CONTACT_REQUEST = {
  name: 'QA Tester',
  subject: 'webmaster',
  message: 'This is an automated test message from a QA test run. Please ignore it.',
  email: 'qa.tester@example.com',
};

// Real anonymous sends on the shared target: one per test.
test.describe('AC-11: Send-message API honours the contract', { tag: '@REQ-contact-form' }, () => {
  test('positive: valid ContactRequest returns 200 with an AddContactMessageResponse body', { tag: ['@AC-11', '@TC-030'] }, async ({ request }) => {
    const response = await request.post('/messages', { data: CONTACT_REQUEST });

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/application\/json/);
    await expect(response).toMatchContract('POST', '/messages');
  });

  test(
    'positive: valid ContactRequest response carries success: true',
    { tag: ['@AC-11', '@TC-030'], annotation: { type: 'issue', description: 'DEF-002' } },
    async ({ request }) => {
      // Known defect DEF-002: the 200 body is the stored message, with no `success` field.
      test.fail();
      const response = await request.post('/messages', { data: CONTACT_REQUEST });

      expect(response.status()).toBe(200);
      // AddContactMessageResponse lists `success` but does not mark it required, so the contract matcher
      // passes without it; these checks prove it is present, boolean and true.
      const body = (await response.json()) as { success?: unknown };
      expect(typeof body.success).toBe('boolean');
      expect(body.success).toBe(true);
    },
  );
});
