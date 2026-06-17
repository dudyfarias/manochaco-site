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
npm run typecheck  # valida TypeScript
npm run lint       # valida ESLint
```

## Estrutura

```text
src/app          rotas App Router
src/components   componentes reutilizáveis
src/data         dados mockados locais
src/lib          helpers de formatação e consulta
src/types        contratos TypeScript
public/logos     escudo oficial
public/team      imagens de hero e jogos
public/players   placeholders de jogadores
public/photos    placeholders da galeria
```

## Escopo da fase 1

- Site estático.
- Dados locais em TypeScript.
- Páginas de jogadores e jogos por slug.
- Galeria com simulação de marcação de jogadores em fotos.
- Arquitetura preparada para Supabase, painel administrativo e upload futuro.
- Planilha Manochaco documentada como fonte futura de importação.

Não há Supabase, autenticação, upload real ou reconhecimento facial nesta fase.

## Documentação do produto

- `PROJECT.md`
- `ROADMAP.md`
- `DATABASE.md`
- `SPREADSHEET_SOURCE.md`
- `ADMIN_PORTAL.md`
- `PHOTO_TAGGING.md`
- `LGPD.md`
- `CHANGELOG.md`
