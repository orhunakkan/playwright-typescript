// npm run stlc:lint -- <feature>
// Structural check of a feature's STLC artifacts and its defects. Exit 1 on any issue.
import { join } from 'node:path';
import {
  ARTIFACTS,
  DEFECT_STATUSES,
  FEATURE_SLUG,
  PLACEHOLDER,
  PRIORITIES,
  RISKS,
  SEVERITIES,
  STATUSES,
  TEST_TYPES,
  TITLE_PREFIX,
  RUN_TRIAGE_COLUMNS,
  TRIAGE_COLUMNS,
  VERDICTS,
  findTable,
  parseCases,
  parsePlan,
  parseRequirements,
  readDefects,
  readFeature,
  type Doc,
  type Issue,
} from './artifacts.ts';

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const oneOf = (values: readonly string[], v: string | undefined) => v !== undefined && values.includes(v);

function lintFrontMatter(doc: Doc, feature: string, phase: string, issues: Issue[]) {
  const at = (key: string) => doc.metaLine[key] ?? 1;
  if (doc.meta['feature'] !== feature) issues.push({ file: doc.file, line: at('feature'), message: `front matter "feature" must be "${feature}"` });
  if (doc.meta['phase'] !== phase) issues.push({ file: doc.file, line: at('phase'), message: `front matter "phase" must be "${phase}"` });
  if (!oneOf(STATUSES, doc.meta['status']))
    issues.push({ file: doc.file, line: at('status'), message: `front matter "status" must be one of ${STATUSES.join(', ')}` });
  if (!DATE.test(doc.meta['updated'] ?? ''))
    issues.push({ file: doc.file, line: at('updated'), message: 'front matter "updated" must be YYYY-MM-DD' });
  // Drafts may still hold {{placeholders}}; anything approved or complete must not.
  if (doc.meta['status'] !== 'draft') {
    doc.lines.forEach((l, i) => {
      if (PLACEHOLDER.test(l)) issues.push({ file: doc.file, line: i + 1, message: `unfilled placeholder in a ${doc.meta['status']} artifact` });
    });
  }
}

