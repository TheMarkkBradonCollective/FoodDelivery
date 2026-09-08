"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

export function NativeSafeArea({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    void import("@capacitor/status-bar").then(({ StatusBar, Style }) => {
      void StatusBar.setOverlaysWebView({ overlay: false });
      void StatusBar.setStyle({ style: Style.Light });
    });
  }, []);

  return <>{children}</>;
}
