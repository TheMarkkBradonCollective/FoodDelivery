export { DEMO_MODE, apiPublicEnv, getApiUrl } from "./public-env";
import { DEMO_MODE, getApiUrl } from "./public-env";

/** True when the build runs offline on bundled seed data (no API, no network). */
export function isDemoMode(): boolean {
  return DEMO_MODE;
}

export function isApiConfigured(): boolean {
  return !DEMO_MODE && Boolean(getApiUrl());
}
