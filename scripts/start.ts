// `npm start` (DEC-033, DEC-034): signs in to LinkedIn first, then starts the app (src/main.ts) in this process.
// The sign-in check never fails, so the app starts even when LinkedIn can't be reached; the app's banner then shows
// the LinkedIn status next to the board's address.
import { styleText } from 'node:util';
import { defaultLoginOptions, ensureLinkedInSession } from './linkedin-login.ts';

console.log(styleText('dim', 'Checking the LinkedIn sign-in…'));
await ensureLinkedInSession(defaultLoginOptions(), { quiet: true });
await import('../src/main.ts');
