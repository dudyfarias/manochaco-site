create table public.player_face_embeddings (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  face_reference_id uuid not null unique references public.player_face_references(id) on delete cascade,
  embedding jsonb not null,
  embedding_model text not null,
  provider text not null default 'insightface',
  consent_given boolean not null default false,
  approved_for_recognition boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint player_face_embeddings_array_check check (
    jsonb_typeof(embedding) = 'array' and jsonb_array_length(embedding) > 0
  ),
  constraint player_face_embeddings_provider_check check (
    provider in ('insightface', 'faceapi', 'aws', 'mock')
  ),
  constraint player_face_embeddings_consent_check check (
    consent_given and approved_for_recognition
  )
);

create index player_face_embeddings_player_id_idx
on public.player_face_embeddings(player_id);

create index player_face_embeddings_provider_idx
on public.player_face_embeddings(provider);

create trigger set_player_face_embeddings_updated_at
before update on public.player_face_embeddings
for each row execute function public.set_updated_at();

alter table public.player_face_embeddings enable row level security;

grant select, insert, update, delete on public.player_face_embeddings to authenticated;

create policy "Photo admins can manage face embeddings"
on public.player_face_embeddings
for all
to authenticated
using (private.can_manage_photos())
with check (private.can_manage_photos());

insert into public.player_face_embeddings (
  player_id,
  face_reference_id,
  embedding,
  embedding_model,
  provider,
  consent_given,
  approved_for_recognition,
  created_at,
  updated_at
)
select
  player_id,
  id,
  embedding,
  coalesce(embedding_model, 'legacy-embedding'),
  coalesce(provider, 'faceapi'),
  consent_given,
  approved_for_recognition,
  coalesce(created_at, now()),
  coalesce(embedding_generated_at, updated_at, now())
from public.player_face_references
where embedding is not null
  and jsonb_typeof(embedding) = 'array'
  and jsonb_array_length(embedding) > 0
  and consent_given
  and approved_for_recognition
on conflict (face_reference_id) do nothing;

update public.player_face_references
set embedding = null
where embedding is not null;

comment on table public.player_face_embeddings is
'Embeddings biométricos privados usados apenas para sugestões revisadas por administradores.';

comment on column public.player_face_embeddings.embedding is
'Vetor biométrico privado. Nunca expor no site público.';
