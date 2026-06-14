-- ─────────────────────────────────────────────────────────────────
--  Paper Plane — Supabase schema for the account dashboard
--
--  ONE-TIME SETUP. Run this in the Supabase SQL editor:
--    https://supabase.com/dashboard/project/zgahkbpiopnrwkgdbnwu/sql/new
--
--  Paste the whole file → click Run. Idempotent — safe to re-run.
-- ─────────────────────────────────────────────────────────────────

-- ─── profiles table ──────────────────────────────────────────────
-- One row per auth user. Stores phone + profile picture URL. Email
-- lives on auth.users itself; we don't duplicate it here.
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  phone       text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ─── quiz_results table ──────────────────────────────────────────
-- One row per quiz attempt. Stores the user's answers + a snapshot
-- of the top course / college name we returned, so the dashboard
-- can show a quick summary without re-running the recommender.
create table if not exists public.quiz_results (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  taken_at           timestamptz not null default now(),
  -- raw quiz answers (jsonb gives us shape flexibility as the quiz evolves)
  answers            jsonb not null,
  -- denormalised top picks for fast dashboard rendering
  top_course_id      text,
  top_course_name    text,
  top_college_id     text,
  top_college_name   text
);

create index if not exists quiz_results_user_idx
  on public.quiz_results(user_id, taken_at desc);

-- ─── Row-Level Security ──────────────────────────────────────────
-- Without RLS, the anon key would let any visitor read any row. With
-- RLS + these policies, a user can only read / write their OWN rows.
alter table public.profiles      enable row level security;
alter table public.quiz_results  enable row level security;

-- profiles: each user can read/insert/update only their own row.
drop policy if exists "profiles_select_own"  on public.profiles;
drop policy if exists "profiles_insert_own"  on public.profiles;
drop policy if exists "profiles_update_own"  on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- quiz_results: each user can read/insert their own rows. We don't
-- expose update because quiz attempts are append-only by design.
drop policy if exists "quiz_select_own" on public.quiz_results;
drop policy if exists "quiz_insert_own" on public.quiz_results;
create policy "quiz_select_own" on public.quiz_results
  for select using (auth.uid() = user_id);
create policy "quiz_insert_own" on public.quiz_results
  for insert with check (auth.uid() = user_id);

-- ─── delete_user RPC ─────────────────────────────────────────────
-- The "Delete account" button on /account calls this. Runs as
-- SECURITY DEFINER so it can touch auth.users (which the client role
-- can't normally write to). The function deletes ONLY the currently-
-- authenticated user — there's no `target` parameter so it can't be
-- abused to delete someone else.
create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_user() from public;
grant execute on function public.delete_user() to authenticated;

-- ─── site_stats: single-row visitor counter ──────────────────────
-- Backs the "Visitors" tile on the home page. A single row holds the
-- running total; clients call `increment_visitors()` once per browser
-- session (gated by sessionStorage on the client) and read with
-- `get_visitor_count()` thereafter. No personally identifying data
-- is stored — just a tally.
create table if not exists public.site_stats (
  id        smallint primary key default 1,
  visitors  bigint   not null default 0,
  -- Constrains the table to exactly one row.
  constraint site_stats_singleton check (id = 1)
);

insert into public.site_stats (id, visitors)
  values (1, 0)
  on conflict do nothing;

-- RLS: nobody touches this table directly. All reads/writes go through
-- the two RPCs below, which run as SECURITY DEFINER.
alter table public.site_stats enable row level security;

create or replace function public.increment_visitors()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_count bigint;
begin
  update public.site_stats
    set visitors = visitors + 1
    where id = 1
    returning visitors into new_count;
  return new_count;
end;
$$;

create or replace function public.get_visitor_count()
returns bigint
language sql
security definer
set search_path = ''
as $$
  select visitors from public.site_stats where id = 1;
$$;

revoke all on function public.increment_visitors() from public;
revoke all on function public.get_visitor_count() from public;
grant execute on function public.increment_visitors() to anon, authenticated;
grant execute on function public.get_visitor_count()  to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────
-- Feedback inbox (powers /feedback). Anyone — signed in or not — can
-- submit; only you (via the Supabase dashboard / service role) can read.
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.feedback (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type       text not null check (type in ('feedback', 'recommendation', 'complaint')),
  message    text not null,
  name       text,
  email      text,
  user_id    uuid references auth.users (id) on delete set null
);

alter table public.feedback enable row level security;

-- Allow inserts from anyone (anon + authenticated). No select policy is
-- defined, so the anon/authenticated keys cannot read rows back — you
-- view submissions from the Supabase dashboard.
drop policy if exists "anyone can submit feedback" on public.feedback;
create policy "anyone can submit feedback"
  on public.feedback for insert
  to anon, authenticated
  with check (true);
