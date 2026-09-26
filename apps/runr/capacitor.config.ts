import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.porter.runner",
  appName: "Porter Runner",
  webDir: "out",
  server: { androidScheme: "https" },
  android: { allowMixedContent: true },
};

export default config;
