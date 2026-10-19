// npm run stlc:new -- <feature>           creates stlc/<feature>/01-requirements.md (exit 1 if the feature exists)
// npm run stlc:new -- <feature> <phase>   creates that phase's artifact from its template, if missing
// Artifacts appear when their phase starts. Creating them all up front left untouched templates that
// failed lint against earlier artifacts and kept every gate closed.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ARTIFACTS, FEATURE_SLUG, type Phase } from './artifacts.ts';
import { STLC_ROOT } from './lint.ts';

/** Local calendar date (YYYY-MM-DD). toISOString() would give the UTC date, a day off in the evening. */
export const today = (now = new Date()) =>
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

const fill = (root: string, file: string, feature: string, date: string) =>
  readFileSync(join(root, '_templates', file), 'utf8')
    .replaceAll('{{feature}}', feature)
    .replaceAll('{{date}}', date);

/** Starts a feature: creates its folder and 01-requirements.md. */
export function createFeature(root: string, feature: string, date = today()): string {
  if (!FEATURE_SLUG.test(feature)) throw new Error(`feature "${feature}" must be kebab-case`);
  const dir = join(root, feature);
  if (existsSync(dir)) throw new Error(`${dir} already exists`);
  mkdirSync(dir, { recursive: true });
  const { file } = ARTIFACTS[0];
  writeFileSync(join(dir, file), fill(root, file, feature, date));
  return join(dir, file);
}

/** Creates one phase's artifact from its template; an existing artifact is left untouched. */
export function createArtifact(root: string, feature: string, phase: Phase, date = today()): string {
  const dir = join(root, feature);
  if (!existsSync(dir)) throw new Error(`stlc/${feature}/ does not exist; run npm run stlc:new -- ${feature} first`);
  const artifact = ARTIFACTS.find((a) => a.phase === phase);
  if (!artifact) throw new Error(`unknown phase "${phase}"`);
  const path = join(dir, artifact.file);
  if (!existsSync(path)) writeFileSync(path, fill(root, artifact.file, feature, date));
  return path;
}

if (import.meta.main) {
  const [feature, phase] = process.argv.slice(2);
  const phases = ARTIFACTS.map((a) => a.phase);
  if (!feature || (phase && !phases.includes(phase as Phase))) {
    console.error(`usage: npm run stlc:new -- <feature> [${phases.join('|')}]`);
    process.exit(2);
  }
  try {
    if (phase) {
      const existed = existsSync(join(STLC_ROOT, feature, ARTIFACTS.find((a) => a.phase === phase)?.file ?? ''));
      const path = createArtifact(STLC_ROOT, feature, phase as Phase);
      console.log(existed ? `exists, left unchanged: ${path}` : `created ${path}`);
    } else {
      console.log(`created ${createFeature(STLC_ROOT, feature)}`);
    }
  } catch (e) {
    console.error((e as Error).message);
    process.exitCode = 1;
  }
}
