# Admin MVP

O painel administrativo da Fase 8 transforma o site em uma plataforma editável.
O Supabase é a fonte principal de dados; a planilha serve apenas para migração
inicial e reimportações controladas.

## Rotas

- `/entrar`: login unificado de membros e administradores.
- `/admin/login`: rota de compatibilidade que encaminha ao login unificado.
- `/admin`: dashboard protegido.
- `/admin/cadastros`: revisão de contas públicas e vínculos com jogadores.
- `/admin/jogadores`, `/admin/jogadores/novo`, `/admin/jogadores/[id]`.
- `/admin/jogos`, `/admin/jogos/novo`, `/admin/jogos/[id]`.
- `/admin/campeonatos`.
- `/admin/temporadas`.
- `/admin/galeria`, `/admin/galeria/albuns`, `/admin/galeria/fotos`, `/admin/galeria/fotos/[id]`.
- `/admin/fotos/revisao`.
- `/admin/reconhecimento-facial`.
- `/admin/diagnostico/fotos`.
- `/admin/financeiro`.
- `/admin/configuracoes`.

## Proteção

- `src/proxy.ts` protege `/admin/*` e encaminha visitantes para `/entrar`.
- Server Components e Server Actions usam `requireAdmin`.
- A role vem de `admin_profiles`.
- `SUPABASE_SERVICE_ROLE_KEY` não é usada no client.

## Cadastros públicos

`/admin/cadastros` reúne contas de torcedores, jogadores, candidatos e
parceiros. `super_admin` e `sports_admin` podem revisar status, ajustar o tipo
de conta e vincular uma conta a um registro existente de jogador. Essa tela não
cria administradores; roles continuam em `admin_profiles`.

## Roles

- `super_admin`: acesso total.
- `sports_admin`: jogadores, jogos, campeonatos, temporadas e estatísticas.
- `finance_admin`: financeiro privado.
- `photo_editor`: fotos, álbuns, tags e revisão de IA.
- `viewer`: leitura administrativa.

## CRUDs funcionais

- Jogadores: listar, buscar, filtrar, criar, editar e desativar por status.
- Jogos: listar, filtrar, criar, editar, calcular resultado e lançar estatísticas por jogador.
- Campeonatos: listar, criar e editar.
- Temporadas: listar, criar e editar.
- Álbuns: listar, criar e editar.
- Fotos: listar, filtrar, criar, editar, enviar arquivo para Storage e controlar publicação.
- Tags: adicionar ou remover marcação manual confirmada em uma foto.
- Referências faciais: upload privado, consentimento, aprovação, geração de embedding e remoção no perfil do jogador.
- Reconhecimento facial: processamento individual ou sequencial, sugestões reais, bounding box e revisão humana.
- Diagnóstico: fila elegível, motivo de exclusão, tags públicas e fotos vinculadas por jogador.

## Placeholders

- Financeiro mostra apenas a área privada da próxima fase.
- Gestão de administradores ainda deve ser feita pelo Supabase Dashboard ou SQL.
- Logs de auditoria estão preparados e usados em ações críticas, mas ainda não têm tela própria.
- O processamento de fotos ainda é síncrono; lotes grandes precisam de fila/background job.

## Reconhecimento facial

- `/admin/jogadores/[id]` gerencia referências privadas e consentimento.
- `/admin/galeria/fotos/[id]` dispara o processamento de uma foto.
- `/admin/fotos/revisao` exibe sugestões, bounding boxes e processamento pendente.
- `/admin/reconhecimento-facial` resume a operação e lista marcações confirmadas.
- `/admin/diagnostico/fotos` explica por que cada foto entra ou não na fila.
- APIs em `/api/admin/face-recognition/*` exigem sessão e role autorizada.
- Confirmar ou trocar cria tag `ai_confirmed`; ignorar não publica nada.
- O provider padrão é `mock`; `faceapi` oferece processamento open source server-side e AWS permanece opcional.

## Relação com o site público

O site público deve ler dados do Supabase quando configurado. Se o Supabase
estiver indisponível, usa fallback local. Fotos públicas dependem de
`photos.is_public = true`, e tags públicas dependem de
`confirmed_by_admin = true`.

Nenhuma rota admin aparece no menu público.
