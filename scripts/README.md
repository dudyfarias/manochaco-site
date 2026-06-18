# Importador da planilha Manochaco

Este importador existe para carga inicial, revisão e migração para Supabase. A
planilha não é fonte permanente: depois da migração, o painel administrativo
deve ser usado para criar, editar, atualizar e remover dados.

Script principal:

```bash
npm run import:spreadsheet
```

Por padrão, o script procura:

```text
data/raw/planilha-manochaco.xlsx
```

Também é possível informar um caminho manual:

```bash
npm run import:spreadsheet -- --input="/caminho/Planilha Manochaco.xlsx"
```

Em ambiente local, se o arquivo padrão não existir, o script tenta encontrar a
planilha mais recente com nome `Planilha Manochaco - Treinos, Time e
Financeiro*.xlsx` na pasta `Downloads`.

## O que o script gera

Os arquivos gerados ficam em:

```text
src/data/generated/
```

Arquivos:

- `players.generated.ts`
- `matches.generated.ts`
- `player-stats.generated.ts`
- `stats.generated.ts`
- `rankings.generated.ts`
- `competitions.generated.ts`
- `seasons.generated.ts`

Esses arquivos são usados como fallback local e base para `npm run
seed:supabase`.

## Abas públicas

O script usa apenas abas esportivas, como:

- `Estatística Histórica`
- `Jogos Histórico`
- `Estatística Geral 2025`
- `Liga 7 2025`
- `Chuteira 2025`
- `AMSTEL1 Estatística 2025`
- `LIGA 7 Estatística 2023`
- `LIGA 7 Estatística 2024`

## Abas privadas

Abas financeiras são listadas e ignoradas. Elas não devem aparecer no site
público. No futuro, dados financeiros devem ser importados apenas para tabelas
privadas e com revisão administrativa.

Exemplos:

- `Financeiro 2023`
- `Financeiro 2024`
- `Financeiro 2025`
- `MoneyChacos`
- `Página28`
- abas de pagamento, mensalidade, valor pago ou quanto falta

## Validação

O script registra avisos no console para:

- jogadores sem nome;
- slugs duplicados;
- jogos sem data;
- jogos sem placar;
- divergências nos rankings esperados;
- divergências nos totais esperados;
- abas financeiras ignoradas.

Avisos não quebram a importação quando o dado ainda pode ser revisado
manualmente.

## Imagens dos jogadores

Ao gerar `players.generated.ts`, o importador procura imagens locais por slug em:

```text
public/players/{slug}.png
public/players/{slug}.jpg
public/players/{slug}.jpeg
public/players/{slug}.webp
```

O primeiro arquivo existente é usado em `image` e `profileImage`. Se nenhum
arquivo existir, o caminho fica preparado para futura foto e o site usa o
fallback visual.

Depois da importação, rode:

```bash
npm run audit:images
```

Esse comando ajuda a encontrar fotos ausentes, hotlinks remotos e vínculos
quebrados entre fotos, álbuns, jogos e jogadores.

## Reimportação futura

Quando o painel administrativo estiver em uso, qualquer nova importação deve ter
dry-run, diff, logs e confirmação explícita. O importador não deve sobrescrever
silenciosamente dados editados manualmente no painel.
