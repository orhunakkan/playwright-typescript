import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
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

  it.each(['data/linkedin/session.json', 'data/linkedin/browser-profile/Default/Cookies'])(
    'NFR-12: git ignores the saved LinkedIn login at %s',
    (path) => {
      const result = spawnSync('git', ['check-ignore', '--no-index', '--quiet', path], {
        cwd: fileURLToPath(new URL('../../', import.meta.url)),
      });
      expect(result.status).toBe(0);
    },
  );
});
