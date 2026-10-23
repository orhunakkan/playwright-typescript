import { describe, expect, it } from 'vitest';
import { ConfigError, loadConfig } from '../../src/config.ts';

describe('loadConfig', () => {
  it('NFR-09: reads PORT, DB_PATH and LOG_LEVEL', () => {
    expect(loadConfig({ PORT: '3000', DB_PATH: 'data/jobboard.db', LOG_LEVEL: 'warn' })).toEqual({
      port: 3000,
      dbPath: 'data/jobboard.db',
      logLevel: 'warn',
    });
  });

  it('NFR-09: PORT defaults to 3000 and LOG_LEVEL to info', () => {
    expect(loadConfig({ DB_PATH: 'x.db' })).toEqual({ port: 3000, dbPath: 'x.db', logLevel: 'info' });
  });

  it('NFR-09: trims surrounding whitespace', () => {
    expect(loadConfig({ PORT: ' 3100 ', DB_PATH: ' x.db ' })).toMatchObject({ port: 3100, dbPath: 'x.db' });
  });

  it('NFR-09: ignores unrelated environment variables', () => {
    expect(loadConfig({ DB_PATH: 'x.db', PATH: '/usr/bin', HOME: '/home/someone' })).toMatchObject({ dbPath: 'x.db' });
  });

  it.each<[string, Record<string, string>, string]>([
    ['a missing DB_PATH', {}, 'DB_PATH: is required, for example data/jobboard.db'],
    ['an empty DB_PATH', { DB_PATH: '  ' }, 'DB_PATH: is required, for example data/jobboard.db'],
    ['a PORT that is not a number', { DB_PATH: 'x', PORT: '80a' }, 'PORT: must be a whole number'],
    ['a PORT of 0', { DB_PATH: 'x', PORT: '0' }, 'PORT:'],
    ['a PORT above 65535', { DB_PATH: 'x', PORT: '65536' }, 'PORT:'],
    ['a negative PORT', { DB_PATH: 'x', PORT: '-1' }, 'PORT: must be a whole number'],
    ['an unknown LOG_LEVEL', { DB_PATH: 'x', LOG_LEVEL: 'verbose' }, 'LOG_LEVEL:'],
  ])('NFR-09: %s is a ConfigError that says what to fix', (_case, env, message) => {
    expect(() => loadConfig(env)).toThrow(ConfigError);
    expect(() => loadConfig(env)).toThrow(message);
    expect(() => loadConfig(env)).toThrow('Invalid configuration (check .env, see .env.example)');
  });

  it('NFR-09: lists every problem at once', () => {
    expect(() => loadConfig({ PORT: 'x', LOG_LEVEL: 'y' })).toThrow(/PORT[\s\S]*DB_PATH[\s\S]*LOG_LEVEL/);
  });

  it('NFR-09: ConfigError is a typed Error', () => {
    expect(new ConfigError('x')).toMatchObject({ name: 'ConfigError', message: 'x' });
  });
});
