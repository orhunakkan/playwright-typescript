import {faker} from '@faker-js/faker';

export const generateRandomFormData = () => {
    return {
        textInput: faker.lorem.words(2),
        password: faker.internet.password(),
        textarea: faker.lorem.sentence(),
    };
};
