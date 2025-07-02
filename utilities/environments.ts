export interface Environment {
  baseURL: string;
}

export const environments: Record<string, Environment> = {
  dev: {
    baseURL: 'https://the-internet.herokuapp.com/'
  },
  qa: {
    baseURL: 'https://the-internet.herokuapp.com/'
  },
  uat: {
    baseURL: 'https://the-internet.herokuapp.com/'
  },
  prod: {
    baseURL: 'https://the-internet.herokuapp.com/'
  }
};

export function getEnvironment(env: string = 'dev'): Environment {
  const environment = environments[env];
  if (!environment) {
    throw new Error(`Environment '${env}' not found. Available environments: ${Object.keys(environments).join(', ')}`);
  }
  return environment;
}
