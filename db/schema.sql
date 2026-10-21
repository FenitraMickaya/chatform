-- FormPulse — PostgreSQL schema
-- Safe to run repeatedly (idempotent).

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT,
  avatar        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS forms (
  id          TEXT PRIMARY KEY,
  owner_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  theme       JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Per-language overrides: {"fr": {"title": "...", "questions": {"q1": {"title": "..."}}}}
  locales     JSONB NOT NULL DEFAULT '{}'::jsonb,
  default_lang TEXT NOT NULL DEFAULT 'en',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Upgrade path for databases created before the localisation columns existed.
ALTER TABLE forms ADD COLUMN IF NOT EXISTS locales JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS default_lang TEXT NOT NULL DEFAULT 'en';

CREATE INDEX IF NOT EXISTS forms_owner_id_idx ON forms(owner_id);
CREATE INDEX IF NOT EXISTS forms_status_idx ON forms(status);

CREATE TABLE IF NOT EXISTS questions (
  id          TEXT PRIMARY KEY,
  form_id     TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('text', 'email', 'multiple_choice', 'yes_no', 'rating')),
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  required    BOOLEAN NOT NULL DEFAULT FALSE,
  placeholder TEXT NOT NULL DEFAULT '',
  options     JSONB,
  min_rating  INTEGER,
  max_rating  INTEGER,
  -- Per-language overrides for the question wording.
  locales     JSONB NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE questions ADD COLUMN IF NOT EXISTS locales JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS questions_form_id_idx ON questions(form_id, position);

CREATE TABLE IF NOT EXISTS submissions (
  id                     TEXT PRIMARY KEY,
  form_id                TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  answers                JSONB NOT NULL DEFAULT '{}'::jsonb,
  completion_time_seconds INTEGER NOT NULL DEFAULT 0,
  user_agent             TEXT,
  submitted_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS submissions_form_id_idx ON submissions(form_id, submitted_at DESC);
