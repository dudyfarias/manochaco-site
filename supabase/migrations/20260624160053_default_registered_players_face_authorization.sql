alter table public.player_face_references
  alter column consent_given set default true,
  alter column approved_for_recognition set default true;

alter table public.player_face_embeddings
  alter column consent_given set default true,
  alter column approved_for_recognition set default true;

update public.player_face_references
set
  consent_given = true,
  approved_for_recognition = true,
  updated_at = now()
where not consent_given or not approved_for_recognition;

comment on column public.player_face_references.consent_given is
'Autorização biométrica registrada como pré-requisito do cadastro do jogador. Pode ser revogada pelo admin.';

comment on column public.player_face_references.approved_for_recognition is
'Referências de jogadores cadastrados entram aprovadas; a revogação continua disponível por LGPD.';
