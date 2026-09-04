import { cn } from "../../lib/utils";

interface StatusBadgeProps {
  label: string;
  variant?: "success" | "warning" | "critical" | "neutral" | "primary";
  className?: string;
}

const variants = {
  success: "bg-runr-success-muted text-runr-success",
  warning: "bg-runr-warning-muted text-runr-warning",
  critical: "bg-runr-critical-muted text-runr-critical",
  neutral: "bg-runr-neutral-100 text-runr-neutral-600 dark:bg-runr-neutral-800 dark:text-runr-neutral-300",
  primary: "bg-runr-primary-muted text-runr-primary",
};

export function StatusBadge({
  label,
  variant = "neutral",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        variants[variant],
        className
      )}
    >
      {label}
    </span>
  );
}
