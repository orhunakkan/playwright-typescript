import { test, expect } from '@playwright/test';
import {
  generateUserPayload,
  generateCategoryPayload,
  generateTodoPayload,
  generateLoginPayload,
  generateAuthHeaders,
} from '../../../utilities/api-dynamic-content';

const baseURL = 'http://localhost:3000';

let testUser: { username: string; password: string; email: string };
let testCategory: { name: string; description: string; color: string };
let testTodo: { title: string; description: string; priority: string };
let authToken: string;
let userId: number;
let categoryId: number;
let todoId: number;

test.describe('Statistics API Tests', () => {
  test.describe.configure({ mode: 'serial' });

  // Setup: Create user, category, todo and get auth token
  test.beforeAll(async ({ request }) => {
    testUser = generateUserPayload();
    testCategory = generateCategoryPayload();
    testTodo = generateTodoPayload();
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

    // Create category
    const categoryResponse = await request.post(`${baseURL}/api/categories`, {
      headers: generateAuthHeaders(authToken),
      data: testCategory,
    });
    expect(categoryResponse.status()).toBe(201);
    const categoryBody = await categoryResponse.json();
    categoryId = categoryBody.category.id;

    // Create todo
    const todoData = {
      ...testTodo,
      category_id: categoryId,
    };
    const todoResponse = await request.post(`${baseURL}/api/todos`, {
      headers: generateAuthHeaders(authToken),
      data: todoData,
    });
    expect(todoResponse.status()).toBe(201);
    const todoBody = await todoResponse.json();
    todoId = todoBody.todo.id;
  });

  test('Overview Statistics', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/stats/overview`);
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('overview');
    expect(responseBody.overview).toHaveProperty('total_users');
    expect(responseBody.overview).toHaveProperty('total_categories');
    expect(responseBody.overview).toHaveProperty('total_todos');
    expect(typeof responseBody.overview.total_users).toBe('string');
    expect(typeof responseBody.overview.total_categories).toBe('string');
    expect(typeof responseBody.overview.total_todos).toBe('string');
  });

  test('Todo Statistics', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/stats/todos`);
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toBeDefined();
  });

  test('Todo Statistics with User Filter', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/stats/todos?user_id=${userId}`);
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toBeDefined();
  });

  test('Todo Statistics with Category Filter', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/stats/todos?category_id=${categoryId}`);
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toBeDefined();
  });

  test('Todo Statistics (Basic)', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/stats/todos`);
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toBeDefined();
    expect(responseBody).toHaveProperty('basic_stats');
    expect(responseBody).toHaveProperty('by_category');
    expect(responseBody).toHaveProperty('monthly_trends');
    expect(responseBody).toHaveProperty('top_users');
  });

  test('User Statistics', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/stats/users`);
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toBeDefined();
    expect(responseBody).toHaveProperty('summary');
    expect(responseBody).toHaveProperty('user_activity');
    expect(responseBody).toHaveProperty('registration_trends');
    expect(responseBody).toHaveProperty('most_active_users');
  });

  test('Category Statistics', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/stats/categories`);
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toBeDefined();
    expect(responseBody).toHaveProperty('category_stats');
    expect(responseBody).toHaveProperty('uncategorized_todos');
    expect(responseBody).toHaveProperty('category_trends');
  });

  // Cleanup
  test.afterAll(async ({ request }) => {
    // Delete todo
    await request.delete(`${baseURL}/api/todos/${todoId}`, {
      headers: generateAuthHeaders(authToken),
    });

    // Delete category
    await request.delete(`${baseURL}/api/categories/${categoryId}`, {
      headers: generateAuthHeaders(authToken),
    });

    // Delete user
    await request.delete(`${baseURL}/api/users/${userId}`, {
      headers: generateAuthHeaders(authToken),
    });
  });
});
