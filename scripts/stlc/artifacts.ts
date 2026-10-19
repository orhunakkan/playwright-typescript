// Parser for the STLC artifact formats defined in SPEC-stlc-artifacts.md. Formats are strict on
// purpose so these scripts, not agents, decide gates, coverage and exit criteria. No YAML/markdown
// dependency: flat front matter and pipe tables are parsed with small regexes.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const TEST_TYPES = ['e2e', 'api', 'a11y', 'perf', 'visual'] as const;
export type TestType = (typeof TEST_TYPES)[number];

export const STATUSES = ['draft', 'approved', 'complete'] as const;
export const RISKS = ['high', 'medium', 'low'] as const;
export const PRIORITIES = ['high', 'medium', 'low'] as const;
export const SEVERITIES = ['critical', 'major', 'minor', 'trivial'] as const;
export const DEFECT_STATUSES = ['open', 'fixed', 'wont-fix', 'duplicate'] as const;
export const VERDICTS = ['product', 'test', 'environment', 'flaky'] as const;
export const TITLE_PREFIX = /^(positive|negative|boundary): \S/;

/** Artifacts in phase order. `phase` is the front-matter value each file must carry. */
export const ARTIFACTS = [
  { phase: 'requirements', file: '01-requirements.md' },
  { phase: 'test-plan', file: '02-test-plan.md' },
  { phase: 'test-cases', file: '03-test-cases.md' },
  { phase: 'execution', file: '04-execution.md' },
  { phase: 'closure', file: '05-closure.md' },
] as const;
export type Phase = (typeof ARTIFACTS)[number]['phase'];

export const FEATURE_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const PLACEHOLDER = /\{\{[^}]*\}\}/;

export type Issue = { file: string; line: number; message: string };

export type Doc = {
  file: string;
  meta: Record<string, string>;
  metaLine: Record<string, number>;
  /** Body lines with HTML comments blanked out, so guidance text is never parsed. 0-based. */
  lines: string[];
  bodyStart: number;
};

