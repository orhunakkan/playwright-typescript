// The one `test`/`expect` every spec imports. Never import them from '@playwright/test' in specs.
import { test as base, expect as baseExpect, type APIRequestContext, type APIResponse } from '@playwright/test';
import { env } from '../config/env.ts';
import { contractViolations } from '../utilities/contract.ts';
import { registerUser, type TestUser } from '../utilities/users.ts';

type TestFixtures = {
  /** API client on API_URL, usable from any project (e.g. to arrange data before a UI test). */
  api: APIRequestContext;
};

type WorkerFixtures = {
  /** A fresh registered user per worker, for tests that change account state or try bad credentials. */
  workerUser: TestUser;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  api: async ({ playwright }, use) => {
    const api = await playwright.request.newContext({ baseURL: env.apiUrl });
    await use(api);
    await api.dispose();
  },

  workerUser: [
    async ({ playwright }, use, workerInfo) => {
      const api = await playwright.request.newContext({ baseURL: env.apiUrl });
      const user = await registerUser(api, `w${workerInfo.workerIndex}`);
      await api.dispose();
      await use(user);
    },
    { scope: 'worker' },
  ],
});

export const expect = baseExpect.extend({
  /** Asserts status + JSON body conform to the pinned OpenAPI contract for `method path` (path template). */
  async toMatchContract(response: APIResponse, method: string, path: string) {
    const name = 'toMatchContract';
    const status = response.status();
    const body = status === 204 ? undefined : await response.json().catch(() => undefined);
    const violations = contractViolations(method, path, status, body);
    const pass = violations.length === 0;
    const where = `${method.toUpperCase()} ${path} → ${status}`;
    return {
      name,
      pass,
      message: () =>
        pass
          ? `${this.utils.matcherHint(name, undefined, undefined, { isNot: this.isNot })}\n\n${where} conforms to the contract`
          : `${this.utils.matcherHint(name, undefined, undefined, { isNot: this.isNot })}\n\n${where} violates the contract:\n  - ${violations.join('\n  - ')}`,
    };
  },
});
