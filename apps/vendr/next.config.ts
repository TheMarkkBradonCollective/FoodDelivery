import type { NextConfig } from "next";
import { supabasePublicEnv } from "../../packages/shared/src/lib/supabase/public-env";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // Next.js static export is bundled into the Capacitor APK via webDir: "out".
  // (Vite equivalent: base: './')
  images: { unoptimized: true },
  transpilePackages: ["@porter/shared"],
  env: supabasePublicEnv,
};

export default nextConfig;
