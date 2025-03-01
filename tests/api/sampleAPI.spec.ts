import { test, expect } from '@playwright/test';

test.describe('Reqres API Tests', () => {
    const baseUrl = 'https://reqres.in/api';

    test('List Users', async ({ request }) => {
        const response = await request.get(`${baseUrl}/users?page=2`);

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('page');
        expect(body).toHaveProperty('data');
    });

    test('Single User - Found', async ({ request }) => {
        const response = await request.get(`${baseUrl}/users/2`);

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('data');
    });

    test('Single User - Not Found', async ({ request }) => {
        const response = await request.get(`${baseUrl}/users/23`);

        expect(response.status()).toBe(404);
    });

    test('Create User', async ({ request }) => {
        const response = await request.post(`${baseUrl}/users`, {
            data: {
                name: "morpheus",
                job: "leader"
            }
        });

        expect(response.status()).toBe(201);
        const body = await response.json();
        expect(body).toHaveProperty('id');
        expect(body).toHaveProperty('createdAt');
    });

    test('Update User - PUT', async ({ request }) => {
        const response = await request.put(`${baseUrl}/users/2`, {
            data: {
                name: "morpheus",
                job: "zion resident"
            }
        });

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('updatedAt');
    });

    test('Update User - PATCH', async ({ request }) => {
        const response = await request.patch(`${baseUrl}/users/2`, {
            data: {
                name: "morpheus",
                job: "zion resident"
            }
        });

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('updatedAt');
    });

    test('Delete User', async ({ request }) => {
        const response = await request.delete(`${baseUrl}/users/2`);

        expect(response.status()).toBe(204);
    });

    test('List Resources', async ({ request }) => {
        const response = await request.get(`${baseUrl}/unknown`);

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('data');
    });

    test('Single Resource - Found', async ({ request }) => {
        const response = await request.get(`${baseUrl}/unknown/2`);

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('data');
    });

    test('Single Resource - Not Found', async ({ request }) => {
        const response = await request.get(`${baseUrl}/unknown/23`);

        expect(response.status()).toBe(404);
    });

    test('Register - Successful', async ({ request }) => {
        const response = await request.post(`${baseUrl}/register`, {
            data: {
                email: "eve.holt@reqres.in",
                password: "pistol"
            }
        });

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('token');
        expect(body).toHaveProperty('id');
    });

    test('Register - Unsuccessful', async ({ request }) => {
        const response = await request.post(`${baseUrl}/register`, {
            data: {
                email: "sydney@fife"
            }
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty('error');
    });

    test('Login - Successful', async ({ request }) => {
        const response = await request.post(`${baseUrl}/login`, {
            data: {
                email: "eve.holt@reqres.in",
                password: "cityslicka"
            }
        });

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('token');
    });

    test('Login - Unsuccessful', async ({ request }) => {
        const response = await request.post(`${baseUrl}/login`, {
            data: {
                email: "peter@klaven"
            }
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty('error');
    });

    test('List Users with Delay', async ({ request }) => {
        const response = await request.get(`${baseUrl}/users?delay=3`);

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('data');
    });
});