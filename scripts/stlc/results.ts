// Reads Playwright's JSON report (reports/results.json) into flat per-test outcomes.
// Shape verified against a real 1.64 report: tags are stored without "@" and include describe-level
// tags; spec.file is POSIX and relative to config.rootDir (the testDir).
import { existsSync, readFileSync } from 'node:fs';
import { join, posix } from 'node:path';

type JsonResult = { status: string; errors?: { message?: string }[] };
type JsonTest = {
  projectName: string;
  status: string;
  expectedStatus: string;
  annotations: { type: string; description?: string }[];
  results: JsonResult[];
};
type JsonSpec = { title: string; file: string; line: number; tags: string[]; tests: JsonTest[] };
type JsonSuite = { specs?: JsonSpec[]; suites?: JsonSuite[] };
export type JsonReport = {
  config: { rootDir: string; metadata?: Record<string, unknown> };
  suites: JsonSuite[];
  stats: { startTime: string; duration: number };
  /** Set when several report files were merged (host run + Docker visual run). */
  sources?: { file: string; startTime: string }[];
};

/** expected = as expected (passed, or a test.fail() that failed); unexpected = failed. */
export type Status = 'expected' | 'unexpected' | 'flaky' | 'skipped';

export type Outcome = {
  /** Repo-relative POSIX path plus line, e.g. tests/e2e/search/x.spec.ts:12 */
  test: string;
  title: string;
  project: string;
  status: Status;
  /** True for a test.fail() known defect. */
  knownDefect: boolean;
  tags: string[];
  feature: string | undefined;
  ac: string | undefined;
  tc: string | undefined;
  issues: string[];
  error: string | undefined;
};

export const RESULTS_FILE = posix.join('reports', 'results.json');
/** Host run and Docker visual run (see playwright.config.ts), relative to the repo root. */
export const REPORT_FILES = [RESULTS_FILE, posix.join('reports', 'results-visual.json')];

export function readReport(path: string): JsonReport | undefined {
  return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as JsonReport) : undefined;
}

/** Reads and merges every report in REPORT_FILES under `repoRoot`; undefined when none exist. */
export function readReports(repoRoot: string): JsonReport | undefined {
  const found = REPORT_FILES.flatMap((file) => {
    const report = readReport(join(repoRoot, file));
    return report ? [{ file, report }] : [];
  });
  return found.length ? mergeReports(found) : undefined;
}

export function mergeReports(parts: { file: string; report: JsonReport }[]): JsonReport {
  const [first] = parts;
  if (!first) throw new Error('nothing to merge');
  return {
    config: first.report.config,
    suites: parts.flatMap((p) => p.report.suites),
    stats: {
      startTime: parts.map((p) => p.report.stats.startTime).sort()[0] ?? first.report.stats.startTime,
      duration: parts.reduce((sum, p) => sum + p.report.stats.duration, 0),
    },
    sources: parts.map((p) => ({ file: p.file, startTime: p.report.stats.startTime })),
  };
}

/** "reports/results.json (2026-…), reports/results-visual.json (2026-…)" for headers. */
export const sourcesLabel = (report: JsonReport): string =>
  (report.sources ?? [{ file: RESULTS_FILE, startTime: report.stats.startTime }]).map((s) => `\`${s.file}\` (${s.startTime})`).join(', ');

const tagValue = (tags: string[], prefix: string) => tags.find((t) => t.startsWith(prefix));

export function outcomes(report: JsonReport): Outcome[] {
  // testDir is ./tests, so spec paths are prefixed with the rootDir's last segment.
  const dir = posix.basename(report.config.rootDir.split('\\').join('/'));
  const out: Outcome[] = [];
  const walk = (suite: JsonSuite) => {
    for (const spec of suite.specs ?? []) {
      for (const t of spec.tests) {
        const tags = spec.tags.map((tag) => tag.replace(/^@/, ''));
        // Latest attempt that failed: for a flaky test that is the retry-0 error, not the passing retry.
        const failed = t.results.findLast((r) => r.errors?.length);
        out.push({
          test: `${dir}/${spec.file}:${spec.line}`,
          title: spec.title,
          project: t.projectName,
          status: t.status as Status,
          knownDefect: t.expectedStatus === 'failed',
          tags,
          feature: tagValue(tags, 'REQ-')?.slice(4),
          ac: tagValue(tags, 'AC-'),
          tc: tagValue(tags, 'TC-'),
          issues: t.annotations.filter((a) => a.type === 'issue' && a.description).map((a) => a.description as string),
          error: failed?.errors?.[0]?.message
            ?.split('\n')
            .find((l) => l.trim())
            ?.trim(),
        });
      }
    }
    for (const child of suite.suites ?? []) walk(child);
  };
  report.suites.forEach(walk);
  return out;
}

/** Orders "path:line" ids by path, then numerically by line (so :7 sorts before :10). */
export const byTestId = (a: string, b: string): number => {
  const [pa = '', la = '0'] = a.split(/:(?=\d+$)/);
  const [pb = '', lb = '0'] = b.split(/:(?=\d+$)/);
  return pa.localeCompare(pb) || Number(la) - Number(lb);
};

/** "default https://…" from the run's metadata (set in playwright.config.ts). */
export const envLabel = (report: JsonReport | undefined): string => {
  const m = report?.config.metadata ?? {};
  return [m['env'], m['baseUrl']].filter(Boolean).join(' ') || 'unknown';
};
