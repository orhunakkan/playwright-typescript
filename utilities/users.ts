import { randomUUID } from 'node:crypto';
import type { APIRequestContext } from '@playwright/test';

// Storage state written by tests/setup/auth.setup.ts; opt in with test.use({ storageState: AUTH_FILE }).
export const AUTH_FILE = '.auth/user.json';

// Every user this framework creates has the same display name, so UI assertions can rely on it.
export const TEST_USER_NAME = { first: 'Apf', last: 'Tester' } as const;

export type TestUser = {
  email: string;
  password: string;
  token: string;
};

// Registers a fresh user through the API and logs it in. Seeded target accounts are never used:
// on a shared public target anyone can lock them (see SPEC.md decision 4).
export async function registerUser(api: APIRequestContext, label: string): Promise<TestUser> {
  const id = randomUUID().slice(0, 8);
  const email = `apf-${Date.now().toString(36)}-${label}-${id}@example.com`;
  // Policy from the register contract: upper, lower, number and symbol, min 8 chars.
  const password = `Apf!${id}x9`;

  const registered = await api.post('/users/register', {
    data: {
      first_name: TEST_USER_NAME.first,
      last_name: TEST_USER_NAME.last,
      email,
      password,
      dob: '1990-01-01',
      phone: '0612345678',
      address: { street: 'Test Street 1', city: 'Utrecht', state: 'Utrecht', country: 'NL', postal_code: '1234AA' },
    },
  });
  if (registered.status() !== 201) {
    throw new Error(`POST /users/register returned ${registered.status()}: ${await registered.text()}`);
  }

  const login = await api.post('/users/login', { data: { email, password } });
  if (!login.ok()) {
    throw new Error(`POST /users/login returned ${login.status()}: ${await login.text()}`);
  }
  const { access_token: token } = (await login.json()) as { access_token: string };

  return { email, password, token };
}
