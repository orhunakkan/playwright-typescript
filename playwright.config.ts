import {defineConfig, devices} from "@playwright/test";

module.exports = defineConfig({
    testDir: "./tests",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    expect: {timeout: 10000},
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 2 : 1,
    reporter: [["line"], ["html", {outputFolder: "test-results/html"}]],
    use: {
        baseURL: process.env.BASE_URL || "https://ion-eus2-compass-apim-qa.azure-api.net",
        trace: "on-first-retry",
        actionTimeout: 30000,
        navigationTimeout: 30000,
        screenshot: "on",
        video: "retain-on-failure",
        ignoreHTTPSErrors: true,
        timezoneId: "America/New_York",
        launchOptions: {args: ["--start-maximized"]},
        viewport: null,
        colorScheme: "dark",
        permissions: ["geolocation"]
    },
    timeout: 60000 * 2,
    projects: [
        {
            name: "Microsoft Edge",
            use: {
                ...devices["Desktop Edge"],
                channel: "msedge",
                deviceScaleFactor: undefined,
                viewport: null,
                launchOptions: {
                    args: ["--start-maximized"]
                }
            }
        }]
});

