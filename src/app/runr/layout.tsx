import { AppShell } from "@/components/layout/AppShell";
import { RunrLayoutClient } from "./RunrLayoutClient";

export default function RunrLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="runr">
      <RunrLayoutClient>{children}</RunrLayoutClient>
    </AppShell>
  );
}
