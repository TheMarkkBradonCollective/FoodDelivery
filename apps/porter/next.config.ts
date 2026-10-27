import type { NextConfig } from "next";
import { apiPublicEnv } from "../../packages/shared/src/lib/api/public-env";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // Next.js static export is bundled into the Capacitor APK via webDir: "out".
  // (Vite equivalent: base: './')
  images: { unoptimized: true },
  transpilePackages: ["@porter/shared"],
  env: apiPublicEnv,
};

export default nextConfig;
