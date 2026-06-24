"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminRole } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth";
import {
  getFaceRecognitionProvider,
  getFaceRecognitionProviderName,
  type FaceRecognitionProviderName,
} from "@/lib/face-recognition";
import { refreshPhotoRecognitionReviewStatus } from "@/lib/face-recognition/process-photo";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logAudit } from "./audit";
import { getAdminSupabase } from "./data";
import {
  adminMessageHref,
  calculateMatchResult,
  formString,
  nullableNumber,
  nullableString,
  requiredString,
  safeFileName,
  safeSlugFromForm,
  slugify,
} from "./utils";

const sportsRoles: AdminRole[] = ["super_admin", "sports_admin"];
const photoRoles: AdminRole[] = ["super_admin", "sports_admin", "photo_editor"];

function knownFaceProvider(value: unknown): value is FaceRecognitionProviderName {
  return ["aws", "mock", "faceapi", "insightface"].includes(String(value));
}

async function removeProviderFaceBestEffort(
  providerName: unknown,
  providerFaceId: string | null,
) {
  if (!providerFaceId || !knownFaceProvider(providerName)) return;

  try {
    const provider = await getFaceRecognitionProvider(providerName);
    await provider.deleteIndexedFace(providerFaceId);
  } catch (error) {
    console.error("[face-recognition] Falha ao limpar índice externo", error);
  }
}

async function revalidatePublicPhotoRelations(
  supabase: SupabaseClient,
  photoId: string,
  playerIds: string[] = [],
) {
  const [{ data: photo }, playersResult] = await Promise.all([
    supabase.from("photos").select("slug").eq("id", photoId).maybeSingle(),
    playerIds.length > 0
      ? supabase.from("players").select("slug").in("id", [...new Set(playerIds)])
      : Promise.resolve({ data: [] as { slug: string }[] }),
  ]);

  revalidatePath("/");
  revalidatePath("/galeria");

  if (photo?.slug) {
    revalidatePath(`/fotos/${photo.slug}`);
  }

  for (const player of playersResult.data ?? []) {
    if (player.slug) revalidatePath(`/jogadores/${player.slug}`);
  }
}

function embeddingFromSuggestionRaw(rawResponse: unknown) {
  if (!rawResponse || typeof rawResponse !== "object") return null;
  const value = (rawResponse as Record<string, unknown>).faceEmbedding;
  if (!Array.isArray(value) || value.length === 0) return null;
  const embedding = value.map(Number);
  return embedding.every(Number.isFinite) ? embedding : null;
}

async function saveSupervisedFaceReference(
  supabase: SupabaseClient,
  suggestion: {
    id: string;
    photo_id: string;
    provider: string | null;
    provider_face_id: string | null;
    bounding_box: unknown;
    raw_response: unknown;
  },
  playerId: string,
) {
  const embedding = embeddingFromSuggestionRaw(suggestion.raw_response);
  if (!embedding || suggestion.provider !== "insightface") return null;

  const raw = suggestion.raw_response as Record<string, unknown>;
  const model = typeof raw.model === "string" ? raw.model : "buffalo_l";
  const { data: photo, error: photoError } = await supabase
    .from("photos")
    .select("url")
    .eq("id", suggestion.photo_id)
    .single();
  if (photoError || !photo?.url) throw photoError ?? new Error("Foto de origem ausente.");

  const { data: existing, error: existingError } = await supabase
    .from("player_face_references")
    .select("id")
    .eq("source_suggestion_id", suggestion.id)
    .maybeSingle();
  if (existingError) throw existingError;

  const now = new Date().toISOString();
  const referencePayload = {
    player_id: playerId,
    image_url: photo.url,
    storage_path: null,
    provider: "insightface",
    provider_face_id: suggestion.provider_face_id,
    provider_collection_id: model,
    embedding: null,
    embedding_model: model,
    embedding_generated_at: now,
    source_photo_id: suggestion.photo_id,
    source_suggestion_id: suggestion.id,
    source_bounding_box: suggestion.bounding_box,
    source_kind: "confirmed_photo_tag",
    approved_for_recognition: true,
    consent_given: true,
    indexing_status: "indexed",
    indexing_error: null,
    indexed_at: now,
  };

  let referenceId = existing?.id;
  if (referenceId) {
    const { error } = await supabase
      .from("player_face_references")
      .update(referencePayload)
      .eq("id", referenceId);
    if (error) throw error;
  } else {
    const { data, error } = await supabase
      .from("player_face_references")
      .insert(referencePayload)
      .select("id")
      .single();
    if (error) throw error;
    referenceId = data.id;
  }

  const { error: embeddingError } = await supabase
    .from("player_face_embeddings")
    .upsert(
      {
        player_id: playerId,
        face_reference_id: referenceId,
        embedding,
        embedding_model: model,
        provider: "insightface",
        consent_given: true,
        approved_for_recognition: true,
      },
      { onConflict: "face_reference_id" },
    );
  if (embeddingError) throw embeddingError;
  return referenceId;
}

