import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "@/store";
import { AuthProvider } from "@/components/AuthProvider";
import { SiteChrome } from "@/components/SiteChrome";
import { MarketplaceSync } from "@runr/shared/components/providers/MarketplaceSync";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Porter — Pick Your Place. Run Your Time.",
  description:
    "Porter is a coverage-driven delivery marketplace. Download Porter, Porter Runner, Porter Vendor, or Porter Command. Ops work from Porter Command or this site.",
  openGraph: {
    title: "Porter",
    description: "Four apps. One marketplace. Porter · Porter Runner · Porter Vendor",
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
