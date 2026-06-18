import type { Album, PhotoCategory } from "@/types";
import type { SupabaseCompetitionRow } from "./competitionAdapter";

export type SupabaseAlbumRow = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  category?: string | null;
  cover_image_url?: string | null;
  match_id?: string | null;
  competition_id?: string | null;
  season_id?: string | null;
  date?: string | null;
};

const categories: PhotoCategory[] = [
  "match",
  "team",
  "training",
  "backstage",
  "title",
  "general",
];

function toCategory(category?: string | null): PhotoCategory {
  return categories.includes(category as PhotoCategory)
    ? (category as PhotoCategory)
    : "general";
}

export function adaptAlbum(
  row: SupabaseAlbumRow,
  relations: {
    competition?: SupabaseCompetitionRow;
    seasonSlug?: string;
    photoIds?: string[];
  } = {},
): Album {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    coverImage: row.cover_image_url ?? "/team/hero-home.jpg",
    category: toCategory(row.category),
    matchId: row.match_id ?? undefined,
    competitionSlug: relations.competition?.slug ?? row.competition_id ?? undefined,
    seasonSlug: relations.seasonSlug ?? row.season_id ?? undefined,
    date: row.date ? `${row.date}T12:00:00-03:00` : undefined,
    photoIds: relations.photoIds ?? [],
  };
}
