import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

let testUser: { email: string; password: string; name: string };

test.describe('Task Manager API Tests', () => {
  const baseUrl = 'http://localhost:8080/api';

  // Setup - Generate random test user data before all tests
  test.beforeAll(() => {
    testUser = {
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password({ length: 12, memorable: true })
    };
  });

  test('should register a new user', async ({ request }) => {
    // Register new user
    const registerResponse = await request.post(`${baseUrl}/users/register`, {
      data: testUser
    });

    // Verify response
    expect(registerResponse.status()).toBe(201);
    const responseBody = await registerResponse.json();
    expect(responseBody.status).toBe('success');
    expect(responseBody.message).toBe('User registered successfully');
  });

  test('should not login with invalid credentials', async ({ request }) => {
    // Try login with invalid password
    const invalidLoginResponse = await request.post(`${baseUrl}/users/login`, {
      data: {
        email: testUser.email,
        password: 'wrongpassword123'
      }
    });

    // Verify authentication failure
    expect(invalidLoginResponse.status()).toBe(401);
    const responseBody = await invalidLoginResponse.json();
    expect(responseBody.status).toBe('error');
    expect(responseBody.message).toBe('Invalid credentials');
  });

  test('should fail to create task without authentication', async ({ request }) => {
    // Try to create task without auth token
    const taskData = {
      title: faker.lorem.sentence({ min: 2, max: 5 }),
      description: faker.lorem.paragraph(),
      status: 'todo'
    };

    const response = await request.post(`${baseUrl}/tasks`, {
      data: taskData
    });

    // Verify authentication is required
    expect(response.status()).toBe(401);
  });

  test('should fail with expired/invalid token', async ({ request }) => {
    // Create an invalid token
    const invalidToken = 'invalid-signature';

    const response = await request.get(`${baseUrl}/tasks`, {
      headers: {
        Authorization: `Bearer ${invalidToken}`
      }
    });

    // Verify authentication failure
    expect(response.status()).toBe(401);
    const responseBody = await response.json();
    expect(responseBody.status).toBe('error');
    expect(responseBody.message).toBe('Invalid authentication token');
  });
});
