"use client";

import { useCallback,useEffect,useState } from "react";
import { apiFetch } from "@porter/shared/lib/api/client";

type Campaign={id:string;name:string;description:string;city:string;status:string;starts_at:string;ends_at:string;enrollment_deadline:string;member_capacity:number;joined_members:number;minimum_members:number;max_active_runrs:number;active_runrs_count:number;funding_amount:string;refund_status:string};
export default function VendorCampaignsPage(){
 const [items,setItems]=useState<Campaign[]>([]);const [error,setError]=useState("");
 const refresh=useCallback(async()=>{try{const r=await apiFetch<{campaigns:Campaign[]}>("/campaigns");setItems(r.campaigns);setError("");}catch(e){setError(e instanceof Error?e.message:"Unable to load campaigns.");}},[]);
 useEffect(()=>{void refresh();},[refresh]);
 return <main className="space-y-5 px-5 pb-10 pt-5">
  <header><p className="text-xs font-bold uppercase tracking-widest text-purple">Portr Vendor</p><h1 className="text-2xl font-extrabold">Brand campaigns</h1><p className="mt-1 text-sm text-[var(--muted)]">View your campaign proposals, Runner enrollment and live coverage capacity.</p></header>
  <a href="https://portr.pages.dev/partnerships" className="inline-flex rounded-full bg-purple px-4 py-2.5 text-sm font-bold text-white">Propose a campaign</a>
  {error&&<p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}
  {items.length===0&&!error&&<p className="rounded-2xl border border-[var(--border)] p-5 text-sm text-[var(--muted)]">No campaigns are associated with this account yet.</p>}
  <div className="space-y-3">{items.map(c=><article key={c.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
   <div className="flex items-start justify-between gap-3"><div><h2 className="font-bold">{c.name}</h2><p className="text-xs text-[var(--muted)]">{c.city}</p></div><span className="rounded-full bg-[var(--surface-elevated)] px-2 py-1 text-xs font-bold uppercase">{c.status}</span></div>
   {c.description&&<p className="mt-2 text-sm">{c.description}</p>}
   <div className="mt-3 grid grid-cols-2 gap-2 text-sm"><p>Enrollment: <b>{c.joined_members}/{c.member_capacity}</b></p><p>Minimum: <b>{c.minimum_members}</b></p><p>Active Runners: <b>{c.active_runrs_count}/{c.max_active_runrs}</b></p><p>Funding proposal: <b>${Number(c.funding_amount).toFixed(2)}</b></p><p>Starts: <b>{new Date(c.starts_at).toLocaleString()}</b></p><p>Ends: <b>{new Date(c.ends_at).toLocaleString()}</b></p></div>
   <p className="mt-3 text-xs text-[var(--muted)]">Runner membership is separate from live working capacity. Funding figures remain proposals until payment collection is integrated.</p>
  </article>)}</div>
 </main>;
}
