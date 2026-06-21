-- =============================================================================
-- Pulse Supabase Schema
-- Run this in the Supabase SQL Editor (supabase.com > your project > SQL Editor)
-- =============================================================================

-- 0. EXTENSIONS (must come before indexes that use them)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;


-- 1. TABLES
-- =============================================================================

CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  company_path BOOLEAN NOT NULL DEFAULT FALSE,

  -- Core (both paths)
  monthly_gross NUMERIC NOT NULL,
  monthly_net NUMERIC,
  currency TEXT NOT NULL,
  function TEXT NOT NULL,
  job_title TEXT NOT NULL,
  role_level TEXT NOT NULL,
  years_experience TEXT NOT NULL,
  location TEXT NOT NULL,
  location_state TEXT,
  location_country TEXT,
  work_arrangement TEXT NOT NULL,
  gender TEXT NOT NULL,
  age_range TEXT NOT NULL,
  satisfaction INT CHECK (satisfaction BETWEEN 1 AND 5),
  education TEXT,

  -- Remote branch (conditional)
  confirmed_currency TEXT,
  multi_currency BOOLEAN,

  -- Company path
  company_name TEXT,
  company_name_raw TEXT,

  -- Anonymous path — employer
  foreign_employer BOOLEAN,
  industry TEXT,
  company_stage TEXT,
  company_size TEXT,
  company_age TEXT,
  headquartered_in_nigeria BOOLEAN,
  company_hq TEXT,

  -- Anonymous path — team
  team_size TEXT,
  manage_others BOOLEAN,
  direct_reports TEXT,
  report_to TEXT,

  -- Anonymous path — comp details
  negotiated TEXT,
  negotiation_outcome TEXT,
  negotiation_result TEXT,
  has_bonus BOOLEAN,
  bonus_range TEXT,
  has_equity BOOLEAN,

  -- Bonus step (both paths)
  benefits TEXT[],

  -- Duplicate prevention
  ip_hash TEXT,
  similarity_hash TEXT,
  duplicate_flag BOOLEAN DEFAULT FALSE,

  -- Metadata
  year INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  submission_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewer_note TEXT
);

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  aliases TEXT[],
  industry TEXT,
  stage TEXT,
  size TEXT,
  hq TEXT,
  headquartered_in_nigeria BOOLEAN,
  country TEXT DEFAULT 'Nigeria',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE submission_rate_limits (
  ip_hash TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (ip_hash, submitted_at)
);


-- 2. VIEWS
-- =============================================================================

CREATE VIEW approved_submissions AS
  SELECT * FROM submissions WHERE status = 'approved';


-- 3. INDEXES
-- =============================================================================

CREATE INDEX idx_submissions_status ON submissions (status);
CREATE INDEX idx_submissions_year ON submissions (year);
CREATE INDEX idx_submissions_ip_hash ON submissions (ip_hash);
CREATE INDEX idx_submissions_similarity_hash ON submissions (similarity_hash);
CREATE INDEX idx_submissions_company_path ON submissions (company_path);
CREATE INDEX idx_submissions_function_level ON submissions (function, role_level);

CREATE INDEX idx_rate_limits_ip_hash ON submission_rate_limits (ip_hash);
CREATE INDEX idx_rate_limits_submitted_at ON submission_rate_limits (submitted_at);

CREATE INDEX idx_companies_name_trgm ON companies USING gin (name gin_trgm_ops);
CREATE INDEX idx_companies_active ON companies (active);


-- 4. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_rate_limits ENABLE ROW LEVEL SECURITY;

-- Public reads on approved submissions only (anon key)
CREATE POLICY "Public can read approved submissions"
  ON submissions FOR SELECT
  USING (status = 'approved');

-- Public reads on active companies (anon key)
CREATE POLICY "Public can read active companies"
  ON companies FOR SELECT
  USING (active = TRUE);

-- No INSERT/UPDATE/DELETE policies for anon role = denied by default.
-- /api/submit uses the service role key server-side to bypass RLS for writes.
-- Admin review uses the Supabase dashboard (service role) to update status.


-- Done. All tables, views, indexes, and RLS policies are now in place.
