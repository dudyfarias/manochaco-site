# Marcação de fotos

A fase atual usa uma simulação local:

- `src/data/photos.ts` contém as fotos.
- `src/data/photoPlayers.ts` liga `photoId` a `playerSlug`.
- `src/data/faceSuggestions.ts` simula sugestões de IA.
- `src/data/playerFaceReferences.ts` simula fotos de referência.
- A página do jogador consulta essa relação para mostrar fotos relacionadas.

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

## Marcação manual futura

No painel administrativo, um admin poderá:

- Criar álbuns.
- Fazer upload de fotos.
- Abrir uma foto.
- Selecionar jogadores visíveis.
- Salvar marcações com status aprovado.

Fluxo previsto:

1. administrador acessa `/admin/fotos`;
2. seleciona ou envia uma foto;
3. escolhe o álbum, jogo, campeonato e temporada;
4. clica em "Marcar jogador";
5. seleciona o atleta;
6. salva;
7. a foto passa a aparecer no perfil do jogador.

## IA futura com revisão humana

Reconhecimento facial só deve sugerir marcações. O fluxo correto:

1. Foto é enviada para Storage.
2. Um serviço detecta rostos e sugere possíveis jogadores.
3. As sugestões entram como `pending`.
4. Um humano aprova ou rejeita cada sugestão.
5. Apenas marcações aprovadas aparecem no site público.

O mock de revisão fica em `/admin/fotos/revisao`.

## Cuidados

- Não usar reconhecimento facial sem consentimento específico.
- Permitir remoção de marcações.
- Registrar origem da marcação: manual ou IA.
- Não treinar modelos com fotos do clube sem autorização explícita.
- Fotos de referência exigem consentimento e não devem ser publicadas
  automaticamente.
