# Roadmap

## Fase 1 - Site estático

- Portal institucional em Next.js.
- Dados mockados em TypeScript.
- Páginas principais e rotas dinâmicas.
- Galeria com marcação simulada por `photoPlayers`.
- Documentação inicial.

## Fase 2 - Banco de dados

- Criar projeto Supabase.
- Modelar tabelas de jogadores, jogos, estatísticas, fotos e álbuns.
- Migrar dados mockados para seed.
- Criar importador da planilha Manochaco.
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

## Fase 4 - Galeria avançada

- Upload de fotos para Supabase Storage.
- Criação e edição de álbuns.
- Marcação manual de jogadores em fotos.
- Consentimento de imagem por atleta.

## Fase 5 - Reconhecimento facial assistido

- Detecção facial com revisão humana obrigatória.
- Sugestões de jogadores, nunca marcação automática definitiva.
- Registro de consentimento específico para biometria.
- Processo de remoção e contestação.

## Fase 6 - Experiência pública

- Busca e filtros.
- Páginas de temporada.
- Patrocinadores com relatórios de visibilidade.
- SEO avançado e imagens OG por rota.
