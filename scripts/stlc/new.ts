// npm run stlc:new -- <feature>
// Creates stlc/<feature>/ from stlc/_templates with feature and date filled in. Exit 1 if it exists.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ARTIFACTS, FEATURE_SLUG } from './artifacts.ts';
import { STLC_ROOT } from './lint.ts';

export const today = () => new Date().toISOString().slice(0, 10);

export function createFeature(root: string, feature: string, date = today()): string[] {
  if (!FEATURE_SLUG.test(feature)) throw new Error(`feature "${feature}" must be kebab-case`);
  const dir = join(root, feature);
  if (existsSync(dir)) throw new Error(`${dir} already exists`);
  mkdirSync(dir, { recursive: true });
  return ARTIFACTS.map(({ file }) => {
    const template = readFileSync(join(root, '_templates', file), 'utf8');
    writeFileSync(join(dir, file), template.replaceAll('{{feature}}', feature).replaceAll('{{date}}', date));
    return join(dir, file);
  });
}

if (import.meta.main) {
  const feature = process.argv[2];
  if (!feature) {
    console.error('usage: npm run stlc:new -- <feature>');
    process.exit(2);
  }
  try {
    for (const f of createFeature(STLC_ROOT, feature)) console.log(`created ${f}`);
  } catch (e) {
    console.error((e as Error).message);
    process.exitCode = 1;
  }
}
