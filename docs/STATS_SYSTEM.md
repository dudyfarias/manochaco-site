# Sistema de estatísticas

O Supabase é a fonte oficial das estatísticas exibidas em produção. A planilha
serve para migração e conferência; os arquivos em `src/data/generated/` são
artefatos de importação e fallback de desenvolvimento.

## Modelo de dados

`player_competition_stats` guarda uma linha por jogador, campeonato, temporada
e aba de origem. Cada linha pode conter jogos, gols, assistências, cartões,
clean sheets e gols sofridos. A restrição única nesses quatro identificadores
impede duplicação em reimportações.

`player_historical_stats` é privada e guarda a fotografia da aba
`Estatística Histórica`. Ela existe somente para comparação administrativa.

`player_aliases` é privada e relaciona variações de nome ou apelido ao UUID do
jogador. O mapa inicial fica em `src/data/playerAliases.ts`.

`player_match_stats` continua armazenando lançamentos por partida feitos pelo
admin. A evolução prevista é recalcular ou reconciliar os agregados a partir
desses lançamentos, mantendo origem e auditoria.

## Origem dos dados

- `player-stats.generated.ts`: 129 linhas das seis abas granulares.
- `historical-player-stats.generated.ts`: snapshot para validação.
- `season-validation-stats.generated.ts`: consolidações anuais que não entram
  na soma pública.
- `stats-consistency.generated.ts`: resumo do último relatório.
- `players.generated.ts`: jogadores com totais calculados da base granular.
- `rankings.generated.ts`: rankings calculados da mesma base.

O mapeamento oficial das abas está em `scripts/config/sheet-mapping.ts`.
Planilhas financeiras são ignoradas pelas páginas públicas e pelo seed de
estatísticas.

## Filtros públicos

Os filtros usam query string e são compartilháveis:

```text
/estatisticas?competition=liga7-playball&season=2024&ranking=goals
/jogos?competition=chuteira&season=2025&result=win&q=Panelinha
/jogadores?status=active&sort=matches
```

`getPlayerStatLines()` consulta `player_competition_stats` no Supabase. A página
`/estatisticas` filtra essas linhas por `competitionSlug` e `seasonSlug` antes
de gerar artilharia, assistências, presença, participações e cartões. Em
“Todos”, soma todas as linhas granulares, sem recorrer ao snapshot histórico.

## Perfil do jogador

`/jogadores/[slug]` resolve primeiro o UUID do jogador, busca suas linhas
granulares e exibe uma tabela por campeonato e temporada. O total apresentado
é calculado da soma das linhas mostradas. O admin do jogador exibe a mesma base,
incluindo aba de origem e última atualização.

## Estatísticas da equipe

Os cards de jogos, vitórias, empates, derrotas, gols feitos e sofridos são
calculados de `matches`. A planilha possui 36 partidas no histórico, enquanto
algumas abas individuais registram mais presenças. Essa diferença entre
partidas e agregados de atletas é tratada como diagnóstico de fonte, não como
um ajuste automático.

## Consistência

Rode:

```bash
npm run validate:stats
```

O comando compara cada campo agregado com a aba histórica e atualiza
`data/reports/stats-consistency-report.json`. Divergências permanecem visíveis
em `/admin/diagnostico/dados`. Use `npm run validate:stats -- --strict` somente
quando a planilha tiver sido reconciliada e qualquer diferença precisar falhar
o processo.

Consulte `docs/STATS_CONSISTENCY.md` para o procedimento completo.

## Limitações atuais

- Nem toda estatística agregada tem uma linha correspondente por partida.
- A planilha contém divergências reais entre as abas granulares e o histórico.
- A edição de `player_competition_stats` no admin ainda é somente leitura.
- Uma reimportação deve usar `seed:stats` e passar por revisão antes de produção.

Dados financeiros continuam privados e nunca participam dessas consultas.
