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

Em **Authentication > URL Configuration**, defina:

- Site URL: `https://manochaco-site.vercel.app`
- Redirect URLs: `http://localhost:3000/auth/confirm` e
  `https://manochaco-site.vercel.app/auth/confirm`

Configure SMTP próprio antes de liberar cadastros em produção. O envio padrão
do Supabase é adequado para testes, mas possui limites e não deve ser tratado
como infraestrutura definitiva de e-mail transacional.

## 3. Configurar ambiente local

Crie `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=
FACE_RECOGNITION_PROVIDER=aws
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REKOGNITION_COLLECTION_ID=manochaco-players
FACE_RECOGNITION_MIN_CONFIDENCE=80
FACE_RECOGNITION_AUTO_APPROVE=false
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
   - `NEXT_PUBLIC_SITE_URL` com `https://manochaco-site.vercel.app`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `FACE_RECOGNITION_PROVIDER`
   - `AWS_REGION`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REKOGNITION_COLLECTION_ID`
   - `FACE_RECOGNITION_MIN_CONFIDENCE`
   - `FACE_RECOGNITION_AUTO_APPROVE`
4. Faça o primeiro preview.
5. Valide rotas públicas e admin.
6. Promova para produção em `https://manochaco-site.vercel.app`.

## 7. Checklist rápido

- `/` carrega sem erro.
- `/jogadores`, `/jogos`, `/estatisticas`, `/galeria` carregam.
- `/entrar` e `/cadastro` abrem.
- Confirmação de e-mail retorna por `/auth/confirm`.
- `/conta` redireciona para login sem sessão.
- `/admin` redireciona para login sem sessão.
- Login admin funciona com usuário cadastrado no Supabase.
- Cadastro comum não cria registro em `admin_profiles`.
- `/admin/cadastros` lista solicitações apenas para super admin e admin esportivo.
- Upload de fotos usa bucket `photos`.
- Financeiro não aparece no site público.
- Sugestões de IA pendentes não aparecem publicamente.
- Bucket `face-references` continua privado.
- Indexação exige consentimento e aprovação.
- `FACE_RECOGNITION_AUTO_APPROVE` está `false`.
- Confirmação na revisão cria tag pública somente após ação humana.

O setup de IAM, collection, custos e teste manual está em
`docs/FACE_RECOGNITION_SETUP.md`.
