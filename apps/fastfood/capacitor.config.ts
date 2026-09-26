import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.porter.fastfood",
  appName: "FastFood",
  webDir: "out",
  server: { androidScheme: "https" },
  android: { allowMixedContent: true },
};

export default config;
