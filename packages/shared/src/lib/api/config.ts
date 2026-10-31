export { apiPublicEnv, getApiUrl } from "./public-env";
import { getApiUrl } from "./public-env";

export function isApiConfigured(): boolean {
  return Boolean(getApiUrl());
}

/** @deprecated Use isApiConfigured */
export const isSupabaseConfigured = isApiConfigured;
