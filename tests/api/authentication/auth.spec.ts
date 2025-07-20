import { test, expect } from '@playwright/test';
import {
  generateUserPayload,
  generateLoginPayload,
  generateAuthHeaders,
  getInvalidToken,
  getInvalidCredentials,
} from '../../../utilities/api-dynamic-content';

const baseURL = 'http://localhost:3000';

let testUser: { username: string; password: string; email: string };
let authToken: string;
let userId: number;

test.describe('Authentication API Tests', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(() => {
    testUser = generateUserPayload();
  });

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
    const response = await request.post(`${baseURL}/api/auth/login`, { data: generateLoginPayload(testUser) });
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('token');
    expect(responseBody).toHaveProperty('user');
    authToken = responseBody.token;
  });

  test('Get User Profile', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/auth/profile`, { headers: generateAuthHeaders(authToken) });
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('user');
    expect(responseBody.user).toHaveProperty('id');
    expect(responseBody.user.username).toBe(testUser.username);
    expect(responseBody.user.email).toBe(testUser.email);
  });

  test('Refresh Token', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/auth/refresh`, { headers: generateAuthHeaders(authToken) });
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('token');
    authToken = responseBody.token;
  });

  test('Invalid Login Credentials', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/auth/login`, { data: getInvalidCredentials() });
    expect(response.status()).toBe(401);
  });

  test('Invalid Token', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/auth/profile`, { headers: getInvalidToken() });
    expect(response.status()).toBe(403);
  });

  test('Cleanup - Delete User', async ({ request }) => {
    const response = await request.delete(`${baseURL}/api/users/${userId}`, { headers: generateAuthHeaders(authToken) });
    expect(response.status()).toBe(200);
  });
});
