# Arquitetura de reconhecimento facial

## Objetivo

O reconhecimento facial organiza o acervo sugerindo jogadores presentes nas
fotos. InsightFace detecta e compara rostos, mas não publica marcações. Toda
sugestão precisa ser confirmada, corrigida ou ignorada por um administrador.

## Componentes

```text
Next.js / Vercel
├── autentica o admin
├── gera URLs temporárias do Storage
├── chama o microserviço com uma chave server-side
├── grava embeddings e sugestões no Supabase
└── mantém a revisão humana

Microserviço Python / InsightFace
├── valida a chave x-face-api-key
├── baixa a imagem de origem segura
├── detecta todos os rostos
├── gera embeddings normalizados
├── compara com embeddings autorizados
└── retorna resultados sem acessar o Supabase

Supabase
├── player_face_references: consentimento, arquivo e estado
├── player_face_embeddings: vetores biométricos privados
├── face_detection_suggestions: sugestões privadas
└── photo_player_tags: somente vínculos revisados
```

O serviço fica em `services/face-recognition/`. A integração server-side fica
em `src/lib/face-recognition/insightface-provider.ts`. Face-api e AWS
permanecem apenas como providers legados; o padrão é `insightface`. O provider
`mock` é bloqueado quando `NODE_ENV=production`.

## Referência facial

1. O admin envia JPEG ou PNG ao bucket privado `face-references`.
2. `player_face_references` registra consentimento e aprovação.
3. O Next.js cria uma URL assinada de cinco minutos.
4. `/embed-face` exige exatamente um rosto e retorna o embedding.
5. O Next.js grava o vetor em `player_face_embeddings` e atualiza o estado da
   referência.
6. Revogar consentimento ou remover a referência exclui o embedding privado.

O microserviço não recebe credenciais Supabase e não persiste dados.

## Processamento de foto

1. O admin solicita o processamento individual ou de até cinco fotos por lote.
2. A foto muda para `processing`.
3. O Next.js busca somente embeddings com consentimento e aprovação.
4. `/process-photo` detecta todos os rostos e encontra o melhor match.
5. Apenas matches aceitos voltam como sugestões.
6. O Next.js grava cada resultado como `pending` em
   `face_detection_suggestions`.
7. A foto fica `needs_review`, `processed` ou `error`.

Nenhum passo cria `photo_player_tags`. Essa tabela só é alterada pela decisão
humana em `/admin/fotos/revisao`.

## Métrica e calibração

O InsightFace retorna embeddings normalizados. O serviço usa similaridade de
cosseno para aceite e mantém a distância euclidiana como diagnóstico:

- `FACE_MIN_CONFIDENCE`: confiança mínima da detecção do rosto;
- `FACE_MATCH_THRESHOLD`: similaridade cosseno mínima no microserviço, padrão `0.35`;
- `FACE_RECOGNITION_MIN_CONFIDENCE`: filtro adicional do Next.js, padrão
  `0.75`;
- `FACE_RECOGNITION_BATCH_LIMIT`: máximo por execução, padrão `5`.

Esses valores devem ser calibrados com fotos reais do Manochaco. O valor
`confidence` é um escore normalizado de ordenação, não uma probabilidade.
Confiança alta nunca equivale a aprovação automática.

## Segurança

- A chave do microserviço nunca usa prefixo `NEXT_PUBLIC_`.
- Apenas `/health` é público; os demais endpoints exigem `x-face-api-key`.
- URLs locais, redes privadas, redirects e imagens acima do limite são
  bloqueados pelo serviço.
- Recomenda-se restringir hosts com `FACE_ALLOWED_IMAGE_HOSTS`.
- Referências, embeddings, sugestões e respostas técnicas têm RLS privada.
- `FACE_RECOGNITION_AUTO_APPROVE=true` é bloqueado em runtime.
- Site público consulta somente tags com `confirmed_by_admin = true`.

## Limites operacionais

O `buffalo_l` tem download e inicialização pesados. O modelo é carregado uma
vez por processo e fica fora da Vercel. Para escala maior, o próximo passo é
uma fila assíncrona, cache persistente do modelo e métricas de precisão por
tipo de foto.
