// Refreshes contracts/openapi.json from the target. The pinned copy is what contract tests validate
// against, so an upstream API change shows up as a reviewed diff instead of a silent pass.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from '../config/env.ts';

const url = env.apiUrl.replace(/\/+$/, '') + env.apiSpecPath;
const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
if (!res.ok) throw new Error(`GET ${url} returned ${res.status}`);

const spec = (await res.json()) as { openapi?: string; info?: { title?: string; version?: string } };
if (!spec.openapi) throw new Error(`${url} is not an OpenAPI document (no "openapi" field)`);

const dir = join(import.meta.dirname, '..', 'contracts');
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, 'openapi.json'), JSON.stringify(spec, null, 2) + '\n');

console.log(`Pinned OpenAPI ${spec.openapi} "${spec.info?.title}" ${spec.info?.version} from ${url}`);
console.log('Review `git diff contracts/` before committing.');
