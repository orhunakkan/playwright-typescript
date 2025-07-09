import { test, expect } from '@playwright/test';

const baseURL = 'http://localhost:3000';

test.describe('Health API Tests', () => {
  test('Server Health Check', async ({ request }) => {
    const response = await request.get(`${baseURL}/health`);
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('status');
  });

  test('API Information', async ({ request }) => {
    const response = await request.get(`${baseURL}/`);
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toBeDefined();
  });
});
