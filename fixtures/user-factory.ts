import { faker } from '@faker-js/faker';

export class UserFactory {
  static createUser() {
    return {
      name: faker.person.fullName(),
      job: faker.person.jobTitle()
    };
  }

  static registerSuccessful() {
    return {
      email: 'eve.holt@reqres.in', // Required by API
      password: faker.internet.password({ length: 10, memorable: true })
    };
  }

  static registerUnsuccessful() {
    return {
      email: faker.internet.email()
      // password intentionally missing
    };
  }

  static loginSuccessful() {
    return {
      email: 'eve.holt@reqres.in',
      password: 'cityslicka'
    };
  }

  static loginUnsuccessful() {
    return {
      email: faker.internet.email()
      // password intentionally missing
    };
  }
}
