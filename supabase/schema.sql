-- Clube Atlético Manochaco - Supabase schema
-- Sports platform, private administration and future finance foundation.
-- The spreadsheet is an initial migration source only; Supabase becomes the
-- official source of truth after the first import.

create extension if not exists "pgcrypto";

create schema if not exists private;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end;
$$;

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  nickname text not null,
  position text,
  shirt_number integer,
  dominant_foot text,
  status text not null default 'active',
  profile_image_url text,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint players_status_check check (status in ('active', 'former', 'staff'))
);

create table if not exists public.competitions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  short_name text,
  description text,
  type text not null default 'other',
  created_at timestamptz default now(),
  constraint competitions_type_check check (type in ('league', 'cup', 'friendly', 'other'))
);

create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  year integer not null,
  name text not null,
  start_date date,
  end_date date,
  created_at timestamptz default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  date date,
  opponent text not null,
  competition_id uuid references public.competitions(id),
  season_id uuid references public.seasons(id),
  manochaco_score integer not null default 0,
  opponent_score integer not null default 0,
  result text not null,
  stage text,
  location text,
  summary text,
  cover_image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint matches_result_check check (result in ('win', 'draw', 'loss')),
  constraint matches_score_check check (manochaco_score >= 0 and opponent_score >= 0)
);

create table if not exists public.player_match_stats (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete cascade,
  match_id uuid references public.matches(id) on delete cascade,
  was_present boolean default true,
  goals integer default 0,
  assists integer default 0,
  yellow_cards integer default 0,
  red_cards integer default 0,
  was_goalkeeper boolean default false,
  goals_conceded integer,
  created_at timestamptz default now(),
  unique(player_id, match_id),
  constraint player_match_stats_non_negative_check check (
    goals >= 0 and assists >= 0 and yellow_cards >= 0 and red_cards >= 0
  )
);

create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  category text not null default 'general',
  cover_image_url text,
  match_id uuid references public.matches(id),
  competition_id uuid references public.competitions(id),
  season_id uuid references public.seasons(id),
  date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint albums_category_check check (
    category in ('match', 'team', 'training', 'backstage', 'title', 'general')
  )
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  url text not null,
  alt text,
  category text not null default 'general',
  album_id uuid references public.albums(id),
  match_id uuid references public.matches(id),
  competition_id uuid references public.competitions(id),
  season_id uuid references public.seasons(id),
  date date,
  uploaded_at timestamptz default now(),
  face_recognition_status text not null default 'not_processed',
  is_public boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint photos_category_check check (
    category in ('match', 'team', 'training', 'backstage', 'title', 'general')
  ),
  constraint photos_face_recognition_status_check check (
    face_recognition_status in (
      'not_processed',
      'queued',
      'processing',
      'processed',
      'needs_review',
      'error',
      'approved'
    )
  )
);

create table if not exists public.photo_player_tags (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid references public.photos(id) on delete cascade,
  player_id uuid references public.players(id) on delete cascade,
  tag_type text not null default 'manual',
  confidence numeric,
  confirmed_by_admin boolean not null default false,
  bounding_box jsonb,
  created_at timestamptz default now(),
  unique(photo_id, player_id),
  constraint photo_player_tags_type_check check (
    tag_type in ('manual', 'ai_suggested', 'ai_confirmed')
  ),
  constraint photo_player_tags_confidence_check check (
    confidence is null or (confidence >= 0 and confidence <= 1)
  )
);

create table if not exists public.player_face_references (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete cascade,
  image_url text not null,
  storage_path text,
  provider text,
  provider_face_id text,
  provider_collection_id text,
  embedding jsonb,
  embedding_model text,
  embedding_generated_at timestamptz,
  approved_for_recognition boolean not null default false,
  consent_given boolean not null default false,
  indexing_status text not null default 'not_indexed',
  indexing_error text,
  indexed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint player_face_references_indexing_status_check check (
    indexing_status in ('not_indexed', 'indexing', 'indexed', 'error')
  ),
  constraint player_face_references_embedding_array_check check (
    embedding is null or jsonb_typeof(embedding) = 'array'
  )
);

create table if not exists public.face_detection_suggestions (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid references public.photos(id) on delete cascade,
  suggested_player_id uuid references public.players(id),
  provider text,
  provider_face_id text,
  confidence numeric not null,
  bounding_box jsonb not null,
  status text not null default 'pending',
  raw_response jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint face_detection_suggestions_confidence_check check (
    confidence >= 0 and confidence <= 1
  ),
  constraint face_detection_suggestions_status_check check (
    status in ('pending', 'confirmed', 'changed', 'ignored', 'error')
  )
);

create table if not exists public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  email text,
  name text,
  full_name text,
  role text not null default 'viewer',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint admin_profiles_role_check check (
    role in ('super_admin', 'sports_admin', 'finance_admin', 'photo_editor', 'viewer')
  )
);

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
  birth_date date,
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
  constraint member_profiles_birth_date_check check (
    birth_date is null or birth_date between date '1940-01-01' and current_date
  ),
  constraint member_profiles_full_name_length_check check (
    char_length(full_name) between 2 and 120
  )
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

