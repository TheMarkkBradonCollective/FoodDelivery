"use client";

import Link from "next/link";
import { clsx } from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  variant?: "light" | "dark" | "ghost";
  href?: string;
  children: ReactNode;
};

const variants = {
  light: "bg-[var(--surface-elevated)] text-[var(--foreground)] shadow-sm ring-1 ring-[var(--border)]",
  dark: "bg-ink text-cream shadow-md",
  ghost: "bg-[var(--background)]/80 text-[var(--foreground)] ring-1 ring-[var(--border)]",
};

export function IconButton({ label, variant = "light", className, children, href, ...props }: Props) {
  const classes = clsx(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95",
    variants[variant],
    className,
  );

  if (href) {
    return (
      <Link href={href} aria-label={label} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" aria-label={label} className={classes} {...props}>
      {children}
    </button>
  );
}
