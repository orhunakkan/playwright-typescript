import { test, expect } from '@playwright/test';
import {
  contentTypeHeaders,
  getAuthHeaders,
  generateRegisterPayload,
  generateLoginPayload,
  generateNotePayload,
  generateUpdateNotePayload,
} from '../../fixtures/notes-api-payloads/notes-request-payloads';

test.describe.configure({ mode: 'serial' });

test.describe('Notes Notes API Flow', () => {
  const registerUrl = `${process.env.API_URL}/users/register`;
  const loginUrl = `${process.env.API_URL}/users/login`;
  const notesUrl = `${process.env.API_URL}/notes`;

  let registeredUser: { name: string; email: string; password: string } = {
    name: '',
    email: '',
    password: '',
  };
  let authToken = '';
  let createdNoteId = '';

  const registerPayload = generateRegisterPayload();
  const loginPayload = generateLoginPayload(registerPayload.email, registerPayload.password);
  const firstNotePayload = generateNotePayload();
  const secondNotePayload = generateNotePayload();
  const updateNotePayload = generateUpdateNotePayload();

  test('should register a new user successfully', async ({ request }) => {
    registeredUser = registerPayload;

    const response = await request.post(registerUrl, {
      data: registerPayload,
      headers: contentTypeHeaders,
    });

    const responseBody = await response.json();
    expect(response.status()).toBe(201);
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody).toHaveProperty('status', 201);
    expect(responseBody).toHaveProperty('message', 'User account created successfully');
    expect(responseBody).toHaveProperty('data');
    expect(responseBody.data).toHaveProperty('id');
    expect(typeof responseBody.data.id).toBe('string');
    expect(responseBody.data).toHaveProperty('name', registerPayload.name);
    expect(responseBody.data).toHaveProperty('email', registerPayload.email);
  });

  test('should login with the registered user successfully', async ({ request }) => {
    const response = await request.post(loginUrl, {
      data: loginPayload,
      headers: contentTypeHeaders,
    });

    const responseBody = await response.json();
    expect(response.status()).toBe(200);
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody).toHaveProperty('status', 200);
    expect(responseBody).toHaveProperty('message', 'Login successful');
    expect(responseBody).toHaveProperty('data');
    expect(responseBody.data).toHaveProperty('id');
    expect(typeof responseBody.data.id).toBe('string');
    expect(responseBody.data).toHaveProperty('name', registeredUser.name);
    expect(responseBody.data).toHaveProperty('email', registeredUser.email);
    expect(responseBody.data).toHaveProperty('token');
    expect(typeof responseBody.data.token).toBe('string');

    authToken = responseBody.data.token;
  });

  test('should create a note with title, description, and category using auth token', async ({ request }) => {
    const response = await request.post(notesUrl, {
      data: firstNotePayload,
      headers: getAuthHeaders(authToken),
    });

    const responseBody = await response.json();
    expect(response.status()).toBe(200);
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody).toHaveProperty('message', 'Note successfully created');
    expect(responseBody).toHaveProperty('data');
    expect(responseBody.data).toHaveProperty('id');
    expect(typeof responseBody.data.id).toBe('string');
    expect(responseBody.data).toHaveProperty('title', firstNotePayload.title);
    expect(responseBody.data).toHaveProperty('description', firstNotePayload.description);
    expect(responseBody.data).toHaveProperty('category', firstNotePayload.category);
    expect(responseBody.data).toHaveProperty('completed', false);
    expect(responseBody.data).toHaveProperty('created_at');
    expect(typeof responseBody.data.created_at).toBe('string');
    expect(responseBody.data).toHaveProperty('updated_at');
    expect(typeof responseBody.data.updated_at).toBe('string');
    expect(responseBody.data).toHaveProperty('user_id');
    expect(typeof responseBody.data.user_id).toBe('string');

    createdNoteId = responseBody.data.id;
  });

  test('should create a second note with title, description, and category using auth token', async ({ request }) => {
    const response = await request.post(notesUrl, {
      data: secondNotePayload,
      headers: getAuthHeaders(authToken),
    });

    const responseBody = await response.json();
    expect(response.status()).toBe(200);
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody).toHaveProperty('message', 'Note successfully created');
    expect(responseBody).toHaveProperty('data');
    expect(responseBody.data).toHaveProperty('id');
    expect(typeof responseBody.data.id).toBe('string');
    expect(responseBody.data).toHaveProperty('title', secondNotePayload.title);
    expect(responseBody.data).toHaveProperty('description', secondNotePayload.description);
    expect(responseBody.data).toHaveProperty('category', secondNotePayload.category);
    expect(responseBody.data).toHaveProperty('completed', false);
    expect(responseBody.data).toHaveProperty('created_at');
    expect(typeof responseBody.data.created_at).toBe('string');
    expect(responseBody.data).toHaveProperty('updated_at');
    expect(typeof responseBody.data.updated_at).toBe('string');
    expect(responseBody.data).toHaveProperty('user_id');
    expect(typeof responseBody.data.user_id).toBe('string');
  });

  test('should retrieve note by ID with auth token', async ({ request }) => {
    const response = await request.get(`${notesUrl}/${createdNoteId}`, {
      headers: getAuthHeaders(authToken),
    });

    const responseBody = await response.json();
    expect(response.status()).toBe(200);
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody).toHaveProperty('message', 'Note successfully retrieved');
    expect(responseBody).toHaveProperty('data');
    expect(responseBody.data).toHaveProperty('id', createdNoteId);
    expect(responseBody.data).toHaveProperty('title', firstNotePayload.title);
    expect(responseBody.data).toHaveProperty('description', firstNotePayload.description);
    expect(responseBody.data).toHaveProperty('category', firstNotePayload.category);
    expect(responseBody.data).toHaveProperty('completed', false);
    expect(responseBody.data).toHaveProperty('created_at');
    expect(typeof responseBody.data.created_at).toBe('string');
    expect(responseBody.data).toHaveProperty('updated_at');
    expect(typeof responseBody.data.updated_at).toBe('string');
    expect(responseBody.data).toHaveProperty('user_id');
    expect(typeof responseBody.data.user_id).toBe('string');
  });

  test('should update note by ID with auth token', async ({ request }) => {
    const response = await request.put(`${notesUrl}/${createdNoteId}`, {
      data: updateNotePayload,
      headers: getAuthHeaders(authToken),
    });

    const responseBody = await response.json();
    expect(response.status()).toBe(200);
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody).toHaveProperty('message', 'Note successfully Updated');
    expect(responseBody).toHaveProperty('data');
    expect(responseBody.data).toHaveProperty('id', createdNoteId);
    expect(responseBody.data).toHaveProperty('title', updateNotePayload.title);
    expect(responseBody.data).toHaveProperty('description', updateNotePayload.description);
    expect(responseBody.data).toHaveProperty('category', updateNotePayload.category);
    expect(responseBody.data).toHaveProperty('completed', updateNotePayload.completed);
    expect(responseBody.data).toHaveProperty('created_at');
    expect(typeof responseBody.data.created_at).toBe('string');
    expect(responseBody.data).toHaveProperty('updated_at');
    expect(typeof responseBody.data.updated_at).toBe('string');
    expect(responseBody.data).toHaveProperty('user_id');
    expect(typeof responseBody.data.user_id).toBe('string');
  });

  test('should retrieve all notes with auth token', async ({ request }) => {
    const response = await request.get(notesUrl, {
      headers: getAuthHeaders(authToken),
    });

    const responseBody = await response.json();
    expect(response.status()).toBe(200);
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody).toHaveProperty('message', 'Notes successfully retrieved');
    expect(responseBody).toHaveProperty('data');
    expect(Array.isArray(responseBody.data)).toBe(true);
    expect(responseBody.data).toHaveLength(2);

    const notes = responseBody.data;

    const updatedNote = notes.find((note: any) => note.id === createdNoteId);
    expect(updatedNote).toBeDefined();
    expect(updatedNote).toHaveProperty('id');
    expect(typeof updatedNote.id).toBe('string');
    expect(updatedNote).toHaveProperty('title', updateNotePayload.title);
    expect(updatedNote).toHaveProperty('description', updateNotePayload.description);
    expect(updatedNote).toHaveProperty('completed', updateNotePayload.completed);
    expect(updatedNote).toHaveProperty('category', updateNotePayload.category);
    expect(updatedNote).toHaveProperty('created_at');
    expect(typeof updatedNote.created_at).toBe('string');
    expect(updatedNote).toHaveProperty('updated_at');
    expect(typeof updatedNote.updated_at).toBe('string');
    expect(updatedNote).toHaveProperty('user_id');
    expect(typeof updatedNote.user_id).toBe('string');

    const secondNote = notes.find((note: any) => note.id !== createdNoteId);
    expect(secondNote).toBeDefined();
    expect(secondNote).toHaveProperty('id');
    expect(typeof secondNote.id).toBe('string');
    expect(secondNote).toHaveProperty('title', secondNotePayload.title);
    expect(secondNote).toHaveProperty('description', secondNotePayload.description);
    expect(secondNote).toHaveProperty('completed', false);
    expect(secondNote).toHaveProperty('category', secondNotePayload.category);
  });

  test('should delete note by ID with auth token', async ({ request }) => {
    const response = await request.delete(`${notesUrl}/${createdNoteId}`, {
      headers: getAuthHeaders(authToken),
    });

    const responseBody = await response.json();
    expect(response.status()).toBe(200);
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody).toHaveProperty('message', 'Note successfully deleted');
  });
});
