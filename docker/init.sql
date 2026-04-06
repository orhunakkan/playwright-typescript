-- ============================================================
-- Tables
-- ============================================================

CREATE TABLE users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  email       TEXT        UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL,
  description TEXT,
  category    TEXT        NOT NULL DEFAULT 'Personal'
                          CHECK (category IN ('Home', 'Work', 'Personal')),
  completed   BOOLEAN     NOT NULL DEFAULT false,
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id     UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE
);

-- ============================================================
-- updated_at trigger
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Soft-delete view — only rows without a deleted_at timestamp
-- ============================================================

CREATE VIEW active_notes AS
  SELECT * FROM notes WHERE deleted_at IS NULL;

-- ============================================================
-- PostgREST role
-- ============================================================

CREATE ROLE web_anon NOLOGIN;
GRANT USAGE ON SCHEMA public TO web_anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE users  TO web_anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE notes  TO web_anon;
GRANT SELECT                         ON active_notes TO web_anon;
