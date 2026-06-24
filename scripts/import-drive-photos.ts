import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { createSupabaseServiceClient } from "../src/lib/supabase/service";
import { storagePathFromPhotoUrl } from "./lib/photo-storage";

const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

type AlbumRow = { id: string; slug: string; cover_image_url: string | null };
type CompetitionRow = { id: string; slug: string };
type PhotoRow = { slug: string; url: string };
type SeasonRow = { id: string; year: number };

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

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function shortHash(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

async function listImages(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listImages(absolute)));
    else if (imageExtensions.has(path.extname(entry.name).toLowerCase())) files.push(absolute);
  }

  return files;
}

function storagePath(relativePath: string) {
  const parsed = path.parse(relativePath);
  const folders = parsed.dir
    .split(path.sep)
    .filter(Boolean)
    .map((segment) => slugify(segment) || "pasta");
  const extension = parsed.ext.toLowerCase() === ".jpeg" ? ".jpg" : parsed.ext.toLowerCase();
  return [
    "drive",
    ...folders,
    `${slugify(parsed.name) || "foto"}-${shortHash(relativePath)}${extension}`,
  ].join("/");
}

function photoSlug(relativePath: string) {
  return `drive-${slugify(relativePath.replace(path.extname(relativePath), ""))}-${shortHash(relativePath)}`;
}

function albumSlug(relativeFolder: string) {
  return `drive-${slugify(relativeFolder) || "geral"}-${shortHash(relativeFolder)}`;
}

function titleFromFile(filePath: string) {
  return path
    .basename(filePath, path.extname(filePath))
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function competitionSlug(relativePath: string) {
  const normalized = slugify(relativePath);
  if (normalized.includes("liga-7")) return "liga7-playball";
  if (normalized.includes("futfudas")) return "copa-futfudas";
  if (normalized.includes("amstel")) return "copa-amstel";
  if (normalized.includes("chuteira")) return "chuteira";
  return null;
}

function yearFromPath(relativePath: string) {
  const match = relativePath.match(/(?:^|[/\\])(20\d{2})(?:[/\\]|$)/);
  return match ? Number(match[1]) : null;
}

function contentType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  return "image/jpeg";
}

