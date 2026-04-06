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
-- Seed data — users & notes
-- (cleared by tests on each run; re-populated by restarting Docker)
-- ============================================================

INSERT INTO users (id, name, email) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Alice Walker',    'alice@example.com'),
  ('a0000000-0000-0000-0000-000000000002', 'Bob Singh',       'bob@example.com'),
  ('a0000000-0000-0000-0000-000000000003', 'Carol Reyes',     'carol@example.com'),
  ('a0000000-0000-0000-0000-000000000004', 'David Park',      'david@example.com'),
  ('a0000000-0000-0000-0000-000000000005', 'Eva Müller',      'eva@example.com'),
  ('a0000000-0000-0000-0000-000000000006', 'Frank Osei',      'frank@example.com'),
  ('a0000000-0000-0000-0000-000000000007', 'Grace Tanaka',    'grace@example.com'),
  ('a0000000-0000-0000-0000-000000000008', 'Henry Bastos',    'henry@example.com'),
  ('a0000000-0000-0000-0000-000000000009', 'Iris Kowalski',   'iris@example.com'),
  ('a0000000-0000-0000-0000-000000000010', 'James Okafor',    'james@example.com');

INSERT INTO notes (title, description, category, completed, user_id) VALUES
  ('Buy groceries',             'Milk, eggs, bread, and vegetables for the week',              'Home',     false, 'a0000000-0000-0000-0000-000000000001'),
  ('Fix login bug',             'Users with special characters in email cannot log in',        'Work',     false, 'a0000000-0000-0000-0000-000000000001'),
  ('Read Clean Code',           'Finish chapters 4 through 7 before the book club meeting',   'Personal', false, 'a0000000-0000-0000-0000-000000000002'),
  ('Quarterly review prep',     'Gather metrics and write performance summary for Q3',         'Work',     true,  'a0000000-0000-0000-0000-000000000002'),
  ('Call the plumber',          'Leaking pipe under the kitchen sink needs fixing',            'Home',     false, 'a0000000-0000-0000-0000-000000000003'),
  ('Plan team offsite',         'Book venue and catering for the November team event',         'Work',     false, 'a0000000-0000-0000-0000-000000000003'),
  ('Morning run routine',       'Run 5km every morning before 7am for 30 days',               'Personal', true,  'a0000000-0000-0000-0000-000000000004'),
  ('Update API docs',           'Document the new pagination endpoints added in v2.3',         'Work',     false, 'a0000000-0000-0000-0000-000000000004'),
  ('Renew car insurance',       'Policy expires on the 15th — compare quotes first',          'Personal', false, 'a0000000-0000-0000-0000-000000000005'),
  ('Refactor auth module',      'Extract JWT logic into a separate service class',             'Work',     false, 'a0000000-0000-0000-0000-000000000005'),
  ('Water the plants',          'Succulents on the windowsill need watering twice a week',    'Home',     true,  'a0000000-0000-0000-0000-000000000006'),
  ('Write unit tests',          'Cover the new payment gateway integration with tests',        'Work',     false, 'a0000000-0000-0000-0000-000000000006'),
  ('Dentist appointment',       'Schedule the 6-month checkup at Dr. Yamamoto''s clinic',     'Personal', false, 'a0000000-0000-0000-0000-000000000007'),
  ('Organise home office',      'Cable management and new monitor stand from storage',        'Home',     false, 'a0000000-0000-0000-0000-000000000008'),
  ('Learn TypeScript generics', 'Work through the advanced generics chapter of the handbook', 'Personal', false, 'a0000000-0000-0000-0000-000000000009');

-- ============================================================
-- Reference tables (permanent seed data — never truncated by tests)
-- ============================================================

