import { AppShell } from "@/components/layout/AppShell";
import { BusinessLayoutClient } from "./BusinessLayoutClient";

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="business">
      <BusinessLayoutClient>{children}</BusinessLayoutClient>
    </AppShell>
  );
}
