import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "@/store";
import { AppShell } from "@porter/shared/components/layout/AppShell";
import { PortrLayoutClient } from "./PortrLayoutClient";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Portr — Get what you need.",
  description:
    "Discover, order, track, and receive from nearby businesses on the Portr marketplace.",
  applicationName: "Portr",
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
        <AppShell role="customer" customerSkin="porter">
          <PortrLayoutClient>{children}</PortrLayoutClient>
        </AppShell>
      </body>
    </html>
  );
}
