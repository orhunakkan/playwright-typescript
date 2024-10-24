import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    snapshotPathTemplate: '{testDir}/{testFileDir}/snapshots/{testFileName}-{projectName}{ext}',
    timeout: 60000,
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 3 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: process.env.ENV,
        trace: 'on-first-retry',
        ignoreHTTPSErrors: true,
    },
    projects: [
        {
            name: 'Desktop Chromium',
            testDir: './tests/desktop',
            use: {...devices['Desktop Chrome']},
        },
        {
            name: 'Desktop Firefox',
            testDir: './tests/desktop',
            use: {...devices['Desktop Firefox']},
        },
        {
            name: 'Desktop Webkit',
            testDir: './tests/desktop',
            use: {...devices['Desktop Safari']},
        },
        {
            name: 'Mobile Chrome Pixel',
            testDir: './tests/mobile',
            use: {...devices['Pixel 7'], browserName: 'chromium'},
        },
        {
            name: 'Mobile Safari iPhone',
            testDir: './tests/mobile',
            use: {...devices['iPhone 15'], browserName: 'webkit'},
        },
        {
            name: 'Desktop Chromium',
            testDir: './tests/shared',
            use: {...devices['Desktop Chrome']},
        },
        {
            name: 'Desktop Firefox',
            testDir: './tests/shared',
            use: {...devices['Desktop Firefox']},
        },
        {
            name: 'Desktop Safari',
            testDir: './tests/shared',
            use: {...devices['Desktop Safari']},
        },
        {
            name: 'Mobile Chrome Pixel',
            testDir: './tests/shared',
            use: {...devices['Pixel 7'], browserName: 'chromium'},
        },
        {
            name: 'Mobile Safari iPhone',
            testDir: './tests/shared',
            use: {...devices['iPhone 15'], browserName: 'webkit'},
        },
    ],
});
