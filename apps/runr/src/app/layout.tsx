import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/store";
import { AppShell } from "@runr/shared/components/layout/AppShell";
import { RunrLayoutClient } from "./RunrLayoutClient";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "RUNR — Pick it up. Run it there.",
  description:
    "Choose your business, choose your time, deliver and earn on the RUNR marketplace.",
  applicationName: "RUNR",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ff4f00",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <AppShell role="runr">
          <RunrLayoutClient>{children}</RunrLayoutClient>
        </AppShell>
      </body>
    </html>
  );
}
