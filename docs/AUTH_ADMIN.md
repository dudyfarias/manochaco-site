# Autenticação administrativa

A área pública do site não exige login. A área administrativa usa Supabase Auth
para proteger edição de jogadores, jogos, estatísticas, fotos, álbuns,
marcações, financeiro e auditoria.

## Escopo da Fase 8

- Cliente Supabase server/browser criado.
- Login por e-mail e senha em `/admin/login`.
- Logout via Server Action.
- `src/proxy.ts` redireciona visitantes sem sessão para `/admin/login`.
- `src/lib/auth.ts` faz a checagem server-side de usuário e role.
- Tabela `admin_profiles` usada para permissões administrativas.
- Tabela `audit_logs` preparada e usada em ações críticas.
- RLS preparada para separar edição esportiva, edição de fotos e financeiro.

## Regras

- Verificar permissões server-side em Server Components, Server Actions ou Route
  Handlers.
- Não confiar em `user_metadata` para autorização.
- Usar roles em `admin_profiles` ou `app_metadata` controlado pelo servidor.
- Nunca expor `SUPABASE_SERVICE_ROLE_KEY` no client.
- Registrar ações sensíveis em `audit_logs`.
- Manter dados financeiros em área/tabelas admin-only.
- Tratar a planilha apenas como importação inicial; edições futuras devem
  acontecer pelo painel administrativo.

## Roles previstas

- `super_admin`: acesso total, gestão de administradores, esportivo, fotos e financeiro.
- `sports_admin`: jogadores, jogos, estatísticas, campeonatos, temporadas e fotos esportivas.
- `finance_admin`: mensalidades, receitas, despesas, patrocinadores e relatórios financeiros.
- `photo_editor`: upload, álbuns, marcações manuais e revisão de fotos.
- `viewer`: visualização administrativa sem edição.

## Rotas implementadas ou preparadas

- `/admin/login`
- `/admin`
- `/admin/jogadores`
- `/admin/jogadores/novo`
- `/admin/jogadores/[id]`
- `/admin/jogos`
- `/admin/jogos/novo`
- `/admin/jogos/[id]`
- `/admin/campeonatos`
- `/admin/temporadas`
- `/admin/galeria`
- `/admin/galeria/albuns`
- `/admin/galeria/fotos`
- `/admin/galeria/fotos/[id]`
- `/admin/fotos/revisao`
- `/admin/financeiro`
- `/admin/configuracoes`

Essas rotas não devem aparecer no menu público.

## Limitações atuais

- Gestão de usuários admin ainda deve ser feita pelo Supabase Dashboard ou SQL.
- Autorização fina por campo ainda é limitada ao conjunto de roles nas ações.
- Financeiro é placeholder privado e será detalhado em fase posterior.
- Reconhecimento facial usa rotas server-side autorizadas; credenciais AWS nunca chegam ao navegador.

## Fonte oficial dos dados

Depois da migração inicial, o painel admin será responsável por criar, editar,
atualizar e remover todos os dados mutáveis. A planilha pode ser reimportada
apenas em fluxo seguro com dry-run, diff, logs e revisão de conflitos.
