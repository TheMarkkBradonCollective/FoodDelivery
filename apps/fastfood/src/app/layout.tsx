import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "@/store";
import { AppShell } from "@porter/shared/components/layout/AppShell";
import { FastFoodLayoutClient } from "./FastFoodLayoutClient";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "FastFood — Get what you need.",
  description:
    "Discover, order, track, and receive from nearby businesses on the Portr marketplace.",
  applicationName: "FastFood",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#E31837",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.variable} antialiased`}>
        <AppShell role="customer" customerSkin="fastfood">
          <FastFoodLayoutClient>{children}</FastFoodLayoutClient>
        </AppShell>
      </body>
    </html>
  );
}
