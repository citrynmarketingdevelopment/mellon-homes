CREATE TABLE IF NOT EXISTS mellon_valuation_leads (
  id uuid PRIMARY KEY,
  fingerprint text NOT NULL,
  data jsonb NOT NULL,
  result jsonb,
  email_status text NOT NULL DEFAULT 'pending' CHECK (email_status IN ('pending', 'sent', 'failed', 'unconfigured')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mellon_valuation_leads_created ON mellon_valuation_leads (created_at DESC);
CREATE TABLE IF NOT EXISTS mellon_valuation_usage (
  key text PRIMARY KEY,
  count integer NOT NULL DEFAULT 1,
  expires_at timestamptz NOT NULL
);

ALTER TABLE mellon_valuation_leads ADD COLUMN IF NOT EXISTS confirmation_status text NOT NULL DEFAULT 'pending';