function ensureStatus(value: string) {
  return ["active", "former", "staff"].includes(value) ? value : "active";
}

function ensureCompetitionType(value: string) {
  return ["league", "cup", "friendly", "other"].includes(value) ? value : "other";
}

function ensurePhotoCategory(value: string) {
  return ["match", "team", "training", "backstage", "title", "general"].includes(value)
    ? value
    : "general";
}

function ensureAccountType(value: string) {
  return ["supporter", "player", "candidate", "partner"].includes(value)
    ? value
    : "supporter";
}

function ensureMemberStatus(value: string) {
  return ["pending", "active", "rejected", "blocked"].includes(value)
    ? value
    : "pending";
}

async function uploadPhotoIfPresent(formData: FormData) {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("O arquivo enviado precisa ser uma imagem.");
  }

  if (file.size > 8 * 1024 * 1024) {
    throw new Error("A imagem deve ter no máximo 8MB.");
  }

  const supabase = await getAdminSupabase();
  const year =
    nullableString(formData, "date")?.slice(0, 4) ??
    String(new Date().getFullYear());
  const category = ensurePhotoCategory(formString(formData, "category"));
  const safeName = safeFileName(file.name);
  const path = `photos/${year}/${category}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage.from("photos").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(`Upload falhou: ${error.message}`);
  }

  const { data } = supabase.storage.from("photos").getPublicUrl(path);
  return data.publicUrl;
}

async function validateFaceReferenceFile(file: File) {
  if (!new Set(["image/jpeg", "image/png"]).has(file.type)) {
    throw new Error("A referência facial precisa ser uma imagem JPEG ou PNG.");
  }

  if (file.size === 0 || file.size > 5 * 1024 * 1024) {
    throw new Error("A referência facial deve ter no máximo 5MB.");
  }

  const signature = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const isJpeg = signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff;
  const isPng =
    signature[0] === 0x89 &&
    signature[1] === 0x50 &&
    signature[2] === 0x4e &&
    signature[3] === 0x47 &&
    signature[4] === 0x0d &&
    signature[5] === 0x0a &&
    signature[6] === 0x1a &&
    signature[7] === 0x0a;

  if (!isJpeg && !isPng) {
    throw new Error("O conteúdo do arquivo não corresponde a uma imagem JPEG ou PNG válida.");
  }
}

export async function logoutAdmin() {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/entrar?loggedOut=1");
}

export async function createPlayer(formData: FormData) {
  const context = await requireAdmin(sportsRoles);
  const supabase = await getAdminSupabase();
  const name = requiredString(formData, "name", "Nome");
  const nickname = requiredString(formData, "nickname", "Apelido");
  const slug = safeSlugFromForm(formData, "nickname");

  const { data, error } = await supabase
    .from("players")
    .insert({
      name,
      nickname,
      slug,
      position: nullableString(formData, "position"),
      shirt_number: nullableNumber(formData, "shirt_number"),
      dominant_foot: nullableString(formData, "dominant_foot"),
      status: ensureStatus(formString(formData, "status")),
      profile_image_url: nullableString(formData, "profile_image_url"),
      bio: nullableString(formData, "bio"),
    })
    .select("id")
    .single();

  if (error) {
    redirect(adminMessageHref("/admin/jogadores/novo", "error", error.message));
  }

  await logAudit(context, "create", "players", data.id, { slug });
  revalidatePath("/jogadores");
  redirect(adminMessageHref(`/admin/jogadores/${data.id}`, "saved", "created"));
}

export async function updatePlayer(formData: FormData) {
  const context = await requireAdmin(sportsRoles);
  const supabase = await getAdminSupabase();
  const id = requiredString(formData, "id", "ID");
  const name = requiredString(formData, "name", "Nome");
  const nickname = requiredString(formData, "nickname", "Apelido");
  const slug = safeSlugFromForm(formData, "nickname");

  const { error } = await supabase
    .from("players")
    .update({
      name,
      nickname,
      slug,
      position: nullableString(formData, "position"),
      shirt_number: nullableNumber(formData, "shirt_number"),
      dominant_foot: nullableString(formData, "dominant_foot"),
      status: ensureStatus(formString(formData, "status")),
      profile_image_url: nullableString(formData, "profile_image_url"),
      bio: nullableString(formData, "bio"),
    })
    .eq("id", id);

  if (error) {
    redirect(adminMessageHref(`/admin/jogadores/${id}`, "error", error.message));
  }

  await logAudit(context, "update", "players", id, { slug });
  revalidatePath("/jogadores");
  redirect(adminMessageHref(`/admin/jogadores/${id}`, "saved", "updated"));
}

export async function deactivatePlayer(formData: FormData) {
  const context = await requireAdmin(sportsRoles);
  const supabase = await getAdminSupabase();
  const id = requiredString(formData, "id", "ID");

  const { error } = await supabase
    .from("players")
    .update({ status: "former" })
    .eq("id", id);

  if (error) {
    redirect(adminMessageHref(`/admin/jogadores/${id}`, "error", error.message));
  }

  await logAudit(context, "deactivate", "players", id);
  revalidatePath("/jogadores");
  redirect(adminMessageHref(`/admin/jogadores/${id}`, "saved", "deactivated"));
}

export async function reviewMemberProfile(formData: FormData) {
  const context = await requireAdmin(sportsRoles);
  const supabase = await getAdminSupabase();
  const id = requiredString(formData, "id", "Cadastro");
  const status = ensureMemberStatus(formString(formData, "status"));
  const accountType = ensureAccountType(formString(formData, "account_type"));
  const linkedPlayerId = nullableString(formData, "linked_player_id");

  const { error } = await supabase
    .from("member_profiles")
    .update({
      status,
      account_type: accountType,
      linked_player_id: linkedPlayerId,
    })
    .eq("id", id);

  if (error) {
    redirect(adminMessageHref("/admin/cadastros", "error", error.message));
  }

  await logAudit(context, "review", "member_profiles", id, {
    status,
    accountType,
    linkedPlayerId,
  });
  revalidatePath("/admin/cadastros");
  revalidatePath("/conta");
  redirect(adminMessageHref("/admin/cadastros", "saved", "reviewed"));
}

export async function addPlayerFaceReference(formData: FormData) {
  const context = await requireAdmin(photoRoles);
  const supabase = await getAdminSupabase();
  const playerId = requiredString(formData, "player_id", "Jogador");
  const playerSlug = requiredString(formData, "player_slug", "Slug do jogador");
  const file = formData.get("file");

  if (!(file instanceof File)) {
    redirect(adminMessageHref(`/admin/jogadores/${playerId}`, "error", "Selecione uma imagem."));
  }

  try {
    await validateFaceReferenceFile(file);
  } catch (validationError) {
    const message =
      validationError instanceof Error ? validationError.message : "Imagem inválida.";
    redirect(adminMessageHref(`/admin/jogadores/${playerId}`, "error", message));
  }
  const storagePath = `${slugify(playerSlug)}/${Date.now()}-${safeFileName(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from("face-references")
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    redirect(adminMessageHref(`/admin/jogadores/${playerId}`, "error", uploadError.message));
  }

  const { data, error } = await supabase
    .from("player_face_references")
    .insert({
      player_id: playerId,
      image_url: `storage://face-references/${storagePath}`,
      storage_path: storagePath,
      provider: getFaceRecognitionProviderName(),
      approved_for_recognition: true,
      consent_given: true,
      indexing_status: "not_indexed",
    })
    .select("id")
    .single();

  if (error) {
    await supabase.storage.from("face-references").remove([storagePath]);
    redirect(adminMessageHref(`/admin/jogadores/${playerId}`, "error", error.message));
  }

  await logAudit(context, "add_face_reference", "player_face_references", data.id, {
    playerId,
    consentGiven: true,
    approvedForRecognition: true,
    consentSource: "player-registration-prerequisite",
  });
  redirect(adminMessageHref(`/admin/jogadores/${playerId}`, "saved", "face-reference"));
}

