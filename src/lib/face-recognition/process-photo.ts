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
import { readGalleryPhoto } from "./image-source";

type RecognitionPhotoRow = {
  id: string;
  url: string;
};

type IndexedReferenceRow = {
  id: string;
  player_id: string;
  provider_face_id: string | null;
  embedding: unknown;
  embedding_model: string | null;
  approved_for_recognition: boolean;
  consent_given: boolean;
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
) {
  const supabase = await getAdminSupabase();
  const { data, error } = await supabase
    .from("photos")
    .select("id, url")
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

  const { error: processingStatusError } = await supabase
    .from("photos")
    .update({ face_recognition_status: "processing" })
    .eq("id", photo.id);

  if (processingStatusError) {
    throw new FaceRecognitionError("photo_status_failed", processingStatusError.message);
  }

  try {
    const imageBytes = await readGalleryPhoto(supabase, photo.url, requestOrigin);
    const provider = await getFaceRecognitionProvider();
    const { data: referenceData, error: referenceError } = await supabase
      .from("player_face_references")
      .select(
        "id, player_id, provider_face_id, embedding, embedding_model, approved_for_recognition, consent_given",
      )
      .eq("provider", provider.name)
      .eq("approved_for_recognition", true)
      .eq("consent_given", true);

    if (referenceError) {
      throw new FaceRecognitionError("reference_lookup_failed", referenceError.message);
    }

    const references = (referenceData ?? []) as IndexedReferenceRow[];
    const embeddings = references.flatMap((reference) => {
      const embedding = numberArray(reference.embedding);

      return embedding && reference.embedding_model
        ? [{
            referenceId: reference.id,
            playerId: reference.player_id,
            providerFaceId: reference.provider_face_id ?? undefined,
            embedding,
            embeddingModel: reference.embedding_model,
          }]
        : [];
    });
    const matches = await provider.searchFacesInPhoto({
      imageBytes,
      photoId: photo.id,
      minConfidence: getMinimumConfidence(),
      maxDistance: getMaximumDistance(),
      references: embeddings,
    });
    const referencesByFaceId = new Map(
      references
        .filter((reference) => reference.provider_face_id)
        .map((reference) => [reference.provider_face_id as string, reference]),
    );

    const { error: cleanupError } = await supabase
      .from("face_detection_suggestions")
      .delete()
      .eq("photo_id", photo.id)
      .in("status", ["pending", "error"]);

    if (cleanupError) {
      throw new FaceRecognitionError("suggestion_cleanup_failed", cleanupError.message);
    }

    if (matches.length > 0) {
      const suggestions = matches.map((match) => ({
        photo_id: photo.id,
        suggested_player_id:
          match.playerExternalId ??
          (match.providerFaceId
            ? referencesByFaceId.get(match.providerFaceId)?.player_id ?? null
            : null),
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

    const nextStatus = matches.length > 0 ? "needs_review" : "processed";
    const { error: finalStatusError } = await supabase
      .from("photos")
      .update({ face_recognition_status: nextStatus })
      .eq("id", photo.id);

    if (finalStatusError) {
      throw new FaceRecognitionError("photo_status_failed", finalStatusError.message);
    }
    await logAudit(context, "process_face_recognition", "photos", photo.id, {
      provider: provider.name,
      detectedFaces: matches.length,
      suggestedPlayers: matches.filter((match) =>
        Boolean(
          match.playerExternalId ||
          (match.providerFaceId && referencesByFaceId.has(match.providerFaceId)),
        ),
      ).length,
    });

    return {
      photoId: photo.id,
      detectedFaces: matches.length,
      suggestions: matches.length,
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
