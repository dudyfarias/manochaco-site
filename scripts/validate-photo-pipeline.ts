import { readdir } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { faceRecognitionStatuses } from "../src/lib/photo-pipeline";
import { getSupabasePublicEnv } from "../src/lib/supabase/env";
import { createSupabaseServiceClient } from "../src/lib/supabase/service";
import {
  listStoragePhotoPaths,
  storagePathFromPhotoUrl,
} from "./lib/photo-storage";

type PhotoRow = { id: string; slug: string; url: string; face_recognition_status: string };
type TagRow = { photo_id: string; player_id: string; confirmed_by_admin: boolean; tag_type: string };
type SuggestionRow = { id: string; photo_id: string; suggested_player_id: string | null; status: string };

let failures = 0;

function fail(message: string) {
  failures += 1;
  console.error(`✗ ${message}`);
}

function pass(message: string) {
  console.log(`✓ ${message}`);
}

function warn(message: string) {
  console.warn(`! ${message}`);
}

async function listLocalPhotoFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths: string[] = [];

  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) paths.push(...(await listLocalPhotoFiles(absolute)));
    else if (/\.(jpe?g|png|webp)$/i.test(entry.name)) paths.push(absolute);
  }

  return paths;
}

async function main() {
  const service = createSupabaseServiceClient();
  const [photosResult, playersResult, tagsResult, suggestionsResult, storagePaths] =
    await Promise.all([
      service.from("photos").select("id, slug, url, face_recognition_status"),
      service.from("players").select("id, slug"),
      service
        .from("photo_player_tags")
        .select("photo_id, player_id, confirmed_by_admin, tag_type"),
      service
        .from("face_detection_suggestions")
        .select("id, photo_id, suggested_player_id, status"),
      listStoragePhotoPaths(service),
    ]);

  for (const result of [photosResult, playersResult, tagsResult, suggestionsResult]) {
    if (result.error) throw new Error(result.error.message);
  }

  const photos = (photosResult.data ?? []) as PhotoRow[];
  const playerIds = new Set((playersResult.data ?? []).map((player) => player.id as string));
  const photoIds = new Set(photos.map((photo) => photo.id));
  const tags = (tagsResult.data ?? []) as TagRow[];
  const suggestions = (suggestionsResult.data ?? []) as SuggestionRow[];
  const confirmedTags = tags.filter(
    (tag) =>
      tag.confirmed_by_admin && ["manual", "ai_confirmed"].includes(tag.tag_type),
  );

  const photosWithoutUrl = photos.filter((photo) => !photo.url?.trim());
  const invalidStatuses = photos.filter(
    (photo) => !faceRecognitionStatuses.includes(photo.face_recognition_status as never),
  );
  const orphanPhotoTags = confirmedTags.filter((tag) => !photoIds.has(tag.photo_id));
  const orphanPlayerTags = confirmedTags.filter((tag) => !playerIds.has(tag.player_id));
  const confirmedWithoutTag = suggestions.filter(
    (suggestion) =>
      ["confirmed", "changed"].includes(suggestion.status) &&
      suggestion.suggested_player_id &&
      !confirmedTags.some(
        (tag) =>
          tag.photo_id === suggestion.photo_id &&
          tag.player_id === suggestion.suggested_player_id &&
          ["manual", "ai_confirmed"].includes(tag.tag_type),
      ),
  );

  if (photosWithoutUrl.length) fail(`${photosWithoutUrl.length} foto(s) sem URL`);
  else pass("Fotos com URL");

  if (invalidStatuses.length) fail(`${invalidStatuses.length} status inválido(s)`);
  else pass("Status válidos");

  if (orphanPhotoTags.length) fail(`${orphanPhotoTags.length} tag(s) sem foto`);
  else pass("Tags referenciam fotos existentes");

  if (orphanPlayerTags.length) fail(`${orphanPlayerTags.length} tag(s) sem jogador`);
  else pass("Tags referenciam jogadores existentes");

  if (confirmedWithoutTag.length) {
    fail(`${confirmedWithoutTag.length} sugestão(ões) confirmada(s) sem tag pública`);
  } else {
    pass("Sugestões confirmadas possuem tag pública");
  }

  const publicEnv = getSupabasePublicEnv();
  if (publicEnv.url && publicEnv.anonKey) {
    const publicClient = createClient(publicEnv.url, publicEnv.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: publicTags, error } = await publicClient
      .from("photo_player_tags")
      .select("photo_id, player_id")
      .eq("confirmed_by_admin", true)
      .in("tag_type", ["manual", "ai_confirmed"]);

    if (error) fail(`Leitura pública de tags: ${error.message}`);
    else if ((publicTags ?? []).length !== confirmedTags.length) {
      fail(`Leitura pública retorna ${(publicTags ?? []).length} de ${confirmedTags.length} tag(s) confirmadas`);
    } else pass("Tags confirmadas estão disponíveis pela API pública");
  } else {
    warn("Chave pública ausente; leitura anônima não validada");
  }

  const registeredStoragePaths = new Set(
    photos
      .map((photo) => storagePathFromPhotoUrl(photo.url))
      .filter((value): value is string => Boolean(value)),
  );
  const missingStorageRecords = storagePaths.filter(
    (storagePath) => !registeredStoragePaths.has(storagePath),
  );
  if (missingStorageRecords.length) {
    warn(`${missingStorageRecords.length} imagem(ns) no Storage sem registro em photos`);
  } else {
    pass("Storage sincronizado com a tabela photos");
  }

  const localRoot = path.join(process.cwd(), "public", "photos");
  const localFiles = await listLocalPhotoFiles(localRoot);
  const registeredLocalUrls = new Set(photos.map((photo) => photo.url));
  const unregisteredLocal = localFiles.filter((file) => {
    const relative = `/${path.relative(path.join(process.cwd(), "public"), file).replaceAll(path.sep, "/")}`;
    return !registeredLocalUrls.has(relative);
  });
  if (unregisteredLocal.length > 0) {
    warn(`${unregisteredLocal.length} asset(s) local(is) sem registro no banco`);
  }

  console.log(`Resumo: ${photos.length} fotos, ${confirmedTags.length} tags confirmadas, ${storagePaths.length} imagens no Storage.`);
  if (failures > 0) process.exit(1);
}

main().catch((error) => {
  console.error("Falha ao validar pipeline:", error instanceof Error ? error.message : error);
  process.exit(1);
});
