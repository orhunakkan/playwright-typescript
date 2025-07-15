import { faker } from '@faker-js/faker';

export const generateDynamicTextInput = () => {
  return faker.lorem.words(3).toUpperCase();
};

export const generateDynamicPasswordInput = () => {
  return faker.internet.password();
};

export const generateDynamicTextArea = () => {
  return faker.lorem.paragraphs(2);
};
