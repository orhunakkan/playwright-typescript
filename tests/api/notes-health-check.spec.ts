import { test, expect } from '@playwright/test';
import { expectMatchesSchema, HealthCheckSchema } from '../../utilities/api-schema-validator';
import { config } from '../../config/env';

test.describe('Notes Health Check API @smoke @critical', () => {
  const apiUrl = `${config.apiUrl}/health-check`;

  test('should return a successful health check response', async ({ request }) => {
    const response = await request.get(apiUrl);
    const responseBody = await response.json();
    expect(response.status()).toBe(200);
    expectMatchesSchema(responseBody, HealthCheckSchema, 'health check');
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody).toHaveProperty('message', 'Notes API is Running');
  });
});
