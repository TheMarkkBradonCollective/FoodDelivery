import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/store";
import { AppShell } from "@runr/shared/components/layout/AppShell";
import { VendrLayoutClient } from "./VendrLayoutClient";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
  themeColor: "#059669",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <AppShell role="business">
          <VendrLayoutClient>{children}</VendrLayoutClient>
        </AppShell>
      </body>
    </html>
  );
}
