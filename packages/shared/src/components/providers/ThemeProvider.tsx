"use client";

import { useEffect } from "react";
import { useAppStore } from "../../store/create-app-store";

export function ThemeProvider({
  children,
  forceDark = false,
}: {
  children: React.ReactNode;
  forceDark?: boolean;
}) {
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    const dark = forceDark || theme === "dark";
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }, [theme, forceDark]);

  return <>{children}</>;
}
