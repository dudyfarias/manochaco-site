-- Clube Atlético Manochaco - Supabase Storage buckets and policies
-- Run after schema.sql and policies.sql.

insert into storage.buckets (id, name, public)
values
  ('logos', 'logos', true),
  ('team', 'team', true),
  ('players', 'players', true),
  ('photos', 'photos', true),
  ('albums', 'albums', true),
  ('face-references', 'face-references', false)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public can read Manochaco public media" on storage.objects;
create policy "Public can read Manochaco public media"
on storage.objects
for select
to anon, authenticated
using (bucket_id in ('logos', 'team', 'players', 'photos', 'albums'));

drop policy if exists "Admins can manage Manochaco public media" on storage.objects;
create policy "Admins can manage Manochaco public media"
on storage.objects
for all
to authenticated
using (
  bucket_id in ('logos', 'team', 'players', 'photos', 'albums')
  and private.can_manage_photos()
)
with check (
  bucket_id in ('logos', 'team', 'players', 'photos', 'albums')
  and private.can_manage_photos()
);

drop policy if exists "Admins can manage face references" on storage.objects;
create policy "Admins can manage face references"
on storage.objects
for all
to authenticated
using (bucket_id = 'face-references' and private.can_manage_photos())
with check (bucket_id = 'face-references' and private.can_manage_photos());

-- No public SELECT policy exists for face-references by design.
-- Reference photos support biometric matching only after consent and must stay private.
