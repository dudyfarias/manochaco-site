# Supabase

Esta pasta prepara o Manochaco para usar Supabase como backend real. Depois da
migração inicial da planilha, o Supabase deve ser a fonte oficial dos dados, e o
painel administrativo deve ser o caminho principal para manutenção.

## Arquivos

- `schema.sql`: cria tabelas esportivas, administrativas, biométricas e
  financeiras privadas, além de constraints, índices e triggers de `updated_at`.
- `policies.sql`: habilita RLS e define leitura pública apenas para dados
  esportivos permitidos, além de escrita restrita a administradores autenticados.
- `storage-policies.sql`: cria buckets esperados e policies iniciais para
  Storage.
- `seed.sql`: seed mínimo de competições e temporadas. O seed completo a partir
  dos dados locais roda com `npm run seed:supabase`.

## Ordem sugerida

1. Criar o projeto no Supabase.
2. Copiar as variáveis para `.env.local`.
3. Rodar `schema.sql` no SQL Editor.
4. Rodar `policies.sql`.
5. Rodar `storage-policies.sql`.
6. Rodar `seed.sql` ou `npm run seed:supabase` para a carga inicial.

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
para reconhecimento facial futuro, com consentimento explícito e revisão humana.

## Segurança

- `SUPABASE_SERVICE_ROLE_KEY` só pode ser usada em scripts ou rotas server-side.
- Nunca use service role em Client Components.
- Dados financeiros ficam nas tabelas privadas `financial_categories`,
  `financial_transactions`, `player_monthly_fees`, `sponsors` e
  `sponsorship_contracts`.
- As tabelas financeiras não possuem leitura pública e devem ser acessadas
  apenas por `super_admin` ou `finance_admin`.
- Sugestões de IA e referências faciais não possuem policy de leitura pública.
- O site público só deve exibir tags em `photo_player_tags` com
  `confirmed_by_admin = true`.

## Roles administrativas

- `super_admin`: acesso total, incluindo gestão de administradores.
- `sports_admin`: jogadores, jogos, estatísticas, campeonatos e temporadas.
- `finance_admin`: financeiro privado, patrocinadores e relatórios.
- `photo_editor`: fotos, álbuns, marcações e fila de revisão.
- `reader`: leitura administrativa sem edição.

## Relação com a planilha

A planilha Manochaco é uma fonte inicial de importação. Após a primeira carga,
alterações em jogadores, jogos, estatísticas, fotos, campeonatos, temporadas e
financeiro devem acontecer no painel administrativo. A planilha não deve ser
necessária para atualizar o site no futuro.