CREATE TABLE departments (
  id          SERIAL      PRIMARY KEY,
  name        TEXT        NOT NULL UNIQUE,
  budget      NUMERIC(12,2) NOT NULL,
  location    TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE employees (
  id            SERIAL      PRIMARY KEY,
  first_name    TEXT        NOT NULL,
  last_name     TEXT        NOT NULL,
  email         TEXT        NOT NULL UNIQUE,
  department_id INTEGER     NOT NULL REFERENCES departments (id),
  job_title     TEXT        NOT NULL,
  salary        NUMERIC(10,2) NOT NULL,
  hire_date     DATE        NOT NULL,
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE projects (
  id            SERIAL      PRIMARY KEY,
  name          TEXT        NOT NULL,
  description   TEXT,
  status        TEXT        NOT NULL CHECK (status IN ('planning', 'active', 'completed', 'on_hold')),
  start_date    DATE        NOT NULL,
  end_date      DATE,
  department_id INTEGER     NOT NULL REFERENCES departments (id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Seed data — departments
-- ============================================================

INSERT INTO departments (name, budget, location) VALUES
  ('Engineering',       1500000.00, 'San Francisco'),
  ('Product',            800000.00, 'New York'),
  ('Design',             600000.00, 'Austin'),
  ('Marketing',          900000.00, 'Chicago'),
  ('Sales',             1200000.00, 'Boston'),
  ('Customer Success',   500000.00, 'Denver'),
  ('Data Science',       950000.00, 'Seattle'),
  ('Security',           700000.00, 'Washington DC'),
  ('DevOps',             750000.00, 'Portland'),
  ('Finance',            650000.00, 'New York'),
  ('Legal',              450000.00, 'San Francisco');

-- ============================================================
-- Seed data — employees
-- ============================================================

INSERT INTO employees (first_name, last_name, email, department_id, job_title, salary, hire_date, is_active) VALUES
  ('Alice',   'Chen',       'alice.chen@company.com',       1, 'Senior Software Engineer',  135000.00, '2019-03-15', true),
  ('Bob',     'Martinez',   'bob.martinez@company.com',     1, 'Staff Engineer',             158000.00, '2017-07-01', true),
  ('Carol',   'Johnson',    'carol.johnson@company.com',    2, 'Product Manager',            125000.00, '2020-01-20', true),
  ('David',   'Kim',        'david.kim@company.com',        3, 'Lead Designer',              118000.00, '2018-11-05', true),
  ('Eva',     'Patel',      'eva.patel@company.com',        4, 'Marketing Director',         140000.00, '2016-09-12', true),
  ('Frank',   'Nguyen',     'frank.nguyen@company.com',     5, 'Account Executive',          105000.00, '2021-04-08', true),
  ('Grace',   'Thompson',   'grace.thompson@company.com',   6, 'Customer Success Manager',    98000.00, '2020-08-17', true),
  ('Henry',   'Williams',   'henry.williams@company.com',   7, 'Data Scientist',             130000.00, '2019-06-03', true),
  ('Iris',    'Brown',      'iris.brown@company.com',       8, 'Security Engineer',          142000.00, '2018-02-28', true),
  ('James',   'Davis',      'james.davis@company.com',      9, 'DevOps Engineer',            128000.00, '2020-11-30', true),
  ('Karen',   'Wilson',     'karen.wilson@company.com',    10, 'Finance Analyst',             92000.00, '2021-07-19', true),
  ('Leo',     'Anderson',   'leo.anderson@company.com',     1, 'Junior Software Engineer',    88000.00, '2022-02-14', true),
  ('Maya',    'Taylor',     'maya.taylor@company.com',      2, 'Senior Product Manager',     148000.00, '2015-05-22', false),
  ('Nathan',  'Jackson',    'nathan.jackson@company.com',   7, 'Senior Data Scientist',      155000.00, '2018-09-10', true),
  ('Olivia',  'White',      'olivia.white@company.com',    11, 'Legal Counsel',              138000.00, '2017-12-01', true);

-- ============================================================
-- Seed data — projects
-- ============================================================

INSERT INTO projects (name, description, status, start_date, end_date, department_id) VALUES
  ('Platform Rewrite',         'Migrate monolith to microservices architecture',           'active',    '2024-01-15', NULL,         1),
  ('Mobile App v2',            'Redesign mobile experience with new design system',        'active',    '2024-03-01', NULL,         3),
  ('Q3 Campaign',              'Summer product launch marketing campaign',                 'completed', '2024-06-01', '2024-08-31', 4),
  ('Sales CRM Integration',    'Integrate Salesforce with internal tooling',               'completed', '2023-11-01', '2024-02-28', 5),
  ('Data Warehouse Migration', 'Move from Redshift to Snowflake',                         'active',    '2024-04-10', NULL,         7),
  ('Zero Trust Security',      'Implement zero-trust network access across all services',  'planning',  '2025-01-01', NULL,         8),
  ('CI/CD Overhaul',           'Replace legacy Jenkins pipelines with GitHub Actions',     'completed', '2024-02-01', '2024-05-15', 9),
  ('Customer Portal',          'Self-service portal for enterprise customers',             'active',    '2024-07-01', NULL,         2),
  ('Budget Automation',        'Automate monthly financial reporting and forecasting',     'planning',  '2025-02-01', '2025-06-30', 10),
  ('AI Note Assistant',        'Integrate LLM-powered suggestions into notes product',    'planning',  '2025-03-01', NULL,         1),
  ('SOC 2 Compliance',         'Achieve SOC 2 Type II certification',                     'active',    '2024-09-01', '2025-03-31', 8),
  ('Onboarding Redesign',      'Reduce time-to-value for new customers',                  'on_hold',   '2024-05-01', NULL,         6);

-- ============================================================
-- PostgREST role
-- ============================================================

CREATE ROLE web_anon NOLOGIN;
GRANT USAGE ON SCHEMA public TO web_anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE users       TO web_anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE notes       TO web_anon;
GRANT SELECT                         ON active_notes      TO web_anon;
GRANT SELECT                         ON TABLE departments TO web_anon;
GRANT SELECT                         ON TABLE employees   TO web_anon;
GRANT SELECT                         ON TABLE projects    TO web_anon;
