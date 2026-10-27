import { getApiUrl, isApiConfigured } from "./config";

const TOKEN_KEY = "portr_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** JSON call to the Portr API with the stored bearer token. */
export async function api<T = unknown>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  if (!isApiConfigured()) throw new ApiError(0, "The Portr API is not configured for this build.");
  const token = getToken();
  const isForm = typeof FormData !== "undefined" && init.body instanceof FormData;
  const res = await fetch(`${getApiUrl()}${path}`, {
    method: init.method ?? (init.body ? "POST" : "GET"),
    headers: {
      ...(isForm || !init.body ? {} : { "content-type": "application/json" }),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: init.body ? (isForm ? (init.body as FormData) : JSON.stringify(init.body)) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new ApiError(res.status, data.error ?? `Request failed (${res.status})`);
  return data as T;
}

/** Table write helpers for /api/db/:table. */
export const db = {
  upsert: (table: string, row: Record<string, unknown>) => api(`/api/db/${table}`, { body: { op: "upsert", row } }),
  update: (table: string, match: Record<string, unknown>, patch: Record<string, unknown>) =>
    api(`/api/db/${table}`, { body: { op: "update", match, patch } }),
  remove: (table: string, match: Record<string, unknown>) => api(`/api/db/${table}`, { body: { op: "delete", match } }),
};

/** Upload a photo/video to Drive via the API; optionally save its link on a row (e.g. profiles avatar). */
export async function uploadMedia(file: File | Blob, target?: { table: string; id: string }) {
  const form = new FormData();
  form.append("file", file);
  if (target) {
    form.append("table", target.table);
    form.append("id", target.id);
  }
  return api<{ fileId: string; url: string }>("/api/upload", { body: form });
}
