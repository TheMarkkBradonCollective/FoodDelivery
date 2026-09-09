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
  return (
    <div className={cn("brand-hero px-5 pb-6 pt-5", flush && "brand-hero--flush pb-10", className)}>
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-runr-accent-bright">
              {eyebrow}
            </p>
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
