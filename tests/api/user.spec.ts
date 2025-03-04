import { test, expect } from '@playwright/test';

// Base URL
const baseUrl = 'https://reqres.in/api';

test.describe('Reqres API Tests', () => {
  // Users Endpoints
  test.describe('Users', () => {
    test('List Users', async ({ request }) => {
      const response = await request.get(`${baseUrl}/users?page=2`);

      // Verify status code is 200
      expect(response.status()).toBe(200);

      // Additional assertions
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('page');
      expect(responseBody).toHaveProperty('data');
    });

    test('Single User - Found', async ({ request }) => {
      const response = await request.get(`${baseUrl}/users/2`);

      // Verify status code is 200
      expect(response.status()).toBe(200);

      // Additional assertions
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('data');
      expect(responseBody.data).toHaveProperty('id', 2);
    });

    test('Single User - Not Found', async ({ request }) => {
      const response = await request.get(`${baseUrl}/users/23`);

      // Verify status code is 404
      expect(response.status()).toBe(404);

      // Additional assertions
      const responseBody = await response.json();
      expect(responseBody).toEqual({});
    });

    test('Create User', async ({ request }) => {
      const userData = {
        name: 'morpheus',
        job: 'leader'
      };

      const response = await request.post(`${baseUrl}/users`, {
        data: userData
      });

      // Verify status code is 201
      expect(response.status()).toBe(201);

      // Response has id and createdAt
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('id');
      expect(responseBody).toHaveProperty('createdAt');
    });

    test('Update User - PUT', async ({ request }) => {
      const userData = {
        name: 'morpheus',
        job: 'zion resident'
      };

      const response = await request.put(`${baseUrl}/users/2`, {
        data: userData
      });

      // Verify status code is 200
      expect(response.status()).toBe(200);

      // Response has updatedAt
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('updatedAt');
    });

    test('Update User - PATCH', async ({ request }) => {
      const userData = {
        name: 'morpheus',
        job: 'zion resident'
      };

      const response = await request.patch(`${baseUrl}/users/2`, {
        data: userData
      });

      // Verify status code is 200
      expect(response.status()).toBe(200);

      // Response has updatedAt
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('updatedAt');
    });

    test('Delete User', async ({ request }) => {
      const response = await request.delete(`${baseUrl}/users/2`);

      // Verify status code is 204
      expect(response.status()).toBe(204);
    });

    test('List Users with Delay', async ({ request }) => {
      const response = await request.get(`${baseUrl}/users?delay=3`);

      // Verify status code is 200
      expect(response.status()).toBe(200);
    });
  });

  // Resources Endpoints
  test.describe('Resources', () => {
    test('List Resources', async ({ request }) => {
      const response = await request.get(`${baseUrl}/unknown`);

      // Verify status code is 200
      expect(response.status()).toBe(200);
    });

    test('Single Resource - Found', async ({ request }) => {
      const response = await request.get(`${baseUrl}/unknown/2`);

      // Verify status code is 200
      expect(response.status()).toBe(200);
    });

    test('Single Resource - Not Found', async ({ request }) => {
      const response = await request.get(`${baseUrl}/unknown/23`);

      // Verify status code is 404
      expect(response.status()).toBe(404);
    });
  });

  // Authentication Endpoints
  test.describe('Authentication', () => {
    test('Register - Successful', async ({ request }) => {
      const userData = {
        email: 'eve.holt@reqres.in',
        password: 'pistol'
      };

      const response = await request.post(`${baseUrl}/register`, {
        data: userData
      });

      // Verify status code is 200
      expect(response.status()).toBe(200);

      // Response has token and id
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('token');
      expect(responseBody).toHaveProperty('id');
    });

    test('Register - Unsuccessful', async ({ request }) => {
      const userData = {
        email: 'sydney@fife'
      };

      const response = await request.post(`${baseUrl}/register`, {
        data: userData
      });

      // Verify status code is 400
      expect(response.status()).toBe(400);

      // Response has error message
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('error');
    });

    test('Login - Successful', async ({ request }) => {
      const userData = {
        email: 'eve.holt@reqres.in',
        password: 'cityslicka'
      };

      const response = await request.post(`${baseUrl}/login`, {
        data: userData
      });

      // Verify status code is 200
      expect(response.status()).toBe(200);

      // Response has token
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('token');
    });

    test('Login - Unsuccessful', async ({ request }) => {
      const userData = {
        email: 'peter@klaven'
      };

      const response = await request.post(`${baseUrl}/login`, {
        data: userData
      });

      // Verify status code is 400
      expect(response.status()).toBe(400);

      // Response has error message
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('error');
    });
  });
});
