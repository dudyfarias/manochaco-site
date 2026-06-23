import path from "node:path";
import { createSupabaseServiceClient } from "../src/lib/supabase/service";
import {
  listStoragePhotoPaths,
  storagePathFromPhotoUrl,
} from "./lib/photo-storage";

type ExistingPhoto = {
  slug: string;
  url: string;
};

const applyChanges = process.argv.includes("--apply");

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleFromPath(storagePath: string) {
  const basename = path.basename(storagePath, path.extname(storagePath));
  return basename
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function categoryFromPath(storagePath: string) {
  const firstFolder = storagePath.split("/")[0]?.toLowerCase();

  if (["jogos", "matches"].includes(firstFolder)) return "match";
  if (["elenco", "team"].includes(firstFolder)) return "team";
  if (["treino", "treinos", "training"].includes(firstFolder)) return "training";
  if (["bastidores", "backstage"].includes(firstFolder)) return "backstage";
  if (["titulos", "titles"].includes(firstFolder)) return "title";
  return "general";
}

function uniqueSlug(storagePath: string, usedSlugs: Set<string>) {
  const base = slugify(storagePath.replace(path.extname(storagePath), "")) || "foto";
  let candidate = base;
  let suffix = 2;

  while (usedSlugs.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  usedSlugs.add(candidate);
  return candidate;
}

async function main() {
  const supabase = createSupabaseServiceClient();
  const [storagePaths, photosResult] = await Promise.all([
    listStoragePhotoPaths(supabase),
    supabase.from("photos").select("slug, url"),
  ]);

  if (photosResult.error) throw new Error(photosResult.error.message);
  const existing = (photosResult.data ?? []) as ExistingPhoto[];
  const registeredPaths = new Set(
    existing
      .map((photo) => storagePathFromPhotoUrl(photo.url))
      .filter((value): value is string => Boolean(value)),
  );
  const usedSlugs = new Set(existing.map((photo) => photo.slug));
  const missingPaths = storagePaths.filter((storagePath) => !registeredPaths.has(storagePath));

  console.log("Sincronização Storage -> photos");
  console.log(`- imagens no bucket: ${storagePaths.length}`);
  console.log(`- registros existentes: ${existing.length}`);
  console.log(`- imagens sem registro: ${missingPaths.length}`);

  if (missingPaths.length === 0) return;

  const rows = missingPaths.map((storagePath) => {
    const { data } = supabase.storage.from("photos").getPublicUrl(storagePath);
    const title = titleFromPath(storagePath);

    return {
      slug: uniqueSlug(storagePath, usedSlugs),
      title,
      alt: `Foto do Manochaco: ${title}`,
      url: data.publicUrl,
      category: categoryFromPath(storagePath),
      face_recognition_status: "not_processed",
      is_public: true,
    };
  });

  rows.forEach((row) => console.log(`  ${row.slug} <- ${row.url}`));

  if (!applyChanges) {
    console.log("Dry-run: use npm run sync:photos -- --apply para gravar.");
    return;
  }

  const { error } = await supabase.from("photos").insert(rows);
  if (error) throw new Error(error.message);
  console.log(`- ${rows.length} registro(s) criado(s) com status not_processed.`);
}

main().catch((error) => {
  console.error("Falha ao sincronizar fotos:", error instanceof Error ? error.message : error);
  process.exit(1);
});
