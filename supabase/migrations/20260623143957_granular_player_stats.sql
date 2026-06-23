create table public.player_aliases (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  alias text not null,
  normalized_alias text not null unique,
  created_at timestamptz not null default now(),
  unique(player_id, normalized_alias)
);

create table public.player_competition_stats (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  competition_id uuid not null references public.competitions(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  source_sheet text not null,
  matches integer not null default 0,
  goals integer not null default 0,
  assists integer not null default 0,
  yellow_cards integer not null default 0,
  red_cards integer not null default 0,
  clean_sheets integer not null default 0,
  goals_conceded integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(player_id, competition_id, season_id, source_sheet),
  constraint player_competition_stats_non_negative_check check (
    matches >= 0
    and goals >= 0
    and assists >= 0
    and yellow_cards >= 0
    and red_cards >= 0
    and clean_sheets >= 0
    and goals_conceded >= 0
  )
);

create table public.player_historical_stats (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  source_sheet text not null default 'Estatística Histórica',
  matches integer not null default 0,
  goals integer not null default 0,
  assists integer not null default 0,
  yellow_cards integer not null default 0,
  red_cards integer not null default 0,
  clean_sheets integer not null default 0,
  goals_conceded integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(player_id, source_sheet),
  constraint player_historical_stats_non_negative_check check (
    matches >= 0
    and goals >= 0
    and assists >= 0
    and yellow_cards >= 0
    and red_cards >= 0
    and clean_sheets >= 0
    and goals_conceded >= 0
  )
);

create index player_aliases_player_id_idx
on public.player_aliases(player_id);

create index player_competition_stats_player_id_idx
on public.player_competition_stats(player_id);

create index player_competition_stats_scope_idx
on public.player_competition_stats(competition_id, season_id);

create index player_historical_stats_player_id_idx
on public.player_historical_stats(player_id);

create trigger set_player_competition_stats_updated_at
before update on public.player_competition_stats
for each row execute function public.set_updated_at();

create trigger set_player_historical_stats_updated_at
before update on public.player_historical_stats
for each row execute function public.set_updated_at();

alter table public.player_aliases enable row level security;
alter table public.player_competition_stats enable row level security;
alter table public.player_historical_stats enable row level security;

grant select on public.player_competition_stats to anon, authenticated;
grant select, insert, update, delete on public.player_aliases to authenticated;
grant select, insert, update, delete on public.player_competition_stats to authenticated;
grant select, insert, update, delete on public.player_historical_stats to authenticated;

create policy "Public can read player competition stats"
on public.player_competition_stats
for select
to anon, authenticated
using (true);

create policy "Admins can read player aliases"
on public.player_aliases
for select
to authenticated
using (private.is_admin());

create policy "Sports admins can manage player aliases"
on public.player_aliases
for all
to authenticated
using (private.can_manage_sports())
with check (private.can_manage_sports());

create policy "Admins can read historical stat validations"
on public.player_historical_stats
for select
to authenticated
using (private.is_admin());

create policy "Sports admins can manage historical stat validations"
on public.player_historical_stats
for all
to authenticated
using (private.can_manage_sports())
with check (private.can_manage_sports());

create policy "Sports admins can manage player competition stats"
on public.player_competition_stats
for all
to authenticated
using (private.can_manage_sports())
with check (private.can_manage_sports());