export async function updatePlayerFaceReferenceConsent(formData: FormData) {
  const context = await requireAdmin(photoRoles);
  const supabase = await getAdminSupabase();
  const id = requiredString(formData, "id", "Referência");
  const playerId = requiredString(formData, "player_id", "Jogador");
  const consentGiven = formData.get("consent_given") === "on";
  const approvedForRecognition =
    formData.get("approved_for_recognition") === "on";
  const [{ data, error }, embeddingResult] = await Promise.all([
    supabase
      .from("player_face_references")
      .select("provider, provider_face_id, embedding")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("player_face_embeddings")
      .select("id")
      .eq("face_reference_id", id)
      .maybeSingle(),
  ]);

  if (error || !data) {
    redirect(
      adminMessageHref(
        `/admin/jogadores/${playerId}`,
        "error",
        error?.message ?? "Referência não encontrada.",
      ),
    );
  }

  if (embeddingResult.error) {
    redirect(
      adminMessageHref(
        `/admin/jogadores/${playerId}`,
        "error",
        embeddingResult.error.message,
      ),
    );
  }

  const revokingIndexedReference =
    Boolean(data.provider_face_id || data.embedding || embeddingResult.data) &&
    (!consentGiven || !approvedForRecognition);

  if (revokingIndexedReference) {
    await removeProviderFaceBestEffort(data.provider, data.provider_face_id);
    const { error: embeddingDeleteError } = await supabase
      .from("player_face_embeddings")
      .delete()
      .eq("face_reference_id", id);
    if (embeddingDeleteError) {
      redirect(
        adminMessageHref(`/admin/jogadores/${playerId}`, "error", embeddingDeleteError.message),
      );
    }
  }

  const { error: updateError } = await supabase
    .from("player_face_references")
    .update({
      consent_given: consentGiven,
      approved_for_recognition: approvedForRecognition,
      ...(revokingIndexedReference
        ? {
            provider_face_id: null,
            provider_collection_id: null,
            embedding: null,
            embedding_model: null,
            embedding_generated_at: null,
            indexed_at: null,
            indexing_status: "not_indexed",
            indexing_error: null,
          }
        : {}),
    })
    .eq("id", id);

  if (updateError) {
    redirect(adminMessageHref(`/admin/jogadores/${playerId}`, "error", updateError.message));
  }

  await logAudit(context, "update_face_reference_consent", "player_face_references", id, {
    playerId,
    consentGiven,
    approvedForRecognition,
    removedProviderFace: revokingIndexedReference,
  });
  redirect(adminMessageHref(`/admin/jogadores/${playerId}`, "saved", "face-consent"));
}

