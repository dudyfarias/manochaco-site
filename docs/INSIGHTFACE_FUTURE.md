# Evolução futura do InsightFace

## Por que considerar

InsightFace já é o provider principal. Este documento registra as evoluções
posteriores ao microserviço inicial.

## Arquitetura proposta

- Fila durável para processamento assíncrono.
- CPU dedicada ou GPU conforme medição.
- Supabase Storage continua guardando imagens públicas e referências privadas.
- Supabase Postgres continua guardando embeddings, sugestões e revisão.
- Métricas de falsos positivos e negativos por tipo de foto.
- Migração opcional para `pgvector` quando houver volume que justifique índice.

## Segurança

- Serviço sem acesso público irrestrito.
- Credenciais e URLs somente server-side.
- Referências usadas apenas com consentimento e aprovação.
- Embeddings tratados como biometria e removíveis.
- Sugestões continuam `pending`; revisão humana permanece obrigatória.

O deploy atual está documentado em
`docs/FACE_RECOGNITION_INSIGHTFACE_DEPLOYMENT.md`.
