// Validates API responses against the pinned OpenAPI document (contracts/openapi.json).
// OpenAPI 3.1+ schemas are JSON Schema 2020-12, hence Ajv2020 rather than the default draft-07 Ajv.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Ajv2020, type ErrorObject, type ValidateFunction } from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const SPEC_FILE = join(import.meta.dirname, '..', 'contracts', 'openapi.json');
const DEFS_ID = 'urn:apf:openapi';

type Json = Record<string, unknown>;
type ResponseObject = { content?: Record<string, { schema?: Json }>; $ref?: string };
type Spec = {
  paths: Record<string, Record<string, { responses?: Record<string, ResponseObject> }>>;
  components?: { schemas?: Json; responses?: Record<string, ResponseObject> };
};

// Point schema refs at a standalone $defs document, so each response schema compiles on its own.
const rewriteRefs = <T>(node: T): T => JSON.parse(JSON.stringify(node).replaceAll('"#/components/schemas/', `"${DEFS_ID}#/$defs/`)) as T;

let cache: { spec: Spec; ajv: Ajv2020; compiled: Map<string, ValidateFunction> } | undefined;

const load = () => {
  if (cache) return cache;
  const spec = JSON.parse(readFileSync(SPEC_FILE, 'utf8')) as Spec;
  const ajv = new Ajv2020({ allErrors: true });
  addFormats(ajv);
  // Non-standard bits found in the pinned spec: the `example` annotation and four OpenAPI formats.
  ajv.addVocabulary(['example']);
  for (const format of ['binary', 'float', 'number', 'password']) ajv.addFormat(format, true);
  ajv.addSchema({ $id: DEFS_ID, $defs: rewriteRefs(spec.components?.schemas ?? {}) });
  cache = { spec, ajv, compiled: new Map() };
  return cache;
};

const resolveResponse = (spec: Spec, response: ResponseObject): ResponseObject => {
  const name = response.$ref?.replace('#/components/responses/', '');
  return name ? (spec.components?.responses?.[name] ?? response) : response;
};

const describe = (e: ErrorObject) => `${e.instancePath || '(root)'} ${e.message ?? 'is invalid'} [${e.schemaPath}]`;

/**
 * Returns contract violations for one response; an empty array means it conforms.
 * `path` is the OpenAPI path template, e.g. '/products/{productId}'.
 */
export function contractViolations(method: string, path: string, status: number, body: unknown): string[] {
  const { spec, ajv, compiled } = load();
  const operation = spec.paths[path]?.[method.toLowerCase()];
  if (!operation) return [`${method.toUpperCase()} ${path} is not in the contract`];

  const documented = operation.responses?.[String(status)];
  if (!documented) {
    return [
      `${method.toUpperCase()} ${path} returned ${status}, which the contract does not document (documents: ${Object.keys(operation.responses ?? {}).join(', ')})`,
    ];
  }

  const schema = resolveResponse(spec, documented).content?.['application/json']?.schema;
  if (!schema) return [];

  const key = `${method.toLowerCase()} ${path} ${status}`;
  let validate = compiled.get(key);
  if (!validate) {
    validate = ajv.compile(rewriteRefs(schema));
    compiled.set(key, validate);
  }
  return validate(body) ? [] : (validate.errors ?? []).map(describe);
}
