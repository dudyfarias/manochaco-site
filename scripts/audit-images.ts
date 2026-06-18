import { existsSync } from "node:fs";
import path from "node:path";
import {
  albums,
  matches,
  photoPlayers,
  photos,
  playerFaceReferences,
  players,
  staffMembers,
} from "../src/data";

type ImageReference = {
  source: string;
  field: string;
  src?: string | null;
};

const PROJECT_ROOT = process.cwd();
const PUBLIC_DIR = path.join(PROJECT_ROOT, "public");
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".svg"] as const;

function toDiskPath(publicPath: string) {
  return path.join(PUBLIC_DIR, publicPath.replace(/^\/+/, ""));
}

function isRemote(src: string) {
  return /^https?:\/\//i.test(src);
}

function isGoogleDriveUrl(src: string) {
  return /drive\.google\.com|googleusercontent\.com|lh3\.google/i.test(src);
}

function findAlternative(publicPath: string) {
  const parsed = path.parse(publicPath);

  for (const extension of IMAGE_EXTENSIONS) {
    const candidate = `${parsed.dir}/${parsed.name}${extension}`;

    if (candidate !== publicPath && existsSync(toDiskPath(candidate))) {
      return candidate;
    }
  }

  return null;
}

function collectImageReferences(): ImageReference[] {
  return [
    ...players.flatMap((player) => [
      {
        source: `player:${player.slug}`,
        field: "image",
        src: player.image,
      },
      {
        source: `player:${player.slug}`,
        field: "profileImage",
        src: player.profileImage,
      },
    ]),
    ...staffMembers.map((member) => ({
      source: `staff:${member.slug}`,
      field: "image",
      src: member.image,
    })),
    ...photos.map((photo) => ({
      source: `photo:${photo.slug}`,
      field: "url",
      src: photo.url,
    })),
    ...albums.map((album) => ({
      source: `album:${album.slug}`,
      field: "coverImage",
      src: album.coverImage,
    })),
    ...matches.map((match) => ({
      source: `match:${match.slug}`,
      field: "image",
      src: match.image,
    })),
    ...playerFaceReferences.map((reference) => ({
      source: `face-reference:${reference.playerSlug}`,
      field: "imageUrl",
      src: reference.imageUrl,
    })),
  ];
}

function printList(title: string, items: string[]) {
  console.log(`\n${title}`);

  if (items.length === 0) {
    console.log("OK");
    return;
  }

  items.forEach((item) => console.log(`- ${item}`));
}

function auditImages() {
  const references = collectImageReferences().filter((reference) => reference.src);
  const missingLocalAssets: string[] = [];
  const remoteAssets: string[] = [];
  const invalidPaths: string[] = [];

  references.forEach((reference) => {
    const src = reference.src as string;
    const label = `${reference.source}.${reference.field} -> ${src}`;

    if (isRemote(src)) {
      remoteAssets.push(
        isGoogleDriveUrl(src)
          ? `${label} (Google Drive/hotlink: importe para public/)`
          : label,
      );
      return;
    }

    if (!src.startsWith("/")) {
      invalidPaths.push(`${label} (caminho público deve começar com /)`);
      return;
    }

    if (!existsSync(toDiskPath(src))) {
      const alternative = findAlternative(src);
      missingLocalAssets.push(
        alternative ? `${label} (alternativa encontrada: ${alternative})` : label,
      );
    }
  });

  const playerIds = new Set(players.map((player) => player.id));
  const playerSlugs = new Set(players.map((player) => player.slug));
  const photoIds = new Set(photos.map((photo) => photo.id));
  const badTags = photoPlayers
    .filter(
      (tag) =>
        !photoIds.has(tag.photoId) ||
        !playerIds.has(tag.playerId) ||
        !playerSlugs.has(tag.playerSlug),
    )
    .map(
      (tag) =>
        `${tag.id} -> photo=${tag.photoId}, playerId=${tag.playerId}, playerSlug=${tag.playerSlug}`,
    );
  const badAlbumPhotos = albums.flatMap((album) =>
    album.photoIds
      .filter((photoId) => !photoIds.has(photoId))
      .map((photoId) => `${album.slug} -> ${photoId}`),
  );
  const badMatchPhotos = matches.flatMap((match) =>
    match.photoIds
      .filter((photoId) => !photoIds.has(photoId))
      .map((photoId) => `${match.slug} -> ${photoId}`),
  );
  const playersMissingRequiredFields = players
    .filter(
      (player) =>
        !player.id ||
        !player.slug ||
        !player.name ||
        !player.nickname ||
        !player.status ||
        typeof player.stats?.matches !== "number" ||
        typeof player.stats?.goals !== "number" ||
        typeof player.stats?.assists !== "number",
    )
    .map((player) => player.slug || player.id || "jogador sem identificador");

  console.log("Auditoria de imagens e vínculos do Manochaco");
  console.log(`Referências analisadas: ${references.length}`);

  printList("Imagens locais ausentes", missingLocalAssets);
  printList("Imagens remotas", remoteAssets);
  printList("Caminhos inválidos", invalidPaths);
  printList("Tags com foto ou jogador inexistente", badTags);
  printList("Álbuns com fotos inexistentes", badAlbumPhotos);
  printList("Jogos com fotos inexistentes", badMatchPhotos);
  printList("Jogadores sem campos públicos obrigatórios", playersMissingRequiredFields);
}

auditImages();
