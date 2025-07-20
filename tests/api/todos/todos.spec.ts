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

test.describe('Todos API Tests', () => {
  test.describe.configure({ mode: 'serial' });

  // Setup: Create user, category and get auth token
  test.beforeAll(async ({ request }) => {
    testUser = generateUserPayload();
    testCategory = generateCategoryPayload();
    testTodo = generateTodoPayload();
    // Register user
    const registerResponse = await request.post(`${baseURL}/api/auth/register`, { data: testUser });
    expect(registerResponse.status()).toBe(201);
    const registerBody = await registerResponse.json();
    userId = registerBody.user.id;
    // Login to get token
    const loginResponse = await request.post(`${baseURL}/api/auth/login`, { data: generateLoginPayload(testUser) });
    expect(loginResponse.status()).toBe(200);
    const loginBody = await loginResponse.json();
    authToken = loginBody.token;
    // Create category
    const categoryResponse = await request.post(`${baseURL}/api/categories`, { headers: generateAuthHeaders(authToken), data: testCategory });
    expect(categoryResponse.status()).toBe(201);
    const categoryBody = await categoryResponse.json();
    categoryId = categoryBody.category.id;
  });

  test('Create Todo', async ({ request }) => {
    const todoData = { ...testTodo, category_id: categoryId };
    const response = await request.post(`${baseURL}/api/todos`, { headers: generateAuthHeaders(authToken), data: todoData });
    expect(response.status()).toBe(201);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('todo');
    expect(responseBody.todo).toHaveProperty('id');
    expect(responseBody.todo.title).toBe(testTodo.title);
    expect(responseBody.todo.description).toBe(testTodo.description);
    expect(responseBody.todo.priority).toBe(testTodo.priority);
    expect(responseBody.todo.category_id).toBe(categoryId);
    todoId = responseBody.todo.id;
  });

  test('Get All Todos', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/todos`);
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('todos');
    expect(Array.isArray(responseBody.todos)).toBe(true);
    expect(responseBody.todos.length).toBeGreaterThan(0);
  });

  test('Get Todos with Filters', async ({ request }) => {
    // Test priority filter
    const priorityResponse = await request.get(`${baseURL}/api/todos?priority=high`);
    expect(priorityResponse.status()).toBe(200);
    // Test completion filter
    const completionResponse = await request.get(`${baseURL}/api/todos?completed=false`);
    expect(completionResponse.status()).toBe(200);
    // Test category filter
    const categoryResponse = await request.get(`${baseURL}/api/todos?category_id=${categoryId}`);
    expect(categoryResponse.status()).toBe(200);
    // Test user filter
    const userResponse = await request.get(`${baseURL}/api/todos?user_id=${userId}`);
    expect(userResponse.status()).toBe(200);
    // Test pagination
    const paginationResponse = await request.get(`${baseURL}/api/todos?limit=5&offset=0`);
    expect(paginationResponse.status()).toBe(200);
  });

  test('Get Todo by ID', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/todos/${todoId}`);
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('todo');
    expect(responseBody.todo).toHaveProperty('id', todoId);
    expect(responseBody.todo.title).toBe(testTodo.title);
  });

  test('Update Todo', async ({ request }) => {
    const updateData = {
      title: 'Updated title',
      description: 'Updated description',
      completed: true,
      priority: 'medium',
    };

    const response = await request.put(`${baseURL}/api/todos/${todoId}`, {
      headers: generateAuthHeaders(authToken),
      data: updateData,
    });

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('todo');
    expect(responseBody.todo.title).toBe(updateData.title);
    expect(responseBody.todo.description).toBe(updateData.description);
    expect(responseBody.todo.completed).toBe(updateData.completed);
    expect(responseBody.todo.priority).toBe(updateData.priority);
  });

  test('Mark Todo Complete', async ({ request }) => {
    const response = await request.patch(`${baseURL}/api/todos/${todoId}/complete`, {
      headers: generateAuthHeaders(authToken),
    });

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('todo');
    expect(responseBody.todo.completed).toBe(true);
  });

  test('Mark Todo Incomplete', async ({ request }) => {
    const response = await request.patch(`${baseURL}/api/todos/${todoId}/incomplete`, {
      headers: generateAuthHeaders(authToken),
    });

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('todo');
    expect(responseBody.todo.completed).toBe(false);
  });

  test('Unauthorized Access - Create Todo without Token', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/todos`, {
      data: testTodo,
    });
    expect(response.status()).toBe(401);
  });

  test('Missing Required Fields', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/todos`, {
      headers: generateAuthHeaders(authToken),
      data: {
        description: 'Missing title',
      },
    });
    expect(response.status()).toBe(400);
  });

  test('Get Invalid Todo ID', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/todos/99999`);
    expect(response.status()).toBe(404);
  });

  test('Delete Todo', async ({ request }) => {
    const response = await request.delete(`${baseURL}/api/todos/${todoId}`, {
      headers: generateAuthHeaders(authToken),
    });

    expect(response.status()).toBe(200);
  });

  test('Verify Todo Deletion', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/todos/${todoId}`);
    expect(response.status()).toBe(404);
  });

  // Cleanup
  test.afterAll(async ({ request }) => {
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
