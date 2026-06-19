"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { AdminRole } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth";
import { getFaceRecognitionProvider } from "@/lib/face-recognition";
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

export async function loginAdmin(formData: FormData) {
  const email = requiredString(formData, "email", "E-mail");
  const password = requiredString(formData, "password", "Senha");
  const next = formString(formData, "next") || "/admin";
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/admin/login?error=missing-env");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/admin/login?error=invalid");
  }

  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAdmin() {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/admin/login?loggedOut=1");
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
      provider: process.env.FACE_RECOGNITION_PROVIDER ?? "aws",
      approved_for_recognition: formData.get("approved_for_recognition") === "on",
      consent_given: formData.get("consent_given") === "on",
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
    consentGiven: formData.get("consent_given") === "on",
    approvedForRecognition: formData.get("approved_for_recognition") === "on",
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
  const { data, error } = await supabase
    .from("player_face_references")
    .select("provider_face_id")
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

  const revokingIndexedReference =
    Boolean(data.provider_face_id) && (!consentGiven || !approvedForRecognition);

  if (revokingIndexedReference && data.provider_face_id) {
    try {
      await getFaceRecognitionProvider().deleteIndexedFace(data.provider_face_id);
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Falha no provedor.";
      redirect(adminMessageHref(`/admin/jogadores/${playerId}`, "error", message));
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
    .select("storage_path, provider_face_id")
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

  if (data.provider_face_id) {
    try {
      await getFaceRecognitionProvider().deleteIndexedFace(data.provider_face_id);
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Falha no provedor.";
      redirect(adminMessageHref(`/admin/jogadores/${playerId}`, "error", message));
    }
  }

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
  revalidatePath("/galeria");
  redirect(adminMessageHref(`/admin/galeria/fotos/${photoId}`, "saved", "tag"));
}

export async function removePhotoPlayerTag(formData: FormData) {
  const context = await requireAdmin(photoRoles);
  const supabase = await getAdminSupabase();
  const id = requiredString(formData, "id", "ID");
  const photoId = requiredString(formData, "photo_id", "Foto");

  const { error } = await supabase.from("photo_player_tags").delete().eq("id", id);

  if (error) {
    redirect(adminMessageHref(`/admin/galeria/fotos/${photoId}`, "error", error.message));
  }

  await logAudit(context, "remove_tag", "photo_player_tags", id, { photoId });
  revalidatePath("/galeria");
  redirect(adminMessageHref(`/admin/galeria/fotos/${photoId}`, "saved", "tag-removed"));
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

  const { error: tagError } = await supabase.from("photo_player_tags").upsert(
    {
      photo_id: suggestion.photo_id,
      player_id: suggestion.suggested_player_id,
      tag_type: "ai_confirmed",
      confidence: suggestion.confidence,
      bounding_box: suggestion.bounding_box,
      confirmed_by_admin: true,
    },
    { onConflict: "photo_id,player_id" },
  );

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
  });
  revalidatePath("/galeria");
  redirect(adminMessageHref("/admin/fotos/revisao", "saved", "confirmed"));
}

export async function changeFaceSuggestion(formData: FormData) {
  const context = await requireAdmin(photoRoles);
  const supabase = await getAdminSupabase();
  const id = requiredString(formData, "id", "Sugestão");
  const playerId = requiredString(formData, "player_id", "Jogador");

  const { data: suggestion, error: suggestionError } = await supabase
    .from("face_detection_suggestions")
    .select("id, photo_id, confidence, bounding_box")
    .eq("id", id)
    .single();

  if (suggestionError || !suggestion) {
    redirect(adminMessageHref("/admin/fotos/revisao", "error", "Sugestão inválida."));
  }

  const { error: tagError } = await supabase.from("photo_player_tags").upsert(
    {
      photo_id: suggestion.photo_id,
      player_id: playerId,
      tag_type: "ai_confirmed",
      confidence: suggestion.confidence,
      bounding_box: suggestion.bounding_box,
      confirmed_by_admin: true,
    },
    { onConflict: "photo_id,player_id" },
  );

  if (tagError) {
    redirect(adminMessageHref("/admin/fotos/revisao", "error", tagError.message));
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
  });
  revalidatePath("/galeria");
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
