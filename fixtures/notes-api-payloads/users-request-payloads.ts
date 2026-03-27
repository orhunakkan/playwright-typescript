import { faker } from '@faker-js/faker';

export { contentTypeHeaders, getAuthHeaders, generateRegisterPayload, generateLoginPayload, expectObjectKeys } from './shared-request-payloads';

export const generateUpdateProfilePayload = (currentName: string) => ({
  name: `${currentName}-updated`,
  phone: faker.string.numeric(10),
  company: faker.company.name(),
});

export const generateForgotPasswordPayload = (email: string) => ({
  email,
});
