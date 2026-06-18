# Workflow administrativo de fotos

Esta fase não implementa autenticação, upload real ou persistência. As rotas
`/admin/fotos` e `/admin/fotos/revisao` são mockadas e servem para guiar a fase
futura do painel.

A Fase 7 prepara as tabelas e buckets Supabase para esse fluxo, mas os botões
seguem visuais e sem ação real até a implementação do painel protegido.

Depois que o painel existir, ele será a fonte oficial para fotos, álbuns e
marcações. O acervo local em `public/` fica como fallback e apoio de
desenvolvimento.

## Fluxo manual

1. Administrador acessa o painel de fotos.
2. Faz upload da foto para Supabase Storage.
3. Cria ou seleciona um álbum.
4. Vincula a foto a jogo, campeonato e temporada.
5. Clica em "Marcar jogador".
6. Seleciona o jogador.
7. Salva a marcação como `manual`.
8. A marcação fica pública apenas se `confirmedByAdmin` for verdadeiro.

## Fluxo de revisão de IA

1. Foto enviada entra em fila de processamento.
2. Serviço detecta rostos.
3. Serviço compara com referências autorizadas.
4. Sistema cria sugestões com confiança e bounding box.
5. Administrador revisa cada sugestão.
6. Administrador confirma, troca jogador ou ignora.
7. Apenas sugestões confirmadas viram tags públicas `ai_confirmed`.

## Campos principais

- foto;
- álbum;
- jogo;
- campeonato;
- temporada;
- jogador;
- tipo de tag;
- confiança;
- bounding box;
- responsável pela revisão;
- data da revisão.

## Regras

- Não publicar sugestão pendente.
- Não usar foto de referência sem consentimento.
- Permitir remoção de marcação.
- Registrar auditoria no painel futuro.
- Separar leitura pública de escrita administrativa por RLS.
- Restringir escrita a `super_admin`, `sports_admin` e `photo_editor`.
