-- ==========================================
-- SB Project — Database Schema & Role Fix
-- Paste this script into your Supabase SQL Editor
-- ==========================================

-- 1. Add missing roles to the user_role enum
-- PostgreSQL doesn't support 'ADD VALUE IF NOT EXISTS' inside transaction blocks, 
-- so run these lines if you get errors, or run them one by one.
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'specialist';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'beneficiary';

-- 2. Create the missing 'beneficiaries' table
CREATE TABLE IF NOT EXISTS beneficiaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES parent_profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  conditions TEXT[],
  communication_level TEXT,
  literacy_level TEXT,
  independence_level TEXT,
  support_needed TEXT[],
  preferred_language TEXT,
  learning_style TEXT,
  notes TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on beneficiaries
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow parent select beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "Allow parent insert beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "Allow parent update beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "Allow parent delete beneficiaries" ON beneficiaries;

-- Create policies for beneficiaries
CREATE POLICY "Allow parent select beneficiaries" ON beneficiaries
  FOR SELECT TO authenticated USING (parent_id = auth.uid() OR id = auth.uid());

CREATE POLICY "Allow parent insert beneficiaries" ON beneficiaries
  FOR INSERT TO authenticated WITH CHECK (parent_id = auth.uid() OR id = auth.uid());

CREATE POLICY "Allow parent update beneficiaries" ON beneficiaries
  FOR UPDATE TO authenticated USING (parent_id = auth.uid() OR id = auth.uid());

CREATE POLICY "Allow parent delete beneficiaries" ON beneficiaries
  FOR DELETE TO authenticated USING (parent_id = auth.uid() OR id = auth.uid());


-- 3. Create 'specialist_applications' table
CREATE TABLE IF NOT EXISTS specialist_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  bio TEXT,
  specialties TEXT[],
  conditions_handled TEXT[],
  age_groups TEXT[],
  languages TEXT[],
  session_types TEXT[],
  price_per_hour NUMERIC DEFAULT 0,
  cv_url TEXT,
  certificate_urls TEXT[],
  license_number TEXT,
  available_days TEXT[],
  available_time TEXT,
  bank_name TEXT,
  iban TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on specialist_applications
ALTER TABLE specialist_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow user select own application" ON specialist_applications;
DROP POLICY IF EXISTS "Allow user insert own application" ON specialist_applications;
DROP POLICY IF EXISTS "Allow admin select all applications" ON specialist_applications;

CREATE POLICY "Allow user select own application" ON specialist_applications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Allow user insert own application" ON specialist_applications
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow admin select all applications" ON specialist_applications
  FOR SELECT TO authenticated USING (true);


-- 4. Create 'specialist_profiles' table
CREATE TABLE IF NOT EXISTS specialist_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  bio TEXT,
  specialties TEXT[],
  conditions_handled TEXT[],
  age_groups TEXT[],
  languages TEXT[],
  session_types TEXT[],
  price_per_hour NUMERIC DEFAULT 0,
  rating NUMERIC DEFAULT 5.0,
  total_sessions INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on specialist_profiles
ALTER TABLE specialist_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select specialist profiles" ON specialist_profiles;
DROP POLICY IF EXISTS "Allow specialist update own profile" ON specialist_profiles;

CREATE POLICY "Allow public select specialist profiles" ON specialist_profiles
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow specialist update own profile" ON specialist_profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
