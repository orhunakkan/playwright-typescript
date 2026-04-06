import { faker } from '@faker-js/faker';

export const noteCategories = ['Home', 'Work', 'Personal'] as const;
export type NoteCategory = (typeof noteCategories)[number];

/** Payload for a PostgREST POST /users request (no id or timestamps — DB generates those). */
export const generateDbUserPayload = () => ({
  name: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
});

/** Payload for a PostgREST POST /notes request. */
export const generatePostgRestNotePayload = (userId: string) => ({
  title: faker.lorem.sentence({ min: 3, max: 5 }),
  description: faker.lorem.paragraph(),
  category: faker.helpers.arrayElement(noteCategories),
  user_id: userId,
});

/** XSS and SQL-injection payload — used by the sanitization spec. */
export const xssNotePayload = (userId: string) => ({
  title: '<script>alert("xss")</script>',
  description: "'; DROP TABLE notes; --",
  category: 'Personal' as NoteCategory,
  user_id: userId,
});
