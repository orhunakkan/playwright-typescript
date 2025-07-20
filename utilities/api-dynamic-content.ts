import { faker } from '@faker-js/faker';

// Utility for login payload
export function generateLoginPayload(user: { username: string; password: string }) {
  return {
    username: user.username,
    password: user.password,
  };
}

// Utility for authorization headers
export function generateAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export function getInvalidToken() {
  return {
    Authorization: 'Bearer invalid_token',
  };
}

export function getInvalidCredentials() {
  return {
    username: 'nonexistent',
    password: 'wrong',
  };
}

// Generate a realistic user payload
export function generateUserPayload() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${Date.now()}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}_${Date.now()}@example.com`;
  return {
    username,
    email,
    password: faker.internet.password({ length: 12, memorable: true }),
    first_name: firstName,
    last_name: lastName,
  };
}

// Generate a realistic category payload
export function generateCategoryPayload() {
  return {
    name: `${faker.word.adjective()}_${Date.now()}`,
    description: faker.lorem.sentence(),
    color: faker.color.rgb({ prefix: '#' }),
  };
}

// Generate a realistic todo payload
export function generateTodoPayload(categoryId?: number) {
  return {
    title: faker.lorem.words(3),
    description: faker.lorem.sentence(),
    priority: faker.helpers.arrayElement(['low', 'medium', 'high']),
    due_date: faker.date.soon({ days: 30 }).toISOString(),
    ...(categoryId ? { category_id: categoryId } : {}),
  };
}
