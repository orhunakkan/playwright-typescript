// ─── pg types ────────────────────────────────────────────────────────────────
// Used when reading rows directly from PostgreSQL via node-postgres.
// pg maps TIMESTAMPTZ → Date and BOOLEAN → boolean automatically.

export interface UserRow {
  id: string;
  name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export interface NoteRow {
  id: string;
  title: string;
  description: string | null;
  category: 'Home' | 'Work' | 'Personal';
  completed: boolean;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
  user_id: string;
}
