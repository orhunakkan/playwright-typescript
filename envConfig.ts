interface EnvironmentConfig {
    uiBaseUrl: string;
    apiBaseUrl: string;
}

const environments: { [key: string]: EnvironmentConfig } = {
    testing: {
        uiBaseUrl: process.env.UI_BASE_URL,
        apiBaseUrl: process.env.API_BASE_URL,
    },
    staging: {
        uiBaseUrl: 'https://staging.example.com',
        apiBaseUrl: 'https://api.staging.example.com',
    },
    production: {
        uiBaseUrl: 'https://www.example.com',
        apiBaseUrl: 'https://api.example.com',
    },
};

const currentEnv = process.env.NODE_ENV || 'testing';
const envConfig = environments[currentEnv];

export default envConfig;
