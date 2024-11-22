import {expect, test} from '@playwright/test';

const baseURL = 'https://reqres.in/api';

test.describe('Reqres API Tests', () => {

    // Test to fetch a list of users from the API
    test('should fetch a list of users', async ({request}) => {
        const response = await request.get(`${baseURL}/users?page=2`);
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('data');
        expect(Array.isArray(responseBody.data)).toBe(true);
    });

    // Test to fetch a single user by ID from the API
    test('should fetch a single user', async ({request}) => {
        const response = await request.get(`${baseURL}/users/2`);
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('data');
        expect(responseBody.data).toHaveProperty('id', 2);
    });

    // Test to check the response for a non-existent user
    test('should return 404 for a non-existent user', async ({request}) => {
        const response = await request.get(`${baseURL}/users/23`);
        expect(response.status()).toBe(404);
    });

    // Test to create a new user via POST request
    test('should create a new user', async ({request}) => {
        const newUser = {
            name: 'morpheus',
            job: 'leader'
        };
        const response = await request.post(`${baseURL}/users`, {data: newUser});
        expect(response.status()).toBe(201);
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('name', newUser.name);
        expect(responseBody).toHaveProperty('job', newUser.job);
    });

    // Test to update an existing user via PUT request
    test('should update a user', async ({request}) => {
        const updatedUser = {
            name: 'morpheus',
            job: 'zion resident'
        };
        const response = await request.put(`${baseURL}/users/2`, {data: updatedUser});
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('name', updatedUser.name);
        expect(responseBody).toHaveProperty('job', updatedUser.job);
    });

    // Test to update an existing user via PATCH request
    test('should update a user with PATCH', async ({request}) => {
        const updatedUser = {
            name: 'morpheus',
            job: 'zion resident'
        };
        const response = await request.patch(`${baseURL}/users/2`, {data: updatedUser});
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('name', updatedUser.name);
        expect(responseBody).toHaveProperty('job', updatedUser.job);
    });

    // Test to delete a user by ID
    test('should delete a user', async ({request}) => {
        const response = await request.delete(`${baseURL}/users/2`);
        expect(response.status()).toBe(204);
    });

    // Test to register a new user successfully
    test('should register a user successfully', async ({request}) => {
        const newUser = {
            email: 'eve.holt@reqres.in',
            password: 'pistol'
        };
        const response = await request.post(`${baseURL}/register`, {data: newUser});
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('id');
        expect(responseBody).toHaveProperty('token');
    });

    // Test to handle registration failure due to missing fields
    test('should fail to register a user', async ({request}) => {
        const newUser = {
            email: 'sydney@fife'
        };
        const response = await request.post(`${baseURL}/register`, {data: newUser});
        expect(response.status()).toBe(400);
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('error');
    });

    // Test to log in a user successfully
    test('should login a user successfully', async ({request}) => {
        const user = {
            email: 'eve.holt@reqres.in',
            password: 'cityslicka'
        };
        const response = await request.post(`${baseURL}/login`, {data: user});
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('token');
    });

    // Test to handle login failure due to missing fields
    test('should fail to login a user', async ({request}) => {
        const user = {
            email: 'peter@klaven'
        };
        const response = await request.post(`${baseURL}/login`, {data: user});
        expect(response.status()).toBe(400);
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('error');
    });

    // Test to fetch a list of resources from the API
    test('should fetch a list of resources', async ({request}) => {
        const response = await request.get(`${baseURL}/unknown`);
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('data');
        expect(Array.isArray(responseBody.data)).toBe(true);
    });

    // Test to fetch a single resource by ID from the API
    test('should fetch a single resource', async ({request}) => {
        const response = await request.get(`${baseURL}/unknown/2`);
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('data');
        expect(responseBody.data).toHaveProperty('id', 2);
    });

    // Test to check the response for a non-existent resource
    test('should return 404 for a non-existent resource', async ({request}) => {
        const response = await request.get(`${baseURL}/unknown/23`);
        expect(response.status()).toBe(404);
    });

    // Test to fetch a delayed response from the API
    test('should fetch a delayed response', async ({request}) => {
        const response = await request.get(`${baseURL}/users?delay=3`);
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('data');
        expect(Array.isArray(responseBody.data)).toBe(true);
    });
});