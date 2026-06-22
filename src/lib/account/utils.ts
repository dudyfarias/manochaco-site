import { headers } from "next/headers";
import type { AccountType } from "./types";
import { isAccountType } from "./types";

export function formText(formData: FormData, key: string, maxLength = 500) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function rawFormText(formData: FormData, key: string, maxLength = 500) {
  const value = formData.get(key);
  return typeof value === "string" ? value.slice(0, maxLength) : "";
}

export function nullableFormText(
  formData: FormData,
  key: string,
  maxLength = 500,
) {
  return formText(formData, key, maxLength) || null;
}

export function parseAccountType(value: unknown): AccountType {
  return isAccountType(value) ? value : "supporter";
}

export function parseBirthDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00Z`);
  const today = new Date().toISOString().slice(0, 10);

  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return null;
  }

  return value >= "1940-01-01" && value <= today ? value : null;
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function safeInternalPath(value: string | null | undefined, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

export async function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";

  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

export function accountMessageHref(
  path: string,
  key: "error" | "saved" | "success",
  value: string,
) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${key}=${encodeURIComponent(value)}`;
}
