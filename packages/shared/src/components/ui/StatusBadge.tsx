import { cn } from "../../lib/utils";

interface StatusBadgeProps {
  label: string;
  variant?: "success" | "warning" | "critical" | "neutral" | "primary";
  className?: string;
}

const variants = {
  success: "bg-porter-success-muted text-porter-success",
  warning: "bg-porter-warning-muted text-porter-warning",
  critical: "bg-porter-critical-muted text-porter-critical",
  neutral: "bg-porter-neutral-100 text-porter-neutral-600 dark:bg-porter-neutral-800 dark:text-porter-neutral-300",
  primary: "bg-porter-primary-muted text-porter-primary",
};

export function StatusBadge({
  label,
  variant = "neutral",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        variants[variant],
        className
      )}
    >
      {label}
    </span>
  );
}
