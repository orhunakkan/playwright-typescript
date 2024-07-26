import {expect, test} from '@playwright/test';

test.describe('Reqres API Tests', () => {

    test('List Users', async ({request}) => {
        const response = await request.get('https://reqres.in/api/users?page=2');
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('data');
        expect(Array.isArray(body.data)).toBe(true);
    });

    test('Single User', async ({request}) => {
        const response = await request.get('https://reqres.in/api/users/2');
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.data).toHaveProperty('id', 2);
    });

    test('Single User Not Found', async ({request}) => {
        const response = await request.get('https://reqres.in/api/users/23');
        expect(response.status()).toBe(404);
    });

    test('List Resources', async ({request}) => {
        const response = await request.get('https://reqres.in/api/unknown');
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('data');
        expect(Array.isArray(body.data)).toBe(true);
    });

    test('Single Resource', async ({request}) => {
        const response = await request.get('https://reqres.in/api/unknown/2');
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.data).toHaveProperty('id', 2);
    });

    test('Single Resource Not Found', async ({request}) => {
        const response = await request.get('https://reqres.in/api/unknown/23');
        expect(response.status()).toBe(404);
    });

    test('Create User', async ({request}) => {
        const response = await request.post('https://reqres.in/api/users', {
            data: {
                name: 'morpheus',
                job: 'leader'
            }
        });
        expect(response.status()).toBe(201);
        const body = await response.json();
        expect(body).toHaveProperty('name', 'morpheus');
        expect(body).toHaveProperty('job', 'leader');
    });

    test('Update User', async ({request}) => {
        const response = await request.put('https://reqres.in/api/users/2', {
            data: {
                name: 'morpheus',
                job: 'zion resident'
            }
        });
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('name', 'morpheus');
        expect(body).toHaveProperty('job', 'zion resident');
    });

    test('Patch Update User', async ({request}) => {
        const response = await request.patch('https://reqres.in/api/users/2', {
            data: {
                name: 'morpheus',
                job: 'zion resident'
            }
        });
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('name', 'morpheus');
        expect(body).toHaveProperty('job', 'zion resident');
    });

    test('Delete User', async ({request}) => {
        const response = await request.delete('https://reqres.in/api/users/2');
        expect(response.status()).toBe(204);
    });

    test('Register - Successful', async ({request}) => {
        const response = await request.post('https://reqres.in/api/register', {
            data: {
                email: 'eve.holt@reqres.in',
                password: 'pistol'
            }
        });
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('id');
        expect(body).toHaveProperty('token');
    });

    test('Register - Unsuccessful', async ({request}) => {
        const response = await request.post('https://reqres.in/api/register', {
            data: {
                email: 'sydney@fife'
            }
        });
        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty('error', 'Missing password');
    });

    test('Login - Successful', async ({request}) => {
        const response = await request.post('https://reqres.in/api/login', {
            data: {
                email: 'eve.holt@reqres.in',
                password: 'cityslicka'
            }
        });
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('token');
    });

    test('Login - Unsuccessful', async ({request}) => {
        const response = await request.post('https://reqres.in/api/login', {
            data: {
                email: 'peter@klaven'
            }
        });
        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty('error', 'Missing password');
    });

    test('Delayed Response', async ({request}) => {
        const response = await request.get('https://reqres.in/api/users?delay=3');
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('data');
        expect(Array.isArray(body.data)).toBe(true);
    });

});