export async function removePlayerFaceReference(formData: FormData) {
  const context = await requireAdmin(photoRoles);
  const supabase = await getAdminSupabase();
  const id = requiredString(formData, "id", "Referência");
  const playerId = requiredString(formData, "player_id", "Jogador");
  const { data, error } = await supabase
    .from("player_face_references")
    .select("storage_path, provider, provider_face_id")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    redirect(
      adminMessageHref(
        `/admin/jogadores/${playerId}`,
        "error",
        error?.message ?? "Referência não encontrada.",
      ),
    );
  }

  await removeProviderFaceBestEffort(data.provider, data.provider_face_id);

  if (data.storage_path) {
    const { error: storageError } = await supabase.storage
      .from("face-references")
      .remove([data.storage_path]);

    if (storageError) {
      redirect(adminMessageHref(`/admin/jogadores/${playerId}`, "error", storageError.message));
    }
  }

  const { error: deleteError } = await supabase
    .from("player_face_references")
    .delete()
    .eq("id", id);

  if (deleteError) {
    redirect(adminMessageHref(`/admin/jogadores/${playerId}`, "error", deleteError.message));
  }

  await logAudit(context, "remove_face_reference", "player_face_references", id, {
    playerId,
  });
  redirect(adminMessageHref(`/admin/jogadores/${playerId}`, "saved", "face-reference-removed"));
}

export async function saveCompetition(formData: FormData) {
  const context = await requireAdmin(sportsRoles);
  const supabase = await getAdminSupabase();
  const id = formString(formData, "id");
  const name = requiredString(formData, "name", "Nome");
  const slug = safeSlugFromForm(formData, "name");
  const payload = {
    name,
    slug,
    short_name: nullableString(formData, "short_name"),
    description: nullableString(formData, "description"),
    type: ensureCompetitionType(formString(formData, "type")),
  };

  const query = id
    ? supabase.from("competitions").update(payload).eq("id", id).select("id").single()
    : supabase.from("competitions").insert(payload).select("id").single();
  const { data, error } = await query;

  if (error) {
    redirect(adminMessageHref("/admin/campeonatos", "error", error.message));
  }

  await logAudit(context, id ? "update" : "create", "competitions", data.id, {
    slug,
  });
  revalidatePath("/campeonatos");
  redirect(adminMessageHref("/admin/campeonatos", "saved", id ? "updated" : "created"));
}

export async function saveSeason(formData: FormData) {
  const context = await requireAdmin(sportsRoles);
  const supabase = await getAdminSupabase();
  const id = formString(formData, "id");
  const year = nullableNumber(formData, "year");
  const name = requiredString(formData, "name", "Nome");
  const slug = safeSlugFromForm(formData, "name");

  if (!year) {
    redirect(adminMessageHref("/admin/temporadas", "error", "Ano inválido."));
  }

  const payload = {
    year,
    name,
    slug,
    start_date: nullableString(formData, "start_date"),
    end_date: nullableString(formData, "end_date"),
  };
  const query = id
    ? supabase.from("seasons").update(payload).eq("id", id).select("id").single()
    : supabase.from("seasons").insert(payload).select("id").single();
  const { data, error } = await query;

  if (error) {
    redirect(adminMessageHref("/admin/temporadas", "error", error.message));
  }

  await logAudit(context, id ? "update" : "create", "seasons", data.id, {
    slug,
  });
  revalidatePath("/jogos");
  redirect(adminMessageHref("/admin/temporadas", "saved", id ? "updated" : "created"));
}

