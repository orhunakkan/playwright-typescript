import {expect, test} from '@playwright/test';
import requiredExample from '../../payloads/example.json';
import fs from 'fs';
import path from 'path';

test.describe('Files', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/files');
    });

    test('load a fixture', async ({page, context}) => {
    });

    test('load a fixture or require', async () => {
        const example = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../payloads/example.json'), 'utf-8'));
        expect(example).toEqual(requiredExample);
    });

    test('read file contents', async () => {
    });

    test('write to a file', async ({request}) => {
    });
});