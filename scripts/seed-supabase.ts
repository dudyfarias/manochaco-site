import { createSupabaseServiceClient } from "../src/lib/supabase/service";
import {
  albums,
  competitions,
  matches,
  photoPlayers,
  photos,
  players,
  seasons,
} from "../src/data";

type IdSlugRow = {
  id: string;
  slug: string;
};

let supabase: ReturnType<typeof createSupabaseServiceClient>;
const isDryRun = process.argv.includes("--dry-run");

function toDate(value?: string) {
  return value ? value.slice(0, 10) : null;
}

async function upsertRows(
  table: string,
  rows: Record<string, unknown>[],
  onConflict: string,
) {
  if (rows.length === 0) {
    console.log(`- ${table}: nenhum registro para upsert`);
    return;
  }

  if (isDryRun) {
    console.log(`- ${table}: dry-run, ${rows.length} registros seriam enviados`);
    return;
  }

  const { error } = await supabase.from(table).upsert(rows, { onConflict });

  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }

  console.log(`- ${table}: ${rows.length} registros enviados`);
}

async function getIdBySlug(table: string) {
  const { data, error } = await supabase.from(table).select("id, slug");

  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }

  return new Map((data as IdSlugRow[]).map((row) => [row.slug, row.id]));
}

async function main() {
  supabase = createSupabaseServiceClient();

  console.log("Seed Supabase - Clube Atlético Manochaco");
  console.log("Usando apenas dados esportivos públicos locais.");
  console.log(
    "Atenção: este seed é carga inicial. Depois do admin em produção, rode com cuidado para não sobrescrever revisões manuais.",
  );

  if (isDryRun) {
    console.log("Modo dry-run ativo: nenhum dado será gravado.");
  }

  await upsertRows(
    "competitions",
    competitions.map((competition) => ({
      slug: competition.id,
      name: competition.name,
      short_name: competition.shortName,
      description: competition.description,
      type: competition.type,
    })),
    "slug",
  );

  await upsertRows(
    "seasons",
    seasons.map((season) => ({
      slug: season.slug,
      year: season.year,
      name: season.name,
      start_date: `${season.year}-01-01`,
      end_date: `${season.year}-12-31`,
    })),
    "slug",
  );

  await upsertRows(
    "players",
    players.map((player) => ({
      slug: player.slug,
      name: player.fullName,
      nickname: player.nickname,
      position: player.position,
      shirt_number: player.shirtNumber ?? player.number ?? null,
      status: player.status,
      profile_image_url: player.profileImage ?? player.image,
      bio: player.bio,
    })),
    "slug",
  );

  const competitionIdBySlug = await getIdBySlug("competitions");
  const seasonIdBySlug = await getIdBySlug("seasons");
  const playerIdBySlug = await getIdBySlug("players");

  const playedMatches = matches.filter((match) => match.status === "played" && match.result);
  const skippedMatches = matches.length - playedMatches.length;

  if (skippedMatches > 0) {
    console.log(`- matches: ${skippedMatches} jogos sem resultado foram ignorados`);
  }

  await upsertRows(
    "matches",
    playedMatches.map((match) => ({
      slug: match.slug,
      date: toDate(match.date),
      opponent: match.opponent ?? match.away.name,
      competition_id:
        competitionIdBySlug.get(match.competitionId) ??
        (match.competitionSlug ? competitionIdBySlug.get(match.competitionSlug) : null) ??
        null,
      season_id: match.seasonSlug ? seasonIdBySlug.get(match.seasonSlug) ?? null : null,
      manochaco_score: match.manochacoScore ?? match.home.score ?? 0,
      opponent_score: match.opponentScore ?? match.away.score ?? 0,
      result: match.result,
      stage: match.stage ?? match.round,
      location: match.location ?? match.venue,
      summary: match.summary,
      cover_image_url: match.image,
    })),
    "slug",
  );

  const matchIdBySlug = await getIdBySlug("matches");
  const matchIdByLocalId = new Map(
    matches
      .map((match) => [match.id, matchIdBySlug.get(match.slug)] as const)
      .filter((entry): entry is readonly [string, string] => Boolean(entry[1])),
  );

  await upsertRows(
    "albums",
    albums.map((album) => ({
      slug: album.slug,
      title: album.title,
      description: album.description ?? null,
      category: album.category,
      cover_image_url: album.coverImage,
      match_id: album.matchId ? matchIdByLocalId.get(album.matchId) ?? null : null,
      competition_id: album.competitionSlug
        ? competitionIdBySlug.get(album.competitionSlug) ?? null
        : null,
      season_id: album.seasonSlug ? seasonIdBySlug.get(album.seasonSlug) ?? null : null,
      date: toDate(album.date),
    })),
    "slug",
  );

  const albumIdBySlug = await getIdBySlug("albums");
  const albumIdByLocalId = new Map(
    albums
      .map((album) => [album.id, albumIdBySlug.get(album.slug)] as const)
      .filter((entry): entry is readonly [string, string] => Boolean(entry[1])),
  );

  await upsertRows(
    "photos",
    photos.map((photo) => ({
      slug: photo.slug,
      title: photo.title,
      description: photo.description ?? null,
      url: photo.url,
      alt: photo.alt,
      category: photo.category,
      album_id: photo.albumId ? albumIdByLocalId.get(photo.albumId) ?? null : null,
      match_id: photo.matchId ? matchIdByLocalId.get(photo.matchId) ?? null : null,
      competition_id: photo.competitionSlug
        ? competitionIdBySlug.get(photo.competitionSlug) ?? null
        : null,
      season_id: photo.seasonSlug ? seasonIdBySlug.get(photo.seasonSlug) ?? null : null,
      date: toDate(photo.date),
      uploaded_at: photo.uploadedAt ?? null,
      face_recognition_status: photo.faceRecognitionStatus,
      is_public: true,
    })),
    "slug",
  );

  const photoIdBySlug = await getIdBySlug("photos");
  const photoIdByLocalId = new Map(
    photos
      .map((photo) => [photo.id, photoIdBySlug.get(photo.slug)] as const)
      .filter((entry): entry is readonly [string, string] => Boolean(entry[1])),
  );

  const confirmedTags = photoPlayers.filter(
    (tag) =>
      tag.confirmedByAdmin &&
      (tag.tagType === "manual" || tag.tagType === "ai_confirmed"),
  );

  await upsertRows(
    "photo_player_tags",
    confirmedTags
      .map((tag) => {
        const photoId = photoIdByLocalId.get(tag.photoId);
        const playerId = playerIdBySlug.get(tag.playerSlug);

        if (!photoId || !playerId) {
          return null;
        }

        return {
          photo_id: photoId,
          player_id: playerId,
          tag_type: tag.tagType,
          confidence: tag.confidence ?? null,
          confirmed_by_admin: true,
          bounding_box: tag.boundingBox ?? null,
        };
      })
      .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag)),
    "photo_id,player_id",
  );

  console.log("Seed concluído. Dados financeiros não foram processados.");
}

main().catch((error) => {
  console.error("Falha no seed Supabase:");
  console.error(error);
  process.exit(1);
});
