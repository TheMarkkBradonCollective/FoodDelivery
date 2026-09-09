"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useAppStore } from "../../store/create-app-store";

export function ToastHost() {
  const toast = useAppStore((s) => s.toast);
  const clearToast = useAppStore((s) => s.clearToast);

  if (!toast) return null;

  const error = toast.tone === "err";

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[90] flex justify-center px-4"
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
    >
      <div
        role="status"
        className="pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-cream shadow-xl"
      >
        {error ? (
          <AlertCircle size={18} className="shrink-0 text-red-300" />
        ) : (
          <CheckCircle2 size={18} className="shrink-0 text-lime" />
        )}
        <span className="flex-1">{toast.message}</span>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={clearToast}
          className="tap-target -mr-1 rounded-full p-1 text-cream/70"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