export async function createMatch(formData: FormData) {
  const context = await requireAdmin(sportsRoles);
  const supabase = await getAdminSupabase();
  const opponent = requiredString(formData, "opponent", "Adversário");
  const date = nullableString(formData, "date");
  const manochacoScore = nullableNumber(formData, "manochaco_score") ?? 0;
  const opponentScore = nullableNumber(formData, "opponent_score") ?? 0;
  const result = calculateMatchResult(manochacoScore, opponentScore);
  const slug =
    formString(formData, "slug") ||
    slugify(`manochaco-vs-${opponent}-${date ?? new Date().toISOString().slice(0, 10)}`);

  const { data, error } = await supabase
    .from("matches")
    .insert({
      slug,
      date,
      opponent,
      competition_id: nullableString(formData, "competition_id"),
      season_id: nullableString(formData, "season_id"),
      manochaco_score: manochacoScore,
      opponent_score: opponentScore,
      result,
      stage: nullableString(formData, "stage"),
      location: nullableString(formData, "location"),
      summary: nullableString(formData, "summary"),
      cover_image_url: nullableString(formData, "cover_image_url"),
    })
    .select("id")
    .single();

  if (error) {
    redirect(adminMessageHref("/admin/jogos/novo", "error", error.message));
  }

  await logAudit(context, "create", "matches", data.id, { slug, result });
  revalidatePath("/jogos");
  redirect(adminMessageHref(`/admin/jogos/${data.id}`, "saved", "created"));
}

export async function updateMatch(formData: FormData) {
  const context = await requireAdmin(sportsRoles);
  const supabase = await getAdminSupabase();
  const id = requiredString(formData, "id", "ID");
  const opponent = requiredString(formData, "opponent", "Adversário");
  const manochacoScore = nullableNumber(formData, "manochaco_score") ?? 0;
  const opponentScore = nullableNumber(formData, "opponent_score") ?? 0;
  const result = calculateMatchResult(manochacoScore, opponentScore);

  const { error } = await supabase
    .from("matches")
    .update({
      slug: safeSlugFromForm(formData, "opponent"),
      date: nullableString(formData, "date"),
      opponent,
      competition_id: nullableString(formData, "competition_id"),
      season_id: nullableString(formData, "season_id"),
      manochaco_score: manochacoScore,
      opponent_score: opponentScore,
      result,
      stage: nullableString(formData, "stage"),
      location: nullableString(formData, "location"),
      summary: nullableString(formData, "summary"),
      cover_image_url: nullableString(formData, "cover_image_url"),
    })
    .eq("id", id);

  if (error) {
    redirect(adminMessageHref(`/admin/jogos/${id}`, "error", error.message));
  }

  await logAudit(context, "update", "matches", id, { result });
  revalidatePath("/jogos");
  redirect(adminMessageHref(`/admin/jogos/${id}`, "saved", "updated"));
}

export async function savePlayerMatchStat(formData: FormData) {
  const context = await requireAdmin(sportsRoles);
  const supabase = await getAdminSupabase();
  const matchId = requiredString(formData, "match_id", "Partida");
  const playerId = requiredString(formData, "player_id", "Jogador");

  const { data, error } = await supabase
    .from("player_match_stats")
    .upsert(
      {
        match_id: matchId,
        player_id: playerId,
        was_present: formData.get("was_present") === "on",
        goals: nullableNumber(formData, "goals") ?? 0,
        assists: nullableNumber(formData, "assists") ?? 0,
        yellow_cards: nullableNumber(formData, "yellow_cards") ?? 0,
        red_cards: nullableNumber(formData, "red_cards") ?? 0,
        was_goalkeeper: formData.get("was_goalkeeper") === "on",
        goals_conceded: nullableNumber(formData, "goals_conceded"),
      },
      { onConflict: "player_id,match_id" },
    )
    .select("id")
    .single();

  if (error) {
    redirect(adminMessageHref(`/admin/jogos/${matchId}`, "error", error.message));
  }

  await logAudit(context, "upsert", "player_match_stats", data.id, {
    matchId,
    playerId,
  });
  revalidatePath("/estatisticas");
  redirect(adminMessageHref(`/admin/jogos/${matchId}`, "saved", "stat"));
}

