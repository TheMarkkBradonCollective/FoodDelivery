import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "@/store";
import { AppShell } from "@runr/shared/components/layout/AppShell";
import { PorterLayoutClient } from "./PorterLayoutClient";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Porter — Get what you need.",
  description:
    "Discover, order, track, and receive from nearby businesses on the Porter marketplace.",
  applicationName: "Porter",
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
        <AppShell role="customer">
          <PorterLayoutClient>{children}</PorterLayoutClient>
        </AppShell>
      </body>
    </html>
  );
}
