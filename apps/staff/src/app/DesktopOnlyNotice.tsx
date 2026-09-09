import { DesktopManageBanner } from "@/components/DesktopManageBanner";

export function DesktopOnlyNotice({ title }: { title: string }) {
  return (
    <div className="p-4 lg:p-8">
      <h1 className="text-2xl font-extrabold">{title}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        This work happens on the desktop Staff Portal, not in the phone app.
      </p>
      <div className="mt-5">
        <DesktopManageBanner />
      </div>
    </div>
  );
}
