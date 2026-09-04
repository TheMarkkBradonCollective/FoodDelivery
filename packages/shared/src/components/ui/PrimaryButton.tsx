import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function PrimaryButton({
  className,
  children,
  loading,
  disabled,
  variant = "primary",
  size = "md",
  ...props
}: PrimaryButtonProps) {
  const variants = {
    primary:
      "bg-runr-primary text-white hover:bg-runr-primary-hover shadow-sm",
    secondary:
      "bg-[var(--surface-elevated)] text-[var(--foreground)] border border-[var(--border)] hover:bg-runr-neutral-100 dark:hover:bg-runr-neutral-800",
    ghost: "bg-transparent text-[var(--foreground)] hover:bg-runr-neutral-100 dark:hover:bg-runr-neutral-800",
    danger: "bg-runr-critical text-white hover:opacity-90",
  };

  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-sm font-semibold",
    lg: "h-12 px-6 text-base font-semibold",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-runr-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
