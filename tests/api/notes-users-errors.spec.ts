import { test, expect } from '@playwright/test';
import { contentTypeHeaders, getAuthHeaders, generateRegisterPayload, generateLoginPayload, generateUpdateProfilePayload } from '../../fixtures/notes-api-payloads/users-request-payloads';

test.describe.configure({ mode: 'serial' });

test.describe('Notes Users API Error Handling', () => {
  const registerUrl = `${process.env.PRACTICE_API_URL}/users/register`;
  const loginUrl = `${process.env.PRACTICE_API_URL}/users/login`;
  const profileUrl = `${process.env.PRACTICE_API_URL}/users/profile`;
  const logoutUrl = `${process.env.PRACTICE_API_URL}/users/logout`;

  let authToken = '';

  const registerPayload = generateRegisterPayload();
  const loginPayload = generateLoginPayload(registerPayload.email, registerPayload.password);

  test('should register and login for error test setup', async ({ request }) => {
    const registerResponse = await request.post(registerUrl, {
      data: registerPayload,
      headers: contentTypeHeaders,
    });
    expect(registerResponse.status()).toBe(201);

    const loginResponse = await request.post(loginUrl, {
      data: loginPayload,
      headers: contentTypeHeaders,
    });
    expect(loginResponse.status()).toBe(200);

    const loginBody = await loginResponse.json();
    authToken = loginBody.data.token;
  });

  test('should return 409 when registering with an already used email', async ({ request }) => {
    const response = await request.post(registerUrl, {
      data: registerPayload,
      headers: contentTypeHeaders,
    });

    expect(response.status()).toBe(409);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', false);
    expect(responseBody).toHaveProperty('status', 409);
    expect(responseBody).toHaveProperty('message');
  });

  test('should return 401 when logging in with wrong password', async ({ request }) => {
    const response = await request.post(loginUrl, {
      data: generateLoginPayload(registerPayload.email, 'WrongPassword123!'),
      headers: contentTypeHeaders,
    });

    expect(response.status()).toBe(401);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', false);
    expect(responseBody).toHaveProperty('status', 401);
  });

  test('should return 401 when logging in with non-existent email', async ({ request }) => {
    const response = await request.post(loginUrl, {
      data: generateLoginPayload('nonexistent@fakeemail.test', 'SomePassword1!'),
      headers: contentTypeHeaders,
    });

    expect(response.status()).toBe(401);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', false);
    expect(responseBody).toHaveProperty('status', 401);
  });

  test('should return 401 when getting profile without auth token', async ({ request }) => {
    const response = await request.get(profileUrl, {
      headers: contentTypeHeaders,
    });

    expect(response.status()).toBe(401);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', false);
    expect(responseBody).toHaveProperty('status', 401);
  });

  test('should return 401 when getting profile with invalid auth token', async ({ request }) => {
    const response = await request.get(profileUrl, {
      headers: getAuthHeaders('invalid-token-value'),
    });

    expect(response.status()).toBe(401);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', false);
    expect(responseBody).toHaveProperty('status', 401);
  });

  test('should return 401 when updating profile without auth token', async ({ request }) => {
    const response = await request.patch(profileUrl, {
      data: generateUpdateProfilePayload('Test User'),
      headers: contentTypeHeaders,
    });

    expect(response.status()).toBe(401);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', false);
    expect(responseBody).toHaveProperty('status', 401);
  });

  test('should return 400 when registering with missing required field', async ({ request }) => {
    const response = await request.post(registerUrl, {
      data: { name: 'Test User', email: 'test@example.com' },
      headers: contentTypeHeaders,
    });

    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', false);
    expect(responseBody).toHaveProperty('status', 400);
  });

  test('should return 400 when registering with invalid email format', async ({ request }) => {
    const response = await request.post(registerUrl, {
      data: { name: 'Test User', email: 'not-an-email', password: 'Test@12345' },
      headers: contentTypeHeaders,
    });

    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', false);
    expect(responseBody).toHaveProperty('status', 400);
  });

  test('should return 401 when using token after logout', async ({ request }) => {
    const logoutResponse = await request.delete(logoutUrl, {
      headers: getAuthHeaders(authToken),
    });
    expect(logoutResponse.status()).toBe(200);

    const response = await request.get(profileUrl, {
      headers: getAuthHeaders(authToken),
    });

    expect(response.status()).toBe(401);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', false);
  });
});
