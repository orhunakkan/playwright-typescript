// The one `test`/`expect` every spec imports. Never import them from '@playwright/test' in specs.
import { test as base, expect, type APIRequestContext } from '@playwright/test';
import { env } from '../config/env.ts';
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

export { expect };
