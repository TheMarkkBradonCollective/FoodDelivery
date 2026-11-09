"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@porter/shared/lib/api/client";

type Campaign = {id:string;name:string;city:string;status:string;starts_at:string;ends_at:string;enrollment_deadline:string;member_capacity:number;minimum_members:number;joined_members:number;max_active_runrs:number;active_runrs_count:number;funding_amount:string;refundable_amount:string;refund_status:string;combined_funding:string;runner_compensation_budget:string;platform_fee_budget:string;available_balance:string;refund_liability:string;runner_payout_total:string;platform_fee_total:string;tip_pass_through_total:string;refund_total:string;runner_base_pay:string;runner_per_mile_pay:string;runner_minimum_pay:string;runner_maximum_pay:string};
export default function CampaignCommandPage() {
  const [items,setItems]=useState<Campaign[]>([]); const [error,setError]=useState(""); const [busy,setBusy]=useState<string|null>(null);
  const [policies,setPolicies]=useState<Record<string,{base:string;perMile:string;minimum:string;maximum:string}>>({});
  const [allocations,setAllocations]=useState<Record<string,{runner:string;platform:string}>>({});
  const [ledger,setLedger]=useState<Record<string,{deliveries:Array<{delivery_id:string;runner_name:string|null;distance_miles:string|number;base_pay:string|number;mileage_pay:string|number;tip_amount:string|number;runner_total:string|number;status:string;delivery_status:string|null;created_at:string}>;entries:Array<{entry_type:string;amount:string|number;runner_name:string|null;created_at:string;delivery_id:string|null}>}>>({});
  const [ledgerOpen,setLedgerOpen]=useState<string|null>(null);
  const refresh=useCallback(async()=>{try{const r=await apiFetch<{campaigns:Campaign[]}>("/campaigns/management");setItems(r.campaigns);
      setPolicies(current=>{const next={...current};for(const c of r.campaigns)next[c.id]??={base:String(c.runner_base_pay??3),perMile:String(c.runner_per_mile_pay??1.5),minimum:String(c.runner_minimum_pay??3),maximum:String(c.runner_maximum_pay??7.5)};return next;});
      setAllocations(current=>{const next={...current};for(const c of r.campaigns)next[c.id]??={runner:String(c.runner_compensation_budget??0),platform:String(c.platform_fee_budget??0)};return next;});
      setError("");}catch(e){setError(e instanceof Error?e.message:"Unable to load campaigns.");}},[]);
  useEffect(()=>{void refresh();},[refresh]);
  async function voidCampaign(id:string){setBusy(id);try{await apiFetch(`/campaigns/${id}/void`,{method:"POST",body:JSON.stringify({})});await refresh();}catch(e){setError(e instanceof Error?e.message:"Unable to void campaign.");}finally{setBusy(null);}}
  async function openEnrollment(id:string){setBusy(id);try{await apiFetch(`/campaigns/${id}/open-enrollment`,{method:"POST",body:JSON.stringify({})});await refresh();}catch(e){setError(e instanceof Error?e.message:"Unable to open enrollment.");}finally{setBusy(null);}}
  async function launchCampaign(id:string){setBusy(id);try{await apiFetch(`/campaigns/${id}/launch`,{method:"POST",body:JSON.stringify({})});await refresh();}catch(e){setError(e instanceof Error?e.message:"Unable to launch campaign.");}finally{setBusy(null);}}
  async function processRefund(id:string){setBusy(id);try{await apiFetch(`/campaigns/${id}/refund`,{method:"POST",body:JSON.stringify({})});await refresh();}catch(e){setError(e instanceof Error?e.message:"Unable to process Stripe refund.");}finally{setBusy(null);}}
  async function reconcileRefund(id:string){setBusy(id);try{await apiFetch(`/campaigns/${id}/refund/reconcile`,{method:"POST",body:JSON.stringify({})});await refresh();}catch(e){setError(e instanceof Error?e.message:"Unable to reconcile Stripe refund.");}finally{setBusy(null);}}
  async function savePolicy(id:string){const p=policies[id];if(!p)return;setBusy(id);try{await apiFetch(`/campaigns/${id}/pay-policy`,{method:"PUT",body:JSON.stringify({base_pay:Number(p.base),per_mile_pay:Number(p.perMile),minimum_pay:Number(p.minimum),maximum_pay:Number(p.maximum)})});await refresh();}catch(e){setError(e instanceof Error?e.message:"Unable to save Runner pay policy.");}finally{setBusy(null);}}
  async function saveAllocations(id:string){const a=allocations[id];if(!a)return;setBusy(id);try{await apiFetch(`/campaigns/${id}/allocations`,{method:"PUT",body:JSON.stringify({runner_compensation_budget:Number(a.runner),platform_fee_budget:Number(a.platform)})});await refresh();}catch(e){setError(e instanceof Error?e.message:"Unable to save campaign allocations.");}finally{setBusy(null);}}
  async function toggleLedger(id:string){if(ledgerOpen===id){setLedgerOpen(null);return;}setLedgerOpen(id);if(ledger[id])return;setBusy(id);try{const data=await apiFetch<{deliveries:typeof ledger[string]["deliveries"];entries:typeof ledger[string]["entries"]}>(`/campaigns/${id}/ledger`);setLedger(v=>({...v,[id]:data}));}catch(e){setError(e instanceof Error?e.message:"Unable to load campaign payout ledger.");}finally{setBusy(null);}}
  return <main className="space-y-5 px-4 pb-10 pt-5 lg:p-8">
    <header><p className="text-xs font-bold uppercase tracking-widest text-porter-accent-bright">Portr Command</p><h1 className="text-2xl font-extrabold">Campaign control</h1><p className="mt-1 text-sm text-[var(--muted)]">Partnership campaigns, Runner enrollment, live capacity and funding status.</p></header>
    {error&&<p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[["Campaigns",items.length],["Live",items.filter(x=>x.status==="live").length],["Recruiting",items.filter(x=>["recruiting","upcoming"].includes(x.status)).length],["Void",items.filter(x=>x.status==="void").length]].map(([label,value])=><div key={String(label)} className="rounded-2xl border border-[var(--border)] p-4"><p className="text-xs text-[var(--muted)]">{label}</p><p className="text-2xl font-extrabold">{value}</p></div>)}
    </div>
    <div className="space-y-3">{items.map(c=><article key={c.id} className="rounded-2xl border border-[var(--border)] p-4">
      <div className="flex justify-between gap-3"><div><h2 className="font-bold">{c.name}</h2><p className="text-xs text-[var(--muted)]">{c.city} · {c.status.toUpperCase()}</p></div><span className="text-xs text-[var(--muted)]">{c.refund_status}</span></div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm"><p>Membership: <b>{c.joined_members}/{c.member_capacity}</b></p><p>Minimum: <b>{c.minimum_members}</b></p><p>Working now: <b>{c.active_runrs_count}/{c.max_active_runrs}</b></p><p>Combined funding: <b>${Number(c.combined_funding).toFixed(2)}</b></p><p>Available: <b>${Number(c.available_balance).toFixed(2)}</b></p><p>Runner budget: <b>${Number(c.runner_compensation_budget).toFixed(2)}</b></p><p>Platform budget: <b>${Number(c.platform_fee_budget).toFixed(2)}</b></p><p>Runner payouts: <b>${Number(c.runner_payout_total).toFixed(2)}</b></p><p>Tips passed through: <b>${Number(c.tip_pass_through_total).toFixed(2)}</b></p><p>Refund liability: <b>${Number(c.refund_liability).toFixed(2)}</b></p><p>Start: <b>{new Date(c.starts_at).toLocaleString()}</b></p><p>End: <b>{new Date(c.ends_at).toLocaleString()}</b></p></div>
      <div className="mt-4 grid gap-4 border-t border-[var(--border)] pt-4 lg:grid-cols-2">
        <form onSubmit={e=>{e.preventDefault();void savePolicy(c.id);}} className="space-y-2">
          <h3 className="text-sm font-bold">Runner mileage pay policy</h3>
          <div className="grid grid-cols-2 gap-2">
            {([["base","Base pay"],["perMile","Pay per mile"],["minimum","Minimum payout"],["maximum","Maximum payout"]] as const).map(([key,label])=><label key={key} className="text-xs text-[var(--muted)]">{label}<input type="number" min="0" step="0.01" value={policies[c.id]?.[key]??""} onChange={e=>setPolicies(v=>({...v,[c.id]:{base:v[c.id]?.base??String(c.runner_base_pay??3),perMile:v[c.id]?.perMile??String(c.runner_per_mile_pay??1.5),minimum:v[c.id]?.minimum??String(c.runner_minimum_pay??3),maximum:v[c.id]?.maximum??String(c.runner_maximum_pay??7.5),[key]:e.target.value}}))} className="mt-1 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm" /></label>)}
          </div>
          <button disabled={busy===c.id} className="rounded-full border border-[var(--border)] px-3 py-2 text-xs font-bold disabled:opacity-50">{busy===c.id?"Saving…":"Save pay policy"}</button>
        </form>
        <form onSubmit={e=>{e.preventDefault();void saveAllocations(c.id);}} className="space-y-2">
          <h3 className="text-sm font-bold">Combined funding allocation</h3>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-[var(--muted)]">Runner compensation budget<input type="number" min="0" step="0.01" value={allocations[c.id]?.runner??""} onChange={e=>setAllocations(v=>({...v,[c.id]:{runner:e.target.value,platform:v[c.id]?.platform??String(c.platform_fee_budget??0)}}))} className="mt-1 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm" /></label>
            <label className="text-xs text-[var(--muted)]">Platform fee budget<input type="number" min="0" step="0.01" value={allocations[c.id]?.platform??""} onChange={e=>setAllocations(v=>({...v,[c.id]:{runner:v[c.id]?.runner??String(c.runner_compensation_budget??0),platform:e.target.value}}))} className="mt-1 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm" /></label>
          </div>
          <button disabled={busy===c.id} className="rounded-full border border-[var(--border)] px-3 py-2 text-xs font-bold disabled:opacity-50">{busy===c.id?"Saving…":"Save funding allocations"}</button>
        </form>
      </div>
      <div className="mt-3 border-t border-[var(--border)] pt-3">
        <button type="button" disabled={busy===c.id} onClick={()=>void toggleLedger(c.id)} className="rounded-full border border-[var(--border)] px-3 py-2 text-xs font-bold disabled:opacity-50">{ledgerOpen===c.id?"Hide payout ledger":"View payout ledger"}</button>
        {ledgerOpen===c.id&&ledger[c.id]&&<div className="mt-3 space-y-3">
          <div><h3 className="text-sm font-bold">Delivery payout snapshots</h3>
            {ledger[c.id].deliveries.length===0?<p className="mt-1 text-xs text-[var(--muted)]">No campaign deliveries have been recorded yet.</p>:ledger[c.id].deliveries.map(item=><div key={item.delivery_id} className="mt-2 rounded-xl bg-[var(--surface)] p-3 text-xs">
              <div className="flex flex-wrap justify-between gap-2"><b>{item.runner_name??"Runner"}</b><span>{item.status.toUpperCase()} · delivery {item.delivery_status??"unknown"}</span></div>
              <p className="mt-1">{Number(item.distance_miles).toFixed(2)} mi · Base ${Number(item.base_pay).toFixed(2)} · Mileage ${Number(item.mileage_pay).toFixed(2)} · Tip ${Number(item.tip_amount).toFixed(2)}</p>
              <p className="mt-1 font-bold">Runner total: ${Number(item.runner_total).toFixed(2)}</p>
            </div>)}
          </div>
          <div><h3 className="text-sm font-bold">Financial entries</h3>
            {ledger[c.id].entries.length===0?<p className="mt-1 text-xs text-[var(--muted)]">No financial entries yet.</p>:ledger[c.id].entries.map((entry,index)=><div key={entry.delivery_id??entry.entry_type+index} className="flex justify-between gap-3 border-b border-[var(--border)] py-2 text-xs"><span>{entry.entry_type.replaceAll("_"," ")} · {entry.runner_name??"Campaign"}</span><b>${Number(entry.amount).toFixed(2)}</b></div>)}
          </div>
        </div>}
      </div>
      {c.status==="draft"&&new Date(c.enrollment_deadline)>new Date()&&<button disabled={busy===c.id} onClick={()=>void openEnrollment(c.id)} className="mt-4 mr-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busy===c.id?"Processing":"Open Runner enrollment"}</button>}
      {["draft","upcoming","recruiting"].includes(c.status)&&c.joined_members>=c.minimum_members&&new Date(c.enrollment_deadline)<=new Date()&&new Date(c.starts_at)<=new Date()&&<button disabled={busy===c.id} onClick={()=>void launchCampaign(c.id)} className="mt-4 mr-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busy===c.id?"Processing":"Launch campaign"}</button>}
      {["draft","upcoming","recruiting"].includes(c.status)&&c.joined_members<c.minimum_members&&new Date(c.enrollment_deadline)<=new Date()&&new Date(c.starts_at)<=new Date()&&<button disabled={busy===c.id} onClick={()=>void voidCampaign(c.id)} className="mt-4 rounded-full border border-red-500/40 px-4 py-2 text-sm font-bold text-red-500 disabled:opacity-50">{busy===c.id?"Processing":"Void under-enrolled campaign"}</button>}
      {c.status==="void"&&c.refund_status==="pending"&&<div className="mt-3 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-600"><p>Refund is pending. Stripe must be configured and the campaign must have a valid PaymentIntent reference.</p><button disabled={busy===c.id} onClick={()=>void processRefund(c.id)} className="mt-2 rounded-full border border-amber-600/40 px-3 py-2 font-bold disabled:opacity-50">{busy===c.id?"Processing":"Process Stripe refund"}</button></div>}
      {c.refund_status==="processing"&&<div className="mt-3 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-600"><p>Stripe refund is still processing.</p><button disabled={busy===c.id} onClick={()=>void reconcileRefund(c.id)} className="mt-2 rounded-full border border-amber-600/40 px-3 py-2 font-bold disabled:opacity-50">{busy===c.id?"Checking…":"Check Stripe refund status"}</button></div>}
    </article>)}</div>
  </main>;
}
