import { test, expect } from '@playwright/test';
import { generateUserPayload, generateLoginPayload, generateAuthHeaders } from '../../../utilities/api-dynamic-content';

const baseURL = 'http://localhost:3000';

let testUser: { username: string; password: string; email: string };
let authToken: string;
let userId: number;

test.describe('User Management API Tests', () => {
  test.describe.configure({ mode: 'serial' });

  // Setup: Create user and get auth token
  test.beforeAll(async ({ request }) => {
    testUser = generateUserPayload();
    // Register user
    const registerResponse = await request.post(`${baseURL}/api/auth/register`, {
      data: testUser,
    });
    expect(registerResponse.status()).toBe(201);
    const registerBody = await registerResponse.json();
    userId = registerBody.user.id;

    // Login to get token
    const loginResponse = await request.post(`${baseURL}/api/auth/login`, {
      data: generateLoginPayload(testUser),
    });
    expect(loginResponse.status()).toBe(200);
    const loginBody = await loginResponse.json();
    authToken = loginBody.token;
  });

  test('Get All Users', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/users`);
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('users');
    expect(Array.isArray(responseBody.users)).toBe(true);
    expect(responseBody.users.length).toBeGreaterThan(0);
  });

  test('Get All Users with Pagination', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/users?limit=5&offset=0`);
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('users');
    expect(Array.isArray(responseBody.users)).toBe(true);
  });

  test('Get User by ID', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/users/${userId}`);
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('user');
    expect(responseBody.user).toHaveProperty('id', userId);
    expect(responseBody.user.username).toBe(testUser.username);
  });

  test('Update User', async ({ request }) => {
    const updateData = {
      first_name: 'Updated',
      last_name: 'Name',
      email: `updated_${Date.now()}@example.com`,
    };

    const response = await request.put(`${baseURL}/api/users/${userId}`, {
      headers: generateAuthHeaders(authToken),
      data: updateData,
    });

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('user');
    expect(responseBody.user.first_name).toBe(updateData.first_name);
    expect(responseBody.user.last_name).toBe(updateData.last_name);
    expect(responseBody.user.email).toBe(updateData.email);
  });

  test('Get Invalid User ID', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/users/99999`);
    expect(response.status()).toBe(404);
  });

  test('Delete User', async ({ request }) => {
    const response = await request.delete(`${baseURL}/api/users/${userId}`, {
      headers: generateAuthHeaders(authToken),
    });

    expect(response.status()).toBe(200);
  });

  test('Verify User Deletion', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/users/${userId}`);
    expect(response.status()).toBe(404);
  });
});
