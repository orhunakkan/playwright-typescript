import {expect, test} from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Files', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/files');
    });

    test('load a fixture', async ({page}) => {
        await page.route('**/comments/*', route => route.fulfill({
            body: fs.readFileSync(path.resolve(__dirname, '../../payloads/example.json'), 'utf-8'),
        }));
        await page.locator('.fixture-btn').click();
        const response = await page.waitForResponse('**/comments/*');
        const body = await response.json();
        expect(body).toHaveProperty('name');
        expect(body.name).toContain('Using fixtures to represent data');
    });

    test('load a fixture or require', async ({page}) => {
        const requiredExample = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../payloads/example.json'), 'utf-8'));
        const example = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../payloads/example.json'), 'utf-8'));
        expect(example).toEqual(requiredExample);
    });

    test('read file contents', async () => {
        const config = fs.readFileSync(path.resolve(__dirname, '../cypress.json'), 'utf-8');
        expect(config).toBeInstanceOf(String);
    });

    test('write to a file', async ({page}) => {
        const response = await page.request.get('https://jsonplaceholder.cypress.io/users');
        const users = await response.json();
        fs.writeFileSync(path.resolve(__dirname, '../payloads/users.json'), JSON.stringify(users, null, 2));
        const usersFixture = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../payloads/users.json'), 'utf-8'));
        expect(usersFixture[0].name).toBeDefined();
        const profile = {
            id: 8739,
            name: 'Jane',
            email: 'jane@example.com',
        };
        fs.writeFileSync(path.resolve(__dirname, '../payloads/profile.json'), JSON.stringify(profile, null, 2));
        const profileFixture = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../payloads/profile.json'), 'utf-8'));
        expect(profileFixture.name).toBe('Jane');
    });
});