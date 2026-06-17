# Arquitetura futura de reconhecimento facial

## Objetivo

Ajudar a organizar o acervo esportivo do Manochaco sugerindo jogadores em fotos.
A IA nunca deve publicar marcações automaticamente. Toda sugestão passa por
revisão humana.

## Dados necessários

- Fotos do acervo.
- Álbuns.
- Jogadores.
- Fotos de referência autorizadas.
- Consentimento específico para reconhecimento facial.
- Sugestões de detecção.
- Tags confirmadas.

## Tipos principais

- `Photo`
- `Album`
- `PhotoPlayerTag`
- `FaceDetectionSuggestion`
- `PlayerFaceReference`

## Fluxo de upload

1. Admin envia foto.
2. Arquivo é salvo em Supabase Storage.
3. Registro é criado em `photos`.
4. Foto recebe status `not_processed` ou `processing`.

## Fluxo de detecção

1. Um job em background processa a imagem.
2. Rostos são detectados.
3. Cada rosto gera uma bounding box.
4. O sistema compara o rosto com referências autorizadas.

## Fluxo de sugestão

1. Para cada rosto, o sistema cria uma sugestão.
2. Sugestão recebe jogador provável e confiança.
3. Confiança baixa deve marcar a foto como `needs_review`.
4. Sugestões ficam internas.

## Fluxo de revisão humana

1. Admin acessa a fila.
2. Confirma, troca jogador ou ignora.
3. Confirmações criam tags `ai_confirmed`.
4. Ignoradas não aparecem no público.

## Fluxo de publicação

O site público consulta apenas:

- tags `manual` confirmadas;
- tags `ai_confirmed` confirmadas.

Tags `ai_suggested` e sugestões pendentes não são exibidas.

## LGPD

Reconhecimento facial envolve dado biométrico. O sistema futuro deve:

- coletar consentimento específico;
- permitir revogação;
- permitir remoção de fotos e referências;
- manter finalidade clara;
- evitar exposição de dados sensíveis;
- registrar auditoria de revisão.

## Banco futuro

Tabelas previstas:

- `photos`;
- `albums`;
- `photo_players`;
- `face_detection_suggestions`;
- `player_face_references`;
- `image_consents`;
- `admin_audit_logs`.

## Serviços possíveis

Nenhum serviço final foi escolhido. A arquitetura deve permitir:

- serviço próprio de embeddings faciais;
- API externa de reconhecimento;
- processamento em background;
- fila de revisão humana;
- troca de fornecedor sem alterar o site público.

## Limitações atuais

- Dados são mockados.
- Não há embeddings faciais.
- Não há upload real.
- Não há Supabase.
- Não há autenticação.
- Bounding boxes são armazenadas nos mocks, mas ainda não são desenhadas sobre a imagem.
