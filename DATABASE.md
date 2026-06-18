# Banco de dados

A Fase 7 cria a fundação Supabase do Manochaco. O Supabase deve se tornar a
fonte oficial do sistema depois da migração inicial da planilha. A planilha não
é banco permanente e não deve ser necessária para atualizar o site no futuro.

Os arquivos executáveis ficam em `supabase/`:

- `schema.sql`: tabelas, constraints, índices e triggers.
- `policies.sql`: RLS e policies de leitura pública/escrita administrativa.
- `storage-policies.sql`: buckets e policies de Storage.
- `seed.sql`: seed mínimo de competições e temporadas.

O site continua funcionando sem Supabase configurado usando fallback local em
`src/lib/data.ts`. Esse fallback existe para desenvolvimento, preview e
segurança de build, não como fonte definitiva.

## Fonte oficial

- Antes da migração: dados locais/generated permitem validar o site público.
- Durante a migração: `npm run seed:supabase` envia dados esportivos públicos
  revisáveis para o banco.
- Depois da migração: administradores cadastrados no painel devem criar, editar,
  atualizar e remover dados diretamente no sistema.
- Reimportações futuras da planilha devem ter dry-run, logs, checagem de
  conflitos e opção explícita para não sobrescrever dados editados no painel.

## Tabelas esportivas públicas

- `players`
- `competitions`
- `seasons`
- `matches`
- `player_match_stats`
- `albums`
- `photos`
- `photo_player_tags`

O site público pode ler essas tabelas conforme as policies. Tags de foto só
aparecem publicamente quando `confirmed_by_admin = true` e `tag_type` é
`manual` ou `ai_confirmed`.

## Tabelas administrativas e biometria

- `admin_profiles`
- `audit_logs`
- `player_face_references`
- `face_detection_suggestions`

Essas tabelas não têm leitura pública. Fotos de referência facial são privadas e
exigem consentimento específico. Sugestões de IA ficam internas até revisão
humana.

## Tabelas financeiras privadas

- `financial_categories`
- `financial_transactions`
- `player_monthly_fees`
- `sponsors`
- `sponsorship_contracts`

Essas tabelas estão preparadas para a Fase 9 e devem permanecer privadas. Não
exibir no site público mensalidades, dívidas, pagamentos individuais, dados
bancários, despesas internas, caixa do clube ou qualquer informação financeira
sensível.

Valores monetários devem ser salvos em centavos.

## Papéis administrativos

- `super_admin`: acesso total e gestão de administradores.
- `sports_admin`: jogadores, jogos, estatísticas, campeonatos, temporadas e fotos esportivas.
- `finance_admin`: financeiro privado, patrocínios e relatórios financeiros.
- `photo_editor`: upload, álbuns, marcação manual e revisão de fotos.
- `reader`: visualização administrativa sem edição.

As permissões devem ser verificadas server-side e reforçadas por RLS. Nunca
autorizar ações sensíveis apenas com dados vindos do client.

## Relação com o painel administrativo

O painel futuro será a interface principal para:

- gerenciar jogadores e comissão;
- gerenciar jogos, resultados e estatísticas por partida;
- gerenciar campeonatos e temporadas;
- fazer upload de fotos e criar álbuns;
- marcar jogadores em fotos;
- revisar sugestões de reconhecimento facial;
- gerenciar financeiro privado;
- registrar auditoria de alterações.

## Scripts

`npm run import:spreadsheet` lê a planilha e gera dados locais estruturados para
revisão/migração inicial.

`npm run seed:supabase` envia dados locais/generated para o Supabase usando
`SUPABASE_SERVICE_ROLE_KEY`. Esse script deve rodar apenas em ambiente local ou
server-side confiável e nunca no client.
