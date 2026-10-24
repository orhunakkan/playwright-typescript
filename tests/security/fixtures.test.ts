import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// PLAN.md §8.2: fixtures come from real emails and must be sanitized before they are committed.
const dir = new URL('../fixtures/emails/', import.meta.url);
const fixtures = readdirSync(dir).filter((name) => name.endsWith('.txt'));

describe('email fixtures are sanitized', () => {
  it('NFR-08: at least one fixture exists per known format', () => {
    expect(fixtures.some((name) => name.startsWith('digest-'))).toBe(true);
    expect(fixtures.some((name) => name.startsWith('recommendations'))).toBe(true);
  });

  describe.each(fixtures)('%s', (name) => {
    const text = readFileSync(new URL(name, dir), 'utf8');

    it('NFR-08: no URL keeps a query string or fragment', () => {
      const urls = text.match(/https?:\/\/\S+/g) ?? [];

      expect(urls.length).toBeGreaterThan(0);
      expect(urls.filter((url) => /[?#]/.test(url))).toEqual([]);
    });

    it('NFR-08: no tracking or one-time token survives', () => {
      expect(text).not.toMatch(/otpToken|midToken|midSig|trackingId|refId|trkEmail|lipi=|savedSearchId|loid=/);
    });

    it('NFR-08: the "intended for" line names only the test user', () => {
      const lines = text.split('\n').filter((line) => line.startsWith('This email was intended for'));

      expect(lines).toEqual(['This email was intended for Test User (QA Engineer)']);
    });

    it('NFR-08: the only email addresses are LinkedIn senders or test@example.com', () => {
      const addresses = text.match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g) ?? [];

      expect(
        addresses.filter(
          (address) => !/^(?:jobalerts-noreply|jobs-noreply)@linkedin\.com$|^test@example\.com$/.test(address),
        ),
      ).toEqual([]);
    });
  });
});
