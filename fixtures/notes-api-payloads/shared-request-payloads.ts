import { faker } from '@faker-js/faker';
import { expect } from '@playwright/test';

export const contentTypeHeaders = {
  'Content-Type': 'application/json',
};

export const getAuthHeaders = (authToken: string) => ({
  'Content-Type': 'application/json',
  'x-auth-token': authToken,
});

export const generateRegisterPayload = () => ({
  name: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
  password: faker.internet.password({ length: 10, prefix: 'Test@' }),
});

export const generateLoginPayload = (email: string, password: string) => ({
  email,
  password,
});

export const expectObjectKeys = (obj: object, expectedKeys: string[]) => {
  expect(Object.keys(obj).sort()).toEqual(expectedKeys.sort());
};
