-- Phase 9: real face-recognition suggestion pipeline.
-- This migration is additive and keeps all biometric data private under the
-- RLS policies already defined for administrators.

alter table public.player_face_references
  add column if not exists storage_path text,
  add column if not exists provider text,
  add column if not exists provider_face_id text,
  add column if not exists provider_collection_id text,
  add column if not exists indexing_status text not null default 'not_indexed',
  add column if not exists indexing_error text,
  add column if not exists indexed_at timestamptz;

alter table public.player_face_references
drop constraint if exists player_face_references_indexing_status_check;

alter table public.player_face_references
add constraint player_face_references_indexing_status_check
check (indexing_status in ('not_indexed', 'indexing', 'indexed', 'error'));

alter table public.face_detection_suggestions
  add column if not exists provider text,
  add column if not exists provider_face_id text,
  add column if not exists raw_response jsonb;

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
