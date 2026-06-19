import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { FaceRecognitionError } from "./provider";

const MAX_REKOGNITION_IMAGE_BYTES = 5 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png"]);

async function blobToRekognitionBytes(blob: Blob) {
  const contentType = blob.type.split(";")[0].toLowerCase();

  if (!SUPPORTED_IMAGE_TYPES.has(contentType)) {
    throw new FaceRecognitionError(
      "unsupported_image_type",
      `Tipo de imagem não suportado: ${contentType || "desconhecido"}`,
      "O reconhecimento facial aceita apenas imagens JPEG ou PNG.",
    );
  }

  if (blob.size === 0 || blob.size > MAX_REKOGNITION_IMAGE_BYTES) {
    throw new FaceRecognitionError(
      "invalid_image_size",
      `Imagem com tamanho inválido: ${blob.size} bytes`,
      "A imagem precisa ter até 5 MB para ser processada pelo Rekognition.",
    );
  }

  return new Uint8Array(await blob.arrayBuffer());
}

export async function readPrivateFaceReference(
  supabase: SupabaseClient,
  storagePath: string,
) {
  const { data, error } = await supabase.storage
    .from("face-references")
    .download(storagePath);

  if (error || !data) {
    throw new FaceRecognitionError(
      "reference_download_failed",
      error?.message ?? "Referência facial não encontrada no Storage.",
      "Não foi possível ler a foto de referência no bucket privado.",
    );
  }

  return blobToRekognitionBytes(data);
}

function storagePathFromPublicPhotoUrl(photoUrl: string) {
  try {
    const url = new URL(photoUrl);
    const marker = "/storage/v1/object/public/photos/";
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

export async function readGalleryPhoto(
  supabase: SupabaseClient,
  photoUrl: string,
  requestOrigin: string,
) {
  const storagePath = storagePathFromPublicPhotoUrl(photoUrl);

  if (storagePath) {
    const { data, error } = await supabase.storage.from("photos").download(storagePath);

    if (error || !data) {
      throw new FaceRecognitionError(
        "photo_download_failed",
        error?.message ?? "Foto não encontrada no Storage.",
        "Não foi possível ler a foto no Supabase Storage.",
      );
    }

    return blobToRekognitionBytes(data);
  }

  const target = new URL(photoUrl, requestOrigin);
  const allowedProtocols = new Set(["http:", "https:"]);
  const allowedHosts = new Set([new URL(requestOrigin).host]);
  const { url: supabaseUrl } = getSupabasePublicEnv();
  const vercelHosts = [
    process.env.VERCEL_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ].filter((host): host is string => Boolean(host));

  if (supabaseUrl) {
    allowedHosts.add(new URL(supabaseUrl).host);
  }

  vercelHosts.forEach((host) => allowedHosts.add(host));

  if (!allowedProtocols.has(target.protocol) || !allowedHosts.has(target.host)) {
    throw new FaceRecognitionError(
      "photo_source_not_allowed",
      `Origem de imagem não autorizada: ${target.host}`,
      "A foto precisa estar no site ou no Supabase Storage para ser processada.",
    );
  }

  const response = await fetch(target, {
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new FaceRecognitionError(
      "photo_fetch_failed",
      `Falha ao buscar foto: HTTP ${response.status}`,
      "Não foi possível baixar a foto selecionada para processamento.",
    );
  }

  return blobToRekognitionBytes(await response.blob());
}
