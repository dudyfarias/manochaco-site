-- Clube Atlético Manochaco - RLS policies
-- Run after schema.sql. Policies assume Supabase Auth is enabled.
-- Public readers only see sports/site data. Admin and finance data is private.

alter table public.players enable row level security;
alter table public.competitions enable row level security;
alter table public.seasons enable row level security;
alter table public.matches enable row level security;
alter table public.player_match_stats enable row level security;
alter table public.albums enable row level security;
alter table public.photos enable row level security;
alter table public.photo_player_tags enable row level security;
alter table public.player_face_references enable row level security;
alter table public.face_detection_suggestions enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.audit_logs enable row level security;
alter table public.financial_categories enable row level security;
alter table public.financial_transactions enable row level security;
alter table public.player_monthly_fees enable row level security;
alter table public.sponsors enable row level security;
alter table public.sponsorship_contracts enable row level security;

grant usage on schema public to anon, authenticated;
grant usage on schema private to authenticated;

grant select on public.players to anon, authenticated;
grant select on public.competitions to anon, authenticated;
grant select on public.seasons to anon, authenticated;
grant select on public.matches to anon, authenticated;
grant select on public.player_match_stats to anon, authenticated;
grant select on public.albums to anon, authenticated;
grant select on public.photos to anon, authenticated;
grant select on public.photo_player_tags to anon, authenticated;

grant select, insert, update, delete on public.players to authenticated;
grant select, insert, update, delete on public.competitions to authenticated;
grant select, insert, update, delete on public.seasons to authenticated;
grant select, insert, update, delete on public.matches to authenticated;
grant select, insert, update, delete on public.player_match_stats to authenticated;
grant select, insert, update, delete on public.albums to authenticated;
grant select, insert, update, delete on public.photos to authenticated;
grant select, insert, update, delete on public.photo_player_tags to authenticated;
grant select, insert, update, delete on public.player_face_references to authenticated;
grant select, insert, update, delete on public.face_detection_suggestions to authenticated;
grant select, insert, update, delete on public.admin_profiles to authenticated;
grant select, insert on public.audit_logs to authenticated;
grant select, insert, update, delete on public.financial_categories to authenticated;
grant select, insert, update, delete on public.financial_transactions to authenticated;
grant select, insert, update, delete on public.player_monthly_fees to authenticated;
grant select, insert, update, delete on public.sponsors to authenticated;
grant select, insert, update, delete on public.sponsorship_contracts to authenticated;

create or replace function private.has_admin_role(allowed_roles text[])
returns boolean
language sql
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
      and role = any(allowed_roles)
  );
$$;

create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = public, auth
as $$
  select private.has_admin_role(array[
    'super_admin',
    'sports_admin',
    'finance_admin',
    'photo_editor',
    'viewer'
  ]);
$$;

create or replace function private.can_manage_admins()
returns boolean
language sql
security definer
set search_path = public, auth
as $$
  select private.has_admin_role(array['super_admin']);
$$;

create or replace function private.can_manage_sports()
returns boolean
language sql
security definer
set search_path = public, auth
as $$
  select private.has_admin_role(array['super_admin', 'sports_admin']);
$$;

create or replace function private.can_manage_photos()
returns boolean
language sql
security definer
set search_path = public, auth
as $$
  select private.has_admin_role(array['super_admin', 'sports_admin', 'photo_editor']);
$$;

create or replace function private.can_manage_finance()
returns boolean
language sql
security definer
set search_path = public, auth
as $$
  select private.has_admin_role(array['super_admin', 'finance_admin']);
$$;

revoke all on function private.has_admin_role(text[]) from public;
revoke all on function private.is_admin() from public;
revoke all on function private.can_manage_admins() from public;
revoke all on function private.can_manage_sports() from public;
revoke all on function private.can_manage_photos() from public;
revoke all on function private.can_manage_finance() from public;

grant execute on function private.has_admin_role(text[]) to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.can_manage_admins() to authenticated;
grant execute on function private.can_manage_sports() to authenticated;
grant execute on function private.can_manage_photos() to authenticated;
grant execute on function private.can_manage_finance() to authenticated;

drop policy if exists "Public can read players" on public.players;
create policy "Public can read players"
on public.players
for select
using (status in ('active', 'former', 'staff'));

drop policy if exists "Public can read competitions" on public.competitions;
create policy "Public can read competitions"
on public.competitions
for select
using (true);

drop policy if exists "Public can read seasons" on public.seasons;
create policy "Public can read seasons"
on public.seasons
for select
using (true);

drop policy if exists "Public can read matches" on public.matches;
create policy "Public can read matches"
on public.matches
for select
using (true);

drop policy if exists "Public can read player match stats" on public.player_match_stats;
create policy "Public can read player match stats"
on public.player_match_stats
for select
using (true);

drop policy if exists "Public can read albums" on public.albums;
create policy "Public can read albums"
on public.albums
for select
using (true);

drop policy if exists "Public can read photos" on public.photos;
create policy "Public can read photos"
on public.photos
for select
using (is_public = true);

drop policy if exists "Public can read confirmed photo tags" on public.photo_player_tags;
create policy "Public can read confirmed photo tags"
on public.photo_player_tags
for select
using (
  confirmed_by_admin = true
  and tag_type in ('manual', 'ai_confirmed')
);

