# Autenticação administrativa

A área pública do site não exige login. A área administrativa futura usará
Supabase Auth para proteger edição de jogadores, jogos, estatísticas, fotos,
álbuns, marcações, financeiro e auditoria.

## Escopo desta fase

- Cliente Supabase server/browser criado.
- Tabela `admin_profiles` preparada.
- Tabela `audit_logs` preparada.
- Rota `/admin` criada apenas como placeholder visual.
- Nenhum login real foi implementado ainda.
- RLS preparada para separar edição esportiva, edição de fotos e financeiro.

## Regras futuras

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
- `reader`: visualização administrativa sem edição.

## Rotas futuras

- `/admin/login`
- `/admin`
- `/admin/jogadores`
- `/admin/jogos`
- `/admin/fotos`
- `/admin/fotos/revisao`
- `/admin/consentimentos`
- `/admin/campeonatos`
- `/admin/temporadas`
- `/admin/financeiro`
- `/admin/financeiro/mensalidades`
- `/admin/financeiro/transacoes`
- `/admin/financeiro/patrocinios`

Essas rotas não devem aparecer no menu público.

## Fonte oficial dos dados

Depois da migração inicial, o painel admin será responsável por criar, editar,
atualizar e remover todos os dados mutáveis. A planilha pode ser reimportada
apenas em fluxo seguro com dry-run, diff, logs e revisão de conflitos.
