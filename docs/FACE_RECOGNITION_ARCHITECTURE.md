# Arquitetura de reconhecimento facial

## Objetivo

O reconhecimento facial ajuda a organizar o acervo esportivo sugerindo quais
jogadores aparecem em cada foto. O resultado do provedor nunca é publicado
automaticamente: toda sugestão precisa ser confirmada, corrigida ou ignorada por
um administrador.

## Componentes

- `src/lib/face-recognition/types.ts`: contrato normalizado do domínio.
- `src/lib/face-recognition/provider.ts`: configuração, erros e regras comuns.
- `src/lib/face-recognition/aws-rekognition.ts`: provider Amazon Rekognition.
- `src/lib/face-recognition/mock-provider.ts`: provider sem chamadas externas.
- `src/lib/face-recognition/index-player-face.ts`: indexação consentida.
- `src/lib/face-recognition/process-photo.ts`: geração de sugestões.
- `src/lib/face-recognition/image-source.ts`: leitura segura de imagens.

As telas e rotas administrativas dependem apenas do contrato
`FaceRecognitionProvider`. Outro serviço pode substituir a AWS sem alterar o
fluxo público ou as tabelas de revisão.

## Fluxo de referência

1. O admin envia JPEG/PNG de até 5 MB em `/admin/jogadores/[id]`.
2. O arquivo entra no bucket privado `face-references`.
3. `player_face_references` registra caminho, consentimento e aprovação.
4. A rota autenticada valida role, consentimento e aprovação.
5. O provider indexa no collection e usa o UUID do jogador como
   `ExternalImageId`.
6. `provider_face_id`, collection e data de indexação ficam no banco privado.

Revogar consentimento ou aprovação de uma referência indexada remove primeiro o
vetor no provider e depois limpa os metadados locais.

## Fluxo de foto coletiva

1. O admin solicita processamento em `/admin/galeria/fotos/[id]`.
2. A foto passa por `queued`/`processing` e é lida do site ou Supabase Storage.
3. O provider indexa temporariamente até 100 rostos da imagem.
4. Cada rosto temporário é comparado à collection com `SearchFaces`.
5. Os rostos temporários são removidos da collection em `finally`.
6. Cada detecção gera uma sugestão pendente, inclusive rostos sem match.
7. A foto fica `needs_review`, `processed` ou `error`.

As buscas dentro de uma foto são sequenciais para não gerar uma rajada acima da
quota de transações por segundo do Rekognition.

Bounding boxes e confiança são normalizados entre 0 e 1. `raw_response` guarda
apenas a detecção e o match selecionado do provider, fica restrita ao
banco/admin e nunca é enviada ao site público.

## Revisão e publicação

Em `/admin/fotos/revisao`, o admin vê a região detectada e pode:

- confirmar o jogador sugerido;
- trocar por outro jogador;
- ignorar o rosto.

Confirmar ou trocar cria `photo_player_tags` com `tag_type = ai_confirmed` e
`confirmed_by_admin = true`. Quando não há mais sugestões pendentes, a foto
passa a `approved` se houve confirmação, ou `processed` se todas foram
ignoradas.

O site público consulta apenas tags manuais ou de IA confirmadas. Não consulta
referências, sugestões, respostas brutas nem identificadores do provider.

## Segurança

- Módulos AWS usam `server-only`.
- Credenciais AWS não possuem prefixo `NEXT_PUBLIC_`.
- Rotas chamam `getAdminContext` e validam role de fotos.
- Bucket de referências é privado e protegido por RLS.
- Downloads privados usam a sessão Supabase do admin.
- Fotos remotas só podem vir do host do site ou do Supabase configurado.
- `FACE_RECOGNITION_AUTO_APPROVE=true` é bloqueado em runtime.
- Erros técnicos completos ficam no servidor/auditoria; o client recebe mensagem segura.

## Limitações

- O processamento atual acontece em uma Route Handler síncrona.
- O lote do admin chama uma foto por vez e para no primeiro erro.
- Imagens enviadas como bytes à AWS têm limite de 5 MB e precisam ser JPEG/PNG.
- Não há retry automático, fila durável ou monitor de custos.
- Qualidade, ângulo, iluminação e tamanho do rosto afetam o resultado.

Lotes grandes devem migrar para background jobs/queue antes de escalar o
acervo. A decisão humana continua obrigatória mesmo após essa evolução.
