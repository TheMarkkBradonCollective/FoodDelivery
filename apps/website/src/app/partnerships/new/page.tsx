"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@porter/shared/lib/api/client";

const weekdays = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"] as const;
type Day = { enabled: boolean; start: string; end: string };
const initialDays: Record<string,Day> = Object.fromEntries(weekdays.map(day=>[day,{enabled:day!=="sunday",start:"09:00",end:"17:00"}]));

export default function NewPartnershipCampaignPage() {
  const [form,setForm]=useState({company_business_id:"",name:"",description:"",campaign_type:"brand",city:"",service_area:"",starts_at:"",ends_at:"",enrollment_deadline:"",member_capacity:"50",minimum_members:"20",max_active_runrs:"12",funding_amount:"0",refundable_amount:"0",schedule_mode:"always",timezone:"America/Los_Angeles"});
  const [days,setDays]=useState<Record<string,Day>>(initialDays);
  const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
  function change(key:string,value:string){setForm(old=>({...old,[key]:value}));}
  function changeDay(day:string,patch:Partial<Day>){setDays(old=>({...old,[day]:{...old[day],...patch}}));}
  async function submit(e:React.FormEvent){
    e.preventDefault();setBusy(true);setMessage("");
    try {
      const schedule=form.schedule_mode==="always"
        ? {mode:"always",timezone:form.timezone,days:{}}
        : {mode:"custom",timezone:form.timezone,days:Object.fromEntries(weekdays.map(day=>[day,{enabled:days[day].enabled,intervals:days[day].enabled?[{start:days[day].start,end:days[day].end}]:[]}]))};
      const result=await apiFetch<{id:string}>("/campaigns",{method:"POST",body:JSON.stringify({...form,member_capacity:Number(form.member_capacity),minimum_members:Number(form.minimum_members),max_active_runrs:Number(form.max_active_runrs),funding_amount:Number(form.funding_amount),refundable_amount:Number(form.refundable_amount),operating_schedule:schedule,status:"draft"})});
      setMessage(`Campaign proposal created (${result.id}). Portr will review it before launch.`);
    } catch(err){setMessage(err instanceof Error?err.message:"Unable to submit campaign.");}
    finally{setBusy(false);}
  }
  const field=(key:keyof typeof form,label:string,type="text")=><label className="block text-sm font-semibold">{label}<input required={["company_business_id","name","city","starts_at","ends_at","enrollment_deadline"].includes(key)} type={type} value={form[key]} onChange={e=>change(key,e.target.value)} className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-3 text-sm font-normal text-[var(--foreground)]"/></label>;
  return <main className="mx-auto max-w-3xl px-6 py-12">
    <Link href="/partnerships" className="text-sm font-semibold text-[#7048F8]">← Business partnerships</Link>
    <h1 className="mt-4 text-3xl font-extrabold">Propose a campaign</h1>
    <p className="mt-2 text-sm text-[var(--muted)]">Submit a draft for Portr review. Creating a proposal does not publish it or charge funding.</p>
    <form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl border border-[var(--border)] bg-white p-5 md:p-7">
      <div className="grid gap-4 md:grid-cols-2">{field("company_business_id","Your Portr business ID")}{field("name","Campaign name")}</div>
      {field("description","Campaign description")}
      <div className="grid gap-4 md:grid-cols-2">{field("city","City")}{field("service_area","Service area")}</div>
      <label className="block text-sm font-semibold">Campaign type<select value={form.campaign_type} onChange={e=>change("campaign_type",e.target.value)} className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-3 text-sm font-normal"><option value="brand">Brand campaign</option><option value="corporate">Corporate program</option><option value="market_expansion">Market expansion</option></select></label>
      <div className="grid gap-4 md:grid-cols-3">{field("starts_at","Start date and time","datetime-local")}{field("ends_at","End date and time","datetime-local")}{field("enrollment_deadline","Enrollment deadline","datetime-local")}</div>
      <h2 className="font-bold">Runner enrollment and live capacity</h2>
      <p className="text-xs text-[var(--muted)]">Membership and active capacity are separate. A Runner may join multiple campaigns; only going online occupies a live slot. There are no preassigned shifts.</p>
      <div className="grid gap-4 md:grid-cols-3">{field("member_capacity","Maximum campaign members","number")}{field("minimum_members","Minimum members to launch","number")}{field("max_active_runrs","Maximum active Runners at once","number")}</div>
      <h2 className="font-bold">Operating schedule</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-semibold">Schedule type<select value={form.schedule_mode} onChange={e=>change("schedule_mode",e.target.value)} className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-3 text-sm font-normal"><option value="always">24/7 while campaign is active</option><option value="daily">Set hours by day</option></select></label>
        {field("timezone","Campaign timezone")}
      </div>
      {form.schedule_mode==="daily"&&<div className="space-y-2 rounded-xl border border-[var(--border)] p-3">
        <p className="text-xs text-[var(--muted)]">Choose the days and local operating hours. Overnight windows are supported (for example, 8:00 PM–2:00 AM).</p>
        {weekdays.map(day=><div key={day} className="grid grid-cols-[minmax(100px,1fr)_1fr_1fr] items-center gap-2 border-b border-[var(--border)] py-2 last:border-0">
          <label className="flex items-center gap-2 text-sm font-semibold capitalize"><input type="checkbox" checked={days[day].enabled} onChange={e=>changeDay(day,{enabled:e.target.checked})}/>{day}</label>
          <input aria-label={day+" opening time"} type="time" disabled={!days[day].enabled} value={days[day].start} onChange={e=>changeDay(day,{start:e.target.value})} className="min-w-0 rounded-lg border border-[var(--border)] px-2 py-2 text-sm disabled:opacity-40"/>
          <input aria-label={day+" closing time"} type="time" disabled={!days[day].enabled} value={days[day].end} onChange={e=>changeDay(day,{end:e.target.value})} className="min-w-0 rounded-lg border border-[var(--border)] px-2 py-2 text-sm disabled:opacity-40"/>
        </div>)}
      </div>}
      <h2 className="font-bold">Proposed funding</h2>
      <div className="grid gap-4 md:grid-cols-2">{field("funding_amount","Campaign funding amount (USD)","number")}{field("refundable_amount","Refundable amount (USD)","number")}</div>
      <p className="text-xs text-[var(--muted)]">Funding figures are proposal details only. Payment collection and holding are not activated by this proposal. Refund processing requires a real Stripe PaymentIntent reference and configured Stripe credentials.</p>
      <button disabled={busy} className="w-full rounded-full bg-[#7048F8] px-6 py-3.5 text-sm font-bold text-white disabled:opacity-50">{busy?"Submitting…":"Submit campaign proposal"}</button>
      {message&&<p role="status" className="rounded-xl bg-[var(--surface)] p-3 text-sm">{message}</p>}
    </form>
  </main>;
}
