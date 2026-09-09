export function Stat({
  label,
  value,
  alert,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-2.5 ${
        alert ? "border-orange-500/40 bg-orange-500/10" : "border-[var(--border)] bg-[var(--surface)]"
      }`}>
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="mt-0.5 text-lg font-extrabold text-white">{value}</p>
    </div>
  );
}

export function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5 ${className}`}>
      <h2 className="text-sm font-extrabold">{title}</h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}
