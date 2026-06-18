# Supabase Storage

O Storage será usado para servir imagens reais do Manochaco e organizar uploads
administrativos no futuro.

Depois da migração inicial, novas imagens devem ser enviadas pelo painel
administrativo. Arquivos locais em `public/` continuam úteis para fallback,
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

## Relação com o site

Enquanto Supabase não estiver configurado, o site usa arquivos em `public/`.
Quando Storage estiver ativo, a camada híbrida aceita URLs remotas de imagem e
o componente `SmartImage` renderiza sem quebrar o layout.
