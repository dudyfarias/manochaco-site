# Arquitetura de reconhecimento facial

## Objetivo

O reconhecimento facial organiza o acervo sugerindo jogadores presentes nas
fotos. Nenhum resultado é publicado automaticamente: toda sugestão precisa ser
confirmada, corrigida ou ignorada por um administrador.

## Providers

O contrato `FaceRecognitionProvider` fica em `src/lib/face-recognition/` e
isola as telas e o banco da tecnologia usada:

- `mock-provider.ts`: simula embeddings e sugestões para testar o fluxo.
- `faceapi-provider.ts`: implementação open source com o fork mantido
  `@vladmandic/face-api`, TensorFlow.js e modelos versionados em
  `public/models/face-api/`.
- `aws-rekognition.ts`: integração opcional legada.
- `insightface`: reservado para um microserviço futuro.

O provider padrão é `mock`. `faceapi` roda apenas no Node.js server-side; a
Vercel inclui os modelos no trace das duas Route Handlers.

## Referências e embeddings

1. O admin envia JPEG/PNG de até 5 MB em `/admin/jogadores/[id]`.
2. A imagem entra no bucket privado `face-references`.
3. Consentimento e aprovação ficam em `player_face_references`.
4. A API autenticada valida a role e as duas autorizações.
5. O provider detecta exatamente um rosto e gera um descritor de 128 valores.
6. O embedding, modelo e data ficam em colunas privadas da referência.

Revogar consentimento ou aprovação limpa embedding, identificadores e data de
geração. Remover a referência também remove o arquivo privado.

## Processamento da galeria

1. O admin solicita o processamento de uma foto.
2. A foto passa para `processing` e é carregada de origem autorizada.
3. O face-api detecta rostos e gera um embedding para cada um.
4. `findBestMatch` compara o rosto com referências consentidas do provider.
5. Distância máxima e confiança mínima decidem se há jogador sugerido.
6. Cada rosto detectado gera uma sugestão `pending`, inclusive sem match.
7. A foto fica `needs_review`, `processed` ou `error`.

`FACE_RECOGNITION_MAX_DISTANCE` controla o match do face-api por distância
euclidiana; o padrão `0.6` é um ponto inicial, não uma garantia.
`FACE_RECOGNITION_MIN_CONFIDENCE` permanece no contrato normalizado para
providers baseados em confiança, como AWS. Os limiares precisam ser calibrados
com fotos reais.

## Revisão e publicação

`/admin/fotos/revisao` mostra bounding box, confiança e provider. Confirmar ou
trocar cria `photo_player_tags` com `tag_type = ai_confirmed` e
`confirmed_by_admin = true`. Ignorar não cria tag.

O site público consulta apenas tags confirmadas. Nunca consulta embeddings,
fotos de referência, sugestões pendentes, respostas brutas ou IDs internos.

## Segurança e limites

- APIs exigem sessão e role administrativa de fotos.
- Referências e embeddings são dados biométricos privados protegidos por RLS.
- `FACE_RECOGNITION_AUTO_APPROVE=true` é bloqueado em runtime.
- Imagens externas arbitrárias são bloqueadas.
- O processamento é síncrono e usa TensorFlow.js em CPU, portanto lotes grandes
  devem migrar para fila ou microserviço.
- Fotos coletivas pequenas, ângulo, luz e resolução afetam a detecção.
- O provider `mock` é identificado no admin e não representa reconhecimento real.

Se precisão ou escala forem insuficientes, a evolução recomendada está em
`docs/INSIGHTFACE_FUTURE.md`.
