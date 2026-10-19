import { join } from 'node:path';

// Layered env loading. process.loadEnvFile never overwrites a variable that is already set,
// so the first source to define a value wins: shell > .env.<ENV> > .env
const root = join(import.meta.dirname, '..');

const loadIfPresent = (file: string) => {
  try {
    process.loadEnvFile(join(root, file));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
  }
};

if (process.env['ENV']) loadIfPresent(`.env.${process.env['ENV']}`);
loadIfPresent('.env');

/** Every variable this module reads; scripts that spawn other processes (e.g. Docker) forward exactly these. */
export const ENV_KEYS = ['ENV', 'BASE_URL', 'API_URL', 'API_HEALTH_PATH', 'API_SPEC_PATH', 'TEST_ID_ATTRIBUTE'] as const;

const required = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not set. Copy .env.example to .env and fill it in.`);
  return value;
};

export const env = {
  name: process.env['ENV'] ?? 'default',
  baseUrl: required('BASE_URL'),
  apiUrl: required('API_URL'),
  apiHealthPath: process.env['API_HEALTH_PATH']?.trim() || '/',
  apiSpecPath: process.env['API_SPEC_PATH']?.trim() || '/openapi.json',
  testIdAttribute: process.env['TEST_ID_ATTRIBUTE']?.trim() || 'data-testid',
} as const;
