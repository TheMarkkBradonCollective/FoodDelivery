import { AppShell } from "@/components/layout/AppShell";
import { CustomerLayoutClient } from "./CustomerLayoutClient";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="customer">
      <CustomerLayoutClient>{children}</CustomerLayoutClient>
    </AppShell>
  );
}
