# Admin MVP

O painel administrativo da Fase 8 transforma o site em uma plataforma editável.
O Supabase é a fonte principal de dados; a planilha serve apenas para migração
inicial e reimportações controladas.

## Rotas

- `/admin/login`: login público por e-mail e senha.
- `/admin`: dashboard protegido.
- `/admin/jogadores`, `/admin/jogadores/novo`, `/admin/jogadores/[id]`.
- `/admin/jogos`, `/admin/jogos/novo`, `/admin/jogos/[id]`.
- `/admin/campeonatos`.
- `/admin/temporadas`.
- `/admin/galeria`, `/admin/galeria/albuns`, `/admin/galeria/fotos`, `/admin/galeria/fotos/[id]`.
- `/admin/fotos/revisao`.
- `/admin/financeiro`.
- `/admin/configuracoes`.

## Proteção

- `src/proxy.ts` protege `/admin/*`, exceto `/admin/login`.
- Server Components e Server Actions usam `requireAdmin`.
- A role vem de `admin_profiles`.
- `SUPABASE_SERVICE_ROLE_KEY` não é usada no client.

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

## Placeholders

- Financeiro mostra apenas a área privada da próxima fase.
- Revisão de IA usa dados existentes em `face_detection_suggestions`; não há reconhecimento real.
- Gestão de administradores ainda deve ser feita pelo Supabase Dashboard ou SQL.
- Logs de auditoria estão preparados e usados em ações críticas, mas ainda não têm tela própria.

## Relação com o site público

O site público deve ler dados do Supabase quando configurado. Se o Supabase
estiver indisponível, usa fallback local. Fotos públicas dependem de
`photos.is_public = true`, e tags públicas dependem de
`confirmed_by_admin = true`.

Nenhuma rota admin aparece no menu público.
