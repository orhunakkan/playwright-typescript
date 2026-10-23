import { z } from 'zod';
import type { AlertEmail } from './linkedin-email-parser.ts';

// Reads a saved email file (test fixtures, scripts/parse-email.ts):
// "From:", "Subject:" and an optional "Date:" header line, one blank line, then the plain-text body.

export interface EmailFile extends AlertEmail {
  date: string | null;
}

export class EmailFileError extends Error {
  override name = 'EmailFileError';
}

const HeadersSchema = z.object({
  from: z.string().trim().min(1),
  subject: z.string().trim().min(1),
});

const DateSchema = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)));

const HEADER_LINE = /^([A-Za-z-]+):(.*)$/;

export function parseEmailFile(text: string): EmailFile {
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

  const rawDate = headers.get('date');
  const date = rawDate === undefined ? undefined : DateSchema.safeParse(rawDate);
  if (date?.success === false) throw new EmailFileError(`the Date: header is not a date: ${String(rawDate)}`);

  return {
    sender: parsed.data.from,
    subject: parsed.data.subject,
    date: date?.data ?? null,
    plainText: normalized.slice(headerEnd + 2),
  };
}
