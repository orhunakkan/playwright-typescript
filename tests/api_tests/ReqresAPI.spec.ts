import {expect, test} from '@playwright/test';
import {BASE_URL, ENDPOINTS} from '../../support/ReqresConfig';
import {del, get, patch, post, put} from '../../helpers/ReqresHelperFunctions';
import {PAYLOADS} from '../../payloads/ReqresPayloads';

test.describe('Reqres API Tests', () => {

    test('List Users', async ({request}) => {
        const {response, body} = await get(request, `${BASE_URL}${ENDPOINTS.users}`);
        expect(response.status()).toBe(200);
        expect(body).toHaveProperty('data');
        expect(Array.isArray(body.data)).toBe(true);
    });

    test('Single User', async ({request}) => {
        const {response, body} = await get(request, `${BASE_URL}${ENDPOINTS.singleUser(2)}`);
        expect(response.status()).toBe(200);
        expect(body.data).toHaveProperty('id', 2);
    });

    test('Single User Not Found', async ({request}) => {
        const {response} = await get(request, `${BASE_URL}${ENDPOINTS.singleUser(23)}`);
        expect(response.status()).toBe(404);
    });

    test('List Resources', async ({request}) => {
        const {response, body} = await get(request, `${BASE_URL}${ENDPOINTS.resources}`);
        expect(response.status()).toBe(200);
        expect(body).toHaveProperty('data');
        expect(Array.isArray(body.data)).toBe(true);
    });

    test('Single Resource', async ({request}) => {
        const {response, body} = await get(request, `${BASE_URL}${ENDPOINTS.singleResource(2)}`);
        expect(response.status()).toBe(200);
        expect(body.data).toHaveProperty('id', 2);
    });

    test('Single Resource Not Found', async ({request}) => {
        const {response} = await get(request, `${BASE_URL}${ENDPOINTS.singleResource(23)}`);
        expect(response.status()).toBe(404);
    });

    test('Create User', async ({request}) => {
        const {response, body} = await post(request, `${BASE_URL}${ENDPOINTS.users}`, PAYLOADS.createUser);
        expect(response.status()).toBe(201);
        expect(body).toHaveProperty('name', 'morpheus');
        expect(body).toHaveProperty('job', 'leader');
    });

    test('Update User', async ({request}) => {
        const {response, body} = await put(request, `${BASE_URL}${ENDPOINTS.singleUser(2)}`, PAYLOADS.updateUser);
        expect(response.status()).toBe(200);
        expect(body).toHaveProperty('name', 'morpheus');
        expect(body).toHaveProperty('job', 'zion resident');
    });

    test('Patch Update User', async ({request}) => {
        const {response, body} = await patch(request, `${BASE_URL}${ENDPOINTS.singleUser(2)}`, PAYLOADS.updateUser);
        expect(response.status()).toBe(200);
        expect(body).toHaveProperty('name', 'morpheus');
        expect(body).toHaveProperty('job', 'zion resident');
    });

    test('Delete User', async ({request}) => {
        const {response} = await del(request, `${BASE_URL}${ENDPOINTS.singleUser(2)}`);
        expect(response.status()).toBe(204);
    });

    test('Register - Successful', async ({request}) => {
        const {response, body} = await post(request, `${BASE_URL}${ENDPOINTS.register}`, PAYLOADS.registerSuccess);
        expect(response.status()).toBe(200);
        expect(body).toHaveProperty('id');
        expect(body).toHaveProperty('token');
    });

    test('Register - Unsuccessful', async ({request}) => {
        const {response, body} = await post(request, `${BASE_URL}${ENDPOINTS.register}`, PAYLOADS.registerUnsuccessful);
        expect(response.status()).toBe(400);
        expect(body).toHaveProperty('error', 'Missing password');
    });

    test('Login - Successful', async ({request}) => {
        const {response, body} = await post(request, `${BASE_URL}${ENDPOINTS.login}`, PAYLOADS.loginSuccess);
        expect(response.status()).toBe(200);
        expect(body).toHaveProperty('token');
    });

    test('Login - Unsuccessful', async ({request}) => {
        const {response, body} = await post(request, `${BASE_URL}${ENDPOINTS.login}`, PAYLOADS.loginUnsuccessful);
        expect(response.status()).toBe(400);
        expect(body).toHaveProperty('error', 'Missing password');
    });

    test('Delayed Response', async ({request}) => {
        const {response, body} = await get(request, `${BASE_URL}${ENDPOINTS.delayedResponse}`);
        expect(response.status()).toBe(200);
        expect(body).toHaveProperty('data');
        expect(Array.isArray(body.data)).toBe(true);
    });
});
