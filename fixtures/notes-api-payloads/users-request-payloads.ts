import { faker } from '@faker-js/faker';

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

export const generateUpdateProfilePayload = (currentName: string) => ({
  name: `${currentName}-updated`,
  phone: faker.string.numeric(10),
  company: faker.company.name(),
});

export const generateForgotPasswordPayload = (email: string) => ({
  email,
});
