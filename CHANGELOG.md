# Changelog

## 0.6.0 - 2026-06-17

- Criação de `src/types/photos.ts` com tipos de fotos, álbuns, tags, sugestões faciais e referências faciais.
- Reestruturação de `photos`, `albums` e `photoPlayers` para suportar álbum, jogo, campeonato, temporada e status de reconhecimento.
- Criação de `faceSuggestions.ts` e `playerFaceReferences.ts` com dados mockados.
- Criação dos componentes `PhotoCard` e `TaggedPlayersList`.
- Evolução de `/galeria` com filtros funcionais por categoria, campeonato e temporada.
- Criação das rotas `/galeria/[albumSlug]` e `/fotos/[photoSlug]`.
- Ajuste de `/jogadores/[slug]` para exibir apenas fotos com tags confirmadas.
- Ajuste de `/jogos/[slug]` para buscar fotos por partida e linkar álbum completo.
- Criação das rotas mockadas `/admin/fotos` e `/admin/fotos/revisao`, fora do menu público.
- Atualização da navegação pública para manter apenas os itens principais.
- Criação de `docs/ADMIN_PHOTO_WORKFLOW.md` e `docs/FACE_RECOGNITION_ARCHITECTURE.md`.
- Reforço de `PHOTO_TAGGING.md`, `LGPD.md` e `DATABASE.md` para reconhecimento facial com revisão humana.

## 0.5.0 - 2026-06-17

- Criação dos utilitários `src/lib/filters.ts` e `src/lib/stats.ts`.
- Criação do componente `EmptyState` para estados sem dados.
- Geração de `player-stats.generated.ts` com estatísticas por aba esportiva da planilha.
- Evolução de `/estatisticas` com filtros por campeonato, temporada e ranking via query string.
- Evolução de `/jogos` com filtros por campeonato, temporada, resultado e busca por adversário.
- Ajuste de `/elenco` para mostrar por padrão todos os jogadores da aba `Estatística Histórica`.
- Melhoria dos rankings com top 3 destacado, camisa e links para perfil do jogador.
- Melhoria do perfil individual com participação em gols, médias por jogo e posição histórica.
- Melhoria do detalhe da partida com contexto, jogadores relacionados, fotos e estados vazios.
- Criação da página `/campeonatos`.
- Criação da documentação `docs/STATS_SYSTEM.md`.
- Manutenção da regra de não exibir dados financeiros no site público.

## 0.4.0 - 2026-06-17

- Criação do script `scripts/import-manochaco-spreadsheet.ts`.
- Criação do comando `npm run import:spreadsheet`.
- Criação de `data/raw/` para planilhas locais ignoradas pelo Git.
- Criação de `src/data/generated/` com jogadores, jogos, estatísticas, rankings, competições e temporadas gerados pela planilha.
- Criação de `src/data/index.ts` como camada central de origem dos dados.
- Integração inicial dos dados gerados nas páginas Home, Elenco, Jogador, Estatísticas, Jogos, Detalhe de partida e Títulos.
- Geração de 42 jogadores a partir da aba `Estatística Histórica`.
- Geração de 36 jogos a partir da aba `Jogos Histórico`.
- Geração de rankings reais de artilharia, assistências, presença, cartões e participação em gols.
- Exclusão das abas financeiras do site público.
- Criação da documentação `docs/SPREADSHEET_IMPORT.md`.

## 0.3.1 - 2026-06-17

- Correção da base mockada de jogadores usando a aba `Estatística Histórica` da planilha Manochaco.
- Ampliação de `players.ts` para 42 perfis históricos, com 31 atletas ativos e 11 ex-jogadores.
- Atualização de nomes, apelidos, posições, camisas, jogos, gols e assistências conforme a planilha.
- Inclusão do status do jogador como ativo ou histórico.
- Ajuste da página `/elenco` para separar elenco ativo por posição e ex-jogadores em seção própria.
- Ajuste do perfil individual para remover o card de títulos por jogador, dado que essa informação não existe individualizada na planilha.

## 0.3.0 - 2026-06-17

- Criação da estrutura de assets reais em `public/logos`, `public/team`, `public/players`, `public/photos` e `public/sponsors`.
- Download e organização inicial de imagens reais da pasta pública do Google Drive do Manochaco.
- Substituição do hero da Home, História, Patrocínio, partidas e galeria por imagens reais quando disponíveis.
- Criação do componente `SmartImage` com fallback preto e dourado para imagens ausentes.
- Atualização dos dados mockados de jogadores para apontar para fotos reais esperadas em `public/players`.
- Reorganização de `photos.ts` e `albums.ts` com categorias, capas e álbuns iniciais por elenco, bastidores, jogos, títulos e competições.
- Melhoria da página `/galeria` com filtros visuais preparados, cards de álbum e grid de fotos reais.
- Preparação da galeria por jogador mantendo a relação `photoPlayers`.
- Criação da documentação `docs/ASSETS.md`.

## 0.2.0 - 2026-06-17

- Refinamento visual inicial da Home com hero mais forte, cards históricos minimalistas, rankings resumidos, galeria recente e chamada de patrocínio.
- Evolução da página individual de jogador com topo de atleta, foto em destaque, cards de estatísticas, resumo de ranking, fotos relacionadas e jogos ligados ao atleta.
- Melhoria da página de elenco com grid mais limpo, atalhos por posição e estrutura preparada para filtros futuros.
- Melhoria da página de estatísticas com cards gerais, recortes visuais por competição e rankings separados.
- Criação da página de comissão técnica em `/comissao-tecnica`.
- Cadastro de Raphael Casanova como técnico atual e André Gouveia como ex-técnico.
- Inclusão de Raphael Casanova e André Gouveia também como jogadores, com perfis individuais, fotos e jogos relacionados mockados.
- Ligação entre registros da comissão técnica e perfis de jogador por `playerSlug`.
- Revisão visual de componentes reutilizáveis como Header, Footer, HeroSection, StatCard, PlayerCard, MatchCard, RankingTable, PhotoGrid, SectionTitle e ButtonLink.

## 0.1.0 - 2026-06-17

- Criação do projeto Next.js com TypeScript, Tailwind CSS e App Router.
- Implementação das páginas principais do portal.
- Criação de componentes reutilizáveis.
- Adição de dados mockados em `src/data`.
- Implementação de rotas dinâmicas para jogadores e jogos.
- Simulação de marcação de jogadores em fotos com `photoPlayers`.
- Inclusão do logo oficial do Clube Atlético Manochaco.
- Geração de placeholders visuais para hero, jogadores, partidas e galeria.
- Documentação inicial de projeto, roadmap, banco futuro, marcação de fotos e LGPD.
- Documentação da planilha Manochaco como fonte futura de estatísticas, jogos e financeiro admin-only.
- Documentação do modelo híbrido: importação inicial da planilha e manutenção posterior pelo portal administrativo.
