# Clube Atlético Manochaco - Site Oficial

Portal oficial do Clube Atlético Manochaco, desenvolvido com Next.js,
TypeScript, Tailwind CSS e App Router. O site público funciona com fallback
local para desenvolvimento, mas o Supabase é a fonte principal planejada para
produção e o painel administrativo MVP já permite gerenciar a base oficial.

## Requisitos

- Node.js 20.9+ recomendado
- npm 10+

## Como rodar localmente

```bash
cd manochaco-site
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Scripts

```bash
npm run dev        # servidor local
npm run build      # build de produção
npm run start      # executa o build
npm run import:spreadsheet # importa a planilha Manochaco
npm run seed:supabase # envia dados esportivos locais para Supabase
npm run audit:images # audita imagens locais e vínculos de fotos
npm run validate:prod # valida env, Supabase, tabelas e buckets
npm run typecheck  # valida TypeScript
npm run lint       # valida ESLint
```

## Supabase

O Supabase concentra PostgreSQL, Auth e Storage. Sem `.env.local`, o site usa os
dados locais/generated como fallback de desenvolvimento para não quebrar build,
rotas públicas e preview.

Depois da migração inicial, o Supabase passa a ser a fonte oficial. A planilha
do Manochaco deve ser usada apenas para carga inicial ou reimportações
controladas, com logs, dry-run e revisão para não sobrescrever edições feitas
no painel administrativo.

Crie `.env.local` com base em `.env.example` quando o projeto Supabase existir:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=
FACE_RECOGNITION_PROVIDER=mock
FACE_RECOGNITION_MIN_CONFIDENCE=0.75
FACE_RECOGNITION_MAX_DISTANCE=0.6
FACE_RECOGNITION_AUTO_APPROVE=false
```

Depois de rodar os SQLs em `supabase/`, use a carga inicial:

```bash
npm run seed:supabase
npm run validate:prod
```

`SUPABASE_SERVICE_ROLE_KEY` é exclusiva de scripts/server-side e nunca deve ir
para Client Components.

## Estrutura

```text
src/app          rotas App Router
src/components   componentes reutilizáveis
src/data         dados locais e camada central de origem
src/data/generated dados gerados pela planilha
src/lib          helpers, camada híbrida de dados, Supabase e adapters
src/types        contratos TypeScript
scripts          importadores e automações locais
supabase         schema, policies, storage e seed SQL
data/raw         planilhas brutas locais ignoradas pelo Git
public/logos     logos e escudo oficial
public/team      fotos reais dos jogadores, hero e bastidores
public/players   fotos individuais dos jogadores ou fallback
public/photos    galeria por geral, jogos, bastidores, titulos e treino
public/sponsors  marcas e ativações futuras
```

## Assets

As imagens reais do Manochaco ficam em `public/`. O guia completo de nomes,
pastas, formatos e substituição está em `docs/ASSETS.md`.

Quando uma foto individual ou imagem configurada ainda não existe, o componente
`SmartImage` renderiza um fallback preto e dourado sem quebrar o layout.

As fotos vindas do Google Drive devem ser baixadas e salvas em `public/`; o site
público não depende de hotlink do Drive. Rode `npm run audit:images` para
identificar caminhos ausentes, imagens remotas e vínculos quebrados.

## Escopo atual

- Site público com fallback local e camada preparada para Supabase.
- Entrada e cadastro públicos em `/entrar` e `/cadastro` com Supabase Auth.
- Área privada `/conta` para torcedores, jogadores, candidatos e parceiros.
- Solicitações de jogador, candidato e parceiro revisadas em `/admin/cadastros`.
- Contas administrativas concedidas somente pelo clube em `admin_profiles`.
- Planilha usada como fonte inicial de migração, não como banco permanente.
- Supabase definido como fonte oficial de jogadores, jogos,
  estatísticas, fotos, álbuns, campeonatos, temporadas e tags.
- Dados locais em TypeScript mantidos como fallback temporário de
  desenvolvimento/preview.
- Login unificado com Supabase Auth em `/entrar`; `/admin/login` é mantida como rota de compatibilidade.
- Rotas `/admin/*` protegidas por `src/proxy.ts` e checagens server-side.
- Dashboard admin com resumo de jogadores, jogos, fotos, álbuns e revisão IA.
- CRUD MVP de jogadores, jogos, campeonatos, temporadas, álbuns e fotos.
- Upload de fotos preparado via bucket `photos` do Supabase Storage.
- Marcação manual de jogadores em fotos com tags confirmadas.
- Revisão de sugestões de IA com confirmação, troca ou descarte.
- Reconhecimento facial modular com provider mock e face-api.js open source, embeddings privados, consentimento e revisão humana obrigatória.
- Financeiro disponível apenas como rota protegida placeholder.
- Filtros públicos por campeonato, temporada, resultado, adversário e status do jogador.
- Páginas de jogadores e jogos por slug.
- Galeria com filtros por categoria, campeonato e temporada.
- Álbuns e páginas individuais de foto por slug.
- Marcação de jogadores em fotos com tags confirmadas.
- Sugestões de reconhecimento facial e respostas técnicas restritas ao admin.
- Assets reais organizados em `public/`.
- Fallback visual para imagens ausentes.
- Cliente Supabase, schema SQL, RLS, Storage e seed inicial preparados.
- Roles administrativas previstas: super admin, admin esportivo, admin
  financeiro, editor de fotos e viewer.
- Área financeira privada prevista em banco e documentação, sem exposição no
  site público.
- Importador da planilha gera dados iniciais de jogadores, jogos, estatísticas
  e rankings para migração/revisão.
- Estatísticas recalculadas a partir dos jogos filtrados e rankings derivados
  dos jogadores históricos ou das abas por campeonato/temporada.

Ainda não há financeiro completo, processamento assíncrono em background, gestão completa de usuários admin ou relatórios avançados nesta fase. O fluxo pode operar em modo mock ou com face-api.js sem AWS; o provider real depende dos modelos versionados e do Supabase configurado.

## Documentação do produto

- `PROJECT.md`
- `ROADMAP.md`
- `docs/ASSETS.md`
- `docs/SPREADSHEET_IMPORT.md`
- `docs/STATS_SYSTEM.md`
- `docs/ADMIN_PHOTO_WORKFLOW.md`
- `docs/FACE_RECOGNITION_ARCHITECTURE.md`
- `docs/FACE_RECOGNITION_SETUP.md`
- `docs/INSIGHTFACE_FUTURE.md`
- `docs/AUTH_ADMIN.md`
- `docs/PUBLIC_ACCOUNTS.md`
- `docs/SUPABASE_STORAGE.md`
- `docs/ADMIN_MVP.md`
- `docs/DEPLOYMENT.md`
- `docs/SECURITY_CHECKLIST.md`
- `supabase/README.md`
- `DATABASE.md`
- `SPREADSHEET_SOURCE.md`
- `ADMIN_PORTAL.md`
- `PHOTO_TAGGING.md`
- `LGPD.md`
- `CHANGELOG.md`
