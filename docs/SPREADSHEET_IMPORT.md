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
npm run seed:supabase
```

Esse comando usa `SUPABASE_SERVICE_ROLE_KEY`, então deve rodar somente em
ambiente local ou server-side confiável. Ele não deve ir para Client Components.

## Abas usadas para dados esportivos

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

Na importação atual, perfis de jogador vêm da aba `Estatística Histórica`, e
jogos vêm da aba `Jogos Histórico`.

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
├── stats.generated.ts
├── rankings.generated.ts
├── competitions.generated.ts
└── seasons.generated.ts
```

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
