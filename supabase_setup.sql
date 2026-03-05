-- ============================================================
-- Life Command Center — Database Setup
-- Run this once in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/kipannzmdpcltazvcetb/sql/new
-- ============================================================

-- 1. Transactions table (Wealth -> Financial Tracker)
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users default auth.uid() not null,
  date text not null,
  account text not null default 'Other',
  description text not null default 'Unknown Transaction',
  category text not null default 'Other',
  amount numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;
drop policy if exists "Allow logged in users" on public.transactions;
drop policy if exists "Allow all" on public.transactions;
create policy "Allow logged in users" on public.transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 2. Knowledge notes table (Wealth -> Knowledge)
create table if not exists public.knowledge_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users default auth.uid() not null,
  type text not null default 'tip',
  title text not null,
  content text not null default '',
  created_at timestamptz not null default now()
);

alter table public.knowledge_notes enable row level security;
drop policy if exists "Allow logged in users" on public.knowledge_notes;
drop policy if exists "Allow all" on public.knowledge_notes;
create policy "Allow logged in users" on public.knowledge_notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3. Generic User Data / Settings table (Catch-all for other modules)
-- Perfect for Fitness, Courses, Net Worth, etc.
create table if not exists public.user_data (
  key text not null,
  user_id uuid references auth.users default auth.uid() not null,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (key, user_id)
);

alter table public.user_data enable row level security;
drop policy if exists "Allow logged in users" on public.user_data;
drop policy if exists "Allow all" on public.user_data;
create policy "Allow logged in users" on public.user_data for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Helper to update the updated_at column automatically
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Avoid error if trigger already exists
drop trigger if exists update_user_data_updated_at on public.user_data;
create trigger update_user_data_updated_at
before update on public.user_data
for each row execute function update_updated_at_column();

-- ============================================================
-- MIGRATION UTILITIES (Run these ONLY if upgrading an existing DB)
-- ============================================================
-- alter table public.transactions add column if not exists user_id uuid references auth.users;
-- alter table public.knowledge_notes add column if not exists user_id uuid references auth.users;
-- alter table public.user_data add column if not exists user_id uuid references auth.users;
-- alter table public.user_data drop constraint if exists user_data_pkey;
-- alter table public.user_data add primary key (key, user_id);
