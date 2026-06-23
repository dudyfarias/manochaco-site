alter table public.player_face_references
  add column if not exists embedding jsonb,
  add column if not exists embedding_model text,
  add column if not exists embedding_generated_at timestamptz;

alter table public.player_face_references
drop constraint if exists player_face_references_embedding_array_check;

alter table public.player_face_references
add constraint player_face_references_embedding_array_check
check (embedding is null or jsonb_typeof(embedding) = 'array');

comment on column public.player_face_references.embedding is
'Embedding biométrico privado. Nunca expor no site público e remover quando o consentimento for revogado.';
