import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('git ignores personal data', () => {
  const ignored = readFileSync(new URL('../../.gitignore', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim());

  it.each(['data/', '.env', '*.db'])('NFR-08: .gitignore lists %s', (pattern) => {
    expect(ignored).toContain(pattern);
  });

  it('NFR-08: .env.example stays committable', () => {
    expect(ignored).toContain('!.env.example');
  });
});
