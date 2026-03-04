-- ============================================================
-- Life Command Center — Database Setup
-- Run this once in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/kipannzmdpcltazvcetb/sql/new
-- ============================================================

-- 1. Transactions table (Wealth -> Financial Tracker)
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  date text not null,
  account text not null default 'Other',
  description text not null default 'Unknown Transaction',
  category text not null default 'Other',
  amount numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;
drop policy if exists "Allow all" on public.transactions;
create policy "Allow all" on public.transactions for all using (true) with check (true);

-- 2. Knowledge notes table (Wealth -> Knowledge)
create table if not exists public.knowledge_notes (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'tip',
  title text not null,
  content text not null default '',
  created_at timestamptz not null default now()
);

alter table public.knowledge_notes enable row level security;
drop policy if exists "Allow all" on public.knowledge_notes;
create policy "Allow all" on public.knowledge_notes for all using (true) with check (true);

-- 3. Generic User Data / Settings table (Catch-all for other modules)
-- Perfect for Fitness, Courses, Net Worth, etc.
create table if not exists public.user_data (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;
drop policy if exists "Allow all" on public.user_data;
create policy "Allow all" on public.user_data for all using (true) with check (true);

-- Helper to update the updated_at column automatically
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_user_data_updated_at
before update on public.user_data
for each row execute function update_updated_at_column();
