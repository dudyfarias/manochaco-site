import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminContext } from "@/lib/auth";
import { logAudit } from "@/lib/admin/audit";
import { getAdminSupabase } from "@/lib/admin/data";
import {
  getFaceRecognitionProvider,
  getMaximumDistance,
  getMinimumConfidence,
} from "./index";
import { FaceRecognitionError } from "./provider";
import {
  createGalleryPhotoProcessingUrl,
  readGalleryPhoto,
} from "./image-source";

type RecognitionPhotoRow = {
  id: string;
  slug: string;
  url: string;
};

type IndexedEmbeddingRow = {
  id: string;
  player_id: string;
  face_reference_id: string;
  embedding: unknown;
  embedding_model: string;
  provider: string;
  approved_for_recognition: boolean;
  consent_given: boolean;
  players?: { slug?: string | null } | null;
};

function numberArray(value: unknown): number[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const numbers = value.map(Number);
  return numbers.every(Number.isFinite) ? numbers : null;
}

function jsonValue(value: unknown) {
  try {
    return JSON.parse(JSON.stringify(value ?? null)) as unknown;
  } catch {
    return null;
  }
}

export async function refreshPhotoRecognitionReviewStatus(
  supabase: SupabaseClient,
  photoId: string,
) {
  const { data, error } = await supabase
    .from("face_detection_suggestions")
    .select("status")
    .eq("photo_id", photoId);

  if (error) {
    throw new FaceRecognitionError("suggestion_status_failed", error.message);
  }

  const statuses = (data ?? []).map((row) => row.status as string);
  const hasPending = statuses.includes("pending");
  const hasConfirmed = statuses.some((status) =>
    status === "confirmed" || status === "changed",
  );
  const nextStatus = hasPending
    ? "needs_review"
    : hasConfirmed
      ? "approved"
      : "processed";

  const { error: photoStatusError } = await supabase
    .from("photos")
    .update({ face_recognition_status: nextStatus })
    .eq("id", photoId);

  if (photoStatusError) {
    throw new FaceRecognitionError("photo_status_failed", photoStatusError.message);
  }
}

export async function processGalleryPhoto(
  photoId: string,
  context: AdminContext,
  requestOrigin: string,
  options: { reprocess?: boolean } = {},
) {
  const supabase = await getAdminSupabase();
  const { data, error } = await supabase
    .from("photos")
    .select("id, slug, url")
    .eq("id", photoId)
    .maybeSingle();
  const photo = data as RecognitionPhotoRow | null;

  if (error || !photo) {
    throw new FaceRecognitionError(
      "photo_not_found",
      error?.message ?? "Foto não encontrada.",
      "A foto selecionada não foi encontrada.",
    );
  }

  if (options.reprocess) {
    const { error: cleanupPreviousError } = await supabase
      .from("face_detection_suggestions")
      .delete()
      .eq("photo_id", photo.id)
      .in("status", ["pending", "error"]);

    if (cleanupPreviousError) {
      throw new FaceRecognitionError(
        "suggestion_cleanup_failed",
        cleanupPreviousError.message,
      );
    }

    const { error: queuedStatusError } = await supabase
      .from("photos")
      .update({ face_recognition_status: "queued" })
      .eq("id", photo.id);

    if (queuedStatusError) {
      throw new FaceRecognitionError("photo_status_failed", queuedStatusError.message);
    }
  }

  const { error: processingStatusError } = await supabase
    .from("photos")
    .update({ face_recognition_status: "processing" })
    .eq("id", photo.id);

  if (processingStatusError) {
    throw new FaceRecognitionError("photo_status_failed", processingStatusError.message);
  }

  try {
    const provider = await getFaceRecognitionProvider();
    const imageUrl = provider.name === "insightface"
      ? await createGalleryPhotoProcessingUrl(supabase, photo.url, requestOrigin)
      : undefined;
    const imageBytes = provider.name === "insightface"
      ? undefined
      : await readGalleryPhoto(supabase, photo.url, requestOrigin);
    const { data: embeddingData, error: embeddingError } = await supabase
      .from("player_face_embeddings")
      .select(
        "id, player_id, face_reference_id, embedding, embedding_model, provider, approved_for_recognition, consent_given, players(slug)",
      )
      .eq("provider", provider.name)
      .eq("approved_for_recognition", true)
      .eq("consent_given", true);

    if (embeddingError) {
      throw new FaceRecognitionError("embedding_lookup_failed", embeddingError.message);
    }

    const embeddingRows = (embeddingData ?? []) as IndexedEmbeddingRow[];
    const embeddings = embeddingRows.flatMap((row) => {
      const embedding = numberArray(row.embedding);

      return embedding && row.players?.slug
        ? [{
            referenceId: row.face_reference_id,
            playerId: row.player_id,
            playerSlug: row.players.slug,
            embedding,
            embeddingModel: row.embedding_model,
          }]
        : [];
    });
    const result = await provider.searchFacesInPhoto({
      imageBytes,
      imageUrl,
      photoId: photo.id,
      minConfidence: getMinimumConfidence(),
      maxDistance: getMaximumDistance(),
      references: embeddings,
    });

    const { error: cleanupError } = await supabase
      .from("face_detection_suggestions")
      .delete()
      .eq("photo_id", photo.id)
      .in("status", ["pending", "error"]);

    if (cleanupError) {
      throw new FaceRecognitionError("suggestion_cleanup_failed", cleanupError.message);
    }

    if (result.matches.length > 0) {
      const suggestions = result.matches.map((match) => ({
        photo_id: photo.id,
        suggested_player_id: match.playerExternalId ?? null,
        provider: match.provider,
        provider_face_id: match.providerFaceId ?? null,
        confidence: match.confidence,
        bounding_box: match.boundingBox,
        status: "pending",
        raw_response: jsonValue(match.raw),
      }));
      const { error: insertError } = await supabase
        .from("face_detection_suggestions")
        .insert(suggestions);

      if (insertError) {
        throw new FaceRecognitionError("suggestion_insert_failed", insertError.message);
      }
    }

    const nextStatus = result.matches.length > 0 ? "needs_review" : "processed";
    const { error: finalStatusError } = await supabase
      .from("photos")
      .update({ face_recognition_status: nextStatus })
      .eq("id", photo.id);

    if (finalStatusError) {
      throw new FaceRecognitionError("photo_status_failed", finalStatusError.message);
    }
    await logAudit(context, "process_face_recognition", "photos", photo.id, {
      provider: provider.name,
      model: result.model ?? null,
      detectedFaces: result.facesDetected,
      suggestedPlayers: result.matches.filter((match) => Boolean(match.playerExternalId)).length,
    });

    return {
      photoId: photo.id,
      photoSlug: photo.slug,
      detectedFaces: result.facesDetected,
      suggestions: result.matches.length,
      status: nextStatus,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    await supabase
      .from("photos")
      .update({ face_recognition_status: "error" })
      .eq("id", photo.id);
    await logAudit(context, "face_recognition_error", "photos", photo.id, {
      error: message,
    });
    throw error;
  }
}
