CREATE TABLE IF NOT EXISTS mellon_content (
  key text PRIMARY KEY,
  data jsonb NOT NULL,
  revision integer NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS mellon_showing_requests (
  id uuid PRIMARY KEY,
  fingerprint text NOT NULL,
  data jsonb NOT NULL,
  email_status text NOT NULL DEFAULT 'pending' CHECK (email_status IN ('pending', 'sent', 'failed', 'unconfigured')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mellon_showing_requests_created ON mellon_showing_requests (created_at DESC);
CREATE TABLE IF NOT EXISTS mellon_showing_usage (
  key text PRIMARY KEY,
  count integer NOT NULL DEFAULT 1,
  expires_at timestamptz NOT NULL
);
ALTER TABLE mellon_showing_requests ADD COLUMN IF NOT EXISTS confirmation_status text NOT NULL DEFAULT 'pending';
ALTER TABLE IF EXISTS mellon_valuation_leads ADD COLUMN IF NOT EXISTS confirmation_status text NOT NULL DEFAULT 'pending';
CREATE TABLE IF NOT EXISTS mellon_contact_requests (
  id uuid PRIMARY KEY,
  fingerprint text NOT NULL,
  data jsonb NOT NULL,
  email_status text NOT NULL DEFAULT 'pending',
  confirmation_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mellon_contact_requests_created ON mellon_contact_requests (created_at DESC);
