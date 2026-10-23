import { z } from 'zod';
import { LOG_LEVELS, type LogLevel } from './logger.ts';

// App settings from the environment (PLAN.md Phase 4). `npm start` loads them from .env (see .env.example).

export interface Config {
  port: number;
  dbPath: string;
  logLevel: LogLevel;
}

export class ConfigError extends Error {
  override name = 'ConfigError';
}

const EnvSchema = z.object({
  PORT: z
    .string()
    .trim()
    .regex(/^\d+$/, 'must be a whole number')
    .transform(Number)
    .pipe(z.number().int().min(1).max(65_535))
    .default(3000),
  DB_PATH: z
    .string({ error: 'is required, for example data/jobboard.db' })
    .trim()
    .min(1, 'is required, for example data/jobboard.db'),
  LOG_LEVEL: z.enum(LOG_LEVELS).default('info'),
});

export function loadConfig(env: Readonly<Record<string, string | undefined>>): Config {
  const parsed = EnvSchema.safeParse({ PORT: env['PORT'], DB_PATH: env['DB_PATH'], LOG_LEVEL: env['LOG_LEVEL'] });
  if (!parsed.success) {
    const problems = parsed.error.issues.map((issue) => `  ${issue.path.join('.')}: ${issue.message}`);
    throw new ConfigError(`Invalid configuration (check .env, see .env.example):\n${problems.join('\n')}`);
  }
  return { port: parsed.data.PORT, dbPath: parsed.data.DB_PATH, logLevel: parsed.data.LOG_LEVEL };
}
