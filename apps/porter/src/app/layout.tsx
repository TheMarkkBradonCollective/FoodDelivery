import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/store";
import { AppShell } from "@runr/shared/components/layout/AppShell";
import { PorterLayoutClient } from "./PorterLayoutClient";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "PORTER — Get what you need.",
  description:
    "Discover, order, track, and receive from nearby businesses on the RUNR marketplace.",
  applicationName: "PORTER",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FFFFFF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <AppShell role="customer">
          <PorterLayoutClient>{children}</PorterLayoutClient>
        </AppShell>
      </body>
    </html>
  );
}
