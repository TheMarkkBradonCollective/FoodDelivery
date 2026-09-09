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
  light: "bg-white text-ink shadow-sm ring-1 ring-ink/10",
  dark: "bg-ink text-cream shadow-md",
  ghost: "bg-cream/80 text-ink ring-1 ring-ink/10",
};

export function IconButton({ label, variant = "light", className, children, href, ...props }: Props) {
  const classes = clsx(
    "tap-target inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95",
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