function duplicates<T>(items: T[], key: (t: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((t) => (seen.has(key(t)) ? true : (seen.add(key(t)), false)));
}

export function lintFeature(root: string, feature: string): Issue[] {
  const issues: Issue[] = [];
  const dir = join(root, feature);
  if (!FEATURE_SLUG.test(feature)) return [{ file: dir, line: 0, message: `feature "${feature}" must be kebab-case` }];

  const { docs } = readFeature(root, feature);
  if (!docs.requirements) return [{ file: join(dir, ARTIFACTS[0].file), line: 0, message: 'missing; run npm run stlc:new -- <feature>' }];
  for (const a of ARTIFACTS) {
    const doc = docs[a.phase];
    if (doc) lintFrontMatter(doc, feature, a.phase, issues);
  }

  // 01 requirements
  const req = docs.requirements;
  if (!oneOf(['provided', 'inferred'], req.meta['source'])) {
    issues.push({ file: req.file, line: req.metaLine['source'] ?? 1, message: 'front matter "source" must be provided or inferred' });
  }
  const acs = parseRequirements(req);
  if (acs.length === 0) issues.push({ file: req.file, line: 1, message: 'no acceptance criteria; expected "### AC-<n>: <title>" headings' });
  for (const d of duplicates(acs, (a) => a.id)) issues.push({ file: req.file, line: d.line, message: `duplicate ${d.id}` });
  for (const ac of acs) {
    if (!oneOf(RISKS, ac.risk)) issues.push({ file: req.file, line: ac.line, message: `${ac.id} needs a "risk: ${RISKS.join(' | ')}" line` });
  }
  const acIds = new Set(acs.map((a) => a.id));

  // 02 test plan
  const plan = docs['test-plan'] && parsePlan(docs['test-plan']);
  if (docs['test-plan'] && plan) {
    const file = docs['test-plan'].file;
    issues.push(...plan.exitIssues);
    if (!plan.coverage) issues.push({ file, line: 1, message: `missing coverage table "| AC | ${TEST_TYPES.join(' | ')} |"` });
    for (const row of plan.coverage ?? []) {
      const ac = row.cells['AC'] ?? '';
      if (!acIds.has(ac)) issues.push({ file, line: row.line, message: `${ac || '(empty)'} is not in 01-requirements.md` });
      for (const t of TEST_TYPES) {
        const v = row.cells[t] ?? '';
        if (v !== '' && v.toLowerCase() !== 'x') issues.push({ file, line: row.line, message: `${ac} ${t}: use "x" or leave blank, got "${v}"` });
      }
      if ([...(plan.planned.get(ac) ?? [])].length === 0) issues.push({ file, line: row.line, message: `${ac} has no test type planned` });
    }
    for (const d of duplicates(plan.coverage ?? [], (r) => r.cells['AC'] ?? ''))
      issues.push({ file, line: d.line, message: `duplicate row for ${d.cells['AC']}` });
    for (const ac of acs)
      if (plan.coverage && !plan.planned.has(ac.id)) issues.push({ file, line: 1, message: `${ac.id} is missing from the coverage table` });
  }

  // 03 test cases
  if (docs['test-cases']) {
    const file = docs['test-cases'].file;
    const cases = parseCases(docs['test-cases']);
    if (!cases) issues.push({ file, line: 1, message: 'missing test-case table "| TC | AC | type | title | priority |"' });
    for (const tc of cases ?? []) {
      if (!/^TC-\d{3}$/.test(tc.id)) issues.push({ file, line: tc.line, message: `"${tc.id}" must look like TC-001` });
      if (!acIds.has(tc.ac)) issues.push({ file, line: tc.line, message: `${tc.id}: ${tc.ac || '(empty)'} is not in 01-requirements.md` });
      if (!oneOf(TEST_TYPES, tc.type)) issues.push({ file, line: tc.line, message: `${tc.id}: type must be one of ${TEST_TYPES.join(', ')}` });
      else if (plan && !plan.planned.get(tc.ac)?.has(tc.type as (typeof TEST_TYPES)[number])) {
        issues.push({ file, line: tc.line, message: `${tc.id}: ${tc.ac} × ${tc.type} is not planned in 02-test-plan.md` });
      }
      if (!TITLE_PREFIX.test(tc.title))
        issues.push({ file, line: tc.line, message: `${tc.id}: title must start with positive:, negative: or boundary:` });
      if (!oneOf(PRIORITIES, tc.priority))
        issues.push({ file, line: tc.line, message: `${tc.id}: priority must be one of ${PRIORITIES.join(', ')}` });
    }
    for (const d of duplicates(cases ?? [], (c) => c.id)) issues.push({ file, line: d.line, message: `duplicate ${d.id}` });
    for (const [ac, types] of plan?.planned ?? []) {
      for (const t of types) {
        if (!cases?.some((c) => c.ac === ac && c.type === t)) issues.push({ file, line: 1, message: `planned ${ac} × ${t} has no test case` });
      }
    }
  }

  // 04 execution: the triage table, when present, must use known verdicts and existing defects.
  const defects = readDefects(root, feature);
  if (docs.execution) {
    const file = docs.execution.file;
    const known = new Set(readDefects(root).map((d) => d.id));
    const triaged = findTable(docs.execution, TRIAGE_COLUMNS) ?? [];
    // A complete execution artifact has a triage row for every test the run block says needs one.
    if (docs.execution.meta['status'] === 'complete') {
      const rowsFor = new Set(triaged.map((r) => r.cells['test']));
      for (const row of findTable(docs.execution, RUN_TRIAGE_COLUMNS) ?? []) {
        const test = row.cells['test'] ?? '';
        if (!rowsFor.has(test)) issues.push({ file, line: row.line, message: `${test} needs triage, but has no row in the Triage table` });
      }
    }
    for (const row of triaged) {
      const verdict = row.cells['verdict'] ?? '';
      const def = row.cells['DEF'] ?? '';
      if (!oneOf(VERDICTS, verdict)) issues.push({ file, line: row.line, message: `verdict must be one of ${VERDICTS.join(', ')}` });
      if ((verdict === 'product' || verdict === 'flaky') && !def)
        issues.push({ file, line: row.line, message: `a ${verdict} verdict needs a DEF id` });
      if (def && !known.has(def)) issues.push({ file, line: row.line, message: `${def} does not exist in stlc/defects/` });
    }
  }

  // Defects for this feature
  for (const d of defects) {
    const at = (k: string) => d.metaLine[k] ?? 1;
    if (d.meta['id'] !== d.id) issues.push({ file: d.file, line: at('id'), message: `front matter "id" must be ${d.id}` });
    if (!acIds.has(d.meta['ac'] ?? ''))
      issues.push({ file: d.file, line: at('ac'), message: `ac "${d.meta['ac']}" is not in ${feature}/01-requirements.md` });
    if (!oneOf(SEVERITIES, d.meta['severity']))
      issues.push({ file: d.file, line: at('severity'), message: `severity must be one of ${SEVERITIES.join(', ')}` });
    if (!oneOf(DEFECT_STATUSES, d.meta['status']))
      issues.push({ file: d.file, line: at('status'), message: `status must be one of ${DEFECT_STATUSES.join(', ')}` });
    if (!DATE.test(d.meta['found'] ?? '')) issues.push({ file: d.file, line: at('found'), message: 'found must be YYYY-MM-DD' });
    for (const k of ['env', 'test']) if (!d.meta[k]) issues.push({ file: d.file, line: 1, message: `front matter "${k}" is required` });
  }

  return issues;
}

export const STLC_ROOT = join(import.meta.dirname, '..', '..', 'stlc');

if (import.meta.main) {
  const feature = process.argv[2];
  if (!feature) {
    console.error('usage: npm run stlc:lint -- <feature>');
    process.exit(2);
  }
  const issues = lintFeature(STLC_ROOT, feature);
  for (const i of issues) console.log(`${i.file}:${i.line}  ${i.message}`);
  console.log(issues.length ? `\n${issues.length} issue(s)` : `${feature}: artifacts OK`);
  process.exitCode = issues.length ? 1 : 0;
}