create table if not exists public.financial_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  type text not null default 'other',
  description text,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint financial_categories_type_check check (
    type in ('income', 'expense', 'monthly_fee', 'sponsorship', 'other')
  )
);

create table if not exists public.sponsors (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  logo_url text,
  website_url text,
  status text not null default 'active',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint sponsors_status_check check (status in ('active', 'inactive', 'prospect'))
);

create table if not exists public.sponsorship_contracts (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid references public.sponsors(id) on delete cascade,
  title text not null,
  start_date date,
  end_date date,
  amount_cents integer not null default 0,
  recurrence text not null default 'one_time',
  status text not null default 'draft',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint sponsorship_contracts_amount_check check (amount_cents >= 0),
  constraint sponsorship_contracts_recurrence_check check (
    recurrence in ('one_time', 'monthly', 'annual', 'custom')
  ),
  constraint sponsorship_contracts_status_check check (
    status in ('draft', 'active', 'ended', 'canceled')
  )
);

create table if not exists public.player_monthly_fees (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete cascade,
  season_id uuid references public.seasons(id),
  month integer not null,
  year integer not null,
  amount_cents integer not null default 0,
  paid_cents integer not null default 0,
  due_date date,
  status text not null default 'pending',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(player_id, year, month),
  constraint player_monthly_fees_month_check check (month between 1 and 12),
  constraint player_monthly_fees_amount_check check (amount_cents >= 0 and paid_cents >= 0),
  constraint player_monthly_fees_status_check check (
    status in ('pending', 'partial', 'paid', 'waived', 'overdue')
  )
);

create table if not exists public.financial_transactions (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.financial_categories(id),
  player_id uuid references public.players(id),
  sponsor_id uuid references public.sponsors(id),
  sponsorship_contract_id uuid references public.sponsorship_contracts(id),
  type text not null,
  description text not null,
  amount_cents integer not null,
  transaction_date date not null default current_date,
  payment_method text,
  status text not null default 'pending',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint financial_transactions_type_check check (type in ('income', 'expense')),
  constraint financial_transactions_amount_check check (amount_cents >= 0),
  constraint financial_transactions_status_check check (status in ('pending', 'paid', 'canceled'))
);

alter table public.photos
add column if not exists is_public boolean not null default true;

alter table public.admin_profiles
add column if not exists email text;

alter table public.admin_profiles
add column if not exists name text;

create index if not exists players_status_idx on public.players(status);
create index if not exists matches_date_idx on public.matches(date desc);
create index if not exists matches_competition_id_idx on public.matches(competition_id);
create index if not exists matches_season_id_idx on public.matches(season_id);
create index if not exists player_match_stats_player_id_idx on public.player_match_stats(player_id);
create index if not exists player_match_stats_match_id_idx on public.player_match_stats(match_id);
create index if not exists photos_album_id_idx on public.photos(album_id);
create index if not exists photos_match_id_idx on public.photos(match_id);
create index if not exists photos_is_public_idx on public.photos(is_public);
create index if not exists photo_player_tags_photo_id_idx on public.photo_player_tags(photo_id);
create index if not exists photo_player_tags_player_id_idx on public.photo_player_tags(player_id);
create index if not exists face_detection_suggestions_status_idx on public.face_detection_suggestions(status);
create index if not exists admin_profiles_user_id_idx on public.admin_profiles(user_id);
create index if not exists admin_profiles_role_idx on public.admin_profiles(role);
create index if not exists member_profiles_user_id_idx on public.member_profiles(user_id);
create index if not exists member_profiles_type_status_idx on public.member_profiles(account_type, status);
create index if not exists member_profiles_linked_player_id_idx on public.member_profiles(linked_player_id);
create index if not exists financial_categories_type_idx on public.financial_categories(type);
create index if not exists sponsors_status_idx on public.sponsors(status);
create index if not exists sponsorship_contracts_sponsor_id_idx on public.sponsorship_contracts(sponsor_id);
create index if not exists sponsorship_contracts_status_idx on public.sponsorship_contracts(status);
create index if not exists player_monthly_fees_player_id_idx on public.player_monthly_fees(player_id);
create index if not exists player_monthly_fees_period_idx on public.player_monthly_fees(year, month);
create index if not exists financial_transactions_date_idx on public.financial_transactions(transaction_date desc);
create index if not exists financial_transactions_category_id_idx on public.financial_transactions(category_id);
create index if not exists financial_transactions_player_id_idx on public.financial_transactions(player_id);
create index if not exists financial_transactions_sponsor_id_idx on public.financial_transactions(sponsor_id);

drop trigger if exists set_players_updated_at on public.players;
create trigger set_players_updated_at
before update on public.players
for each row execute function public.set_updated_at();

