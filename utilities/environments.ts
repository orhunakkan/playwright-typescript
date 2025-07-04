export const environments = {
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

export function getEnvironment(env = 'dev') {
  const environment = environments[env];
  if (!environment) {
    throw new Error(`Environment '${env}' not found.`);
  }
  return environment;
}
