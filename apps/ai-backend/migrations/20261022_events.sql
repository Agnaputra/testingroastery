-- Apply only to a verified development database. Production migration is separate approval.
BEGIN;

CREATE TABLE IF NOT EXISTS event_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  suspended_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS event_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES event_users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS event_sessions_user_idx ON event_sessions(user_id);

CREATE TABLE IF NOT EXISTS event_login_attempts (
  key_hash TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organizer_profiles (
  user_id UUID PRIMARY KEY REFERENCES event_users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name VARCHAR(100) NOT NULL,
  bio VARCHAR(1000) NOT NULL DEFAULT '',
  whatsapp VARCHAR(16) NOT NULL CHECK (whatsapp ~ '^[1-9][0-9]{7,14}$'),
  avatar_data BYTEA,
  avatar_mime VARCHAR(20),
  suspended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_categories (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name VARCHAR(80) NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT TRUE
);
INSERT INTO event_categories (slug, name) VALUES
  ('cupping', 'Cupping'), ('workshop', 'Workshop'), ('community', 'Community')
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES organizer_profiles(user_id) ON DELETE RESTRICT,
  category_id INTEGER NOT NULL REFERENCES event_categories(id) ON DELETE RESTRICT,
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cover_data BYTEA,
  cover_mime VARCHAR(20),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  timezone VARCHAR(64) NOT NULL,
  location_type VARCHAR(8) NOT NULL CHECK (location_type IN ('offline','online')),
  venue_name VARCHAR(150) NOT NULL DEFAULT '',
  address VARCHAR(300) NOT NULL DEFAULT '',
  meeting_link TEXT NOT NULL DEFAULT '',
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  confirmed_count INTEGER NOT NULL DEFAULT 0 CHECK (confirmed_count >= 0 AND confirmed_count <= capacity),
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  price INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0),
  whatsapp VARCHAR(16) NOT NULL CHECK (whatsapp ~ '^[1-9][0-9]{7,14}$'),
  instructions VARCHAR(2000) NOT NULL DEFAULT '',
  registration_status VARCHAR(6) NOT NULL DEFAULT 'open' CHECK (registration_status IN ('open','full','closed')),
  status VARCHAR(10) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','cancelled','completed')),
  moderation_status VARCHAR(10) NOT NULL DEFAULT 'visible' CHECK (moderation_status IN ('visible','hidden','suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  CONSTRAINT valid_event_time CHECK (ends_at > starts_at),
  CONSTRAINT paid_event_price CHECK ((is_paid AND price > 0) OR (NOT is_paid AND price = 0))
);
CREATE INDEX IF NOT EXISTS events_discovery_idx ON events(status, moderation_status, starts_at);
CREATE INDEX IF NOT EXISTS events_owner_idx ON events(organizer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS events_category_idx ON events(category_id, starts_at);

CREATE TABLE IF NOT EXISTS event_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  reason VARCHAR(1000) NOT NULL,
  reporter_hash TEXT NOT NULL,
  status VARCHAR(8) NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewed','dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS event_reports_status_idx ON event_reports(status, created_at DESC);

CREATE TABLE IF NOT EXISTS event_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES event_users(id) ON DELETE SET NULL,
  actor_role VARCHAR(10) NOT NULL CHECK (actor_role IN ('organizer','admin')),
  action VARCHAR(80) NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS event_audit_created_idx ON event_audit_logs(created_at DESC);

CREATE TABLE IF NOT EXISTS event_whatsapp_clicks (
  id BIGSERIAL PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS event_whatsapp_clicks_event_idx ON event_whatsapp_clicks(event_id);

COMMIT;