drop trigger if exists set_matches_updated_at on public.matches;
create trigger set_matches_updated_at
before update on public.matches
for each row execute function public.set_updated_at();

drop trigger if exists set_albums_updated_at on public.albums;
create trigger set_albums_updated_at
before update on public.albums
for each row execute function public.set_updated_at();

drop trigger if exists set_photos_updated_at on public.photos;
create trigger set_photos_updated_at
before update on public.photos
for each row execute function public.set_updated_at();

drop trigger if exists set_player_face_references_updated_at on public.player_face_references;
create trigger set_player_face_references_updated_at
before update on public.player_face_references
for each row execute function public.set_updated_at();

drop trigger if exists set_face_detection_suggestions_updated_at on public.face_detection_suggestions;
create trigger set_face_detection_suggestions_updated_at
before update on public.face_detection_suggestions
for each row execute function public.set_updated_at();

drop trigger if exists set_admin_profiles_updated_at on public.admin_profiles;
create trigger set_admin_profiles_updated_at
before update on public.admin_profiles
for each row execute function public.set_updated_at();

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

comment on column public.member_profiles.birth_year is
  'Campo legado. Novos cadastros usam birth_date.';
comment on column public.member_profiles.message is
  'Campo legado. Nao e mais coletado nos formularios publicos.';

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
    select 1
    from public.admin_profiles
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

drop trigger if exists set_financial_categories_updated_at on public.financial_categories;
create trigger set_financial_categories_updated_at
before update on public.financial_categories
for each row execute function public.set_updated_at();

drop trigger if exists set_sponsors_updated_at on public.sponsors;
create trigger set_sponsors_updated_at
before update on public.sponsors
for each row execute function public.set_updated_at();

drop trigger if exists set_sponsorship_contracts_updated_at on public.sponsorship_contracts;
create trigger set_sponsorship_contracts_updated_at
before update on public.sponsorship_contracts
for each row execute function public.set_updated_at();

drop trigger if exists set_player_monthly_fees_updated_at on public.player_monthly_fees;
create trigger set_player_monthly_fees_updated_at
before update on public.player_monthly_fees
for each row execute function public.set_updated_at();

drop trigger if exists set_financial_transactions_updated_at on public.financial_transactions;
create trigger set_financial_transactions_updated_at
before update on public.financial_transactions
for each row execute function public.set_updated_at();

update public.admin_profiles
set role = 'viewer'
where role = 'reader';

alter table public.admin_profiles
alter column role set default 'viewer';

alter table public.admin_profiles
drop constraint if exists admin_profiles_role_check;

alter table public.admin_profiles
add constraint admin_profiles_role_check
check (role in ('super_admin', 'sports_admin', 'finance_admin', 'photo_editor', 'viewer'));

-- Migration-safe additions for projects created with the Phase 8 schema.
alter table public.player_face_references add column if not exists storage_path text;
alter table public.player_face_references add column if not exists provider text;
alter table public.player_face_references add column if not exists provider_face_id text;
alter table public.player_face_references add column if not exists provider_collection_id text;
alter table public.player_face_references add column if not exists indexing_status text not null default 'not_indexed';
alter table public.player_face_references add column if not exists indexing_error text;
alter table public.player_face_references add column if not exists indexed_at timestamptz;
alter table public.player_face_references add column if not exists embedding jsonb;
alter table public.player_face_references add column if not exists embedding_model text;
alter table public.player_face_references add column if not exists embedding_generated_at timestamptz;

alter table public.player_face_references
drop constraint if exists player_face_references_indexing_status_check;
alter table public.player_face_references
add constraint player_face_references_indexing_status_check
check (indexing_status in ('not_indexed', 'indexing', 'indexed', 'error'));

alter table public.player_face_references
drop constraint if exists player_face_references_embedding_array_check;
alter table public.player_face_references
add constraint player_face_references_embedding_array_check
check (embedding is null or jsonb_typeof(embedding) = 'array');

alter table public.face_detection_suggestions add column if not exists provider text;
alter table public.face_detection_suggestions add column if not exists provider_face_id text;
alter table public.face_detection_suggestions add column if not exists raw_response jsonb;

alter table public.face_detection_suggestions
drop constraint if exists face_detection_suggestions_status_check;
alter table public.face_detection_suggestions
add constraint face_detection_suggestions_status_check
check (status in ('pending', 'confirmed', 'changed', 'ignored', 'error'));

alter table public.photos
drop constraint if exists photos_face_recognition_status_check;

update public.photos
set face_recognition_status = 'error'
where face_recognition_status = 'rejected';

alter table public.photos
add constraint photos_face_recognition_status_check
check (face_recognition_status in (
  'not_processed',
  'queued',
  'processing',
  'processed',
  'needs_review',
  'error',
  'approved'
));

create index if not exists player_face_references_player_id_idx
on public.player_face_references(player_id);

create index if not exists player_face_references_provider_face_id_idx
on public.player_face_references(provider_face_id);
