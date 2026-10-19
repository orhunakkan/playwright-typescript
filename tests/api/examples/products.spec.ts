import { randomUUID } from 'node:crypto';
import { test, expect } from '../../../fixtures/index.ts';

test.describe('products API', () => {
  test('positive: product list matches the contract', { tag: '@example' }, async ({ request }) => {
    const response = await request.get('/products');

    expect(response.status()).toBe(200);
    await expect(response).toMatchContract('GET', '/products');
    expect((await response.json()).data.length).toBeGreaterThan(0);
  });

  test('boundary: a page past the last page returns an empty list', { tag: '@example' }, async ({ request }) => {
    const { last_page: lastPage } = await (await request.get('/products')).json();

    const response = await request.get('/products', { params: { page: lastPage + 1 } });

    expect(response.status()).toBe(200);
    expect((await response.json()).data).toEqual([]);
  });

  // Known defect pattern: the check stays strict, the test is marked as an expected failure and points
  // at the finding. When the API is fixed Playwright reports "expected to fail, but passed".
  test(
    'boundary: an empty page matches the contract',
    { tag: '@example', annotation: { type: 'issue', description: 'finding: GET /products empty page returns from/to null; contract says integer' } },
    async ({ request }) => {
      test.fail();
      const { last_page: lastPage } = await (await request.get('/products')).json();

      const response = await request.get('/products', { params: { page: lastPage + 1 } });

      await expect(response).toMatchContract('GET', '/products');
    },
  );
});

test.describe('login API', () => {
  // One bad attempt on a user this run owns: never on shared accounts, which a few failures lock.
  test('negative: wrong password is rejected with 401', { tag: '@example' }, async ({ request, workerUser }) => {
    const response = await request.post('/users/login', { data: { email: workerUser.email, password: `${workerUser.password}-wrong` } });

    expect(response.status()).toBe(401);
  });

  test(
    'negative: the rejected-login response is documented in the contract',
    { tag: '@example', annotation: { type: 'issue', description: 'finding: POST /users/login returns 401 but the contract documents only 200' } },
    async ({ request }) => {
      test.fail();
      // An unknown email gets the same 401 without counting toward any real account's lockout.
      const response = await request.post('/users/login', { data: { email: `nobody-${randomUUID()}@example.com`, password: 'Wrong!Pass1' } });

      expect(response.status()).toBe(401);
      await expect(response).toMatchContract('POST', '/users/login');
    },
  );
});
