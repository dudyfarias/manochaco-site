import { existsSync } from "fs";
import { join, normalize } from "path";

export function hasPublicAsset(src?: string | null) {
  if (!src || !src.startsWith("/")) {
    return false;
  }

  const normalized = normalize(src).replace(/^(\.\.[/\\])+/, "");
  return existsSync(join(process.cwd(), "public", normalized));
}

export function isRemoteAsset(src?: string | null) {
  if (!src) {
    return false;
  }

  try {
    const url = new URL(src);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function getInitials(label: string) {
  const words = label
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "M";
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
