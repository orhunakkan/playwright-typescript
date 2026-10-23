import { z } from 'zod';

// Shared Zod parsers for SQLite values. Rows are parsed on the way out so repositories return typed objects.

// SQLite has no boolean type: flags are stored as 0 or 1.
export const SqlBoolean = z.union([z.literal(0), z.literal(1)]).transform((value) => value === 1);

export function toSqlBoolean(value: boolean): 0 | 1 {
  return value ? 1 : 0;
}

// node:sqlite reports new row IDs as number or bigint; ours always fit in a number.
export function toId(rowid: number | bigint): number {
  return Number(rowid);
}
