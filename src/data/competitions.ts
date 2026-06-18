import type { Competition } from "@/types";

export const competitions: Competition[] = [
  {
    id: "liga7-playball",
    slug: "liga7",
    name: "Liga7 da Playball",
    shortName: "Liga7",
    description:
      "Competição da Playball em que o Manochaco iniciou na Série D e chegou à Série B.",
    type: "league",
  },
  {
    id: "copa-futfudas",
    slug: "copa-futfudas",
    name: "Copa FutFudas",
    shortName: "FutFudas",
    description:
      "Campeonato à parte da Playball Pompeia, em jogo único: quem vence é campeão.",
    type: "cup",
  },
  {
    id: "copa-amstel",
    slug: "copa-amstel",
    name: "Copa Amstel de sábado",
    shortName: "Amstel",
    description:
      "Torneio de sábado no calendário competitivo do Clube Atlético Manochaco.",
    type: "cup",
  },
  {
    id: "chuteira",
    slug: "chuteira",
    name: "Chuteira",
    shortName: "Chuteira",
    description:
      "Competição que amplia o calendário do clube contra adversários tradicionais do futebol 7.",
    type: "league",
  },
  {
    id: "amistoso",
    slug: "amistoso",
    name: "Amistoso",
    shortName: "Amistoso",
    description:
      "Jogos de preparação, integração dos jogadores e testes para novas formações.",
    type: "friendly",
  },
];