export async function deletePlayerMatchStat(formData: FormData) {
  const context = await requireAdmin(sportsRoles);
  const supabase = await getAdminSupabase();
  const id = requiredString(formData, "id", "ID");
  const matchId = requiredString(formData, "match_id", "Partida");

  const { error } = await supabase.from("player_match_stats").delete().eq("id", id);

  if (error) {
    redirect(adminMessageHref(`/admin/jogos/${matchId}`, "error", error.message));
  }

  await logAudit(context, "delete", "player_match_stats", id, { matchId });
  revalidatePath("/estatisticas");
  redirect(adminMessageHref(`/admin/jogos/${matchId}`, "saved", "stat-deleted"));
}

export async function saveAlbum(formData: FormData) {
  const context = await requireAdmin(photoRoles);
  const supabase = await getAdminSupabase();
  const id = formString(formData, "id");
  const title = requiredString(formData, "title", "Título");
  const slug = safeSlugFromForm(formData, "title");
  const payload = {
    title,
    slug,
    description: nullableString(formData, "description"),
    category: ensurePhotoCategory(formString(formData, "category")),
    cover_image_url: nullableString(formData, "cover_image_url"),
    match_id: nullableString(formData, "match_id"),
    competition_id: nullableString(formData, "competition_id"),
    season_id: nullableString(formData, "season_id"),
    date: nullableString(formData, "date"),
  };
  const query = id
    ? supabase.from("albums").update(payload).eq("id", id).select("id").single()
    : supabase.from("albums").insert(payload).select("id").single();
  const { data, error } = await query;

  if (error) {
    redirect(adminMessageHref("/admin/galeria/albuns", "error", error.message));
  }

  await logAudit(context, id ? "update" : "create", "albums", data.id, { slug });
  revalidatePath("/galeria");
  redirect(adminMessageHref("/admin/galeria/albuns", "saved", id ? "updated" : "created"));
}

export async function createPhoto(formData: FormData) {
  const context = await requireAdmin(photoRoles);
  const supabase = await getAdminSupabase();
  const title = requiredString(formData, "title", "Título");
  const uploadedUrl = await uploadPhotoIfPresent(formData);
  const url = uploadedUrl ?? requiredString(formData, "url", "URL da foto");
  const slug = safeSlugFromForm(formData, "title");

  const { data, error } = await supabase
    .from("photos")
    .insert({
      slug,
      title,
      description: nullableString(formData, "description"),
      url,
      alt: nullableString(formData, "alt") ?? title,
      category: ensurePhotoCategory(formString(formData, "category")),
      album_id: nullableString(formData, "album_id"),
      match_id: nullableString(formData, "match_id"),
      competition_id: nullableString(formData, "competition_id"),
      season_id: nullableString(formData, "season_id"),
      date: nullableString(formData, "date"),
      face_recognition_status: "not_processed",
      is_public: formData.get("is_public") === "on",
    })
    .select("id")
    .single();

  if (error) {
    redirect(adminMessageHref("/admin/galeria/fotos", "error", error.message));
  }

  await logAudit(context, "create", "photos", data.id, { slug });
  revalidatePath("/galeria");
  redirect(adminMessageHref(`/admin/galeria/fotos/${data.id}`, "saved", "created"));
}

export async function updatePhoto(formData: FormData) {
  const context = await requireAdmin(photoRoles);
  const supabase = await getAdminSupabase();
  const id = requiredString(formData, "id", "ID");
  const title = requiredString(formData, "title", "Título");
  const uploadedUrl = await uploadPhotoIfPresent(formData);

  const { error } = await supabase
    .from("photos")
    .update({
      slug: safeSlugFromForm(formData, "title"),
      title,
      description: nullableString(formData, "description"),
      url: uploadedUrl ?? requiredString(formData, "url", "URL da foto"),
      alt: nullableString(formData, "alt") ?? title,
      category: ensurePhotoCategory(formString(formData, "category")),
      album_id: nullableString(formData, "album_id"),
      match_id: nullableString(formData, "match_id"),
      competition_id: nullableString(formData, "competition_id"),
      season_id: nullableString(formData, "season_id"),
      date: nullableString(formData, "date"),
      is_public: formData.get("is_public") === "on",
    })
    .eq("id", id);

  if (error) {
    redirect(adminMessageHref(`/admin/galeria/fotos/${id}`, "error", error.message));
  }

  await logAudit(context, "update", "photos", id);
  revalidatePath("/galeria");
  redirect(adminMessageHref(`/admin/galeria/fotos/${id}`, "saved", "updated"));
}

