import { test, expect } from '@playwright/test';
import { config } from '../../config/env';
import { contentTypeHeaders, getAuthHeaders, generateRegisterPayload, generateLoginPayload, generateNotePayload } from '../../fixtures/notes-api-payloads/notes-request-payloads';
import { expectMatchesSchema, ErrorResponseSchema } from '../../utilities/api-schema-validator';
import { feature, story, severity } from 'allure-js-commons';

test.describe.configure({ mode: 'serial' });

test.describe('Notes Notes API Error Handling', { tag: ['@regression'] }, () => {
  test.beforeEach(async () => {
    await feature('Notes API');
    await story('Notes CRUD – Error Handling');
    await severity('normal');
  });

  const registerUrl = `${config.apiUrl}/users/register`;
  const loginUrl = `${config.apiUrl}/users/login`;
  const notesUrl = `${config.apiUrl}/notes`;

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

  test('should return 401 when creating a note without auth token', async ({ request }) => {
    const response = await request.post(notesUrl, {
      data: generateNotePayload(),
      headers: contentTypeHeaders,
    });

    expect(response.status()).toBe(401);
    const responseBody = await response.json();
    expectMatchesSchema(responseBody, ErrorResponseSchema, '401 no token');
    expect(responseBody).toHaveProperty('success', false);
    expect(responseBody).toHaveProperty('status', 401);
  });

  test('should return 401 when creating a note with invalid auth token', async ({ request }) => {
    const response = await request.post(notesUrl, {
      data: generateNotePayload(),
      headers: getAuthHeaders('invalid-token-value'),
    });

    expect(response.status()).toBe(401);
    const responseBody = await response.json();
    expectMatchesSchema(responseBody, ErrorResponseSchema, '401 invalid token');
    expect(responseBody).toHaveProperty('success', false);
    expect(responseBody).toHaveProperty('status', 401);
  });

  test('should return 400 when creating a note with missing title', async ({ request }) => {
    const response = await request.post(notesUrl, {
      data: { description: 'A note without title', category: 'Home' },
      headers: getAuthHeaders(authToken),
    });

    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expectMatchesSchema(responseBody, ErrorResponseSchema, '400 missing title');
    expect(responseBody).toHaveProperty('success', false);
    expect(responseBody).toHaveProperty('status', 400);
  });

  test('should return 400 when creating a note with invalid category', async ({ request }) => {
    const response = await request.post(notesUrl, {
      data: { title: 'Test Note', description: 'A note with invalid category', category: 'InvalidCategory' },
      headers: getAuthHeaders(authToken),
    });

    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expectMatchesSchema(responseBody, ErrorResponseSchema, '400 invalid category');
    expect(responseBody).toHaveProperty('success', false);
    expect(responseBody).toHaveProperty('status', 400);
  });

  test('should return 401 when retrieving all notes without auth token', async ({ request }) => {
    const response = await request.get(notesUrl, {
      headers: contentTypeHeaders,
    });

    expect(response.status()).toBe(401);
    const responseBody = await response.json();
    expectMatchesSchema(responseBody, ErrorResponseSchema, '401 list no token');
    expect(responseBody).toHaveProperty('success', false);
    expect(responseBody).toHaveProperty('status', 401);
  });

  test('should return 404 when retrieving a non-existent note', async ({ request }) => {
    const response = await request.get(`${notesUrl}/6489a0cee4b0000000000000`, {
      headers: getAuthHeaders(authToken),
    });

    expect(response.status()).toBe(404);
    const responseBody = await response.json();
    expectMatchesSchema(responseBody, ErrorResponseSchema, '404 non-existent note');
    expect(responseBody).toHaveProperty('success', false);
  });

  test('should return 400 when updating a non-existent note', async ({ request }) => {
    const response = await request.put(`${notesUrl}/6489a0cee4b0000000000000`, {
      data: generateNotePayload(),
      headers: getAuthHeaders(authToken),
    });

    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expectMatchesSchema(responseBody, ErrorResponseSchema, '400 update non-existent');
    expect(responseBody).toHaveProperty('success', false);
  });

  test('should return 404 when deleting a non-existent note', async ({ request }) => {
    const response = await request.delete(`${notesUrl}/6489a0cee4b0000000000000`, {
      headers: getAuthHeaders(authToken),
    });

    expect(response.status()).toBe(404);
    const responseBody = await response.json();
    expectMatchesSchema(responseBody, ErrorResponseSchema, '404 delete non-existent');
    expect(responseBody).toHaveProperty('success', false);
  });

  test('should return 404 when retrieving a note after deletion', async ({ request }) => {
    const createResponse = await request.post(notesUrl, {
      data: generateNotePayload(),
      headers: getAuthHeaders(authToken),
    });
    expect(createResponse.status()).toBe(200);
    const createBody = await createResponse.json();
    const noteId = createBody.data.id;

    const deleteResponse = await request.delete(`${notesUrl}/${noteId}`, {
      headers: getAuthHeaders(authToken),
    });
    expect(deleteResponse.status()).toBe(200);

    const getResponse = await request.get(`${notesUrl}/${noteId}`, {
      headers: getAuthHeaders(authToken),
    });
    expect(getResponse.status()).toBe(404);
    const responseBody = await getResponse.json();
    expectMatchesSchema(responseBody, ErrorResponseSchema, '404 after deletion');
    expect(responseBody).toHaveProperty('success', false);
  });
});
