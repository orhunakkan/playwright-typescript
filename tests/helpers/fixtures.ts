import { readFileSync } from 'node:fs';
import { parseEmailFile } from '../../src/ingest/email-file.ts';
import type { IncomingEmail } from '../../src/ingest/ingest-service.ts';

// Shared by every Vitest project: the sanitized email fixtures as ingest input, and a predictable clock.

export function fixtureEmail(name: string, gmailMessageId = `msg-${name}`): IncomingEmail {
  const email = parseEmailFile(readFileSync(new URL(`../fixtures/emails/${name}`, import.meta.url), 'utf8'));
  return {
    gmailMessageId,
    receivedAt: email.date ?? '2026-10-23T00:00:00Z',
    sender: email.sender,
    subject: email.subject,
    plainText: email.plainText,
  };
}

// A clock that returns 2026-10-23T12:00:00.000Z, then one second later on each call.
export function fakeClock(start = '2026-10-23T12:00:00.000Z'): () => string {
  let time = Date.parse(start);
  return () => {
    const now = new Date(time).toISOString();
    time += 1000;
    return now;
  };
}
