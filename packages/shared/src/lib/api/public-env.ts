export const apiPublicEnv = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "",
};

export function getApiUrl(): string {
  return apiPublicEnv.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
}
