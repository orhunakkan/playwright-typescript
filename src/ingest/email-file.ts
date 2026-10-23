import { z } from 'zod';
import type { AlertEmail } from './linkedin-email-parser.ts';

// Reads a saved email file (test fixtures, scripts/parse-email.ts):
// "From:" and "Subject:" header lines, one blank line, then the plain-text body.

export class EmailFileError extends Error {
  override name = 'EmailFileError';
}

const HeadersSchema = z.object({
  from: z.string().trim().min(1),
  subject: z.string().trim().min(1),
});

const HEADER_LINE = /^([A-Za-z-]+):(.*)$/;

export function parseEmailFile(text: string): AlertEmail {
  const normalized = text.replace(/\r\n?/g, '\n');
  const headerEnd = normalized.indexOf('\n\n');
  if (headerEnd === -1) throw new EmailFileError('expected header lines, then a blank line, then the body');

  const headers = new Map<string, string>();
  for (const line of normalized.slice(0, headerEnd).split('\n')) {
    const [, name, value] = HEADER_LINE.exec(line) ?? [];
    if (name === undefined || value === undefined) throw new EmailFileError(`malformed header line: ${line}`);
    headers.set(name.toLowerCase(), value);
  }

  const parsed = HeadersSchema.safeParse({ from: headers.get('from'), subject: headers.get('subject') });
  if (!parsed.success) throw new EmailFileError('the From: and Subject: headers are required and must not be empty');

  return { sender: parsed.data.from, subject: parsed.data.subject, plainText: normalized.slice(headerEnd + 2) };
}
