import type { Competition, CompetitionKind, CompetitionType } from "@/types";

export type SupabaseCompetitionRow = {
  id: string;
  slug: string;
  name: string;
  short_name?: string | null;
  description?: string | null;
  type?: string | null;
};

const competitionKindBySlug: Record<string, CompetitionKind> = {
  "liga7-playball": "liga7",
  liga7: "liga7",
  "copa-futfudas": "copa-futfudas",
  "copa-amstel": "copa-amstel",
  chuteira: "chuteira",
  estrelato: "estrelato",
  amistoso: "amistoso",
};

function toCompetitionKind(slug: string): CompetitionKind {
  return competitionKindBySlug[slug] ?? "amistoso";
}

function toCompetitionType(type?: string | null): CompetitionType {
  if (type === "league" || type === "cup" || type === "friendly") {
    return type;
  }

  return "other";
}

export function adaptCompetition(row: SupabaseCompetitionRow): Competition {
  return {
    id: row.slug,
    slug: toCompetitionKind(row.slug),
    name: row.name,
    shortName: row.short_name ?? row.name,
    description: row.description ?? "",
    type: toCompetitionType(row.type),
  };
}
