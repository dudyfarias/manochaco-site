# Importação da planilha Manochaco

Este documento explica o uso correto da planilha do Manochaco no projeto.

## Objetivo

A planilha é uma fonte inicial de migração para popular o Supabase com dados
históricos do clube. Ela não é banco permanente e não deve ser necessária para
atualizar o site depois que o painel administrativo estiver ativo.

O importador atual transforma dados esportivos públicos em arquivos
estruturados em `src/data/generated/` para revisão, preview e seed inicial:

- jogadores;
- jogos históricos;
- estatísticas gerais;
- rankings;
- competições;
- temporadas.

A aba histórica é uma referência de conferência. As estatísticas públicas são
montadas das abas por competição e temporada, nunca copiadas do consolidado
histórico para completar diferenças silenciosamente.

Depois da migração, administradores devem manter os dados pelo painel:
jogadores, jogos, estatísticas, fotos, álbuns, campeonatos, temporadas,
patrocínios e financeiro privado.

## Onde colocar a planilha

Use a pasta:

```text
data/raw/
```

Nome recomendado:

```text
data/raw/planilha-manochaco.xlsx
```

Arquivos reais em `data/raw/` são ignorados pelo Git para evitar subir dados
financeiros ou informações privadas.

Também é possível rodar com caminho manual:

```bash
npm run import:spreadsheet -- --input="/caminho/Planilha Manochaco.xlsx"
```

## Como rodar a importação local

```bash
npm install
npm run import:spreadsheet
npm run audit:images
npm run typecheck
npm run dev
```

Se `data/raw/planilha-manochaco.xlsx` não existir, o script tenta encontrar a
planilha mais recente na pasta `Downloads` com o padrão de nome do Manochaco.

## Como popular o Supabase

Depois de revisar os dados gerados e configurar `.env.local`, rode:

```bash
npm run seed:stats
npm run validate:stats
```

Esse comando usa `SUPABASE_SERVICE_ROLE_KEY`, então deve rodar somente em
ambiente local ou server-side confiável. Ele não deve ir para Client Components.

`seed:stats` é o modo seguro para reimportação: não altera fotos, álbuns ou
jogos já mantidos pelo admin. `seed:supabase` permanece reservado para a carga
inicial completa e revisada.

## Mapeamento das abas esportivas

O mapeamento fica em `scripts/config/sheet-mapping.ts`. As fontes granulares
importadas para `player_competition_stats` são:

| Aba | Campeonato | Temporada |
| --- | --- | --- |
| `LIGA 7 Estatística 2023` | Liga7 Playball | 2023 |
| `ESTRELATO Estatística 2024` | Estrelato | 2024 |
| `LIGA 7 Estatística 2024` | Liga7 Playball | 2024 |
| `Liga 7 2025` | Liga7 Playball | 2025 |
| `AMSTEL1 Estatística 2025` | Copa Amstel | 2025 |
| `Chuteira 2025` | Chuteira | 2025 |

`Estatística Histórica` é validação histórica; `Estatística 2024` e
`Estatística Geral 2025` são consolidações anuais de validação. Somá-las às
fontes granulares duplicaria dados. `Jogos Histórico` alimenta partidas, não os
agregados individuais por competição.

## Abas privadas ou bloqueadas no site público

Abas financeiras ou de pagamento não devem alimentar páginas públicas:

- `Financeiro 2023`
- `Financeiro 2024`
- `Financeiro 2025`
- `MoneyChacos`
- `Página28`
- `Amstel 1 2026`
- `Chuteira 1 2026`
- `Amstel 2S 2025`

Mesmo quando uma aba esportiva contém coluna de pagamento, esse campo não é
exportado para o site público. No futuro, dados financeiros devem ir para
tabelas privadas com RLS e papel `finance_admin` ou `super_admin`.

## Arquivos gerados

```text
src/data/generated/
├── players.generated.ts
├── matches.generated.ts
├── player-stats.generated.ts
├── historical-player-stats.generated.ts
├── season-validation-stats.generated.ts
├── stats-consistency.generated.ts
├── stats.generated.ts
├── rankings.generated.ts
├── competitions.generated.ts
└── seasons.generated.ts
```

O relatório detalhado também é salvo em
`data/reports/stats-consistency-report.json`.

Esses arquivos alimentam fallback local, preview e seed inicial. A fonte oficial
após a migração deve ser o Supabase.

## Validações do script

O script registra avisos para:

- jogadores sem nome;
- jogadores com slug duplicado;
- partidas sem data;
- partidas sem adversário;
- partidas sem placar válido;
- rankings divergentes dos valores esperados;
- estatísticas totais divergentes;
- aliases ou apelidos inconsistentes entre abas;
- diferenças campo a campo entre a soma granular e o histórico;
- abas financeiras ignoradas.

Avisos não interrompem a importação quando o dado pode ser revisado
manualmente.

## Nomes duplicados e slugs

Os slugs são resolvidos por `src/data/playerAliases.ts`. O arquivo reúne nome,
apelido e variações conhecidas sob um único slug canônico. Exemplos:

- `TORRES` vira `torres`
- `DUDU` vira `dudu`
- `ED GOU` vira `ed-gou`
- `CASANOVA` vira `raphael-casanova`
- `DED` vira `andre-gouveia`
- `GRANDO` e `JOHN` viram `john`

Aliases também são enviados para a tabela privada `player_aliases`. Duplicatas
ou ambiguidades são registradas no relatório e devem ser corrigidas no mapa,
sem fundir jogadores automaticamente.

## Reimportações futuras

Reimportar planilhas depois do painel administrativo existir exige cuidado:

- rodar primeiro em modo dry-run;
- registrar usuário, data, arquivo e checksum;
- gerar diff antes/depois;
- não sobrescrever edição manual sem confirmação;
- enviar conflitos para fila de revisão administrativa;
- registrar tudo em `audit_logs`.

## Cuidados com dados financeiros

- Nunca versionar a planilha real.
- Nunca exportar mensalidade, dívida, pagamento individual ou custo interno para
  o site público.
- Valores financeiros futuros devem ficar em tabelas privadas.
- Valores monetários devem ser salvos em centavos.
- A planilha original não deve ser servida por rota pública.

## Limitações conhecidas

A aba `Jogos Histórico` não possui coluna explícita de campeonato ou local.
Por isso, partidas importadas usam fallback visual e marcam local/competição
como dados preparados para revisão manual futura no painel.

A primeira auditoria granular encontrou 26 jogadores sem divergência e 17 com
diferenças em relação ao histórico. Entre os casos há valores realmente
distintos nas abas de origem e um atleta presente apenas nas fontes granulares.
Essas diferenças são preservadas em `docs/STATS_CONSISTENCY.md` e no relatório;
o importador não fabrica lançamentos para forçar igualdade.
