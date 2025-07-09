import * as dotenv from 'dotenv';

dotenv.config();

export const environments = {
  dev: {
    baseURL: process.env.DEV_BASE_URL || 'https://the-internet.herokuapp.com/',
  },
  qa: {
    baseURL: process.env.QA_BASE_URL || 'https://the-internet.herokuapp.com/',
  },
  uat: {
    baseURL: process.env.UAT_BASE_URL || 'https://the-internet.herokuapp.com/',
  },
  prod: {
    baseURL: process.env.PROD_BASE_URL || 'https://the-internet.herokuapp.com/',
  },
};

export function getEnvironment(env = 'dev') {
  const environment = environments[env];
  if (!environment) {
    throw new Error(`Environment '${env}' not found.`);
  }
  return environment;
}
