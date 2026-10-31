/** Default live API (Cloudflare Worker). Override with NEXT_PUBLIC_API_URL at build time. */
export const DEFAULT_API_URL = "https://portr-api.themarkkbrandoncollective-2d9.workers.dev";

/** "live" (default) talks to the API; "demo" uses bundled local preview data. */
export type AppMode = "live" | "demo";

const rawMode = (process.env.NEXT_PUBLIC_APP_MODE ?? "live").trim().toLowerCase();

export const apiPublicEnv = {
  NEXT_PUBLIC_APP_MODE: (rawMode === "demo" ? "demo" : "live") as AppMode,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL,
};

export function getAppMode(): AppMode {
  return apiPublicEnv.NEXT_PUBLIC_APP_MODE;
}

export function getApiUrl(): string {
  if (getAppMode() === "demo") return "";
  return apiPublicEnv.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
}
