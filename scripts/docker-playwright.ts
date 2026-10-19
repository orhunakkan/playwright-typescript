// Runs `playwright test <args>` inside the official Playwright image so visual baselines are
// produced and compared on one pinned Linux environment, whatever the host OS.
// Flags per https://playwright.dev/docs/docker: --ipc=host (Chromium memory), --init (PID 1 reaping).
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');

// The image must match the installed @playwright/test version, or the browsers won't be found.
const { version } = JSON.parse(readFileSync(join(root, 'node_modules/@playwright/test/package.json'), 'utf8')) as { version: string };
const image = `mcr.microsoft.com/playwright:v${version}-noble`;

// `-e NAME` forwards the host value only when it is set, so .env files still apply otherwise.
const forwarded = ['ENV', 'BASE_URL', 'API_URL', 'API_HEALTH_PATH', 'CI'].flatMap((name) => ['-e', name]);

const args = [
  'run',
  '--rm',
  '--init',
  '--ipc=host',
  '-e',
  'PW_VISUAL=1',
  ...forwarded,
  '-v',
  `${root}:/work`,
  '-w',
  '/work',
  image,
  'node',
  'node_modules/@playwright/test/cli.js',
  'test',
  ...process.argv.slice(2),
];

console.log(`> docker ${args.join(' ')}\n`);
const result = spawnSync('docker', args, { stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
