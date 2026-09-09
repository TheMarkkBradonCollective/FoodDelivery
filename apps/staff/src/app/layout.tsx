import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "@/store";
import { AppShell } from "@runr/shared/components/layout/AppShell";
import { StaffLayoutClient } from "./StaffLayoutClient";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "STAFF — Platform Management",
  description: "RUNR platform staff console for founders and operations.",
  applicationName: "STAFF",
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
        <AppShell role="staff">
          <StaffLayoutClient>{children}</StaffLayoutClient>
        </AppShell>
      </body>
    </html>
  );
}
