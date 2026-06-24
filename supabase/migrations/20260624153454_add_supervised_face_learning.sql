alter table public.player_face_references
  add column if not exists source_photo_id uuid references public.photos(id) on delete set null,
  add column if not exists source_suggestion_id uuid references public.face_detection_suggestions(id) on delete set null,
  add column if not exists source_bounding_box jsonb,
  add column if not exists source_kind text not null default 'upload';

alter table public.player_face_references
drop constraint if exists player_face_references_source_kind_check;

alter table public.player_face_references
add constraint player_face_references_source_kind_check
check (source_kind in ('upload', 'confirmed_photo_tag'));

alter table public.player_face_references
drop constraint if exists player_face_references_source_bounding_box_check;

alter table public.player_face_references
add constraint player_face_references_source_bounding_box_check
check (source_bounding_box is null or jsonb_typeof(source_bounding_box) = 'object');

create unique index if not exists player_face_references_source_suggestion_uidx
on public.player_face_references(source_suggestion_id)
where source_suggestion_id is not null;

create index if not exists player_face_references_source_photo_idx
on public.player_face_references(source_photo_id)
where source_photo_id is not null;

comment on column public.player_face_references.source_suggestion_id is
'Sugestão revisada que originou a referência supervisionada. Não expor publicamente.';

comment on column public.player_face_references.source_bounding_box is
'Recorte normalizado do rosto confirmado dentro da foto de origem.';
