import { cn } from "../../lib/utils";
import { APP_COPY, type AppId } from "../../lib/apps";

export function JobLoop({ app, className }: { app: AppId; className?: string }) {
  const copy = APP_COPY[app];
  return (
    <p className={cn("text-[11px] font-extrabold uppercase tracking-[0.14em] text-purple", className)}>
      {copy.flow.join(" → ")}
    </p>
  );
}

export function MarketplaceJob({ app, className }: { app: AppId; className?: string }) {
  return (
    <p className={cn("text-sm text-[var(--muted)]", className)}>{APP_COPY[app].job}</p>
  );
}
