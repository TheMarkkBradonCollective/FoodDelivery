import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/store";
import { AuthProvider } from "@/components/AuthProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RUNR Platform — Pick Your Place. Run Your Time.",
  description:
    "RUNR is a coverage-driven delivery marketplace. Download PORTER for customers, RUNR for delivery, and VENDR for businesses.",
  openGraph: {
    title: "RUNR Platform",
    description: "Three apps. One marketplace. PORTER · RUNR · VENDR",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
