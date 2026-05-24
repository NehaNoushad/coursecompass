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
