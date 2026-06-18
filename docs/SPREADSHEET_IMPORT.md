# Importação da planilha Manochaco

Este documento explica a ponte local entre a planilha do Manochaco e os dados
TypeScript usados pelo site público.

## Objetivo

Transformar dados esportivos públicos da planilha em arquivos estruturados em
`src/data/generated/`, mantendo o site estático e sem Supabase nesta fase.

O importador gera:

- jogadores;
- jogos históricos;
- estatísticas gerais;
- rankings;
- competições;
- temporadas.

Dados financeiros não são publicados no site.

Ao gerar jogadores, o importador tenta encontrar a foto local correspondente em
`public/players/{slug}.png`, `.jpg`, `.jpeg` ou `.webp`. Se nenhuma existir, o
caminho padrão fica preparado e o site mostra o fallback visual.

## Onde colocar a planilha

Use a pasta:

```text
data/raw/
```

Nome recomendado:

```text
data/raw/planilha-manochaco.xlsx
```

Arquivos reais em `data/raw/` são ignorados pelo Git. Isso evita subir dados
financeiros ou informações privadas sem querer.

Também é possível rodar com caminho manual:

```bash
npm run import:spreadsheet -- --input="/caminho/Planilha Manochaco.xlsx"
```

## Como rodar

```bash
npm install
npm run import:spreadsheet
npm run audit:images
npm run typecheck
npm run dev
```

Se `data/raw/planilha-manochaco.xlsx` não existir, o script tenta encontrar a
planilha mais recente na pasta `Downloads` com o padrão de nome do Manochaco.

## Abas usadas no site público

O script considera esportivas:

- `Estatística Histórica`
- `Jogos Histórico`
- `Estatística Geral 2025`
- `Liga 7 2025`
- `Chuteira 2025`
- `AMSTEL1 Estatística 2025`
- `LIGA 7 Estatística 2023`
- `LIGA 7 Estatística 2024`
- `ESTRELATO Estatística 2024`
- `Estatística 2024`

Nesta primeira importação, os perfis de jogador vêm da aba `Estatística
Histórica`, e os jogos vêm da aba `Jogos Histórico`.

## Abas ignoradas no site público

Abas financeiras ou de pagamento são ignoradas:

- `Financeiro 2023`
- `Financeiro 2024`
- `Financeiro 2025`
- `MoneyChacos`
- `Página28`
- `Amstel 1 2026`
- `Chuteira 1 2026`
- `Amstel 2S 2025`

Mesmo quando uma aba esportiva contém coluna de pagamento, esse campo não é
exportado para `src/data/generated/`.

## Arquivos gerados

```text
src/data/generated/
├── players.generated.ts
├── matches.generated.ts
├── player-stats.generated.ts
├── stats.generated.ts
├── rankings.generated.ts
├── competitions.generated.ts
└── seasons.generated.ts
```

`src/data/index.ts` centraliza a origem dos dados usados pelo site. As páginas
consomem essa camada em vez de importar cada arquivo diretamente.
`player-stats.generated.ts` alimenta os rankings filtrados por campeonato e
temporada.

## Validações do script

O script registra avisos para:

- jogadores sem nome;
- jogadores com slug duplicado;
- partidas sem data;
- partidas sem adversário;
- partidas sem placar válido;
- rankings divergentes dos valores esperados;
- estatísticas totais divergentes;
- abas financeiras ignoradas.

Avisos não interrompem a importação quando o dado pode ser revisado
manualmente.

## Nomes duplicados e slugs

Os slugs são gerados a partir do apelido entre parênteses. Alguns apelidos têm
mapa manual para preservar URLs importantes:

- `TORRES` vira `torres`
- `DUDU` vira `dudu`
- `ED GOU` vira `ed-gou`
- `CASANOVA` vira `raphael-casanova`
- `DED` vira `andre-gouveia`

Se um slug duplicado aparecer, o script registra aviso e ignora o duplicado.

## Cuidados com dados financeiros

- Nunca versionar a planilha real.
- Nunca exportar valor pago, mensalidade, dívida ou custo para o site público.
- Valores financeiros futuros devem ficar em tabelas admin-only.
- Valores monetários devem ser salvos em centavos quando houver banco.
- A planilha original não deve ser servida por rota pública.

## Limitações conhecidas

A aba `Jogos Histórico` não possui coluna explícita de campeonato ou local.
Por isso, partidas importadas usam fallback visual e marcam local/competição
como dados preparados para revisão manual futura.
