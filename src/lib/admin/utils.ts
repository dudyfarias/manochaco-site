import type { MatchResult } from "@/types";

export function formString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export function nullableString(formData: FormData, key: string) {
  const value = formString(formData, key);
  return value.length > 0 ? value : null;
}

export function nullableNumber(formData: FormData, key: string) {
  const value = formString(formData, key);

  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function requiredString(formData: FormData, key: string, label: string) {
  const value = formString(formData, key);

  if (!value) {
    throw new Error(`${label} é obrigatório.`);
  }

  return value;
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function safeSlugFromForm(formData: FormData, sourceKey: string, slugKey = "slug") {
  const providedSlug = formString(formData, slugKey);
  const source = formString(formData, sourceKey);
  const slug = slugify(providedSlug || source);

  if (!slug) {
    throw new Error("Slug é obrigatório.");
  }

  return slug;
}

export function calculateMatchResult(
  manochacoScore: number,
  opponentScore: number,
): MatchResult {
  if (manochacoScore > opponentScore) {
    return "win";
  }

  if (manochacoScore < opponentScore) {
    return "loss";
  }

  return "draw";
}

export function safeFileName(fileName: string) {
  const [baseName, ...extensionParts] = fileName.split(".");
  const extension = extensionParts.pop()?.toLowerCase() ?? "jpg";
  const safeBaseName = slugify(baseName || "foto") || "foto";
  const safeExtension = extension.replace(/[^a-z0-9]/g, "") || "jpg";

  return `${safeBaseName}.${safeExtension}`;
}

export function adminMessageHref(path: string, key: "saved" | "error", value: string) {
  const params = new URLSearchParams({ [key]: value });
  return `${path}?${params.toString()}`;
}
