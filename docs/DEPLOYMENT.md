# Deploy em produção

Este guia prepara o site do Manochaco para Vercel com Supabase como backend
oficial.

## 1. Criar Supabase

1. Crie um projeto no Supabase.
2. Copie a URL do projeto e a anon key.
3. Copie a service role key apenas para ambiente local seguro e variáveis
   server-side.

## 2. Aplicar banco

No SQL Editor do Supabase, execute nesta ordem:

```text
supabase/schema.sql
supabase/policies.sql
supabase/storage-policies.sql
supabase/seed.sql
```

Depois, crie o primeiro administrador em Supabase Auth e insira um registro em
`admin_profiles` com a mesma `user_id`.

## 3. Configurar ambiente local

Crie `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` é exclusiva de scripts server-side. Nunca use essa
chave em Client Components.

## 4. Rodar seed inicial

Depois de revisar os dados gerados:

```bash
npm run seed:supabase
```

Use o seed como migração inicial. Reexecutar depois de edições feitas no admin
pode sobrescrever dados por slug. Para ensaio:

```bash
npm run seed:supabase -- --dry-run
```

## 5. Validar produção

```bash
npm install
npm run typecheck
npm run lint
npm run build
npm run audit:images
npm run validate:prod
```

`validate:prod` exige Supabase configurado e checa tabelas, buckets, leitura
pública básica e isolamento de tabelas privadas.

## 6. Configurar Vercel

1. Conecte o repositório GitHub à Vercel.
2. Configure o projeto como Next.js.
3. Adicione as variáveis:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Faça o primeiro preview.
5. Valide rotas públicas e admin.
6. Promova para produção em `https://manochaco-site.vercel.app`.

## 7. Checklist rápido

- `/` carrega sem erro.
- `/jogadores`, `/jogos`, `/estatisticas`, `/galeria` carregam.
- `/admin/login` abre.
- `/admin` redireciona para login sem sessão.
- Login admin funciona com usuário cadastrado no Supabase.
- Upload de fotos usa bucket `photos`.
- Financeiro não aparece no site público.
- Sugestões de IA pendentes não aparecem publicamente.
