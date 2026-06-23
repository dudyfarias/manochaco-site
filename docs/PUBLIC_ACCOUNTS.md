# Contas públicas

## Objetivo

O portal permite criar contas para torcedores, jogadores do Manochaco,
candidatos interessados em jogar e parceiros. A autenticação usa Supabase Auth;
os dados privados ficam em `member_profiles`.

O formulário coleta a data de nascimento completa, além de dados básicos de
contato e posição preferida. Não existe mais campo de mensagem livre no
cadastro. `birth_year` e `message` permanecem no banco somente como legado.

## Tipos de conta

- `supporter`: fica ativa após confirmação do e-mail.
- `player`: solicita vínculo com um registro existente em `players`.
- `candidate`: registra interesse em participar do time.
- `partner`: registra interesse comercial ou de colaboração.

Jogador, candidato e parceiro começam com status `pending`. A administração
analisa o pedido em `/admin/cadastros` e pode ativar, rejeitar ou bloquear a
conta. Um jogador só é vinculado ao perfil esportivo por `linked_player_id`
depois dessa revisão.

## Segurança

- Cadastro público nunca cria `admin_profiles`.
- `user_metadata` não concede permissões.
- Roles administrativas são definidas separadamente pelo clube.
- Cada membro lê apenas o próprio perfil por RLS.
- `sports_admin` e `super_admin` analisam os cadastros.
- E-mail, status, tipo de conta e vínculo com jogador não podem ser alterados
  pelo próprio usuário.
- A recuperação de senha responde de forma genérica para reduzir enumeração de
  contas.

## Rotas

- `/entrar`
- `/cadastro`
- `/cadastro/confirmar`
- `/auth/confirm`
- `/recuperar-senha`
- `/nova-senha`
- `/conta`
- `/admin/cadastros`

## Navegação autenticada

O Header e o Footer acompanham a sessão do Supabase no navegador. Visitantes
veem “Entrar” e “Cadastre-se”; usuários autenticados veem “Meu perfil”, com
link para `/conta`. A proteção da conta continua sendo validada no servidor.

## Configuração do Supabase

1. Aplique `supabase/schema.sql` e `supabase/policies.sql` em projetos novos.
2. Em projetos existentes, aplique as migrations
   `20260619134023_add_public_member_accounts.sql` e
   `20260622164522_add_member_birth_date.sql`.
3. Configure Site URL e Redirect URLs para `/auth/confirm`.
4. Configure SMTP próprio em produção.
5. Defina `NEXT_PUBLIC_SITE_URL` no ambiente local e na Vercel.

## Limitações atuais

A conta oferece perfil, status e atualização de dados. Convites para partidas,
notificações, inscrições em avaliações e recursos sociais ficam para uma fase
posterior. O cadastro de candidato não representa aprovação para jogar.
