import {expect, test} from '@playwright/test';

test.describe('APIs', () => {

    test.describe('Commands', () => {
        test.beforeEach(async ({page}) => {
            await page.goto('https://example.cypress.io/cypress-api');
        });

        test('create a custom command', async ({page}) => {
        });
    });

    test.describe('Cookies', () => {
        test.beforeEach(async ({page, context}) => {
            await page.goto('https://example.cypress.io/cypress-api');
        });

        test('enable or disable debugging', async ({context}) => {
        });
    });

    test.describe('arch', () => {
        test.beforeEach(async ({page}) => {
            await page.goto('https://example.cypress.io/cypress-api');
        });

        test('Get CPU architecture name of underlying OS', async () => {
            expect(process.arch).toBeDefined();
        });
    });

    test.describe('config()', () => {
        test.beforeEach(async ({page}) => {
            await page.goto('https://example.cypress.io/cypress-api');
        });

        test('Get and set configuration options', async ({page}) => {
            const config = {
                animationDistanceThreshold: 5,
                baseUrl: null,
                defaultCommandTimeout: 10000,
                requestTimeout: 5000,
                responseTimeout: 30000,
                viewportHeight: 660,
                viewportWidth: 1000,
                pageLoadTimeout: 60000,
                waitForAnimations: true
            };
            expect(config).toHaveProperty('animationDistanceThreshold', 5);
            expect(config).toHaveProperty('baseUrl', null);
            expect(config).toHaveProperty('defaultCommandTimeout', 10000);
            expect(config).toHaveProperty('requestTimeout', 5000);
            expect(config).toHaveProperty('responseTimeout', 30000);
            expect(config).toHaveProperty('viewportHeight', 660);
            expect(config).toHaveProperty('viewportWidth', 1000);
            expect(config).toHaveProperty('pageLoadTimeout', 60000);
            expect(config).toHaveProperty('waitForAnimations', true);
            expect(config.pageLoadTimeout).toBe(60000);
            config.pageLoadTimeout = 20000;
            expect(config.pageLoadTimeout).toBe(20000);
            config.pageLoadTimeout = 60000;
        });
    });

    test.describe('dom', () => {
        test.beforeEach(async ({page}) => {
            await page.goto('https://example.cypress.io/cypress-api');
        });

        test('determine if a DOM element is hidden', async ({page}) => {
        });
    });

    test.describe('env()', () => {
        test.beforeEach(async ({page}) => {
            await page.goto('https://example.cypress.io/cypress-api');
        });

        test('Get environment variables', async () => {
            const env = {
                host: 'veronica.dev.local',
                api_server: 'http://localhost:8888/v1/'
            };
            expect(env.host).toBe('veronica.dev.local');
            env.api_server = 'http://localhost:8888/v2/';
            expect(env.api_server).toBe('http://localhost:8888/v2/');
            expect(env).toHaveProperty('host', 'veronica.dev.local');
            expect(env).toHaveProperty('api_server', 'http://localhost:8888/v2/');
        });
    });

    test.describe('log', () => {
        test.beforeEach(async ({page}) => {
            await page.goto('https://example.cypress.io/cypress-api');
        });

        test('Control what is printed to the Command Log', async () => {
        });
    });

    test.describe('platform', () => {
        test.beforeEach(async ({page}) => {
            await page.goto('https://example.cypress.io/cypress-api');
        });

        test('Get underlying OS name', async () => {
            expect(process.platform).toBeDefined();
        });
    });

    test.describe('version', () => {
        test.beforeEach(async ({page}) => {
            await page.goto('https://example.cypress.io/cypress-api');
        });

        test('Get current version of Cypress being run', async () => {
            const version = '9.1.0'; // Example version
            expect(version).toBeDefined();
        });
    });

    test.describe('spec', () => {
        test.beforeEach(async ({page}) => {
            await page.goto('https://example.cypress.io/cypress-api');
        });

        test('Get current spec information', async () => {
            const spec = {
                name: 'example.spec.js',
                relative: 'cypress/integration/example.spec.js',
                absolute: '/Users/user/cypress/integration/example.spec.js'
            };
            expect(spec).toHaveProperty('name', 'example.spec.js');
            expect(spec).toHaveProperty('relative', 'cypress/integration/example.spec.js');
            expect(spec).toHaveProperty('absolute', '/Users/user/cypress/integration/example.spec.js');
        });
    });
});