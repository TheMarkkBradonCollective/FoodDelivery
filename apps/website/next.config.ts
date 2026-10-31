import type { NextConfig } from "next";
import { apiPublicEnv } from "../../packages/shared/src/lib/api/public-env";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  transpilePackages: ["@porter/shared"],
  env: apiPublicEnv,
};

export default nextConfig;
