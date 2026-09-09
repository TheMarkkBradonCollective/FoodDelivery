"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

export function NativeSafeArea({
  children,
  darkChrome,
}: {
  children: React.ReactNode;
  darkChrome?: boolean;
}) {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    void import("@capacitor/status-bar").then(({ StatusBar, Style }) => {
      void StatusBar.setOverlaysWebView({ overlay: false });
      void StatusBar.setStyle({ style: darkChrome ? Style.Light : Style.Dark });
    });
  }, [darkChrome]);

  return <>{children}</>;
}
