import { expect } from '@playwright/test';

export type FieldType = 'string' | 'number' | 'boolean';

export interface FieldSchema {
  type: FieldType;
  optional?: boolean;
}

export type ObjectSchema = Record<string, FieldSchema>;

/**
 * Asserts that a plain object exactly matches a schema:
 * - no extra keys (catches undocumented API additions)
 * - no missing required keys (catches API removals)
 * - correct primitive type for every key
 */
export function expectMatchesSchema(obj: unknown, schema: ObjectSchema, context = 'response'): void {
  const record = obj as Record<string, unknown>;
  const allSchemaKeys = Object.keys(schema);

  for (const key of Object.keys(record)) {
    expect(allSchemaKeys.includes(key), `[${context}] Unexpected key "${key}" not defined in schema`).toBe(true);
  }

  for (const [key, field] of Object.entries(schema)) {
    if (!field.optional) {
      expect(Object.prototype.hasOwnProperty.call(record, key), `[${context}] Required key "${key}" is missing`).toBe(true);
    }
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      expect(typeof record[key], `[${context}] Key "${key}" expected type "${field.type}" but got "${typeof record[key]}"`).toBe(field.type);
    }
  }
}

/**
 * Asserts that every element of an array matches the schema.
 * Use for list endpoints such as GET /notes.
 */
export function expectArrayMatchesSchema(arr: unknown[], schema: ObjectSchema, context = 'response array'): void {
  expect(Array.isArray(arr), `[${context}] Expected an array`).toBe(true);
  arr.forEach((item, index) => {
    expectMatchesSchema(item as Record<string, unknown>, schema, `${context}[${index}]`);
  });
}

export const UserDataSchema: ObjectSchema = {
  id: { type: 'string' },
  name: { type: 'string' },
  email: { type: 'string' },
};

export const LoginDataSchema: ObjectSchema = {
  id: { type: 'string' },
  name: { type: 'string' },
  email: { type: 'string' },
  token: { type: 'string' },
};

export const UserProfileDataSchema: ObjectSchema = {
  id: { type: 'string' },
  name: { type: 'string' },
  email: { type: 'string' },
  phone: { type: 'string', optional: true },
  company: { type: 'string', optional: true },
};

export const NoteDataSchema: ObjectSchema = {
  id: { type: 'string' },
  title: { type: 'string' },
  description: { type: 'string' },
  category: { type: 'string' },
  completed: { type: 'boolean' },
  created_at: { type: 'string' },
  updated_at: { type: 'string' },
  user_id: { type: 'string' },
};

export const ErrorResponseSchema: ObjectSchema = {
  success: { type: 'boolean' },
  status: { type: 'number' },
  message: { type: 'string' },
};

export const HealthCheckSchema: ObjectSchema = {
  success: { type: 'boolean' },
  status: { type: 'number' },
  message: { type: 'string' },
};
