# Supabase Storage

O Storage serve imagens reais do Manochaco e organiza uploads administrativos.

Depois da migração inicial, novas imagens devem ser enviadas pelo painel
administrativo em `/admin/galeria/fotos`. Arquivos locais em `public/` continuam úteis para fallback,
desenvolvimento e assets versionados de marca, mas não devem ser o fluxo
principal de atualização do acervo.

## Buckets

- `logos`: público, escudos e variações de marca.
- `team`: público, fotos gerais do time e hero.
- `players`: público, fotos de perfil dos jogadores.
- `photos`: público, fotos da galeria.
- `albums`: público, capas de álbuns.
- `face-references`: privado, fotos de referência para reconhecimento facial.

## Caminhos sugeridos

```text
logos/manochaco-logo.png
team/hero-home.jpg
players/dudu/profile.jpg
photos/2025/liga7/manochaco-vs-rival/foto-001.jpg
albums/2025/elenco/capa.jpg
face-references/dudu/reference-001.jpg
```

## Regras

- Imagens públicas podem usar buckets públicos.
- Referências faciais ficam sempre privadas.
- Uploads administrativos devem exigir Supabase Auth.
- Escrita deve ser restrita por RLS/policies e role administrativa.
- A tabela `photos` guarda metadados públicos e o caminho/URL do arquivo.
- A tabela `player_face_references` guarda referências privadas com
  consentimento.
- Uploads financeiros ou documentos internos, caso existam no futuro, não
  devem usar buckets públicos.

## Upload no admin MVP

- A tela `/admin/galeria/fotos` aceita arquivo de imagem.
- O upload usa o bucket `photos`.
- O nome do arquivo é normalizado para minúsculas, sem espaços e caracteres especiais.
- A URL pública retornada pelo Storage é salva na tabela `photos`.
- `photos.is_public` controla se a imagem aparece no site público.
- O perfil admin do jogador envia JPEG/PNG de até 5 MB para `face-references`.
- A interface recebe apenas signed URL temporária para pré-visualização administrativa.
- `storage_path` é usado pelo servidor para download autenticado durante a indexação.
- `player_face_embeddings` guarda o vetor separado da referência e sem leitura
  pública.
- Revogar consentimento remove o embedding; remover a referência exclui vetor e
  objeto privado.

## Reconhecimento facial

- Referências nunca usam `getPublicUrl`.
- O download do bucket privado usa a sessão Supabase do admin e as policies de `storage.objects`.
- Fotos públicas do bucket `photos` são baixadas pelo SDK quando a URL permite recuperar o path.
- Arquivos locais do próprio site podem ser processados; hosts externos arbitrários são bloqueados.
- O Next.js cria URLs assinadas curtas para o microserviço InsightFace.
- O microserviço não recebe credenciais Supabase e não grava no banco.

## Relação com o site

Um objeto existente no Storage não aparece automaticamente no site. Ele precisa
de um registro correspondente na tabela `photos`, que guarda slug, metadados,
publicação e status de reconhecimento. Da mesma forma, uma URL em `photos` não
prova que o arquivo está no bucket: o registro também pode apontar para um asset
versionado em `public/`.

Para auditar e sincronizar o bucket público:

```bash
npm run sync:photos
npm run sync:photos -- --apply
npm run validate:photos
```

O primeiro comando é um dry-run. `--apply` cria somente os registros ausentes,
com slug seguro, categoria inferida, publicação ativa e status
`not_processed`; arquivos já cadastrados não são duplicados.

Enquanto Supabase não estiver configurado, o site usa arquivos em `public/`.
Quando Storage estiver ativo, a camada híbrida aceita URLs remotas de imagem e
o componente `SmartImage` renderiza sem quebrar o layout.
