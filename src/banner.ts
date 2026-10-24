import { styleText } from 'node:util';
import type { LinkedInSessionStatus } from './linkedin/session.ts';

// What `npm start` prints in a terminal once the server is up (DEC-034): the board's address on a line of its own,
// so it is easy to spot and click, then the LinkedIn sign-in and the database. JSON-log runs print no banner.

export interface BannerInfo {
  url: string;
  dbPath: string;
  linkedin: LinkedInSessionStatus;
  /** Formats the time the LinkedIn session was last checked; the caller's clock and time zone. */
  formatTime: (iso: string) => string;
}

export function startupBanner(info: BannerInfo): string {
  const row = (label: string, value: string) => `  ${styleText('dim', label.padEnd(10))}${value}`;
  return [
    '',
    `  ${styleText(['green', 'bold'], 'Job Board is running')}`,
    '',
    `  ${styleText('green', '➜')}  ${styleText(['cyan', 'bold', 'underline'], `${info.url}/`)}`,
    '',
    row('LinkedIn', linkedinText(info.linkedin, info.formatTime)),
    row('Database', info.dbPath),
    row('Stop', 'Ctrl+C'),
    '',
    '',
  ].join('\n');
}

function linkedinText(session: LinkedInSessionStatus, formatTime: (iso: string) => string): string {
  const signIn = `sign in with ${styleText('bold', 'node scripts/linkedin-login.ts')}`;
  switch (session.status) {
    case 'active':
      return `${styleText('green', '● signed in')}${session.savedAt === null ? '' : styleText('dim', ` · checked ${formatTime(session.savedAt)}`)}`;
    case 'expired':
      return `${styleText('yellow', '● session expired')} · ${signIn}`;
    case 'missing':
      return `${styleText('yellow', '● not signed in')} · ${signIn}`;
    case 'invalid':
      return `${styleText('yellow', '● saved session unreadable')} · ${signIn}`;
  }
}
