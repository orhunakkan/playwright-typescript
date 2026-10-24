import { stripVTControlCharacters } from 'node:util';
import { describe, expect, it } from 'vitest';
import { startupBanner } from '../../src/banner.ts';
import type { LinkedInSessionStatus } from '../../src/linkedin/session.ts';

// The startup banner of `npm start` in a terminal (DEC-034).

function banner(linkedin: LinkedInSessionStatus): string[] {
  const text = startupBanner({
    url: 'http://127.0.0.1:3000',
    dbPath: 'data/jobboard.db',
    linkedin,
    formatTime: (iso) => `<${iso}>`,
  });
  return stripVTControlCharacters(text).split('\n');
}

describe('startupBanner', () => {
  const active: LinkedInSessionStatus = { status: 'active', savedAt: '2026-10-24T11:37:48Z', expiresAt: null };

  it('NFR-10: the board address stands on a line of its own', () => {
    const lines = banner(active);

    expect(lines).toContain('  ➜  http://127.0.0.1:3000/');
    expect(lines.filter((line) => line.includes('http://'))).toHaveLength(1);
    expect(lines).toContain('  Job Board is running');
  });

  it('NFR-10: lists the LinkedIn sign-in, the database and how to stop', () => {
    const lines = banner(active);

    expect(lines).toContain('  LinkedIn  ● signed in · checked <2026-10-24T11:37:48Z>');
    expect(lines).toContain('  Database  data/jobboard.db');
    expect(lines).toContain('  Stop      Ctrl+C');
  });

  it('FR-14: an active session saved without a time shows no check time', () => {
    expect(banner({ ...active, savedAt: null })).toContain('  LinkedIn  ● signed in');
  });

  it.each<[LinkedInSessionStatus['status'], string]>([
    ['missing', 'not signed in'],
    ['expired', 'session expired'],
    ['invalid', 'saved session unreadable'],
  ])('FR-14: a %s session says so and how to sign in', (status, text) => {
    expect(banner({ status, savedAt: null, expiresAt: null })).toContain(
      `  LinkedIn  ● ${text} · sign in with node scripts/linkedin-login.ts`,
    );
  });
});
