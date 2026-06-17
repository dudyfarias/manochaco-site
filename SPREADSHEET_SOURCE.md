# Fonte de dados - Planilha Manochaco

Arquivo base informado:

`Planilha Manochaco - Treinos, Time e Financeiro-5.xlsx`

A planilha será a fonte inicial para importar dados históricos do Clube Atlético
Manochaco. Ela mistura estatísticas esportivas públicas e informações
financeiras privadas; por isso, a importação futura deve separar os domínios
antes de publicar qualquer dado.

Depois da primeira carga, novos dados também serão criados pelo portal
administrativo. A planilha não deve ser o único caminho de manutenção.

## Classificação das abas

### Estatísticas públicas

Estas abas podem alimentar páginas públicas após revisão e normalização:

- `Estatística Histórica`
- `Estatística Geral 2025`
- `Estatística 2024`
- `LIGA 7 Estatística 2023`
- `LIGA 7 Estatística 2024`
- `Liga 7 2025`
- `ESTRELATO Estatística 2024`
- `AMSTEL1 Estatística 2025`
- `Chuteira 2025`
- `Amstel 2S 2025`

Campos identificados nas abas de estatísticas:

- jogador
- apelido entre parênteses
- posição
- número de camisa
- tamanho de uniforme
- presença em jogos
- percentual de presença
- data de ingresso
- gols
- gols por jogo
- assistências
- participação em gols por jogo
- cartões amarelos
- cartões vermelhos
- suspensões
- clean-sheet
- ranking
- média/overall

Observação: algumas abas esportivas também possuem coluna `PAGAMENTO`. Esse
campo deve ser extraído para o domínio financeiro admin-only ou ignorado na
publicação pública; ele não deve aparecer nas APIs ou páginas abertas.

### Jogos públicos

- `Jogos Histórico`

Campos identificados:

- data
- time da casa
- time fora
- gols feitos
- gols sofridos
- resultado
- classificação/fase

### Financeiro privado

Estas abas devem ficar somente em área administrativa com login:

- `Financeiro 2023`
- `Financeiro 2024`
- `Financeiro 2025`
- `MoneyChacos`
- `Página28`
- `Amstel 1 2026`
- `Chuteira 1 2026`

Campos identificados nas abas financeiras:

- nome
- valor pago
- quanto falta
- cobranças mensais
- totais anuais
- custos por campeonato
- cálculos de responsabilidade financeira

Valores monetários devem ser convertidos e armazenados em centavos.

## Regras de importação futura

- A planilha original não deve ser servida publicamente.
- Importações devem gerar um `import_batch` com data, usuário admin e checksum.
- Estatísticas públicas devem passar por normalização de nome/apelido.
- Campos financeiros nunca devem alimentar páginas públicas.
- Colunas financeiras dentro de abas esportivas também devem ser bloqueadas no
  site público.
- Qualquer dado financeiro deve exigir autenticação e papel de admin.
- Valores monetários devem usar inteiros em centavos.
- Fórmulas da planilha devem ser convertidas em valores importados ou regras de
  cálculo auditáveis no backend.
- Dados criados ou corrigidos no portal não devem ser sobrescritos
  silenciosamente por uma nova importação.
- Conflitos entre planilha e portal devem ir para revisão administrativa.

## Modelo de publicação

O site público deve consumir apenas:

- jogadores
- competições
- temporadas
- jogos
- estatísticas por competição
- estatísticas históricas agregadas
- títulos
- fotos e marcações aprovadas

## Uso na versão estática atual

Nesta versão, `src/data/players.ts` usa a aba `Estatística Histórica` como
referência para os perfis públicos de jogadores. Foram considerados apenas os
campos esportivos: jogador, apelido, posição, número de camisa, data de
ingresso, presença, gols, assistências e status `Saiu do time`.

O campo `Saiu do time` foi convertido para `status`:

- `Não`: atleta ativo.
- `Sim`: jogador histórico/ex-jogador.

As informações financeiras da planilha continuam fora do site público.

O painel admin poderá consumir:

- importações da planilha
- cadastros manuais feitos no portal
- pagamentos
- débitos
- custos por campeonato
- resumo financeiro
- logs de importação e auditoria
