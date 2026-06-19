-- Public member accounts, player claims and applications to join Manochaco.
-- Administrative privileges remain exclusively in admin_profiles and cannot
-- be selected during public sign-up.

create table if not exists public.member_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  phone text,
  city text,
  account_type text not null default 'supporter',
  status text not null default 'pending',
  linked_player_id uuid references public.players(id) on delete set null,
  preferred_position text,
  birth_year integer,
  message text,
  privacy_accepted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint member_profiles_account_type_check check (
    account_type in ('supporter', 'player', 'candidate', 'partner')
  ),
  constraint member_profiles_status_check check (
    status in ('pending', 'active', 'rejected', 'blocked')
  ),
  constraint member_profiles_birth_year_check check (
    birth_year is null or birth_year between 1940 and 2100
  ),
  constraint member_profiles_full_name_length_check check (
    char_length(full_name) between 2 and 120
  )
);

create index if not exists member_profiles_user_id_idx
on public.member_profiles(user_id);
create index if not exists member_profiles_type_status_idx
on public.member_profiles(account_type, status);
create index if not exists member_profiles_linked_player_id_idx
on public.member_profiles(linked_player_id);

drop trigger if exists set_member_profiles_updated_at on public.member_profiles;
create trigger set_member_profiles_updated_at
before update on public.member_profiles
for each row execute function public.set_updated_at();

create or replace function private.handle_new_member_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_type text;
  requested_birth_year integer;
begin
  requested_type := case
    when lower(coalesce(new.raw_user_meta_data ->> 'account_type', '')) in (
      'supporter', 'player', 'candidate', 'partner'
    ) then lower(new.raw_user_meta_data ->> 'account_type')
    else 'supporter'
  end;

  requested_birth_year := case
    when coalesce(new.raw_user_meta_data ->> 'birth_year', '') ~ '^[0-9]{4}$'
      and (new.raw_user_meta_data ->> 'birth_year')::integer between 1940 and 2100
      then (new.raw_user_meta_data ->> 'birth_year')::integer
    else null
  end;

  insert into public.member_profiles (
    user_id, email, full_name, phone, city, account_type, status,
    preferred_position, birth_year, message, privacy_accepted_at
  ) values (
    new.id,
    coalesce(new.email, ''),
    case
      when char_length(coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(new.email, ''), '@', 1))) >= 2
        then left(coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(new.email, ''), '@', 1)), 120)
      else 'Membro'
    end,
    nullif(left(coalesce(new.raw_user_meta_data ->> 'phone', ''), 30), ''),
    nullif(left(coalesce(new.raw_user_meta_data ->> 'city', ''), 100), ''),
    requested_type,
    case when requested_type = 'supporter' then 'active' else 'pending' end,
    nullif(left(coalesce(new.raw_user_meta_data ->> 'preferred_position', ''), 60), ''),
    requested_birth_year,
    nullif(left(coalesce(new.raw_user_meta_data ->> 'message', ''), 1000), ''),
    case when new.raw_user_meta_data ->> 'privacy_accepted' = 'true' then now() else null end
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_member_profile() from public;

drop trigger if exists on_auth_user_created_member_profile on auth.users;
create trigger on_auth_user_created_member_profile
after insert on auth.users
for each row execute function private.handle_new_member_profile();

create or replace function private.protect_member_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_can_manage boolean;
begin
  select exists (
    select 1 from public.admin_profiles
    where user_id = auth.uid()
      and role in ('super_admin', 'sports_admin')
  ) into actor_can_manage;

  if not actor_can_manage then
    new.user_id := old.user_id;
    new.email := old.email;
    new.account_type := old.account_type;
    new.status := old.status;
    new.linked_player_id := old.linked_player_id;
    new.privacy_accepted_at := old.privacy_accepted_at;
  end if;

  return new;
end;
$$;

revoke all on function private.protect_member_profile_fields() from public;

drop trigger if exists protect_member_profile_fields on public.member_profiles;
create trigger protect_member_profile_fields
before update on public.member_profiles
for each row execute function private.protect_member_profile_fields();

alter table public.member_profiles enable row level security;
grant select, insert, update on public.member_profiles to authenticated;

create policy "Members can read own profile"
on public.member_profiles for select to authenticated
using (user_id = (select auth.uid()));

create policy "Admins can read member profiles"
on public.member_profiles for select to authenticated
using (private.can_manage_sports());

create policy "Members can create own profile"
on public.member_profiles for insert to authenticated
with check (
  user_id = (select auth.uid())
  and linked_player_id is null
  and (
    (account_type = 'supporter' and status = 'active')
    or (account_type in ('player', 'candidate', 'partner') and status = 'pending')
  )
);

create policy "Members can update own profile"
on public.member_profiles for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Sports admins can manage member profiles"
on public.member_profiles for all to authenticated
using (private.can_manage_sports())
with check (private.can_manage_sports());
