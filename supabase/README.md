# Supabase

Esta pasta prepara o Manochaco para usar Supabase como backend real. Depois da
migração inicial da planilha, o Supabase deve ser a fonte oficial dos dados, e o
painel administrativo deve ser o caminho principal para manutenção.

Projeto de produção: `yfjniefejnahenwbtdyn` (`manochaco`, região `sa-east-1`).
O Auth usa `https://manochaco-site.vercel.app` como Site URL e aceita o callback
`/auth/confirm` em produção e no desenvolvimento local.

## Arquivos

- `schema.sql`: cria tabelas esportivas, administrativas, biométricas e
  financeiras privadas, além de constraints, índices e triggers de `updated_at`.
- `policies.sql`: habilita RLS e define leitura pública apenas para dados
  esportivos permitidos, além de escrita restrita a administradores autenticados.
- `storage-policies.sql`: cria buckets esperados e policies iniciais para
  Storage.
- `seed.sql`: seed mínimo de competições e temporadas. O seed completo a partir
  dos dados locais roda com `npm run seed:supabase`.
- `migrations/20260619130011_add_face_recognition_pipeline.sql`: atualização de
  projetos da Fase 8 para o fluxo real de reconhecimento facial.
- `migrations/20260619134023_add_public_member_accounts.sql`: cria contas
  públicas, provisionamento por Auth, proteção de campos e RLS.
- `migrations/20260622163717_harden_database_functions.sql`: fixa o
  `search_path` e remove execução pública de função administrativa.
- `migrations/20260622164522_add_member_birth_date.sql`: troca a coleta do ano
  pela data de nascimento completa e descontinua a mensagem livre no cadastro.
- `migrations/20260624140800_add_insightface_embeddings.sql`: cria a tabela
  privada de embeddings e migra vetores legados consentidos.

## Ordem sugerida

1. Criar o projeto no Supabase.
2. Copiar as variáveis para `.env.local`.
3. Rodar `schema.sql` no SQL Editor.
4. Rodar `policies.sql`.
5. Rodar `storage-policies.sql`.
6. Rodar `seed.sql` ou `npm run seed:supabase` para a carga inicial.

Projetos existentes devem aplicar as migrations em ordem e depois reaplicar
`policies.sql` e `storage-policies.sql` para confirmar as proteções.

`npm run seed:supabase` deve ser tratado como migração inicial. Reimportações
futuras precisam de dry-run, diff, logs e confirmação para não sobrescrever
dados editados no painel.

## Buckets esperados

- `logos`: público, logos e escudos do site.
- `team`: público, fotos gerais do time.
- `players`: público, fotos de perfil dos jogadores.
- `photos`: público, fotos da galeria.
- `albums`: público, capas e imagens de álbuns.
- `face-references`: privado, fotos de referência facial.

`face-references` não deve ter leitura pública. Essas imagens servem somente
para reconhecimento facial, com consentimento explícito e revisão humana.

O servidor baixa referências privadas com a sessão autenticada do admin. A
service role não participa das rotas de indexação ou processamento.

## Segurança

- `SUPABASE_SERVICE_ROLE_KEY` só pode ser usada em scripts ou rotas server-side.
- Nunca use service role em Client Components.
- Dados financeiros ficam nas tabelas privadas `financial_categories`,
  `financial_transactions`, `player_monthly_fees`, `sponsors` e
  `sponsorship_contracts`.
- As tabelas financeiras não possuem leitura pública e devem ser acessadas
  apenas por `super_admin` ou `finance_admin`.
- Sugestões, referências e embeddings faciais não possuem leitura pública.
- Perfis de membros não possuem leitura anônima; cada usuário lê o próprio
  registro e somente admins esportivos revisam a fila completa.
- Tipo de conta pública nunca deve ser confundido com role administrativa.
- O site público só deve exibir tags em `photo_player_tags` com
  `confirmed_by_admin = true`.

## Roles administrativas

- `super_admin`: acesso total, incluindo gestão de administradores.
- `sports_admin`: jogadores, jogos, estatísticas, campeonatos e temporadas.
- `finance_admin`: financeiro privado, patrocinadores e relatórios.
- `photo_editor`: fotos, álbuns, marcações e fila de revisão.
- `viewer`: leitura administrativa sem edição.

## Relação com a planilha

A planilha Manochaco é uma fonte inicial de importação. Após a primeira carga,
alterações em jogadores, jogos, estatísticas, fotos, campeonatos, temporadas e
financeiro devem acontecer no painel administrativo. A planilha não deve ser
necessária para atualizar o site no futuro.
