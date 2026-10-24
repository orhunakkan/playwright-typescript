import type { DatabaseSync } from 'node:sqlite';
import type { Repositories } from '../db/repositories/index.ts';

// What every API handler gets: the database, its repositories, a clock, the app version and where the saved
// LinkedIn login lives (DEC-032).
export interface AppContext {
  db: DatabaseSync;
  repos: Repositories;
  now: () => string;
  version: string;
  linkedinSessionPath: string;
}
