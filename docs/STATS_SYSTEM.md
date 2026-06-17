# Sistema de estatísticas

Esta fase mantém tudo local. O site usa dados gerados da planilha em
`src/data/generated/` e fallback TypeScript quando necessário.

## Origem dos dados

- `players.generated.ts`: jogadores consolidados da aba `Estatística Histórica`.
- `matches.generated.ts`: jogos importados da aba `Jogos Histórico`.
- `player-stats.generated.ts`: linhas de estatística por aba esportiva, como
  Liga7, Copa Amstel e Chuteira.
- `competitions.generated.ts`: campeonatos usados nos filtros.
- `seasons.generated.ts`: temporadas encontradas na planilha.

Abas financeiras são ignoradas no site público.

## Filtros

Os filtros públicos usam query string:

```text
/estatisticas?competition=liga7-playball&season=2025&ranking=goals
/jogos?competition=chuteira&season=2025&result=win&q=Panelinha
/elenco?status=active&sort=matches
```

`src/lib/filters.ts` centraliza:

- filtro de jogos por campeonato;
- filtro de jogos por temporada;
- filtro de jogos por resultado;
- busca simples por adversário;
- filtro de jogadores por status;
- ordenação de elenco por nome, jogos, gols ou assistências.

## Cálculos

`src/lib/stats.ts` calcula:

- jogos;
- vitórias;
- empates;
- derrotas;
- gols feitos;
- gols sofridos;
- saldo de gols;
- aproveitamento;
- média de gols feitos;
- média de gols sofridos.

Os cards de `/estatisticas` são recalculados a partir dos jogos filtrados.
Quando não há partidas suficientes para o recorte, a página mostra um estado
vazio elegante.

## Rankings

Rankings disponíveis:

- artilharia;
- assistências;
- presença;
- participação em gols, calculada como gols + assistências;
- cartões amarelos;
- cartões vermelhos.

Quando há filtro por campeonato ou temporada, os rankings usam
`player-stats.generated.ts`. Sem filtro contextual, os rankings usam a base
histórica consolidada de jogadores.

## Limitações atuais

- A relação jogador-partida ainda não vem normalizada da planilha.
- Algumas partidas ainda têm competição ou local marcados como `A revisar`.
- Os filtros por campeonato dependem da inferência feita no importador.
- Fotos por jogo e por jogador continuam usando relações mockadas.

## Evolução futura

Com Supabase, estes cálculos devem migrar para consultas e views públicas sobre:

- `matches`;
- `players`;
- `player_competition_stats`;
- `player_all_time_stats`;
- `competitions`;
- `seasons`.

Dados financeiros continuarão em tabelas admin-only, protegidas por autenticação
e RLS, sem retorno em rotas públicas.
