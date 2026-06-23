# InsightFace futuro

## Por que considerar

InsightFace oferece modelos modernos e costuma ser mais robusto que face-api
em variações de pose, iluminação e idade. É a evolução recomendada se os testes
com fotos reais do Manochaco mostrarem precisão insuficiente.

## Arquitetura proposta

- Microserviço Python separado da Vercel, com CPU dedicada ou GPU.
- API interna autenticada para gerar embeddings e processar fotos.
- Supabase Storage continua guardando imagens públicas e referências privadas.
- Supabase Postgres continua guardando embeddings, sugestões e revisão.
- Next.js envia trabalhos ao serviço e recebe resultados normalizados pelo
  contrato `FaceRecognitionProvider`.
- Em escala, uma fila processa fotos fora da request do navegador.

## Segurança

- Serviço sem acesso público irrestrito.
- Credenciais e URLs somente server-side.
- Referências usadas apenas com consentimento e aprovação.
- Embeddings tratados como biometria e removíveis.
- Sugestões continuam `pending`; revisão humana permanece obrigatória.

Uma migração futura pode mover `embedding jsonb` para `pgvector`, após avaliar
dimensão, índice, volume e política de retenção.
