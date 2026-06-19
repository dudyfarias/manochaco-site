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
- Jogadores com grid visual, atalhos por posição e estrutura preparada para filtros.
- Estatísticas com cards gerais, rankings limpos e estrutura preparada para filtros por campeonato e temporada.
- Componentes visuais revisados para manter identidade preta e dourada com menos ruído visual.

## Fase 1.2 - Organização de assets reais

- Status: concluída em 2026-06-17.
- Estrutura de imagens reais criada em `public/`.
- Logos, fotos dos jogadores, fotos de jogos, bastidores, títulos e sponsors organizados por pasta.
- Primeiras imagens reais baixadas da pasta pública do Google Drive do Manochaco.
- Home, História, Galeria, Jogos e Patrocínio preparadas para usar imagens reais.
- Componente de fallback visual criado para evitar imagens quebradas.
- Galeria estruturada por álbuns, categorias e relação `photoPlayers`.
- Documentação criada em `docs/ASSETS.md`.

## Fase 2 - Banco de dados

- Status: base técnica preparada em 2026-06-18.
- Schema Supabase criado em `supabase/schema.sql`.
- Policies RLS criadas em `supabase/policies.sql`.
- Buckets e policies de Storage documentados em `supabase/storage-policies.sql`.
- Clientes Supabase para browser, server e service role criados.
- Camada híbrida `src/lib/data.ts` criada com fallback local.
- Adapters snake_case para camelCase criados em `src/lib/adapters`.
- Script `npm run seed:supabase` criado para a migração inicial dos dados esportivos.
- Planilha tratada como fonte inicial de importação, não como banco permanente.
- Supabase definido como fonte oficial após a migração inicial.
- Tabelas financeiras privadas previstas para a futura área admin, protegidas por RLS.

## Fase 3 - Painel administrativo

- Status: planejamento incorporado às Fases 8, 9 e 10.
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
- Escopo: carga inicial e geração de base para migração, não fonte permanente.
- Script `npm run import:spreadsheet` criado.
- Estrutura `data/raw/` criada para planilhas locais ignoradas pelo Git.
- Estrutura `src/data/generated/` criada para arquivos TypeScript gerados.
- Jogadores importados da aba `Estatística Histórica`.
- Jogos importados da aba `Jogos Histórico`.
- Estatísticas gerais e rankings gerados a partir da planilha.
- Abas financeiras listadas e ignoradas no site público.
- Camada central `src/data/index.ts` criada para alimentar as páginas.
- Reimportações futuras devem ter modo seguro, dry-run, logs e revisão para não
  sobrescrever dados editados manualmente no painel.

## Fase 4.1 - Filtros e estatísticas avançadas locais

- Status: concluída em 2026-06-17.
- Utilitários de filtros criados em `src/lib/filters.ts`.
- Utilitários de cálculo e rankings criados em `src/lib/stats.ts`.
- Página `/estatisticas` com filtros por campeonato, temporada e tipo de ranking via query string.
- Página `/jogos` com filtros por campeonato, temporada, resultado e busca por adversário.
- Página `/jogadores` usando por padrão todos os jogadores da aba `Estatística Histórica`.
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

## Fase 6.1 - Correção de imagens e nomenclatura

- Status: concluída em 2026-06-18.
- Nomenclatura pública ajustada de "Elenco" para "Jogadores".
- Rota principal de jogadores consolidada em `/jogadores`.
- Redirect permanente de `/elenco` para `/jogadores`.
- Importador da planilha passa a preferir imagens locais existentes em `.png`, `.jpg`, `.jpeg` ou `.webp`.
- Script `npm run audit:images` criado para auditar caminhos locais, hotlinks remotos e vínculos de fotos.
- Galeria e perfis continuam exibindo apenas tags confirmadas publicamente.

## Fase 7 - Supabase, Auth e Storage

- Status: fundação técnica criada em 2026-06-18.
- Banco PostgreSQL modelado para jogadores, competições, temporadas, jogos,
  fotos, álbuns, tags, referências faciais, sugestões de IA, admins e auditoria.
