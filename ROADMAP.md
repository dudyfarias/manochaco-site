# Roadmap

## Fase 1 - Site estático

- Portal institucional em Next.js.
- Dados mockados em TypeScript.
- Páginas principais e rotas dinâmicas.
- Galeria com marcação simulada por `photoPlayers`.
- Página de comissão técnica com técnico atual e histórico de técnicos.
- Relação entre comissão técnica e jogadores para pessoas que tiveram as duas funções.
- Documentação inicial.

## Fase 1.1 - Refinamento visual inicial

- Status: concluída em 2026-06-17.
- Home com hero mais impactante, cards históricos, rankings resumidos, galeria recente e chamada de patrocínio.
- Página de jogador com aparência mais profissional, foto em destaque, estatísticas, ranking, fotos relacionadas e jogos.
- Elenco com grid visual, atalhos por posição e estrutura preparada para filtros.
- Estatísticas com cards gerais, rankings limpos e estrutura preparada para filtros por campeonato e temporada.
- Componentes visuais revisados para manter identidade preta e dourada com menos ruído visual.

## Fase 1.2 - Organização de assets reais

- Status: concluída em 2026-06-17.
- Estrutura de imagens reais criada em `public/`.
- Logos, fotos de elenco, fotos de jogos, bastidores, títulos e sponsors organizados por pasta.
- Primeiras imagens reais baixadas da pasta pública do Google Drive do Manochaco.
- Home, História, Galeria, Jogos e Patrocínio preparadas para usar imagens reais.
- Componente de fallback visual criado para evitar imagens quebradas.
- Galeria estruturada por álbuns, categorias e relação `photoPlayers`.
- Documentação criada em `docs/ASSETS.md`.

## Fase 2 - Banco de dados

- Criar projeto Supabase.
- Modelar tabelas de jogadores, jogos, estatísticas, fotos e álbuns.
- Migrar dados gerados da planilha para seed.
- Adaptar importador local para gerar seed.
- Separar estatísticas públicas de finanças privadas durante a importação.
- Criar camada de repositórios.

## Fase 3 - Painel administrativo

- Autenticação para administradores.
- CRUD de jogadores, partidas, competições e títulos.
- Importação de planilhas de jogos e estatísticas.
- Cadastro manual de novos dados diretamente pelo portal.
- Resolução de conflitos entre dados importados e dados editados no portal.
- Área financeira exclusiva para admins autenticados.
- Gestão de pagamentos, débitos e custos por campeonato sem exposição pública.
- Auditoria de alterações.

## Fase 4 - Importação local da planilha

- Status: concluída em 2026-06-17.
- Script `npm run import:spreadsheet` criado.
- Estrutura `data/raw/` criada para planilhas locais ignoradas pelo Git.
- Estrutura `src/data/generated/` criada para arquivos TypeScript gerados.
- Jogadores importados da aba `Estatística Histórica`.
- Jogos importados da aba `Jogos Histórico`.
- Estatísticas gerais e rankings gerados a partir da planilha.
- Abas financeiras listadas e ignoradas no site público.
- Camada central `src/data/index.ts` criada para alimentar as páginas.

## Fase 4.1 - Filtros e estatísticas avançadas locais

- Status: concluída em 2026-06-17.
- Utilitários de filtros criados em `src/lib/filters.ts`.
- Utilitários de cálculo e rankings criados em `src/lib/stats.ts`.
- Página `/estatisticas` com filtros por campeonato, temporada e tipo de ranking via query string.
- Página `/jogos` com filtros por campeonato, temporada, resultado e busca por adversário.
- Página `/elenco` usando por padrão todos os jogadores da aba `Estatística Histórica`.
- Perfil de jogador com participação em gols, médias e posições históricas.
- Detalhe de partida com contexto de campeonato, temporada, fase, local, jogadores relacionados e fotos.
- Página `/campeonatos` criada para explicar Liga7 Playball, Copa FutFudas, Copa Amstel e Chuteira.
- Estados vazios adicionados para filtros sem dados, fotos ausentes e relações ainda não estruturadas.
- Documentação do sistema de estatísticas criada em `docs/STATS_SYSTEM.md`.

## Fase 5 - Galeria avançada

- Status: base local concluída em 2026-06-17.
- Tipos fortes de fotos, álbuns, tags, sugestões de IA e referências faciais.
- Galeria pública com filtros por categoria, campeonato e temporada.
- Rotas `/galeria/[albumSlug]` e `/fotos/[photoSlug]`.
- Marcação pública limitada a tags manuais confirmadas ou IA aprovada por admin.
- Mock de painel em `/admin/fotos` e fila de revisão em `/admin/fotos/revisao`.
- Documentação do fluxo administrativo criada em `docs/ADMIN_PHOTO_WORKFLOW.md`.
- Upload real para Supabase Storage fica para a fase de banco/painel.

## Fase 6 - Reconhecimento facial assistido

- Status: arquitetura preparada em 2026-06-17.
- Sugestões mockadas em `src/data/faceSuggestions.ts`.
- Fotos de referência mockadas em `src/data/playerFaceReferences.ts`.
- Fluxo de revisão humana documentado.
- LGPD reforçada para dado biométrico e consentimento específico.
- Documento técnico criado em `docs/FACE_RECOGNITION_ARCHITECTURE.md`.
- Integração real com IA ainda não implementada.

## Fase 7 - Experiência pública

- Busca e filtros.
- Páginas de temporada.
- Patrocinadores com relatórios de visibilidade.
- SEO avançado e imagens OG por rota.
