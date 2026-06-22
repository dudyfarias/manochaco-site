# Banco de dados

A Fase 7 criou a fundação Supabase do Manochaco e a Fase 8 adicionou o painel
administrativo MVP. O Supabase deve ser a fonte oficial do sistema depois da
migração inicial da planilha. A planilha não é banco permanente e não deve ser
necessária para atualizar o site no futuro.

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
`manual` ou `ai_confirmed`. Fotos públicas devem ter `photos.is_public = true`.

## Tabelas administrativas e biometria

- `admin_profiles`
- `member_profiles`
- `audit_logs`
- `player_face_references`
- `face_detection_suggestions`

Essas tabelas não têm leitura pública. Fotos de referência facial são privadas e
exigem consentimento específico. Sugestões de IA ficam internas até revisão
humana.

`member_profiles` guarda os dados privados das contas públicas. O campo
`account_type` aceita `supporter`, `player`, `candidate` ou `partner`; o campo
`status` aceita `pending`, `active`, `rejected` ou `blocked`. Jogadores,
candidatos e parceiros entram como pendentes. O vínculo opcional
`linked_player_id` só é definido após revisão de `sports_admin` ou
`super_admin`. A data de nascimento completa fica em `birth_date`; os campos
`birth_year` e `message` existem somente para compatibilidade com cadastros
anteriores e não são mais coletados.

O trigger `private.handle_new_member_profile` provisiona o perfil quando o
Supabase Auth cria um usuário. Metadados do cadastro podem solicitar um tipo de
conta, mas nunca definem role administrativa. RLS permite ao usuário ler e
atualizar apenas seus dados editáveis; status, tipo, e-mail e vínculo são
protegidos por trigger e pelas policies.

`player_face_references` registra `storage_path`, provider, Face ID, collection,
estado/erro de indexação e data. Consentimento e aprovação são obrigatórios
antes da indexação.

`face_detection_suggestions` registra provider, Face ID correspondente,
confiança normalizada, bounding box, status e `raw_response` privada. Os status
permitidos incluem `pending`, `confirmed`, `changed`, `ignored` e `error`.

`photos.face_recognition_status` usa `not_processed`, `queued`, `processing`,
`processed`, `needs_review`, `error` ou `approved`.

## Tabelas financeiras privadas

- `financial_categories`
- `financial_transactions`
- `player_monthly_fees`
- `sponsors`
- `sponsorship_contracts`

Essas tabelas estão preparadas para uma fase financeira futura e devem permanecer privadas. Não
exibir no site público mensalidades, dívidas, pagamentos individuais, dados
bancários, despesas internas, caixa do clube ou qualquer informação financeira
sensível.

Valores monetários devem ser salvos em centavos.

## Papéis administrativos

- `super_admin`: acesso total e gestão de administradores.
- `sports_admin`: jogadores, jogos, estatísticas, campeonatos, temporadas e fotos esportivas.
- `finance_admin`: financeiro privado, patrocínios e relatórios financeiros.
- `photo_editor`: upload, álbuns, marcação manual e revisão de fotos.
- `viewer`: visualização administrativa sem edição.

As permissões devem ser verificadas server-side e reforçadas por RLS. Nunca
autorizar ações sensíveis apenas com dados vindos do client.

## Relação com o painel administrativo MVP

O painel administrativo é a interface principal para:

- gerenciar jogadores e comissão;
- gerenciar jogos, resultados e estatísticas por partida;
- gerenciar campeonatos e temporadas;
- fazer upload de fotos e criar álbuns;
- marcar jogadores em fotos;
- revisar sugestões de reconhecimento facial;
- registrar auditoria de alterações.

Nesta fase, o financeiro existe como rota privada placeholder e como tabelas
protegidas para uma fase posterior.

## Scripts

`npm run import:spreadsheet` lê a planilha e gera dados locais estruturados para
revisão/migração inicial.

`npm run seed:supabase` envia dados locais/generated para o Supabase usando
`SUPABASE_SERVICE_ROLE_KEY`. Esse script deve rodar apenas em ambiente local ou
server-side confiável e nunca no client.

`npm run validate:prod` valida variáveis de ambiente, tabelas principais,
buckets esperados e isolamento básico de tabelas privadas.
