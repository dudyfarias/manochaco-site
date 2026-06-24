# Changelog

## 0.13.0 - 2026-06-24

- Criação do microserviço FastAPI em `services/face-recognition` com InsightFace, ONNX Runtime, autenticação por chave e Dockerfile.
- Implementação real de `/health`, `/embed-face`, `/process-photo` e `/compare`, com limites de imagem, timeout e proteção contra URLs privadas.
- Novo provider `insightface` server-side no Next.js; mock passa a ser bloqueado em produção e face-api fica como legado.
- Referências privadas passam a usar URLs assinadas curtas; o microserviço não recebe credenciais Supabase.
- Criação de `player_face_embeddings` com RLS privada, migração de vetores legados e remoção automática por cascade.
- Processamento consulta somente embeddings consentidos e salva sugestões pendentes sem publicar tags automaticamente.
- Admin de reconhecimento passa a exibir health, URL, modelo, total de embeddings, fila e teste de conexão.
- Lote limitado por `FACE_RECOGNITION_BATCH_LIMIT`, com relatório de processadas, sugestões, fotos sem rosto e erros.
- Calibração inicial com três referências reais do DUDU e correção do aceite para similaridade de cosseno.
- Container preparado para porta dinâmica do Render e carregamento apenas dos módulos de detecção e reconhecimento.
- Rostos desconhecidos passam a entrar na revisão e a identificação manual gera uma nova referência privada para reconhecimentos futuros.
- Novas referências herdam a autorização exigida no cadastro do jogador, preservando revogação e auditoria.
- Teste real do `buffalo_l` detectou 11 rostos na imagem coletiva usada para validação local.
- Documentação de arquitetura, setup, deploy separado, LGPD, Storage e segurança atualizada.

## 0.12.0 - 2026-06-23

- Estatísticas de jogadores reestruturadas por campeonato, temporada e aba de origem em `player_competition_stats`.
- Aba `Estatística Histórica` convertida em fonte privada de validação, sem alimentar diretamente rankings públicos.
- Mapeamento explícito de todas as abas esportivas, consolidadas e financeiras da planilha.
- Normalização de jogadores por aliases e correção da colisão entre os cabeçalhos de presença e percentual de presença.
- Importador passa a gerar 129 linhas granulares, totais calculados, snapshots históricos e relatório de consistência.
- Scripts `seed:stats`, `validate:stats` e `audit:mocks` adicionados para carga segura, conferência e auditoria da origem pública.
- Filtros de `/estatisticas` e totais de `/jogadores/[slug]` passam a consultar os dados granulares do Supabase.
- Nova tabela de estatísticas por competição no perfil público e no admin do jogador.
- Novo diagnóstico protegido em `/admin/diagnostico/dados` para comparar soma calculada e histórico.
- A auditoria inicial encontrou 26 jogadores consistentes e 17 divergentes; diferenças permanecem visíveis para revisão, sem sobrescrita automática.

## 0.11.1 - 2026-06-23

- Correção da confirmação e troca de sugestões para criar tags públicas por upsert, sem duplicatas ou vínculos antigos incorretos.
- Leitura pública de fotos por jogador refeita com relações oficiais por UUID no Supabase.
- Página pública da foto passa a consultar jogadores marcados no Supabase em vez de depender apenas dos mocks locais.
- Revalidação imediata dos perfis e fotos afetados após adicionar, remover, confirmar ou trocar uma marcação.
- Fila de reconhecimento normalizada para `not_processed`, `queued` e `error`, preservando fotos em revisão e já aprovadas.
- Criação de `/admin/reconhecimento-facial` e `/admin/diagnostico/fotos` para acompanhar fila, motivos e tags publicadas.
- Inclusão de ações para reprocessar uma foto e marcá-la novamente como pendente.
- Criação de `sync:photos` para cadastrar objetos do Storage ausentes na tabela `photos` e `validate:photos` para auditar o pipeline.
- Migration de reparo para status nulos, inválidos ou herdados de seeds ilustrativos, sem remover marcações confirmadas.
- Criação de `docs/FACE_RECOGNITION_OPERATIONS.md` com o fluxo operacional e diagnóstico.

## 0.11.0 - 2026-06-23

- Substituição da dependência obrigatória da AWS por arquitetura open source com `faceapi` e fallback `mock`.
- Integração server-side de `@vladmandic/face-api`, TensorFlow.js, Sharp e modelos locais de detecção, landmarks e reconhecimento.
- Criação de comparação por distância euclidiana e similaridade de cosseno com limiares configuráveis.
- Persistência privada de embedding, modelo e data de geração em `player_face_references`.
- Provider mock agora permite testar indexação, processamento, sugestão e revisão sem ML externo.
- Admin atualizado com provider ativo, geração de embedding e indicação explícita de simulação.
- Revogação de consentimento passa a limpar embeddings mesmo se um provider externo estiver indisponível.
- Criação de `docs/INSIGHTFACE_FUTURE.md` e revisão da documentação de arquitetura, setup, LGPD e segurança.

## 0.10.3 - 2026-06-23

