"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@porter/shared/lib/api/client";

type Campaign = {
  id: string; name: string; description: string; city: string; service_area: string;
  starts_at: string; ends_at: string; enrollment_deadline: string; status: string;
  member_capacity: number; joined_members: number; member_slots_available: number;
  max_active_runrs: number; active_runrs_count: number; is_member: boolean; is_online: boolean;
  operating_schedule: { mode?: string; days?: Record<string, unknown> };
};

export default function RunnerCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    try { const data = await apiFetch<{campaigns: Campaign[]}>("/campaigns"); setCampaigns(data.campaigns); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load campaigns."); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  async function act(id: string, action: "join" | "online" | "offline") {
    setBusy(id);
    try { await apiFetch(`/campaigns/${id}/${action}`, { method: "POST", body: JSON.stringify({}) }); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Campaign action failed."); }
    finally { setBusy(null); }
  }
  return <main className="space-y-5 px-4 pb-10 pt-5">
    <header><p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Portr Runner</p><h1 className="text-2xl font-extrabold">Campaigns</h1><p className="mt-1 text-sm text-[var(--muted)]">Join campaigns ahead of launch, then choose whenever you want to work while they're live.</p></header>
    {error && <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}
    {campaigns.length === 0 && <p className="rounded-2xl border border-[var(--border)] p-5 text-sm text-[var(--muted)]">No campaigns are available right now.</p>}
    <div className="grid gap-3">{campaigns.map(c => {
      const live = c.status === "live";
      const available = c.max_active_runrs - c.active_runrs_count;
      return <article key={c.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold">{c.name}</h2><p className="text-xs text-[var(--muted)]">{c.city}{c.service_area ? ` · ${c.service_area}` : ""}</p></div><span className="rounded-full bg-[var(--surface-elevated)] px-2.5 py-1 text-xs font-bold uppercase">{c.status}</span></div>
        {c.description && <p className="mt-3 text-sm">{c.description}</p>}
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-xs text-[var(--muted)]">Starts</p><strong>{new Date(c.starts_at).toLocaleString()}</strong></div>
          <div><p className="text-xs text-[var(--muted)]">Ends</p><strong>{new Date(c.ends_at).toLocaleString()}</strong></div>
          <div><p className="text-xs text-[var(--muted)]">Enrollment closes</p><strong>{new Date(c.enrollment_deadline).toLocaleString()}</strong></div>
          <div><p className="text-xs text-[var(--muted)]">Membership</p><strong>{c.joined_members}/{c.member_capacity} joined</strong></div>
          <div><p className="text-xs text-[var(--muted)]">Working now</p><strong>{c.active_runrs_count}/{c.max_active_runrs}</strong></div>
          <div><p className="text-xs text-[var(--muted)]">Open live capacity</p><strong>{Math.max(0,available)} positions</strong></div>
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">Operating schedule: {c.operating_schedule?.mode === "always" ? "24/7" : "Campaign-specific daily hours"}. Membership does not reserve an active working position. You can join multiple campaigns.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {!c.is_member && <button disabled={busy===c.id || live || c.member_slots_available<=0} onClick={()=>void act(c.id,"join")} className="rounded-full bg-violet-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40">{busy===c.id?"Please wait":"Join campaign"}</button>}
          {c.is_member && live && !c.is_online && <button disabled={busy===c.id || available<=0} onClick={()=>void act(c.id,"online")} className="rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40">{available<=0?"At capacity":"Go online"}</button>}
          {c.is_online && <button disabled={busy===c.id} onClick={()=>void act(c.id,"offline")} className="rounded-full border border-[var(--border)] px-4 py-2.5 text-sm font-bold">Go offline</button>}
          {c.is_member && <span className="self-center text-xs font-semibold text-emerald-600">You're a member</span>}
        </div>
      </article>;
    })}</div>
  </main>;
}
