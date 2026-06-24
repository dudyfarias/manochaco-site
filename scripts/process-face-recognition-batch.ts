import { createSupabaseServiceClient } from "../src/lib/supabase/service";

type EmbeddingRow = {
  player_id: string;
  embedding: unknown;
  players: { slug?: string | null } | { slug?: string | null }[] | null;
};

type PhotoRow = { id: string; slug: string; title: string; url: string };

type ServiceSuggestion = {
  playerId?: string | null;
  playerSlug?: string | null;
  confidence: number;
  distance?: number | null;
  boundingBox: { x: number; y: number; width: number; height: number };
  faceEmbedding: number[];
  matched: boolean;
};

function argument(name: string) {
  const inline = process.argv.find((value) => value.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function numberArray(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) return null;
  const numbers = value.map(Number);
  return numbers.every(Number.isFinite) ? numbers : null;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const processAll = process.argv.includes("--all");
  const limit = processAll ? 100_000 : positiveInteger(argument("--limit"), 5);
  const apiUrl = process.env.FACE_RECOGNITION_API_URL?.replace(/\/$/, "");
  const apiKey = process.env.FACE_RECOGNITION_API_KEY;
  const minConfidence = Number(process.env.FACE_RECOGNITION_MIN_CONFIDENCE ?? "0.75");
  if (!apiUrl || !apiKey) throw new Error("Configure FACE_RECOGNITION_API_URL e FACE_RECOGNITION_API_KEY.");

  const supabase = createSupabaseServiceClient();
  const [photosResult, embeddingsResult] = await Promise.all([
    supabase
      .from("photos")
      .select("id, slug, title, url")
      .in("face_recognition_status", ["not_processed", "queued", "error"])
      .not("url", "is", null)
      .order("uploaded_at", { ascending: true })
      .limit(limit),
    supabase
      .from("player_face_embeddings")
      .select("player_id, embedding, players(slug)")
      .eq("provider", "insightface")
      .eq("consent_given", true)
      .eq("approved_for_recognition", true),
  ]);
  if (photosResult.error) throw new Error(photosResult.error.message);
  if (embeddingsResult.error) throw new Error(embeddingsResult.error.message);

  const photos = (photosResult.data ?? []) as PhotoRow[];
  const knownFaces = ((embeddingsResult.data ?? []) as EmbeddingRow[]).flatMap((row) => {
    const embedding = numberArray(row.embedding);
    const relation = Array.isArray(row.players) ? row.players[0] : row.players;
    return embedding && relation?.slug
      ? [{ playerId: row.player_id, playerSlug: relation.slug, embedding }]
      : [];
  });

  console.log("Processamento facial em lote");
  console.log(`- fotos elegíveis nesta execução: ${photos.length}`);
  console.log(`- embeddings autorizados: ${knownFaces.length}`);
  if (!apply || photos.length === 0) {
    if (!apply) console.log("Dry-run: acrescente --apply para processar.");
    return;
  }

  const healthResponse = await fetch(`${apiUrl}/health`, { signal: AbortSignal.timeout(120_000) });
  if (!healthResponse.ok) throw new Error(`InsightFace indisponível: HTTP ${healthResponse.status}`);
  const health = await healthResponse.json() as { model?: string };
  console.log(`- modelo: ${health.model ?? "não informado"}`);

  let processed = 0;
  let withSuggestions = 0;
  let withoutFaces = 0;
  let failed = 0;

  for (const photo of photos) {
    try {
      await supabase.from("photos").update({ face_recognition_status: "processing" }).eq("id", photo.id);
      const response = await fetch(`${apiUrl}/process-photo`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-face-api-key": apiKey },
        body: JSON.stringify({ photoId: photo.id, imageUrl: photo.url, knownFaces }),
        signal: AbortSignal.timeout(300_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      const payload = await response.json() as {
        facesDetected: number;
        suggestions: ServiceSuggestion[];
        model?: string;
      };
      if (!Array.isArray(payload.suggestions)) throw new Error("Resposta sem sugestões válidas.");

      const { error: cleanupError } = await supabase
        .from("face_detection_suggestions")
        .delete()
        .eq("photo_id", photo.id)
        .in("status", ["pending", "error"]);
      if (cleanupError) throw cleanupError;

      if (payload.suggestions.length > 0) {
        const rows = payload.suggestions.map((suggestion, index) => {
          const acceptedPlayer = suggestion.matched && suggestion.playerId && suggestion.confidence >= minConfidence
            ? suggestion.playerId
            : null;
          return {
            photo_id: photo.id,
            suggested_player_id: acceptedPlayer,
            provider: "insightface",
            provider_face_id: `insightface-${photo.id}-${index}`,
            confidence: suggestion.confidence,
            bounding_box: suggestion.boundingBox,
            status: "pending",
            raw_response: {
              model: payload.model ?? null,
              distance: suggestion.distance ?? null,
              faceEmbedding: suggestion.faceEmbedding,
              matched: Boolean(acceptedPlayer),
              playerSlug: acceptedPlayer ? suggestion.playerSlug ?? null : null,
            },
          };
        });
        const { error } = await supabase.from("face_detection_suggestions").insert(rows);
        if (error) throw error;
        withSuggestions += 1;
      } else {
        withoutFaces += 1;
      }

      const nextStatus = payload.suggestions.length > 0 ? "needs_review" : "processed";
      const { error: statusError } = await supabase
        .from("photos")
        .update({ face_recognition_status: nextStatus })
        .eq("id", photo.id);
      if (statusError) throw statusError;
      processed += 1;
      console.log(`- ${processed}/${photos.length}: ${photo.slug} -> ${nextStatus} (${payload.facesDetected} rosto(s))`);
    } catch (error) {
      failed += 1;
      await supabase.from("photos").update({ face_recognition_status: "error" }).eq("id", photo.id);
      console.error(`- erro em ${photo.slug}:`, error instanceof Error ? error.message : error);
    }
  }

  console.log(`- processadas: ${processed}`);
  console.log(`- com revisão: ${withSuggestions}`);
  console.log(`- sem rostos: ${withoutFaces}`);
  console.log(`- erros: ${failed}`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error("Falha no lote facial:", error instanceof Error ? error.message : error);
  process.exit(1);
});
