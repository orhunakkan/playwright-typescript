// npm run stlc:check-tests -- <feature>
// Checks, without running anything, that the feature's tests match 03-test-cases.md: location,
// REQ/AC/TC tags, test type and title prefix, and that every TC is implemented. Exit 1 on any gap.
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { parseCases, readFeature, TEST_TYPES, TITLE_PREFIX, type Issue, type TestCase } from './artifacts.ts';
import { STLC_ROOT } from './lint.ts';
import { byTestId, outcomes, type JsonReport, type Outcome } from './results.ts';

export function checkTests(feature: string, cases: TestCase[], all: Outcome[]): Issue[] {
  const issues: Issue[] = [];
  const add = (test: string, message: string) => {
    const [file = test, line = '0'] = test.split(/:(?=\d+$)/);
    issues.push({ file, line: Number(line), message });
  };
  // A test runs once per project; check each file:line once.
  const unique = [...new Map(all.map((o) => [o.test, o])).values()].sort((a, b) => byTestId(a.test, b.test));
  const folder = new RegExp(`^tests/(${TEST_TYPES.join('|')})/${feature}/`);

  for (const o of unique) {
    const inFolder = folder.exec(o.test);
    if (o.feature !== feature) {
      if (inFolder) add(o.test, `is under tests/${inFolder[1]}/${feature}/ but not tagged @REQ-${feature}`);
      continue;
    }
    const acTags = o.tags.filter((t) => /^AC-\d+$/.test(t));
    const tcTags = o.tags.filter((t) => /^TC-\d{3}$/.test(t));
    if (!inFolder) add(o.test, `tagged @REQ-${feature} but not under tests/<type>/${feature}/`);
    if (acTags.length !== 1) add(o.test, `needs exactly one @AC-<n> tag, has ${acTags.length}`);
    if (tcTags.length !== 1) add(o.test, `needs exactly one @TC-<nnn> tag, has ${tcTags.length}`);
    if (!TITLE_PREFIX.test(o.title)) add(o.test, `title must start with positive:, negative: or boundary: ("${o.title}")`);
    const tc = cases.find((c) => c.id === tcTags[0]);
    if (tcTags.length === 1 && !tc) add(o.test, `${tcTags[0]} is not in 03-test-cases.md`);
    if (tc && acTags.length === 1 && tc.ac !== acTags[0]) add(o.test, `${tc.id} belongs to ${tc.ac}, but the test is tagged @${acTags[0]}`);
    if (tc && inFolder && tc.type !== inFolder[1]) add(o.test, `${tc.id} is a ${tc.type} case, but the test is under tests/${inFolder[1]}/`);
  }

  const implemented = new Set(unique.filter((o) => o.feature === feature).flatMap((o) => o.tags.filter((t) => /^TC-\d{3}$/.test(t))));
  for (const c of cases)
    if (!implemented.has(c.id)) issues.push({ file: `stlc/${feature}/03-test-cases.md`, line: c.line, message: `${c.id} has no test` });
  return issues;
}

/** Lists every test (visual included) as Playwright's JSON report, without running anything. */
export function listTests(repoRoot: string): JsonReport {
  const cli = join(repoRoot, 'node_modules', '@playwright', 'test', 'cli.js');
  const res = spawnSync(process.execPath, [cli, 'test', '--list', '--reporter=json'], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, PW_VISUAL: '1' },
  });
  if (res.status !== 0) throw new Error(`playwright test --list failed:\n${res.stderr || res.stdout}`);
  return JSON.parse(res.stdout) as JsonReport;
}

if (import.meta.main) {
  const feature = process.argv[2];
  if (!feature) {
    console.error('usage: npm run stlc:check-tests -- <feature>');
    process.exit(2);
  }
  const doc = readFeature(STLC_ROOT, feature).docs['test-cases'];
  if (!doc) {
    console.error(`stlc/${feature}/03-test-cases.md not found`);
    process.exit(1);
  }
  const issues = checkTests(feature, parseCases(doc) ?? [], outcomes(listTests(join(STLC_ROOT, '..'))));
  for (const i of issues) console.log(`${i.file}:${i.line}  ${i.message}`);
  console.log(issues.length ? `\n${issues.length} issue(s)` : `${feature}: tests match 03-test-cases.md`);
  process.exitCode = issues.length ? 1 : 0;
}
