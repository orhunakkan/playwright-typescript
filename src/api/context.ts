import type { DatabaseSync } from 'node:sqlite';
import type { Repositories } from '../db/repositories/index.ts';

// What every API handler gets: the database, its repositories, a clock and the app version.
export interface AppContext {
  db: DatabaseSync;
  repos: Repositories;
  now: () => string;
  version: string;
}
