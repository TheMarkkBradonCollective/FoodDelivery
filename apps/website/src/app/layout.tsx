import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "@/store";
import { AuthProvider } from "@/components/AuthProvider";
import { SiteChrome } from "@/components/SiteChrome";
import { MarketplaceSync } from "@porter/shared/components/providers/MarketplaceSync";
import { PORTER_BRAND, APP_COPY } from "@porter/shared/lib/apps";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${PORTER_BRAND.name} — ${PORTER_BRAND.footerLine}`,
  description: `${PORTER_BRAND.promise} Download ${APP_COPY.porter.shortName}, ${APP_COPY.runr.shortName}, ${APP_COPY.vendr.shortName}, or ${APP_COPY.staff.shortName}.`,
  openGraph: {
    title: PORTER_BRAND.name,
    description: `${APP_COPY.porter.shortName} · ${APP_COPY.runr.shortName} · ${APP_COPY.vendr.shortName} · ${APP_COPY.staff.shortName}`,
  },
};

export const viewport = {
  themeColor: "#7048F8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={font.className}>
        <AuthProvider>
          <MarketplaceSync />
          <SiteChrome>{children}</SiteChrome>
        </AuthProvider>
      </body>
    </html>
  );
}