export async function addPhotoPlayerTag(formData: FormData) {
  const context = await requireAdmin(photoRoles);
  const supabase = await getAdminSupabase();
  const photoId = requiredString(formData, "photo_id", "Foto");
  const playerId = requiredString(formData, "player_id", "Jogador");

  const { data, error } = await supabase
    .from("photo_player_tags")
    .upsert(
      {
        photo_id: photoId,
        player_id: playerId,
        tag_type: "manual",
        confirmed_by_admin: true,
      },
      { onConflict: "photo_id,player_id" },
    )
    .select("id")
    .single();

  if (error) {
    redirect(adminMessageHref(`/admin/galeria/fotos/${photoId}`, "error", error.message));
  }

  await logAudit(context, "manual_tag", "photo_player_tags", data.id, {
    photoId,
    playerId,
  });
  await revalidatePublicPhotoRelations(supabase, photoId, [playerId]);
  redirect(adminMessageHref(`/admin/galeria/fotos/${photoId}`, "saved", "tag"));
}

export async function removePhotoPlayerTag(formData: FormData) {
  const context = await requireAdmin(photoRoles);
  const supabase = await getAdminSupabase();
  const id = requiredString(formData, "id", "ID");
  const photoId = requiredString(formData, "photo_id", "Foto");

  const { data: existingTag } = await supabase
    .from("photo_player_tags")
    .select("player_id")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("photo_player_tags").delete().eq("id", id);

  if (error) {
    redirect(adminMessageHref(`/admin/galeria/fotos/${photoId}`, "error", error.message));
  }

  await logAudit(context, "remove_tag", "photo_player_tags", id, { photoId });
  await revalidatePublicPhotoRelations(
    supabase,
    photoId,
    existingTag?.player_id ? [existingTag.player_id] : [],
  );
  redirect(adminMessageHref(`/admin/galeria/fotos/${photoId}`, "saved", "tag-removed"));
}

export async function markPhotoRecognitionPending(formData: FormData) {
  const context = await requireAdmin(photoRoles);
  const supabase = await getAdminSupabase();
  const photoId = requiredString(formData, "photo_id", "Foto");
  const { error } = await supabase
    .from("photos")
    .update({ face_recognition_status: "not_processed" })
    .eq("id", photoId);

  if (error) {
    redirect(adminMessageHref(`/admin/galeria/fotos/${photoId}`, "error", error.message));
  }

  await logAudit(context, "mark_face_recognition_pending", "photos", photoId);
  revalidatePath("/admin/reconhecimento-facial");
  revalidatePath("/admin/diagnostico/fotos");
  revalidatePath("/admin/fotos/revisao");
  redirect(adminMessageHref(`/admin/galeria/fotos/${photoId}`, "saved", "queued"));
}

export async function confirmFaceSuggestion(formData: FormData) {
  const context = await requireAdmin(photoRoles);
  const supabase = await getAdminSupabase();
  const id = requiredString(formData, "id", "Sugestão");

  const { data: suggestion, error: suggestionError } = await supabase
    .from("face_detection_suggestions")
    .select("id, photo_id, suggested_player_id, confidence, bounding_box")
    .eq("id", id)
    .single();

  if (suggestionError || !suggestion?.suggested_player_id) {
    redirect(adminMessageHref("/admin/fotos/revisao", "error", "Sugestão inválida."));
  }

  const { data: tag, error: tagError } = await supabase.from("photo_player_tags").upsert(
    {
      photo_id: suggestion.photo_id,
      player_id: suggestion.suggested_player_id,
      tag_type: "ai_confirmed",
      confidence: suggestion.confidence,
      bounding_box: suggestion.bounding_box,
      confirmed_by_admin: true,
    },
    { onConflict: "photo_id,player_id" },
  ).select("id").single();

  if (tagError) {
    redirect(adminMessageHref("/admin/fotos/revisao", "error", tagError.message));
  }

  const { error: updateSuggestionError } = await supabase
    .from("face_detection_suggestions")
    .update({ status: "confirmed" })
    .eq("id", id);

  if (updateSuggestionError) {
    redirect(adminMessageHref("/admin/fotos/revisao", "error", updateSuggestionError.message));
  }
  await refreshPhotoRecognitionReviewStatus(supabase, suggestion.photo_id);
  await logAudit(context, "confirm_ai_suggestion", "face_detection_suggestions", id, {
    photoId: suggestion.photo_id,
    playerId: suggestion.suggested_player_id,
    tagId: tag.id,
  });
  console.info("[face-recognition] sugestão confirmada", {
    suggestionId: id,
    tagId: tag.id,
    photoId: suggestion.photo_id,
    playerId: suggestion.suggested_player_id,
  });
  await revalidatePublicPhotoRelations(supabase, suggestion.photo_id, [
    suggestion.suggested_player_id,
  ]);
  revalidatePath("/admin/reconhecimento-facial");
  revalidatePath("/admin/diagnostico/fotos");
  redirect(adminMessageHref("/admin/fotos/revisao", "saved", "confirmed"));
}

