import { faker } from '@faker-js/faker';

export const noteCategories = ['Home', 'Work', 'Personal'];

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

export const generateNotePayload = () => ({
  title: faker.lorem.sentence({ min: 3, max: 5 }),
  description: faker.lorem.paragraph(),
  category: faker.helpers.arrayElement(noteCategories),
});

export const generateUpdateNotePayload = () => ({
  title: faker.lorem.sentence({ min: 3, max: 5 }),
  description: faker.lorem.paragraph(),
  completed: faker.datatype.boolean(),
  category: faker.helpers.arrayElement(noteCategories),
});
