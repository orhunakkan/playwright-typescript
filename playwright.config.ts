import {devices, PlaywrightTestConfig} from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const config: PlaywrightTestConfig = {
    use: {
        baseURL: process.env.BASE_URL,
        headless: true,
        ignoreHTTPSErrors: true,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
    },
    projects: [
        {
            name: 'Microsoft Edge',
            use: {
                ...devices['Desktop Edge'],
                channel: 'msedge',
                deviceScaleFactor: undefined,
                viewport: null,
                launchOptions: {
                    args: ['--start-maximized'],
                },
            },
        },
    ],
    testDir: './tests',
    retries: 0,
    timeout: 10000,
    reporter: [['list'], ['html', {outputFolder: 'test-results'}]],
};

export default config;

