// Arquivo gerado automaticamente por scripts/import-manochaco-spreadsheet.ts.
// Fonte: planilha-manochaco.xlsx
// Gerado em: 2026-06-18T13:57:25.950Z
// Nao edite manualmente; rode npm run import:spreadsheet.

import type { Competition } from "@/types";

export const competitions: Competition[] = [
  {
    id: "liga7-playball",
    slug: "liga7",
    name: "Liga7 Playball",
    shortName: "Liga7",
    description: "Competição em que o Manochaco começou na Série D e chegou à Série B.",
    type: "league"
  },
  {
    id: "copa-futfudas",
    slug: "copa-futfudas",
    name: "Copa FutFudas",
    shortName: "FutFudas",
    description: "Campeonato à parte da Playball Pompeia, em formato de jogo único. O Manochaco já venceu duas vezes.",
    type: "cup"
  },
  {
    id: "copa-amstel",
    slug: "copa-amstel",
    name: "Copa Amstel de sábado",
    shortName: "Amstel",
    description: "Campeonato de sábado disputado atualmente pelo Manochaco.",
    type: "cup"
  },
  {
    id: "chuteira",
    slug: "chuteira",
    name: "Chuteira",
    shortName: "Chuteira",
    description: "Campeonato disputado atualmente pelo Manochaco.",
    type: "league"
  }
];
