-- Minimal reference seed for Supabase SQL editor.
-- The complete local-data migration is handled by npm run seed:supabase.

insert into public.competitions (slug, name, short_name, description, type)
values
  (
    'liga7-playball',
    'Liga7 Playball',
    'Liga7',
    'Competição em que o Manochaco começou na Série D e chegou à Série B.',
    'league'
  ),
  (
    'copa-futfudas',
    'Copa FutFudas',
    'FutFudas',
    'Campeonato à parte da Playball Pompeia, em formato de jogo único. O Manochaco já venceu duas vezes.',
    'cup'
  ),
  (
    'copa-amstel',
    'Copa Amstel de sábado',
    'Amstel',
    'Campeonato de sábado disputado atualmente pelo Manochaco.',
    'cup'
  ),
  (
    'chuteira',
    'Chuteira',
    'Chuteira',
    'Campeonato disputado atualmente pelo Manochaco.',
    'league'
  )
on conflict (slug) do update
set
  name = excluded.name,
  short_name = excluded.short_name,
  description = excluded.description,
  type = excluded.type;

insert into public.seasons (slug, year, name, start_date, end_date)
values
  ('2023', 2023, '2023', '2023-01-01', '2023-12-31'),
  ('2024', 2024, '2024', '2024-01-01', '2024-12-31'),
  ('2025', 2025, '2025', '2025-01-01', '2025-12-31'),
  ('2026', 2026, '2026', '2026-01-01', '2026-12-31')
on conflict (slug) do update
set
  year = excluded.year,
  name = excluded.name,
  start_date = excluded.start_date,
  end_date = excluded.end_date;
