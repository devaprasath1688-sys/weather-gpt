-- WeatherGPT (SIH26068) Initial Database Schema
-- Supabase PostgreSQL Migration for Phase 1 Foundation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enums
CREATE TYPE occupation_type AS ENUM (
  'farmer',
  'student',
  'driver',
  'delivery',
  'construction',
  'fisher',
  'office',
  'other'
);

CREATE TYPE alert_severity_type AS ENUM (
  'info',
  'advisory',
  'warning',
  'emergency'
);

CREATE TYPE verification_status_type AS ENUM (
  'verified_official',
  'pending_review',
  'unverified'
);

CREATE TYPE closure_scope_type AS ENUM (
  'all_schools',
  'all_colleges',
  'schools_and_colleges',
  'none'
);

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supabase_auth_id UUID UNIQUE,
  state VARCHAR(100) NOT NULL DEFAULT 'Tamil Nadu',
  district VARCHAR(100) NOT NULL,
  city VARCHAR(100),
  latitude DECIMAL(9, 6),
  longitude DECIMAL(9, 6),
  occupation occupation_type NOT NULL DEFAULT 'student',
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. User Notification Preferences Table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  heavy_rainfall BOOLEAN DEFAULT TRUE,
  official_closures BOOLEAN DEFAULT TRUE,
  heatwaves_drought BOOLEAN DEFAULT TRUE,
  travel_disruptions BOOLEAN DEFAULT TRUE,
  agricultural_impact BOOLEAN DEFAULT TRUE,
  web_push_token TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. District Intelligence Table
CREATE TABLE IF NOT EXISTS public.district_intelligence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_name VARCHAR(100) UNIQUE NOT NULL,
  state VARCHAR(100) NOT NULL DEFAULT 'Tamil Nadu',
  overall_risk_level VARCHAR(20) NOT NULL DEFAULT 'low',
  primary_hazard TEXT,
  active_alerts_count INT DEFAULT 0,
  emergency_helpline TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Official Alerts Table (Ground Truth Architecture)
CREATE TABLE IF NOT EXISTS public.official_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL DEFAULT 'Tamil Nadu',
  source_name VARCHAR(100) NOT NULL, -- e.g. IMD, District Collectorate, TNDMA
  official_ref_url TEXT,
  title TEXT NOT NULL,
  raw_announcement TEXT NOT NULL,
  severity alert_severity_type NOT NULL DEFAULT 'advisory',
  verification_status verification_status_type NOT NULL DEFAULT 'verified_official',
  closure_declared closure_scope_type NOT NULL DEFAULT 'none',
  effective_from TIMESTAMPTZ,
  effective_until TIMESTAMPTZ,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  ai_summary_en TEXT,
  ai_summary_hi TEXT,
  ai_summary_ta TEXT
);

-- 6. Targeted Alert Delivery Log (Right User -> Right Notification Audit)
CREATE TABLE IF NOT EXISTS public.alert_delivery_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  alert_id UUID REFERENCES public.official_alerts(id) ON DELETE SET NULL,
  district VARCHAR(100) NOT NULL,
  occupation occupation_type NOT NULL,
  delivery_reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'delivered',
  dispatched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_district ON public.user_profiles(district);
CREATE INDEX IF NOT EXISTS idx_user_profiles_occupation ON public.user_profiles(occupation);
CREATE INDEX IF NOT EXISTS idx_official_alerts_district ON public.official_alerts(district);
CREATE INDEX IF NOT EXISTS idx_official_alerts_verification ON public.official_alerts(verification_status);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.district_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.official_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_delivery_logs ENABLE ROW LEVEL SECURITY;

-- Basic Public Read Policies for Demo
CREATE POLICY "Public read district_intelligence" ON public.district_intelligence FOR SELECT USING (true);
CREATE POLICY "Public read official_alerts" ON public.official_alerts FOR SELECT USING (true);
