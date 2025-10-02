-- === Complete Grant Expiration Fix ===
-- Run this entire script in Supabase SQL Editor
-- Safe to run multiple times (idempotent)

-- 1. Clean up existing expired grants
update public.programs
set active = false,
    featured = false
where active = true
  and deadline is not null
  and deadline < now();

-- 2. Add performance indexes
create index if not exists idx_programs_deadline on public.programs (deadline);
create index if not exists idx_programs_active_deadline on public.programs (active, deadline desc);

-- 3. Ensure deadline column is timestamptz
alter table public.programs alter column deadline type timestamptz using deadline::timestamptz;

-- 4. Create function to guard against expired deadlines
create or replace function public.program_deadline_guard()
returns trigger language plpgsql as $$
begin
  -- If a deadline is set in the past, force inactive + not featured
  if NEW.deadline is not null and NEW.deadline < now() then
    NEW.active := false;
    NEW.featured := false;
  end if;

  -- Featured items must be active and not expired
  if NEW.featured = true then
    if NEW.active = false or (NEW.deadline is not null and NEW.deadline < now()) then
      raise exception 'featured requires active=true and a non-expired deadline';
    end if;
  end if;

  return NEW;
end $$;

-- 5. Create trigger to prevent future expired grants
drop trigger if exists trg_program_deadline_guard on public.programs;
create trigger trg_program_deadline_guard
before insert or update on public.programs
for each row execute function public.program_deadline_guard();

-- 6. Set up Row Level Security (idempotent)
alter table public.states enable row level security;
drop policy if exists "public read states" on public.states;
create policy "public read states"
on public.states for select
using (true);

alter table public.programs enable row level security;
drop policy if exists "public read active programs" on public.programs;
create policy "public read active programs"
on public.programs for select
using (active = true);

alter table public.faqs enable row level security;
drop policy if exists "public read faqs" on public.faqs;
create policy "public read faqs"
on public.faqs for select
using (true);

-- 7. Create health_checks table if it doesn't exist
create table if not exists public.health_checks (
  id         bigserial primary key,
  name       text not null,
  ok         boolean not null,
  details    jsonb,
  created_at timestamptz not null default now()
);

alter table public.health_checks enable row level security;
drop policy if exists "no public access health checks" on public.health_checks;
create policy "no public access health checks"
on public.health_checks for all
to anon
using (false)
with check (false);

drop policy if exists "service role full access" on public.health_checks;
create policy "service role full access"
on public.health_checks for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- 8. Add health_checks indexes
create index if not exists idx_health_checks_created_at on public.health_checks (created_at desc);
create index if not exists idx_health_checks_ok on public.health_checks (ok);

-- 9. Show cleanup results
select 
  'Cleanup Results' as status,
  count(*) as total_programs,
  count(*) filter (where active = true) as active_programs,
  count(*) filter (where active = false) as inactive_programs,
  count(*) filter (where deadline < now()) as expired_programs,
  count(*) filter (where featured = true and active = true) as featured_active_programs
from public.programs;

-- 10. Verify RLS is enabled
select 
  'RLS Status' as status,
  schemaname, 
  tablename, 
  rowsecurity 
from pg_tables 
where schemaname = 'public' 
  and tablename in ('states', 'programs', 'faqs', 'health_checks')
order by tablename;
