function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}. Set TEST_ENV or check your .env file.`);
  return value;
}

export const config = {
  e2eUrl: requireEnv('PRACTICE_E2E_URL'),
  apiUrl: requireEnv('PRACTICE_API_URL'),
  sauceDemoUrl: requireEnv('SAUCE_DEMO_URL'),
  env: process.env.TEST_ENV ?? 'dev',
  // DB vars use optional fallback so API/E2E tests run without a local DB
  dbHost: process.env.DB_HOST ?? '',
  dbPort: parseInt(process.env.DB_PORT ?? '5432', 10),
  dbName: process.env.DB_NAME ?? '',
  dbUser: process.env.DB_USER ?? '',
  dbPassword: process.env.DB_PASSWORD ?? '',
} as const;
