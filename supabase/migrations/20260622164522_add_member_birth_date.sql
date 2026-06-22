alter table public.member_profiles
  add column if not exists birth_date date;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'member_profiles_birth_date_check'
      and conrelid = 'public.member_profiles'::regclass
  ) then
    alter table public.member_profiles
      add constraint member_profiles_birth_date_check check (
        birth_date is null or birth_date between date '1940-01-01' and current_date
      );
  end if;
end;
$$;

comment on column public.member_profiles.birth_year is
  'Campo legado. Novos cadastros usam birth_date.';
comment on column public.member_profiles.message is
  'Campo legado. Nao e mais coletado nos formularios publicos.';

create or replace function private.handle_new_member_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_type text;
  requested_birth_date date;
begin
  requested_type := case
    when lower(coalesce(new.raw_user_meta_data ->> 'account_type', '')) in (
      'supporter', 'player', 'candidate', 'partner'
    ) then lower(new.raw_user_meta_data ->> 'account_type')
    else 'supporter'
  end;

  begin
    requested_birth_date := nullif(new.raw_user_meta_data ->> 'birth_date', '')::date;
  exception
    when others then requested_birth_date := null;
  end;

  if requested_birth_date < date '1940-01-01' or requested_birth_date > current_date then
    requested_birth_date := null;
  end if;

  insert into public.member_profiles (
    user_id,
    email,
    full_name,
    phone,
    city,
    account_type,
    status,
    preferred_position,
    birth_date,
    privacy_accepted_at
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
    requested_birth_date,
    case
      when new.raw_user_meta_data ->> 'privacy_accepted' = 'true' then now()
      else null
    end
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_member_profile() from public;
