# Assets

Este documento organiza o uso de imagens reais do Clube Atlético Manochaco no
site. A estrutura atual usa arquivos locais em `public/` e está preparada para
uma migração futura para Supabase Storage.

## Estrutura

```text
public/
├── logos/
│   ├── manochaco-logo.png
│   ├── manochaco-escudo.png
│   └── manochaco-leao.png
├── team/
│   ├── elenco-principal.jpg
│   ├── comemoracao.jpg
│   ├── bastidores.jpg
│   └── hero-home.jpg
├── players/
│   ├── dudu.jpg
│   ├── torres.jpg
│   ├── bruninho.jpg
│   ├── pedrinho.jpg
│   ├── madeus.jpg
│   ├── nikollas.jpg
│   ├── ed-gou.jpg
│   └── victor-erik.jpg
├── photos/
│   ├── geral/
│   ├── jogos/
│   ├── bastidores/
│   ├── titulos/
│   └── treino/
└── sponsors/
```

## Onde Colocar Cada Imagem

- `public/logos/`: escudo, logo horizontal, variações e arte do mascote.
- `public/team/`: fotos amplas do elenco, comemoração, bastidores e hero.
- `public/players/`: fotos individuais dos jogadores, nomeadas pelo slug.
- `public/photos/geral/`: fotos gerais do clube e do elenco.
- `public/photos/jogos/`: fotos de partidas, nomeadas por jogo e ano.
- `public/photos/bastidores/`: aquecimento, vestiário, chegada e resenhas.
- `public/photos/titulos/`: taças, finais, campanhas e comemorações.
- `public/photos/treino/`: treinos e preparação.
- `public/sponsors/`: marcas parceiras, mídia kit e ativações futuras.

## Padrão De Nomes

Use nomes simples, em minúsculas, sem acentos, espaços ou caracteres especiais.

Exemplos:

```text
dudu.jpg
torres.jpg
bruninho.jpg
hero-home.jpg
elenco-principal.jpg
manochaco-vs-dopinham-forest-2024-01.jpg
manochaco-vs-panelinha-2024-01.jpg
```

Para várias fotos do mesmo jogo, incremente no final:

```text
manochaco-vs-expulsos-2024-01.jpg
manochaco-vs-expulsos-2024-02.jpg
manochaco-vs-expulsos-2024-03.jpg
```

## Formatos Recomendados

- Fotos: `.jpg`, qualidade entre 75 e 85.
- Logos com transparência: `.png` ou `.svg`.
- Imagens web modernas: `.webp` pode ser usado futuramente, mas mantenha `.jpg`
  enquanto a base estiver simples.

## Tamanhos Recomendados

- Hero da Home: 2200px a 2600px no maior lado.
- Fotos de galeria: 1600px a 2000px no maior lado.
- Fotos de jogadores: proporção vertical, idealmente 900x1125 ou maior.
- Logos: PNG transparente com pelo menos 512px no maior lado.

Evite subir imagens muito pesadas sem otimizar. O ideal é manter fotos públicas
abaixo de 1 MB quando possível.

## Como Substituir Imagens No Código

Os caminhos públicos são referenciados em `src/data`:

- jogadores: `src/data/players.ts`
- fotos: `src/data/photos.ts`
- álbuns: `src/data/albums.ts`
- partidas: `src/data/matches.ts`

Exemplo:

```ts
image: "/players/dudu.jpg"
```

Se `public/players/dudu.jpg` existir, o site renderiza a foto real. Se não
existir, o componente `SmartImage` renderiza um fallback preto e dourado com as
iniciais do jogador.

## Fallback De Imagem

O componente `src/components/SmartImage.tsx` verifica se o arquivo existe dentro
de `public/` antes de renderizar `next/image`.

Quando a imagem não existe, o site mostra:

- fundo preto/cinza escuro;
- iniciais;
- detalhe dourado;
- texto de imagem em breve;
- `alt` acessível.

Isso evita imagens quebradas no navegador.

## Boas Práticas

- Não renomeie arquivos já referenciados em `src/data` sem atualizar o caminho.
- Não use acentos, espaços ou parênteses em nomes de arquivos.
- Prefira fotos nítidas, claras e horizontais para hero e galeria.
- Prefira fotos verticais para perfil de jogador.
- Preserve o consentimento de uso de imagem dos atletas.
- Não envie documentos financeiros ou dados privados para `public/`.
- Fotos de menores de idade exigem cuidado extra e autorização específica.

## Origem Das Imagens Iniciais

As primeiras imagens reais foram organizadas a partir da pasta pública do Google
Drive do Manochaco, com subpastas `LOGO`, `2023` e `2024`.

Algumas imagens ainda são capas provisórias enquanto não houver foto específica
para cada competição. Para substituir, basta trocar o arquivo no caminho final
mantendo o mesmo nome, ou atualizar o caminho em `src/data`.

## Futuro Com Supabase Storage

Na fase com Supabase, esta estrutura deve virar buckets e tabelas:

- `photos`
- `albums`
- `photo_players`
- `photo_matches`
- `photo_competitions`

O padrão de nomes e categorias deste documento deve ser preservado para facilitar
a migração.
