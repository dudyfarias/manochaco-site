# Marcação de fotos

A fase 1 usa uma simulação local:

- `src/data/photos.ts` contém as fotos.
- `photoPlayers` liga `photoId` a `playerSlug`.
- A página do jogador consulta essa relação para mostrar fotos relacionadas.

## Marcação manual futura

No painel administrativo, um admin poderá:

- Criar álbuns.
- Fazer upload de fotos.
- Abrir uma foto.
- Selecionar jogadores visíveis.
- Salvar marcações com status aprovado.

## IA futura com revisão humana

Reconhecimento facial só deve sugerir marcações. O fluxo correto:

1. Foto é enviada para Storage.
2. Um serviço detecta rostos e sugere possíveis jogadores.
3. As sugestões entram como `pending`.
4. Um humano aprova ou rejeita cada sugestão.
5. Apenas marcações aprovadas aparecem no site público.

## Cuidados

- Não usar reconhecimento facial sem consentimento específico.
- Permitir remoção de marcações.
- Registrar origem da marcação: manual ou IA.
- Não treinar modelos com fotos do clube sem autorização explícita.
