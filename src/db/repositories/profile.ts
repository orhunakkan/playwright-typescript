import type { DatabaseSync } from 'node:sqlite';
import { z } from 'zod';
import { ProfileSchema, type Profile } from '../../schemas/profile.ts';

// The single-row candidate profile (FR-01), stored as JSON and validated both ways.

export interface ProfileRepository {
  get(): Profile | null;
  put(profile: Profile, updatedAt: string): void;
}

const Row = z.object({ data: z.string() });

export function createProfileRepository(db: DatabaseSync): ProfileRepository {
  const select = db.prepare('SELECT data FROM profile WHERE id = 1');
  const upsert = db.prepare(
    `INSERT INTO profile (id, data, updated_at) VALUES (1, ?, ?)
     ON CONFLICT (id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
  );

  return {
    get() {
      const row = select.get();
      if (row === undefined) return null;
      return ProfileSchema.parse(JSON.parse(Row.parse(row).data) as unknown);
    },
    put(profile, updatedAt) {
      upsert.run(JSON.stringify(ProfileSchema.parse(profile)), updatedAt);
    },
  };
}
