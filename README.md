# Clube Atlético Manochaco - Site Oficial

Portal oficial estático do Clube Atlético Manochaco, desenvolvido com Next.js,
TypeScript, Tailwind CSS e App Router.

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
npm run audit:images # audita imagens locais e vínculos de fotos
npm run typecheck  # valida TypeScript
npm run lint       # valida ESLint
```

## Estrutura

```text
src/app          rotas App Router
src/components   componentes reutilizáveis
src/data         dados locais e camada central de origem
src/data/generated dados gerados pela planilha
src/lib          helpers de formatação, filtros, fotos e cálculo estatístico
src/types        contratos TypeScript
scripts          importadores e automações locais
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

- Site estático.
- Dados locais em TypeScript com importação da planilha para `src/data/generated`.
- Filtros públicos por campeonato, temporada, resultado, adversário e status do jogador.
- Páginas de jogadores e jogos por slug.
- Galeria com filtros por categoria, campeonato e temporada.
- Álbuns e páginas individuais de foto por slug.
- Marcação de jogadores em fotos com tags confirmadas.
- Sugestões mockadas de reconhecimento facial restritas ao mock admin.
- Assets reais organizados em `public/`.
- Fallback visual para imagens ausentes.
- Arquitetura preparada para Supabase, painel administrativo e upload futuro.
- Planilha Manochaco integrada como fonte local de jogadores, jogos,
  estatísticas e rankings públicos.
- Estatísticas recalculadas a partir dos jogos filtrados e rankings derivados
  dos jogadores históricos ou das abas por campeonato/temporada.

Não há Supabase, autenticação, upload real ou reconhecimento facial em produção
nesta fase.

## Documentação do produto

- `PROJECT.md`
- `ROADMAP.md`
- `docs/ASSETS.md`
- `docs/SPREADSHEET_IMPORT.md`
- `docs/STATS_SYSTEM.md`
- `docs/ADMIN_PHOTO_WORKFLOW.md`
- `docs/FACE_RECOGNITION_ARCHITECTURE.md`
- `DATABASE.md`
- `SPREADSHEET_SOURCE.md`
- `ADMIN_PORTAL.md`
- `PHOTO_TAGGING.md`
- `LGPD.md`
- `CHANGELOG.md`
