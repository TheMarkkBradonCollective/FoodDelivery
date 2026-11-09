"use client";

import { useCallback,useEffect,useState } from "react";
import { apiFetch } from "@porter/shared/lib/api/client";

type Campaign={id:string;name:string;description:string;city:string;service_area:string;status:string;starts_at:string;ends_at:string;operating_schedule:{mode?:string;timezone?:string;days?:Record<string,{enabled?:boolean;intervals?:Array<{start:string;end:string}>}>}};
export default function CampaignDiscoveryPage(){
 const [items,setItems]=useState<Campaign[]>([]);const [error,setError]=useState("");
 const refresh=useCallback(async()=>{try{const r=await apiFetch<{campaigns:Campaign[]}>("/campaigns");setItems(r.campaigns.filter(x=>["upcoming","recruiting","live"].includes(x.status)));setError("");}catch(e){setError(e instanceof Error?e.message:"Unable to load campaigns.");}},[]);
 useEffect(()=>{void refresh();},[refresh]);
 return <main className="space-y-5 px-5 pb-10 pt-5">
  <header><p className="text-xs font-bold uppercase tracking-widest text-purple">Portr community</p><h1 className="text-2xl font-extrabold">Brand campaigns</h1><p className="mt-1 text-sm text-[var(--muted)]">Discover brands and local campaigns happening across your area.</p></header>
  {error&&<p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}
  {items.length===0&&!error&&<p className="rounded-2xl border border-[var(--border)] p-5 text-sm text-[var(--muted)]">No public campaigns are listed right now. Check back for upcoming launches.</p>}
  <div className="space-y-3">{items.map(c=><article key={c.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
   <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-extrabold">{c.name}</h2><p className="text-xs text-[var(--muted)]">{c.city}{c.service_area?" · "+c.service_area:""}</p></div><span className="rounded-full bg-[var(--surface-elevated)] px-2.5 py-1 text-xs font-bold uppercase">{c.status}</span></div>
   {c.description&&<p className="mt-3 text-sm">{c.description}</p>}
   <div className="mt-3 grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-[var(--muted)]">Starts</p><b>{new Date(c.starts_at).toLocaleString()}</b></div><div><p className="text-xs text-[var(--muted)]">Ends</p><b>{new Date(c.ends_at).toLocaleString()}</b></div></div>
   <p className="mt-3 text-xs text-[var(--muted)]">Schedule: {c.operating_schedule?.mode==="always"?"24/7 while active":"Daily hours vary by campaign timezone ("+(c.operating_schedule?.timezone||"local")+")."}</p>
  </article>)}</div>
 </main>;
}
