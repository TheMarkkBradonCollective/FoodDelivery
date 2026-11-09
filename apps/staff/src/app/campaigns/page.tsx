"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@porter/shared/lib/api/client";

type Campaign = {id:string;name:string;city:string;status:string;starts_at:string;ends_at:string;enrollment_deadline:string;member_capacity:number;minimum_members:number;joined_members:number;max_active_runrs:number;active_runrs_count:number;funding_amount:string;refundable_amount:string;refund_status:string};
export default function CampaignCommandPage() {
  const [items,setItems]=useState<Campaign[]>([]); const [error,setError]=useState(""); const [busy,setBusy]=useState<string|null>(null);
  const refresh=useCallback(async()=>{try{const r=await apiFetch<{campaigns:Campaign[]}>("/campaigns");setItems(r.campaigns);setError("");}catch(e){setError(e instanceof Error?e.message:"Unable to load campaigns.");}},[]);
  useEffect(()=>{void refresh();},[refresh]);
  async function voidCampaign(id:string){setBusy(id);try{await apiFetch(`/campaigns/${id}/void`,{method:"POST",body:JSON.stringify({})});await refresh();}catch(e){setError(e instanceof Error?e.message:"Unable to void campaign.");}finally{setBusy(null);}}
  async function launchCampaign(id:string){setBusy(id);try{await apiFetch(`/campaigns/${id}/launch`,{method:"POST",body:JSON.stringify({})});await refresh();}catch(e){setError(e instanceof Error?e.message:"Unable to launch campaign.");}finally{setBusy(null);}}
  async function processRefund(id:string){setBusy(id);try{await apiFetch(`/campaigns/${id}/refund`,{method:"POST",body:JSON.stringify({})});await refresh();}catch(e){setError(e instanceof Error?e.message:"Unable to process Stripe refund.");}finally{setBusy(null);}}
  return <main className="space-y-5 px-4 pb-10 pt-5 lg:p-8">
    <header><p className="text-xs font-bold uppercase tracking-widest text-porter-accent-bright">Portr Command</p><h1 className="text-2xl font-extrabold">Campaign control</h1><p className="mt-1 text-sm text-[var(--muted)]">Partnership campaigns, Runner enrollment, live capacity and funding status.</p></header>
    {error&&<p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[["Campaigns",items.length],["Live",items.filter(x=>x.status==="live").length],["Recruiting",items.filter(x=>["recruiting","upcoming"].includes(x.status)).length],["Void",items.filter(x=>x.status==="void").length]].map(([label,value])=><div key={String(label)} className="rounded-2xl border border-[var(--border)] p-4"><p className="text-xs text-[var(--muted)]">{label}</p><p className="text-2xl font-extrabold">{value}</p></div>)}
    </div>
    <div className="space-y-3">{items.map(c=><article key={c.id} className="rounded-2xl border border-[var(--border)] p-4">
      <div className="flex justify-between gap-3"><div><h2 className="font-bold">{c.name}</h2><p className="text-xs text-[var(--muted)]">{c.city} · {c.status.toUpperCase()}</p></div><span className="text-xs text-[var(--muted)]">{c.refund_status}</span></div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm"><p>Membership: <b>{c.joined_members}/{c.member_capacity}</b></p><p>Minimum: <b>{c.minimum_members}</b></p><p>Working now: <b>{c.active_runrs_count}/{c.max_active_runrs}</b></p><p>Funding: <b>${Number(c.funding_amount).toFixed(2)}</b></p><p>Start: <b>{new Date(c.starts_at).toLocaleString()}</b></p><p>End: <b>{new Date(c.ends_at).toLocaleString()}</b></p></div>
      {["draft","upcoming","recruiting"].includes(c.status)&&c.joined_members>=c.minimum_members&&new Date(c.enrollment_deadline)<=new Date()&&new Date(c.starts_at)<=new Date()&&<button disabled={busy===c.id} onClick={()=>void launchCampaign(c.id)} className="mt-4 mr-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busy===c.id?"Processing":"Launch campaign"}</button>}
      {["draft","upcoming","recruiting"].includes(c.status)&&c.joined_members<c.minimum_members&&<button disabled={busy===c.id} onClick={()=>void voidCampaign(c.id)} className="mt-4 rounded-full border border-red-500/40 px-4 py-2 text-sm font-bold text-red-500 disabled:opacity-50">{busy===c.id?"Processing":"Void under-enrolled campaign"}</button>}
      {c.status==="void"&&c.refund_status==="pending"&&<div className="mt-3 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-600"><p>Refund is pending. Stripe must be configured and the campaign must have a valid PaymentIntent reference.</p><button disabled={busy===c.id} onClick={()=>void processRefund(c.id)} className="mt-2 rounded-full border border-amber-600/40 px-3 py-2 font-bold disabled:opacity-50">{busy===c.id?"Processing":"Process Stripe refund"}</button></div>}
      {c.refund_status==="processing"&&<p className="mt-3 text-xs text-amber-600">Stripe refund is processing; verify provider status before reconciliation.</p>}
    </article>)}</div>
  </main>;
}