- Navegação pública agora acompanha a sessão do Supabase Auth.
- Substituição de “Entrar” e “Cadastre-se” por “Meu perfil” para usuários autenticados.
- Sincronização do Header e Footer após login, logout e mudanças de rota.

## 0.10.2 - 2026-06-22

- Substituição do ano de nascimento pela data de nascimento completa no cadastro e na conta.
- Remoção do campo livre “Mensagem para o clube” dos formulários e da fila administrativa.
- Criação da migration `20260622164522_add_member_birth_date.sql` para persistir `birth_date` no Supabase.
- Preservação de `birth_year` e `message` apenas como campos legados, sem novas gravações.

## 0.10.1 - 2026-06-22

- Conexão do site de produção ao projeto Supabase `manochaco`.
- Aplicação do schema, policies RLS, buckets de Storage e seed inicial.
- Configuração das variáveis Supabase na Vercel para produção, preview e desenvolvimento.
- Configuração do Site URL, redirects de confirmação e senha mínima de 8 caracteres no Supabase Auth.
- Validação controlada do provisionamento de `member_profiles` e da leitura pública das competições.
- Endurecimento das permissões de funções apontadas pelo advisor de segurança do Supabase.

## 0.10.0 - 2026-06-19

- Inclusão dos botões públicos “Entrar” e “Cadastre-se” no Header e no Footer.
- Criação do login unificado em `/entrar` para membros e administradores com Supabase Auth.
- Criação do cadastro público em `/cadastro` para torcedores, jogadores, candidatos e parceiros.
- Criação dos fluxos de confirmação de e-mail, recuperação de senha e definição de nova senha.
- Criação da área privada `/conta` para consulta do status e atualização de dados pessoais.
- Criação da tabela privada `member_profiles`, trigger de provisionamento, validações, índices e RLS.
- Criação da fila `/admin/cadastros` para analisar solicitações e vincular contas a jogadores existentes.
- Separação explícita entre tipo de conta pública e role administrativa; cadastro público nunca concede acesso admin.
- Ampliação da proteção de rotas e da atualização de sessão no `src/proxy.ts`.
- Criação da página pública de privacidade e da documentação `docs/PUBLIC_ACCOUNTS.md`.
- Atualização da validação de produção, documentação de Auth, banco, deploy, segurança e LGPD.

## 0.9.0 - 2026-06-19

- Criação da camada modular `src/lib/face-recognition` com contrato de provider, implementação Amazon Rekognition e provider mock de desenvolvimento.
- Instalação do SDK oficial `@aws-sdk/client-rekognition` e isolamento das credenciais em módulos server-only.
- Criação da migration `20260619130011_add_face_recognition_pipeline.sql` com metadados do provider, estados de indexação, resposta bruta privada e novos estados de processamento.
- Implementação do upload privado de fotos de referência em `/admin/jogadores/[id]`, com consentimento, aprovação, indexação, revogação e remoção.
- Implementação das rotas autenticadas de indexação de referência e processamento de fotos da galeria.
- Processamento de todos os rostos detectados em fotos coletivas com indexação temporária, busca na collection e limpeza dos vetores temporários.
- Persistência de sugestões em `face_detection_suggestions`, sempre pendentes e sem aprovação automática.
- Evolução de `/admin/fotos/revisao` com bounding boxes, confiança, troca de jogador, confirmação, descarte e processamento sequencial de pendências.
- Atualização automática do status da foto após a revisão de todas as sugestões.
- Ampliação dos logs de auditoria para referência facial, processamento e decisões humanas.
- Criação de `docs/FACE_RECOGNITION_SETUP.md` e atualização da documentação de arquitetura, LGPD, Storage, segurança e deploy.

## 0.8.0 - 2026-06-18

- Implementação do login administrativo em `/admin/login` com Supabase Auth.
- Criação de `src/proxy.ts` para proteger rotas `/admin/*`, exceto login.
- Criação de `src/lib/auth.ts` com leitura de `admin_profiles` e checagem server-side de roles.
- Criação do layout administrativo com sidebar, topo, logout e navegação interna.
- Criação do dashboard `/admin` com métricas, últimos jogos, últimas fotos e atalhos.
- Implementação do CRUD MVP de jogadores em `/admin/jogadores`.
- Implementação do CRUD MVP de jogos em `/admin/jogos`, com cálculo automático de resultado.
- Implementação do lançamento MVP de estatísticas por jogador em `player_match_stats`.
- Implementação do CRUD MVP de campeonatos e temporadas.
- Implementação do CRUD MVP de álbuns e fotos em `/admin/galeria`.
- Preparação de upload para Supabase Storage no bucket `photos`.
- Implementação de marcação manual confirmada em `photo_player_tags`.
- Implementação da revisão mockada de IA em `/admin/fotos/revisao`.
- Criação da rota protegida `/admin/financeiro` como placeholder privado.
- Inclusão de `photos.is_public` para controlar publicação no site público.
- Atualização da camada pública para exibir somente fotos públicas e tags confirmadas.
- Criação do script `npm run validate:prod` para validar env, tabelas, buckets e leitura pública.
- Criação de `docs/ADMIN_MVP.md`, `docs/DEPLOYMENT.md` e `docs/SECURITY_CHECKLIST.md`.
- Atualização da documentação para deixar Supabase como fonte principal e a planilha como migração inicial.

