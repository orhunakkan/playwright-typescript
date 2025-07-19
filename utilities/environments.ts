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

export type EnvironmentName = keyof typeof environments;

export function isEnvironmentName(env: string): env is EnvironmentName {
  return ['dev', 'qa', 'uat', 'prod'].includes(env);
}

export function getEnvironment(env: string = 'dev') {
  if (!isEnvironmentName(env)) {
    throw new Error(`Environment '${env}' is not valid.`);
  }
  return environments[env];
}
