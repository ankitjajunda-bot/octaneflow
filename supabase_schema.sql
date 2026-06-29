-- --------------------------------------------------------
-- OctaneFlow Supabase Schema
-- Run this script in the Supabase SQL Editor to create the required tables
-- --------------------------------------------------------

-- 1. App State Table (Stores Settings, Stock, Users, Prices)
CREATE TABLE IF NOT EXISTS public.app_state (
    key text PRIMARY KEY,
    value jsonb NOT NULL
);

-- 2. Pending Entries Table (Stores pending employee submissions)
CREATE TABLE IF NOT EXISTS public.pending_entries (
    id text PRIMARY KEY,
    submitted_by text,
    submitted_by_name text,
    submitted_at timestamp with time zone,
    submission_type text,
    status text,
    entry_data jsonb,
    rejection_reason text,
    reviewed_by text,
    reviewed_at timestamp with time zone
);

-- 3. Daily Ledger Table (Stores the finalized daily logs)
CREATE TABLE IF NOT EXISTS public.daily_ledger (
    date text PRIMARY KEY,
    prices jsonb,
    du1_p jsonb,
    du1_d jsonb,
    du2_p jsonb,
    du2_d jsonb,
    recon jsonb,
    approved_by text,
    approved_at timestamp with time zone,
    submitted_by text
);

-- Note: Because this app is client-heavy and relies on in-app authentication, 
-- we are disabling Row Level Security (RLS) so the app can read/write data directly.
ALTER TABLE public.app_state DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_ledger DISABLE ROW LEVEL SECURITY;