drop policy if exists "Sports admins can manage players" on public.players;
drop policy if exists "Admins can manage players" on public.players;
create policy "Sports admins can manage players"
on public.players
for all
to authenticated
using (private.can_manage_sports())
with check (private.can_manage_sports());

drop policy if exists "Sports admins can manage competitions" on public.competitions;
drop policy if exists "Admins can manage competitions" on public.competitions;
create policy "Sports admins can manage competitions"
on public.competitions
for all
to authenticated
using (private.can_manage_sports())
with check (private.can_manage_sports());

drop policy if exists "Sports admins can manage seasons" on public.seasons;
drop policy if exists "Admins can manage seasons" on public.seasons;
create policy "Sports admins can manage seasons"
on public.seasons
for all
to authenticated
using (private.can_manage_sports())
with check (private.can_manage_sports());

drop policy if exists "Sports admins can manage matches" on public.matches;
drop policy if exists "Admins can manage matches" on public.matches;
create policy "Sports admins can manage matches"
on public.matches
for all
to authenticated
using (private.can_manage_sports())
with check (private.can_manage_sports());

drop policy if exists "Sports admins can manage player match stats" on public.player_match_stats;
drop policy if exists "Admins can manage player match stats" on public.player_match_stats;
create policy "Sports admins can manage player match stats"
on public.player_match_stats
for all
to authenticated
using (private.can_manage_sports())
with check (private.can_manage_sports());

drop policy if exists "Photo admins can manage albums" on public.albums;
drop policy if exists "Admins can manage albums" on public.albums;
create policy "Photo admins can manage albums"
on public.albums
for all
to authenticated
using (private.can_manage_photos())
with check (private.can_manage_photos());

drop policy if exists "Photo admins can manage photos" on public.photos;
drop policy if exists "Admins can manage photos" on public.photos;
create policy "Photo admins can manage photos"
on public.photos
for all
to authenticated
using (private.can_manage_photos())
with check (private.can_manage_photos());

drop policy if exists "Photo admins can manage photo tags" on public.photo_player_tags;
drop policy if exists "Admins can manage photo tags" on public.photo_player_tags;
create policy "Photo admins can manage photo tags"
on public.photo_player_tags
for all
to authenticated
using (private.can_manage_photos())
with check (private.can_manage_photos());

drop policy if exists "Photo admins can manage face references" on public.player_face_references;
drop policy if exists "Admins can manage face references" on public.player_face_references;
create policy "Photo admins can manage face references"
on public.player_face_references
for all
to authenticated
using (private.can_manage_photos())
with check (private.can_manage_photos());

drop policy if exists "Photo admins can manage face suggestions" on public.face_detection_suggestions;
drop policy if exists "Admins can manage face suggestions" on public.face_detection_suggestions;
create policy "Photo admins can manage face suggestions"
on public.face_detection_suggestions
for all
to authenticated
using (private.can_manage_photos())
with check (private.can_manage_photos());

drop policy if exists "Admins can read admin profiles" on public.admin_profiles;
create policy "Admins can read admin profiles"
on public.admin_profiles
for select
to authenticated
using (private.is_admin() or user_id = auth.uid());

drop policy if exists "Super admins can manage admin profiles" on public.admin_profiles;
drop policy if exists "Owners can manage admin profiles" on public.admin_profiles;
create policy "Super admins can manage admin profiles"
on public.admin_profiles
for all
to authenticated
using (private.can_manage_admins())
with check (private.can_manage_admins());

drop policy if exists "Admins can read audit logs" on public.audit_logs;
create policy "Admins can read audit logs"
on public.audit_logs
for select
to authenticated
using (private.is_admin());

drop policy if exists "Admins can insert audit logs" on public.audit_logs;
create policy "Admins can insert audit logs"
on public.audit_logs
for insert
to authenticated
with check (
  private.has_admin_role(array['super_admin', 'sports_admin', 'finance_admin', 'photo_editor'])
);

drop policy if exists "Finance admins can manage financial categories" on public.financial_categories;
create policy "Finance admins can manage financial categories"
on public.financial_categories
for all
to authenticated
using (private.can_manage_finance())
with check (private.can_manage_finance());

drop policy if exists "Finance admins can manage financial transactions" on public.financial_transactions;
create policy "Finance admins can manage financial transactions"
on public.financial_transactions
for all
to authenticated
using (private.can_manage_finance())
with check (private.can_manage_finance());

drop policy if exists "Finance admins can manage player monthly fees" on public.player_monthly_fees;
create policy "Finance admins can manage player monthly fees"
on public.player_monthly_fees
for all
to authenticated
using (private.can_manage_finance())
with check (private.can_manage_finance());

drop policy if exists "Finance admins can manage sponsors" on public.sponsors;
create policy "Finance admins can manage sponsors"
on public.sponsors
for all
to authenticated
using (private.can_manage_finance())
with check (private.can_manage_finance());

drop policy if exists "Finance admins can manage sponsorship contracts" on public.sponsorship_contracts;
create policy "Finance admins can manage sponsorship contracts"
on public.sponsorship_contracts
for all
to authenticated
using (private.can_manage_finance())
with check (private.can_manage_finance());
