alter table public.photos
alter column face_recognition_status set default 'not_processed';

alter table public.photos
drop constraint if exists photos_face_recognition_status_check;

update public.photos
set face_recognition_status = 'not_processed'
where face_recognition_status is null;

update public.photos
set face_recognition_status = 'error'
where face_recognition_status not in (
  'not_processed',
  'queued',
  'processing',
  'needs_review',
  'processed',
  'approved',
  'error'
);

-- The initial seed contained illustrative processing states. Any photo without
-- a recognition audit trail must enter the real queue once.
update public.photos as photo
set face_recognition_status = 'not_processed'
where photo.face_recognition_status in (
  'processing',
  'needs_review',
  'processed',
  'approved'
)
and not exists (
  select 1
  from public.face_detection_suggestions as suggestion
  where suggestion.photo_id = photo.id
);

alter table public.photos
alter column face_recognition_status set not null;

alter table public.photos
add constraint photos_face_recognition_status_check
check (face_recognition_status in (
  'not_processed',
  'queued',
  'processing',
  'needs_review',
  'processed',
  'approved',
  'error'
));

create index if not exists photos_face_recognition_queue_idx
on public.photos(face_recognition_status, uploaded_at)
where face_recognition_status in ('not_processed', 'queued', 'error');

create index if not exists photo_player_tags_public_player_idx
on public.photo_player_tags(player_id, created_at desc)
where confirmed_by_admin = true;

create index if not exists face_detection_suggestions_photo_status_idx
on public.face_detection_suggestions(photo_id, status);
