# Fonte de dados inicial - Planilha Manochaco

Arquivo base informado:

`Planilha Manochaco - Treinos, Time e Financeiro-5.xlsx`

A planilha é fonte inicial de migração. Ela serve para popular o Supabase com o
histórico esportivo do clube e, futuramente, ajudar a estruturar dados
financeiros privados. Depois da primeira carga, o banco Supabase e o painel
administrativo passam a ser a fonte oficial.

A planilha não deve ser tratada como banco permanente. Novos jogadores, jogos,
estatísticas, fotos, campeonatos, temporadas, patrocínios e dados financeiros
devem ser cadastrados, editados e removidos pelo painel administrativo.

## Classificação das abas

### Estatísticas públicas

Estas abas podem alimentar a migração esportiva após revisão e normalização:

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

- jogador;
- apelido entre parênteses;
- posição;
- número de camisa;
- tamanho de uniforme;
- presença em jogos;
- percentual de presença;
- data de ingresso;
- gols;
- gols por jogo;
- assistências;
- participação em gols por jogo;
- cartões amarelos;
- cartões vermelhos;
- suspensões;
- clean-sheet;
- ranking;
- média/overall.

Algumas abas esportivas também possuem coluna `PAGAMENTO`. Esse campo não deve
aparecer no site público. Quando for migrado, deve ir para o domínio financeiro
privado com RLS e permissões específicas.

### Jogos públicos

- `Jogos Histórico`

Campos identificados:

- data;
- time da casa;
- time fora;
- gols feitos;
- gols sofridos;
- resultado;
- classificação/fase.

### Financeiro privado

Estas abas devem ficar somente em área administrativa com login:

- `Financeiro 2023`
- `Financeiro 2024`
- `Financeiro 2025`
- `MoneyChacos`
- `Página28`
- `Amstel 1 2026`
- `Chuteira 1 2026`

Campos financeiros:

- nome;
- valor pago;
- quanto falta;
- cobranças mensais;
- totais anuais;
- custos por campeonato;
- receitas, despesas e caixa;
- cálculos de responsabilidade financeira.

Valores monetários devem ser convertidos e armazenados em centavos.

## Regras de importação

- A planilha original nunca deve ser servida publicamente.
- A importação inicial deve gerar dados revisáveis antes de popular o Supabase.
- O seed para Supabase deve ignorar dados financeiros no site público.
- Dados criados ou corrigidos no painel não devem ser sobrescritos
  silenciosamente.
- Reimportações futuras devem ter dry-run, logs, checksum, resumo de diferenças
  e confirmação explícita.
- Conflitos entre planilha e painel devem ir para revisão administrativa.
- Campos financeiros exigem autenticação e papel autorizado.
- Fórmulas da planilha devem virar valores importados ou regras auditáveis no backend.

## Modelo de publicação pública

O site público deve consumir somente dados permitidos:

- jogadores;
- competições;
- temporadas;
- jogos;
- estatísticas esportivas;
- títulos;
- fotos;
- álbuns;
- marcações confirmadas.

Não publicar mensalidades, dívidas, pagamentos individuais, dados bancários,
despesas internas, caixa do clube ou qualquer informação financeira sensível.

## Papel do painel administrativo

O painel futuro será o caminho principal para:

- cadastrar e editar jogadores;
- lançar jogos, placares e estatísticas por partida;
- atualizar campeonatos e temporadas;
- enviar fotos e criar álbuns;
- marcar jogadores em fotos;
- revisar sugestões de IA;
- gerenciar financeiro privado;
- registrar auditoria.

O script de importação continua útil para migração inicial e eventuais cargas
controladas, mas não substitui o painel.
