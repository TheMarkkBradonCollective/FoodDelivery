import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "@/store";
import { AppShell } from "@porter/shared/components/layout/AppShell";
import { RunrLayoutClient } from "./RunrLayoutClient";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Porter Runner — Choose your window. Earn per drop.",
  description:
    "Choose your business, choose your time, deliver and earn on the Porter marketplace.",
  applicationName: "Porter Runner",
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
        <AppShell role="runr">
          <RunrLayoutClient>{children}</RunrLayoutClient>
        </AppShell>
      </body>
    </html>
  );
}
