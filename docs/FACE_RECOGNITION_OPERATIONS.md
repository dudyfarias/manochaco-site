# Operação do reconhecimento facial

## Fluxo oficial

1. A imagem existe no Storage ou em uma origem permitida pelo servidor.
2. A tabela `photos` possui um registro com `id`, `slug`, `url`, categoria e status.
3. Fotos `not_processed`, `queued` ou `error` entram na fila.
4. O provider gera sugestões pendentes em `face_detection_suggestions`.
5. Um administrador confirma, troca ou ignora cada sugestão.
6. Confirmar ou trocar faz upsert em `photo_player_tags` com
   `tag_type = ai_confirmed` e `confirmed_by_admin = true`.
7. O site público consulta as relações por UUID e mostra somente fotos públicas
   e tags confirmadas.

Nenhuma sugestão pendente é publicada automaticamente.

## Storage e banco

Storage guarda os bytes da imagem. A tabela `photos` guarda o registro que torna
a imagem pesquisável e relacionável. Uma imagem presente apenas no bucket não
entra na galeria nem na fila até ter seu registro no banco.

Use a sincronização em modo de leitura antes de gravar:

```bash
npm run sync:photos
npm run sync:photos -- --apply
```

O script percorre o bucket `photos`, compara o caminho de cada objeto com as URLs
já cadastradas e insere apenas os ausentes. O status inicial é
`not_processed`.

## Diagnóstico no admin

- `/admin/reconhecimento-facial`: totais da operação e tags já publicadas.
- `/admin/diagnostico/fotos`: todas as fotos, seus status, sugestões, tags e o
  motivo de entrada ou exclusão da fila.
- `/admin/jogadores/[id]`: fotos públicas vinculadas ao jogador e alerta de
  divergência entre banco e leitura pública.
- `/admin/galeria/fotos/[id]`: processar, reprocessar ou marcar novamente como
  pendente.

`needs_review` fica fora da fila porque já possui decisão humana pendente.
`processed` e `approved` também ficam fora. Fotos sem URL não são processáveis.

## Reprocessamento

Reprocessar remove sugestões antigas ainda pendentes ou com erro, preserva tags
confirmadas e executa novamente o provider. Para apenas corrigir um status,
use **Marcar como pendente de processamento**.

## Validação

Com as variáveis Supabase configuradas:

```bash
npm run validate:photos
```

O script verifica URLs e status inválidos, relações órfãs, sugestões confirmadas
sem tag pública, leitura anônima das tags e objetos do Storage sem registro.
Avisos sobre assets locais não cadastrados são informativos; falhas de
integridade encerram o comando com erro.

Para conferir uma publicação manualmente:

1. processe uma foto pendente;
2. confirme uma sugestão;
3. confira a tag em `/admin/reconhecimento-facial`;
4. abra o perfil público pelo link da tabela;
5. abra a foto pública e confirme o jogador marcado.
