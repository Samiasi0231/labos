import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getStoredAuth } from "@/api/client";
import type { PopulatedRef } from "@/api/types/results";
import type { PortalAccess } from "@/data/mockData";
import { mutate } from "swr";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function unslugify(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Returns the object if the ref came back populated, otherwise null. */
export function asPopulated<T>(ref: PopulatedRef<T>): (T & { _id: string }) | null {
  return typeof ref === "string" ? null : ref;
}

/** Returns a display id string regardless of whether the ref is populated. */
export function refId<T>(ref: PopulatedRef<T>): string {
  return typeof ref === "string" ? ref : ref._id;
}

/**
 * Best-effort derivation of portal access state from an entity's linked
 * `user` field. The backend currently only exposes whether a user is
 * linked, not whether the invite has been accepted — so this cannot
 * distinguish "invite_sent" from "active". Until the API exposes invite
 * status explicitly, both states collapse to "active" here.
 */
export function derivePortalAccess(userId?: string | null): PortalAccess {
  return userId ? "active" : "none";
}

// ── PDF download ──────────────────────────────────────────────────────────────

/**
 * Fetches a PDF from an authenticated lab API endpoint and triggers a browser download.
 * Uses fetch + blob because all lab routes require Authorization header.
 *
 * @param path         - Relative path, e.g. "/results/:id/download"
 * @param fallbackName - Filename to use if Content-Disposition header is absent
 */
export async function downloadPDF(path: string, fallbackName: string): Promise<void> {
  const auth = getStoredAuth();
  const baseURL = (import.meta.env.VITE_API_BASE_URL as string) ?? "";

  const res = await fetch(`${baseURL}${path}`, {
    headers: { Authorization: `Bearer ${auth?.access_token ?? ""}` },
  });

  if (!res.ok) {
    throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = objectUrl;
  a.download =
    res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ??
    fallbackName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}

export const concatStrings = (...args: any[]): string => {
  if (args.length === 0) return '';
  const separator = args[args.length - 1];
  const strings = args.slice(0, -1);
  return strings
    .filter((str: any) => str && typeof str === 'string' && str.trim() !== '')
    .join(separator || '');
};

export function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

export const clearCache = (exclude: string[] = []) => mutate((key) => {
  return exclude?.every((k) => k !== key);
}, undefined, { revalidate: true });