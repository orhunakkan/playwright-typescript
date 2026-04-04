import { test, expect } from '@playwright/test';
import {
  contentTypeHeaders,
  getAuthHeaders,
  generateRegisterPayload,
  generateLoginPayload,
  generateUpdateProfilePayload,
  generateForgotPasswordPayload,
} from '../../fixtures/notes-api-payloads/users-request-payloads';
import type { ApiResponse, UserData, LoginData, UserProfileData } from '../../fixtures/notes-api-payloads/api-types';
import { expectMatchesSchema, UserDataSchema, LoginDataSchema, UserProfileDataSchema, ErrorResponseSchema } from '../../utilities/api-schema-validator';

test.describe.configure({ mode: 'serial' });

test.describe('Notes Users API Flow', () => {
  const registerUrl = `${process.env.PRACTICE_API_URL}/users/register`;
  const loginUrl = `${process.env.PRACTICE_API_URL}/users/login`;
  const profileUrl = `${process.env.PRACTICE_API_URL}/users/profile`;
  const forgotPasswordUrl = `${process.env.PRACTICE_API_URL}/users/forgot-password`;
  const logoutUrl = `${process.env.PRACTICE_API_URL}/users/logout`;

  let registeredUser: { name: string; email: string; password: string; phone?: string; company?: string } = {
    name: '',
    email: '',
    password: '',
  };
  let authToken = '';

  const registerPayload = generateRegisterPayload();
  const loginPayload = generateLoginPayload(registerPayload.email, registerPayload.password);

  test('should register a new user successfully', async ({ request }) => {
    registeredUser = registerPayload;

    const response = await request.post(registerUrl, {
      data: registerPayload,
      headers: contentTypeHeaders,
    });

    const responseBody = (await response.json()) as ApiResponse<UserData>;
    expect(response.status()).toBe(201);
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody).toHaveProperty('status', 201);
    expect(responseBody).toHaveProperty('message', 'User account created successfully');
    expect(responseBody).toHaveProperty('data');
    expectMatchesSchema(responseBody.data, UserDataSchema, 'register data');
    expect(responseBody.data).toHaveProperty('name', registerPayload.name);
    expect(responseBody.data).toHaveProperty('email', registerPayload.email);
  });

  test('should login with the registered user successfully', async ({ request }) => {
    const response = await request.post(loginUrl, {
      data: loginPayload,
      headers: contentTypeHeaders,
    });

    const responseBody = (await response.json()) as ApiResponse<LoginData>;
    expect(response.status()).toBe(200);
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody).toHaveProperty('status', 200);
    expect(responseBody).toHaveProperty('message', 'Login successful');
    expect(responseBody).toHaveProperty('data');
    expectMatchesSchema(responseBody.data, LoginDataSchema, 'login data');
    expect(responseBody.data).toHaveProperty('name', registeredUser.name);
    expect(responseBody.data).toHaveProperty('email', registeredUser.email);
    expect(responseBody.data).toHaveProperty('token');

    authToken = responseBody.data.token;
  });

  test('should get user profile with valid token', async ({ request }) => {
    const response = await request.get(profileUrl, {
      headers: getAuthHeaders(authToken),
    });

    const responseBody = (await response.json()) as ApiResponse<UserProfileData>;
    expect(response.status()).toBe(200);
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody).toHaveProperty('message', 'Profile successful');
    expect(responseBody).toHaveProperty('data');
    expectMatchesSchema(responseBody.data, UserProfileDataSchema, 'get profile data');
    expect(responseBody.data).toHaveProperty('name', registeredUser.name);
    expect(responseBody.data).toHaveProperty('email', registeredUser.email);
  });

  test('should update the user profile with name, phone, and company', async ({ request }) => {
    const updatedProfile = generateUpdateProfilePayload(registeredUser.name);

    const response = await request.patch(profileUrl, {
      data: updatedProfile,
      headers: getAuthHeaders(authToken),
    });

    const responseBody = (await response.json()) as ApiResponse<UserProfileData>;
    expect(response.status()).toBe(200);
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody).toHaveProperty('status', 200);
    expect(responseBody).toHaveProperty('message', 'Profile updated successful');
    expect(responseBody).toHaveProperty('data');
    expectMatchesSchema(responseBody.data, UserProfileDataSchema, 'update profile data');
    expect(responseBody.data).toHaveProperty('name', updatedProfile.name);
    expect(responseBody.data).toHaveProperty('email', registeredUser.email);
    expect(responseBody.data).toHaveProperty('phone', updatedProfile.phone);
    expect(responseBody.data).toHaveProperty('company', updatedProfile.company);

    registeredUser = { ...registeredUser, ...updatedProfile };
  });

  test('should send forgot password email with valid email address', async ({ request }) => {
    const forgotPasswordBody = generateForgotPasswordPayload(registeredUser.email);

    const response = await request.post(forgotPasswordUrl, {
      data: forgotPasswordBody,
      headers: contentTypeHeaders,
    });

    const responseBody = await response.json();
    expect(response.status()).toBe(200);
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody).toHaveProperty('message');
    expect(responseBody.message).toContain('Password reset link successfully sent to');
  });

  test('should logout with valid auth token', async ({ request }) => {
    const response = await request.delete(logoutUrl, {
      headers: getAuthHeaders(authToken),
    });

    const responseBody = await response.json();
    expect(response.status()).toBe(200);
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody).toHaveProperty('message', 'User has been successfully logged out');
  });

  test('should return 401 when using token after logout', async ({ request }) => {
    const response = await request.get(profileUrl, {
      headers: getAuthHeaders(authToken),
    });

    expect(response.status()).toBe(401);
    const responseBody = await response.json();
    expectMatchesSchema(responseBody, ErrorResponseSchema, 'post-logout 401');
    expect(responseBody).toHaveProperty('success', false);
  });
});
