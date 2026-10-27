/**
 * Build-time config for the Portr apps. The apps are static exports, so the API
 * (apps/api on Vercel) is reached at NEXT_PUBLIC_API_URL. No keys live in the apps.
 */
const ENV_API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
const MODE = (process.env.NEXT_PUBLIC_PORTR_MODE || "").toLowerCase();

/** Demo/offline mode is the default when no API URL is set at build time. */
export const DEMO_MODE = MODE === "demo" || !ENV_API;

export const apiPublicEnv = {
  NEXT_PUBLIC_API_URL: ENV_API,
  // Resolved at build time so the client bundle knows which mode it was built for.
  NEXT_PUBLIC_PORTR_MODE: DEMO_MODE ? "demo" : "live",
};

export function getApiUrl(): string {
  return apiPublicEnv.NEXT_PUBLIC_API_URL;
}
