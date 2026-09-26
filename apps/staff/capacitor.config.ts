import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.porter.command",
  appName: "Porter Command",
  webDir: "out",
  server: { androidScheme: "https" },
  android: { allowMixedContent: true },
};

export default config;
