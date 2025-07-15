import { test, expect } from '@playwright/test';
import { generateUserPayload, generateCategoryPayload } from '../../../utilities/api-dynamic-content';

const baseURL = 'http://localhost:3000';

let testUser: any;
let testCategory: any;
let authToken: string;
let userId: number;
let categoryId: number;

test.describe('Categories API Tests', () => {
  test.describe.configure({ mode: 'serial' });

  // Setup: Create user and get auth token
  test.beforeAll(async ({ request }) => {
    testUser = generateUserPayload();
    testCategory = generateCategoryPayload();
    // Register user
    const registerResponse = await request.post(`${baseURL}/api/auth/register`, {
      data: testUser,
    });
    expect(registerResponse.status()).toBe(201);
    const registerBody = await registerResponse.json();
    userId = registerBody.user.id;

    // Login to get token
    const loginResponse = await request.post(`${baseURL}/api/auth/login`, {
      data: {
        username: testUser.username,
        password: testUser.password,
      },
    });
    expect(loginResponse.status()).toBe(200);
    const loginBody = await loginResponse.json();
    authToken = loginBody.token;
  });

  test('Create Category', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/categories`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: testCategory,
    });

    expect(response.status()).toBe(201);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('category');
    expect(responseBody.category).toHaveProperty('id');
    expect(responseBody.category.name).toBe(testCategory.name);
    expect(responseBody.category.description).toBe(testCategory.description);
    expect(responseBody.category.color).toBe(testCategory.color);

    categoryId = responseBody.category.id;
  });

  test('Get All Categories', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/categories`);
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('categories');
    expect(Array.isArray(responseBody.categories)).toBe(true);
    expect(responseBody.categories.length).toBeGreaterThan(0);
  });

  test('Get All Categories with Pagination', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/categories?limit=10&offset=0`);
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('categories');
    expect(Array.isArray(responseBody.categories)).toBe(true);
  });

  test('Get Category by ID', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/categories/${categoryId}`);
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('category');
    expect(responseBody.category).toHaveProperty('id', categoryId);
    expect(responseBody.category.name).toBe(testCategory.name);
  });

  test('Update Category', async ({ request }) => {
    const updateData = {
      name: `Updated_Work_${Date.now()}`,
      color: '#ff0000',
    };

    const response = await request.put(`${baseURL}/api/categories/${categoryId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: updateData,
    });

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('category');
    expect(responseBody.category.name).toBe(updateData.name);
    expect(responseBody.category.color).toBe(updateData.color);
  });

  test('Get Invalid Category ID', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/categories/99999`);
    expect(response.status()).toBe(404);
  });

  test('Delete Category', async ({ request }) => {
    const response = await request.delete(`${baseURL}/api/categories/${categoryId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status()).toBe(200);
  });

  test('Verify Category Deletion', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/categories/${categoryId}`);
    expect(response.status()).toBe(404);
  });

  // Cleanup
  test.afterAll(async ({ request }) => {
    // Delete user
    await request.delete(`${baseURL}/api/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  });
});
