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
      "bg-porter-primary text-[var(--on-primary,#ffffff)] hover:bg-porter-primary-hover shadow-porter-card",
    secondary:
      "bg-[var(--surface-elevated)] text-[var(--foreground)] border border-[var(--border)] hover:bg-porter-neutral-100 dark:hover:bg-porter-neutral-800",
    ghost: "bg-transparent text-[var(--foreground)] hover:bg-porter-neutral-100 dark:hover:bg-porter-neutral-800",
    danger: "bg-porter-critical text-white hover:opacity-90",
  };

  const sizes = {
    sm: "h-10 px-4 text-sm",
    md: "h-12 px-5 text-sm font-semibold",
    lg: "h-14 px-7 text-base font-bold",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
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
