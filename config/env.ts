function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}. Set TEST_ENV or check your .env file.`);
  return value;
}

export const config = {
  e2eUrl: requireEnv('PRACTICE_E2E_URL'),
  apiUrl: requireEnv('PRACTICE_API_URL'),
  env: process.env.TEST_ENV ?? 'dev',
} as const;
