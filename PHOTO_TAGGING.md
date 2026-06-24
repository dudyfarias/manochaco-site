# Marcação de fotos

O site mantém uma simulação local como fallback de desenvolvimento:

- `src/data/photos.ts` contém as fotos.
- `src/data/photoPlayers.ts` liga `photoId` a `playerSlug`.
- `src/data/faceSuggestions.ts` simula sugestões de IA.
- `src/data/playerFaceReferences.ts` simula fotos de referência.
- A página do jogador consulta essa relação para mostrar fotos relacionadas.

Depois da migração inicial, o painel administrativo e o Supabase são a fonte
oficial das fotos, álbuns, marcações e sugestões. Os mocks não participam do
fluxo biométrico de produção.

Relação pública esperada:

```ts
{
  photoId: "photo-elenco-2025",
  playerId: "player-dudu",
  playerSlug: "dudu",
  tagType: "manual",
  confirmedByAdmin: true
}
```

`playerId` deve bater com `players[].id` e `playerSlug` deve bater com
`players[].slug`. Rode `npm run audit:images` para encontrar tags com foto ou
jogador inexistente.

O site público só exibe tags com:

- `confirmedByAdmin: true`;
- `tagType: manual` ou `tagType: ai_confirmed`.

Tags `ai_suggested` ou sugestões pendentes nunca aparecem como marcações
públicas.

## Marcação manual no admin MVP

No painel administrativo, um admin autorizado pode:

- Criar álbuns.
- Fazer upload de fotos.
- Abrir uma foto.
- Selecionar jogadores visíveis.
- Salvar marcações com status aprovado.
- Remover ou corrigir marcações.
- Controlar se a foto aparece no site público.

Fluxo previsto:

1. administrador acessa `/admin/galeria/fotos`;
2. seleciona ou envia uma foto;
3. escolhe o álbum, jogo, campeonato e temporada;
4. clica em "Marcar jogador";
5. seleciona o atleta;
6. salva;
7. a foto passa a aparecer no perfil do jogador.

## Supabase e Fase 8

A persistência real será feita nas tabelas:

- `photos`;
- `albums`;
- `photo_player_tags`;
- `player_face_references`;
- `player_face_embeddings`;
- `face_detection_suggestions`.

O site público consulta somente `photo_player_tags` confirmadas. Sugestões em
`face_detection_suggestions` seguem internas até revisão humana; embeddings
permanecem privados e nunca são conteúdo público.

No Storage:

- fotos públicas ficam em `photos`, `albums`, `players`, `team` ou `logos`;
- fotos de referência facial ficam no bucket privado `face-references`;
- uploads administrativos serão protegidos por Supabase Auth e RLS.

As permissões previstas são:

- `super_admin` e `sports_admin`: gestão completa do acervo esportivo;
- `photo_editor`: upload, álbuns, marcações e revisão de fotos;
- `viewer`: visualização administrativa sem edição.

## Reconhecimento facial com revisão humana

Reconhecimento facial só deve sugerir marcações. O fluxo correto:

1. Referências consentidas são indexadas no provider.
2. Uma foto da galeria é enviada para processamento server-side.
3. O provider detecta rostos e busca possíveis jogadores.
4. As sugestões entram como `pending`.
5. Um humano confirma, troca ou ignora cada sugestão.
6. Apenas marcações aprovadas aparecem no site público.

O fluxo usa provider modular: o microserviço InsightFace gera embeddings fora
da Vercel. Mock existe apenas para testes automatizados e é bloqueado em
produção. A revisão fica em
`/admin/fotos/revisao`, com confiança, provider e bounding box. A interface
processa lotes pequenos e limitados.

## Cuidados

- Não usar reconhecimento facial sem consentimento específico.
- Permitir remoção de marcações.
- Registrar origem da marcação: manual ou IA.
- Não treinar modelos com fotos do clube sem autorização explícita.
- Fotos de referência exigem consentimento e não devem ser publicadas
  automaticamente.
