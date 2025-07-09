import { test, expect } from '@playwright/test';

const baseURL = 'http://localhost:3000';

const testUser = {
  username: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: 'password123',
  first_name: 'Test',
  last_name: 'User',
};

let authToken: string;
let userId: number;

test.describe('Authentication API Tests', () => {
  test.describe.configure({ mode: 'serial' });

  test('Register User', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/auth/register`, { data: testUser });
    expect(response.status()).toBe(201);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('user');
    expect(responseBody.user).toHaveProperty('id');
    expect(responseBody.user.username).toBe(testUser.username);
    expect(responseBody.user.email).toBe(testUser.email);

    userId = responseBody.user.id;
  });

  test('Login', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/auth/login`, {
      data: {
        username: testUser.username,
        password: testUser.password,
      },
    });

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('token');
    expect(responseBody).toHaveProperty('user');

    authToken = responseBody.token;
  });

  test('Get User Profile', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/auth/profile`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('user');
    expect(responseBody.user).toHaveProperty('id');
    expect(responseBody.user.username).toBe(testUser.username);
    expect(responseBody.user.email).toBe(testUser.email);
  });

  test('Refresh Token', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/auth/refresh`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('token');

    // Update token with refreshed one
    authToken = responseBody.token;
  });

  test('Invalid Login Credentials', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/auth/login`, {
      data: {
        username: 'nonexistent',
        password: 'wrong',
      },
    });
    expect(response.status()).toBe(401);
  });

  test('Invalid Token', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/auth/profile`, {
      headers: {
        Authorization: 'Bearer invalid_token',
      },
    });
    expect(response.status()).toBe(403);
  });

  test('Cleanup - Delete User', async ({ request }) => {
    const response = await request.delete(`${baseURL}/api/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status()).toBe(200);
  });
});
