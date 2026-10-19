// npm run stlc:trace -- <feature>
// Joins 01 + 02 + 03 + reports/results.json + 04 triage + defects into the traceability matrix and
// exit-criteria verdict, written into the generated block of 05-closure.md. Exit 1 if criteria fail.
// Output depends only on its inputs: the same files always produce the same bytes.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  cell,
  DEFAULT_EXIT_CRITERIA,
  findTable,
  parseCases,
  parsePlan,
  parseRequirements,
  readDefects,
  readFeature,
  replaceGenerated,
  setFrontMatter,
  TRIAGE_COLUMNS,
  type ExitCriteria,
} from './artifacts.ts';
import { STLC_ROOT } from './lint.ts';
import { byTestId, envLabel, outcomes, readReport, RESULTS_FILE, type JsonReport, type Outcome } from './results.ts';

export type AcStatus = 'covered' | 'failing, untriaged' | 'not run';
export type Trace = { markdown: string; met: boolean; acCoverage: number; openCritical: number; flakyRate: number };

const pct = (n: number) => `${Number(n.toFixed(1))}%`;

const statusCell = (o: Outcome) =>
  o.status === 'skipped' ? 'skip' : o.status === 'flaky' ? 'flaky' : o.status === 'unexpected' ? 'FAIL' : o.knownDefect ? 'known' : 'pass';

