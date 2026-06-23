import type { SupabaseClient } from "@supabase/supabase-js";

const imageExtensions = new Set(["jpg", "jpeg", "png", "webp"]);

function isImage(path: string) {
  return imageExtensions.has(path.split(".").pop()?.toLowerCase() ?? "");
}

export async function listStoragePhotoPaths(
  supabase: SupabaseClient,
  prefix = "",
): Promise<string[]> {
  const paths: string[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase.storage.from("photos").list(prefix, {
      limit: 100,
      offset,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) throw new Error(`Storage photos/${prefix}: ${error.message}`);
    const items = data ?? [];

    for (const item of items) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;

      if (item.id === null) {
        paths.push(...(await listStoragePhotoPaths(supabase, path)));
      } else if (isImage(path)) {
        paths.push(path);
      }
    }

    if (items.length < 100) break;
    offset += items.length;
  }

  return paths;
}

export function storagePathFromPhotoUrl(url: string) {
  const marker = "/storage/v1/object/public/photos/";
  const index = url.indexOf(marker);

  if (index === -1) return null;

  try {
    return decodeURIComponent(url.slice(index + marker.length));
  } catch {
    return url.slice(index + marker.length);
  }
}
