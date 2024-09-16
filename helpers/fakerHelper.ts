import {faker} from '@faker-js/faker';

export const generateRandomFormData = () => {
    return {
        textInput: faker.lorem.words(2), // Generates a random text input
        password: faker.internet.password(), // Correctly generates a random password with at least 8 characters
        textarea: faker.lorem.sentence(), // Generates a random sentence for the textarea
    };
};
