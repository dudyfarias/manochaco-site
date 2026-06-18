# Portal administrativo futuro

O painel administrativo será o local para manter os dados depois da importação
inicial da planilha Manochaco.

Depois da migração inicial, o Supabase e o painel passam a ser a fonte oficial.
A planilha não deve ser necessária para atualizar o site no futuro.

## Papel da planilha

A planilha será usada como seed e fonte de importação inicial para:

- estatísticas históricas;
- estatísticas por campeonato e temporada;
- jogos e resultados;
- dados financeiros privados.

Depois disso, o portal administrativo deve permitir criar, revisar e corrigir
dados sem depender de edição direta na planilha.

## Dados adicionados pelo portal

Admins autenticados poderão cadastrar:

- novos jogadores;
- comissão técnica;
- novas competições;
- novas temporadas;
- partidas;
- gols e assistências;
- cartões e suspensões;
- títulos e campanhas;
- fotos e álbuns;
- marcações de jogadores em fotos;
- patrocinadores;
- custos, mensalidades, receitas, despesas e pagamentos, apenas na área
  financeira privada.

## Origem dos dados

Cada registro importante deve ter rastreabilidade:

- `spreadsheet_import`: criado por importação da planilha;
- `admin_manual`: criado ou editado diretamente no portal;
- `admin_correction`: correção feita após revisão;
- `ai_suggestion`: sugestão pendente de IA, quando houver reconhecimento facial.

Dados financeiros devem sempre ficar fora das páginas públicas, mesmo quando
forem criados manualmente por admin.

## Regras de conflito

Uma nova importação da planilha não deve sobrescrever silenciosamente dados já
editados no portal.

Fluxo recomendado:

1. Importar planilha em lote.
2. Comparar registros existentes por slug, jogador, competição, temporada e data.
3. Marcar conflitos para revisão.
4. Aplicar atualização somente após aprovação de admin.
5. Registrar ação em log de auditoria.

Reimportações futuras devem oferecer dry-run, logs, diff e confirmação
explícita antes de qualquer alteração persistente.

## Permissões

Papéis sugeridos:

- `super_admin`: acesso total ao sistema e gestão de administradores;
- `sports_admin`: jogadores, jogos, estatísticas, campeonatos e temporadas;
- `finance_admin`: mensalidades, receitas, despesas, patrocínios e relatórios;
- `photo_editor`: upload, álbuns, marcação manual e revisão de fotos;
- `reader`: leitura administrativa sem edição.

Na primeira implementação autenticada, é aceitável começar com um fluxo simples,
desde que as tabelas financeiras já nasçam protegidas por RLS e a evolução para
roles granulares não exija refazer o banco.
