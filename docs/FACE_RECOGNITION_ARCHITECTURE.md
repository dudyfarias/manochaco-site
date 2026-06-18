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

Na fase local, fotos vindas do Google Drive devem ser importadas manualmente
para `public/`. O site público não deve depender de hotlink do Drive, porque a
entrega pode ser bloqueada e o `next/image` precisa de origem estável.

Novos uploads podem ser feitos pelo painel e persistidos no Supabase. Arquivos
locais ficam apenas como fallback e apoio de desenvolvimento.

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

## Banco Supabase

Tabelas Supabase preparadas:

- `photos`;
- `albums`;
- `photo_player_tags`;
- `face_detection_suggestions`;
- `player_face_references`;
- `admin_profiles`;
- `audit_logs`.

## Apoio do Supabase

- `photos` guarda a imagem pública e o status de processamento.
- `player_face_references` guarda imagens privadas de referência.
- `face_detection_suggestions` guarda sugestões pendentes, alteradas ou
  ignoradas.
- `photo_player_tags` guarda marcações manuais e confirmações de IA.
- `admin_profiles` define permissões de revisão.
- `audit_logs` registra confirmações, trocas, remoções e revogações.
- Supabase Storage entrega buckets públicos para galeria e bucket privado
  `face-references`.
- Supabase Auth protegerá a revisão humana no painel administrativo.

O site público só deve ler marcações confirmadas. A service role nunca deve ser
usada no client.

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
- Upload administrativo para fotos públicas existe, mas ainda não dispara processamento de IA.
- Supabase Auth protege o admin MVP.
- Bounding boxes são armazenadas nos mocks, mas ainda não são desenhadas sobre a imagem.
