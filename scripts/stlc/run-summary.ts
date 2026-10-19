// npm run stlc:run-summary -- <feature>
// Writes the generated run block of stlc/<feature>/04-execution.md from reports/results*.json.
// Output depends only on the report, so the same report always produces the same block.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cell, replaceGenerated, RUN_TRIAGE_COLUMNS, setFrontMatter } from './artifacts.ts';
import { STLC_ROOT } from './lint.ts';
import { byTestId, envLabel, outcomes, readReports, REPORT_FILES, sourcesLabel, type JsonReport, type Outcome } from './results.ts';

const statusLabel = (o: Outcome) => (o.status === 'unexpected' ? 'failed' : o.status);

export function runSummary(report: JsonReport, feature: string): string {
  const mine = outcomes(report).filter((o) => o.feature === feature);
  const header = `Results: ${sourcesLabel(report)} · env \`${envLabel(report)}\` · ${(report.stats.duration / 1000).toFixed(1)} s`;
  if (mine.length === 0) return `${header}\n\nNo tests tagged \`@REQ-${feature}\` in this run.`;

  const projects = [...new Set(mine.map((o) => o.project))].sort();
  const count = (p: string, pred: (o: Outcome) => boolean) => mine.filter((o) => o.project === p && pred(o)).length;
  const rows = projects.map((p) =>
    [
      p,
      count(p, (o) => o.status === 'expected' && !o.knownDefect),
      count(p, (o) => o.status === 'unexpected'),
      count(p, (o) => o.status === 'flaky'),
      count(p, (o) => o.status === 'skipped'),
      count(p, (o) => o.status === 'expected' && o.knownDefect),
    ].join(' | '),
  );

  const triage = mine
    .filter((o) => o.status === 'unexpected' || o.status === 'flaky')
    .sort((a, b) => byTestId(a.test, b.test) || a.project.localeCompare(b.project))
    .map((o) => `| ${o.test} | ${o.project} | ${statusLabel(o)} | ${o.tc ?? ''} | ${o.ac ?? ''} | ${cell(o.error)} |`);

  return [
    header,
    '',
    '| project | passed | failed | flaky | skipped | known defect |',
    '| ------- | ------ | ------ | ----- | ------- | ------------ |',
    ...rows.map((r) => `| ${r} |`),
    '',
    triage.length ? '### Needs triage' : '### Needs triage: none',
    ...(triage.length ? ['', `| ${RUN_TRIAGE_COLUMNS.join(' | ')} |`, `| ${RUN_TRIAGE_COLUMNS.map(() => '---').join(' | ')} |`, ...triage] : []),
  ].join('\n');
}

export function writeRunSummary(root: string, feature: string, report: JsonReport): string {
  const file = join(root, feature, '04-execution.md');
  const text = readFileSync(file, 'utf8');
  const updated = setFrontMatter(replaceGenerated(text, runSummary(report, feature)), 'updated', report.stats.startTime.slice(0, 10));
  writeFileSync(file, updated);
  return file;
}

if (import.meta.main) {
  const feature = process.argv[2];
  if (!feature) {
    console.error('usage: npm run stlc:run-summary -- <feature>');
    process.exit(2);
  }
  const report = readReports(join(STLC_ROOT, '..'));
  if (!report) {
    console.error(`${REPORT_FILES.join(' / ')} not found; run the tests first`);
    process.exit(1);
  }
  console.log(`updated ${writeRunSummary(STLC_ROOT, feature, report)}`);
}
