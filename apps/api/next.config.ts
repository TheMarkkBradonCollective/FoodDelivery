import type { NextConfig } from "next";

// Server-only API (route handlers). Not a static export: deploy as its own Vercel project.
const nextConfig: NextConfig = {
  serverExternalPackages: ["googleapis"],
};

export default nextConfig;
