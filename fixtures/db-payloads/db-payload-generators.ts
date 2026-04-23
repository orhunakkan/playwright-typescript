import { faker } from '@faker-js/faker';

export const noteCategories = ['Home', 'Work', 'Personal'] as const;
export type NoteCategory = (typeof noteCategories)[number];
