import { describe, expect, it } from 'vitest';
import { EmailFileError, parseEmailFile } from '../../../src/ingest/email-file.ts';

describe('parseEmailFile', () => {
  it('FR-02: splits the headers from the body', () => {
    const email = parseEmailFile('From: jobs-noreply@linkedin.com\nSubject: Hello\n\nLine one\n\nLine two\n');

    expect(email).toEqual({
      sender: 'jobs-noreply@linkedin.com',
      subject: 'Hello',
      date: null,
      plainText: 'Line one\n\nLine two\n',
    });
  });

  it('FR-02: header names are case-insensitive, values are trimmed, other headers are ignored', () => {
    const email = parseEmailFile('subject:   Hello  \nX-Mailer: test\nFROM: a@linkedin.com\n\nBody');

    expect(email).toEqual({ sender: 'a@linkedin.com', subject: 'Hello', date: null, plainText: 'Body' });
  });

  it('FR-02: reads an optional Date header', () => {
    const email = parseEmailFile('From: a@linkedin.com\nSubject: Hi\nDate:  2026-10-22T14:10:48Z \n\nBody');

    expect(email.date).toBe('2026-10-22T14:10:48Z');
  });

  it('FR-02: keeps a colon inside a header value', () => {
    expect(parseEmailFile('From: a@linkedin.com\nSubject: Re: hi\n\nBody').subject).toBe('Re: hi');
  });

  it('NFR-10: reads files saved with Windows line endings', () => {
    const email = parseEmailFile('From: a@linkedin.com\r\nSubject: Hi\r\n\r\nBody\r\nmore');

    expect(email.plainText).toBe('Body\nmore');
  });

  it.each([
    ['no blank line after the headers', 'From: a@linkedin.com\nSubject: Hi', 'expected header lines'],
    ['a malformed header line', 'From: a@linkedin.com\nnot a header\n\nBody', 'malformed header line: not a header'],
    ['a missing Subject', 'From: a@linkedin.com\n\nBody', 'the From: and Subject: headers are required'],
    ['a missing From', 'Subject: Hi\n\nBody', 'the From: and Subject: headers are required'],
    ['an empty From', 'From:   \nSubject: Hi\n\nBody', 'the From: and Subject: headers are required'],
    ['a Date that is not a date', 'From: a@linkedin.com\nSubject: Hi\nDate: today\n\nBody', 'the Date: header'],
  ])('FR-02: rejects %s', (_case, text, message) => {
    expect(() => parseEmailFile(text)).toThrow(EmailFileError);
    expect(() => parseEmailFile(text)).toThrow(message);
  });

  it('FR-02: EmailFileError is a typed Error', () => {
    const error = new EmailFileError('x');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('EmailFileError');
  });
});