export function traceFeature(root: string, feature: string, report: JsonReport): Trace {
  const { docs } = readFeature(root, feature);
  const acs = docs.requirements ? parseRequirements(docs.requirements) : [];
  const exit: ExitCriteria = docs['test-plan'] ? parsePlan(docs['test-plan']).exit : DEFAULT_EXIT_CRITERIA;
  const cases = (docs['test-cases'] && parseCases(docs['test-cases'])) || [];
  const defects = readDefects(root, feature);
  const openDefects = new Set(defects.filter((d) => d.meta['status'] === 'open').map((d) => d.id));

  // test "file:line" -> defect ids, from triage rows and from each defect's own `test` field.
  const linked = new Map<string, Set<string>>();
  const link = (test: string | undefined, def: string | undefined) => {
    if (!test || !def) return;
    linked.set(test, (linked.get(test) ?? new Set()).add(def));
  };
  for (const row of (docs.execution && findTable(docs.execution, TRIAGE_COLUMNS)) || []) link(row.cells['test'], row.cells['DEF']);
  for (const d of defects) link(d.meta['test'], d.id);

  const mine = outcomes(report).filter((o) => o.feature === feature);
  const defectsOf = (o: Outcome) => [...new Set([...(linked.get(o.test) ?? []), ...o.issues.filter((i) => /^DEF-\d{3}$/.test(i))])].sort();
  const accounted = (o: Outcome) => o.status !== 'unexpected' || defectsOf(o).some((d) => openDefects.has(d));

  const knownTcs = new Set(cases.map((c) => c.id));
  const orphans = mine.filter((o) => !o.tc || !o.ac || !knownTcs.has(o.tc));
  const projects = [...new Set(mine.map((o) => o.project))].sort();

  // Per-AC status
  const acStatus = new Map<string, AcStatus>();
  for (const ac of acs) {
    const ran = mine.filter((o) => o.ac === ac.id && knownTcs.has(o.tc ?? '') && o.status !== 'skipped');
    acStatus.set(ac.id, ran.length === 0 ? 'not run' : ran.every(accounted) ? 'covered' : 'failing, untriaged');
  }
  const covered = [...acStatus.values()].filter((s) => s === 'covered').length;
  const acCoverage = acs.length ? (covered / acs.length) * 100 : 0;
  const executed = mine.filter((o) => o.status !== 'skipped');
  const flaky = executed.filter((o) => o.status === 'flaky').length;
  const flakyRate = executed.length ? (flaky / executed.length) * 100 : 0;
  const openCritical = defects.filter((d) => d.meta['status'] === 'open' && d.meta['severity'] === 'critical').length;

  const checks = [
    {
      name: 'AC coverage',
      target: `≥ ${exit.acCoverageMin}%`,
      actual: `${pct(acCoverage)} (${covered}/${acs.length})`,
      ok: acCoverage >= exit.acCoverageMin,
    },
    { name: 'open critical defects', target: `≤ ${exit.openCriticalMax}`, actual: String(openCritical), ok: openCritical <= exit.openCriticalMax },
    {
      name: 'flaky rate',
      target: `≤ ${exit.flakyRateMax}%`,
      actual: `${pct(flakyRate)} (${flaky}/${executed.length})`,
      ok: flakyRate <= exit.flakyRateMax,
    },
  ];
  const met = checks.every((c) => c.ok);

  // Matrix: one row per TC (and per test implementing it), plus a row per AC without any TC.
  const matrix: string[] = [];
  for (const ac of acs) {
    const acCases = cases.filter((c) => c.ac === ac.id).sort((a, b) => a.id.localeCompare(b.id));
    if (acCases.length === 0) matrix.push(`| ${ac.id} | — | — | — | ${projects.map(() => '—').join(' | ')} | |`);
    for (const tc of acCases) {
      const tests = [...new Set(mine.filter((o) => o.tc === tc.id).map((o) => o.test))].sort(byTestId);
      if (tests.length === 0) matrix.push(`| ${ac.id} | ${tc.id} | ${tc.type} | not implemented | ${projects.map(() => '—').join(' | ')} | |`);
      for (const test of tests) {
        const runs = mine.filter((o) => o.test === test);
        const cells = projects.map((p) => {
          const o = runs.find((r) => r.project === p);
          return o ? statusCell(o) : '—';
        });
        const defs = [...new Set(runs.flatMap(defectsOf))].sort();
        matrix.push(`| ${ac.id} | ${tc.id} | ${tc.type} | ${test} | ${cells.join(' | ')} | ${defs.join(', ')} |`);
      }
    }
  }

  const lines = [
    `Source: \`${RESULTS_FILE}\`, run started ${report.stats.startTime} · env \`${envLabel(report)}\``,
    '',
    '### Exit criteria',
    '',
    '| criterion | target | actual | result |',
    '| --------- | ------ | ------ | ------ |',
    ...checks.map((c) => `| ${c.name} | ${c.target} | ${c.actual} | ${c.ok ? 'pass' : 'FAIL'} |`),
    '',
    `**Exit criteria: ${met ? 'MET' : 'NOT MET'}**`,
    '',
    '### Acceptance criteria',
    '',
    '| AC | title | risk | status |',
    '| -- | ----- | ---- | ------ |',
    ...acs.map((ac) => `| ${ac.id} | ${cell(ac.title)} | ${ac.risk ?? ''} | ${acStatus.get(ac.id)} |`),
    '',
    '### Traceability',
    '',
    `| AC | TC | type | test | ${projects.join(' | ')} | defect |`,
    `| -- | -- | ---- | ---- | ${projects.map(() => '---').join(' | ')} | ------ |`,
    ...matrix,
    '',
    'Cell values: pass · FAIL · flaky (passed on retry) · known (expected failure, linked defect) · skip · — (not run in that project)',
  ];
  if (orphans.length) {
    lines.push('', '### Orphan tests', '', `Tagged \`@REQ-${feature}\` but missing an AC/TC tag, or with a TC not in 03-test-cases.md:`, '');
    for (const test of [...new Set(orphans.map((o) => `${o.test} (${o.tc ?? 'no TC'})`))].sort(byTestId)) lines.push(`- ${test}`);
  }
  return { markdown: lines.join('\n'), met, acCoverage, openCritical, flakyRate };
}

export function writeTrace(root: string, feature: string, report: JsonReport): Trace {
  const trace = traceFeature(root, feature, report);
  const file = join(root, feature, '05-closure.md');
  const text = readFileSync(file, 'utf8');
  writeFileSync(file, setFrontMatter(replaceGenerated(text, trace.markdown), 'updated', report.stats.startTime.slice(0, 10)));
  return trace;
}

if (import.meta.main) {
  const feature = process.argv[2];
  if (!feature) {
    console.error('usage: npm run stlc:trace -- <feature>');
    process.exit(2);
  }
  const report = readReport(join(STLC_ROOT, '..', RESULTS_FILE));
  if (!report) {
    console.error(`${RESULTS_FILE} not found; run the tests first`);
    process.exit(1);
  }
  const trace = writeTrace(STLC_ROOT, feature, report);
  console.log(`updated ${join('stlc', feature, '05-closure.md')}: exit criteria ${trace.met ? 'MET' : 'NOT MET'}`);
  process.exitCode = trace.met ? 0 : 1;
}
