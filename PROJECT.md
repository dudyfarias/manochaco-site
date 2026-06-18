# Projeto

O site oficial do Clube Atlético Manochaco reúne história, jogadores,
estatísticas, jogos, resultados, fotos, títulos, patrocínio e contato em uma
experiência clean, moderna e premium.

## Identidade

- Nome: Clube Atlético Manochaco
- Apelido: Manochaco
- Cores: preto e dourado
- Mascote: leão dourado
- Fundação: 2014
- Origem: grupo de amigos ligado ao Santa Marcelina

## Objetivo

Criar uma presença digital com aparência de clube profissional para um clube
amador organizado. A primeira fase usa dados mockados, mas já separa contratos,
componentes e dados para facilitar a migração futura.

## Decisões técnicas

- Next.js com App Router.
- TypeScript em modo strict.
- Tailwind CSS para interface responsiva.
- Componentes pequenos e reutilizáveis.
- Dados locais em `src/data`.
- Relações por slug e IDs estáveis.
- Imagens servidas a partir de `public`.
- A planilha Manochaco será a fonte inicial para importação futura de dados.

## Fonte de dados futura

A workbook `Planilha Manochaco - Treinos, Time e Financeiro-5.xlsx` será usada
como base para estatísticas históricas, estatísticas por campeonato, jogos e
financeiro.

O site público só deve exibir dados esportivos revisados:

- estatísticas históricas de jogadores
- estatísticas por competição e temporada
- jogos e resultados
- rankings
- jogadores e uniformes quando fizer sentido publicamente

A parte financeira deve existir apenas no painel administrativo, com login e
permissão de admin.

Depois da importação inicial, o portal administrativo será o caminho principal
para cadastrar novos jogos, estatísticas, fotos, títulos e dados financeiros.
Cada registro deverá preservar sua origem para auditoria.

## Rotas implementadas

- `/`
- `/historia`
- `/jogadores`
- `/jogadores/[slug]`
- `/estatisticas`
- `/jogos`
- `/jogos/[slug]`
- `/galeria`
- `/titulos`
- `/patrocinio`
- `/contato`
