import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.porter.porter",
  appName: "Portr",
  webDir: "out",
  server: { androidScheme: "https" },
  android: { allowMixedContent: true },
};

export default config;
