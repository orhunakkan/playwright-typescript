import { faker } from '@faker-js/faker';

export { contentTypeHeaders, getAuthHeaders, generateRegisterPayload, generateLoginPayload } from './shared-request-payloads';

export const noteCategories = ['Home', 'Work', 'Personal'];

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
