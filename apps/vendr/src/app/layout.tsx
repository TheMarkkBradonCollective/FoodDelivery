import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "@/store";
import { AppShell } from "@porter/shared/components/layout/AppShell";
import { VendrLayoutClient } from "./VendrLayoutClient";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Portr Vendor — Sell. Manage. Grow.",
  description:
    "Run your business on the Portr marketplace — orders, coverage, deliveries, and growth.",
  applicationName: "Portr Vendor",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#7048F8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.variable} antialiased`}>
        <AppShell role="business">
          <VendrLayoutClient>{children}</VendrLayoutClient>
        </AppShell>
      </body>
    </html>
  );
}