- Tabelas financeiras privadas modeladas para categorias, transações,
  mensalidades, patrocinadores e contratos de patrocínio.
- Roles administrativas previstas: super admin, admin esportivo, admin
  financeiro, editor de fotos e viewer.
- Planilha definida como fonte de migração inicial; depois, o painel
  administrativo passa a ser o caminho principal para criar, editar e remover
  dados.
- Supabase Auth documentado para a futura área administrativa.
- Storage documentado para imagens públicas e referências faciais privadas.
- Site público continua funcionando sem Supabase configurado.
- Painel completo, uploads reais e reconhecimento facial real ficam para fases
  futuras.

## Fase 8 - Painel Administrativo MVP

- Status: MVP implementado em 2026-06-18.
- Autenticação administrativa com Supabase Auth.
- Proteção de `/admin/*` por `src/proxy.ts` e checagens server-side.
- Dashboard administrativo com atalhos e resumos.
- CRUD MVP de jogadores, incluindo status ativo, ex-jogador ou comissão.
- CRUD MVP de jogos, placares, campeonatos, temporadas e resumos.
- Lançamento MVP de presença, gols, assistências, cartões e dados de goleiro por partida.
- Rankings públicos preparados para serem alimentados por `player_match_stats`.
- Upload de fotos no Supabase Storage pelo bucket `photos`.
- Criação e edição de álbuns.
- Marcação manual de jogadores em fotos.
- Revisão mockada de sugestões de IA.
- Financeiro criado como rota privada placeholder.
- Logs de auditoria preparados e usados em ações críticas do admin.
- Documentação criada para admin MVP, deploy e checklist de segurança.

## Fase 9 - Reconhecimento facial assistido real

- Status: implementada em 2026-06-19; ativação operacional depende das credenciais AWS e do projeto Supabase de produção.
- Provider modular com Amazon Rekognition e mock explícito para desenvolvimento.
- Upload privado de referências faciais com consentimento e aprovação.
- Indexação de rostos em collection dedicada e vínculo por jogador.
- Processamento individual ou sequencial de fotos da galeria.
- Sugestões persistidas com confiança e bounding box.
- Revisão humana obrigatória para confirmar, trocar ou ignorar.
- Publicação limitada a `photo_player_tags` confirmadas.
- Revogação de consentimento remove o índice facial do provider.
- Auditoria de eventos principais e documentação de setup operacional.
- Próxima evolução: mover lotes grandes para fila/background job e definir política formal de retenção biométrica.

## Fase 9.1 - Contas públicas e comunidade

- Status: implementada em 2026-06-19; ativação depende do Supabase de produção e do SMTP configurado.
- Login unificado para membros e administradores em `/entrar`.
- Cadastro público para torcedores, jogadores, candidatos e parceiros.
- Confirmação de e-mail, recuperação e troca de senha pelo Supabase Auth.
- Área `/conta` com dados privados e status da solicitação.
- Fila `/admin/cadastros` para aprovação e vínculo com jogadores históricos.
- Roles administrativas continuam separadas e não podem ser solicitadas pelo formulário público.
- Próxima evolução: recursos específicos por perfil, notificações, convite para partidas e gestão formal de processos seletivos.

## Fase 10 - Financeiro

- Área financeira privada, sem qualquer item no menu público.
- Mensalidades, pagamentos, pendências, receitas e despesas.
- Patrocínios e contratos de patrocínio.
- Resumo financeiro e controle de caixa do clube.
- Filtros por mês, ano, jogador e categoria.
- Exportação de relatórios.
- Permissões específicas para `super_admin` e `finance_admin`.
- Todos os valores monetários em centavos.

## Fase 11 - Experiência pública avançada

- Busca e filtros adicionais.
- Páginas de temporada.
- Patrocinadores com relatórios de visibilidade pública permitida.
- SEO avançado e imagens OG por rota.
