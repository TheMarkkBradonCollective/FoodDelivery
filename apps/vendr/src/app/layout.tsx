import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "@/store";
import { AppShell } from "@runr/shared/components/layout/AppShell";
import { VendrLayoutClient } from "./VendrLayoutClient";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "VENDR — Sell. Manage. Grow.",
  description:
    "Run your business on the PORTER marketplace — orders, coverage, deliveries, and growth.",
  applicationName: "VENDR",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#6B3FA0",
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
