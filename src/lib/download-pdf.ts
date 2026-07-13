import { getStoredAuth } from "@/api/client";

/**
 * Fetches a PDF from an authenticated lab API endpoint and triggers a browser download.
 * Uses Option B (fetch + blob) because all lab routes require Authorization header.
 *
 * @param path       - Relative path, e.g. "/results/:id/download"
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
