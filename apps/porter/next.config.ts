import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // Next.js static export is bundled into the Capacitor APK via webDir: "out".
  // (Vite equivalent: base: './')
  images: { unoptimized: true },
  transpilePackages: ["@runr/shared"],
};

export default nextConfig;
