import "server-only";

import type { AdminContext } from "@/lib/auth";
import { logAudit } from "@/lib/admin/audit";
import { getAdminSupabase } from "@/lib/admin/data";
import { getFaceRecognitionProvider } from "./index";
import { FaceRecognitionError } from "./provider";
import { readPrivateFaceReference } from "./image-source";

type FaceReferenceRow = {
  id: string;
  player_id: string;
  storage_path: string | null;
  provider_face_id: string | null;
  approved_for_recognition: boolean;
  consent_given: boolean;
};

export async function indexPlayerFace(
  playerFaceReferenceId: string,
  context: AdminContext,
) {
  const supabase = await getAdminSupabase();
  const { data, error } = await supabase
    .from("player_face_references")
    .select(
      "id, player_id, storage_path, provider_face_id, approved_for_recognition, consent_given",
    )
    .eq("id", playerFaceReferenceId)
    .maybeSingle();
  const reference = data as FaceReferenceRow | null;

  if (error || !reference) {
    throw new FaceRecognitionError(
      "reference_not_found",
      error?.message ?? "Referência facial não encontrada.",
      "A foto de referência não foi encontrada.",
    );
  }

  if (!reference.consent_given || !reference.approved_for_recognition) {
    throw new FaceRecognitionError(
      "consent_required",
      "Consentimento e aprovação são obrigatórios antes da indexação.",
      "Marque o consentimento e a aprovação antes de indexar o rosto.",
    );
  }

  if (!reference.storage_path) {
    throw new FaceRecognitionError(
      "storage_path_missing",
      "A referência facial não possui storage_path.",
      "A foto de referência não está vinculada ao bucket privado.",
    );
  }

  const { error: indexingStateError } = await supabase
    .from("player_face_references")
    .update({ indexing_status: "indexing", indexing_error: null })
    .eq("id", reference.id);

  if (indexingStateError) {
    throw new FaceRecognitionError("reference_state_failed", indexingStateError.message);
  }

  try {
    const imageBytes = await readPrivateFaceReference(supabase, reference.storage_path);
    const provider = await getFaceRecognitionProvider();
    const indexed = await provider.indexPlayerFace({
      imageBytes,
      externalImageId: reference.player_id,
      referenceId: reference.id,
    });

    const { error: updateError } = await supabase
      .from("player_face_references")
      .update({
        provider: indexed.provider,
        provider_face_id: indexed.providerFaceId,
        provider_collection_id: indexed.providerCollectionId,
        embedding: indexed.embedding ?? null,
        embedding_model: indexed.embeddingModel ?? null,
        embedding_generated_at: indexed.embedding
          ? new Date().toISOString()
          : null,
        indexing_status: "indexed",
        indexing_error: null,
        indexed_at: new Date().toISOString(),
      })
      .eq("id", reference.id);

    if (updateError) {
      throw new FaceRecognitionError("reference_update_failed", updateError.message);
    }

    if (
      reference.provider_face_id &&
      reference.provider_face_id !== indexed.providerFaceId
    ) {
      try {
        await provider.deleteIndexedFace(reference.provider_face_id);
      } catch (deleteError) {
        console.error("[face-recognition] Falha ao remover índice facial anterior", deleteError);
      }
    }

    await logAudit(context, "index_face_reference", "player_face_references", reference.id, {
      playerId: reference.player_id,
      provider: indexed.provider,
      providerCollectionId: indexed.providerCollectionId,
      embeddingModel: indexed.embeddingModel ?? null,
    });

    return indexed;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    await supabase
      .from("player_face_references")
      .update({ indexing_status: "error", indexing_error: message.slice(0, 500) })
      .eq("id", reference.id);
    await logAudit(context, "face_reference_index_error", "player_face_references", reference.id, {
      playerId: reference.player_id,
      error: message,
    });
    throw error;
  }
}
