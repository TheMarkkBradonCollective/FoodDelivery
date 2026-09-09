"use client";

import { clsx } from "clsx";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="overlay-safe fixed inset-0 z-[80] flex items-end justify-center bg-ink/45 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <button type="button" className="absolute inset-0" aria-label="Close" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl">
        <h2 id="confirm-title" className="font-display text-xl font-bold text-ink">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink/65">{description}</p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className={clsx(
              "tap-target h-12 rounded-full text-sm font-bold",
              destructive ? "bg-red-600 text-white" : "bg-purple text-white",
            )}
          >
            {confirmLabel}
          </button>
          <button type="button" onClick={onCancel} className="tap-target h-12 rounded-full bg-cream text-sm font-bold text-ink">
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
