import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "@/store";
import { AppShell } from "@porter/shared/components/layout/AppShell";
import { getCustomerSkin } from "@porter/shared/lib/customer-skin";
import { FastFoodLayoutClient } from "./FastFoodLayoutClient";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });
const skin = getCustomerSkin("fastfood");

export const metadata: Metadata = {
  title: `${skin.shortName} — ${skin.tagline}`,
  description:
    "Order burgers, pizza, tacos, and more with the FastFood app — same restaurants and delivery network as Porter, with its own look.",
  applicationName: skin.shortName,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: skin.themeColor,
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
