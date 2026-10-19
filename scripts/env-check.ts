// STLC phase 4 preflight: is the target reachable and is the local toolchain ready?
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { chromium, firefox, webkit } from '@playwright/test';
import { env } from '../config/env.ts';

type Status = 'PASS' | 'FAIL' | 'WARN';
let failed = false;

const report = (status: Status, check: string, detail: string) => {
  if (status === 'FAIL') failed = true;
  console.log(`${status.padEnd(4)}  ${check.padEnd(22)} ${detail}`);
};

const checkUrl = async (check: string, url: string) => {
  try {
    const res = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15_000) });
    report(res.status < 400 ? 'PASS' : 'FAIL', check, `${res.status} ${url}`);
  } catch (e) {
    report('FAIL', check, `${url} (${(e as Error).message})`);
  }
};

console.log(`Environment: ${env.name}\n`);

await checkUrl('BASE_URL reachable', env.baseUrl);
await checkUrl('API_URL reachable', env.apiUrl.replace(/\/+$/, '') + env.apiHealthPath);

for (const browser of [chromium, firefox, webkit]) {
  const path = browser.executablePath();
  report(existsSync(path) ? 'PASS' : 'FAIL', `${browser.name()} installed`, existsSync(path) ? '' : 'run: npx playwright install');
}

const docker = spawnSync('docker', ['info', '--format', '{{.OSType}}'], { encoding: 'utf8' });
const dockerOk = docker.status === 0 && docker.stdout.trim() === 'linux';
report(dockerOk ? 'PASS' : 'WARN', 'docker (visual only)', dockerOk ? '' : 'Docker with a Linux engine is needed for npm run test:visual');

process.exitCode = failed ? 1 : 0;
