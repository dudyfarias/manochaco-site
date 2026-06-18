-- Clube Atlético Manochaco - Supabase schema
-- Sports platform, private administration and future finance foundation.
-- The spreadsheet is an initial migration source only; Supabase becomes the
-- official source of truth after the first import.

create extension if not exists "pgcrypto";

create schema if not exists private;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
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
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint photos_category_check check (
    category in ('match', 'team', 'training', 'backstage', 'title', 'general')
  ),
  constraint photos_face_recognition_status_check check (
    face_recognition_status in (
      'not_processed',
      'processing',
      'processed',
      'needs_review',
      'approved',
      'rejected'
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
  approved_for_recognition boolean not null default false,
  consent_given boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.face_detection_suggestions (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid references public.photos(id) on delete cascade,
  suggested_player_id uuid references public.players(id),
  confidence numeric not null,
  bounding_box jsonb not null,
  status text not null default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint face_detection_suggestions_confidence_check check (
    confidence >= 0 and confidence <= 1
  ),
  constraint face_detection_suggestions_status_check check (
    status in ('pending', 'confirmed', 'changed', 'ignored')
  )
);

create table if not exists public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'reader',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint admin_profiles_role_check check (
    role in ('super_admin', 'sports_admin', 'finance_admin', 'photo_editor', 'reader')
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

create index if not exists players_status_idx on public.players(status);
create index if not exists matches_date_idx on public.matches(date desc);
create index if not exists matches_competition_id_idx on public.matches(competition_id);
create index if not exists matches_season_id_idx on public.matches(season_id);
create index if not exists player_match_stats_player_id_idx on public.player_match_stats(player_id);
create index if not exists player_match_stats_match_id_idx on public.player_match_stats(match_id);
create index if not exists photos_album_id_idx on public.photos(album_id);
create index if not exists photos_match_id_idx on public.photos(match_id);
create index if not exists photo_player_tags_photo_id_idx on public.photo_player_tags(photo_id);
create index if not exists photo_player_tags_player_id_idx on public.photo_player_tags(player_id);
create index if not exists face_detection_suggestions_status_idx on public.face_detection_suggestions(status);
create index if not exists admin_profiles_user_id_idx on public.admin_profiles(user_id);
create index if not exists admin_profiles_role_idx on public.admin_profiles(role);
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