async function main() {
  const source = argument("--source");
  const apply = process.argv.includes("--apply");
  const concurrency = positiveInteger(argument("--concurrency"), 4);
  if (!source) throw new Error("Informe --source /caminho/do/acervo.");

  const sourceRoot = path.resolve(source);
  if (!(await stat(sourceRoot)).isDirectory()) throw new Error("A origem não é uma pasta.");

  const supabase = createSupabaseServiceClient();
  const [images, photosResult, albumsResult, competitionsResult, seasonsResult] = await Promise.all([
    listImages(sourceRoot),
    supabase.from("photos").select("slug, url"),
    supabase.from("albums").select("id, slug, cover_image_url"),
    supabase.from("competitions").select("id, slug"),
    supabase.from("seasons").select("id, year"),
  ]);
  for (const result of [photosResult, albumsResult, competitionsResult, seasonsResult]) {
    if (result.error) throw new Error(result.error.message);
  }

  const photos = (photosResult.data ?? []) as PhotoRow[];
  const existingSlugs = new Set(photos.map((photo) => photo.slug));
  const existingStoragePaths = new Set(
    photos
      .map((photo) => storagePathFromPhotoUrl(photo.url))
      .filter((value): value is string => Boolean(value)),
  );
  const competitions = new Map(
    ((competitionsResult.data ?? []) as CompetitionRow[]).map((row) => [row.slug, row.id]),
  );
  const seasons = new Map(
    ((seasonsResult.data ?? []) as SeasonRow[]).map((row) => [row.year, row.id]),
  );
  const albums = new Map(
    ((albumsResult.data ?? []) as AlbumRow[]).map((row) => [row.slug, row]),
  );
  const candidates = images.map((absolutePath) => {
    const relativePath = path.relative(sourceRoot, absolutePath);
    const folder = path.dirname(relativePath) === "." ? "geral" : path.dirname(relativePath);
    return {
      absolutePath,
      relativePath,
      folder,
      albumSlug: albumSlug(folder),
      photoSlug: photoSlug(relativePath),
      storagePath: storagePath(relativePath),
    };
  });
  const missing = candidates.filter((photo) => !existingSlugs.has(photo.photoSlug));

  console.log("Importação Drive -> Supabase");
  console.log(`- imagens encontradas: ${images.length}`);
  console.log(`- já cadastradas: ${images.length - missing.length}`);
  console.log(`- pendentes: ${missing.length}`);
  if (!apply || missing.length === 0) {
    if (!apply) console.log("Dry-run: acrescente --apply para enviar e cadastrar.");
    return;
  }

  const neededFolders = new Map(missing.map((photo) => [photo.albumSlug, photo.folder]));
  for (const [slug, folder] of neededFolders) {
    if (albums.has(slug)) continue;
    const competition = competitionSlug(folder);
    const year = yearFromPath(folder);
    const title = path.basename(folder).replace(/[-_]+/g, " ").trim() || "Acervo Manochaco";
    const { data, error } = await supabase
      .from("albums")
      .insert({
        slug,
        title,
        description: `Álbum importado do acervo histórico do Manochaco (${folder}).`,
        category: "match",
        competition_id: competition ? competitions.get(competition) ?? null : null,
        season_id: year ? seasons.get(year) ?? null : null,
      })
      .select("id, slug, cover_image_url")
      .single();
    if (error) throw new Error(`Álbum ${folder}: ${error.message}`);
    albums.set(slug, data as AlbumRow);
  }

  let cursor = 0;
  let imported = 0;
  let failed = 0;
  const coverAssigned = new Set(
    [...albums.values()].filter((album) => album.cover_image_url).map((album) => album.id),
  );

  async function worker() {
    while (cursor < missing.length) {
      const photo = missing[cursor];
      cursor += 1;
      try {
        if (!existingStoragePaths.has(photo.storagePath)) {
          const bytes = await readFile(photo.absolutePath);
          const { error } = await supabase.storage.from("photos").upload(photo.storagePath, bytes, {
            contentType: contentType(photo.absolutePath),
            upsert: false,
          });
          if (error && !/already exists|duplicate/i.test(error.message)) throw error;
        }

        const { data: publicUrl } = supabase.storage.from("photos").getPublicUrl(photo.storagePath);
        const album = albums.get(photo.albumSlug);
        const competition = competitionSlug(photo.relativePath);
        const year = yearFromPath(photo.relativePath);
        const title = titleFromFile(photo.relativePath) || "Foto do Manochaco";
        const { error: insertError } = await supabase.from("photos").insert({
          slug: photo.photoSlug,
          title,
          description: `Foto importada do Google Drive: ${photo.relativePath}`,
          url: publicUrl.publicUrl,
          alt: `Foto do Manochaco: ${title}`,
          category: "match",
          album_id: album?.id ?? null,
          competition_id: competition ? competitions.get(competition) ?? null : null,
          season_id: year ? seasons.get(year) ?? null : null,
          face_recognition_status: "not_processed",
          is_public: true,
        });
        if (insertError && insertError.code !== "23505") throw insertError;

        if (album && !coverAssigned.has(album.id)) {
          coverAssigned.add(album.id);
          await supabase.from("albums").update({ cover_image_url: publicUrl.publicUrl }).eq("id", album.id);
        }
        existingStoragePaths.add(photo.storagePath);
        existingSlugs.add(photo.photoSlug);
        imported += 1;
        if (imported % 50 === 0) console.log(`- progresso: ${imported}/${missing.length}`);
      } catch (error) {
        failed += 1;
        console.error(`- falha em ${photo.relativePath}:`, error instanceof Error ? error.message : error);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  console.log(`- importadas: ${imported}`);
  console.log(`- falhas: ${failed}`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error("Falha ao importar acervo:", error instanceof Error ? error.message : error);
  process.exit(1);
});
