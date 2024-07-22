import {devices, PlaywrightTestConfig} from '@playwright/test';

const config: PlaywrightTestConfig = {
    use: {
        headless: true,
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
};

export default config;
