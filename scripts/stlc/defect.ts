// npm run stlc:defect -- <feature> <AC> <test file:line>
// Creates the next stlc/defects/DEF-<nnn>.md from the template and prints its path.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseRequirements, readDoc } from './artifacts.ts';
import { STLC_ROOT } from './lint.ts';
import { today } from './new.ts';
import { envLabel, readReports } from './results.ts';

export function nextDefectId(root: string): string {
  const dir = join(root, 'defects');
  const numbers = existsSync(dir)
    ? readdirSync(dir)
        .map((f) => /^DEF-(\d{3})\.md$/.exec(f)?.[1])
        .filter(Boolean)
    : [];
  const next = Math.max(0, ...numbers.map(Number)) + 1;
  return `DEF-${String(next).padStart(3, '0')}`;
}

export function createDefect(root: string, feature: string, ac: string, test: string, env: string, date = today()): string {
  const req = readDoc(join(root, feature, '01-requirements.md'));
  if (!req) throw new Error(`stlc/${feature}/01-requirements.md not found`);
  if (!parseRequirements(req).some((a) => a.id === ac)) throw new Error(`${ac} is not in stlc/${feature}/01-requirements.md`);

  const id = nextDefectId(root);
  const values: Record<string, string> = { id, feature, ac, test, env, date };
  const text = readFileSync(join(root, '_templates', 'DEF.md'), 'utf8').replace(
    /\{\{(id|feature|ac|test|env|date)\}\}/g,
    (_, k: string) => values[k] ?? '',
  );
  mkdirSync(join(root, 'defects'), { recursive: true });
  const file = join(root, 'defects', `${id}.md`);
  writeFileSync(file, text);
  return file;
}

if (import.meta.main) {
  const [feature, ac, test] = process.argv.slice(2);
  if (!feature || !ac || !test) {
    console.error('usage: npm run stlc:defect -- <feature> <AC-n> <test file:line>');
    process.exit(2);
  }
  try {
    const env = envLabel(readReports(join(STLC_ROOT, '..')));
    console.log(createDefect(STLC_ROOT, feature, ac, test, env));
  } catch (e) {
    console.error((e as Error).message);
    process.exitCode = 1;
  }
}
