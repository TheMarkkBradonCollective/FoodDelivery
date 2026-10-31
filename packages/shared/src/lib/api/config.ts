export { apiPublicEnv, getApiUrl, getAppMode, DEFAULT_API_URL } from "./public-env";
export type { AppMode } from "./public-env";
import { getApiUrl } from "./public-env";

export function isApiConfigured(): boolean {
  return Boolean(getApiUrl());
}
