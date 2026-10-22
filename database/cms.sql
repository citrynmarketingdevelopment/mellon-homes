CREATE TABLE IF NOT EXISTS mellon_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data jsonb NOT NULL,
  revision integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT listing_status CHECK (data->>'status' IN ('draft', 'published'))
);
CREATE INDEX IF NOT EXISTS mellon_listings_status ON mellon_listings ((data->>'status'));
CREATE TABLE IF NOT EXISTS mellon_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bytes bytea NOT NULL,
  uploaded_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