export async function changeFaceSuggestion(formData: FormData) {
  const context = await requireAdmin(photoRoles);
  const supabase = await getAdminSupabase();
  const id = requiredString(formData, "id", "Sugestão");
  const playerId = requiredString(formData, "player_id", "Jogador");

  const { data: suggestion, error: suggestionError } = await supabase
    .from("face_detection_suggestions")
    .select(
      "id, photo_id, suggested_player_id, confidence, bounding_box, status, provider, provider_face_id, raw_response",
    )
    .eq("id", id)
    .single();

  if (suggestionError || !suggestion) {
    redirect(adminMessageHref("/admin/fotos/revisao", "error", "Sugestão inválida."));
  }

  if (
    suggestion.suggested_player_id &&
    suggestion.suggested_player_id !== playerId
  ) {
    const { error: staleTagError } = await supabase
      .from("photo_player_tags")
      .delete()
      .eq("photo_id", suggestion.photo_id)
      .eq("player_id", suggestion.suggested_player_id)
      .eq("tag_type", "ai_confirmed");

    if (staleTagError) {
      redirect(adminMessageHref("/admin/fotos/revisao", "error", staleTagError.message));
    }
  }

  const { data: tag, error: tagError } = await supabase.from("photo_player_tags").upsert(
    {
      photo_id: suggestion.photo_id,
      player_id: playerId,
      tag_type: "ai_confirmed",
      confidence: suggestion.confidence,
      bounding_box: suggestion.bounding_box,
      confirmed_by_admin: true,
    },
    { onConflict: "photo_id,player_id" },
  ).select("id").single();

  if (tagError) {
    redirect(adminMessageHref("/admin/fotos/revisao", "error", tagError.message));
  }

  let learnedReferenceId: string | null = null;
  try {
    learnedReferenceId = await saveSupervisedFaceReference(supabase, suggestion, playerId);
  } catch (error) {
    redirect(
      adminMessageHref(
        "/admin/fotos/revisao",
        "error",
        error instanceof Error ? error.message : "Falha ao aprender o novo rosto.",
      ),
    );
  }

  const { error: updateSuggestionError } = await supabase
    .from("face_detection_suggestions")
    .update({ status: "changed", suggested_player_id: playerId })
    .eq("id", id);

  if (updateSuggestionError) {
    redirect(adminMessageHref("/admin/fotos/revisao", "error", updateSuggestionError.message));
  }
  await refreshPhotoRecognitionReviewStatus(supabase, suggestion.photo_id);
  await logAudit(context, "change_ai_suggestion", "face_detection_suggestions", id, {
    photoId: suggestion.photo_id,
    playerId,
    previousPlayerId: suggestion.suggested_player_id,
    tagId: tag.id,
    learnedReferenceId,
  });
  console.info("[face-recognition] sugestão alterada e confirmada", {
    suggestionId: id,
    tagId: tag.id,
    photoId: suggestion.photo_id,
    playerId,
  });
  await revalidatePublicPhotoRelations(
    supabase,
    suggestion.photo_id,
    [playerId, suggestion.suggested_player_id].filter(
      (value): value is string => Boolean(value),
    ),
  );
  revalidatePath("/admin/reconhecimento-facial");
  revalidatePath("/admin/diagnostico/fotos");
  redirect(adminMessageHref("/admin/fotos/revisao", "saved", "changed"));
}

export async function ignoreFaceSuggestion(formData: FormData) {
  const context = await requireAdmin(photoRoles);
  const supabase = await getAdminSupabase();
  const id = requiredString(formData, "id", "Sugestão");

  const { data: suggestion, error: suggestionError } = await supabase
    .from("face_detection_suggestions")
    .select("photo_id")
    .eq("id", id)
    .maybeSingle();

  if (suggestionError || !suggestion) {
    redirect(adminMessageHref("/admin/fotos/revisao", "error", "Sugestão inválida."));
  }

  const { error } = await supabase
    .from("face_detection_suggestions")
    .update({ status: "ignored" })
    .eq("id", id);

  if (error) {
    redirect(adminMessageHref("/admin/fotos/revisao", "error", error.message));
  }

  await refreshPhotoRecognitionReviewStatus(supabase, suggestion.photo_id);
  await logAudit(context, "ignore_ai_suggestion", "face_detection_suggestions", id, {
    photoId: suggestion.photo_id,
  });
  redirect(adminMessageHref("/admin/fotos/revisao", "saved", "ignored"));
}
