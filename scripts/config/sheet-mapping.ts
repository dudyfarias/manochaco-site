export type SheetMappingKind =
  | "competition_stats"
  | "season_validation"
  | "historical_validation"
  | "match_history"
  | "private"
  | "ignored";

export type SheetMapping = {
  sheetName: string;
  kind: SheetMappingKind;
  import: boolean;
  competitionSlug?: string;
  seasonSlug?: string;
  financial?: boolean;
  validationOnly?: boolean;
  notes?: string;
};

export const sheetMappings: SheetMapping[] = [
  {
    sheetName: "Estatística Histórica",
    kind: "historical_validation",
    import: true,
    validationOnly: true,
    notes: "Conferência dos totais históricos; nunca somar como campeonato.",
  },
  {
    sheetName: "Jogos Histórico",
    kind: "match_history",
    import: true,
  },
  {
    sheetName: "Estatística Geral 2025",
    kind: "season_validation",
    import: true,
    seasonSlug: "2025",
    validationOnly: true,
    notes: "Consolidação anual; não somar com as competições de 2025.",
  },
  {
    sheetName: "Estatística 2024",
    kind: "season_validation",
    import: true,
    seasonSlug: "2024",
    validationOnly: true,
    notes: "Consolidação anual; não somar com as competições de 2024.",
  },
  {
    sheetName: "LIGA 7 Estatística 2023",
    kind: "competition_stats",
    import: true,
    competitionSlug: "liga7-playball",
    seasonSlug: "2023",
  },
  {
    sheetName: "ESTRELATO Estatística 2024",
    kind: "competition_stats",
    import: true,
    competitionSlug: "estrelato",
    seasonSlug: "2024",
  },
  {
    sheetName: "LIGA 7 Estatística 2024",
    kind: "competition_stats",
    import: true,
    competitionSlug: "liga7-playball",
    seasonSlug: "2024",
  },
  {
    sheetName: "Liga 7 2025",
    kind: "competition_stats",
    import: true,
    competitionSlug: "liga7-playball",
    seasonSlug: "2025",
  },
  {
    sheetName: "AMSTEL1 Estatística 2025",
    kind: "competition_stats",
    import: true,
    competitionSlug: "copa-amstel",
    seasonSlug: "2025",
  },
  {
    sheetName: "Chuteira 2025",
    kind: "competition_stats",
    import: true,
    competitionSlug: "chuteira",
    seasonSlug: "2025",
  },
  {
    sheetName: "Amstel 2S 2025",
    kind: "private",
    import: false,
    financial: true,
    notes: "Lista de pagamentos, sem estatísticas esportivas.",
  },
  {
    sheetName: "Chuteira 1 2026",
    kind: "private",
    import: false,
    financial: true,
    notes: "Controle de pagamentos, sem estatísticas esportivas.",
  },
  {
    sheetName: "Amstel 1 2026",
    kind: "private",
    import: false,
    financial: true,
    notes: "Controle de pagamentos, sem estatísticas esportivas.",
  },
  { sheetName: "Página28", kind: "private", import: false, financial: true },
  { sheetName: "Financeiro 2023", kind: "private", import: false, financial: true },
  { sheetName: "Financeiro 2024", kind: "private", import: false, financial: true },
  { sheetName: "Financeiro 2025", kind: "private", import: false, financial: true },
  { sheetName: "MoneyChacos", kind: "private", import: false, financial: true },
];

const mappingsByName = new Map(
  sheetMappings.map((mapping) => [mapping.sheetName, mapping]),
);

export function getSheetMapping(sheetName: string) {
  return mappingsByName.get(sheetName);
}

export function getCompetitionStatMappings() {
  return sheetMappings.filter(
    (mapping) => mapping.kind === "competition_stats" && mapping.import,
  );
}

export function getValidationMappings() {
  return sheetMappings.filter(
    (mapping) =>
      (mapping.kind === "historical_validation" ||
        mapping.kind === "season_validation") &&
      mapping.import,
  );
}
