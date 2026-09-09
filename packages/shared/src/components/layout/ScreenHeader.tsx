import { cn } from "../../lib/utils";
import type { ReactNode } from "react";

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  trailing,
  children,
  flush,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  children?: ReactNode;
  flush?: boolean;
  className?: string;
}) {
  if (flush) {
    return (
      <div className={cn("brand-hero brand-hero--flush px-5 pb-10 pt-5", className)}>
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-runr-accent-bright">{eyebrow}</p>
            )}
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-white/75">{subtitle}</p>}
          </div>
          {trailing}
        </div>
        {children && <div className="relative z-10 mt-4">{children}</div>}
      </div>
    );
  }

  return (
    <header className={cn("px-5 pb-4 pt-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-purple">{eyebrow}</p>
          )}
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-ink/55">{subtitle}</p>}
        </div>
        {trailing}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </header>
  );
}
