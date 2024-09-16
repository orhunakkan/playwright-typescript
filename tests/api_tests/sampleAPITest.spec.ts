import {expect, request, test} from '@playwright/test';
import path from "node:path";
import * as fs from "node:fs";

test('API Test: Check GET Request Status', async () => {
    const apiContext = await request.newContext();
    const response = await apiContext.get('https://jsonplaceholder.typicode.com/posts/1');
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('id', 1);
});

test('API Test: POST Request with JSON Payload', async () => {
    const payloadPath = path.resolve(__dirname, '../../payloads/samplePayload.json');
    const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf-8'));
    const apiContext = await request.newContext();
    const response = await apiContext.post('https://jsonplaceholder.typicode.com/posts', {data: payload});
    expect(response.status()).toBe(201);
    const responseBody = await response.json();
    expect(responseBody).toMatchObject({
        title: payload.title,
        body: payload.body,
        userId: payload.userId
    });
    expect(responseBody).toHaveProperty('id');
});
