import type { NextConfig } from "next";
import { supabasePublicEnv } from "../../packages/shared/src/lib/supabase/public-env";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  transpilePackages: ["@porter/shared"],
  env: supabasePublicEnv,
};

export default nextConfig;