## 0.7.0 - 2026-06-18

- Instalação de `@supabase/supabase-js` e `@supabase/ssr`.
- Criação dos clientes Supabase para browser, server e service role.
- Criação de `.env.example` com variáveis públicas e service role server-only.
- Criação de `supabase/schema.sql`, `supabase/policies.sql`, `supabase/storage-policies.sql`, `supabase/seed.sql` e `supabase/README.md`.
- Criação da camada híbrida `src/lib/data.ts`, com Supabase quando configurado e fallback local quando ausente ou indisponível.
- Criação de adapters para converter dados Supabase em snake_case para os tipos camelCase do front-end.
- Atualização das rotas públicas principais para consumir dados pela camada central.
- Criação do script `npm run seed:supabase` para migrar dados esportivos públicos locais.
- Criação da rota placeholder `/admin`, posteriormente substituída pelo admin MVP.
- Criação da documentação `docs/AUTH_ADMIN.md` e `docs/SUPABASE_STORAGE.md`.
- Atualização de documentação de banco, LGPD, marcação de fotos e reconhecimento facial para Supabase.
- Manutenção da regra de não exibir dados financeiros no site público.
- Correção de escopo da Fase 7: a planilha passa a ser tratada apenas como fonte inicial de migração.
- Definição do Supabase e do futuro painel administrativo como fonte oficial dos dados após a migração inicial.
- Preparação de roles granulares: `super_admin`, `sports_admin`, `finance_admin`, `photo_editor` e `viewer`.
- Inclusão de tabelas financeiras privadas no schema: categorias, transações, mensalidades, patrocinadores e contratos.
- Atualização das policies para separar gestão esportiva, gestão de fotos, financeiro privado e leitura pública.
- Documentação de reimportação segura com dry-run, logs, diff e revisão para evitar sobrescrever dados editados no painel.

## 0.6.2 - 2026-06-18

- Substituição do arquivo público `manochaco-logo.png` pela versão HD do escudo oficial.
- Correção da renderização do escudo no Header, Hero e Footer para preservar proporção e evitar imagem esticada.
- Ajuste de tamanhos responsivos do logo para melhorar nitidez no link público da Vercel.

## 0.6.1 - 2026-06-18

- Troca da nomenclatura pública de "Elenco" para "Jogadores" no menu, Home, páginas, metadados e documentação.
- Criação da rota canônica `/jogadores` para a listagem pública de atletas.
- Manutenção de `/elenco` como redirect permanente para `/jogadores`.
- Ajuste do importador da planilha para usar a imagem local existente do jogador, preferindo `.png`, `.jpg`, `.jpeg` ou `.webp`.
- Correção dos caminhos de imagens de jogadores e comissão técnica quando já existem arquivos locais em `public/players`.
- Criação de `scripts/audit-images.ts` e do comando `npm run audit:images`.
- Auditoria de vínculos entre fotos, álbuns, jogos e jogadores, sem expor sugestões pendentes de IA no público.
- Documentação reforçada para baixar imagens do Google Drive para `public/` em vez de usar hotlink.

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
- Ajuste da listagem de jogadores para mostrar por padrão todos os atletas da aba `Estatística Histórica`.
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
- Integração inicial dos dados gerados nas páginas Home, Jogadores, Jogador, Estatísticas, Jogos, Detalhe de partida e Títulos.
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
- Ajuste da página de jogadores para separar atletas ativos por posição e ex-jogadores em seção própria.
- Ajuste do perfil individual para remover o card de títulos por jogador, dado que essa informação não existe individualizada na planilha.

## 0.3.0 - 2026-06-17

- Criação da estrutura de assets reais em `public/logos`, `public/team`, `public/players`, `public/photos` e `public/sponsors`.
- Download e organização inicial de imagens reais da pasta pública do Google Drive do Manochaco.
- Substituição do hero da Home, História, Patrocínio, partidas e galeria por imagens reais quando disponíveis.
- Criação do componente `SmartImage` com fallback preto e dourado para imagens ausentes.
- Atualização dos dados mockados de jogadores para apontar para fotos reais esperadas em `public/players`.
- Reorganização de `photos.ts` e `albums.ts` com categorias, capas e álbuns iniciais por jogadores, bastidores, jogos, títulos e competições.
- Melhoria da página `/galeria` com filtros visuais preparados, cards de álbum e grid de fotos reais.
- Preparação da galeria por jogador mantendo a relação `photoPlayers`.
- Criação da documentação `docs/ASSETS.md`.

## 0.2.0 - 2026-06-17

- Refinamento visual inicial da Home com hero mais forte, cards históricos minimalistas, rankings resumidos, galeria recente e chamada de patrocínio.
- Evolução da página individual de jogador com topo de atleta, foto em destaque, cards de estatísticas, resumo de ranking, fotos relacionadas e jogos ligados ao atleta.
- Melhoria da página de jogadores com grid mais limpo, atalhos por posição e estrutura preparada para filtros futuros.
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
