import { test, expect } from '@playwright/test';

test.describe('Notes Health Check API', () => {
  const apiUrl = `${process.env.API_URL}/health-check`;

  test('should return a successful health check response', async ({ request }) => {
    const response = await request.get(apiUrl);
    const responseBody = await response.json();
    expect(response.status()).toBe(200);
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody).toHaveProperty('message', 'Notes API is Running');
  });
});
