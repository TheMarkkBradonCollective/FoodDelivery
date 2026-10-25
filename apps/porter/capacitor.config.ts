import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.tmbcworks.portr.porter",
  appName: "Portr",
  webDir: "out",
  server: { androidScheme: "https" },
  android: { allowMixedContent: true },
};

export default config;
