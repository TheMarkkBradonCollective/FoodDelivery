"use client";

import { Panel } from "@/components/StaffUi";

const apps = [
  { name: "PORTER", pkg: "com.runr.porter", status: "Live" },
  { name: "RUNR", pkg: "com.runr.runr", status: "Live" },
  { name: "VENDR", pkg: "com.runr.vendr", status: "Live" },
  { name: "STAFF", pkg: "com.runr.staff", status: "Live" },
];

export default function StaffAppsPage() {
  return (
    <div className="p-4 lg:p-8">
      <h1 className="text-2xl font-bold">Apps</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Mobile app management</p>
      <Panel title="Marketplace apps" className="mt-6">
        <div className="grid gap-4 md:grid-cols-2">
          {apps.map((app) => (
            <div
              key={app.name}
              className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{app.name}</h3>
                <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                  {app.status}
                </span>
              </div>
              <p className="mt-2 font-mono text-xs text-[var(--muted)]">{app.pkg}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