export function parseDoc(file: string, text: string): Doc {
  const raw = text.replace(/\r\n/g, '\n').split('\n');
  const meta: Record<string, string> = {};
  const metaLine: Record<string, number> = {};
  let bodyStart = 0;
  if (raw[0] === '---') {
    const end = raw.indexOf('---', 1);
    if (end > 0) {
      for (let i = 1; i < end; i++) {
        const m = /^([\w-]+):\s*(.*?)\s*(?:#.*)?$/.exec(raw[i] ?? '');
        if (m?.[1]) {
          meta[m[1]] = m[2] ?? '';
          metaLine[m[1]] = i + 1;
        }
      }
      bodyStart = end + 1;
    }
  }
  // Blank out <!-- ... --> (possibly multi-line) while keeping line numbers stable.
  let inComment = false;
  const lines = raw.map((line) => {
    let out = '';
    let rest = line;
    while (rest.length) {
      if (inComment) {
        const close = rest.indexOf('-->');
        if (close < 0) return out;
        inComment = false;
        rest = rest.slice(close + 3);
      } else {
        const open = rest.indexOf('<!--');
        if (open < 0) return out + rest;
        out += rest.slice(0, open);
        inComment = true;
        rest = rest.slice(open + 4);
      }
    }
    return out;
  });
  return { file, meta, metaLine, lines, bodyStart };
}

export function readDoc(path: string): Doc | undefined {
  return existsSync(path) ? parseDoc(path, readFileSync(path, 'utf8')) : undefined;
}

export type Row = { cells: Record<string, string>; line: number };

const splitRow = (line: string): string[] | undefined => {
  const t = line.trim();
  return t.startsWith('|')
    ? t
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((s) => s.trim())
    : undefined;
};

/** Finds the first pipe table whose header is exactly `columns` (case-insensitive). */
export function findTable(doc: Doc, columns: readonly string[]): Row[] | undefined {
  for (let i = doc.bodyStart; i < doc.lines.length - 1; i++) {
    const header = splitRow(doc.lines[i] ?? '');
    const isMatch = header?.length === columns.length && header.every((h, k) => h.toLowerCase() === columns[k]?.toLowerCase());
    if (!isMatch || !/^\s*\|?\s*:?-{3,}/.test(doc.lines[i + 1] ?? '')) continue;
    const rows: Row[] = [];
    for (let j = i + 2; j < doc.lines.length; j++) {
      const cells = splitRow(doc.lines[j] ?? '');
      if (!cells) break;
      rows.push({ cells: Object.fromEntries(columns.map((c, k) => [c, cells[k] ?? ''])), line: j + 1 });
    }
    return rows;
  }
  return undefined;
}

/** Lines (with 1-based numbers) under `## <heading>` up to the next `## `. */
export function section(doc: Doc, heading: string): { text: string; line: number }[] {
  const start = doc.lines.findIndex((l, i) => i >= doc.bodyStart && l.trim().toLowerCase() === `## ${heading}`.toLowerCase());
  if (start < 0) return [];
  const out: { text: string; line: number }[] = [];
  for (let i = start + 1; i < doc.lines.length && !/^##\s/.test(doc.lines[i] ?? ''); i++) out.push({ text: doc.lines[i] ?? '', line: i + 1 });
  return out;
}

export type AcceptanceCriterion = { id: string; title: string; risk: string | undefined; line: number };

/** `### AC-<n>: <title>` headings, each followed (before the next heading) by `risk: <level>`. */
export function parseRequirements(doc: Doc): AcceptanceCriterion[] {
  const acs: AcceptanceCriterion[] = [];
  let current: AcceptanceCriterion | undefined;
  for (let i = doc.bodyStart; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? '';
    const heading = /^###\s+(AC-\d+):\s*(.+?)\s*$/.exec(line);
    if (heading?.[1] && heading[2]) {
      current = { id: heading[1], title: heading[2], risk: undefined, line: i + 1 };
      acs.push(current);
      continue;
    }
    if (/^#{1,6}\s/.test(line)) current = undefined;
    const risk = /^risk:\s*(\S+)\s*$/.exec(line);
    if (risk?.[1] && current && current.risk === undefined) current.risk = risk[1];
  }
  return acs;
}

export const COVERAGE_COLUMNS = ['AC', ...TEST_TYPES] as const;

export type ExitCriteria = { acCoverageMin: number; openCriticalMax: number; flakyRateMax: number };
export const DEFAULT_EXIT_CRITERIA: ExitCriteria = { acCoverageMin: 100, openCriticalMax: 0, flakyRateMax: 2 };
const EXIT_KEYS: Record<string, keyof ExitCriteria> = {
  'ac-coverage-min': 'acCoverageMin',
  'open-critical-max': 'openCriticalMax',
  'flaky-rate-max': 'flakyRateMax',
};

export type Plan = { coverage: Row[] | undefined; planned: Map<string, Set<TestType>>; exit: ExitCriteria; exitIssues: Issue[] };

export function parsePlan(doc: Doc): Plan {
  const coverage = findTable(doc, COVERAGE_COLUMNS);
  const planned = new Map<string, Set<TestType>>();
  for (const row of coverage ?? []) {
    const types = new Set(TEST_TYPES.filter((t) => row.cells[t]?.toLowerCase() === 'x'));
    planned.set(row.cells['AC'] ?? '', types);
  }
  const exit = { ...DEFAULT_EXIT_CRITERIA };
  const exitIssues: Issue[] = [];
  for (const { text, line } of section(doc, 'Exit criteria')) {
    const m = /^\s*-\s*([\w-]+):\s*([\d.]+)\s*%?\s*$/.exec(text);
    if (!m?.[1] || !m[2]) {
      if (text.trim()) exitIssues.push({ file: doc.file, line, message: `exit criterion must be "- <key>: <number>", got "${text.trim()}"` });
      continue;
    }
    const key = EXIT_KEYS[m[1]];
    if (key) exit[key] = Number(m[2]);
    else exitIssues.push({ file: doc.file, line, message: `unknown exit criterion "${m[1]}" (expected ${Object.keys(EXIT_KEYS).join(', ')})` });
  }
  return { coverage, planned, exit, exitIssues };
}

export const CASE_COLUMNS = ['TC', 'AC', 'type', 'title', 'priority'] as const;

export type TestCase = { id: string; ac: string; type: string; title: string; priority: string; line: number };

export function parseCases(doc: Doc): TestCase[] | undefined {
  return findTable(doc, CASE_COLUMNS)?.map((r) => ({
    id: r.cells['TC'] ?? '',
    ac: r.cells['AC'] ?? '',
    type: r.cells['type'] ?? '',
    title: r.cells['title'] ?? '',
    priority: r.cells['priority'] ?? '',
    line: r.line,
  }));
}

export const TRIAGE_COLUMNS = ['test', 'verdict', 'DEF', 'note'] as const;

export type Defect = { file: string; id: string; meta: Record<string, string>; metaLine: Record<string, number> };

/** All defects under `<root>/defects/`, optionally only those for one feature. */
export function readDefects(root: string, feature?: string): Defect[] {
  const dir = join(root, 'defects');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /^DEF-\d{3}\.md$/.test(f))
    .sort()
    .map((f) => {
      const doc = parseDoc(join(dir, f), readFileSync(join(dir, f), 'utf8'));
      return { file: doc.file, id: f.replace(/\.md$/, ''), meta: doc.meta, metaLine: doc.metaLine };
    })
    .filter((d) => !feature || d.meta['feature'] === feature);
}

export type Feature = { name: string; dir: string; docs: Partial<Record<Phase, Doc>> };

export function readFeature(root: string, name: string): Feature {
  const dir = join(root, name);
  const docs: Partial<Record<Phase, Doc>> = {};
  for (const a of ARTIFACTS) {
    const doc = readDoc(join(dir, a.file));
    if (doc) docs[a.phase] = doc;
  }
  return { name, dir, docs };
}
