import { randomUUID } from 'node:crypto';
import { test, expect } from '../../../fixtures/index.ts';
import { scanWcag, withoutKnown, type KnownViolation } from '../../../utilities/accessibility.ts';
import { signInAs } from '../../../utilities/users.ts';

// Already-tracked findings: the shared page header (see tests/a11y/examples/) and DEF-004 on this
// page's status badge. Anything else fails.
const KNOWN: KnownViolation[] = [
  { id: 'label-content-name-mismatch', target: /^#language$/, issue: 'finding: language selector visible text is not part of its accessible name' },
  { id: 'color-contrast', target: /^\.badge$/, issue: 'DEF-004' },
];

test.describe("AC-10: Signed-in user's message appears in their account messages", { tag: '@REQ-contact-form' }, () => {
  test(
    "positive: account messages page listing the user's message",
    { tag: ['@AC-10', '@TC-029'], annotation: { type: 'issue', description: 'DEF-004' } },
    async ({ page, api, workerUser }, testInfo) => {
      // Arrange: one message of the worker user's own, through the API (real send: one)
      const marker = `apf-${randomUUID().slice(0, 8)}`;
      const sent = await api.post('/messages', {
        headers: { Authorization: `Bearer ${workerUser.token}` },
        data: { subject: 'customer-service', message: `QA ${marker} automated test message for the account list. Please ignore.` },
      });
      expect(sent.status()).toBe(200);

      await signInAs(page.context(), workerUser);
      await page.goto('/account/messages');
      await expect(page.getByRole('row').filter({ hasText: marker })).toBeVisible();

      expect(withoutKnown(await scanWcag(page, testInfo), KNOWN)).toEqual([]);
    },
  );
});
