# Consistência das estatísticas

## Princípio

A base pública é a soma das estatísticas por jogador, campeonato e temporada.
A aba `Estatística Histórica` é uma referência de conferência, não uma fonte
usada para preencher ou substituir os totais calculados.

Esse desenho permite filtrar a informação e, ao mesmo tempo, localizar a aba
responsável quando a soma não coincide com o histórico.

## Abas somadas

As seis fontes granulares atuais são:

| Aba | Campeonato | Temporada |
| --- | --- | --- |
| `LIGA 7 Estatística 2023` | Liga7 Playball | 2023 |
| `ESTRELATO Estatística 2024` | Estrelato | 2024 |
| `LIGA 7 Estatística 2024` | Liga7 Playball | 2024 |
| `Liga 7 2025` | Liga7 Playball | 2025 |
| `AMSTEL1 Estatística 2025` | Copa Amstel | 2025 |
| `Chuteira 2025` | Chuteira | 2025 |

`Estatística 2024` e `Estatística Geral 2025` são consolidações anuais usadas
para investigação. Elas não são somadas, pois duplicariam as abas específicas.

## Validação

```bash
npm run import:spreadsheet
npm run validate:stats
```

O relatório compara jogos, gols, assistências, cartões amarelos, cartões
vermelhos, clean sheets e gols sofridos por jogador. A saída inclui abas usadas,
aliases inconsistentes, chaves duplicadas e diferenças campo a campo. O JSON
fica em `data/reports/stats-consistency-report.json`.

Para exigir igualdade absoluta em CI depois da reconciliação:

```bash
npm run validate:stats -- --strict
```

## Resultado da primeira auditoria

- 43 jogadores analisados.
- 26 jogadores sem divergência.
- 17 jogadores com pelo menos uma divergência.
- 129 linhas granulares importadas.
- Um alias inconsistente conhecido: `João Grando` aparece como `JOHN` e
  `GRANDO`; ambos resolvem para o slug `john`.
- `ROD` aparece nas fontes granulares, mas não na aba histórica.

Os rankings calculados preservam a liderança esperada, mas algumas contagens
individuais não coincidem com o histórico. Por exemplo, TORRES soma 50 gols nas
abas granulares e 52 no histórico. Esses casos não foram corrigidos
artificialmente; permanecem no diagnóstico para revisão da fonte.

## Como investigar uma diferença

1. Abra `/admin/diagnostico/dados` e localize o jogador e o campo.
2. Consulte `source_sheet` nas linhas de `player_competition_stats`.
3. Confirme o nome pelo mapa `src/data/playerAliases.ts` e pela tabela
   `player_aliases`.
4. Verifique se a aba está classificada corretamente em
   `scripts/config/sheet-mapping.ts`.
5. Corrija a planilha ou o mapeamento, reimporte e gere novamente o relatório.
6. Use `npm run seed:stats` somente após revisar o diff.

Não altere o histórico para esconder uma diferença e não adicione lançamentos
fictícios para forçar igualdade.

## Novo campeonato ou temporada

Adicione uma entrada explícita em `scripts/config/sheet-mapping.ts` com nome da
aba, slug do campeonato, slug da temporada e tipo `competition_stats`. Inclua a
competição nos dados oficiais se ela ainda não existir, rode o importador e
revise o relatório antes do seed.

## Edição futura no admin

O painel hoje exibe os dados granulares em modo leitura. A edição futura deve
salvar responsável, data, origem, valor anterior, valor novo e justificativa em
auditoria. O Supabase continuará sendo a fonte oficial; a planilha não será
necessária para manter o site depois da migração.
