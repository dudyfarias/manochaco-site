# Configuração do reconhecimento facial

## Pré-requisitos

- Supabase com schema, RLS e bucket privado `face-references` aplicados.
- Admin `super_admin`, `sports_admin` ou `photo_editor`.
- Node.js runtime nas APIs de reconhecimento.

## Banco

Além da migration do pipeline, aplique:

```text
supabase/migrations/20260623122352_add_face_embeddings.sql
```

Ela adiciona `embedding`, `embedding_model` e `embedding_generated_at` a
`player_face_references`. Esses campos são privados.

## Providers

Para testar todo o fluxo sem ML real:

```env
FACE_RECOGNITION_PROVIDER=mock
FACE_RECOGNITION_MIN_CONFIDENCE=0.75
FACE_RECOGNITION_MAX_DISTANCE=0.6
FACE_RECOGNITION_AUTO_APPROVE=false
```

O mock gera embedding determinístico e uma sugestão simulada quando existe uma
referência indexada. O admin mostra claramente “simulação local”.

Para usar o provider gratuito real:

```env
FACE_RECOGNITION_PROVIDER=faceapi
FACE_RECOGNITION_MIN_CONFIDENCE=0.75
FACE_RECOGNITION_MAX_DISTANCE=0.6
FACE_RECOGNITION_AUTO_APPROVE=false
```

AWS continua opcional com `FACE_RECOGNITION_PROVIDER=aws` e suas credenciais,
mas não é necessária para o sistema funcionar.

## Modelos face-api

Os arquivos ficam em `public/models/face-api/`:

- `tiny_face_detector_model-weights_manifest.json` e `.bin`;
- `face_landmark_68_model-weights_manifest.json` e `.bin`;
- `face_recognition_model-weights_manifest.json` e `.bin`.

O projeto versiona esses seis arquivos a partir do pacote
`@vladmandic/face-api`. Se algum estiver ausente, a API retorna erro amigável e
o restante do site continua funcionando.

## Gerar referência

1. Acesse `/admin/jogadores/[id]`.
2. Envie uma foto nítida com apenas o rosto do jogador.
3. Registre consentimento específico e aprovação.
4. Clique em **Gerar embedding**.
5. Confira provider, modelo e estado indexado.

Sem consentimento e aprovação a API rejeita a operação. Fotos e embeddings não
aparecem no site público.

## Processar e revisar

1. Em `/admin/galeria/fotos/[id]`, clique em **Processar reconhecimento facial**.
2. Abra `/admin/fotos/revisao`.
3. Confira rosto, jogador sugerido e confiança.
4. Confirme, troque ou ignore.
5. Verifique que apenas a tag confirmada aparece publicamente.

Depois da confirmação, consulte `/admin/reconhecimento-facial` para verificar a
tag publicada e abrir diretamente o perfil do jogador ou a foto pública. A
auditoria completa de status fica em `/admin/diagnostico/fotos`.

Para reprocessar uma foto, use a ação correspondente na edição da foto. Ela
remove somente sugestões pendentes ou com erro e preserva tags já confirmadas.
Também é possível marcar a foto como pendente para recolocá-la na fila.

O botão de lote processa uma foto por request. Mantenha lotes pequenos.

## Calibração

- Menor `MAX_DISTANCE` torna a comparação mais rigorosa.
- No face-api, `MAX_DISTANCE` controla o match; `MIN_CONFIDENCE` atende providers baseados em confiança.
- Comece com distância `0.6`, registre falsos positivos/negativos e ajuste.
- Cadastre referências frontais, bem iluminadas e atuais.
- Nunca use confiança como aprovação automática.

## Vercel e diagnóstico

O provider usa TensorFlow.js em CPU para evitar dependência nativa obrigatória.
Os modelos são incluídos no trace da função por `next.config.ts` e as APIs usam
runtime Node.js com duração máxima declarada.

- **Modelos ausentes:** confira os seis arquivos em `public/models/face-api/`.
- **Nenhum rosto:** use foto maior, frontal e com boa iluminação.
- **Múltiplos rostos na referência:** recorte para apenas um jogador.
- **Timeout:** processe individualmente ou use `mock` até mover para worker.
- **Sem sugestões:** gere embeddings no mesmo provider ativo.
- **Download privado falhou:** revise o bucket e as policies de Storage.
- **Foto fora da fila:** confira o motivo em `/admin/diagnostico/fotos`.
- **Tag confirmada não aparece:** rode `npm run validate:photos` e confira se a
  foto é pública e se a tag está confirmada para o UUID correto do jogador.

O procedimento completo está em `docs/FACE_RECOGNITION_OPERATIONS.md`.

Se o face-api não atender precisão ou escala, siga
`docs/INSIGHTFACE_FUTURE.md`.
